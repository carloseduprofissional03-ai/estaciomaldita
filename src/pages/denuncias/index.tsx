import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  MapPin,
  Megaphone,
  Plus,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useData } from "@/components/data-provider";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { computeStats } from "@/lib/stats";
import { daysSince, fmtShort } from "@/lib/format";
import { ReportStatusPill, ReportTrail, StageNote } from "@/components/status";
import { OcorrenciasMap } from "@/components/sections/ocorrencias-map";
import { AlertaForm } from "@/components/sections/alerta-form";
import { Carrossel } from "@/components/carrossel";
import { useAlertas } from "@/hooks/use-alertas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Denuncias() {
  const { db } = useData();
  const stats = useMemo(() => computeStats(db), [db]);
  const { alertas } = useAlertas();
  const [categoria, setCategoria] = useState<string>("todas");
  const [trilhaAberta, setTrilhaAberta] = useState<string | null>(null);
  const [formAlerta, setFormAlerta] = useState(false);

  const reports = useMemo(
    () =>
      db.reports
        .filter((r) => r.status === "approved")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.reports],
  );

  const lista = useMemo(
    () =>
      categoria === "todas"
        ? reports
        : reports.filter((r) => r.category === categoria),
    [reports, categoria],
  );

  const contagemCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const r of reports) mapa.set(r.category, (mapa.get(r.category) ?? 0) + 1);
    return mapa;
  }, [reports]);

  const resumo = [
    { label: "denúncias mapeadas", valor: stats.totalDenuncias },
    { label: "encaminhadas a órgãos", valor: stats.encaminhadas },
    { label: "casos sem retorno", valor: stats.semRetorno },
    { label: "alertas ativos", valor: alertas.length },
  ];

  return (
    <div>
      {/* TOPO */}
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Send className="h-3.5 w-3.5" />
            Fiscalização comunitária
          </p>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-3xl">
              <h1 className="text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
                Denúncias e alertas do território
              </h1>
              <p className="mt-4 text-muted-foreground">
                Os alertas rápidos da comunidade, o mapa das ocorrências e a
                lista do que já foi registrado — cada ponto com sua trilha
                pública, do protocolo no órgão responsável aos dias de silêncio.
              </p>
            </div>
            <Button asChild variant="leaf" size="lg">
              <Link to="/denunciar">
                <Plus className="h-4 w-4" />
                Registrar denúncia
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {resumo.map((r) => (
              <span
                key={r.label}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
              >
                <b className="font-display text-sm font-bold text-primary">
                  {r.valor}
                </b>
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 1. ALERTAS ATIVOS (destaque no topo) */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
              <Megaphone className="h-5 w-5 text-destructive" />
              Alertas ativos
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Avisos rápidos enviados pela comunidade, sem verificação prévia.
              Cada alerta sai do ar sozinho depois de 60 dias.
            </p>
          </div>
          <Button
            variant={formAlerta ? "secondary" : "ocean"}
            onClick={() => setFormAlerta((v) => !v)}
          >
            {formAlerta ? (
              <>
                <ChevronDown className="h-4 w-4" />
                Fechar formulário
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Enviar um alerta
              </>
            )}
          </Button>
        </div>

        {formAlerta && (
          <div className="mt-6">
            <AlertaForm />
          </div>
        )}

        <div className="mt-8">
          <Carrossel
            rotulo="Alertas ativos da comunidade"
            vazio={
              <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
                Nenhum alerta ativo agora. Que bom sinal.
              </p>
            }
          >
            {alertas.map((a) => {
              const cat = getCategory(a.categoria);
              return (
                <article
                  key={a.id}
                  className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.short}
                    </span>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                      há {daysSince(a.criadoEm)}d
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold leading-snug text-primary">
                    {a.titulo}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {a.descricao}
                  </p>
                  <p className="mt-auto flex items-center gap-1.5 pt-4 text-[11px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {a.referencia || "sem ponto de referência"}
                  </p>
                </article>
              );
            })}
          </Carrossel>
        </div>
      </section>

      {/* 2. MAPA DO TERRITÓRIO */}
      <section className="border-y border-border/60 bg-foam">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
                <MapPin className="h-5 w-5 text-lagoon" />
                Mapa do território
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Vista de satélite da Ilha de Deus. Alterne entre as{" "}
                <b className="text-foreground">ocorrências</b> (com a trilha de
                cada caso) e os <b className="text-foreground">alertas</b> da
                comunidade.
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Clique num ponto para ver os detalhes
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-border/70 shadow-card">
            <OcorrenciasMap
              comAlertas
              altura="h-[420px] w-full sm:h-[500px] lg:h-[560px]"
            />
          </div>
        </div>
      </section>

      {/* 3. DENÚNCIAS DA COMUNIDADE */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-primary">
              Denúncias da comunidade
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Cada registro é verificado pela equipe antes de virar público e
              passa a ter uma trilha: publicado, encaminhado ao órgão com
              protocolo e o tempo de espera contado em dias.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-[11px] font-semibold text-foreground/80">
            <ShieldCheck className="h-3.5 w-3.5 text-leaf" />
            Verificação antes de publicar
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setCategoria("todas")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              categoria === "todas"
                ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            Todas ({reports.length})
          </button>
          {CATEGORIES.filter((c) => contagemCategoria.get(c.id)).map((c) => {
            const on = categoria === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoria(c.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                  on
                    ? "border-transparent text-white shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
                style={on ? { backgroundColor: c.color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: on ? "rgba(255,255,255,.9)" : c.color,
                  }}
                />
                {c.short} ({contagemCategoria.get(c.id)})
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <Carrossel
            rotulo="Denúncias da comunidade"
            resetKey={categoria}
            vazio={
              <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
                Nenhuma denúncia publicada nessa categoria.
              </p>
            }
          >
            {lista.map((r) => {
              const cat = getCategory(r.category);
              const aberta = trilhaAberta === r.id;
              return (
                <article
                  key={r.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
                >
                  {r.photoUrl && (
                    <img
                      src={r.photoUrl}
                      alt={r.title}
                      className="h-40 w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.short}
                      </span>
                      <ReportStatusPill status={r.status} stage={r.stage} />
                    </div>
                    <h3 className="mt-3 font-display text-base font-semibold leading-snug text-primary">
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {r.reference} · {fmtShort(r.createdAt)}
                    </p>
                    <StageNote report={r} />
                    <button
                      type="button"
                      onClick={() => setTrilhaAberta(aberta ? null : r.id)}
                      className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition",
                          aberta && "rotate-180",
                        )}
                      />
                      {aberta ? "Esconder a trilha" : "Ver a trilha de acompanhamento"}
                    </button>
                    {aberta && (
                      <div className="mt-3 rounded-2xl bg-secondary/60 p-3.5">
                        <ReportTrail report={r} />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </Carrossel>
        </div>
      </section>
    </div>
  );
}
