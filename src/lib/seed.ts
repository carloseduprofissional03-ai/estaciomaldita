import type { AppDB } from "./types";
import { IMG } from "./images";

// Conteúdo do site (versão sem nuvem). Os mutirões são definidos pela equipe
// do projeto e ficam fixos aqui; quando um novo mutirão for publicado, ele é
// adicionado neste arquivo.

export function buildSeedDb(): AppDB {
  return {
    reports: [
      {
        id: "r1",
        category: "residuos",
        title: "Entulho despejado na Rua São Marcos",
        description:
          "Grande quantidade de entulho e restos de obra foi despejada na beirada da via, próxima ao canal. Moradores relatam que o descarte ocorreu durante a madrugada.",
        reference: "Rua São Marcos, próximo ao canal",
        lat: -8.08795,
        lng: -34.90512,
        photoUrl: IMG.residuos,
        status: "approved",
        resolved: true,
        resolutionNote:
          "Equipe da limpeza urbana retirou o entulho após a denúncia encaminhada pelo projeto. Local segue monitorado.",
        createdAt: "2026-01-18T11:20:00.000Z",
      },
      {
        id: "r2",
        category: "esgoto",
        title: "Esgoto a céu aberto desaguando no mangue",
        description:
          "Um cano com vazamento constante despeja esgoto direto na área de mangue, formando uma poça de odor forte que atinge o rio na maré baixa.",
        reference: "Margem do canal, lado oeste da ilha",
        lat: -8.0851,
        lng: -34.9056,
        status: "approved",
        resolved: false,
        createdAt: "2026-02-09T14:02:00.000Z",
      },
      {
        id: "r3",
        category: "residuos",
        title: "Acúmulo de lixo doméstico atrás do campo",
        description:
          "Ponto constante de descarte irregular de lixo doméstico atrás do campo de futebol. Cachorros espalham o lixo e atraem vetores.",
        reference: "Campo de futebol da comunidade",
        lat: -8.0886,
        lng: -34.9021,
        status: "approved",
        resolved: true,
        resolutionNote:
          "Mutirão da comunidade recolheu o lixo e a equipe instalou placa de conscientização. Novo ponto de coleta foi solicitado à prefeitura.",
        createdAt: "2026-03-14T09:40:00.000Z",
      },
      {
        id: "r4",
        category: "poluicao",
        title: "Mancha escura na água do canal",
        description:
          "Mancha escura e com cheiro de combustível apareceu na água do canal principal. Possível descarte de óleo por embarcação na madrugada.",
        reference: "Canal principal, trecho central",
        lat: -8.0846,
        lng: -34.9013,
        status: "approved",
        resolved: false,
        createdAt: "2026-04-02T16:30:00.000Z",
      },
      {
        id: "r5",
        category: "mangue",
        title: "Corte de vegetação de mangue em área de APP",
        description:
          "Vegetação nativa de mangue foi cortada em uma área considerável, provavelmente para ampliação de um aterro. Risco de erosão e perda de berçário da fauna.",
        reference: "Trecho sul do manguezal",
        lat: -8.089,
        lng: -34.9036,
        photoUrl: IMG.mangue,
        status: "approved",
        resolved: false,
        createdAt: "2026-05-21T10:15:00.000Z",
      },
      {
        id: "r6",
        category: "ocupacao",
        title: "Aterro avançando sobre área alagada",
        description:
          "Novo aterro com resíduos de construção avança sobre a área alagada na porção leste da ilha, reduzindo o espelho d'água que regula as cheias.",
        reference: "Porção leste da ilha",
        lat: -8.0862,
        lng: -34.9007,
        status: "approved",
        resolved: true,
        resolutionNote:
          "Ocupação identificada e notificada aos órgãos de fiscalização. O avanço do aterro foi interrompido enquanto a situação é avaliada.",
        createdAt: "2026-06-11T08:50:00.000Z",
      },
      {
        id: "r7",
        category: "residuos",
        title: "Restos de construção na beirada do mangue",
        description:
          "Novo despejo de restos de construção na beirada do mangue, a poucos metros da água. Comunidade pede fiscalização noturna.",
        reference: "Beirada do mangue, acesso oeste",
        lat: -8.088,
        lng: -34.904,
        status: "approved",
        resolved: false,
        createdAt: "2026-07-30T18:05:00.000Z",
      },
      {
        id: "r8",
        category: "residuos",
        title: "Lixo acumulado na foz do canal",
        description:
          "Materiais plásticos e embalagens se acumulam na foz do canal após as marés altas, vindos do trecho urbano a montante.",
        reference: "Foz do canal, extremo norte",
        lat: -8.0849,
        lng: -34.9029,
        status: "approved",
        resolved: true,
        resolutionNote:
          "Ação de limpeza com voluntários retirou cerca de 60 sacos de resíduos. Estudo de barreira de contenção em andamento.",
        createdAt: "2026-08-15T07:20:00.000Z",
      },
      {
        id: "r9",
        category: "queimada",
        title: "Queima de lixo próxima às casas",
        description:
          "Fumaça intensa vinda da queima de lixo e galhadas perto das casas de madeira. Crianças e idosos passam mal com a fumaça.",
        reference: "Viela central, entre as casas",
        lat: -8.0873,
        lng: -34.9012,
        status: "pending",
        resolved: false,
        createdAt: "2026-09-01T13:10:00.000Z",
      },
      {
        id: "r10",
        category: "residuos",
        title: "Novo ponto de descarte em via de acesso",
        description:
          "Sofás velhos e entulho foram abandonados na via de acesso à comunidade, dificultando a passagem e acumulando água da chuva.",
        reference: "Via de acesso à comunidade",
        lat: -8.0857,
        lng: -34.9038,
        status: "pending",
        resolved: false,
        createdAt: "2026-09-02T09:25:00.000Z",
      },
    ],
    events: [
      {
        id: "e1",
        title: "Mutirão de limpeza do canal do Pina",
        description:
          "Mutirão mensal para retirar resíduos das margens do canal e da foz. Material será separado: recicláveis seguem para a associação, orgânicos para compostagem comunitária. Leve luvas, nós oferecemos sacos e lanche coletivo.",
        locationName: "Ponte de acesso à Ilha de Deus",
        date: "2026-09-19",
        startTime: "08:00",
        endTime: "11:30",
        volunteersTarget: 30,
        signupCount: 10,
        proposerName: "Equipe Da Nascente à Foz",
        status: "approved",
        createdAt: "2026-08-20T10:00:00.000Z",
      },
      {
        id: "e2",
        title: "Plantio de mudas de mangue na margem norte",
        description:
          "Oficina de educação ambiental seguida de plantio de mudas de mangue-vermelho na margem norte, em área antes degradada. Acompanhamento trimestral das mudas pelos moradores.",
        locationName: "Margem norte da ilha",
        date: "2026-10-03",
        startTime: "08:30",
        endTime: "11:00",
        volunteersTarget: 20,
        signupCount: 2,
        proposerName: "Equipe Da Nascente à Foz",
        status: "approved",
        createdAt: "2026-09-01T09:00:00.000Z",
      },
      {
        id: "e3",
        title: "Roda de conversa: coleta seletiva na escola",
        description:
          "Encontro com pais e alunos para organizar a coleta seletiva dentro da escola da comunidade e criar uma brigada jovem de fiscalização ambiental.",
        locationName: "Escola da comunidade",
        date: "2026-10-10",
        startTime: "14:00",
        endTime: "16:00",
        volunteersTarget: 25,
        signupCount: 0,
        proposerName: "Vicente (morador)",
        proposerContact: "(81) 9 9999-0001",
        status: "pending",
        createdAt: "2026-09-02T15:00:00.000Z",
      },
    ],
    news: [
      {
        id: "n1",
        title: "Mutirão de agosto recolhe mais de 300 kg de resíduos do mangue",
        summary:
          "Moradores e voluntários retiraram plástico, entulho e material reciclável das margens do canal. Recicláveis já seguem para a renda da associação comunitária.",
        body: `No último sábado, a comunidade da Ilha de Deus se reuniu mais uma vez na margem do canal para o mutirão mensal de limpeza. Ao todo, mais de 300 kg de resíduos foram recolhidos — entre plásticos, vidros, embalagens e restos de construção.

O mutirão faz parte do projeto Da Nascente à Foz, que une moradores, estudantes e voluntários em torno de uma ideia simples: quem vive o território é quem melhor o protege. Os materiais recicláveis foram separados e destinados à associação comunitária, que os comercializa.

Para dona Maria das Graças, moradora há 40 anos, cada mutirão é também um encontro. “A gente limpa, mas também conversa, troca ideia, vê o que a comunidade precisa. O rio é nosso quintal, a gente não pode deixar ele morrer”, conta.

A meta da equipe é transformar o mutirão em ação mensal fixa e, ao longo do tempo, reduzir a necessidade de limpeza — atacando os pontos de descarte irregular com fiscalização e conscientização.`,
        coverUrl: IMG.mutirao,
        author: "Equipe Da Nascente à Foz",
        status: "approved",
        createdAt: "2026-08-28T12:00:00.000Z",
      },
      {
        id: "n2",
        title: "Caminhos de madeira: a vida que corre entre os rios",
        summary:
          "Entre palafitas, canoas e manguezais, a Ilha de Deus resiste como território de memória e pertencimento — e agora de fiscalização ambiental comunitária.",
        body: `A Ilha de Deus fica na Bacia do Pina, no Recife. São décadas de história construídas sobre palafitas, em estreita relação com a água e o mangue. Antes de ser um projeto, Da Nascente à Foz nasceu dessa relação: a comunidade sempre observou o rio — o que hoje chamamos de fiscalização sempre foi, na prática, o olhar cotidiano de quem mora na beira d'água.

Com o site e o mapa comunitário, esse olhar ganha registro e memória. Cada ponto mapeado conta um pedaço da história: um descarte que sumiu depois da denúncia, uma nascente de mangue protegida, uma área de preservação que resiste.

“A gente quer mostrar que uma comunidade pequena consegue cuidar do próprio território — e que isso serve de exemplo para o Recife inteiro”, resume a equipe do projeto. Da nascente à foz, quem cuida é a comunidade.`,
        coverUrl: IMG.comunidade,
        author: "Comunidade da Ilha de Deus",
        status: "approved",
        createdAt: "2026-07-12T09:00:00.000Z",
      },
      {
        id: "n3",
        title: "Guará avistado na foz do canal renova a esperança da comunidade",
        summary:
          "A ave, símbolo da saúde dos manguezais, voltou a ser avistada na foz. Para moradores, é sinal de que a recuperação do estuário é possível.",
        body: `Na manhã do último domingo, moradores registraram um guará — ave de plumagem vermelha símbolo dos manguezais pernambucanos — forrageando na foz do canal. A ave é considerada um indicador da saúde do estuário: ela só vive onde a cadeia alimentar do mangue está preservada.

O avistamento foi recebido com entusiasmo pela comunidade e pela equipe do projeto. “Quando a gente vê um guará, vê que todo o esforço faz sentido. O rio está respondendo”, comemora um dos voluntários.

O registro entrou para o mapa da comunidade como ponto de biodiversidade — uma das funções do projeto: não apenas denunciar o que está errado, mas também celebrar e proteger o que está vivo.`,
        coverUrl: IMG.fauna,
        author: "Comunidade da Ilha de Deus",
        status: "approved",
        createdAt: "2026-06-20T08:30:00.000Z",
      },
      {
        id: "n4",
        title: "Mapa comunitário vai ganhar pontos de biodiversidade",
        summary:
          "Além das denúncias, o mapa da Ilha de Deus passará a registrar nascentes de mangue, ninhais e áreas de reprodução de caranguejo.",
        body: `Em breve, o mapa da comunidade ganhará uma nova camada: pontos de biodiversidade. A ideia é que moradores marquem locais de ninhais, presença de aves, caranguejos e áreas de mangue em recuperação.

O mapeamento positivo ajuda a mostrar o valor ambiental do território — e dá força à luta por sua preservação. O projeto está em busca de parceiros e voluntários para a primeira caminhada de mapeamento.`,
        coverUrl: IMG.mangue,
        author: "Comunidade da Ilha de Deus",
        status: "pending",
        createdAt: "2026-09-02T11:00:00.000Z",
      },
    ],
    photos: [
      {
        id: "g1",
        title: "Manguezal ao entardecer",
        description: "O mangue da Ilha de Deus quando o sol se põe sobre a Bacia do Pina.",
        imageUrl: IMG.mangue,
        author: "Dona Maria (moradora)",
        status: "approved",
        createdAt: "2026-03-05T17:00:00.000Z",
      },
      {
        id: "g2",
        title: "Mutirão na margem do canal",
        description: "Mãos da comunidade recolhendo resíduos no mutirão de julho.",
        imageUrl: IMG.mutirao,
        author: "Equipe Da Nascente à Foz",
        status: "approved",
        createdAt: "2026-07-25T10:00:00.000Z",
      },
      {
        id: "g3",
        title: "Guará na foz",
        description: "Registro raro da ave-símbolo dos manguezais pernambucanos.",
        imageUrl: IMG.fauna,
        author: "João Ferreira (morador)",
        status: "approved",
        createdAt: "2026-06-21T06:40:00.000Z",
      },
      {
        id: "g4",
        title: "Caminhos de madeira",
        description: "Entre palafitas e canoas, a vida corre entre os rios.",
        imageUrl: IMG.comunidade,
        author: "Comunidade da Ilha de Deus",
        status: "approved",
        createdAt: "2026-02-14T09:20:00.000Z",
      },
      {
        id: "g5",
        title: "Oficina comunitária",
        description: "Educação ambiental: a comunidade desenha o futuro do próprio território.",
        imageUrl: IMG.reuniao,
        author: "Equipe Da Nascente à Foz",
        status: "approved",
        createdAt: "2026-08-10T15:30:00.000Z",
      },
      {
        id: "g6",
        title: "Ponto de descarte mapeado",
        description: "O registro que virou denúncia e depois virou mutirão.",
        imageUrl: IMG.residuos,
        author: "Vicente (morador)",
        status: "approved",
        createdAt: "2026-07-30T18:10:00.000Z",
      },
      {
        id: "g7",
        title: "Nosso território visto do alto",
        description: "A ilha cercada de mangue e rio — o que queremos preservar.",
        imageUrl: IMG.hero,
        author: "Comunidade da Ilha de Deus",
        status: "pending",
        createdAt: "2026-09-01T16:00:00.000Z",
      },
    ],
  };
}
