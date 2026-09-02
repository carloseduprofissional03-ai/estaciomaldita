import type { AppDB } from "./types";
import { getCategory } from "./categories";
import { monthKey, monthLabel } from "./format";

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

export interface SiteStats {
  totalDenuncias: number;
  abertas: number;
  resolvidas: number;
  mutiroes: number;
  voluntarios: number;
  noticias: number;
  fotos: number;
  porCategoria: CategorySlice[];
  porMes: MonthSlice[];
}

export function computeStats(db: AppDB): SiteStats {
  const approved = db.reports.filter((r) => r.status === "approved");
  const resolvidas = approved.filter((r) => r.resolved);
  const abertas = approved.filter((r) => !r.resolved);
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

  return {
    totalDenuncias: approved.length,
    abertas: abertas.length,
    resolvidas: resolvidas.length,
    mutiroes,
    voluntarios,
    noticias: db.news.filter((n) => n.status === "approved").length,
    fotos: db.photos.filter((p) => p.status === "approved").length,
    porCategoria,
    porMes,
  };
}
