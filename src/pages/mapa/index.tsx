import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Filter, Map as MapIcon, MapPin, Plus, Satellite, X } from "lucide-react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { ILHA_DE_DEUS_CENTER, DEFAULT_ZOOM, SATELLITE_URL, SATELLITE_ATTRIBUTION, TILE_URL, TILE_ATTRIBUTION } from "@/lib/geo";
import { useData } from "@/components/data-provider";
import type { Report } from "@/lib/types";
import { fmtShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ReportStatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";

/* ---------- camadas de mapa ---------- */

type BaseMode = "sat" | "ruas";

const BASE_TILES: Record<BaseMode, { url: string; attribution: string }> = {
  sat: { url: SATELLITE_URL, attribution: SATELLITE_ATTRIBUTION },
  ruas: { url: TILE_URL, attribution: TILE_ATTRIBUTION },
};

/* ---------- marcador com brilho e pulso ---------- */

function makeIcon(categoryColor: string, selected: boolean, resolved: boolean) {
  const s = selected ? 34 : 24;
  const color = resolved ? "#94a3b8" : categoryColor;
  return L.divIcon({
    className: "",
    html: `<span style="
      position:relative; display:grid; width:${s}px; height:${s}px;
      border-radius:9999px; background:${color};
      border:2px solid rgba(255,255,255,.95);
      box-shadow:0 0 0 ${selected ? 5 : 2}px rgba(255,255,255,.28),
                 0 0 ${selected ? 26 : 14}px ${color === "#94a3b8" ? "rgba(148,163,184,.8)" : color + "b3"};
      place-items:center;
    ">${
      selected
        ? `<span class="marker-ping" style="background:${color}"></span>`
        : ""
    }${
      resolved
        ? `<span style="color:#fff; font-size:${selected ? 14 : 11}px; font-weight:900; line-height:1">✓</span>`
        : `<span style="width:${selected ? 9 : 6}px; height:${selected ? 9 : 6}px; border-radius:9999px; background:rgba(255,255,255,.95); display:block"></span>`
    }</span>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

/* ---------- helpers do mapa ---------- */

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const last = useRef("");
  useEffect(() => {
    if (!position) return;
    const key = position.join(",");
    if (key !== last.current) {
      last.current = key;
      map.flyTo(position, 17, { duration: 0.7 });
    }
  }, [position, map]);
  return null;
}

function MapClickReset({ onClear }: { onClear: () => void }) {
  useMapEvents({
    click() {
      onClear();
    },
  });
  return null;
}

type Situacao = "todas" | "ativas" | "resolvidas";

export default function Mapa() {
  const { db } = useData();
  const [base, setBase] = useState<BaseMode>("sat");
  const [cats, setCats] = useState<Set<string>>(
    () => new Set(CATEGORIES.map((c) => c.id)),
  );
  const [situacao, setSituacao] = useState<Situacao>("todas");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reports = useMemo(
    () =>
      db.reports
        .filter((r) => r.status === "approved")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.reports],
  );

  const visible = useMemo(
    () =>
      reports.filter((r) => {
        if (!cats.has(r.category)) return false;
        if (situacao === "ativas" && r.resolved) return false;
        if (situacao === "resolvidas" && !r.resolved) return false;
        return true;
      }),
    [reports, cats, situacao],
  );

  const selected = visible.find((r) => r.id === selectedId) ?? null;
  const resolvedCount = reports.filter((r) => r.resolved).length;
  const focus = selected ? ([selected.lat, selected.lng] as [number, number]) : null;

  const catCounts = useMemo(() => {
    const map = new Map<string, { total: number; ativas: number }>();
    for (const c of CATEGORIES) map.set(c.id, { total: 0, ativas: 0 });
    for (const r of reports) {
      const cur = map.get(r.category);
      if (cur) {
        cur.total += 1;
        if (!r.resolved) cur.ativas += 1;
      }
    }
    return map;
  }, [reports]);

  function toggleCat(id: string) {
    setCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSelectedId(null);
  }

  function selectReport(id: string) {
    setSelectedId((cur) => (cur === id ? null : id));
  }

  const tiles = BASE_TILES[base];

  return (
    <div>
      {/* Cabeçalho curto da página */}
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-6 sm:px-6">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Ilha de Deus · Recife
            </p>
            <h1 className="text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
              Mapa da fiscalização comunitária
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Vista de satélite do território. Cada ponto foi verificado pela
              equipe antes de virar público — clique num marcador para detalhes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="leaf">
              <Link to="/denunciar">
                <Plus className="h-4 w-4" />
                Nova denúncia
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/denuncias">Como funciona</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mapa imersivo */}
      <div className="relative">
        <MapContainer
          center={ILHA_DE_DEUS_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="z-0 h-[70vh] w-full lg:h-[calc(100vh-248px)] lg:min-h-[560px]"
        >
          <TileLayer attribution={tiles.attribution} url={tiles.url} />
          <FlyTo position={focus} />
          <MapClickReset onClear={() => setSelectedId(null)} />
          {visible.map((r) => {
            const cat = getCategory(r.category);
            return (
              <Marker
                key={r.id}
                position={[r.lat, r.lng]}
                icon={makeIcon(cat.color, r.id === selectedId, r.resolved)}
                eventHandlers={{
                  click: () => selectReport(r.id),
                }}
              />
            );
          })}
        </MapContainer>

        {/* Painel flutuante: filtros + legenda + alternância Satélite/Ruas */}
        <div className="pointer-events-none absolute inset-x-0 top-3 z-[1200] flex justify-center px-3 sm:inset-x-auto sm:left-5 sm:right-auto sm:justify-start">
          <div className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-soft backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-border/60 px-3.5 py-2.5">
              <span className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary">
                <Filter className="h-4 w-4 text-lagoon" />
                Filtros
              </span>

              <div className="flex gap-1 rounded-full bg-secondary p-0.5">
                {(
                  [
                    { id: "todas", label: "Todas" },
                    { id: "ativas", label: "Ativas" },
                    { id: "resolvidas", label: "Resolvidas" },
                  ] as { id: Situacao; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSituacao(s.id);
                      setSelectedId(null);
                    }}
                    className={cn(
                      "rounded-full px-2 py-1 text-[11px] font-semibold transition",
                      situacao === s.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <span className="ml-auto hidden text-[11px] font-medium text-muted-foreground sm:inline">
                {visible.length} no mapa · {resolvedCount} resolvidas
              </span>
            </div>

            <div className="relative">
              <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto px-3 py-2.5 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
                {CATEGORIES.map((c) => {
                const on = cats.has(c.id);
                const count = catCounts.get(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition sm:shrink",
                      on
                        ? "border-transparent text-white shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:bg-secondary",
                    )}
                    style={on ? { backgroundColor: c.color } : undefined}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: on ? "rgba(255,255,255,.9)" : c.color,
                      }}
                    />
                    {c.short}
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        on ? "text-white/80" : "text-muted-foreground/70",
                      )}
                    >
                      {count?.total ?? 0}
                    </span>
                  </button>
                );
              })}
              {cats.size < CATEGORIES.length && (
                <button
                  type="button"
                  onClick={() =>
                    setCats(new Set(CATEGORIES.map((x) => x.id)))
                  }
                  className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-lagoon underline-offset-2 hover:underline"
                >
                  Mostrar todas
                </button>
              )}
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden"
              />
            </div>

            <div className="flex items-center gap-1 border-t border-border/60 px-3 py-2">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Base
              </span>
              <div className="flex rounded-full bg-secondary p-0.5">
                {(
                  [
                    { id: "sat", label: "Satélite", Icon: Satellite },
                    { id: "ruas", label: "Ruas", Icon: MapIcon },
                  ] as {
                    id: BaseMode;
                    label: string;
                    Icon: typeof Satellite;
                  }[]
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBase(id)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                      base === id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detalhe do ponto selecionado */}
        {selected && (
          <DetailPanel report={selected} onClose={() => setSelectedId(null)} />
        )}
      </div>

      {/* Faixa de confiança */}
      <div className="border-t border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2 px-4 py-6 text-center sm:flex-row sm:gap-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            <b className="text-primary">Verificação antes de publicar:</b> todo
            ponto passa pela equipe. Quem denuncia fica protegido — contatos
            nunca aparecem no mapa.
          </p>
          <Link
            to="/denunciar"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-ocean-soft"
          >
            <Plus className="h-3.5 w-3.5" />
            Denunciar agora
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- Painel de detalhe (lateral no desktop, sheet no mobile) ---------- */

function DetailPanel({ report, onClose }: { report: Report; onClose: () => void }) {
  const cat = getCategory(report.category);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1300] flex justify-center p-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-4 sm:block sm:w-[400px] sm:p-0">
      <article className="pointer-events-auto flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-border/60 bg-white/95 shadow-card backdrop-blur sm:max-h-full sm:max-w-none sm:rounded-3xl">
        <div className="relative shrink-0">
          {report.photoUrl ? (
            <img
              src={report.photoUrl}
              alt={report.title}
              className="h-44 w-full object-cover sm:h-52"
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className="flex h-24 items-end px-5 pb-2 sm:h-28"
              style={{
                background: `linear-gradient(160deg, ${cat.color}22, ${cat.color}55)`,
              }}
            >
              <p className="font-display text-2xl font-semibold text-primary">
                {cat.short}
              </p>
            </div>
          )}
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: cat.color }}
          >
            {cat.short}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold leading-snug text-primary">
              {report.title}
            </h3>
            <ReportStatusPill status={report.status} resolved={report.resolved} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {report.reference} · {fmtShort(report.createdAt)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {report.description}
          </p>
          {report.resolved && report.resolutionNote && (
            <div className="mt-3 rounded-xl border border-accent bg-accent/40 p-3 text-sm text-accent-foreground">
              <b>Acompanhamento:</b> {report.resolutionNote}
            </div>
          )}
          <Link
            to="/denunciar"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Denunciar algo parecido
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhe"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-primary shadow-sm backdrop-blur transition hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>
      </article>
    </div>
  );
}
