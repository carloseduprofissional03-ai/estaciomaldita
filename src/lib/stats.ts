import type { AppDB } from "./types";
import { getCategory } from "./categories";
import { monthKey, monthLabel } from "./format";
import {
  STAGES,
  getStage,
  isOpenStage,
  isResolvedStage,
  lastForward,
  silenceDays,
} from "./stages";

export interface CategorySlice {
  id: string;
  label: string;
  color: string;
  value: number;
}

export interface MonthSlice {
  key: string;
  label: string;
  total: number;
}

export interface StageSlice {
  id: string;
  label: string;
  color: string;
  value: number;
}

/** Denúncia encaminhada a um órgão que ainda não respondeu. */
export interface SilenceItem {
  id: string;
  title: string;
  category: string;
  agency?: string;
  protocol?: string;
  since: string;
  days: number;
}

export interface SiteStats {
  totalDenuncias: number;
  emAberto: number;
  resolvidas: number;
  resolvidasComunidade: number;
  resolvidasOrgao: number;
  encaminhadas: number;
  semRetorno: number;
  /** Soma dos dias de espera de todos os casos sem resposta. */
  diasDeSilencio: number;
  mediaDiasSemRetorno: number;
  /** % de casos encaminhados que tiveram resposta do órgão. */
  taxaResposta: number;
  mutiroes: number;
  voluntarios: number;
  noticias: number;
  fotos: number;
  porCategoria: CategorySlice[];
  porMes: MonthSlice[];
  porEtapa: StageSlice[];
  semRetornoLista: SilenceItem[];
}

export function computeStats(db: AppDB): SiteStats {
  const approved = db.reports.filter((r) => r.status === "approved");

  const resolvidasList = approved.filter((r) => isResolvedStage(r.stage));
  const resolvidasComunidade = approved.filter(
    (r) => r.stage === "resolvido_comunidade",
  ).length;
  const resolvidasOrgao = approved.filter(
    (r) => r.stage === "resolvido_orgao",
  ).length;
  const emAberto = approved.filter((r) => isOpenStage(r.stage)).length;

  const encaminhadas = approved.filter(
    (r) => Array.isArray(r.trail) && r.trail.some((t) => t.stage === "encaminhado"),
  );

  const semRetornoLista: SilenceItem[] = approved
    .filter((r) => r.stage === "sem_retorno")
    .map((r) => {
      const f = lastForward(r.trail);
      return {
        id: r.id,
        title: r.title,
        category: getCategory(r.category).short,
        agency: f?.to,
        protocol: f?.protocol,
        since: f?.at ?? r.stageAt,
        days: silenceDays(r.trail) ?? 0,
      };
    })
    .sort((a, b) => b.days - a.days);

  const diasDeSilencio = semRetornoLista.reduce((acc, s) => acc + s.days, 0);

  const mutiroes = db.events.filter((e) => e.status === "approved").length;
  const voluntarios = db.events
    .filter((e) => e.status === "approved")
    .reduce((acc, e) => acc + (e.signupCount ?? 0), 0);

  const catMap = new Map<string, CategorySlice>();
  for (const r of approved) {
    const cat = getCategory(r.category);
    const cur = catMap.get(r.category) ?? {
      id: r.category,
      label: cat.label,
      color: cat.color,
      value: 0,
    };
    cur.value += 1;
    catMap.set(r.category, cur);
  }
  const porCategoria = Array.from(catMap.values()).sort(
    (a, b) => b.value - a.value,
  );

  const monthMap = new Map<string, MonthSlice>();
  for (const r of approved) {
    const key = monthKey(r.createdAt);
    const cur = monthMap.get(key) ?? { key, label: monthLabel(key), total: 0 };
    cur.total += 1;
    monthMap.set(key, cur);
  }
  const porMes = Array.from(monthMap.values()).sort((a, b) =>
    a.key.localeCompare(b.key),
  );

  const porEtapa: StageSlice[] = STAGES.map((s) => ({
    id: s.id,
    label: s.short,
    color: s.color,
    value: approved.filter((r) => r.stage === s.id).length,
  })).filter((s) => s.value > 0);

  const respondidas = encaminhadas.filter(
    (r) => r.stage === "resolvido_orgao" || r.stage === "resolvido_comunidade",
  ).length;

  return {
    totalDenuncias: approved.length,
    emAberto,
    resolvidas: resolvidasList.length,
    resolvidasComunidade,
    resolvidasOrgao,
    encaminhadas: encaminhadas.length,
    semRetorno: semRetornoLista.length,
    diasDeSilencio,
    mediaDiasSemRetorno: semRetornoLista.length
      ? Math.round(diasDeSilencio / semRetornoLista.length)
      : 0,
    taxaResposta: encaminhadas.length
      ? Math.round((respondidas / encaminhadas.length) * 100)
      : 0,
    mutiroes,
    voluntarios,
    noticias: db.news.filter((n) => n.status === "approved").length,
    fotos: db.photos.filter((p) => p.status === "approved").length,
    porCategoria,
    porMes,
    porEtapa,
    semRetornoLista,
  };
}

/** Rótulo curto da etapa atual, para textos corridos. */
export function stageLabel(report: { stage: string }): string {
  return getStage(report.stage).label;
}
