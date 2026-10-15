import { criarRecurso } from "@/lib/planilha-recurso";
import { ALERTAS_EXEMPLO, normalizarAlerta, type Alerta } from "@/lib/alerts";

/*
 * Alertas da comunidade compartilhados entre as seções do site
 * (painel compacto, aba de alertas e contagens), com um único carregamento.
 */
const recursoAlertas = criarRecurso<Alerta>(
  {
    recurso: "alertas",
    normalizar: normalizarAlerta,
    exemplos: ALERTAS_EXEMPLO,
    ordenar: (a, b) => b.criadoEm.localeCompare(a.criadoEm),
  },
  "nascfz-alertas-cache-v1",
);

export interface EstadoAlertas {
  alertas: Alerta[];
  carregando: boolean;
  aviso: string | null;
}

/** Lista de alertas ativos, compartilhada entre as seções do site. */
export function useAlertas(): EstadoAlertas {
  const estado = recursoAlertas.useRecurso();
  return {
    alertas: estado.itens,
    carregando: estado.carregando,
    aviso: estado.aviso,
  };
}

/** Mostra imediatamente um alerta recém-enviado pela pessoa. */
export function adicionarAlertaLocal(alerta: Alerta) {
  recursoAlertas.adicionarLocal(alerta);
}
