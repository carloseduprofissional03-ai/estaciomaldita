import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Aba atual guardada na URL (?aba=...), para que qualquer link do site possa
 * apontar direto para uma subseção (ex.: /denuncias?aba=mapa).
 */
export function useAba(valida: string[], padrao: string) {
  const [params, setParams] = useSearchParams();
  const parametro = params.get("aba");
  const atual = parametro && valida.includes(parametro) ? parametro : padrao;

  const irPara = useCallback(
    (id: string) => {
      const next = new URLSearchParams(params);
      if (id === padrao) next.delete("aba");
      else next.set("aba", id);
      setParams(next, { replace: true });
    },
    [padrao, params, setParams],
  );

  return [atual, irPara] as const;
}
