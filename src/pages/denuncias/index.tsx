import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  Map as MapIcon,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useData } from "@/components/data-provider";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { computeStats } from "@/lib/stats";
import { fmtShort } from "@/lib/format";
import { ReportStatusPill, StageNote } from "@/components/status";
import { OcorrenciasMap } from "@/components/sections/ocorrencias-map";
import { AlertasResumo } from "@/components/sections/alertas-resumo";
import { AlertasBlock } from "@/components/sections/alertas-block";
import { DenunciaForm } from "@/components/sections/denuncia-form";
import { SectionTabs } from "@/components/section-tabs";
import { Carrossel } from "@/components/carrossel";
import { useAba } from "@/hooks/use-aba";
import { useAlertas } from "@/hooks/use-alertas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ABAS = ["denuncias", "registrar", "alertas"] as const;

export default function Denuncias() {
  const { db } = useData();
  const stats = useMemo(() => computeStats(db), [db]);
  const { alertas } = useAlertas();
  const [aba, irPara] = useAba([...ABAS], "denuncias");
  const [categoria, setCategoria] = useState<string>("todas");

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
    for (const r of reports) {
      mapa.set(r.category, (mapa.get(r.category) ?? 0) + 1);
    }
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
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            Denúncias do território: registrar, acompanhar e cobrar
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Aqui está tudo em um lugar só: o mapa das ocorrências, os alertas
            rápidos da comunidade, o formulário de denúncia e a lista do que já
            foi registrado — cada ponto com sua trilha pública, do protocolo no
            órgão responsável aos dias de silêncio.
          </p>
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

      {/* PANORAMA: mapa + alertas em destaque */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-3xl border border-border/70 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-card px-4 py-3">
              <p className="flex items-center gap-2 font-display text-sm font-semibold text-primary">
                <MapPin className="h-4 w-4 text-lagoon" />
                Mapa de ocorrências
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] text-muted-foreground">
                  Clique num ponto para ver a trilha completa
                </span>
                <Link
                  to="/mapa"
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-ocean-soft"
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  Tela cheia
                </Link>
              </div>
            </div>
            <OcorrenciasMap altura="h-[380px] w-full sm:h-[440px] lg:h-[480px]" />
          </div>

          <AlertasResumo onVerTodos={() => irPara("alertas")} />
        </div>
      </section>

      {/* SUBSECÇÕES */}
      <section className="border-t border-border/60 bg-foam">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <SectionTabs
            abas={[
              { id: "denuncias", label: "Denúncias da comunidade", icon: SlidersHorizontal, badge: reports.length },
              { id: "registrar", label: "Registrar denúncia", icon: Plus },
              { id: "alertas", label: "Alertas ativos", icon: BellRing, badge: alertas.length },
            ]}
            valor={aba}
            onMudar={irPara}
            className="mx-auto sm:mx-0"
          />

          <div className="mt-8">
            {aba === "denuncias" && (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border/70 bg-card p-5 shadow-card">
                  <div className="max-w-2xl">
                    <h2 className="font-display text-lg font-semibold text-primary">
                      Quer registrar uma nova denúncia?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O registro leva dois minutos: categoria, descrição, foto
                      opcional e o ponto no mapa. A equipe verifica antes de
                      publicar.
                    </p>
                  </div>
                  <Button variant="leaf" onClick={() => irPara("registrar")}>
                    <Plus className="h-4 w-4" />
                    Registrar denúncia
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-1.5">
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

                <div className="mt-6">
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
                      return (
                        <article
                          key={r.id}
                          className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition hover:-translate-y-0.5"
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
                                {cat.label}
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
                            <Link
                              to="/mapa"
                              className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Ver este ponto no mapa
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </Carrossel>
                </div>
              </div>
            )}

            {aba === "registrar" && (
              <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-card sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-primary">
                      Registrar uma denúncia
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Contato é opcional e <b>nunca publicado</b> — quem denuncia
                      está protegido.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-[11px] font-semibold text-foreground/80">
                    <ShieldCheck className="h-3.5 w-3.5 text-leaf" />
                    Verificação antes de publicar
                  </span>
                </div>
                <div className="mt-6">
                  <DenunciaForm />
                </div>
              </div>
            )}

            {aba === "alertas" && <AlertasBlock />}
          </div>
        </div>
      </section>
    </div>
  );
}
