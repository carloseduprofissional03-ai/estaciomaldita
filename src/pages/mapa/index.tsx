import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Info, MapPin, Plus } from "lucide-react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { ILHA_DE_DEUS_CENTER, DEFAULT_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "@/lib/geo";
import { useData } from "@/components/data-provider";
import type { Report } from "@/lib/types";
import { fmtShort } from "@/lib/format";
import { cn, withAlpha } from "@/lib/utils";
import { ReportStatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";

function makeIcon(categoryColor: string, selected: boolean, resolved: boolean) {
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block; width:${selected ? 38 : 30}px; height:${selected ? 38 : 30}px;
      border-radius:9999px 9999px 9999px 2px; transform: rotate(-45deg);
      background:${resolved ? "#94a3b8" : categoryColor};
      border:3px solid #fff; box-shadow:0 6px 16px rgba(10,50,60,.35);
      display:grid; place-items:center;
    "><span style="transform:rotate(45deg); color:#fff; font-size:15px; font-weight:800; line-height:1">${
      resolved ? "✓" : "•"
    }</span></span>`,
    iconSize: [selected ? 38 : 30, selected ? 38 : 30],
    iconAnchor: [selected ? 19 : 15, selected ? 38 : 30],
    popupAnchor: [0, selected ? -36 : -30],
  });
}

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const last = useRef("");
  useEffect(() => {
    if (!position) return;
    const key = position.join(",");
    if (key !== last.current) {
      last.current = key;
      map.flyTo(position, 16, { duration: 0.8 });
    }
  }, [position, map]);
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

  const focus = selected ? ([selected.lat, selected.lng] as [number, number]) : null;

  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Ilha de Deus · Recife
            </p>
            <h1 className="text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
              Mapa da fiscalização comunitária
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Cada ponto abaixo foi registrado pela comunidade e <b>verificado
              pela equipe</b> antes de ser publicado. Use os filtros para
              explorar por tipo de problema e situação.
            </p>
          </div>
          <Button asChild variant="leaf">
            <Link to="/denunciar">
              <Plus className="h-4 w-4" />
              Nova denúncia
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="order-1 overflow-hidden rounded-3xl border border-border/70 shadow-card lg:order-2">
            <MapContainer
              center={ILHA_DE_DEUS_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              className="h-[420px] w-full lg:h-[calc(100vh-260px)] lg:min-h-[540px]"
            >
              <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
              <FlyTo position={focus} />
              {visible.map((r) => {
                const cat = getCategory(r.category);
                return (
                  <Marker
                    key={r.id}
                    position={[r.lat, r.lng]}
                    icon={makeIcon(cat.color, r.id === selectedId, r.resolved)}
                    eventHandlers={{
                      click: () => setSelectedId(r.id),
                    }}
                  >
                    <Popup>
                      <PopupContent report={r} />
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <aside className="order-2 lg:order-1">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-semibold text-primary">
                  Filtros
                </p>
                <span className="text-xs text-muted-foreground">
                  {visible.length} de {reports.length} denúncias ·{" "}
                  {resolvedCount} resolvidas
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      cats.has(c.id)
                        ? "border-transparent text-white"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary",
                    )}
                    style={
                      cats.has(c.id)
                        ? { backgroundColor: c.color }
                        : undefined
                    }
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: cats.has(c.id) ? "rgba(255,255,255,.85)" : c.color,
                      }}
                    />
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
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
                    onClick={() => setSituacao(s.id)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition",
                      situacao === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3 lg:max-h-[calc(100vh-430px)] lg:min-h-[220px] lg:overflow-y-auto lg:pr-1">
              {selected && <ReportCard report={selected} detail onClose={() => setSelectedId(null)} />}
              {visible.map((r) => (
                <ReportCard key={r.id} report={r} active={r.id === selectedId} onSelect={setSelectedId} />
              ))}
              {visible.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                  <Info className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma denúncia com esses filtros. Tente liberar categorias
                    ou mudar a situação.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ReportCard({
  report,
  active,
  onSelect,
  detail,
  onClose,
}: {
  report: Report;
  active?: boolean;
  onSelect?: (id: string) => void;
  detail?: boolean;
  onClose?: () => void;
}) {
  const cat = getCategory(report.category);
  return (
    <article
      className={cn(
        "cursor-pointer rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5",
        active || detail
          ? "border-lagoon shadow-card"
          : "border-border/70 shadow-card/60 hover:shadow-card",
      )}
      onClick={() => {
        if (detail && onClose) onClose();
        else if (onSelect) onSelect(report.id);
      }}
      style={active || detail ? { borderLeft: `4px solid ${cat.color}` } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: cat.color }}>
          {cat.label}
        </p>
        <ReportStatusPill status={report.status} resolved={report.resolved} />
      </div>
      <h3 className="mt-1.5 font-display text-[15px] font-semibold leading-snug text-primary">
        {report.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {report.reference} · {fmtShort(report.createdAt)}
      </p>

      {detail && (
        <div className="mt-3 space-y-3">
          {report.photoUrl && (
            <img
              src={report.photoUrl}
              alt={report.title}
              className="h-44 w-full rounded-xl object-cover"
              crossOrigin="anonymous"
            />
          )}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {report.description}
          </p>
          {report.resolved && report.resolutionNote && (
            <div
              className="rounded-xl border border-accent p-3 text-sm text-accent-foreground"
              style={{ backgroundColor: withAlpha(cat.color, 0.08) }}
            >
              <b>Acompanhamento:</b> {report.resolutionNote}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function PopupContent({ report }: { report: Report }) {
  const cat = getCategory(report.category);
  return (
    <div className="w-56 space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cat.color }}>
        {cat.label}
      </p>
      <p className="font-display text-sm font-semibold leading-snug text-primary">
        {report.title}
      </p>
      <ReportStatusPill status={report.status} resolved={report.resolved} />
      <p className="text-xs text-muted-foreground">{report.reference}</p>
      {report.photoUrl && (
        <img
          src={report.photoUrl}
          alt=""
          className="mt-1 h-24 w-full rounded-lg object-cover"
          crossOrigin="anonymous"
        />
      )}
      {report.resolved && report.resolutionNote && (
        <p className="rounded-lg bg-secondary/60 p-2 text-xs">{report.resolutionNote}</p>
      )}
    </div>
  );
}
