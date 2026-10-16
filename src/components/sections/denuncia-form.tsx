import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CheckCircle2,
  Crosshair,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import {
  ILHA_DE_DEUS_CENTER,
  SATELLITE_URL,
  SATELLITE_ATTRIBUTION,
} from "@/lib/geo";
import { useData } from "@/components/data-provider";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Formulário de denúncia com marcador no mapa de satélite.
 * Usado na página /denunciar e na aba "Registrar denúncia" de /denuncias.
 */

const pointIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0f7a5f;border:3px solid #fff;box-shadow:0 0 0 4px rgba(15,122,95,.25),0 8px 18px rgba(10,60,60,.45);"></span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

interface Point {
  lat: number;
  lng: number;
}

function FlyTo({ target }: { target: Point | null }) {
  const map = useMap();
  const last = useRef("");
  useEffect(() => {
    if (!target) return;
    const key = `${target.lat.toFixed(6)},${target.lng.toFixed(6)}`;
    if (key !== last.current) {
      last.current = key;
      map.flyTo([target.lat, target.lng], 17, { duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

export function DenunciaForm() {
  const { actions } = useData();
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [point, setPoint] = useState<Point | null>(null);
  const [flyTarget, setFlyTarget] = useState<Point | null>(null);
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function useMyLocation() {
    setLocMsg(null);
    if (!("geolocation" in navigator)) {
      setLocMsg(
        "Seu navegador não suporta localização. Clique no mapa para marcar o ponto.",
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPoint(p);
        setFlyTarget(p);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocMsg(
          "Não conseguimos acessar sua localização. Permita o acesso no navegador ou clique no mapa para marcar.",
        );
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 },
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category) return setError("Escolha a categoria do problema.");
    if (title.trim().length < 5)
      return setError("Dê um título curto para a ocorrência (mín. 5 letras).");
    if (description.trim().length < 15)
      return setError("Descreva o que você viu com alguns detalhes.");
    if (!point) return setError("Marque o local no mapa ao lado.");
    if (!reference.trim()) return setError("Informe um ponto de referência do local.");
    setError(null);
    actions.addReport({
      category,
      title: title.trim(),
      description: description.trim(),
      reference: reference.trim(),
      lat: point.lat,
      lng: point.lng,
      photoUrl: photo || undefined,
      contact: contact.trim() || undefined,
    });
    setSent(true);
  }

  function novaDenuncia() {
    setSent(false);
    setCategory("");
    setTitle("");
    setDescription("");
    setReference("");
    setContact("");
    setPhoto(undefined);
    setPoint(null);
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-accent bg-accent/50 p-6 text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-leaf text-white shadow-leaf">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-balance font-display text-2xl font-semibold text-primary">
          Denúncia recebida — agora ela passa pela verificação da equipe
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Nada é publicado sem conferência. Assim que a equipe verificar o
          registro, o ponto aparece no mapa comunitário — e passa a ter uma trilha
          pública: encaminhamento ao órgão responsável, número de protocolo e
          contagem dos dias de espera.
        </p>
        <div className="mx-auto mt-4 max-w-lg rounded-xl bg-sand px-4 py-3 text-xs leading-relaxed text-foreground/75">
          Nesta versão (sem servidor), o registro fica salvo neste navegador.
          Quando a ferramenta completa estiver ativa, a denúncia chega
          automaticamente para a equipe.
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="leaf" onClick={novaDenuncia}>
            Enviar outra denúncia
          </Button>
          <Button asChild variant="outline">
            <Link to="/denuncias?aba=mapa">Ver o mapa</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
      {/* Localização vem primeiro (importante no celular) */}
      <div className="lg:order-2">
        <div className="overflow-hidden rounded-3xl border border-border/70 shadow-card lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Crosshair className="h-4 w-4" />
              Onde aconteceu?
            </p>
            {point ? (
              <span className="rounded-full bg-leaf px-2.5 py-1 text-[10px] font-bold text-white">
                local marcado
              </span>
            ) : (
              <span className="animate-pulse rounded-full bg-amber-400/90 px-2.5 py-1 text-[10px] font-bold text-amber-950">
                aguardando local
              </span>
            )}
          </div>

          <div className="relative">
            <MapContainer
              center={ILHA_DE_DEUS_CENTER}
              zoom={15}
              scrollWheelZoom
              className="z-0 h-[340px] w-full lg:h-[400px]"
              eventHandlers={{
                click: (e) => {
                  setPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
                  setLocMsg(null);
                },
              }}
            >
              <TileLayer attribution={SATELLITE_ATTRIBUTION} url={SATELLITE_URL} />
              <FlyTo target={flyTarget} />
              {point && (
                <Marker
                  position={[point.lat, point.lng]}
                  icon={pointIcon}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const m = e.target as L.Marker;
                      const p = m.getLatLng();
                      setPoint({ lat: p.lat, lng: p.lng });
                    },
                  }}
                />
              )}
            </MapContainer>

            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="absolute right-3 top-3 z-[1000] inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white/95 px-3.5 py-2 text-xs font-semibold text-primary shadow-card backdrop-blur transition hover:bg-white disabled:opacity-60"
            >
              {locating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-lagoon" />
              ) : (
                <Crosshair className="h-3.5 w-3.5 text-lagoon" />
              )}
              {locating ? "Buscando…" : "Usar minha localização"}
            </button>
          </div>
        </div>

        {locMsg && (
          <div className="mt-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs leading-relaxed text-destructive">
            {locMsg}
          </div>
        )}
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-sand px-4 py-3 text-xs leading-relaxed text-foreground/75">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf-deep" />
          <span>
            Toque em <b>“Usar minha localização”</b> ou clique no mapa para fixar
            o ponto. Você pode arrastar o marcador para ajustar e usar o zoom se
            precisar.
          </span>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-7 lg:order-1">
        <FieldBlock
          title="1. Qual é o problema?"
          hint="Escolha a categoria que mais se aproxima"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition",
                  category === c.id
                    ? "border-lagoon bg-ocean-soft shadow-card"
                    : "border-border/70 bg-card hover:border-lagoon/40",
                )}
              >
                <span
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white"
                  style={{ backgroundColor: c.color }}
                >
                  {category === c.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {c.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {c.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </FieldBlock>

        <FieldBlock
          title="2. O que aconteceu?"
          hint="Quanto mais claro, melhor para a verificação"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título curto, ex.: Entulho despejado na Rua São Marcos"
            className="field"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Descreva o que você viu: quando aconteceu, o que foi despejado, se há pessoas envolvidas…"
            className="field mt-3 resize-none"
          />
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Ponto de referência (ex.: perto da escola, ao lado do trapiche)"
            className="field mt-3"
          />
        </FieldBlock>

        <FieldBlock title="3. Registro visual e contato" hint="Foto e contato são opcionais">
          <ImageUpload value={photo} onChange={setPhoto} />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Como podemos te contatar em caso de dúvida? (opcional)"
            className="field mt-3"
          />
        </FieldBlock>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" variant="leaf" size="lg">
            <Send className="h-4 w-4" />
            Enviar denúncia
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-leaf" />
            Seus dados são protegidos e o registro só é publicado após
            verificação.
          </p>
        </div>
      </form>
    </div>
  );
}

function FieldBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-primary">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
