import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Camera, Images, Newspaper } from "lucide-react";
import { useData } from "@/components/data-provider";
import { fmtShort } from "@/lib/format";
import { ImpactoModulo } from "@/components/sections/impacto-modulo";
import { GaleriaBlock } from "@/components/sections/galeria-block";
import { SectionTabs } from "@/components/section-tabs";
import { Carrossel } from "@/components/carrossel";
import { useAba } from "@/hooks/use-aba";

const ABAS = ["noticias", "galeria"] as const;

export default function Noticias() {
  const { db } = useData();
  const navigate = useNavigate();
  const [aba, irPara] = useAba([...ABAS], "noticias");
  const [busca, setBusca] = useState("");

  const noticias = useMemo(
    () =>
      db.news
        .filter((n) => n.status === "approved")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.news],
  );

  const fotos = useMemo(
    () => db.photos.filter((p) => p.status === "approved").length,
    [db.photos],
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
            Notícias do território
          </p>
          <h1 className="text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            Acompanhe a comunidade em movimento
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Histórias, registros e indicadores do território em um só lugar:
            mutirões, fauna, oficinas e conquistas — e os números que mostram o
            que já andou e o que ainda espera resposta.
          </p>
        </div>
      </section>

      {/* SUBSECÇÕES */}
      <section className="bg-foam">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <SectionTabs
            abas={[
              { id: "noticias", label: "Notícias", icon: Newspaper, badge: noticias.length },
              { id: "galeria", label: "Galeria de fotos", icon: Images, badge: fotos },
            ]}
            valor={aba}
            onMudar={irPara}
            className="mx-auto sm:mx-0"
          />

          <div className="mt-8">
            {aba === "noticias" && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-primary">
                    O que está acontecendo
                  </h2>
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar nas notícias…"
                    className="field max-w-xs"
                  />
                </div>

                <div className="mt-6">
                  <Carrossel
                    rotulo="Notícias do território"
                    resetKey={busca}
                    vazio={
                      <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-muted-foreground">
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
                              className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                              crossOrigin="anonymous"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-5">
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {fmtShort(n.createdAt)} · {n.author}
                          </p>
                          <h3 className="mt-2 line-clamp-2 font-display text-xl font-semibold leading-snug text-primary group-hover:underline">
                            {n.title}
                          </h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {n.summary}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </Carrossel>
                </div>

                <div className="mt-8 flex items-start gap-3 rounded-3xl border border-dashed border-border bg-card/70 p-5">
                  <Camera className="mt-0.5 h-4 w-4 shrink-0 text-lagoon" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <b className="text-foreground">Tem uma foto do território?</b>{" "}
                    As imagens enviadas pela comunidade ficam na{" "}
                    <button
                      type="button"
                      onClick={() => irPara("galeria")}
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Galeria de fotos
                    </button>
                    , com verificação da equipe antes de publicar.
                  </p>
                </div>
              </div>
            )}

            {aba === "galeria" && <GaleriaBlock />}
          </div>
        </div>
      </section>

      {/* MÓDULO DE INDICADORES */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
                Indicadores e resultados
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Transparência com o que já foi resolvido — e com o tempo que a
                comunidade ainda espera. Os relatórios são públicos.
              </p>
            </div>
            <Link
              to="/impacto"
              className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
            >
              Abrir relatório completo
            </Link>
          </div>
          <div className="mt-6">
            <ImpactoModulo compacto onVerCompleto={() => navigate("/impacto")} />
          </div>
        </div>
      </section>
    </div>
  );
}
