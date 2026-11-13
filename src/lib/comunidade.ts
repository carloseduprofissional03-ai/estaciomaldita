import { TEAM_CONTACT_EMAIL } from "./site";
import { IMG } from "./images";

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
  /** Cor do cabeçalho ou da etiqueta do card. */
  cor: string;
  /** Caminho ou URL da foto representativa exibida no topo do card. */
  imagemUrl?: string;
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
    imagemUrl: "/images/ponto-manguezal-garca.jpg",
  },
  {
    id: "p2",
    titulo: "Trapiche e foz do canal",
    etiqueta: "Mirante",
    descricao:
      "Ponto de encontro do projeto e melhor vista do pôr do sol: de lá se vê o canal, o mangue e a cidade ao fundo refletidos nas águas da maré.",
    cor: "#2f7fc0",
    imagemUrl: "/images/ponto-manguezal-sol.jpg",
  },
  {
    id: "p3",
    titulo: "Vila e praça da Ilha de Deus",
    etiqueta: "Convivência",
    descricao:
      "O centro da vida social da ilha: casas coloridas, praça circular na beira da água, conversa na porta de casa e a acolhida dos moradores.",
    cor: "#e08a2e",
    imagemUrl: "/images/ponto-vista-aerea-ilha.jpg",
  },
  {
    id: "p4",
    titulo: "Escola e horta comunitária",
    etiqueta: "Educação",
    descricao:
      "Horta cuidada pelas crianças e oficinas de educação ambiental junto ao projeto Da Nascente à Foz.",
    cor: "#7c5cd6",
    imagemUrl: IMG.reuniao,
  },
  {
    id: "p5",
    titulo: "Associação de pescadores e tradição",
    etiqueta: "Cultura",
    descricao:
      "A pesca e a aquicultura artesanal que sustentam as famílias da comunidade há gerações, preservando a identidade dos trabalhadores das águas.",
    cor: "#c2543f",
    imagemUrl: "/images/comunidade-associacao-pescadores.jpg",
  },
  {
    id: "p6",
    titulo: "Caminhos de madeira e palafitas",
    etiqueta: "Paisagem",
    descricao:
      "As passarelas entre as casas suspensas sobre a água e as canoas tradicionais atracadas — o jeito próprio de viver e navegar na Ilha de Deus.",
    cor: "#1c6b8c",
    imagemUrl: "/images/ponto-barco-palafitas.jpg",
  },
];

export const CULINARIA: PontoComunidade[] = [
  {
    id: "c1",
    titulo: "Peixada e peixe frito da maré",
    etiqueta: "Prato principal",
    descricao:
      "Peixe fresco do canal preparado com carinho, servido com salada fresca, pirão e tempero verde da horta. Prato dos almoços de domingo e dos mutirões.",
    cor: "#1c6b8c",
    imagemUrl: "/images/culinaria-peixe-frito.jpg",
  },
  {
    id: "c2",
    titulo: "Pescados e crustáceos da APA",
    etiqueta: "Do mangue",
    descricao:
      "Camarão, caranguejo e pescados frescos da Associação de Pescadores e Aquicultores Tradicionais, colhidos com respeito ao defeso e ao ritmo da maré.",
    cor: "#e08a2e",
    imagemUrl: "/images/comunidade-associacao-pescadores.jpg",
  },
  {
    id: "c3",
    titulo: "Bolos e doces de tapioca",
    etiqueta: "Cozinha da casa",
    descricao:
      "Bolo de mandioca, tapioca e coco feitos nas cozinhas da comunidade — os doces que aparecem nas reuniões e nas festas da ilha.",
    cor: "#d1453b",
    imagemUrl: IMG.reuniao,
  },
  {
    id: "c4",
    titulo: "Farinha e beiju da casa de farinha",
    etiqueta: "Tradição",
    descricao:
      "A mandioca trabalhada do jeito antigo: farinha torrada e beiju quentinho, feitos em mutirão pelas famílias.",
    cor: "#c2543f",
    imagemUrl: IMG.comunidade,
  },
  {
    id: "c5",
    titulo: "Café da manhã do mutirão",
    etiqueta: "Encontro",
    descricao:
      "Cuscuz, café, bolo e fruta antes de começar a limpeza do canal. O lanche coletivo é parte do mutirão.",
    cor: "#2e9e63",
    imagemUrl: IMG.mutirao,
  },
  {
    id: "c6",
    titulo: "Peixe na folha de bananeira",
    etiqueta: "Quintal",
    descricao:
      "Preparo tradicional assado na folha, feito nos quintais quando a pesca do dia rende mais.",
    cor: "#2f7fc0",
    imagemUrl: "/images/culinaria-peixe-frito.jpg",
  },
];

export const ARTESANATO: PontoComunidade[] = [
  {
    id: "a1",
    titulo: "Fibra de palha, conchas e móbiles",
    etiqueta: "Grupo de artesãs",
    descricao:
      "Móbiles, filtros dos sonhos, cestos e peças de parede e mesa feitos com palha trançada e conchinhas de marisco colhidas no manguezal.",
    cor: "#e08a2e",
    imagemUrl: "/images/artesanato-conchas-palha.jpg",
  },
  {
    id: "a2",
    titulo: "Canoas artesanais e miniaturas",
    etiqueta: "Madeira",
    descricao:
      "Tradição dos carpinteiros navais da comunidade: canoas de madeira autênticas e réplicas em miniatura das embarcações e palafitas da ilha.",
    cor: "#1c6b8c",
    imagemUrl: "/images/ponto-barco-palafitas.jpg",
  },
  {
    id: "a3",
    titulo: "Biojoias de sementes e conchas",
    etiqueta: "Acessórios",
    descricao:
      "Colares, brincos e pulseiras com sementes, conchas e materiais recolhidos com respeito e sem dano ao mangue.",
    cor: "#2e9e63",
    imagemUrl: "/images/artesanato-conchas-palha.jpg",
  },
  {
    id: "a4",
    titulo: "Tecido reaproveitado",
    etiqueta: "Costura",
    descricao:
      "Peças de vestir e de casa costuradas a partir de tecido reutilizado — criatividade contra o desperdício.",
    cor: "#7c5cd6",
    imagemUrl: IMG.comunidade,
  },
  {
    id: "a5",
    titulo: "Bordado com memória da ilha",
    etiqueta: "Bordado",
    descricao:
      "Bordados que desenham a paisagem da ilha, o mangue e as histórias contadas pelas moradoras mais antigas.",
    cor: "#d1453b",
    imagemUrl: IMG.mangue,
  },
  {
    id: "a6",
    titulo: "Rede de pesca e nós tradicionais",
    etiqueta: "Pesca",
    descricao:
      "Rede, corda e anzol viram peças decorativas na mão de pescadores que conhecem cada nó do ofício.",
    cor: "#c2543f",
    imagemUrl: "/images/ponto-barco-palafitas.jpg",
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
