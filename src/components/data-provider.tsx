import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  ReportStatus,
  EventStatus,
} from "@/lib/types";
import { isoNow } from "@/lib/format";

/*
 * Provedor de dados da versão na nuvem (Enter Cloud).
 * Visitantes leem apenas o conteúdo APROVADO (via views públicas, que não
 * expõem contatos). Moderadores logados leem as tabelas completas e podem
 * aprovar/rejeitar/excluir — as políticas RLS protegem cada linha.
 */

type RowR = {
  id: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  reference: string | null;
  lat: number | null;
  lng: number | null;
  photo_url?: string | null;
  contact?: string | null;
  status: string | null;
  resolved: boolean | null;
  resolution_note?: string | null;
  created_at: string | null;
};

type RowE = {
  id: string | null;
  title: string | null;
  description: string | null;
  location_name: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  volunteers_target: number | null;
  signup_count: number | null;
  proposer_name: string | null;
  proposer_contact?: string | null;
  status: string | null;
  created_at: string | null;
};

type RowN = {
  id: string | null;
  title: string | null;
  summary: string | null;
  body: string | null;
  cover_url?: string | null;
  author: string | null;
  status: string | null;
  created_at: string | null;
};

type RowP = {
  id: string | null;
  title: string | null;
  description?: string | null;
  image_url: string | null;
  author: string | null;
  status: string | null;
  created_at: string | null;
};

const EMPTY_DB: AppDB = { reports: [], events: [], news: [], photos: [] };

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2, 10)}`;
}

function mapReport(r: RowR): Report {
  return {
    id: r.id ?? "",
    category: r.category ?? "",
    title: r.title ?? "",
    description: r.description ?? "",
    reference: r.reference ?? "",
    lat: r.lat ?? 0,
    lng: r.lng ?? 0,
    photoUrl: r.photo_url ?? undefined,
    contact: r.contact ?? undefined,
    status: (r.status ?? "pending") as ReportStatus,
    resolved: r.resolved ?? false,
    resolutionNote: r.resolution_note ?? undefined,
    createdAt: r.created_at ?? isoNow(),
  };
}

function mapEvent(r: RowE): CleanupEvent {
  return {
    id: r.id ?? "",
    title: r.title ?? "",
    description: r.description ?? "",
    locationName: r.location_name ?? "",
    date: r.date ?? "",
    startTime: r.start_time ?? "",
    endTime: r.end_time ?? "",
    volunteersTarget: r.volunteers_target ?? undefined,
    signupCount: r.signup_count ?? 0,
    proposerName: r.proposer_name ?? "",
    proposerContact: r.proposer_contact ?? undefined,
    status: (r.status ?? "pending") as EventStatus,
    createdAt: r.created_at ?? isoNow(),
  };
}

function mapNews(r: RowN): NewsItem {
  return {
    id: r.id ?? "",
    title: r.title ?? "",
    summary: r.summary ?? "",
    body: r.body ?? "",
    coverUrl: r.cover_url ?? undefined,
    author: r.author ?? "",
    status: (r.status ?? "pending") as NewsItem["status"],
    createdAt: r.created_at ?? isoNow(),
  };
}

function mapPhoto(r: RowP): GalleryPhoto {
  return {
    id: r.id ?? "",
    title: r.title ?? "",
    description: r.description ?? undefined,
    imageUrl: r.image_url ?? "",
    author: r.author ?? "",
    status: (r.status ?? "pending") as GalleryPhoto["status"],
    createdAt: r.created_at ?? isoNow(),
  };
}

function nullish(v: string | undefined): string | null {
  return v && v.trim() ? v : null;
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
  const [db, setDb] = useState<AppDB>(EMPTY_DB);
  const [ready, setReady] = useState(false);
  const seqRef = useRef(0);

  const isAdmin = useCallback(async (): Promise<boolean> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return data?.role === "admin";
  }, []);

  const load = useCallback(async (scope: "admin" | "public") => {
    const seq = ++seqRef.current;
    const adminTables = scope === "admin";
    const [repRes, evRes, nwRes, phRes] = await Promise.all([
      supabase
        .from(adminTables ? "reports" : "approved_reports")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from(adminTables ? "cleanup_events" : "approved_cleanup_events")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from(adminTables ? "news" : "approved_news")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from(adminTables ? "gallery_photos" : "approved_gallery_photos")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    const reports = (repRes.data ?? []) as unknown as RowR[];
    const events = (evRes.data ?? []) as unknown as RowE[];
    const news = (nwRes.data ?? []) as unknown as RowN[];
    const photos = (phRes.data ?? []) as unknown as RowP[];

    if (seq !== seqRef.current) return;
    setDb({
      reports: reports.map(mapReport),
      events: events.map(mapEvent),
      news: news.map(mapNews),
      photos: photos.map(mapPhoto),
    });
    setReady(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const admin = await isAdmin();
      if (!mounted) return;
      await load(admin ? "admin" : "public");
    };
    void refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Chamadas do client dentro do callback precisam ser adiadas.
      setTimeout(() => {
        if (mounted) void refresh();
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isAdmin, load]);

  const actions = useMemo<StoreActions>(() => {
    const patchList = <T extends { id: string }>(list: T[], id: string, patch: Partial<T>) =>
      list.map((row) => (row.id === id ? { ...row, ...patch } : row));

    return {
      addReport(input) {
        const id = newId();
        const report: Report = {
          id,
          ...input,
          status: "pending",
          resolved: false,
          createdAt: isoNow(),
        };
        setDb((prev) => ({ ...prev, reports: [report, ...prev.reports] }));
        void supabase
          .from("reports")
          .insert({
            id,
            category: input.category,
            title: input.title,
            description: input.description,
            reference: input.reference,
            lat: input.lat,
            lng: input.lng,
            photo_url: nullish(input.photoUrl),
            contact: nullish(input.contact),
            status: "pending",
            resolved: false,
            created_at: report.createdAt,
          })
          .then(({ error }) => {
            if (error) console.error("addReport", error);
          });
        return id;
      },
      updateReport(id, patch) {
        setDb((prev) => ({
          ...prev,
          reports: patchList(prev.reports, id, patch),
        }));
        const upd: Record<string, unknown> = {};
        if (patch.status) upd.status = patch.status;
        if (typeof patch.resolved === "boolean") upd.resolved = patch.resolved;
        if (patch.resolutionNote !== undefined)
          upd.resolution_note = patch.resolutionNote || null;
        void supabase
          .from("reports")
          .update(upd)
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.error("updateReport", error);
          });
      },
      addEvent(input, publish) {
        const id = newId();
        const event: CleanupEvent = {
          id,
          ...input,
          signupCount: 0,
          proposerContact: input.proposerContact || undefined,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        setDb((prev) => ({ ...prev, events: [event, ...prev.events] }));
        void supabase
          .from("cleanup_events")
          .insert({
            id,
            title: input.title,
            description: input.description,
            location_name: input.locationName,
            date: input.date,
            start_time: input.startTime,
            end_time: input.endTime,
            volunteers_target: input.volunteersTarget ?? null,
            proposer_name: input.proposerName,
            proposer_contact: nullish(input.proposerContact),
            status: event.status,
            created_at: event.createdAt,
          })
          .then(({ error }) => {
            if (error) console.error("addEvent", error);
          });
        return id;
      },
      updateEvent(id, patch) {
        setDb((prev) => ({
          ...prev,
          events: patchList(prev.events, id, patch),
        }));
        const upd: Record<string, unknown> = {};
        if (patch.status) upd.status = patch.status;
        void supabase
          .from("cleanup_events")
          .update(upd)
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.error("updateEvent", error);
          });
      },
      addNews(input, publish) {
        const id = newId();
        const news: NewsItem = {
          id,
          ...input,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        setDb((prev) => ({ ...prev, news: [news, ...prev.news] }));
        void supabase
          .from("news")
          .insert({
            id,
            title: input.title,
            summary: input.summary,
            body: input.body,
            cover_url: nullish(input.coverUrl),
            author: input.author,
            status: news.status,
            created_at: news.createdAt,
          })
          .then(({ error }) => {
            if (error) console.error("addNews", error);
          });
        return id;
      },
      updateNews(id, patch) {
        setDb((prev) => ({
          ...prev,
          news: patchList(prev.news, id, patch),
        }));
        const upd: Record<string, unknown> = {};
        if (patch.status) upd.status = patch.status;
        void supabase
          .from("news")
          .update(upd)
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.error("updateNews", error);
          });
      },
      addPhoto(input, publish) {
        const id = newId();
        const photo: GalleryPhoto = {
          id,
          ...input,
          status: publish ? "approved" : "pending",
          createdAt: isoNow(),
        };
        setDb((prev) => ({ ...prev, photos: [photo, ...prev.photos] }));
        void supabase
          .from("gallery_photos")
          .insert({
            id,
            title: input.title,
            description: input.description ? input.description : null,
            image_url: input.imageUrl,
            author: input.author,
            status: photo.status,
            created_at: photo.createdAt,
          })
          .then(({ error }) => {
            if (error) console.error("addPhoto", error);
          });
        return id;
      },
      updatePhoto(id, patch) {
        setDb((prev) => ({
          ...prev,
          photos: patchList(prev.photos, id, patch),
        }));
        const upd: Record<string, unknown> = {};
        if (patch.status) upd.status = patch.status;
        void supabase
          .from("gallery_photos")
          .update(upd)
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.error("updatePhoto", error);
          });
      },
      async addSignup(input) {
        const { error } = await supabase.from("event_signups").insert({
          event_id: input.eventId,
          name: input.name,
          email: input.email.trim().toLowerCase(),
          phone: input.phone ? input.phone : null,
        });
        if (error) {
          if (error.code === "23505") {
            return {
              ok: false,
              message:
                "Este e-mail já está inscrito neste mutirão. Obrigado por participar!",
            };
          }
          return {
            ok: false,
            message: "Não foi possível inscrever agora. Tente novamente.",
          };
        }
        setDb((prev) => ({
          ...prev,
          events: prev.events.map((ev) =>
            ev.id === input.eventId
              ? { ...ev, signupCount: (ev.signupCount ?? 0) + 1 }
              : ev,
          ),
        }));
        return { ok: true };
      },
      remove(table, id) {
        setDb((prev) => ({
          ...prev,
          [table]: prev[table].filter((row) => row.id !== id),
        }) as unknown as AppDB);
        const tbl =
          table === "reports"
            ? "reports"
            : table === "events"
              ? "cleanup_events"
              : table === "news"
                ? "news"
                : "gallery_photos";
        void supabase.from(tbl).delete().eq("id", id).then(({ error }) => {
          if (error) console.error("remove", error);
        });
      },
    };
  }, []);

  const value = useMemo(() => ({ db, actions }), [db, actions]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-foam">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-lagoon" />
          <p className="text-sm">Carregando dados da comunidade…</p>
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useData(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>");
  return ctx;
}
