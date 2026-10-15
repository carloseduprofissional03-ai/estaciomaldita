import { useState } from "react";
import {
  CheckCircle2,
  ClipboardCopy,
  Info,
  Loader2,
  PlugZap,
  Table2,
} from "lucide-react";
import { APPS_SCRIPT_CODE } from "@/lib/alerts-script";
import { PLANILHA, planilhaAtiva, testarPlanilha } from "@/lib/planilha";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Aba da Área da equipe: como ligar a planilha gratuita do Google Sheets que
 * guarda o mapa de alerta e a área "A Ilha" (avisos e instituições/ONGs).
 */

const RECURSOS = [
  { id: "alertas", label: "Alertas", uso: "Mapa de alerta (aba Alertas)" },
  { id: "avisos", label: "Avisos", uso: "A Ilha → Avisos da comunidade" },
  { id: "instituicoes", label: "Instituições", uso: "A Ilha → Instituições e ONGs" },
];

export function AlertasSetup() {
  const [urlTeste, setUrlTeste] = useState("");
  const [recurso, setRecurso] = useState("alertas");
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

  async function testar() {
    if (!urlTeste.trim())
      return setResultado("Cole a URL do App da Web (termina em /exec).");
    setTestando(true);
    setResultado(null);
    const res = await testarPlanilha(urlTeste, recurso);
    setTestando(false);
    if (res.ok) {
      setResultado(
        `Conexão funcionando! A aba "${recurso}" respondeu com ${res.total} item(ns) aprovado(s).`,
      );
    } else {
      setResultado(
        `A planilha não respondeu (${res.erro}). Confira se a implantação está como "App da Web", executando como você e com acesso "Qualquer pessoa", e se rodou a função "configurar" para criar as abas.`,
      );
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <Table2 className="h-5 w-5 text-lagoon" />
            Status da planilha da comunidade
          </h2>
          <p
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
              planilhaAtiva()
                ? "bg-accent text-accent-foreground"
                : "bg-sand text-foreground/80",
            )}
          >
            {planilhaAtiva() ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Info className="h-3.5 w-3.5" />
            )}
            {planilhaAtiva()
              ? "Conectada"
              : "Modo demonstração — planilha ainda não conectada"}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Uma única planilha gratuita do Google Sheets alimenta três partes do
            site. O site só mostra o que estiver com o status{" "}
            <b className="text-foreground">aprovado</b> na planilha — é ali que a
            equipe modera, sem precisar mexer em código.
          </p>

          <ul className="mt-4 space-y-2.5">
            {RECURSOS.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-3 rounded-2xl bg-secondary/60 px-3.5 py-3"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ocean-soft text-[10px] font-bold text-primary">
                  {r.label.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {r.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.uso}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Como moderar: mude a coluna <b>status</b> para{" "}
            <b>oculto</b> (ou apague a linha) e o item sai do site. Alertas com
            mais de 60 dias e avisos vencidos há mais de 30 dias são apagados
            automaticamente todos os dias.
          </p>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <PlugZap className="h-5 w-5 text-lagoon" />
            Passo a passo
          </h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <b className="text-foreground">1.</b> Crie uma planilha nova no
              Google Sheets (nome livre, ex.: “Comunidade — Da Nascente à Foz”).
            </li>
            <li>
              <b className="text-foreground">2.</b> Abra{" "}
              <b>Extensões › Apps Script</b>, apague o conteúdo do arquivo e cole
              o código ao lado.
            </li>
            <li>
              <b className="text-foreground">3.</b> Salve, escolha a função{" "}
              <b>configurar</b> e clique em <b>Executar</b> (autorize o acesso
              quando o Google pedir). Isso cria as abas <b>Alertas</b>,{" "}
              <b>Avisos</b> e <b>Instituicoes</b>, e agenda a limpeza diária.
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
              mapa de alerta e a área "A Ilha" no site.
            </li>
          </ol>

          <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Testar a URL
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RECURSOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRecurso(r.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                    recurso === r.id
                      ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                className="field min-w-[220px] flex-1"
                placeholder="https://script.google.com/macros/s/…/exec"
                value={urlTeste}
                onChange={(e) => setUrlTeste(e.target.value)}
              />
              <Button variant="ocean" onClick={() => void testar()} disabled={testando}>
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
            {planilhaAtiva() && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Endpoint em uso no site: {PLANILHA.endpoint.slice(0, 46)}…
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
