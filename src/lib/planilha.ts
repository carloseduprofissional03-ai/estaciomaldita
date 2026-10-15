/*
 * Ponte com a planilha do Google (custo zero) — usada pelo mapa de alerta e
 * pela área "A Ilha" (avisos, instituições/ONGs e, mais adiante, artesanato e
 * passeios).
 *
 * Como funciona: um único App da Web do Apps Script atende todos os recursos.
 *   GET  <endpoint>?recurso=avisos          -> { ok: true, itens: [...] }
 *   POST <endpoint>  (corpo de formulário)  -> grava uma linha na aba do recurso
 *
 * O site lê apenas o que a equipe marcou como "aprovado" na planilha. Quando a
 * URL não está preenchida, o site entra em modo demonstração e, em vez de fingir
 * que publicou, prepara um e-mail para a equipe.
 */

export const PLANILHA = {
  /** URL do App da Web do Apps Script (termina em /exec). Vazio = demonstração. */
  endpoint: "",
};

export function planilhaAtiva(): boolean {
  return PLANILHA.endpoint.startsWith("https://script.google.com/");
}

/* ---------- leitura de valores vindos da planilha ---------- */

export function comoTexto(valor: unknown, max = 600): string {
  return String(valor ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function comoTextoLongo(valor: unknown, max = 2000): string {
  return String(valor ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function comoNumero(valor: unknown): number | null {
  const n = Number(valor);
  return isFinite(n) ? n : null;
}

export function comoDataISO(valor: unknown): string {
  if (!valor) return new Date().toISOString();
  const d = new Date(String(valor));
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/* ---------- chamadas ---------- */

export interface RespostaItens<T> {
  ok: boolean;
  itens: T[];
  erro?: string;
}

/** Lê a lista de um recurso (somente linhas aprovadas). */
export async function lerItens<T>(
  recurso: string,
  normalizar: (raw: unknown) => T | null,
  timeoutMs = 12_000,
): Promise<RespostaItens<T>> {
  if (!planilhaAtiva()) return { ok: false, itens: [], erro: "sem-endpoint" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const base = PLANILHA.endpoint;
    const url = `${base}${base.includes("?") ? "&" : "?"}recurso=${encodeURIComponent(
      recurso,
    )}&t=${Date.now()}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return { ok: false, itens: [], erro: `HTTP ${res.status}` };
    const dados = (await res.json()) as unknown;
    const bruto = Array.isArray(dados)
      ? dados
      : ((dados as { itens?: unknown; alertas?: unknown }).itens ??
        (dados as { alertas?: unknown }).alertas);
    const itens = (Array.isArray(bruto) ? bruto : [])
      .map(normalizar)
      .filter((i): i is T => i !== null);
    return { ok: true, itens };
  } catch (e) {
    return {
      ok: false,
      itens: [],
      erro: e instanceof Error ? e.message : "falha de rede",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Envia um item novo. Usa "no-cors" com corpo de formulário: a requisição
 * chega ao Apps Script sem exigir configuração de CORS no Google.
 */
export async function enviarItem(
  recurso: string,
  campos: Record<string, string>,
): Promise<{ ok: boolean; erro?: string }> {
  if (!planilhaAtiva()) return { ok: false, erro: "sem-endpoint" };
  const corpo = new URLSearchParams({ recurso, ...campos });
  try {
    await fetch(PLANILHA.endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: corpo.toString(),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "falha de rede" };
  }
}

/* ---------- cache local (para não abrir a página vazia) ---------- */

export function lerCache<T>(chave: string): T[] {
  try {
    const raw = localStorage.getItem(chave);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function gravarCache<T>(chave: string, itens: T[]): void {
  try {
    localStorage.setItem(chave, JSON.stringify(itens.slice(0, 200)));
  } catch {
    // armazenamento cheio — ignora
  }
}

/* ---------- e-mail de apoio (modo demonstração) ---------- */

export function montarEmail(destino: string, assunto: string, campos: string[]): string {
  const corpo = campos.filter(Boolean).join("\n");
  return `mailto:${destino}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

/** Testa uma URL de App da Web antes de ligá-la no site (usado pela equipe). */
export async function testarPlanilha(
  url: string,
  recurso = "alertas",
  timeoutMs = 12_000,
): Promise<{ ok: boolean; total: number; erro?: string }> {
  const alvo = url.trim();
  if (!alvo.startsWith("https://script.google.com/")) {
    return { ok: false, total: 0, erro: "a URL precisa começar com https://script.google.com/" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const base = alvo;
    const endereco = `${base}${base.includes("?") ? "&" : "?"}recurso=${encodeURIComponent(
      recurso,
    )}&t=${Date.now()}`;
    const res = await fetch(endereco, { signal: controller.signal });
    if (!res.ok) return { ok: false, total: 0, erro: `HTTP ${res.status}` };
    const dados = (await res.json()) as unknown;
    const bruto = Array.isArray(dados)
      ? dados
      : ((dados as { itens?: unknown }).itens ?? []);
    return { ok: true, total: Array.isArray(bruto) ? bruto.length : 0 };
  } catch (e) {
    return {
      ok: false,
      total: 0,
      erro: e instanceof Error ? e.message : "falha de rede",
    };
  } finally {
    clearTimeout(timer);
  }
}
