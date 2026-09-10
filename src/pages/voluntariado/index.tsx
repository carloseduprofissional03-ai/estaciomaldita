import { useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  HandHeart,
  Loader2,
  MapPin,
  PartyPopper,
  Send,
  Users,
} from "lucide-react";
import { useData } from "@/components/data-provider";
import { isUpcoming, todayISO } from "@/lib/format";
import type { CleanupEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Voluntariado() {
  const { db } = useData();

  const publicados = useMemo(
    () =>
      db.events
        .filter((e) => e.status === "approved" && isUpcoming(e.date))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [db.events],
  );

  const countFor = (event: CleanupEvent) => event.signupCount ?? 0;

  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <HandHeart className="h-3.5 w-3.5" />
            Voluntariado
          </p>
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            Mutirões: a denúncia que vira mão na terra
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A comunidade propõe, a equipe verifica e todo mundo participa.
            Escolha um mutirão, inscreva-se — ou proponha o próximo. Cada
            voluntário é mais um par de olhos cuidando do rio.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        {publicados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              Ainda não há mutirões agendados. Que tal propor o primeiro?
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {publicados.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                count={countFor(event)}
              />
            ))}
          </div>
        )}

        <div className="mt-12">
          <ProposeForm />
        </div>
      </section>
    </div>
  );
}

function EventCard({ event, count }: { event: CleanupEvent; count: number }) {
  const { actions } = useData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "erro"; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const dia = event.date.split("-");
  const full = Number(count) >= Number(event.volunteersTarget ?? Infinity);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (name.trim().length < 3) return setMsg({ type: "erro", text: "Informe seu nome." });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setMsg({ type: "erro", text: "Informe um e-mail válido." });
    setBusy(true);
    const res = await actions.addSignup({
      eventId: event.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setMsg({ type: "erro", text: res.message ?? "Não foi possível inscrever." });
      return;
    }
    setMsg(null);
    setDone(true);
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
        <div className="flex w-fit shrink-0 flex-col items-center rounded-2xl bg-primary px-5 py-3 text-white">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
            {dia[1]}/
          </span>
          <span className="font-display text-3xl font-semibold leading-none">
            {dia[2]}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-widest text-white/70">
            {'’' + dia[0].slice(2)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold text-primary">
            {event.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-lagoon" />
              {event.startTime} – {event.endTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-lagoon" />
              {event.locationName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-lagoon" />
              {count} voluntário{count === 1 ? "" : "s"}
              {event.volunteersTarget ? ` de ${event.volunteersTarget}` : ""}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Proposto por {event.proposerName}
          </p>
        </div>

        <div className="shrink-0">
          {done ? (
            <div className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
              <CheckCircle2 className="h-4 w-4 text-leaf-deep" />
              Inscrição confirmada!
            </div>
          ) : full ? (
            <span className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
              Vagas preenchidas
            </span>
          ) : (
            <Button variant="leaf" onClick={() => setOpen((v) => !v)}>
              {open ? "Fechar" : "Quero participar"}
            </Button>
          )}
        </div>
      </div>

      {open && !done && (
        <form onSubmit={submit} className="border-t border-border/70 bg-foam/60 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <input className="field" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="field" type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="field" placeholder="WhatsApp (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {msg && (
            <p className={cn("mt-3 text-sm", msg.type === "ok" ? "text-leaf-deep" : "text-destructive")}>
              {msg.text}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="submit" variant="leaf" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {busy ? "Enviando…" : "Confirmar inscrição"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Usaremos seus dados apenas para avisar sobre o mutirão.
            </p>
          </div>
        </form>
      )}
    </article>
  );
}

function ProposeForm() {
  const { actions } = useData();
  const [form, setForm] = useState({
    title: "",
    description: "",
    locationName: "",
    date: "",
    startTime: "",
    endTime: "",
    volunteersTarget: "",
    proposerName: "",
    proposerContact: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.title.trim().length < 5) return setError("Dê um título para o mutirão.");
    if (form.proposerName.trim().length < 3) return setError("Informe quem está propondo.");
    if (!form.date) return setError("Escolha a data.");
    if (form.date < todayISO()) return setError("A data precisa ser futura.");
    if (!form.startTime || !form.endTime) return setError("Informe o horário.");
    if (!form.locationName.trim()) return setError("Informe o ponto de encontro.");
    if (form.description.trim().length < 15)
      return setError("Descreva a atividade com alguns detalhes.");

    actions.addEvent(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        locationName: form.locationName.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        volunteersTarget: form.volunteersTarget ? Number(form.volunteersTarget) : undefined,
        proposerName: form.proposerName.trim(),
        proposerContact: form.proposerContact.trim() || undefined,
      },
      false,
    );
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-8 text-center shadow-card">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-leaf text-white">
          <PartyPopper className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-primary">
          Proposta enviada!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Assim como as denúncias, as propostas de mutirão passam pela
          verificação da equipe antes de virar evento público.
        </p>
        <p className="mx-auto mt-3 max-w-md rounded-xl bg-sand px-4 py-3 text-xs leading-relaxed text-foreground/75">
          Nesta versão (sem servidor), a proposta fica registrada neste
          navegador. Quando a ferramenta completa estiver ativa, ela chega
          automaticamente para a equipe.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-foam p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-primary">
        Quer propor um mutirão na comunidade?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Esta aba é aberta para toda a comunidade: qualquer morador ou voluntário
        pode sugerir dia, hora e local — a equipe verifica e, se aprovado, o
        mutirão entra na agenda pública de voluntariado.
      </p>
      <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <input className="field" placeholder="Título do mutirão" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <textarea className="field resize-none" rows={3} placeholder="O que a atividade vai fazer? Quantas pessoas, o que levar…" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <input className="field" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        <input className="field" placeholder="Ponto de encontro (ex.: ponte de acesso)" value={form.locationName} onChange={(e) => set("locationName", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className="field" type="time" aria-label="Horário de início" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
          <input className="field" type="time" aria-label="Horário de fim" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
        </div>
        <input className="field" type="number" min={1} placeholder="Meta de voluntários (opcional)" value={form.volunteersTarget} onChange={(e) => set("volunteersTarget", e.target.value)} />
        <input className="field" placeholder="Seu nome (quem propõe)" value={form.proposerName} onChange={(e) => set("proposerName", e.target.value)} />
        <input className="field" placeholder="Seu contato (opcional, não publicado)" value={form.proposerContact} onChange={(e) => set("proposerContact", e.target.value)} />
        {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <Button type="submit" variant="leaf" size="lg">
            <Send className="h-4 w-4" />
            Enviar proposta para verificação
          </Button>
        </div>
      </form>
    </div>
  );
}
