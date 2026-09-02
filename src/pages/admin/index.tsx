import { useState, type FormEvent, type ReactNode } from "react";
import {
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  Info,
  Lock,
  LogOut,
  MapPin,
  Megaphone,
  Recycle,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useData } from "@/components/data-provider";
import { getAdminSession, loginAdmin, logoutAdmin } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { getCategory } from "@/lib/categories";
import { fmtShort, isUpcoming, todayISO } from "@/lib/format";
import type { CleanupEvent, GalleryPhoto, NewsItem, Report } from "@/lib/types";
import { ReportStatusPill, EventStatusPill } from "@/components/status";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContentBundle = {
  reports: Report[];
  events: CleanupEvent[];
  news: NewsItem[];
  photos: GalleryPhoto[];
};

export default function Admin() {
  const [authed, setAuthed] = useState(getAdminSession());
  return (
    <div className="min-h-screen bg-foam">
      {authed ? (
        <Dashboard
          onLogout={() => {
            logoutAdmin();
            setAuthed(false);
          }}
        />
      ) : (
        <Login onLogin={() => setAuthed(true)} />
      )}
    </div>
  );
}

/* ---------- LOGIN (demonstração) ---------- */

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (loginAdmin(email, password)) {
      onLogin();
    } else {
      setError("E-mail ou senha incorretos para a demonstração.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white shadow-soft">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-primary">
            Área da equipe
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Moderação de conteúdo de {SITE.name}.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-border/70 bg-card p-6 shadow-card sm:p-8"
        >
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            E-mail
          </label>
          <input
            className="field mt-1.5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="equipe@nascfz.org.br"
          />
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Senha
          </label>
          <input
            className="field mt-1.5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="ocean" className="mt-5 w-full" size="lg">
            <Lock className="h-4 w-4" />
            Entrar
          </Button>
        </form>

        <div className="mt-5 rounded-2xl border border-dashed border-border bg-card/70 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-1.5 font-semibold text-primary">
            <Info className="h-4 w-4 text-lagoon" />
            Versão de demonstração
          </p>
          <p className="mt-1.5">
            O login é simulado neste protótipo. Acesse com <b>e-mail:</b>{" "}
            equipe@nascfz.org.br · <b>senha:</b> ilhadeus2026
          </p>
          <p className="mt-2">
            Na versão com banco de dados, o acesso usa autenticação real e o
            cadastro de moderadores exige código de convite.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- DASHBOARD ---------- */

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { db, actions } = useData();
  const [tab, setTab] = useState<"pendentes" | "publicados" | "criar">("pendentes");

  const pending: ContentBundle = {
    reports: db.reports.filter((r) => r.status === "pending"),
    events: db.events.filter((e) => e.status === "pending"),
    news: db.news.filter((n) => n.status === "pending"),
    photos: db.photos.filter((p) => p.status === "pending"),
  };
  const totalPending =
    pending.reports.length + pending.events.length + pending.news.length + pending.photos.length;

  const approved: ContentBundle = {
    reports: db.reports.filter((r) => r.status === "approved"),
    events: db.events.filter((e) => e.status === "approved"),
    news: db.news.filter((n) => n.status === "approved"),
    photos: db.photos.filter((p) => p.status === "approved"),
  };

  function resetDemo() {
    if (
      window.confirm(
        "Restaurar os dados de demonstração? Suas alterações locais serão perdidas.",
      )
    ) {
      actions.resetDemo();
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Moderação
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-primary">
            Painel da equipe
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalPending > 0
              ? `${totalPending} conteúdo(s) aguardando verificação.`
              : "Nenhum conteúdo aguardando verificação."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetDemo}>
            <RotateCcw className="h-4 w-4" />
            Restaurar demo
          </Button>
          <Button variant="destructive" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <TabBtn active={tab === "pendentes"} onClick={() => setTab("pendentes")}>
          <ClipboardCheck className="h-4 w-4" />
          Pendentes {totalPending > 0 && `(${totalPending})`}
        </TabBtn>
        <TabBtn active={tab === "publicados"} onClick={() => setTab("publicados")}>
          <CheckCircle2 className="h-4 w-4" />
          Publicados
        </TabBtn>
        <TabBtn active={tab === "criar"} onClick={() => setTab("criar")}>
          <FilePlus2 className="h-4 w-4" />
          Criar conteúdo
        </TabBtn>
      </div>

      {tab === "pendentes" && <Pendentes pending={pending} />}
      {tab === "publicados" && <Publicados approved={approved} />}
      {tab === "criar" && <Criar />}
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        active
          ? "bg-primary text-primary-foreground shadow-soft"
          : "bg-card text-muted-foreground ring-1 ring-border hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

/* ---------- PENDENTES ---------- */

function Pendentes({ pending }: { pending: ContentBundle }) {
  const { actions } = useData();

  return (
    <div className="mt-6 space-y-8">
      <QueueSection
        title="Denúncias pendentes"
        icon={<MapPin className="h-4 w-4" />}
        count={pending.reports.length}
      >
        {pending.reports.map((r) => {
          const cat = getCategory(r.category);
          return (
            <Row
              key={r.id}
              thumb={r.photoUrl}
              tag={{ text: cat.label, color: cat.color }}
              title={r.title}
              meta={`${r.reference} · ${r.lat.toFixed(5)}, ${r.lng.toFixed(5)} · ${fmtShort(r.createdAt)}`}
              body={r.description}
              extra={r.contact ? `Contato informado: ${r.contact}` : undefined}
              actions={
                <>
                  <Button
                    size="sm"
                    variant="leaf"
                    onClick={() => actions.updateReport(r.id, { status: "approved" })}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => actions.updateReport(r.id, { status: "rejected" })}
                  >
                    <X className="h-4 w-4" /> Recusar
                  </Button>
                </>
              }
            />
          );
        })}
      </QueueSection>

      <QueueSection
        title="Mutirões propostos"
        icon={<Recycle className="h-4 w-4" />}
        count={pending.events.length}
      >
        {pending.events.map((ev) => (
          <Row
            key={ev.id}
            title={ev.title}
            tag={{ text: "Mutirão", color: "#2e9e63" }}
            meta={`${fmtShort(`${ev.date}T12:00:00`)} · ${ev.startTime}–${ev.endTime} · ${ev.locationName} · proposto por ${ev.proposerName}`}
            body={ev.description}
            extra={ev.proposerContact ? `Contato: ${ev.proposerContact}` : undefined}
            actions={
              <>
                <Button
                  size="sm"
                  variant="leaf"
                  onClick={() => actions.updateEvent(ev.id, { status: "approved" })}
                >
                  <CheckCircle2 className="h-4 w-4" /> Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => actions.updateEvent(ev.id, { status: "cancelled" })}
                >
                  <X className="h-4 w-4" /> Recusar
                </Button>
              </>
            }
          />
        ))}
      </QueueSection>

      <QueueSection
        title="Notícias propostas"
        icon={<Megaphone className="h-4 w-4" />}
        count={pending.news.length}
      >
        {pending.news.map((n) => (
          <Row
            key={n.id}
            thumb={n.coverUrl}
            title={n.title}
            tag={{ text: "Notícia", color: "#2f7fc0" }}
            meta={`por ${n.author} · ${fmtShort(n.createdAt)}`}
            body={n.summary}
            actions={
              <>
                <Button
                  size="sm"
                  variant="leaf"
                  onClick={() => actions.updateNews(n.id, { status: "approved" })}
                >
                  <CheckCircle2 className="h-4 w-4" /> Publicar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => actions.remove("news", n.id)}
                >
                  <Trash2 className="h-4 w-4" /> Descartar
                </Button>
              </>
            }
          />
        ))}
      </QueueSection>

      <QueueSection
        title="Fotos propostas"
        icon={<Camera className="h-4 w-4" />}
        count={pending.photos.length}
      >
        {pending.photos.map((p) => (
          <Row
            key={p.id}
            thumb={p.imageUrl}
            title={p.title}
            tag={{ text: "Foto", color: "#e08a2e" }}
            meta={`por ${p.author} · ${fmtShort(p.createdAt)}`}
            body={p.description}
            actions={
              <>
                <Button
                  size="sm"
                  variant="leaf"
                  onClick={() => actions.updatePhoto(p.id, { status: "approved" })}
                >
                  <CheckCircle2 className="h-4 w-4" /> Publicar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => actions.remove("photos", p.id)}
                >
                  <Trash2 className="h-4 w-4" /> Descartar
                </Button>
              </>
            }
          />
        ))}
      </QueueSection>
    </div>
  );
}

function QueueSection({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: ReactNode;
  count: number;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
        {icon}
        {title}
        <span className="rounded-full bg-card px-2 py-0.5 text-xs font-bold text-muted-foreground ring-1 ring-border">
          {count}
        </span>
      </h2>
      {count === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-border bg-card/60 px-5 py-6 text-sm text-muted-foreground">
          Nada pendente aqui. Tudo em dia!
        </p>
      ) : (
        <div className="mt-3 space-y-3">{children}</div>
      )}
    </section>
  );
}

function Row({
  thumb,
  title,
  tag,
  meta,
  body,
  extra,
  actions,
}: {
  thumb?: string;
  title: string;
  tag: { text: string; color: string };
  meta: string;
  body?: string;
  extra?: string;
  actions: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex flex-wrap items-start gap-4">
        {thumb && (
          <img
            src={thumb}
            alt=""
            className="hidden h-24 w-32 shrink-0 rounded-xl object-cover sm:block"
            crossOrigin="anonymous"
          />
        )}
        <div className="min-w-0 flex-1">
          <span
            className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.text}
          </span>
          <p className="mt-1.5 font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
          {body && <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>}
          {extra && (
            <p className="mt-1.5 rounded-lg bg-sand px-2.5 py-1 text-xs text-foreground/75">
              {extra}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">{actions}</div>
      </div>
    </div>
  );
}

/* ---------- PUBLICADOS ---------- */

function Publicados({ approved }: { approved: ContentBundle }) {
  const { actions } = useData();
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function markResolved(id: string) {
    actions.updateReport(id, { resolved: true, resolutionNote: note.trim() });
    setResolveId(null);
    setNote("");
  }

  return (
    <div className="mt-6 space-y-8">
      <section>
        <h2 className="font-display text-lg font-semibold text-primary">
          Denúncias publicadas ({approved.reports.length})
        </h2>
        <div className="mt-3 space-y-3">
          {approved.reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <ReportStatusPill status={r.status} resolved={r.resolved} />
                    <span className="text-xs text-muted-foreground">
                      {getCategory(r.category).label} · {fmtShort(r.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold text-foreground">{r.title}</p>
                  {r.resolved && r.resolutionNote && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <b className="text-leaf-deep">Resolvida:</b> {r.resolutionNote}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {!r.resolved ? (
                    <Button
                      size="sm"
                      variant="leaf"
                      onClick={() => setResolveId(resolveId === r.id ? null : r.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Marcar resolvida
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        actions.updateReport(r.id, {
                          resolved: false,
                          resolutionNote: undefined,
                        })
                      }
                    >
                      Reabrir
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => actions.remove("reports", r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {resolveId === r.id && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                  <input
                    autoFocus
                    className="field min-w-[220px] flex-1"
                    placeholder="O que foi feito para resolver? (ex.: prefeitura removeu o entulho)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button size="sm" variant="leaf" onClick={() => markResolved(r.id)}>
                    Confirmar resolução
                  </Button>
                </div>
              )}
            </div>
          ))}
          {approved.reports.length === 0 && <EmptyRow />}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">
          Mutirões publicados ({approved.events.length})
        </h2>
        <div className="mt-3 space-y-3">
          {approved.events.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ocean-soft text-primary">
                  <Recycle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtShort(`${ev.date}T12:00:00`)} · {ev.locationName}
                    {!isUpcoming(ev.date) && " · já realizado"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <EventStatusPill status={ev.status} />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => actions.updateEvent(ev.id, { status: "cancelled" })}
                >
                  <X className="h-4 w-4" /> Cancelar
                </Button>
              </div>
            </div>
          ))}
          {approved.events.length === 0 && <EmptyRow />}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">
          Notícias publicadas ({approved.news.length})
        </h2>
        <div className="mt-3 space-y-3">
          {approved.news.map((n) => (
            <div
              key={n.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4"
            >
              <p className="min-w-0 font-semibold text-foreground">{n.title}</p>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => actions.remove("news", n.id)}
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            </div>
          ))}
          {approved.news.length === 0 && <EmptyRow />}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">
          Fotos publicadas ({approved.photos.length})
        </h2>
        <div className="mt-3 space-y-3">
          {approved.photos.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={p.imageUrl}
                  alt=""
                  className="h-12 w-16 rounded-lg object-cover"
                  crossOrigin="anonymous"
                />
                <p className="min-w-0 font-semibold text-foreground">{p.title}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => actions.remove("photos", p.id)}
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            </div>
          ))}
          {approved.photos.length === 0 && <EmptyRow />}
        </div>
      </section>
    </div>
  );
}

function EmptyRow() {
  return (
    <p className="rounded-2xl border border-dashed border-border bg-card/60 px-5 py-6 text-sm text-muted-foreground">
      Nenhum item neste grupo.
    </p>
  );
}

/* ---------- CRIAR ---------- */

function Criar() {
  const { actions } = useData();

  const [news, setNews] = useState({ title: "", summary: "", body: "", cover: "" });
  const [newsDone, setNewsDone] = useState(false);

  const [ev, setEv] = useState({
    title: "",
    description: "",
    locationName: "",
    date: "",
    startTime: "",
    endTime: "",
    volunteersTarget: "",
  });
  const [evDone, setEvDone] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  function publishNews(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (news.title.trim().length < 5 || news.summary.trim().length < 10)
      return setErr("Preencha título e resumo da notícia.");
    actions.addNews(
      {
        title: news.title.trim(),
        summary: news.summary.trim(),
        body: news.body.trim() || news.summary.trim(),
        coverUrl: news.cover || undefined,
        author: "Equipe Da Nascente à Foz",
      },
      true,
    );
    setNewsDone(true);
  }

  function publishEvent(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (ev.title.trim().length < 5) return setErr("Dê um título ao mutirão.");
    if (!ev.date || ev.date < todayISO()) return setErr("Escolha uma data futura.");
    if (!ev.startTime || !ev.endTime) return setErr("Informe os horários.");
    if (!ev.locationName.trim()) return setErr("Informe o ponto de encontro.");
    actions.addEvent(
      {
        title: ev.title.trim(),
        description: ev.description.trim() || ev.title.trim(),
        locationName: ev.locationName.trim(),
        date: ev.date,
        startTime: ev.startTime,
        endTime: ev.endTime,
        volunteersTarget: ev.volunteersTarget
          ? Number(ev.volunteersTarget)
          : undefined,
        proposerName: "Equipe Da Nascente à Foz",
      },
      true,
    );
    setEvDone(true);
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
          <Megaphone className="h-5 w-5 text-lagoon" />
          Publicar notícia (direto pela equipe)
        </h2>
        {newsDone ? (
          <DoneBox text="Notícia publicada com sucesso!" />
        ) : (
          <form onSubmit={publishNews} className="mt-4 space-y-3">
            <input
              className="field"
              placeholder="Título"
              value={news.title}
              onChange={(e) => setNews({ ...news, title: e.target.value })}
            />
            <textarea
              className="field resize-none"
              rows={2}
              placeholder="Resumo (aparece nos cards)"
              value={news.summary}
              onChange={(e) => setNews({ ...news, summary: e.target.value })}
            />
            <textarea
              className="field resize-none"
              rows={4}
              placeholder="Texto completo"
              value={news.body}
              onChange={(e) => setNews({ ...news, body: e.target.value })}
            />
            <ImageUpload
              value={news.cover}
              onChange={(cover) => setNews({ ...news, cover })}
              label="Imagem de capa (opcional)"
              className="h-20"
            />
            <Button type="submit" variant="leaf">
              Publicar notícia
            </Button>
          </form>
        )}
      </div>

      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
          <Recycle className="h-5 w-5 text-lagoon" />
          Criar mutirão (direto pela equipe)
        </h2>
        {evDone ? (
          <DoneBox text="Mutirão publicado na agenda!" />
        ) : (
          <form onSubmit={publishEvent} className="mt-4 space-y-3">
            <input
              className="field"
              placeholder="Título do mutirão"
              value={ev.title}
              onChange={(e) => setEv({ ...ev, title: e.target.value })}
            />
            <textarea
              className="field resize-none"
              rows={3}
              placeholder="Descrição da atividade"
              value={ev.description}
              onChange={(e) => setEv({ ...ev, description: e.target.value })}
            />
            <input
              className="field"
              placeholder="Ponto de encontro"
              value={ev.locationName}
              onChange={(e) => setEv({ ...ev, locationName: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="field"
                type="date"
                value={ev.date}
                onChange={(e) => setEv({ ...ev, date: e.target.value })}
              />
              <input
                className="field"
                type="number"
                min={1}
                placeholder="Meta de voluntários"
                value={ev.volunteersTarget}
                onChange={(e) => setEv({ ...ev, volunteersTarget: e.target.value })}
              />
              <input
                className="field"
                type="time"
                aria-label="Início"
                value={ev.startTime}
                onChange={(e) => setEv({ ...ev, startTime: e.target.value })}
              />
              <input
                className="field"
                type="time"
                aria-label="Fim"
                value={ev.endTime}
                onChange={(e) => setEv({ ...ev, endTime: e.target.value })}
              />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" variant="leaf">
              Criar mutirão
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function DoneBox({ text }: { text: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-accent/60 p-4">
      <CheckCircle2 className="h-6 w-6 shrink-0 text-leaf-deep" />
      <p className="font-medium text-accent-foreground">{text}</p>
    </div>
  );
}
