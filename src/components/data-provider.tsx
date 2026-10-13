import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppDB,
  CleanupEvent,
  DbKey,
  EventSignup,
  GalleryPhoto,
  NewEventInput,
  NewNewsInput,
  NewPhotoInput,
  NewReportInput,
  NewSignupInput,
  NewTrailEntry,
  NewsItem,
  Report,
  TrailEntry,
} from "@/lib/types";
import { buildSeedDb } from "@/lib/seed";
import { isoNow } from "@/lib/format";

/*
 * Provedor de dados da versão SEM nuvem (custo zero).
 * O conteúdo do site é fixo (definido pela equipe em src/lib/seed.ts) e fica
 * igual para todos os visitantes. Interações (denúncia, inscrição, proposta)
 * ficam registradas apenas no navegador de quem envia — demonstrando o fluxo.
 */

const STORAGE_KEY = "nascfz-local-v3";

interface LocalState {
  db: AppDB;
  signups: EventSignup[];
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/*
 * Aceita dados salvos por versões anteriores (antes da trilha de
 * acompanhamento) e reconstrói a trilha mínima em vez de quebrar a página.
 */
function normalizarRelatorio(
  raw: Partial<Report> & { resolved?: boolean; resolutionNote?: string },
): Report {
  const criadoEm = raw.createdAt ?? new Date().toISOString();
  const trail: TrailEntry[] =
    Array.isArray(raw.trail) && raw.trail.length > 0
      ? raw.trail.filter((e) => e && e.stage && e.at)
      : [];
  if (trail.length === 0) {
    trail.push({ stage: "registrado", at: criadoEm });
    if (raw.status === "approved") {
      trail.push({
        stage: "publicado",
        at: criadoEm,
        note: "Verificado pela equipe e publicado no mapa.",
      });
    }
    if (raw.resolved) {
      const nota = raw.resolutionNote ?? raw.note ?? "";
      const porOrgao =
        /órgão|orgao|prefeitura|secretaria|fiscaliza|limpeza urbana|notificad/i.test(
          nota,
        );
      trail.push({
        stage: porOrgao ? "resolvido_orgao" : "resolvido_comunidade",
        at: criadoEm,
        note: nota || undefined,
      });
    }
  }
  const last = trail[trail.length - 1];
  return {
    ...(raw as Report),
    trail,
    stage: raw.stage ?? last.stage,
    stageAt: raw.stageAt ?? last.at,
    note: raw.note ?? raw.resolutionNote,
    createdAt: criadoEm,
  };
}

function loadState(): LocalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LocalState;
      if (
        parsed?.db &&
        Array.isArray(parsed.db.reports) &&
        Array.isArray(parsed.db.events) &&
        Array.isArray(parsed.db.news) &&
        Array.isArray(parsed.db.photos)
      ) {
        return {
          db: { ...parsed.db, reports: parsed.db.reports.map(normalizarRelatorio) },
          signups: Array.isArray(parsed.signups) ? parsed.signups : [],
        };
      }
    }
  } catch {
    // ignora e recria o conteúdo
  }
  return { db: buildSeedDb(), signups: [] };
}

export interface StoreActions {
  addReport: (input: NewReportInput) => string;
  updateReport: (id: string, patch: Partial<Report>) => void;
  /** Aprova o relato e registra a etapa "publicado" na trilha. */
  approveReport: (id: string) => void;
  /** Registra uma nova etapa da trilha e atualiza a etapa atual. */
  advanceReport: (id: string, entry: NewTrailEntry) => void;
  addEvent: (input: NewEventInput, publish: boolean) => string;
  updateEvent: (id: string, patch: Partial<CleanupEvent>) => void;
  addNews: (input: NewNewsInput, publish: boolean) => string;
  updateNews: (id: string, patch: Partial<NewsItem>) => void;
  addPhoto: (input: NewPhotoInput, publish: boolean) => string;
  updatePhoto: (id: string, patch: Partial<GalleryPhoto>) => void;
  addSignup: (
    input: NewSignupInput,
  ) => Promise<{ ok: boolean; message?: string }>;
  remove: (table: DbKey, id: string) => void;
}

interface StoreValue {
  db: AppDB;
  actions: StoreActions;
}

const StoreContext = createContext<StoreValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalState>(loadState);

  /*
   * Toda alteração passa por aqui: atualizamos a partir do estado anterior
   * (nunca de um valor em cache), gravamos no navegador e devolvemos o novo
   * estado. Assim, duas ações seguidas não apagam uma à outra.
   */
  const commit = useCallback((updater: (prev: LocalState) => LocalState) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // armazenamento cheio — ignora
      }
      return next;
    });
  }, []);

  const actions = useMemo<StoreActions>(() => {
    const patchReports = (
      prev: LocalState,
      id: string,
      fn: (r: Report) => Report,
    ): LocalState => ({
      ...prev,
      db: {
        ...prev.db,
        reports: prev.db.reports.map((r) => (r.id === id ? fn(r) : r)),
      },
    });

    return {
      addReport(input) {
        const id = uid("d");
        const at = isoNow();
        const report: Report = {
          id,
          ...input,
          status: "pending",
          stage: "registrado",
          stageAt: at,
          trail: [
            {
              stage: "registrado",
              at,
              note: "Relato recebido pelo formulário do site.",
            },
          ],
          createdAt: at,
        };
        commit((prev) => ({
          ...prev,
          db: { ...prev.db, reports: [report, ...prev.db.reports] },
        }));
        return id;
      },
      updateReport(id, patch) {
        commit((prev) => patchReports(prev, id, (r) => ({ ...r, ...patch })));
      },
      approveReport(id) {
        const at = isoNow();
        commit((prev) =>
          patchReports(prev, id, (r) => ({
            ...r,
            status: "approved",
            stage: "publicado",
            stageAt: at,
            trail: [
              ...r.trail,
              {
                stage: "publicado",
                at,
                note: "Verificado pela equipe e publicado no mapa.",
              },
            ],
          })),
        );
      },
      advanceReport(id, entry) {
        const at = isoNow();
        commit((prev) =>
          patchReports(prev, id, (r) => ({
            ...r,
            stage: entry.stage,
            stageAt: at,
            note: entry.note?.trim() || r.note,
            trail: [...r.trail, { ...entry, at }],
          })),
        );
      },
      addEvent(input, publish) {
        const id = uid("m");
        const event: CleanupEvent = {
          id,
          ...input,
          signupCount: 0,
          proposerContact: input.proposerContact || undefined,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        commit((prev) => ({
          ...prev,
          db: { ...prev.db, events: [event, ...prev.db.events] },
        }));
        return id;
      },
      updateEvent(id, patch) {
        commit((prev) => ({
          ...prev,
          db: {
            ...prev.db,
            events: prev.db.events.map((e) =>
              e.id === id ? { ...e, ...patch } : e,
            ),
          },
        }));
      },
      addNews(input, publish) {
        const id = uid("n");
        const news: NewsItem = {
          id,
          ...input,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        commit((prev) => ({
          ...prev,
          db: { ...prev.db, news: [news, ...prev.db.news] },
        }));
        return id;
      },
      updateNews(id, patch) {
        commit((prev) => ({
          ...prev,
          db: {
            ...prev.db,
            news: prev.db.news.map((n) =>
              n.id === id ? { ...n, ...patch } : n,
            ),
          },
        }));
      },
      addPhoto(input, publish) {
        const id = uid("f");
        const photo: GalleryPhoto = {
          id,
          ...input,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        commit((prev) => ({
          ...prev,
          db: { ...prev.db, photos: [photo, ...prev.db.photos] },
        }));
        return id;
      },
      updatePhoto(id, patch) {
        commit((prev) => ({
          ...prev,
          db: {
            ...prev.db,
            photos: prev.db.photos.map((p) =>
              p.id === id ? { ...p, ...patch } : p,
            ),
          },
        }));
      },
      async addSignup(input) {
        const email = input.email.trim().toLowerCase();
        const signup: EventSignup = {
          id: uid("i"),
          eventId: input.eventId,
          name: input.name,
          email,
          phone: input.phone,
          createdAt: isoNow(),
        };
        let duplicated = false;
        commit((prev) => {
          duplicated = prev.signups.some(
            (s) => s.eventId === input.eventId && s.email === email,
          );
          if (duplicated) return prev;
          return {
            ...prev,
            signups: [...prev.signups, signup],
            db: {
              ...prev.db,
              events: prev.db.events.map((e) =>
                e.id === input.eventId
                  ? { ...e, signupCount: (e.signupCount ?? 0) + 1 }
                  : e,
              ),
            },
          };
        });
        if (duplicated) {
          return {
            ok: false,
            message:
              "Este e-mail já está inscrito neste mutirão. Obrigado por participar!",
          };
        }
        return { ok: true };
      },
      remove(table, id) {
        commit((prev) => ({
          ...prev,
          db: {
            ...prev.db,
            [table]: prev.db[table].filter((row) => row.id !== id),
          } as AppDB,
        }));
      },
    };
  }, [commit]);

  const value = useMemo(() => ({ db: state.db, actions }), [state.db, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useData(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>");
  return ctx;
}
