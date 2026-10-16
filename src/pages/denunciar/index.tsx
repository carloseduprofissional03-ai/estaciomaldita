import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { DenunciaForm } from "@/components/sections/denuncia-form";

export default function Denunciar() {
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
            Preencha o formulário e marque o local no mapa. Contato é opcional e{" "}
            <b>nunca publicado</b> — quem denuncia está protegido.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Depois da verificação, o ponto entra na trilha pública de
            acompanhamento: encaminhamento ao órgão responsável com número de
            protocolo e contagem dos dias de espera. Viu algo acontecendo agora e
            quer avisar rápido? Use o{" "}
            <Link
              to="/denuncias?aba=alertas"
              className="font-semibold text-primary underline underline-offset-2"
            >
              mapa de alerta
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <DenunciaForm />
      </section>
    </div>
  );
}
