import { criarRecurso } from "@/lib/planilha-recurso";
import {
  AVISOS_EXEMPLO,
  INSTITUICOES_EXEMPLO,
  normalizarAviso,
  normalizarInstituicao,
  type Aviso,
  type Instituicao,
} from "@/lib/ilha";

/*
 * Dados da área "A Ilha" (avisos e instituições), compartilhados entre as
 * abas da página com um único carregamento e cache no navegador.
 */

const recursoAvisos = criarRecurso<Aviso>(
  {
    recurso: "avisos",
    normalizar: normalizarAviso,
    exemplos: AVISOS_EXEMPLO,
    ordenar: (a, b) => b.criadoEm.localeCompare(a.criadoEm),
  },
  "nascfz-avisos-cache-v1",
);

const recursoInstituicoes = criarRecurso<Instituicao>(
  {
    recurso: "instituicoes",
    normalizar: normalizarInstituicao,
    exemplos: INSTITUICOES_EXEMPLO,
    ordenar: (a, b) => a.nome.localeCompare(b.nome),
  },
  "nascfz-instituicoes-cache-v1",
);

export function useAvisos() {
  return recursoAvisos.useRecurso();
}

export function useInstituicoes() {
  return recursoInstituicoes.useRecurso();
}

export function adicionarAvisoLocal(aviso: Aviso) {
  recursoAvisos.adicionarLocal(aviso);
}

export function adicionarInstituicaoLocal(instituicao: Instituicao) {
  recursoInstituicoes.adicionarLocal(instituicao);
}
