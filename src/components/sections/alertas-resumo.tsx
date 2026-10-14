import { ArrowRight, Clock, Radio } from "lucide-react";
import { ALERTAS, ALERTAS_CONECTADOS } from "@/lib/alerts";
import { getCategory } from "@/lib/categories";
import { daysSince } from "@/lib/format";
import { useAlertas } from "@/hooks/use-alertas";
import { Button } from "@/components/ui/button";

/**
 * Painel compacto com os alertas mais recentes, usado no topo da página de
 * denúncias para dar destaque aos avisos rápidos da comunidade.
 */
export function AlertasResumo({ onVerTodos }: { onVerTodos: () => void }) {
  const { alertas, carregando } = useAlertas();
  const lista = alertas.slice(0, 3);

  return (
    <aside className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-primary">
          <Radio className="h-4 w-4 text-destructive" />
          Alertas de agora
        </h2>
        <span className="rounded-full bg-ocean-soft px-2.5 py-1 text-[11px] font-bold text-primary">
          {carregando ? "carregando…" : `${alertas.length} ativo(s)`}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Avisos rápidos enviados pela comunidade, sem verificação prévia. Saem do
        ar sozinhos depois de {ALERTAS.validadeDias} dias.
      </p>

      <ul className="mt-4 flex-1 space-y-2.5">
        {lista.length === 0 && (
          <li className="rounded-2xl bg-secondary/60 px-3 py-4 text-sm text-muted-foreground">
            Nenhum alerta ativo agora.
          </li>
        )}
        {lista.map((a) => {
          const cat = getCategory(a.categoria);
          return (
            <li
              key={a.id}
              className="flex items-start gap-2.5 rounded-2xl bg-secondary/60 px-3 py-2.5"
            >
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {a.titulo}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
                  <span>{cat.short}</span>
                  {a.referencia && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="truncate">{a.referencia}</span>
                    </>
                  )}
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    há {daysSince(a.criadoEm)} dia(s)
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="ocean" size="sm" onClick={onVerTodos}>
          Ver todos os alertas
          <ArrowRight className="h-4 w-4" />
        </Button>
        {!ALERTAS_CONECTADOS && (
          <span className="text-[11px] text-muted-foreground">
            modo demonstração (exemplos do piloto)
          </span>
        )}
      </div>
    </aside>
  );
}
