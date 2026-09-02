import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  HandHeart,
  Lock,
  MapPin,
  ScrollText,
  Send,
} from "lucide-react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { useData } from "@/components/data-provider";
import { fmtShort } from "@/lib/format";
import { ReportStatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";

export default function Denuncias() {
  const { db } = useData();
  const recentes = useMemo(
    () =>
      db.reports
        .filter((r) => r.status === "approved")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    [db.reports],
  );

  const fluxo = [
    { icon: MapPin, title: "A comunidade registra", text: "no mapa, com local, descrição e foto opcional." },
    { icon: BadgeCheck, title: "A equipe verifica", text: "cada relato antes de publicar — garantia de veracidade." },
    { icon: ScrollText, title: "O ponto vira documento", text: "registro público que embasa cobranças e relatórios." },
    { icon: HandHeart, title: "Vira ação e resposta", text: "mutirões, órgãos públicos e acompanhamento até resolver." },
  ];

  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Send className="h-3.5 w-3.5" />
            Fiscalização comunitária
          </p>
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            O que é denunciar? É cuidar do território em que se vive
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Denúncias socioambientais da Ilha de Deus registram problemas como
            descarte irregular, esgoto e degradação do mangue. O que parecia
            "fofoca de vizinho" ganha documento, mapa e cobrança — até virar
            resultado.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-center font-display text-2xl font-semibold text-primary sm:text-3xl">
          Do registro à resolução
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fluxo.map((f, i) => (
            <div key={f.title} className="relative rounded-2xl border border-border/70 bg-card p-5 shadow-card">
              <span className="absolute right-4 top-4 font-display text-4xl font-semibold text-secondary-foreground/15">
                {i + 1}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ocean-soft text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="leaf" size="lg">
            <Link to="/denunciar">
              <Send className="h-4 w-4" />
              Quero fazer uma denúncia
            </Link>
          </Button>
          <Button asChild variant="ocean" size="lg">
            <Link to="/mapa">
              <MapPin className="h-4 w-4" />
              Ver tudo no mapa
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-foam">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-2xl font-semibold text-primary sm:text-3xl">
            O que a comunidade monitora
          </h2>
          <div className="mx-auto mt-10 grid max-w-5xl gap-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card/60">
                <span
                  className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: c.color }}
                >
                  {c.id.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{c.label}</p>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
            Denúncias mais recentes
          </h2>
          <Button asChild variant="ghost" className="text-primary">
            <Link to="/mapa">
              Ver todas no mapa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentes.map((r) => {
            const cat = getCategory(r.category);
            return (
              <article key={r.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition hover:-translate-y-0.5">
                {r.photoUrl && (
                  <img
                    src={r.photoUrl}
                    alt={r.title}
                    className="h-40 w-full object-cover"
                    crossOrigin="anonymous"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: cat.color }}>
                      {cat.label}
                    </span>
                    <ReportStatusPill status={r.status} resolved={r.resolved} />
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold leading-snug text-primary">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {r.reference} · {fmtShort(r.createdAt)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-sand">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf text-white">
            <Lock className="h-5 w-5" />
          </span>
          <p className="max-w-4xl text-sm leading-relaxed text-foreground/85">
            <b className="text-primary">Proteção ao denunciante:</b> nomes e
            contatos de quem registra ocorrências nunca são publicados. A
            verificação é feita pela equipe antes de qualquer ponto virar
            público — o que garante a veracidade das informações e protege quem
            tem coragem de cuidar do próprio território.
          </p>
        </div>
      </section>
    </div>
  );
}
