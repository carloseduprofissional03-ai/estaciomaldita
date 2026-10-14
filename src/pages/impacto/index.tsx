import { BarChart3 } from "lucide-react";
import { ImpactoModulo } from "@/components/sections/impacto-modulo";

export default function Impacto() {
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
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Os relatórios do projeto são públicos — inclusive o que ainda não
            andou. Aqui estão os pontos registrados, os casos protocolados nos
            órgãos públicos, o tempo de espera de cada um e o que a comunidade
            resolveu com as próprias mãos.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <ImpactoModulo />
      </section>
    </div>
  );
}
