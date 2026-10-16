import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HandHeart,
  Hourglass,
  Info,
  Landmark,
  MapPin,
  Recycle,
  Scale,
} from "lucide-react";
import { useData } from "@/components/data-provider";
import { computeStats } from "@/lib/stats";
import { PRAZO_RESPOSTA_DIAS, STAGES } from "@/lib/stages";
import { fmtShort } from "@/lib/format";
import { Button } from "@/components/ui/button";

/*
 * Indicadores e resultados do projeto. Usado em tela cheia na página /impacto
 * e como módulo de destaque no topo de /noticias (versão compacta).
 */

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(192 30% 89%)",
  fontSize: 12,
  boxShadow: "0 10px 30px -14px rgba(10,50,60,.3)",
};

export function ImpactoModulo({
  compacto = false,
  onVerCompleto,
}: {
  compacto?: boolean;
  onVerCompleto?: () => void;
}) {
  const { db } = useData();
  const stats = useMemo(() => computeStats(db), [db]);

  const cards = [
    {
      icon: MapPin,
      label: "Denúncias mapeadas",
      value: stats.totalDenuncias,
      note: "verificadas e publicadas",
      color: "bg-leaf text-white",
    },
    {
      icon: Landmark,
      label: "Encaminhadas a órgãos",
      value: stats.encaminhadas,
      note: "com protocolo registrado",
      color: "bg-lagoon text-white",
    },
    {
      icon: Hourglass,
      label: "Casos sem retorno",
      value: stats.semRetorno,
      note: `acima de ${PRAZO_RESPOSTA_DIAS} dias sem resposta`,
      color: "bg-destructive text-white",
    },
    {
      icon: Clock,
      label: "Dias de espera somados",
      value: stats.diasDeSilencio,
      note: "tempo que a comunidade já esperou",
      color: "bg-sand-deep text-foreground",
    },
    {
      icon: CheckCircle2,
      label: "Resolvidas",
      value: stats.resolvidas,
      note: `${stats.resolvidasComunidade} pela comunidade · ${stats.resolvidasOrgao} pelo órgão`,
      color: "bg-primary text-white",
    },
    {
      icon: Recycle,
      label: "Mutirões e ações",
      value: stats.mutiroes,
      note: `${stats.voluntarios} voluntários mobilizados`,
      color: "bg-leaf text-white",
    },
  ];

  const pieData = stats.porEtapa.map((s) => ({
    name: s.label,
    value: s.value,
    color: s.color,
  }));

  const apenasNumeros = compacto;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-card"
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-xl ${c.color}`}
            >
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-4xl font-semibold text-primary">
              {c.value}
            </p>
            <p className="mt-1 font-medium text-foreground">{c.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.note}</p>
          </div>
        ))}
      </div>

      {/* MÉTRICAS DE SILÊNCIO */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card">
        <div className="border-b border-border/60 bg-sand/60 px-6 py-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <Hourglass className="h-5 w-5 text-destructive" />
            Métricas de silêncio
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            O projeto registra, protocola e cobra — mas a resposta depende dos
            órgãos públicos. Quando ela não vem, isso também é medida: o silêncio
            é público, datado e contado em dias.
          </p>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-secondary/60 p-4">
            <p className="font-display text-3xl font-semibold text-primary">
              {stats.taxaResposta}%
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground">
              dos casos encaminhados tiveram resposta
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/60 p-4">
            <p className="font-display text-3xl font-semibold text-primary">
              {stats.mediaDiasSemRetorno}
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground">
              dias é a espera média dos casos sem resposta
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/60 p-4">
            <p className="font-display text-3xl font-semibold text-primary">
              {stats.diasDeSilencio}
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground">
              dias de espera somados em {stats.semRetorno} caso(s)
            </p>
          </div>
        </div>

        {stats.semRetornoLista.length > 0 ? (
          <div className="border-t border-border/60 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Casos aguardando resposta
            </p>
            <ul className="mt-3 divide-y divide-border/60">
              {stats.semRetornoLista.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                  <span className="min-w-0 flex-1 font-medium text-foreground">
                    {s.title}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {s.category}
                  </span>
                  {s.agency && (
                    <span className="text-xs text-muted-foreground">
                      {s.agency}
                      {s.protocol ? ` · protocolo ${s.protocol}` : ""}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    encaminhado em {fmtShort(s.since)}
                  </span>
                  <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                    {s.days} dias sem resposta
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="border-t border-border/60 px-6 py-5 text-sm text-muted-foreground">
            Nenhum caso sem resposta neste momento.
          </p>
        )}
      </div>

      {apenasNumeros ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="ocean" onClick={onVerCompleto}>
            Ver indicadores completos
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild variant="outline">
            <Link to="/denuncias">Explorar os pontos no mapa</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary">
                Denúncias por tipo de problema
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Somente pontos verificados e publicados.
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={stats.porCategoria}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(192 30% 92%)"
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={190}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "hsl(199 60% 96%)" }}
                  />
                  <Bar dataKey="value" name="Denúncias" radius={[0, 8, 8, 0]} barSize={18}>
                    {stats.porCategoria.map((c) => (
                      <Cell key={c.id} fill={c.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary">
                Onde cada caso está
              </h2>
              <p className="mb-2 text-xs text-muted-foreground">
                Distribuição das denúncias pelas etapas do acompanhamento.
              </p>
              <div className="flex h-[230px] items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {pieData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5 text-xs">
                {stats.porEtapa.map((d) => (
                  <li key={d.id} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="flex-1 text-muted-foreground">{d.label}</span>
                    <span className="font-bold text-foreground">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-primary">
              Denúncias publicadas por mês
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Crescimento do registro comunitário ao longo do tempo.
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.porMes} margin={{ left: 8, right: 16 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(192 30% 92%)"
                />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(199 60% 96%)" }} />
                <Bar
                  dataKey="total"
                  name="Denúncias"
                  fill="#1c6b8c"
                  radius={[6, 6, 0, 0]}
                  barSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
                <Scale className="h-5 w-5 text-lagoon" />
                O que o projeto garante — e o que não garante
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                  <span>
                    <b className="text-foreground">Garantimos:</b> registrar com
                    data e local, verificar antes de publicar, protocolar nos
                    órgãos responsáveis e manter o histórico público de cada caso.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                  <span>
                    <b className="text-foreground">Garantimos:</b> agir quando é
                    possível — mutirões, limpeza e plantio resolvem parte dos
                    pontos sem depender de ninguém.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-lagoon" />
                  <span>
                    <b className="text-foreground">Não garantimos:</b> que o órgão
                    público responda ou resolva. Essa decisão não é do projeto — e
                    é justamente por isso que o silêncio fica registrado.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-lagoon" />
                  <span>
                    <b className="text-foreground">Não fazemos:</b> publicar
                    suspeitas sem verificação nem expor quem denunciou. Contatos
                    nunca aparecem no mapa.
                  </span>
                </li>
              </ul>
              <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-xs leading-relaxed text-foreground/80">
                Quando um caso fica sem resposta por mais de {PRAZO_RESPOSTA_DIAS}{" "}
                dias, ele passa para a etapa <b>Sem retorno do órgão</b> e entra
                nas métricas de silêncio acima.
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary">
                Como cada etapa é registrada
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                A etapa só avança com registro: vistoria, protocolo, mutirão ou
                resposta oficial.
              </p>
              <ul className="mt-4 space-y-3">
                {STAGES.map((s) => (
                  <li key={s.id} className="flex gap-3">
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {s.label}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {s.meaning}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-sand p-5 text-center text-sm text-foreground/80">
            <p>
              <b>Nota sobre a versão de demonstração:</b> os números acima vêm do
              conteúdo de exemplo do projeto-piloto, para mostrar como o
              acompanhamento funciona. Publicando os registros reais, eles
              aparecem aqui com as mesmas etapas, protocolos e dias de espera.
            </p>
            <Button asChild variant="ocean" className="mt-4">
              <Link to="/denuncias">Explorar os pontos no mapa</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
