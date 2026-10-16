import { Link } from "react-router-dom";
import { MapPin, Plus } from "lucide-react";
import { OcorrenciasMap } from "@/components/sections/ocorrencias-map";
import { Button } from "@/components/ui/button";

export default function Mapa() {
  return (
    <div>
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
              equipe e tem uma trilha pública: publicado, encaminhado ao órgão com
              protocolo e, quando é o caso, o silêncio contado em dias.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="leaf">
              <Link to="/denuncias?aba=registrar">
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

      <OcorrenciasMap />

      <div className="border-t border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2 px-4 py-6 text-center sm:flex-row sm:gap-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            <b className="text-primary">Verificação antes de publicar:</b> todo
            ponto passa pela equipe e tem trilha pública, com órgão, protocolo e
            dias de espera. Quem denuncia fica protegido — contatos nunca aparecem
            no mapa.
          </p>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
            <Link
              to="/denuncias?aba=registrar"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-ocean-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Denunciar agora
            </Link>
            <Link
              to="/denuncias?aba=alertas"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-lagoon transition hover:bg-ocean-soft"
            >
              Ver os alertas ativos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
