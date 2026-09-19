import { useState } from "react";
import {
  CheckCircle2,
  ClipboardCopy,
  Info,
  Loader2,
  PlugZap,
  Radio,
} from "lucide-react";
import { APPS_SCRIPT_CODE } from "@/lib/alerts-script";
import { ALERTAS, ALERTAS_CONECTADOS, buscarAlertas } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Aba "Mapa de alerta" da Área da equipe: como ligar a planilha gratuita do
 * Google Sheets que guarda os alertas da comunidade.
 */
export function AlertasSetup() {
  const [urlTeste, setUrlTeste] = useState("");
  const [testando, setTestando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setResultado(
        "Não foi possível copiar automaticamente. Selecione o código e copie manualmente.",
      );
    }
  }

  async function testar(url: string) {
    if (!url.trim()) return setResultado("Cole a URL do App da Web (termina em /exec).");
    setTestando(true);
    setResultado(null);
    const res = await buscarAlertas(url.trim());
    setTestando(false);
    if (res.ok) {
      setResultado(
        `Conexão funcionando! A planilha respondeu com ${res.alertas.length} alerta(s) ativo(s).`,
      );
    } else {
      setResultado(
        `A planilha não respondeu (${res.erro}). Confira se a implantação está como "App da Web", executando como você e com acesso "Qualquer pessoa".`,
      );
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <Radio className="h-5 w-5 text-lagoon" />
            Status do mapa de alerta
          </h2>
          <p
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
              ALERTAS_CONECTADOS
                ? "bg-accent text-accent-foreground"
                : "bg-sand text-foreground/80",
            )}
          >
            {ALERTAS_CONECTADOS ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Info className="h-3.5 w-3.5" />
            )}
            {ALERTAS_CONECTADOS
              ? "Conectado à planilha"
              : "Modo demonstração — planilha ainda não conectada"}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            O mapa de alerta é o aviso rápido da comunidade: qualquer pessoa
            registra, sem aprovação prévia, e cada alerta sai do ar sozinho
            depois de {ALERTAS.validadeDias} dias. O que a equipe precisa fazer
            é o acompanhamento leve — olhar a planilha de vez em quando e
            esconder o que for ofensivo ou falso.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
              Grátis: usa Google Sheets + Apps Script, sem servidor e sem custo.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
              Limpeza automática diária dos alertas com mais de{" "}
              {ALERTAS.validadeDias} dias.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
              A coluna <b>status</b> é o painel de moderação: mude para{" "}
              <b>oculto</b> e o alerta sai do mapa (o histórico continua na
              planilha).
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <PlugZap className="h-5 w-5 text-lagoon" />
            Passo a passo
          </h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <b className="text-foreground">1.</b> Crie uma planilha nova no
              Google Sheets (nome livre, ex.: “Alertas — Da Nascente à Foz”).
            </li>
            <li>
              <b className="text-foreground">2.</b> Abra{" "}
              <b>Extensões › Apps Script</b>, apague o conteúdo do arquivo e cole
              o código ao lado.
            </li>
            <li>
              <b className="text-foreground">3.</b> Salve, escolha a função{" "}
              <b>configurar</b> e clique em <b>Executar</b> (autorize o acesso
              quando o Google pedir). Isso cria a aba “Alertas” e agenda a
              limpeza diária.
            </li>
            <li>
              <b className="text-foreground">4.</b> Em{" "}
              <b>Implantar › Nova implantação</b>, escolha o tipo{" "}
              <b>App da Web</b>, execute como <b>Eu</b> e libere o acesso para{" "}
              <b>Qualquer pessoa</b>.
            </li>
            <li>
              <b className="text-foreground">5.</b> Copie a URL que termina em{" "}
              <b>/exec</b>, teste no campo abaixo e mande para nós — ativamos o
              mapa coletivo no site.
            </li>
          </ol>

          <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Testar a URL
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                className="field min-w-[220px] flex-1"
                placeholder="https://script.google.com/macros/s/…/exec"
                value={urlTeste}
                onChange={(e) => setUrlTeste(e.target.value)}
              />
              <Button
                variant="ocean"
                onClick={() => void testar(urlTeste)}
                disabled={testando}
              >
                {testando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlugZap className="h-4 w-4" />
                )}
                Testar
              </Button>
            </div>
            {resultado && (
              <p className="mt-3 text-xs leading-relaxed text-foreground/85">
                {resultado}
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-primary">
            Código para colar no Apps Script
          </h2>
          <Button variant="leaf" size="sm" onClick={() => void copiar()}>
            {copiado ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}
            {copiado ? "Copiado!" : "Copiar código"}
          </Button>
        </div>
        <pre className="mt-4 max-h-[620px] overflow-auto rounded-2xl bg-foreground/95 p-4 text-[11px] leading-relaxed text-background/90">
          <code>{APPS_SCRIPT_CODE}</code>
        </pre>
      </section>
    </div>
  );
}
