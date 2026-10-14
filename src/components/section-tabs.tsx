import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AbaItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

/** Seletor de subseções de uma página (abas internas), responsivo. */
export function SectionTabs({
  abas,
  valor,
  onMudar,
  className,
}: {
  abas: AbaItem[];
  valor: string;
  onMudar: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Subseções da página"
      className={cn(
        "flex w-full flex-wrap gap-1 rounded-2xl border border-border/60 bg-secondary/70 p-1.5 sm:w-auto sm:flex-nowrap sm:rounded-full",
        className,
      )}
    >
      {abas.map((a) => {
        const ativa = valor === a.id;
        return (
          <button
            key={a.id}
            role="tab"
            type="button"
            aria-selected={ativa}
            onClick={() => onMudar(a.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition",
              ativa
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            {a.icon && <a.icon className="h-4 w-4" />}
            {a.label}
            {typeof a.badge === "number" && a.badge > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  ativa ? "bg-ocean-soft text-primary" : "bg-card text-muted-foreground",
                )}
              >
                {a.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
