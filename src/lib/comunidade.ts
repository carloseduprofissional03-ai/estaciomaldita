import { TEAM_CONTACT_EMAIL } from "./site";

/*
 * Mangue & Comunidade e Agendar Visita.
 * Conteúdo curado pela equipe do projeto (pontos, culinária, artesanato e
 * roteiros de visita). Quando a comunidade quiser publicar isso sozinha, estes
 * itens podem migrar para a planilha compartilhada, como já acontece com os
 * avisos e o diretório de instituições.
 */

export interface PontoComunidade {
  id: string;
  titulo: string;
  etiqueta: string;
  descricao: string;
  /** Cor do cabeçalho do card (mesma paleta dos marcadores do mapa). */
  cor: string;
}

export interface RoteiroVisita {
  id: string;
  titulo: string;
  duracao: string;
  grupo: string;
  descricao: string;
  cor: string;
}

export const PONTOS: PontoComunidade[] = [
  {
    id: "p1",
    titulo: "Manguezal da margem norte",
    etiqueta: "Natureza",
    descricao:
      "Trilha leve por dentro do mangue com moradores da comunidade, explicando por que o manguezal é o berçário dos peixes e caranguejos da Bacia do Pina.",
    cor: "#2e9e63",
  },
  {
    id: "p2",
    titulo: "Trapiche e foz do canal",
    etiqueta: "Mirante",
    descricao:
      "Ponto de encontro do projeto e melhor vista do pôr do sol: de lá se vê o canal, o mangue e a cidade ao fundo.",
    cor: "#2f7fc0",
  },
  {
    id: "p3",
    titulo: "Campo de futebol e vila",
    etiqueta: "Convivência",
    descricao:
      "O centro da vida social da ilha: pelada no fim da tarde, cadeira na porta de casa e conversa sobre o que a comunidade precisa.",
    cor: "#e08a2e",
  },
  {
    id: "p4",
    titulo: "Escola e horta comunitária",
    etiqueta: "Educação",
    descricao:
      "Horta cuidada pelas crianças e oficinas de educação ambiental junto ao projeto Da Nascente à Foz.",
    cor: "#7c5cd6",
  },
  {
    id: "p5",
    titulo: "Casa de farinha",
    etiqueta: "Cultura",
    descricao:
      "Onde se aprende o preparo da farinha de mandioca e onde as cozinhas da comunidade se reúnem nos mutirões.",
    cor: "#c2543f",
  },
  {
    id: "p6",
    titulo: "Caminhos de madeira",
    etiqueta: "Paisagem",
    descricao:
      "As passarelas entre as casas suspensas sobre a água — o jeito próprio de andar na Ilha de Deus.",
    cor: "#1c6b8c",
  },
];

export const CULINARIA: PontoComunidade[] = [
  {
    id: "c1",
    titulo: "Peixada da maré",
    etiqueta: "Prato principal",
    descricao:
      "Peixe fresco do canal cozido com pirão, tempero verde e o que a horta do quintal oferece. Prato dos almoços de domingo e dos mutirões.",
    cor: "#1c6b8c",
  },
  {
    id: "c2",
    titulo: "Caranguejo e crustáceos",
    etiqueta: "Do mangue",
    descricao:
      "Caranguejo e siri capturados com respeito ao período de defeso e cozidos no tempero da casa. Sabor que vem direto do manguezal.",
    cor: "#e08a2e",
  },
  {
    id: "c3",
    titulo: "Bolos e doces de tapioca",
    etiqueta: "Cozinha da casa",
    descricao:
      "Bolo de mandioca, tapioca e coco feitos nas cozinhas da comunidade — os doces que aparecem nas reuniões e nas festas da ilha.",
    cor: "#d1453b",
  },
  {
    id: "c4",
    titulo: "Farinha e beiju da casa de farinha",
    etiqueta: "Tradição",
    descricao:
      "A mandioca trabalhada do jeito antigo: farinha torrada e beiju quentinho, feitos em mutirão pelas famílias.",
    cor: "#c2543f",
  },
  {
    id: "c5",
    titulo: "Café da manhã do mutirão",
    etiqueta: "Encontro",
    descricao:
      "Cuscuz, café, bolo e fruta antes de começar a limpeza do canal. O lanche coletivo é parte do mutirão.",
    cor: "#2e9e63",
  },
  {
    id: "c6",
    titulo: "Peixe na folha de bananeira",
    etiqueta: "Quintal",
    descricao:
      "Preparo tradicional assado na folha, feito nos quintais quando a pesca do dia rende mais.",
    cor: "#2f7fc0",
  },
];

export const ARTESANATO: PontoComunidade[] = [
  {
    id: "a1",
    titulo: "Fibra de palha, conchas e tecido",
    etiqueta: "Grupo de artesãs",
    descricao:
      "Bolsas, cestos e peças de mesa feitas por um coletivo de mulheres da comunidade com material reaproveitado do próprio território.",
    cor: "#e08a2e",
  },
  {
    id: "a2",
    titulo: "Miniaturas de canoa e palafita",
    etiqueta: "Madeira",
    descricao:
      "Réplicas em madeira das canoas e das casas de palafita da ilha, feitas por moradores que aprenderam o ofício em casa.",
    cor: "#1c6b8c",
  },
  {
    id: "a3",
    titulo: "Biojoias de sementes e conchas",
    etiqueta: "Acessórios",
    descricao:
      "Colares, brincos e pulseiras com sementes, conchas e materiais recolhidos sem dano ao mangue.",
    cor: "#2e9e63",
  },
  {
    id: "a4",
    titulo: "Tecido reaproveitado",
    etiqueta: "Costura",
    descricao:
      "Peças de vestir e de casa costuradas a partir de tecido reutilizado — criatividade contra o desperdício.",
    cor: "#7c5cd6",
  },
  {
    id: "a5",
    titulo: "Bordado com memória da ilha",
    etiqueta: "Bordado",
    descricao:
      "Bordados que desenham a paisagem da ilha, o mangue e as histórias contadas pelas moradoras mais antigas.",
    cor: "#d1453b",
  },
  {
    id: "a6",
    titulo: "Rede de pesca que virou arte",
    etiqueta: "Pesca",
    descricao:
      "Rede, corda e anzol viram peças decorativas na mão de pescadores que conhecem cada nó do ofício.",
    cor: "#c2543f",
  },
];

export const ROTEIROS: RoteiroVisita[] = [
  {
    id: "r1",
    titulo: "Trilha do mangue",
    duracao: "cerca de 2 horas",
    grupo: "até 12 pessoas",
    descricao:
      "Caminhada leve pela margem do manguezal com guias da comunidade, explicando a fauna, o ciclo da maré e o trabalho de recuperação da área.",
    cor: "#2e9e63",
  },
  {
    id: "r2",
    titulo: "Foz e pôr do sol no trapiche",
    duracao: "cerca de 1h30",
    grupo: "até 20 pessoas",
    descricao:
      "Encontro no trapiche para conhecer o projeto, ver a foz do canal e acompanhar o pôr do sol sobre a Bacia do Pina.",
    cor: "#2f7fc0",
  },
  {
    id: "r3",
    titulo: "Roda de conversa e artesanato",
    duracao: "cerca de 2 horas",
    grupo: "até 15 pessoas",
    descricao:
      "Conversa com moradoras e artesãs, visita à casa de farinha e contato direto com o artesanato feito na ilha.",
    cor: "#e08a2e",
  },
];

export const INFO_PRATICA = [
  {
    titulo: "Quem recebe",
    texto:
      "As visitas são conduzidas por moradores e moradoras da própria comunidade, junto com a equipe do projeto.",
  },
  {
    titulo: "Melhor horário",
    texto:
      "Manhã cedo ou fim da tarde, na maré baixa — é quando dá para andar pela margem com segurança.",
  },
  {
    titulo: "O que levar",
    texto:
      "Água, boné, protetor solar e calçado fechado. Câmera e binóculo são bem-vindos.",
  },
  {
    titulo: "Ponto de encontro",
    texto:
      "Trapiche de acesso à Ilha de Deus, combinado na conversa pelo WhatsApp.",
  },
  {
    titulo: "Acessibilidade",
    texto:
      "Parte do percurso é em passarela de madeira. Avise no WhatsApp se alguém do grupo precisa de adaptação.",
  },
  {
    titulo: "Cuidado com o mangue",
    texto:
      "Não deixamos resíduos e não recolhemos conchas, mudas ou bichos: a visita acontece sem impacto.",
  },
];

/*
 * Canais de contato da comunidade.
 * Preencha com os dados oficiais da associação e do projeto para os botões
 * entrarem no ar (o site avisa, sem link falso, enquanto estiverem vazios).
 */
export const CONTATO_COMUNIDADE = {
  /** Só números, com DDI e DDD. Ex.: "5581999990000". */
  whatsapp: "",
  /** Usuário do Instagram, sem @. Ex.: "ilhadededeus". */
  instagram: "",
  email: TEAM_CONTACT_EMAIL,
};

export const MSG_VISITA_PADRAO =
  "Olá! Vi o site da Ilha de Deus e quero agendar uma visita. Podemos combinar uma data?";

export function msgRoteiro(titulo: string) {
  return `Olá! Vi o site da Ilha de Deus e tenho interesse no roteiro "${titulo}". Podemos combinar uma data?`;
}
