import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CheckCircle2, Crosshair, MapPin, Send, ShieldCheck } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { ILHA_DE_DEUS_CENTER, TILE_URL, TILE_ATTRIBUTION } from "@/lib/geo";
import { useData } from "@/components/data-provider";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pointIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0f7a5f;border:3px solid #fff;box-shadow:0 6px 14px rgba(10,60,60,.4);"></span>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

interface Point {
  lat: number;
  lng: number;
}

export default function Denunciar() {
  const { actions } = useData();
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [point, setPoint] = useState<Point | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
    window.scrollTo(0, 0);
  }

  if (sent) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-leaf text-white shadow-leaf">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-balance font-display text-3xl font-semibold text-primary">
          Denúncia recebida — agora ela passa pela verificação da equipe
        </h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Nada é publicado sem conferência. Assim que a equipe verificar o
          registro, o ponto aparece no mapa comunitário.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="leaf">
            <Link to="/mapa">Ver o mapa</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/denuncias">Entender o processo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Send className="h-3.5 w-3.5" />
            Participe
          </p>
          <h1 className="text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            Registre uma denúncia no território
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Preencha o formulário e marque o local no mapa. Contato é opcional
            e <b>nunca publicado</b> — quem denuncia está protegido.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <form onSubmit={handleSubmit} className="space-y-7">
            <FieldBlock title="1. Qual é o problema?" hint="Escolha a categoria que mais se aproxima">
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

            <FieldBlock title="2. O que aconteceu?" hint="Quanto mais claro, melhor para a verificação">
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

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-border/70 shadow-card">
              <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-white">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Crosshair className="h-4 w-4" />
                  Marque o local no mapa
                </p>
                {point ? (
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium">
                    {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                  </span>
                ) : (
                  <span className="animate-pulse rounded-full bg-amber-400/90 px-2.5 py-1 text-[10px] font-bold text-amber-950">
                    aguardando clique
                  </span>
                )}
              </div>
              <MapContainer
                center={ILHA_DE_DEUS_CENTER}
                zoom={16}
                scrollWheelZoom
                className="h-[380px] w-full lg:h-[460px]"
                eventHandlers={{
                  click: (e) => {
                    setPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
                  },
                }}
              >
                <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
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
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-sand px-4 py-3 text-xs leading-relaxed text-foreground/75">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf-deep" />
              <span>
                Clique no mapa para fixar o ponto exato da ocorrência. Você pode
                arrastar o marcador para ajustar. Aproxime com o zoom se precisar.
              </span>
            </div>
          </div>
        </div>
      </section>
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
