import { useState } from "react";
import { Link } from "react-router-dom";
import { HandHeart, Leaf, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";
import { SectionTabs } from "@/components/section-tabs";
import { Carrossel } from "@/components/carrossel";
import {
  ARTESANATO,
  CULINARIA,
  PONTOS,
  type PontoComunidade,
} from "@/lib/comunidade";
import { Button } from "@/components/ui/button";

const ABAS = [
  { id: "pontos", label: "Principais pontos", icon: MapPin },
  { id: "culinaria", label: "Culinária", icon: UtensilsCrossed },
  { id: "artesanato", label: "Artesanato", icon: Sparkles },
];

const CONTEUDO: Record<string, { itens: PontoComunidade[]; nota: string }> = {
  pontos: {
    itens: PONTOS,
    nota: "Pontos apresentados pela própria comunidade. Cada um deles também aparece no mapa do território, na página de denúncias.",
  },
  culinaria: {
    itens: CULINARIA,
    nota: "A culinária da ilha é feita nas casas e nos encontros. Para provar, o caminho é combinar uma visita — não existe restaurante turístico na comunidade.",
  },
  artesanato: {
    itens: ARTESANATO,
    nota: "Peças feitas por moradoras e moradores. Para comprar ou encomendar, converse direto com a comunidade pelos canais da página Agendar Visita.",
  },
};

export default function MangueComunidade() {
  const [aba, setAba] = useState("pontos");
  const atual = CONTEUDO[aba] ?? CONTEUDO.pontos;

  return (
    <div>
      {/* TOPO */}
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Leaf className="h-3.5 w-3.5" />
            Mangue &amp; Comunidade
          </p>
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            O que a ilha tem de próprio: mangue, comida e mãos que criam
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Um retrato do território pela voz de quem mora aqui: os pontos que
            valem a caminhada, a comida que sai das cozinhas da comunidade e o
            artesanato feito com o que a ilha oferece.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="leaf">
              <Link to="/visita">
                <HandHeart className="h-4 w-4" />
                Agendar uma visita
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/denuncias">Ver o mapa do território</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CONTEÚDO EM ABAS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <SectionTabs
          abas={ABAS.map((a) => ({
            ...a,
            badge:
              a.id === "pontos"
                ? PONTOS.length
                : a.id === "culinaria"
                  ? CULINARIA.length
                  : ARTESANATO.length,
          }))}
          valor={aba}
          onMudar={setAba}
        />

        <div className="mt-8">
          <Carrossel rotulo={ABAS.find((a) => a.id === aba)?.label ?? "Comunidade"}>
            {atual.itens.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
              >
                <div
                  className="flex h-24 items-end px-5 pb-3"
                  style={{
                    background: `linear-gradient(160deg, ${item.cor}22, ${item.cor}66)`,
                  }}
                >
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: item.cor }}
                  >
                    {item.etiqueta}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold leading-snug text-primary">
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.descricao}
                  </p>
                </div>
              </article>
            ))}
          </Carrossel>
        </div>

        <p className="mt-8 rounded-2xl bg-sand px-5 py-4 text-sm leading-relaxed text-foreground/80">
          {atual.nota}
        </p>
      </section>

      {/* CONVITE */}
      <section className="border-t border-border/60 bg-foam">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
              Quer conhecer de perto?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              As visitas são guiadas por moradores e moradoras da comunidade. O
              agendamento é combinado direto com quem recebe — sem formulário e
              sem intermediário.
            </p>
          </div>
          <Button asChild variant="ocean" size="lg" className="shrink-0">
            <Link to="/visita">Ver como agendar</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
