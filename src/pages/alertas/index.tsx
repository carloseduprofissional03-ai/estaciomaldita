import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  CheckCircle2,
  Crosshair,
  Info,
  Loader2,
  MapPin,
  Radio,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import {
  ILHA_DE_DEUS_CENTER,
  DEFAULT_ZOOM,
  SATELLITE_URL,
  SATELLITE_ATTRIBUTION,
} from "@/lib/geo";
import {
  ALERTAS,
  ALERTAS_CONECTADOS,
  ALERTAS_EXEMPLO,
  buscarAlertas,
  enviarAlerta,
  lerCache,
  type Alerta,
} from "@/lib/alerts";
import { TEAM_CONTACT_EMAIL } from "@/lib/site";
import { daysSince, fmtShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Point {
  lat: number;
  lng: number;
}

function alertIcon(color: string, selected: boolean) {
  const s = selected ? 30 : 22;
  return L.divIcon({
    className: "",
    html: `<span style="display:grid;width:${s}px;height:${s}px;border-radius:9999px;background:${color};border:2px solid rgba(255,255,255,.95);box-shadow:0 0 0 2px rgba(255,255,255,.25),0 0 ${selected ? 24 : 12}px ${color}b3;place-items:center;">${
      selected
        ? `<span class="marker-ping" style="background:${color}"></span>`
        : ""
    }<span style="width:${selected ? 8 : 6}px;height:${selected ? 8 : 6}px;border-radius:9999px;background:rgba(255,255,255,.95)"></span></span>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

const pickIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0f7a5f;border:3px solid #fff;box-shadow:0 0 0 4px rgba(15,122,95,.25),0 8px 18px rgba(10,60,60,.45);"></span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

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

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>(() =>
    ALERTAS_CONECTADOS ? lerCache() : ALERTAS_EXEMPLO,
  );
  const [carregando, setCarregando] = useState(ALERTAS_CONECTADOS);
  const [aviso, setAviso] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const [categoria, setCategoria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [referencia, setReferencia] = useState("");
  const [contato, setContato] = useState("");
  const [point, setPoint] = useState<Point | null>(null);
  const [flyTarget, setFlyTarget] = useState<Point | null>(null);
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState<"planilha" | "email" | null>(null);

  useEffect(() => {
    if (!ALERTAS_CONECTADOS) return;
    let ativo = true;
    void buscarAlertas().then((r) => {
      if (!ativo) return;
      setCarregando(false);
      if (r.ok) {
        setAlertas(r.alertas);
        setAviso(null);
      } else {
        setAviso(
          "Não conseguimos carregar os alertas agora. Mostrando a última lista salva neste navegador.",
        );
      }
    });
    return () => {
      ativo = false;
    };
  }, []);

  const selecionadoAlerta = useMemo(
    () => alertas.find((a) => a.id === selecionado) ?? null,
    [alertas, selecionado],
  );

  function selectAlerta(a: Alerta) {
    setSelecionado((cur) => (cur === a.id ? null : a.id));
    setFlyTarget({ lat: a.lat, lng: a.lng });
  }

  function useMyLocation() {
    setLocMsg(null);
    if (!("geolocation" in navigator)) {
      setLocMsg("Seu navegador não suporta localização. Clique no mapa para marcar.");
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
          "Não conseguimos acessar sua localização. Permita o acesso ou clique no mapa para marcar.",
        );
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 },
    );
  }

  function abrirEmail() {
    const mapa = point
      ? `https://www.google.com/maps?q=${point.lat.toFixed(6)},${point.lng.toFixed(6)}`
      : "";
    const corpo = [
      `Título: ${titulo}`,
      `Tipo: ${getCategory(categoria).label}`,
      referencia.trim() ? `Referência: ${referencia.trim()}` : "",
      mapa ? `Local no mapa: ${mapa}` : "",
      "",
      descricao,
      contato.trim() ? `\nContato: ${contato.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${TEAM_CONTACT_EMAIL}?subject=${encodeURIComponent(
      `Alerta da comunidade — ${titulo}`,
    )}&body=${encodeURIComponent(corpo)}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoria) return setErro("Escolha o tipo de alerta.");
    if (titulo.trim().length < 5)
      return setErro("Dê um título curto para o alerta (mín. 5 letras).");
    if (descricao.trim().length < 10)
      return setErro("Descreva rapidamente o que você está vendo.");
    if (!point) return setErro("Marque o local no mapa.");
    setErro(null);

    if (!ALERTAS_CONECTADOS) {
      abrirEmail();
      setSucesso("email");
      return;
    }

    setEnviando(true);
    const res = await enviarAlerta({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      lat: point.lat,
      lng: point.lng,
      referencia: referencia.trim(),
      contato: contato.trim() || undefined,
    });
    setEnviando(false);
    if (!res.ok) {
      setErro(
        "Não conseguimos enviar o alerta agora. Tente de novo em alguns instantes.",
      );
      return;
    }
    setSucesso("planilha");
    setAlertas((prev) => [
      {
        id: `local_${Date.now()}`,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        lat: point.lat,
        lng: point.lng,
        referencia: referencia.trim(),
        criadoEm: new Date().toISOString(),
      },
      ...prev,
    ]);
    setTitulo("");
    setDescricao("");
    setReferencia("");
    setContato("");
    setCategoria("");
    setPoint(null);
  }

  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Radio className="h-3.5 w-3.5" />
            Mapa de alerta
          </p>
          <h1 className="text-balance font-display text-3xl font-semibold text-primary sm:text-4xl">
            Alerta rápido da comunidade
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Viu algo acontecendo agora — lixo despejado, esgoto correndo, fumaça
            de queima? Marque no mapa em menos de um minuto. Alerta{" "}
            <b>não passa por verificação</b>: é um aviso entre vizinhos, e sai do
            ar sozinho depois de {ALERTAS.validadeDias} dias.
          </p>
        </div>
      </section>

      {!ALERTAS_CONECTADOS && (
        <div className="border-b border-border/60 bg-sand">
          <div className="mx-auto flex w-full max-w-7xl items-start gap-3 px-4 py-4 sm:px-6">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="max-w-4xl text-xs leading-relaxed text-foreground/85">
              <b>Mapa de alerta em modo demonstração.</b> A planilha
              colaborativa ainda não está conectada, então os pontos abaixo são
              exemplos do piloto. Ao enviar, o site prepara um e-mail com o
              alerta para a equipe — o mapa coletivo entra no ar assim que a
              planilha for ligada (veja a aba{" "}
              <Link to="/admin" className="font-semibold underline underline-offset-2">
                Mapa de alerta
              </Link>{" "}
              na área da equipe).
            </p>
          </div>
        </div>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          {/* MAPA + LISTA */}
          <div className="lg:order-2">
            <div className="overflow-hidden rounded-3xl border border-border/70 shadow-card lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-white">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4" />
                  Alertas no território
                </p>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold">
                  {carregando ? "carregando…" : `${alertas.length} ativo(s)`}
                </span>
              </div>

              <div className="relative">
                <MapContainer
                  center={ILHA_DE_DEUS_CENTER}
                  zoom={DEFAULT_ZOOM}
                  scrollWheelZoom
                  className="z-0 h-[360px] w-full"
                  eventHandlers={{
                    click: (e) => {
                      setPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
                      setLocMsg(null);
                    },
                  }}
                >
                  <TileLayer
                    attribution={SATELLITE_ATTRIBUTION}
                    url={SATELLITE_URL}
                  />
                  <FlyTo target={flyTarget} />
                  {alertas.map((a) => (
                    <Marker
                      key={a.id}
                      position={[a.lat, a.lng]}
                      icon={alertIcon(
                        getCategory(a.categoria).color,
                        a.id === selecionado,
                      )}
                      eventHandlers={{ click: () => selectAlerta(a) }}
                    />
                  ))}
                  {point && (
                    <Marker
                      position={[point.lat, point.lng]}
                      icon={pickIcon}
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

              <div className="max-h-[320px] overflow-y-auto border-t border-border/60">
                {aviso && (
                  <p className="border-b border-border/60 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
                    {aviso}
                  </p>
                )}
                {alertas.length === 0 && !carregando ? (
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    Nenhum alerta ativo agora. Que bom sinal.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {alertas.map((a) => {
                      const cat = getCategory(a.categoria);
                      const aberto = a.id === selecionado;
                      return (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => selectAlerta(a)}
                            className={cn(
                              "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                              aberto ? "bg-ocean-soft" : "hover:bg-secondary/60",
                            )}
                          >
                            <span
                              className="mt-1 h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-foreground">
                                {a.titulo}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                {cat.short}
                                {a.referencia ? ` · ${a.referencia}` : ""} · há{" "}
                                {daysSince(a.criadoEm)} dia(s)
                              </span>
                              {aberto && (
                                <>
                                  <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                                    {a.descricao}
                                  </span>
                                  <span className="mt-1 block text-[11px] text-muted-foreground/80">
                                    Registrado em {fmtShort(a.criadoEm)} · sai do
                                    ar em {ALERTAS.validadeDias} dias
                                  </span>
                                </>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
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
                Toque num marcador para ver o alerta, ou clique no mapa para
                marcar o local do seu aviso. Você pode arrastar o marcador verde
                para ajustar a posição.
              </span>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="lg:order-1">
            {sucesso && (
              <div className="mb-5 rounded-2xl bg-accent/60 p-4">
                <p className="flex items-center gap-2 font-semibold text-accent-foreground">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  {sucesso === "planilha"
                    ? "Alerta enviado para o mapa!"
                    : "Preparamos o e-mail com o seu alerta"}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-accent-foreground/90">
                  {sucesso === "planilha"
                    ? "Ele já aparece na lista deste navegador e entra no mapa coletivo em poucos minutos."
                    : "Abra o rascunho no seu aplicativo de e-mail e envie para a equipe. Enquanto a planilha não está conectada, é assim que os alertas chegam até nós."}
                </p>
                <button
                  type="button"
                  onClick={() => setSucesso(null)}
                  className="mt-2 text-xs font-semibold underline underline-offset-2"
                >
                  Enviar outro alerta
                </button>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-card"
            >
              <h2 className="font-display text-lg font-semibold text-primary">
                Registrar um alerta
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Rápido e sem cadastro. É um aviso da comunidade, sem
                verificação prévia da equipe.
              </p>

              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tipo de alerta
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoria(c.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition",
                      categoria === c.id
                        ? "border-transparent text-white"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary",
                    )}
                    style={
                      categoria === c.id ? { backgroundColor: c.color } : undefined
                    }
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          categoria === c.id ? "rgba(255,255,255,.9)" : c.color,
                      }}
                    />
                    {c.short}
                  </button>
                ))}
              </div>

              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título curto, ex.: Lixo acumulado perto do trapiche"
                className="field mt-4"
              />
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="O que você está vendo agora? Desde quando?"
                className="field mt-3 resize-none"
              />
              <input
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ponto de referência (opcional)"
                className="field mt-3"
              />
              <input
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Contato (opcional, não aparece no mapa)"
                className="field mt-3"
              />

              {erro && (
                <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
                  {erro}
                </p>
              )}

              <Button
                type="submit"
                variant="leaf"
                size="lg"
                className="mt-4 w-full"
                disabled={enviando}
              >
                {enviando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {enviando ? "Enviando…" : "Publicar alerta no mapa"}
              </Button>

              <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" />
                <span>
                  {point
                    ? "Local marcado no mapa."
                    : "Falta marcar o local no mapa ao lado."}{" "}
                  Alertas ficam {ALERTAS.validadeDias} dias no ar e podem ser
                  removidos pela equipe se forem ofensivos ou falsos.
                </span>
              </p>
            </form>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-card/70 p-4">
              <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-lagoon" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <b className="text-foreground">Alerta não é denúncia.</b> Alerta
                é aviso rápido entre vizinhos: sem verificação e com prazo de{" "}
                {ALERTAS.validadeDias} dias. A{" "}
                <Link
                  to="/denunciar"
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  denúncia
                </Link>{" "}
                é verificada pela equipe, entra na trilha de acompanhamento e é
                cobrada do órgão responsável — com protocolo e contagem de dias.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
