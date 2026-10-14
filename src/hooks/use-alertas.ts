import { useEffect, useSyncExternalStore } from "react";
import {
  ALERTAS_CONECTADOS,
  ALERTAS_EXEMPLO,
  buscarAlertas,
  lerCache,
  type Alerta,
} from "@/lib/alerts";

/*
 * Estado compartilhado dos alertas: a página de denúncias, o painel compacto
 * e a aba de alertas usam a mesma lista, com uma única busca na planilha.
 */

interface EstadoAlertas {
  alertas: Alerta[];
  carregando: boolean;
  aviso: string | null;
}

let estado: EstadoAlertas = {
  alertas: ALERTAS_CONECTADOS ? lerCache() : ALERTAS_EXEMPLO,
  carregando: ALERTAS_CONECTADOS,
  aviso: null,
};

const ouvintes = new Set<() => void>();
let buscando = false;

function publicar(parcial: Partial<EstadoAlertas>) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}

function carregar() {
  if (!ALERTAS_CONECTADOS || buscando) return;
  buscando = true;
  void buscarAlertas().then((r) => {
    buscando = false;
    if (r.ok) {
      publicar({ alertas: r.alertas, carregando: false, aviso: null });
    } else {
      publicar({
        carregando: false,
        aviso:
          "Não conseguimos carregar os alertas agora. Mostrando a última lista salva neste navegador.",
      });
    }
  });
}

/** Lista de alertas ativos, compartilhada entre as seções do site. */
export function useAlertas(): EstadoAlertas {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => estado,
    () => estado,
  );
  useEffect(() => {
    carregar();
  }, []);
  return snapshot;
}

/** Mostra imediatamente um alerta recém-enviado pela pessoa. */
export function adicionarAlertaLocal(alerta: Alerta) {
  publicar({ alertas: [alerta, ...estado.alertas] });
}
