import { Camera } from "lucide-react";
import { GaleriaBlock } from "@/components/sections/galeria-block";

export default function Galeria() {
  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Camera className="h-3.5 w-3.5" />
            Galeria da comunidade
          </p>
          <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
            O território visto por quem o vive
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Fotos enviadas pela comunidade e verificadas pela equipe. Mangue, rio,
            fauna e gente — o que vale a pena proteger.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <GaleriaBlock />
      </section>
    </div>
  );
}
