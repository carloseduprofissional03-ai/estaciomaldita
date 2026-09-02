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
import { BarChart3, CheckCircle2, MapPin, Recycle, Users } from "lucide-react";
import { useData } from "@/components/data-provider";
import { computeStats } from "@/lib/stats";
import { Button } from "@/components/ui/button";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(192 30% 89%)",
  fontSize: 12,
  boxShadow: "0 10px 30px -14px rgba(10,50,60,.3)",
};

export default function Impacto() {
  const { db } = useData();
  const stats = useMemo(() => computeStats(db), [db]);

  const cards = [
    { icon: MapPin, label: "Denúncias mapeadas", value: stats.totalDenuncias, color: "bg-leaf text-white" },
    { icon: CheckCircle2, label: "Resolvidas", value: stats.resolvidas, color: "bg-lagoon text-white" },
    { icon: Recycle, label: "Mutirões e ações", value: stats.mutiroes, color: "bg-leaf text-white" },
    { icon: Users, label: "Voluntários mobilizados", value: stats.voluntarios, color: "bg-primary text-white" },
  ];

  const pieData = [
    { name: "Abertas", value: stats.abertas, color: "#2f7fc0" },
    { name: "Resolvidas", value: stats.resolvidas, color: "#2e9e63" },
  ];

  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <BarChart3 className="h-3.5 w-3.5" />
            Transparência
          </p>
          <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
            Impacto em números
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Os relatórios do projeto são públicos: o que a comunidade registrou,
            o que já virou resolução e onde ainda é preciso atuar. Dados para o
            poder público enxergar o território.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-4xl font-semibold text-primary">{c.value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-primary">
              Denúncias por tipo de problema
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Somente pontos verificados e publicados.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.porCategoria} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(192 30% 92%)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={190}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(199 60% 96%)" }} />
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
              Situação das denúncias
            </h2>
            <p className="mb-2 text-xs text-muted-foreground">
              Resolvidas com a comunidade e o poder público.
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
            <div className="flex justify-center gap-5 text-xs">
              {pieData.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">
            Denúncias publicadas por mês
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Crescimento do registro comunitário ao longo do tempo.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.porMes} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(192 30% 92%)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(199 60% 96%)" }} />
              <Bar dataKey="total" name="Denúncias" fill="#1c6b8c" radius={[6, 6, 0, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-sand p-5 text-center text-sm text-foreground/80">
          <p>
            <b>Nota sobre a versão de demonstração:</b> os números acima vêm de
            dados de exemplo. Na versão com o banco de dados conectado, os
            relatórios passam a refletir as denúncias reais da comunidade em
            tempo real.
          </p>
          <Button asChild variant="ocean" className="mt-4">
            <Link to="/mapa">Explorar os pontos no mapa</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
