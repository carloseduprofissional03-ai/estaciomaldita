import { Radio } from "lucide-react";
import { AlertasBlock } from "@/components/sections/alertas-block";
import { ALERTAS } from "@/lib/alerts";

export default function Alertas() {
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

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <AlertasBlock mostrarAvisoDemostracao />
      </section>
    </div>
  );
}
