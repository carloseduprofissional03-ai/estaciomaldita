/*
 * Trilha de acompanhamento das denúncias.
 *
 * O projeto registra, documenta e cobra — mas não controla a decisão dos
 * órgãos públicos. Por isso o site não usa "resolvida / não resolvida":
 * cada ponto tem uma ETAPA real e verificável, com data. Quando o órgão não
 * responde, o silêncio também fica registrado (e contado em dias).
 */

export type Stage =
  /** Relato recebido; a equipe ainda está conferindo. */
  | "registrado"
  /** Verificado e visível no mapa. */
  | "publicado"
  /** Protocolado num órgão público (com órgão, data e protocolo). */
  | "encaminhado"
  /** Passou o prazo de resposta e o órgão não respondeu. */
  | "sem_retorno"
  /** A própria comunidade resolveu (mutirão, limpeza, plantio). */
  | "resolvido_comunidade"
  /** O órgão responsável resolveu. */
  | "resolvido_orgao"
  /** Não foi possível confirmar o relato. */
  | "nao_verificavel";

export interface TrailEntry {
  stage: Stage;
  /** Data (ISO) em que a etapa foi registrada. */
  at: string;
  /** Observação pública do que aconteceu. */
  note?: string;
  /** Órgão para o qual o caso foi encaminhado. */
  to?: string;
  /** Número de protocolo do órgão. */
  protocol?: string;
}

export type StageTone =
  | "neutral"
  | "progress"
  | "wait"
  | "community"
  | "official"
  | "closed";

export interface StageMeta {
  id: Stage;
  label: string;
  short: string;
  meaning: string;
  color: string;
  tone: StageTone;
}

/** Prazo, em dias, que o projeto espera antes de registrar silêncio. */
export const PRAZO_RESPOSTA_DIAS = 30;

export const STAGES: StageMeta[] = [
  {
    id: "registrado",
    label: "Registrado",
    short: "Registrado",
    meaning:
      "O relato chegou pela comunidade e está sendo conferido pela equipe do projeto.",
    color: "#7b8a99",
    tone: "neutral",
  },
  {
    id: "publicado",
    label: "Publicado no mapa",
    short: "Publicado",
    meaning:
      "O ponto foi verificado no local e está visível no mapa, com descrição e data.",
    color: "#2f7fc0",
    tone: "progress",
  },
  {
    id: "encaminhado",
    label: "Encaminhado ao órgão público",
    short: "Encaminhado",
    meaning:
      "O caso foi protocolado num órgão responsável. Órgão, data e número de protocolo ficam públicos aqui.",
    color: "#1c6b8c",
    tone: "progress",
  },
  {
    id: "sem_retorno",
    label: "Sem retorno do órgão",
    short: "Sem retorno",
    meaning:
      "O prazo de resposta passou e o órgão não se manifestou. O silêncio fica registrado e contado em dias.",
    color: "#c2543f",
    tone: "wait",
  },
  {
    id: "resolvido_comunidade",
    label: "Resolvido pela comunidade",
    short: "Pela comunidade",
    meaning:
      "A comunidade agiu diretamente — mutirão, limpeza, plantio — e o problema foi resolvido.",
    color: "#2e9e63",
    tone: "community",
  },
  {
    id: "resolvido_orgao",
    label: "Resolvido pelo órgão público",
    short: "Pelo órgão",
    meaning:
      "O órgão responsável respondeu à cobrança e resolveu o problema apontado.",
    color: "#1f7a52",
    tone: "official",
  },
  {
    id: "nao_verificavel",
    label: "Não verificável",
    short: "Não verificável",
    meaning:
      "Não foi possível confirmar o relato no local nem com quem registrou. Fica registrado como inconclusivo, sem virar acusação.",
    color: "#8b7f6b",
    tone: "closed",
  },
];

const FALLBACK: StageMeta = {
  id: "publicado",
  label: "Publicado no mapa",
  short: "Publicado",
  meaning: "",
  color: "#2f7fc0",
  tone: "progress",
};

export function getStage(id: string): StageMeta {
  return STAGES.find((s) => s.id === id) ?? FALLBACK;
}

export function isResolvedStage(id: string): boolean {
  return id === "resolvido_comunidade" || id === "resolvido_orgao";
}

export function isOpenStage(id: string): boolean {
  return (
    id === "registrado" ||
    id === "publicado" ||
    id === "encaminhado" ||
    id === "sem_retorno"
  );
}

/** Último encaminhamento registrado na trilha (se houver). */
export function lastForward(trail: TrailEntry[]): TrailEntry | null {
  for (let i = trail.length - 1; i >= 0; i -= 1) {
    if (trail[i].stage === "encaminhado") return trail[i];
  }
  return null;
}

/** Dias corridos desde uma data ISO. */
export function daysSince(iso: string): number {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}

/**
 * Dias de espera desde o último encaminhamento (último protocolo aberto).
 * Retorna null quando o caso nunca foi encaminhado a um órgão.
 */
export function silenceDays(trail: TrailEntry[]): number | null {
  const f = lastForward(trail);
  return f ? daysSince(f.at) : null;
}
