import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Carrossel navegável reutilizável.
 *
 * - 3 cards por vez no desktop, 2 no tablet e 1 no celular;
 * - setas laterais que avançam/voltam uma tela inteira, desabilitadas nas
 *   extremidades;
 * - no celular e no tablet o deslize (swipe) funciona nativamente, porque a
 *   trilha é um contêiner com scroll + snap;
 * - `resetKey` reposiciona o carrossel na primeira página (usado pelos filtros).
 */

/** Quantos cards cabem por tela na largura atual. */
function cardsPorTela(): number {
  if (typeof window === "undefined") return 3;
  const largura = window.innerWidth;
  return largura >= 1024 ? 3 : largura >= 640 ? 2 : 1;
}

export function Carrossel({
  children,
  rotulo,
  resetKey,
  vazio,
  className,
}: {
  children: ReactNode[];
  /** Acessibilidade: descreve o conjunto. */
  rotulo: string;
  /** Quando este valor muda, o carrossel volta para a primeira página. */
  resetKey?: unknown;
  vazio?: ReactNode;
  className?: string;
}) {
  const trilha = useRef<HTMLDivElement>(null);
  const [porTela, setPorTela] = useState(cardsPorTela);
  const [noInicio, setNoInicio] = useState(true);
  const [noFim, setNoFim] = useState(false);
  const [pagina, setPagina] = useState(1);

  const itens = (Array.isArray(children) ? children : [children]).filter(
    (i): i is ReactNode => i !== null && i !== undefined && i !== false,
  );

  const paginas = Math.max(1, Math.ceil(itens.length / porTela));

  const medir = useCallback(() => {
    const el = trilha.current;
    if (!el) return;
    const maximo = el.scrollWidth - el.clientWidth;
    setNoInicio(el.scrollLeft <= 4);
    setNoFim(maximo <= 4 || el.scrollLeft >= maximo - 4);
    setPagina(
      Math.min(
        paginas,
        Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)) + 1,
      ),
    );
  }, [paginas]);

  // Acompanha a largura da tela: é o que define quantos cards aparecem por vez.
  useEffect(() => {
    const recalcular = () => setPorTela(cardsPorTela());
    recalcular();
    window.addEventListener("resize", recalcular);
    return () => window.removeEventListener("resize", recalcular);
  }, []);

  useEffect(() => {
    medir();
    const el = trilha.current;
    if (!el) return;
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      el.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [medir]);

  useEffect(() => {
    trilha.current?.scrollTo({ left: 0, behavior: "smooth" });
    setPagina(1);
  }, [resetKey]);

  function mover(direcao: 1 | -1) {
    const el = trilha.current;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth, behavior: "smooth" });
  }

  if (itens.length === 0) return <>{vazio ?? null}</>;

  // Cabe tudo na tela de uma vez: mesma grade, sem setas.
  if (itens.length <= porTela) {
    return (
      <div
        className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
        aria-label={rotulo}
      >
        {itens.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Seta lado="esquerda" desabilitada={noInicio} onClick={() => mover(-1)} />

      <div
        ref={trilha}
        role="group"
        aria-label={rotulo}
        className="flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {itens.map((item, i) => (
          <div
            key={i}
            className="w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
          >
            {item}
          </div>
        ))}
      </div>

      <Seta lado="direita" desabilitada={noFim} onClick={() => mover(1)} />

      {paginas > 1 && (
        <p className="mt-3 text-right text-[11px] font-medium text-muted-foreground">
          página {pagina} de {paginas}
        </p>
      )}
    </div>
  );
}

function Seta({
  lado,
  desabilitada,
  onClick,
}: {
  lado: "esquerda" | "direita";
  desabilitada: boolean;
  onClick: () => void;
}) {
  const Icone = lado === "esquerda" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitada}
      aria-label={lado === "esquerda" ? "Ver cards anteriores" : "Ver próximos cards"}
      className={cn(
        "absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border/60 bg-card/95 text-primary shadow-card backdrop-blur transition",
        lado === "esquerda" ? "-left-3 sm:-left-4" : "-right-3 sm:-right-4",
        desabilitada
          ? "cursor-not-allowed opacity-35"
          : "hover:scale-105 hover:bg-card",
      )}
    >
      <Icone className="h-5 w-5" />
    </button>
  );
}
