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
  NewsItem,
  Report,
} from "@/lib/types";
import { buildSeedDb } from "@/lib/seed";
import { isoNow } from "@/lib/format";

/*
 * Provedor de dados da versão SEM nuvem (custo zero).
 * O conteúdo do site é fixo (definido pela equipe em src/lib/seed.ts) e fica
 * igual para todos os visitantes. Interações (denúncia, inscrição, proposta)
 * ficam registradas apenas no navegador de quem envia — demonstrando o fluxo.
 */

const STORAGE_KEY = "nascfz-local-v1";

interface LocalState {
  db: AppDB;
  signups: EventSignup[];
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
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
        return { db: parsed.db, signups: parsed.signups ?? [] };
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

  const commit = useCallback((next: LocalState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // armazenamento cheio — ignora
    }
  }, []);

  const actions = useMemo<StoreActions>(
    () => ({
      addReport(input) {
        const id = uid("d");
        const report: Report = {
          id,
          ...input,
          status: "pending",
          resolved: false,
          createdAt: isoNow(),
        };
        commit({
          ...state,
          db: { ...state.db, reports: [report, ...state.db.reports] },
        });
        return id;
      },
      updateReport(id, patch) {
        commit({
          ...state,
          db: {
            ...state.db,
            reports: state.db.reports.map((r) =>
              r.id === id ? { ...r, ...patch } : r,
            ),
          },
        });
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
        commit({
          ...state,
          db: { ...state.db, events: [event, ...state.db.events] },
        });
        return id;
      },
      updateEvent(id, patch) {
        commit({
          ...state,
          db: {
            ...state.db,
            events: state.db.events.map((e) =>
              e.id === id ? { ...e, ...patch } : e,
            ),
          },
        });
      },
      addNews(input, publish) {
        const id = uid("n");
        const news: NewsItem = {
          id,
          ...input,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        commit({
          ...state,
          db: { ...state.db, news: [news, ...state.db.news] },
        });
        return id;
      },
      updateNews(id, patch) {
        commit({
          ...state,
          db: {
            ...state.db,
            news: state.db.news.map((n) => (n.id === id ? { ...n, ...patch } : n)),
          },
        });
      },
      addPhoto(input, publish) {
        const id = uid("f");
        const photo: GalleryPhoto = {
          id,
          ...input,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        commit({
          ...state,
          db: { ...state.db, photos: [photo, ...state.db.photos] },
        });
        return id;
      },
      updatePhoto(id, patch) {
        commit({
          ...state,
          db: {
            ...state.db,
            photos: state.db.photos.map((p) =>
              p.id === id ? { ...p, ...patch } : p,
            ),
          },
        });
      },
      async addSignup(input) {
        const email = input.email.trim().toLowerCase();
        const exists = state.signups.some(
          (s) => s.eventId === input.eventId && s.email === email,
        );
        if (exists) {
          return {
            ok: false,
            message:
              "Este e-mail já está inscrito neste mutirão. Obrigado por participar!",
          };
        }
        const signup: EventSignup = {
          id: uid("i"),
          eventId: input.eventId,
          name: input.name,
          email,
          phone: input.phone,
          createdAt: isoNow(),
        };
        commit({
          ...state,
          signups: [...state.signups, signup],
          db: {
            ...state.db,
            events: state.db.events.map((e) =>
              e.id === input.eventId
                ? { ...e, signupCount: (e.signupCount ?? 0) + 1 }
                : e,
            ),
          },
        });
        return { ok: true };
      },
      remove(table, id) {
        commit({
          ...state,
          db: {
            ...state.db,
            [table]: state.db[table].filter((row) => row.id !== id),
          } as AppDB,
        });
      },
    }),
    [state, commit],
  );

  const value = useMemo(() => ({ db: state.db, actions }), [state.db, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useData(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>");
  return ctx;
}
