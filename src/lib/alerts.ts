/*
 * Mapa de alerta — avisos rápidos da comunidade, sem verificação prévia.
 *
 * Como funciona (custo zero):
 *  1. A equipe cria uma planilha no Google Sheets e cola lá o script que está
 *     em src/lib/alerts-script.ts;
 *  2. publica o script como App da Web (acesso: qualquer pessoa);
 *  3. cola a URL que termina em /exec em ALERTAS.endpoint aqui embaixo.
 *
 * O site envia o alerta por POST (modo "no-cors", sem depender de CORS) e lê a
 * lista por GET. Cada alerta sai do mapa sozinho depois de ALERTAS.validadeDias.
 */

export interface Alerta {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  lat: number;
  lng: number;
  referencia: string;
  contato?: string;
  criadoEm: string;
}

export interface NovoAlerta {
  titulo: string;
  descricao: string;
  categoria: string;
  lat: number;
  lng: number;
  referencia: string;
  contato?: string;
}

export const ALERTAS = {
  /** URL do App da Web da planilha (termina em /exec). Vazio = demonstração. */
  endpoint: "",
  /** Dias que um alerta fica no mapa antes de ser apagado. */
  validadeDias: 60,
};

export const ALERTAS_CONECTADOS = ALERTAS.endpoint.startsWith(
  "https://script.google.com/",
);

const CACHE_KEY = "nascfz-alertas-cache-v1";

function diasAtras(dias: number): string {
  return new Date(Date.now() - dias * 86_400_000).toISOString();
}

/** Exemplos do projeto-piloto, usados enquanto a planilha não está ligada. */
export const ALERTAS_EXEMPLO: Alerta[] = [
  {
    id: "ex1",
    titulo: "Lixo acumulado perto do trapiche",
    descricao:
      "Sacos de lixo e entulho acumulados desde o fim de semana. Cachorros estão espalhando pela via.",
    categoria: "residuos",
    lat: -8.0865,
    lng: -34.9025,
    referencia: "Perto do trapiche, entrada oeste",
    criadoEm: diasAtras(2),
  },
  {
    id: "ex2",
    titulo: "Cheiro forte de esgoto no canal",
    descricao:
      "Cheiro forte e água escura saindo de um cano na margem. Piora na maré baixa.",
    categoria: "esgoto",
    lat: -8.0858,
    lng: -34.9062,
    referencia: "Margem oeste do canal",
    criadoEm: diasAtras(4),
  },
  {
    id: "ex3",
    titulo: "Fumaça de queima durante a noite",
    descricao:
      "Alguém tem queimado galhada e lixo depois das 22h. A fumaça entra nas casas vizinhas.",
    categoria: "queimada",
    lat: -8.0876,
    lng: -34.9015,
    referencia: "Viela central",
    criadoEm: diasAtras(9),
  },
  {
    id: "ex4",
    titulo: "Água escura perto da foz",
    descricao: "Mancha escura avançando na água na saída do canal.",
    categoria: "poluicao",
    lat: -8.0845,
    lng: -34.903,
    referencia: "Foz do canal",
    criadoEm: diasAtras(15),
  },
];

export function alertaExpirado(a: Alerta, agora = Date.now()): boolean {
  const d = new Date(a.criadoEm).getTime();
  if (isNaN(d)) return false;
  return agora - d > ALERTAS.validadeDias * 86_400_000;
}

export function alertasVisiveis(lista: Alerta[]): Alerta[] {
  return lista
    .filter((a) => !alertaExpirado(a))
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export function lerCache(): Alerta[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Alerta[];
    return Array.isArray(parsed) ? alertasVisiveis(parsed) : [];
  } catch {
    return [];
  }
}

function gravarCache(lista: Alerta[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(lista.slice(0, 200)));
  } catch {
    // armazenamento cheio — ignora
  }
}

function normalizar(raw: unknown): Alerta | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const lat = Number(r.lat);
  const lng = Number(r.lng);
  const titulo = String(r.titulo ?? "").trim();
  if (!titulo || !isFinite(lat) || !isFinite(lng)) return null;
  return {
    id: String(r.id ?? `${titulo}-${lat}-${lng}`),
    titulo,
    descricao: String(r.descricao ?? "").trim(),
    categoria: String(r.categoria ?? "outro"),
    lat,
    lng,
    referencia: String(r.referencia ?? "").trim(),
    contato: r.contato ? String(r.contato) : undefined,
    criadoEm: String(r.criadoEm ?? new Date().toISOString()),
  };
}

export interface RespostaAlertas {
  ok: boolean;
  alertas: Alerta[];
  erro?: string;
}

/** Lê a lista de alertas aprovados na planilha. */
export async function buscarAlertas(
  endpoint: string = ALERTAS.endpoint,
  timeoutMs = 12_000,
): Promise<RespostaAlertas> {
  if (!endpoint) return { ok: false, alertas: [], erro: "sem-endpoint" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}t=${Date.now()}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return { ok: false, alertas: [], erro: `HTTP ${res.status}` };
    const data = (await res.json()) as unknown;
    const bruto = Array.isArray(data)
      ? data
      : (data as { alertas?: unknown })?.alertas;
    const alertas = (Array.isArray(bruto) ? bruto : [])
      .map(normalizar)
      .filter((a): a is Alerta => a !== null);
    gravarCache(alertas);
    return { ok: true, alertas: alertasVisiveis(alertas) };
  } catch (e) {
    return {
      ok: false,
      alertas: [],
      erro: e instanceof Error ? e.message : "falha de rede",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Envia um alerta novo para a planilha.
 * Usa "no-cors" com corpo de formulário: a requisição chega ao Apps Script sem
 * exigir configuração de CORS no Google.
 */
export async function enviarAlerta(
  novo: NovoAlerta,
): Promise<{ ok: boolean; erro?: string }> {
  if (!ALERTAS_CONECTADOS) return { ok: false, erro: "sem-endpoint" };
  const corpo = new URLSearchParams({
    titulo: novo.titulo,
    descricao: novo.descricao,
    categoria: novo.categoria,
    lat: String(novo.lat),
    lng: String(novo.lng),
    referencia: novo.referencia,
    contato: novo.contato ?? "",
  });
  try {
    await fetch(ALERTAS.endpoint, {
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
