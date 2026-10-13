import type { ReactNode } from "react";
import type { Report, Stage, TrailEntry } from "@/lib/types";
import {
  getStage,
  isResolvedStage,
  silenceDays,
  type StageTone,
} from "@/lib/stages";
import { fmtShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONE: Record<StageTone, { pill: string; dot: string; line: string }> = {
  neutral: {
    pill: "bg-secondary text-secondary-foreground",
    dot: "bg-lagoon",
    line: "bg-border",
  },
  progress: {
    pill: "bg-ocean-soft text-primary",
    dot: "bg-lagoon",
    line: "bg-lagoon/30",
  },
  wait: {
    pill: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    line: "bg-destructive/30",
  },
  community: {
    pill: "bg-accent text-accent-foreground",
    dot: "bg-leaf",
    line: "bg-leaf/30",
  },
  official: {
    pill: "bg-accent text-accent-foreground",
    dot: "bg-leaf-deep",
    line: "bg-leaf/40",
  },
  closed: {
    pill: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
    line: "bg-border",
  },
};

/** Pílula da situação da denúncia: verificação, etapa atual e resolução. */
export function ReportStatusPill({
  status,
  stage,
  className,
}: {
  status: string;
  stage: Stage;
  className?: string;
}) {
  if (status === "pending") {
    return (
      <Pill
        className={className}
        cls={TONE.neutral.pill}
        dot={TONE.neutral.dot}
      >
        Em verificação
      </Pill>
    );
  }
  if (status === "rejected") {
    return (
      <Pill
        className={className}
        cls="bg-destructive/10 text-destructive"
        dot="bg-destructive"
      >
        Recusada
      </Pill>
    );
  }
  const meta = getStage(stage);
  const tone = TONE[meta.tone];
  return (
    <Pill className={className} cls={tone.pill} dot={tone.dot}>
      {meta.short}
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

/**
 * Trilha de acompanhamento: o que o projeto já fez com esta denúncia, em
 * ordem, com data, órgão e protocolo. O silêncio também aparece aqui.
 */
export function ReportTrail({
  report,
  className,
}: {
  report: Pick<Report, "stage" | "trail">;
  className?: string;
}) {
  const entries: TrailEntry[] = report.trail ?? [];
  const dias = silenceDays(entries);
  const esperando = report.stage === "encaminhado" && dias !== null;
  const semRetorno = report.stage === "sem_retorno" && dias !== null;

  return (
    <div className={className}>
      <ol className="mt-1">
        {entries.map((e, i) => {
          const meta = getStage(e.stage);
          const tone = TONE[meta.tone];
          const isLast = i === entries.length - 1;
          return (
            <li key={`${e.stage}-${e.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn("absolute left-[6px] top-4 h-full w-px", tone.line)}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "relative z-10 mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ring-2",
                  isLast ? "ring-primary/25" : "ring-transparent",
                )}
                style={{ backgroundColor: meta.color }}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-tight text-foreground">
                  {meta.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{fmtShort(e.at)}</p>
                {(e.to || e.protocol) && (
                  <p className="mt-1 text-xs leading-relaxed text-foreground/85">
                    {e.to && (
                      <>
                        <b className="font-semibold">Órgão:</b> {e.to}
                      </>
                    )}
                    {e.to && e.protocol && " · "}
                    {e.protocol && (
                      <>
                        <b className="font-semibold">Protocolo:</b> {e.protocol}
                      </>
                    )}
                  </p>
                )}
                {e.note && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {e.note}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {semRetorno && (
        <p className="mt-2 rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-xs leading-relaxed text-destructive">
          <b>{dias} dias sem resposta</b> desde o encaminhamento ao órgão. O
          silêncio fica registrado e entra no relatório do projeto.
        </p>
      )}
      {esperando && (
        <p className="mt-2 rounded-xl bg-ocean-soft px-3 py-2 text-xs leading-relaxed text-primary">
          Aguardando resposta do órgão há <b>{dias} dias</b>.
        </p>
      )}
    </div>
  );
}

/** Resumo curto do desfecho, usado nos cards e listas. */
export function StageNote({ report }: { report: Report }) {
  if (!report.note) return null;
  return (
    <p
      className={cn(
        "mt-3 rounded-xl border px-3 py-2 text-xs leading-relaxed",
        isResolvedStage(report.stage)
          ? "border-accent bg-accent/40 text-accent-foreground"
          : "border-border bg-secondary/60 text-muted-foreground",
      )}
    >
      <b>{isResolvedStage(report.stage) ? "Desfecho:" : "Acompanhamento:"}</b>{" "}
      {report.note}
    </p>
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
