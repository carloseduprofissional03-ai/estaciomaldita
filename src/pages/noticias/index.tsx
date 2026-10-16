import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarDays, Camera, Newspaper } from "lucide-react";
import { useData } from "@/components/data-provider";
import { fmtShort } from "@/lib/format";
import { ImpactoModulo } from "@/components/sections/impacto-modulo";
import { GaleriaBlock } from "@/components/sections/galeria-block";
import { Carrossel } from "@/components/carrossel";
import { Button } from "@/components/ui/button";

export default function Noticias() {
  const { db } = useData();
  const [busca, setBusca] = useState("");
  const [indicadoresCompletos, setIndicadoresCompletos] = useState(false);

  const noticias = useMemo(
    () =>
      db.news
        .filter((n) => n.status === "approved")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.news],
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return noticias;
    return noticias.filter(
      (n) =>
        n.title.toLowerCase().includes(termo) ||
        n.summary.toLowerCase().includes(termo),
    );
  }, [noticias, busca]);

  return (
    <div>
      {/* TOPO */}
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Newspaper className="h-3.5 w-3.5" />
            Notícias, dados e galeria
          </p>
          <h1 className="text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            Acompanhe a comunidade em movimento
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Três blocos, nesta ordem: os números de impacto do projeto, as
            histórias escritas pela comunidade e a galeria de fotos do
            território.
          </p>
        </div>
      </section>

      {/* 1. INDICADORES E DADOS DE IMPACTO */}
      <section className="bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
                <BarChart3 className="h-5 w-5 text-lagoon" />
                Indicadores e resultados
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Transparência com o que já foi resolvido — e com o tempo que a
                comunidade ainda espera resposta dos órgãos.
              </p>
            </div>
            {indicadoresCompletos && (
              <Button
                variant="secondary"
                onClick={() => setIndicadoresCompletos(false)}
              >
                Recolher detalhes
              </Button>
            )}
          </div>

          <div className="mt-6">
            <ImpactoModulo
              compacto={!indicadoresCompletos}
              onVerCompleto={() => setIndicadoresCompletos(true)}
            />
          </div>
        </div>
      </section>

      {/* 2. FEED DE NOTÍCIAS E ARTIGOS */}
      <section className="border-y border-border/60 bg-foam">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold text-primary">
                Notícias e artigos
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Mutirões, registros de fauna, oficinas e conquistas — matérias
                verificadas pela equipe antes de publicar.
              </p>
            </div>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nas notícias…"
              className="field max-w-xs"
            />
          </div>

          {filtradas.length > 0 && (
            <p className="mt-4 text-[11px] font-medium text-muted-foreground">
              {filtradas.length} matéria(s)
            </p>
          )}

          <div className="mt-6">
            <Carrossel
              rotulo="Notícias e artigos"
              resetKey={busca}
              vazio={
                <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
                  Nenhuma notícia encontrada.
                </p>
              }
            >
              {filtradas.map((n) => (
                <Link
                  key={n.id}
                  to={`/noticias/${n.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition hover:-translate-y-1"
                >
                  {n.coverUrl && (
                    <div className="overflow-hidden">
                      <img
                        src={n.coverUrl}
                        alt={n.title}
                        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {fmtShort(n.createdAt)} · {n.author}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold leading-snug text-primary group-hover:underline">
                      {n.title}
                    </h3>
                    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                      {n.summary}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold text-primary">
                      Ler a matéria
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </Carrossel>
          </div>
        </div>
      </section>

      {/* 3. GALERIA DE FOTOS E MÍDIAS */}
      <section className="bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
              <Camera className="h-5 w-5 text-leaf" />
              Galeria de fotos e mídias
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              O território registrado por quem vive aqui. Clique numa foto para
              ampliar.
            </p>
          </div>

          <div className="mt-6">
            <GaleriaBlock />
          </div>
        </div>
      </section>
    </div>
  );
}
