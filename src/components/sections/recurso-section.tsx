import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  Plus,
  Send,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TEAM_CONTACT_EMAIL } from "@/lib/site";
import { montarEmail, planilhaAtiva } from "@/lib/planilha";
import type { SecaoCampo, SecaoConfig } from "@/lib/planilha-recurso";
import { Button } from "@/components/ui/button";

/*
 * Seção genérica de um recurso da planilha (avisos, instituições…).
 * A lista e o formulário são descritos pela configuração da seção; o desenho é
 * o mesmo em todas, o que mantém a plataforma coerente e fácil de manter.
 */

interface Props<T extends { id: string }> {
  config: SecaoConfig<T>;
  itens: T[];
  carregando: boolean;
  aviso: string | null;
  onEnviar: (
    campos: Record<string, string>,
  ) => Promise<{ ok: boolean; erro?: string }>;
  onEnviado: (item: T) => void;
  renderItem: (item: T) => ReactNode;
  /** Como agrupar/contar a lista (ex.: "12 instituições cadastradas"). */
  resumoLista: (total: number) => string;
  /** Texto de apoio mostrado no modo demonstração. */
  notaDemonstracao: string;
}

export function RecursoSection<T extends { id: string }>({
  config,
  itens,
  carregando,
  aviso,
  onEnviar,
  onEnviado,
  renderItem,
  resumoLista,
  notaDemonstracao,
}: Props<T>) {
  const [aberto, setAberto] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [filtro, setFiltro] = useState<string>("todos");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState<"planilha" | "email" | null>(null);

  const conectado = planilhaAtiva();

  const lista = useMemo(() => {
    if (!config.filtro || filtro === "todos") return itens;
    return itens.filter(
      (i) => String((i as Record<string, unknown>)[config.filtro!.campo]) === filtro,
    );
  }, [itens, filtro, config.filtro]);

  function campo(nome: string) {
    return valores[nome] ?? "";
  }

  function definir(nome: string, valor: string) {
    setValores((prev) => ({ ...prev, [nome]: valor }));
  }

  function validar(): string | null {
    for (const c of config.campos) {
      const valor = campo(c.nome).trim();
      if (c.obrigatorio && !valor) return `Preencha "${c.label}".`;
      if (c.obrigatorio && c.tipo === "area" && valor.length < 15)
        return `Em "${c.label}", escreva um pouco mais de detalhe.`;
      if (c.obrigatorio && c.tipo !== "area" && c.tipo !== "selecao" && valor.length < 3)
        return `Preencha "${c.label}" com mais detalhes.`;
    }
    return null;
  }

  function abrirEmail() {
    const corpo = config.campos
      .map((c) => `${c.label}: ${campo(c.nome)}`)
      .filter((linha) => linha.split(": ")[1]);
    const assunto = `${config.titulo} — ${campo(config.campos[0].nome)}`;
    window.location.href = montarEmail(TEAM_CONTACT_EMAIL, assunto, corpo);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const problema = validar();
    if (problema) return setErro(problema);
    setErro(null);

    if (!conectado) {
      abrirEmail();
      setSucesso("email");
      return;
    }

    setEnviando(true);
    const res = await onEnviar(valores);
    setEnviando(false);
    if (!res.ok) {
      setErro("Não conseguimos enviar agora. Tente de novo em alguns instantes.");
      return;
    }
    onEnviado(config.montarItem(valores));
    setValores({});
    setSucesso("planilha");
  }

  return (
    <div>
      {!conectado && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-dashed border-border bg-sand px-4 py-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="max-w-4xl text-xs leading-relaxed text-foreground/85">
            <b>Conteúdo de exemplo.</b> {notaDemonstracao}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="font-display text-xl font-semibold text-primary sm:text-2xl">
            {config.titulo}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {config.subtitulo}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {carregando ? "carregando…" : resumoLista(itens.length)} ·{" "}
            {config.nota}
          </p>
        </div>
        <Button
          variant={aberto ? "secondary" : "leaf"}
          onClick={() => {
            setAberto((v) => !v);
            setSucesso(null);
          }}
        >
          {aberto ? (
            <>
              <ChevronDown className="h-4 w-4" />
              Fechar formulário
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              {config.rotuloEnviar}
            </>
          )}
        </Button>
      </div>

      {sucesso && (
        <div className="mt-5 rounded-2xl bg-accent/60 p-4">
          <p className="flex items-center gap-2 font-semibold text-accent-foreground">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {sucesso === "planilha"
              ? "Enviado para a comunidade!"
              : "Preparamos o e-mail com o seu envio"}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-accent-foreground/90">
            {sucesso === "planilha"
              ? "Já aparece na lista deste navegador e entra no site em poucos minutos. A equipe pode esconder o que for ofensivo ou falso."
              : "Abra o rascunho no seu aplicativo de e-mail e envie para a equipe. É assim que o conteúdo chega até nós enquanto a planilha não está conectada."}
          </p>
        </div>
      )}

      {aberto && (
        <form
          onSubmit={enviar}
          className="mt-5 rounded-3xl border border-border/70 bg-card p-5 shadow-card sm:p-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {config.campos.map((c) => (
              <CampoForm
                key={c.nome}
                campo={c}
                valor={campo(c.nome)}
                onMudar={(v) => definir(c.nome, v)}
                className={c.tipo === "area" ? "sm:col-span-2" : undefined}
              />
            ))}
          </div>

          {erro && (
            <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {erro}
            </p>
          )}

          <Button
            type="submit"
            variant="leaf"
            size="lg"
            className="mt-5"
            disabled={enviando}
          >
            {enviando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {enviando ? "Enviando…" : config.rotuloEnviar}
          </Button>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" />
            <span>
              Publique apenas o que você tem autorização para divulgar. Contatos
              de terceiros só entram com o consentimento da pessoa.
            </span>
          </p>
        </form>
      )}

      {config.filtro && (
        <div className="mt-8 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Filtrar:
          </span>
          <BotaoFiltro
            ativo={filtro === "todos"}
            onClick={() => setFiltro("todos")}
            label={`Todas (${itens.length})`}
          />
          {config.filtro.opcoes
            .filter((o) => itens.some((i) => String((i as Record<string, unknown>)[config.filtro!.campo]) === o.id))
            .map((o) => (
              <BotaoFiltro
                key={o.id}
                ativo={filtro === o.id}
                onClick={() => setFiltro(o.id)}
                label={`${o.label} (${
                  itens.filter(
                    (i) => String((i as Record<string, unknown>)[config.filtro!.campo]) === o.id,
                  ).length
                })`}
              />
            ))}
        </div>
      )}

      {aviso && (
        <p className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          {aviso}
        </p>
      )}

      {lista.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center text-muted-foreground">
          Nada publicado aqui ainda.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {lista.map((item) => (
            <div key={item.id}>{renderItem(item)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function BotaoFiltro({
  ativo,
  onClick,
  label,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        ativo
          ? "border-transparent bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:bg-secondary",
      )}
    >
      {label}
    </button>
  );
}

function CampoForm({
  campo,
  valor,
  onMudar,
  className,
}: {
  campo: SecaoCampo;
  valor: string;
  onMudar: (valor: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>
          {campo.label}
          {campo.obrigatorio && <span className="text-destructive"> *</span>}
        </span>
        {campo.dica && (
          <span className="font-normal normal-case tracking-normal text-muted-foreground/80">
            {campo.dica}
          </span>
        )}
      </label>

      {campo.tipo === "area" ? (
        <textarea
          value={valor}
          onChange={(e) => onMudar(e.target.value)}
          rows={4}
          placeholder={campo.placeholder}
          className="field mt-2 resize-none"
        />
      ) : campo.tipo === "selecao" ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(campo.opcoes ?? []).map((o) => {
            const ativo = valor === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onMudar(o.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  ativo
                    ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          type={campo.tipo === "data" ? "date" : "text"}
          value={valor}
          onChange={(e) => onMudar(e.target.value)}
          placeholder={campo.placeholder}
          className="field mt-2"
        />
      )}
    </div>
  );
}
