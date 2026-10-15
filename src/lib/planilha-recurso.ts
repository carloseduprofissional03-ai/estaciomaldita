import { useEffect, useSyncExternalStore } from "react";
import {
  enviarItem,
  gravarCache,
  lerCache,
  lerItens,
  planilhaAtiva,
} from "./planilha";

/*
 * Fábrica de "recurso da planilha": mantém a lista compartilhada entre as
 * seções do site (um único carregamento), com cache no navegador para a página
 * não abrir vazia, e expõe um hook pronto para os componentes.
 */

export interface SecaoCampo {
  /** Nome do campo na planilha (ex.: "titulo"). */
  nome: string;
  label: string;
  placeholder?: string;
  tipo?: "texto" | "area" | "data" | "selecao";
  opcoes?: { id: string; label: string }[];
  obrigatorio?: boolean;
  dica?: string;
}

export interface SecaoConfig<T> {
  /** Aba da planilha: "avisos", "instituicoes", "alertas"… */
  recurso: string;
  titulo: string;
  subtitulo: string;
  /** Aviso honesto sobre moderação / prazo de validade. */
  nota: string;
  rotuloEnviar: string;
  campos: SecaoCampo[];
  /** Monta o item local para mostrar na hora (antes de a planilha devolver). */
  montarItem: (campos: Record<string, string>) => T;
  /** Agrupa a lista por este campo (opcional), com estes rótulos. */
  filtro?: { campo: string; opcoes: { id: string; label: string }[] };
}

export interface EstadoRecurso<T> {
  itens: T[];
  carregando: boolean;
  aviso: string | null;
}

export interface RecursoDef<T> {
  /** Aba da planilha que guarda este recurso. */
  recurso: string;
  normalizar: (raw: unknown) => T | null;
  /** Conteúdo de exemplo usado enquanto a planilha não está conectada. */
  exemplos: T[];
  /** Ordenação da lista exibida (opcional). */
  ordenar?: (a: T, b: T) => number;
}

export function criarRecurso<T extends { id: string }>(
  config: RecursoDef<T>,
  chaveCache: string,
) {
  let estado: EstadoRecurso<T> = {
    itens: planilhaAtiva() ? lerCache<T>(chaveCache) : config.exemplos,
    carregando: planilhaAtiva(),
    aviso: null,
  };

  const ouvintes = new Set<() => void>();
  let buscando = false;

  function publicar(parcial: Partial<EstadoRecurso<T>>) {
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
    if (!planilhaAtiva() || buscando) return;
    buscando = true;
    void lerItens<T>(config.recurso, config.normalizar).then((r) => {
      buscando = false;
      if (r.ok) {
        const itens = ordenarLista(r.itens);
        gravarCache(chaveCache, itens);
        publicar({ itens, carregando: false, aviso: null });
      } else {
        publicar({
          carregando: false,
          aviso:
            "Não conseguimos carregar agora. Mostrando a última lista salva neste navegador.",
        });
      }
    });
  }

  function ordenarLista(lista: T[]): T[] {
    return config.ordenar ? [...lista].sort(config.ordenar) : lista;
  }

  function useRecurso(): EstadoRecurso<T> {
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

  function adicionarLocal(item: T) {
    publicar({ itens: ordenarLista([item, ...estado.itens]) });
  }

  async function enviar(campos: Record<string, string>) {
    return enviarItem(config.recurso, campos);
  }

  return { useRecurso, adicionarLocal, enviar };
}
