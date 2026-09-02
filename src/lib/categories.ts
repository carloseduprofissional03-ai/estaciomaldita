export interface Category {
  id: string;
  label: string;
  description: string;
  color: string; // hex do marcador
}

export const CATEGORIES: Category[] = [
  {
    id: "residuos",
    label: "Descarte irregular de resíduos",
    description: "Entulho, lixo doméstico e resíduos de construção despejados fora do lugar",
    color: "#e08a2e",
  },
  {
    id: "esgoto",
    label: "Esgoto e efluentes",
    description: "Lançamento de esgoto a céu aberto ou direto no rio/canal",
    color: "#c2543f",
  },
  {
    id: "mangue",
    label: "Degradação do manguezal",
    description: "Supressão de vegetação de mangue e danos à área de preservação",
    color: "#2e9e63",
  },
  {
    id: "ocupacao",
    label: "Ocupação de área de preservação",
    description: "Aterros e ocupações avançando sobre áreas alagadas e APPs",
    color: "#7c5cd6",
  },
  {
    id: "poluicao",
    label: "Poluição de rio e canais",
    description: "Manchas, óleo e materiais poluentes nas águas",
    color: "#2f7fc0",
  },
  {
    id: "queimada",
    label: "Queimadas e desmatamento",
    description: "Queima de lixo, incêndios em vegetação e corte de árvores",
    color: "#d1453b",
  },
  {
    id: "outro",
    label: "Outro problema",
    description: "Situações socioambientais que não se encaixam acima",
    color: "#5f6b76",
  },
];

export function getCategory(id: string): Category {
  return (
    CATEGORIES.find((c) => c.id === id) ?? {
      id,
      label: "Outro problema",
      description: "",
      color: "#5f6b76",
    }
  );
}
