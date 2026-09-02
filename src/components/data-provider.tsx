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

const STORAGE_KEY = "nascfz-db-v1";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadDb(): AppDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppDB;
      if (
        parsed &&
        Array.isArray(parsed.reports) &&
        Array.isArray(parsed.events) &&
        Array.isArray(parsed.signups) &&
        Array.isArray(parsed.news) &&
        Array.isArray(parsed.photos)
      ) {
        return parsed;
      }
    }
  } catch {
    // ignora e recria a semente
  }
  return buildSeedDb();
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
  addSignup: (input: NewSignupInput) => { ok: boolean; message?: string };
  remove: (table: DbKey, id: string) => void;
  resetDemo: () => void;
}

interface StoreValue {
  db: AppDB;
  actions: StoreActions;
}

const StoreContext = createContext<StoreValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<AppDB>(loadDb);

  const commit = useCallback((next: AppDB) => {
    setDb(next);
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
        commit({ ...db, reports: [report, ...db.reports] });
        return id;
      },
      updateReport(id, patch) {
        commit({
          ...db,
          reports: db.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        });
      },
      addEvent(input, publish) {
        const id = uid("m");
        const event: CleanupEvent = {
          id,
          ...input,
          proposerContact: input.proposerContact || undefined,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        commit({ ...db, events: [event, ...db.events] });
        return id;
      },
      updateEvent(id, patch) {
        commit({
          ...db,
          events: db.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
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
        commit({ ...db, news: [news, ...db.news] });
        return id;
      },
      updateNews(id, patch) {
        commit({
          ...db,
          news: db.news.map((n) => (n.id === id ? { ...n, ...patch } : n)),
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
        commit({ ...db, photos: [photo, ...db.photos] });
        return id;
      },
      updatePhoto(id, patch) {
        commit({
          ...db,
          photos: db.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        });
      },
      addSignup(input) {
        const exists = db.signups.some(
          (s) =>
            s.eventId === input.eventId &&
            s.email.trim().toLowerCase() === input.email.trim().toLowerCase(),
        );
        if (exists) {
          return {
            ok: false,
            message:
              "Este e-mail já está inscrito neste mutirão. Obrigado por participar!",
          };
        }
        const signup = {
          id: uid("i"),
          ...input,
          createdAt: isoNow(),
        };
        commit({ ...db, signups: [...db.signups, signup] });
        return { ok: true };
      },
      remove(table, id) {
        commit({
          ...db,
          [table]: db[table].filter((row) => row.id !== id),
        } as unknown as AppDB);
      },
      resetDemo() {
        commit(buildSeedDb());
      },
    }),
    [db, commit],
  );

  const value = useMemo(() => ({ db, actions }), [db, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useData(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>");
  return ctx;
}
