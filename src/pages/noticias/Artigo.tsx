import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { useData } from "@/components/data-provider";
import { fmtFull } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default function ArtigoNoticia() {
  const { id } = useParams<{ id: string }>();
  const { db } = useData();

  const noticia = useMemo(
    () => db.news.find((n) => n.id === id && n.status === "approved") ?? null,
    [db.news, id],
  );

  if (!noticia) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-primary">
          Notícia não encontrada ou ainda em verificação.
        </h1>
        <Button asChild variant="leaf" className="mt-6">
          <Link to="/noticias">Voltar para as notícias</Link>
        </Button>
      </div>
    );
  }

  const paragraphs = noticia.body.split(/\n{2,}/);

  return (
    <article>
      {noticia.coverUrl && (
        <div className="relative h-[320px] w-full overflow-hidden sm:h-[420px]">
          <img
            src={noticia.coverUrl}
            alt={noticia.title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/noticias"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-lagoon transition hover:text-leaf-deep"
        >
          <ArrowLeft className="h-4 w-4" />
          Todas as notícias
        </Link>

        <h1 className="mt-6 text-balance font-display text-3xl font-semibold leading-tight text-primary sm:text-4xl">
          {noticia.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-4 w-4" />
            {noticia.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {fmtFull(noticia.createdAt)}
          </span>
        </div>

        <p className="mt-6 border-l-4 border-leaf pl-4 font-display text-lg italic leading-relaxed text-foreground/85">
          {noticia.summary}
        </p>

        <div className="mt-8 space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-foreground/85">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-foam p-6 text-center">
          <p className="font-display text-lg font-semibold text-primary">
            Quer acompanhar de perto?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Denuncie, participe de um mutirão ou envie sua história.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild variant="leaf">
              <Link to="/denuncias?aba=registrar">Fazer uma denúncia</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/voluntariado">Ver mutirões</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
