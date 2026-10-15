import {
  comoDataISO,
  comoNumero,
  comoTexto,
  comoTextoLongo,
  enviarItem,
  lerItens,
  planilhaAtiva,
  type RespostaItens,
} from "./planilha";

/*
 * Mapa de alerta — avisos rápidos da comunidade, sem verificação prévia.
 * Os dados vivem na mesma planilha do Google da área "A Ilha" (aba "Alertas")
 * e a equipe modera pela coluna "status" da planilha.
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
  /** Dias que um alerta fica no mapa antes de ser apagado. */
  validadeDias: 60,
};

/** A planilha (uma só) alimenta o mapa de alerta e a área "A Ilha". */
export const ALERTAS_CONECTADOS = planilhaAtiva();

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

/** Alertas fora do prazo saem do mapa sozinhos (igual à limpeza da planilha). */
export function normalizarAlerta(raw: unknown): Alerta | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const lat = comoNumero(r.lat);
  const lng = comoNumero(r.lng);
  const titulo = comoTexto(r.titulo, 140);
  if (!titulo || lat === null || lng === null) return null;
  const alerta: Alerta = {
    id: comoTexto(r.id, 60) || `${titulo}-${lat}-${lng}`,
    titulo,
    descricao: comoTextoLongo(r.descricao, 800),
    categoria: comoTexto(r.categoria, 40) || "outro",
    lat,
    lng,
    referencia: comoTexto(r.referencia, 180),
    contato: comoTexto(r.contato, 140) || undefined,
    criadoEm: comoDataISO(r.criadoEm ?? r.criado_em),
  };
  return alertaExpirado(alerta) ? null : alerta;
}

export type RespostaAlertas = RespostaItens<Alerta>;

/** Envia um alerta novo para a planilha. */
export async function enviarAlerta(
  novo: NovoAlerta,
): Promise<{ ok: boolean; erro?: string }> {
  return enviarItem("alertas", {
    titulo: novo.titulo,
    descricao: novo.descricao,
    categoria: novo.categoria,
    lat: String(novo.lat),
    lng: String(novo.lng),
    referencia: novo.referencia,
    contato: novo.contato ?? "",
  });
}

/** Lê a lista de alertas aprovados na planilha. */
export async function buscarAlertas(): Promise<RespostaAlertas> {
  return lerItens<Alerta>("alertas", normalizarAlerta);
}
