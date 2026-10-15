import {
  comoDataISO,
  comoTexto,
  comoTextoLongo,
  enviarItem,
} from "./planilha";
import type { SecaoConfig } from "./planilha-recurso";
import { daysSince } from "./format";

/*
 * Área "A Ilha" — a plataforma de autogestão da comunidade.
 * Primeiras seções: avisos da comunidade e diretório de instituições e ONGs.
 * Tudo guardado na mesma planilha do Google do mapa de alerta (custo zero).
 */

export const ILHA = {
  /** Avisos sem data de validade saem do ar depois deste prazo. */
  validadeAvisoDias: 45,
};

/* ---------- avisos ---------- */

export interface Aviso {
  id: string;
  titulo: string;
  texto: string;
  publicadoPor: string;
  contato?: string;
  /** Data limite (ISO). Depois dela o aviso sai do ar. */
  ate?: string;
  criadoEm: string;
}

export function avisoVencido(a: Aviso, agora = Date.now()): boolean {
  if (a.ate) {
    const d = new Date(a.ate).getTime();
    if (!isNaN(d)) return d < agora;
  }
  return daysSince(a.criadoEm) > ILHA.validadeAvisoDias;
}

export function normalizarAviso(raw: unknown): Aviso | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const titulo = comoTexto(r.titulo, 140);
  if (!titulo) return null;
  const aviso: Aviso = {
    id: comoTexto(r.id, 60) || `aviso_${titulo}`,
    titulo,
    texto: comoTextoLongo(r.texto, 900),
    publicadoPor: comoTexto(r.publicadoPor ?? r.publicado_por, 120),
    contato: comoTexto(r.contato, 140) || undefined,
    ate: r.ate ? comoDataISO(r.ate) : undefined,
    criadoEm: comoDataISO(r.criadoEm ?? r.criado_em),
  };
  return avisoVencido(aviso) ? null : aviso;
}

/* ---------- instituições e ONGs ---------- */

export interface Instituicao {
  id: string;
  nome: string;
  tipo: string;
  descricao: string;
  publico?: string;
  referencia?: string;
  horarios?: string;
  contato?: string;
  comoAjudar?: string;
  criadoEm: string;
}

export const TIPOS_INSTITUICAO = [
  { id: "associacao", label: "Associação de moradores" },
  { id: "ong", label: "ONG ou projeto social" },
  { id: "igreja", label: "Igreja e pastoral social" },
  { id: "escola", label: "Escola e educação" },
  { id: "coletivo", label: "Coletivo cultural" },
  { id: "saude", label: "Saúde e cuidado" },
  { id: "poder_publico", label: "Serviço público" },
  { id: "outro", label: "Outro" },
];

export function tipoInstituicao(id: string) {
  return (
    TIPOS_INSTITUICAO.find((t) => t.id === id) ?? {
      id: "outro",
      label: "Outro",
    }
  );
}

export function normalizarInstituicao(raw: unknown): Instituicao | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const nome = comoTexto(r.nome, 140);
  if (!nome) return null;
  return {
    id: comoTexto(r.id, 60) || `inst_${nome}`,
    nome,
    tipo: comoTexto(r.tipo, 40) || "outro",
    descricao: comoTextoLongo(r.descricao, 1200),
    publico: comoTexto(r.publico, 180) || undefined,
    referencia: comoTexto(r.referencia, 180) || undefined,
    horarios: comoTexto(r.horarios, 180) || undefined,
    contato: comoTexto(r.contato, 140) || undefined,
    comoAjudar: comoTextoLongo(r.comoAjudar ?? r.como_ajudar, 600) || undefined,
    criadoEm: comoDataISO(r.criadoEm ?? r.criado_em),
  };
}

/* ---------- exemplos do piloto (enquanto a planilha não está ligada) ---------- */

function diasAtras(dias: number): string {
  return new Date(Date.now() - dias * 86_400_000).toISOString();
}

function daquiA(dias: number): string {
  return new Date(Date.now() + dias * 86_400_000).toISOString();
}

export const AVISOS_EXEMPLO: Aviso[] = [
  {
    id: "av1",
    titulo: "Mutirão de limpeza no próximo sábado",
    texto:
      "Concentração às 8h no trapiche, saída para a margem do canal. Leve boné e luva; sacos, água e lanche são do projeto. Quem tiver canoa ajuda no trecho da foz.",
    publicadoPor: "Equipe Da Nascente à Foz",
    ate: daquiA(12),
    criadoEm: diasAtras(1),
  },
  {
    id: "av2",
    titulo: "Reunião da associação de moradores",
    texto:
      "Pauta: coleta de lixo na viela central, iluminação pública e organização do mutirão de novembro. A participação de todos é muito bem-vinda.",
    publicadoPor: "Associação de moradores",
    contato: "(81) 9 9999-0001",
    ate: daquiA(9),
    criadoEm: diasAtras(2),
  },
  {
    id: "av3",
    titulo: "Atendimento de saúde na escola da comunidade",
    texto:
      "Equipe de saúde atende das 8h às 14h, com vacina de rotina para crianças e adultos e aferição de pressão. Levar o cartão de vacinação, se tiver.",
    publicadoPor: "Posto de saúde",
    contato: "(81) 9 9999-0002",
    ate: daquiA(5),
    criadoEm: diasAtras(4),
  },
];

export const INSTITUICOES_EXEMPLO: Instituicao[] = [
  {
    id: "in1",
    nome: "Associação de moradores da Ilha de Deus",
    tipo: "associacao",
    descricao:
      "Representa a comunidade nas pautas de moradia, saneamento e coleta de resíduos, organiza as reuniões mensais e apoia os mutirões do projeto.",
    publico: "Todas as famílias da ilha",
    referencia: "Sede ao lado do campo de futebol",
    horarios: "Reuniões na última quinta do mês, às 19h",
    contato: "(81) 9 9999-0001",
    comoAjudar: "Participar das reuniões e apoiar a organização dos mutirões.",
    criadoEm: diasAtras(120),
  },
  {
    id: "in2",
    nome: "Grupo de artesãs do mangue",
    tipo: "coletivo",
    descricao:
      "Coletivo de mulheres que produz artesanato com fibra de palha, conchas e tecido reaproveitado, gerando renda para as famílias da comunidade.",
    publico: "Mulheres da comunidade",
    referencia: "Casa de farinha, rua principal",
    horarios: "Terças e quintas, das 14h às 17h",
    contato: "(81) 9 9999-0003",
    comoAjudar: "Comprar o artesanato e divulgar o trabalho do grupo.",
    criadoEm: diasAtras(95),
  },
  {
    id: "in3",
    nome: "Pastoral social da comunidade",
    tipo: "igreja",
    descricao:
      "Acolhe famílias em situação de vulnerabilidade, organiza doações de alimentos e apoia emergências em períodos de chuva forte e maré alta.",
    publico: "Famílias em vulnerabilidade",
    referencia: "Igreja da comunidade, viela central",
    horarios: "Atendimento nas quartas e sextas, das 9h às 12h",
    contato: "(81) 9 9999-0004",
    comoAjudar: "Doar alimentos, roupas e material de limpeza.",
    criadoEm: diasAtras(80),
  },
  {
    id: "in4",
    nome: "Escola municipal da comunidade",
    tipo: "escola",
    descricao:
      "Ensino fundamental e atividades de contraturno, com horta escolar e projeto de educação ambiental junto ao Da Nascente à Foz.",
    publico: "Crianças e adolescentes da ilha",
    referencia: "Ao lado do campo de futebol",
    horarios: "Segunda a sexta, das 7h às 17h",
    contato: "(81) 9 9999-0005",
    comoAjudar: "Ser voluntário nas oficinas e nas ações da horta.",
    criadoEm: diasAtras(60),
  },
  {
    id: "in5",
    nome: "Coletivo jovem de comunicação",
    tipo: "coletivo",
    descricao:
      "Jovens que registram o dia a dia da ilha em vídeo e redes sociais, com oficinas de fotografia, edição e podcast para a comunidade.",
    publico: "Jovens da comunidade",
    referencia: "Sede da associação de moradores",
    horarios: "Sábados, das 10h às 13h",
    contato: "(81) 9 9999-0006",
    comoAjudar: "Emprestar equipamento ou dar oficinas.",
    criadoEm: diasAtras(45),
  },
];

/* ---------- formulários (usados pela seção genérica) ---------- */

export const SECAO_AVISOS: SecaoConfig<Aviso> = {
  recurso: "avisos",
  titulo: "Avisos da comunidade",
  subtitulo:
    "O mural da ilha: mutirões, reuniões, atendimentos e recados de quem organiza as coisas por aqui.",
  nota: "Avisos são publicados direto pela comunidade, sem verificação prévia, e saem do ar sozinhos no prazo indicado. A equipe remove o que for ofensivo ou falso.",
  rotuloEnviar: "Publicar aviso",
  campos: [
    {
      nome: "titulo",
      label: "Título do aviso",
      placeholder: "Ex.: Reunião da associação na quinta",
      obrigatorio: true,
      dica: "Curto e direto",
    },
    {
      nome: "texto",
      label: "O que você quer avisar?",
      tipo: "area",
      placeholder:
        "Diga o que vai acontecer, quando, onde e o que as pessoas precisam levar.",
      obrigatorio: true,
    },
    {
      nome: "publicado_por",
      label: "Quem está publicando",
      placeholder: "Associação, escola, coletivo, morador…",
      obrigatorio: true,
    },
    {
      nome: "contato",
      label: "Contato (opcional)",
      placeholder: "WhatsApp ou e-mail para dúvidas",
    },
    {
      nome: "ate",
      label: "Válido até",
      tipo: "data",
      dica: "Depois dessa data o aviso sai do ar",
    },
  ],
  montarItem: (c) => ({
    id: `local_${Date.now()}`,
    titulo: c.titulo,
    texto: c.texto,
    publicadoPor: c.publicado_por,
    contato: c.contato || undefined,
    ate: c.ate ? new Date(`${c.ate}T12:00:00`).toISOString() : undefined,
    criadoEm: new Date().toISOString(),
  }),
};

export const SECAO_INSTITUICOES: SecaoConfig<Instituicao> = {
  recurso: "instituicoes",
  titulo: "Instituições e ONGs da ilha",
  subtitulo:
    "Quem já trabalha aqui: associações, projetos sociais, igrejas, escola e coletivos — com contato direto e como ajudar.",
  nota: "Cada instituição entra no site com autorização. Se a sua ficou de fora ou mudou de contato, use o formulário abaixo.",
  rotuloEnviar: "Cadastrar instituição",
  filtro: { campo: "tipo", opcoes: TIPOS_INSTITUICAO },
  campos: [
    {
      nome: "nome",
      label: "Nome da instituição",
      placeholder: "Ex.: Associação de moradores da Ilha de Deus",
      obrigatorio: true,
    },
    {
      nome: "tipo",
      label: "Tipo",
      tipo: "selecao",
      opcoes: TIPOS_INSTITUICAO,
      obrigatorio: true,
    },
    {
      nome: "descricao",
      label: "O que ela faz",
      tipo: "area",
      placeholder: "Em poucas linhas: o trabalho, quem procura e o que oferece.",
      obrigatorio: true,
    },
    {
      nome: "publico",
      label: "Quem ela atende",
      placeholder: "Ex.: crianças, famílias, mulheres, jovens",
    },
    {
      nome: "referencia",
      label: "Onde fica",
      placeholder: "Ponto de referência dentro da ilha",
    },
    { nome: "horarios", label: "Dias e horários de atendimento" },
    {
      nome: "contato",
      label: "Contato",
      placeholder: "WhatsApp, telefone ou e-mail (com autorização)",
    },
    {
      nome: "como_ajudar",
      label: "Como ajudar (opcional)",
      tipo: "area",
      placeholder: "Doações, voluntariado, oficinas, material…",
    },
  ],
  montarItem: (c) => ({
    id: `local_${Date.now()}`,
    nome: c.nome,
    tipo: c.tipo || "outro",
    descricao: c.descricao,
    publico: c.publico || undefined,
    referencia: c.referencia || undefined,
    horarios: c.horarios || undefined,
    contato: c.contato || undefined,
    comoAjudar: c.como_ajudar || undefined,
    criadoEm: new Date().toISOString(),
  }),
};

/* ---------- envio ---------- */

export async function publicarAviso(campos: Record<string, string>) {
  return enviarItem("avisos", campos);
}

export async function publicarInstituicao(campos: Record<string, string>) {
  return enviarItem("instituicoes", campos);
}
