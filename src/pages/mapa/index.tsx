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
import { Filter, MapPin, Plus, X } from "lucide-react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { ILHA_DE_DEUS_CENTER, DEFAULT_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "@/lib/geo";
import { useData } from "@/components/data-provider";
import type { Report } from "@/lib/types";
import { fmtShort } from "@/lib/format";
import { cn, withAlpha } from "@/lib/utils";
import { ReportStatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";

/* Marcador circular colorido por categoria (estilo "De Olho na Guanabara") */
function makeIcon(categoryColor: string, selected: boolean, resolved: boolean) {
  const s = selected ? 30 : 22;
  const color = resolved ? "#94a3b8" : categoryColor;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:grid; width:${s}px; height:${s}px; border-radius:9999px;
      background:${color}; border:${selected ? 4 : 3}px solid rgba(255,255,255,.95);
      box-shadow:${selected ? "0 0 0 5px " + color + "3a" : "0 4px 12px rgba(10,50,60,.4)"};
      place-items:center; transition: box-shadow .15s;
    ">${
      resolved
        ? `<span style="color:#fff; font-size:${selected ? 14 : 11}px; font-weight:900; line-height:1">✓</span>`
        : `<span style="width:${selected ? 10 : 7}px; height:${selected ? 10 : 7}px; border-radius:9999px; background:rgba(255,255,255,.95); display:block"></span>`
    }</span>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

/* Voar até o ponto selecionado */
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

/* Clicar no mapa vazio fecha o detalhe */
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

  return (
    <div>
      {/* Cabeçalho da página */}
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-8 sm:px-6">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Ilha de Deus · Recife
            </p>
            <h1 className="text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
              Mapa da fiscalização comunitária
            </h1>
            <p className="mt-3 text-muted-foreground">
              Cada ponto foi registrado pela comunidade e{" "}
              <b>verificado pela equipe</b> antes de virar público. Clique num
              marcador para ver o detalhe.
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

      {/* Mapa protagonista (quase tela inteira) */}
      <div className="relative w-full">
        <MapContainer
          center={ILHA_DE_DEUS_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="z-0 h-[62vh] min-h-[440px] w-full lg:h-[calc(100vh-300px)] lg:min-h-[580px]"
        >
          <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
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

        {/* Barra flutuante de filtros + legenda */}
        <div className="pointer-events-none absolute inset-x-0 top-3 z-[1100] flex justify-center px-3 sm:px-6">
          <div className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-card backdrop-blur">
            <div className="flex items-center gap-2 px-4 py-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-display font-semibold text-primary">
                <Filter className="h-4 w-4 text-lagoon" />
                Filtros
              </span>

              <div className="mx-1 h-5 w-px shrink-0 bg-border" />

              <div className="flex shrink-0 gap-1 rounded-full bg-secondary p-0.5">
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
                      "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                      situacao === s.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <span className="ml-auto hidden shrink-0 text-xs font-medium text-muted-foreground sm:inline">
                {visible.length} ponto{visible.length === 1 ? "" : "s"} no mapa ·{" "}
                {resolvedCount} resolvida{resolvedCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border/60 px-3 py-2.5 [scrollbar-width:thin]">
              {CATEGORIES.map((c) => {
                const on = cats.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition",
                      on
                        ? "border-transparent text-white shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary",
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detalhe do ponto selecionado */}
        {selected && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1100] flex justify-center p-3 sm:p-5">
            <DetailCard report={selected} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>

      {/* Faixa de confiança abaixo do mapa */}
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

/* ---------- Card de detalhe flutuante ---------- */

function DetailCard({ report, onClose }: { report: Report; onClose: () => void }) {
  const cat = getCategory(report.category);
  return (
    <article className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card">
      {report.photoUrl ? (
        <div className="relative">
          <img
            src={report.photoUrl}
            alt={report.title}
            className="h-44 w-full object-cover"
            crossOrigin="anonymous"
          />
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: cat.color }}
          >
            {cat.short}
          </span>
        </div>
      ) : (
        <div
          className="flex items-center justify-between gap-2 px-5 pt-4 pr-12"
        >
          <p
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: cat.color }}
          >
            {cat.short}
          </p>
          <ReportStatusPill status={report.status} resolved={report.resolved} />
        </div>
      )}

      <div className="px-5 pb-5 pt-3">
        {report.photoUrl && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <p
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: cat.color }}
            >
              {cat.short}
            </p>
            <ReportStatusPill status={report.status} resolved={report.resolved} />
          </div>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-primary">
          {report.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {report.reference} · {fmtShort(report.createdAt)}
        </p>
        <p className="mt-3 max-h-32 overflow-y-auto text-sm leading-relaxed text-muted-foreground">
          {report.description}
        </p>
        {report.resolved && report.resolutionNote && (
          <div
            className="mt-3 rounded-xl border border-accent p-3 text-sm text-accent-foreground"
            style={{ backgroundColor: withAlpha(cat.color, 0.08) }}
          >
            <b>Acompanhamento:</b> {report.resolutionNote}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar detalhe"
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/85 text-primary shadow-sm backdrop-blur transition hover:bg-background"
      >
        <X className="h-4 w-4" />
      </button>
    </article>
  );
}
