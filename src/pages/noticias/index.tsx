import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Newspaper } from "lucide-react";
import { useData } from "@/components/data-provider";
import { fmtShort } from "@/lib/format";

export default function Noticias() {
  const { db } = useData();
  const noticias = useMemo(
    () =>
      db.news
        .filter((n) => n.status === "approved")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.news],
  );

  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-foam to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-ocean-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Newspaper className="h-3.5 w-3.5" />
            Notícias do território
          </p>
          <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
            Acompanhe a comunidade em movimento
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Mutirões, registros de fauna, oficinas e conquistas — histórias
            escritas pela comunidade e verificadas pela equipe.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        {noticias.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-muted-foreground">
            Ainda não há notícias publicadas.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n) => (
              <Link
                key={n.id}
                to={`/noticias/${n.id}`}
                className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition hover:-translate-y-1"
              >
                {n.coverUrl && (
                  <div className="overflow-hidden">
                    <img
                      src={n.coverUrl}
                      alt={n.title}
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                <div className="p-5">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {fmtShort(n.createdAt)} · {n.author}
                  </p>
                  <h2 className="mt-2 line-clamp-2 font-display text-xl font-semibold leading-snug text-primary group-hover:underline">
                    {n.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {n.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
