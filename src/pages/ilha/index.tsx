import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  Clock,
  HandHeart,
  Heart,
  House,
  MapPin,
  Megaphone,
  MessageCircle,
  Palette,
  Phone,
  Users,
} from "lucide-react";
import { SectionTabs } from "@/components/section-tabs";
import { RecursoSection } from "@/components/sections/recurso-section";
import { useAba } from "@/hooks/use-aba";
import {
  adicionarAvisoLocal,
  adicionarInstituicaoLocal,
  useAvisos,
  useInstituicoes,
} from "@/hooks/use-ilha";
import {
  publicarAviso,
  publicarInstituicao,
  SECAO_AVISOS,
  SECAO_INSTITUICOES,
  tipoInstituicao,
  type Aviso,
  type Instituicao,
} from "@/lib/ilha";
import { daysSince, fmtShort } from "@/lib/format";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

const ABAS = ["avisos", "instituicoes"] as const;

export default function Ilha() {
  const [aba, irPara] = useAba([...ABAS], "avisos");
  const avisos = useAvisos();
  const instituicoes = useInstituicoes();

  return (
    <div>
      {/* TOPO */}
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <House className="h-3.5 w-3.5" />
            A Ilha · Ilha de Deus
          </p>
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            A ilha organizada por quem vive aqui
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Esta área é da comunidade: avisos do dia a dia e o diretório de quem
            já trabalha na ilha — associações, projetos sociais, igrejas, escola e
            coletivos. Publicar é aberto a moradores e organizações locais, com
            moderação leve da equipe.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { to: "/denuncias", label: "Denúncias e alertas" },
              { to: "/denuncias", label: "Alertas ativos" },
              { to: "/noticias", label: "Galeria de fotos" },
              { to: "/voluntariado", label: "Mutirões e voluntariado" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:bg-ocean-soft"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SUBSECÇÕES */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <SectionTabs
          abas={[
            {
              id: "avisos",
              label: "Avisos da comunidade",
              icon: Megaphone,
              badge: avisos.itens.length,
            },
            {
              id: "instituicoes",
              label: "Instituições e ONGs",
              icon: Building2,
              badge: instituicoes.itens.length,
            },
          ]}
          valor={aba}
          onMudar={irPara}
        />

        <div className="mt-8">
          {aba === "avisos" && (
            <RecursoSection<Aviso>
              config={SECAO_AVISOS}
              itens={avisos.itens}
              carregando={avisos.carregando}
              aviso={avisos.aviso}
              onEnviar={publicarAviso}
              onEnviado={adicionarAvisoLocal}
              resumoLista={(n) =>
                n === 1 ? "1 aviso no mural" : `${n} avisos no mural`
              }
              notaDemonstracao="Enquanto a planilha colaborativa não está conectada, o mural mostra avisos de exemplo do piloto. Ao enviar, o site prepara um e-mail para a equipe — assim que a planilha for ligada, os avisos passam a ser publicados direto pela comunidade."
              renderItem={(a) => <CartaoAviso aviso={a} />}
            />
          )}

          {aba === "instituicoes" && (
            <RecursoSection<Instituicao>
              config={SECAO_INSTITUICOES}
              itens={instituicoes.itens}
              carregando={instituicoes.carregando}
              aviso={instituicoes.aviso}
              onEnviar={publicarInstituicao}
              onEnviado={adicionarInstituicaoLocal}
              resumoLista={(n) =>
                n === 1
                  ? "1 instituição cadastrada"
                  : `${n} instituições cadastradas`
              }
              notaDemonstracao="Os perfis abaixo são exemplos do piloto, para mostrar como o diretório funciona. As instituições reais serão publicadas pela equipe, com autorização de cada uma."
              renderItem={(i) => <CartaoInstituicao instituicao={i} />}
            />
          )}
        </div>

        {/* PRÓXIMAS SEÇÕES */}
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/70 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
                <Palette className="h-5 w-5 text-lagoon" />
                Em preparação nesta área
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                As próximas seções de "A Ilha" vão mostrar a{" "}
                <b className="text-foreground">identidade e a cultura</b> da
                comunidade — artesanato, saber local e memória — e o{" "}
                <b className="text-foreground">turismo comunitário</b>: perfis de
                guias e passeios com contato direto no WhatsApp.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/voluntariado">Somar com o projeto</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- cartões ---------- */

function CartaoAviso({ aviso }: { aviso: Aviso }) {
  const dias = daysSince(aviso.criadoEm);
  const zap = linkWhatsApp(
    aviso.contato,
    `Olá! Vi o aviso "${aviso.titulo}" no site da Ilha de Deus e queria saber mais.`,
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug text-primary">
          {aviso.titulo}
        </h3>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
          {dias === 0 ? "hoje" : `há ${dias}d`}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {aviso.texto}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <Megaphone className="h-3.5 w-3.5 text-lagoon" />
          {aviso.publicadoPor || "Comunidade"}
        </span>
        {aviso.ate && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            válido até {fmtShort(aviso.ate)}
          </span>
        )}
        {zap ? (
          <a
            href={zap}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-primary underline-offset-2 hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        ) : (
          aviso.contato && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {aviso.contato}
            </span>
          )
        )}
      </div>
    </article>
  );
}

function CartaoInstituicao({ instituicao }: { instituicao: Instituicao }) {
  const tipo = tipoInstituicao(instituicao.tipo);
  const zap = linkWhatsApp(
    instituicao.contato,
    `Olá! Vi o perfil da ${instituicao.nome} no site da Ilha de Deus e queria falar com vocês.`,
  );
  const email =
    instituicao.contato && instituicao.contato.includes("@")
      ? instituicao.contato
      : null;

  const fatos = [
    { icon: Users, label: "Atende", valor: instituicao.publico },
    { icon: MapPin, label: "Onde", valor: instituicao.referencia },
    { icon: Clock, label: "Horários", valor: instituicao.horarios },
    { icon: HandHeart, label: "Como ajudar", valor: instituicao.comoAjudar },
  ].filter((f) => f.valor);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ocean-soft text-primary">
          <Building2 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-snug text-primary">
            {instituicao.nome}
          </h3>
          <span className="mt-1 inline-flex rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
            {tipo.label}
          </span>
        </div>
      </div>

      {instituicao.descricao && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {instituicao.descricao}
        </p>
      )}

      {fatos.length > 0 && (
        <dl className="mt-4 space-y-2">
          {fatos.map((f) => (
            <div key={f.label} className="flex gap-2.5">
              <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="text-sm text-foreground/85">{f.valor}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-xs text-muted-foreground">
        {zap && (
          <a
            href={zap}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-primary underline-offset-2 hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Falar no WhatsApp
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 font-semibold text-primary underline-offset-2 hover:underline"
          >
            {email}
          </a>
        )}
        {!zap && !email && instituicao.contato && (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {instituicao.contato}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-destructive" />
          Faz parte da rede da ilha
        </span>
      </div>
    </article>
  );
}
