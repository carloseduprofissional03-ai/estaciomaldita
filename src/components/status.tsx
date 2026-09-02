import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ReportStatusPill({
  status,
  resolved,
  className,
}: {
  status: string;
  resolved: boolean;
  className?: string;
}) {
  if (status === "pending") {
    return (
      <Pill className={className} cls="bg-secondary text-secondary-foreground" dot="bg-lagoon">
        Em verificação
      </Pill>
    );
  }
  if (status === "rejected") {
    return (
      <Pill className={className} cls="bg-destructive/10 text-destructive" dot="bg-destructive">
        Recusada
      </Pill>
    );
  }
  if (resolved) {
    return (
      <Pill className={className} cls="bg-accent text-accent-foreground" dot="bg-leaf">
        Resolvida
      </Pill>
    );
  }
  return (
    <Pill className={className} cls="bg-ocean-soft text-primary" dot="bg-lagoon">
      Ativa · aguarda ação
    </Pill>
  );
}

export function EventStatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  if (status === "pending") {
    return (
      <Pill className={className} cls="bg-secondary text-secondary-foreground" dot="bg-lagoon">
        Proposta em verificação
      </Pill>
    );
  }
  if (status === "cancelled") {
    return (
      <Pill className={className} cls="bg-destructive/10 text-destructive" dot="bg-destructive">
        Recusada / cancelada
      </Pill>
    );
  }
  return (
    <Pill className={className} cls="bg-accent text-accent-foreground" dot="bg-leaf">
      Confirmado
    </Pill>
  );
}

function Pill({
  children,
  cls,
  dot,
  className,
}: {
  children: ReactNode;
  cls: string;
  dot: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        cls,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {children}
    </span>
  );
}
