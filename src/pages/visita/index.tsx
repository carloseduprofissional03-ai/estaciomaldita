import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Clock,
  HandHeart,
  Info,
  Instagram,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Route,
  Users,
} from "lucide-react";
import { Carrossel } from "@/components/carrossel";
import {
  CONTATO_COMUNIDADE,
  INFO_PRATICA,
  MSG_VISITA_PADRAO,
  msgRoteiro,
  ROTEIROS,
} from "@/lib/comunidade";
import { montarEmail } from "@/lib/planilha";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

const PASSOS = [
  {
    icon: CalendarCheck,
    titulo: "1. Escolha o dia",
    texto:
      "Veja os roteiros abaixo e pense numa data e num horário que funcionem para o seu grupo.",
  },
  {
    icon: MessageCircle,
    titulo: "2. Chame no WhatsApp",
    texto:
      "Diga quantas pessoas vão, a data desejada e se alguém precisa de adaptação no percurso.",
  },
  {
    icon: Route,
    titulo: "3. Combine o roteiro",
    texto:
      "A comunidade confirma a maré, o tempo de caminhada e o melhor horário para receber.",
  },
  {
    icon: HandHeart,
    titulo: "4. Confirme no dia anterior",
    texto:
      "Uma mensagem no dia anterior garante que a pessoa guia estará esperando no trapiche.",
  },
];

export default function Visita() {
  const zap = linkWhatsApp(CONTATO_COMUNIDADE.whatsapp, MSG_VISITA_PADRAO);
  const insta = CONTATO_COMUNIDADE.instagram
    ? `https://instagram.com/${CONTATO_COMUNIDADE.instagram}`
    : null;
  const email = montarEmail(CONTATO_COMUNIDADE.email, "Agendar visita à Ilha de Deus", [
    MSG_VISITA_PADRAO,
  ]);

  return (
    <div>
      {/* TOPO */}
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <CalendarCheck className="h-3.5 w-3.5" />
            Agendar Visita
          </p>
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            Combine sua visita direto com a comunidade
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Aqui não existe formulário nem reserva automática: o agendamento é uma
            conversa. Você fala com a comunidade pelo <b>WhatsApp</b> ou pelo{" "}
            <b>Instagram</b>, combina o roteiro e o horário — e a visita acontece
            com quem vive na ilha.
          </p>
        </div>
      </section>

      {/* CANAIS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-leaf text-white shadow-leaf">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-primary">
                  WhatsApp
                </h2>
                <p className="text-xs text-muted-foreground">
                  Canal principal para agendar
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              É por ali que a comunidade confirma a data, a maré e o ponto de
              encontro. A mensagem já vai pronta: você só completa o número de
              pessoas e o dia que prefere.
            </p>

            {zap ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button asChild variant="leaf" size="lg">
                  <a href={zap} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Abrir conversa no WhatsApp
                  </a>
                </Button>
                <span className="text-xs text-muted-foreground">
                  {CONTATO_COMUNIDADE.whatsapp}
                </span>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-sand px-4 py-3.5">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground/85">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <b>Número oficial sendo definido.</b> A comunidade está
                    confirmando o número que vai atender as visitas. Enquanto
                    isso, escreva para a equipe do projeto — ela responde e repassa
                    a conversa para quem recebe.
                  </span>
                </p>
                <Button asChild variant="ocean" size="sm" className="mt-3">
                  <a href={email}>
                    <Mail className="h-4 w-4" />
                    Agendar por e-mail
                  </a>
                </Button>
              </div>
            )}
          </article>

          <article className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lagoon to-leaf text-white shadow-soft">
                <Instagram className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-primary">
                  Instagram
                </h2>
                <p className="text-xs text-muted-foreground">
                  Fotos, novidades e o dia a dia da ilha
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Acompanhe os mutirões, os registros de fauna e as visitas que já
              aconteceram. Também dá para chamar por mensagem direta e falar com a
              comunidade por lá.
            </p>

            {insta ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button asChild variant="ocean" size="lg">
                  <a href={insta} target="_blank" rel="noreferrer">
                    <Instagram className="h-4 w-4" />
                    Seguir @{CONTATO_COMUNIDADE.instagram}
                  </a>
                </Button>
              </div>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-border bg-sand px-4 py-3.5 text-xs leading-relaxed text-foreground/85">
                <b>Perfil oficial sendo definido.</b> Assim que a comunidade
                confirmar o usuário do Instagram, o botão aparece aqui.
              </p>
            )}
          </article>
        </div>
      </section>

      {/* ROTEIROS */}
      <section className="border-y border-border/60 bg-foam">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
              <Route className="h-5 w-5 text-lagoon" />
              Roteiros de visita
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Três programas pensados pela comunidade. Escolha um e chame no
              WhatsApp dizendo o nome do roteiro — a mensagem já vai escrita.
            </p>
          </div>

          <div className="mt-8">
            <Carrossel rotulo="Roteiros de visita">
              {ROTEIROS.map((r) => {
                const link = linkWhatsApp(
                  CONTATO_COMUNIDADE.whatsapp,
                  msgRoteiro(r.titulo),
                );
                const href =
                  link ??
                  montarEmail(CONTATO_COMUNIDADE.email, `Visita — ${r.titulo}`, [
                    msgRoteiro(r.titulo),
                  ]);
                return (
                  <article
                    key={r.id}
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
                  >
                    <div
                      className="flex h-24 items-end px-5 pb-3"
                      style={{
                        background: `linear-gradient(160deg, ${r.cor}22, ${r.cor}66)`,
                      }}
                    >
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                        style={{ backgroundColor: r.cor }}
                      >
                        Roteiro
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-semibold leading-snug text-primary">
                        {r.titulo}
                      </h3>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {r.duracao}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {r.grupo}
                        </span>
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {r.descricao}
                      </p>
                      <Button
                        asChild
                        variant="leaf"
                        size="sm"
                        className="mt-auto w-fit"
                      >
                        <a
                          href={href}
                          {...(link
                            ? { target: "_blank", rel: "noreferrer" }
                            : {})}
                        >
                          <MessageCircle className="h-4 w-4" />
                          {link ? "Chamar no WhatsApp" : "Agendar por e-mail"}
                        </a>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </Carrossel>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold text-primary">
            Como funciona
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Do primeiro contato até o dia da visita — tudo combinado direto com a
            comunidade.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map((p) => (
            <div
              key={p.titulo}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ocean-soft text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{p.titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {p.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INFORMAÇÕES PRÁTICAS */}
      <section className="border-y border-border/60 bg-foam">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
              <MapPin className="h-5 w-5 text-leaf" />
              Informações práticas
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              O que a comunidade pede para você saber antes de vir.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INFO_PRATICA.map((i) => (
              <div
                key={i.titulo}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-card"
              >
                <h3 className="font-display text-base font-semibold text-primary">
                  {i.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {i.texto}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-start gap-3 rounded-3xl border border-dashed border-border bg-card/70 p-5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-lagoon" />
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              <b className="text-foreground">Sem formulário e sem reserva automática.</b>{" "}
              O site não guarda seus dados de agendamento: ele só leva você até o
              WhatsApp ou o Instagram da comunidade, que organiza as visitas no
              tempo e na maré de quem mora aqui. Quer conhecer o projeto antes?{" "}
              <Link
                to="/mangue"
                className="font-semibold text-primary underline underline-offset-2"
              >
                Veja o Mangue &amp; Comunidade
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* CONVITE */}
      <section className="bg-sand">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-primary">
              <Leaf className="h-5 w-5 text-leaf" />
              Visita de baixo impacto
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              Pedimos que a visita não deixe resíduos e não colete nada do mangue —
              nem conchas, nem mudas. O território é a casa de quem recebe você.
            </p>
          </div>
          <Button asChild variant="leaf" size="lg" className="shrink-0">
            <Link to="/mangue">Conhecer o Mangue &amp; Comunidade</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
