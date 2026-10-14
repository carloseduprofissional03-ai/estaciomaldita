import { useMemo, useState, type FormEvent } from "react";
import { Camera, CheckCircle2, Images, Send } from "lucide-react";
import { useData } from "@/components/data-provider";
import { ImageUpload } from "@/components/image-upload";
import { fmtShort } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Galeria da comunidade: envio de fotos + mural. Usada na página /galeria e
 * como aba dentro de /noticias.
 */
export function GaleriaBlock() {
  const { db, actions } = useData();
  const fotos = useMemo(
    () =>
      db.photos
        .filter((p) => p.status === "approved")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.photos],
  );

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!image) return setError("Escolha uma foto para enviar.");
    if (title.trim().length < 3) return setError("Dê um título para a foto.");
    if (author.trim().length < 2)
      return setError("Diga quem está enviando (pode ser um apelido).");
    actions.addPhoto(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: image,
        author: author.trim(),
      },
      false,
    );
    setDone(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Images className="h-4 w-4 text-lagoon" />
          {fotos.length} foto(s) publicada(s) pela comunidade
        </p>
        <Button variant="leaf" onClick={() => setOpen((v) => !v)}>
          <Camera className="h-4 w-4" />
          {open ? "Fechar" : "Enviar uma foto"}
        </Button>
      </div>

      {open &&
        (done ? (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-accent bg-accent/50 p-5">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-leaf-deep" />
            <div>
              <p className="font-semibold text-primary">Foto enviada!</p>
              <p className="text-sm text-muted-foreground">
                Ela passa pela verificação da equipe antes de aparecer na galeria.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-card sm:p-8"
          >
            <h2 className="font-display text-xl font-semibold text-primary">
              Envie uma foto do território
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mutirões, mangue, aves, rio, comunidade… o que merece registro?
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ImageUpload value={image} onChange={setImage} label="Escolher foto" />
              <div className="space-y-3">
                <input
                  className="field"
                  placeholder="Título da foto"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <input
                  className="field"
                  placeholder="Descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  className="field"
                  placeholder="Quem enviou (apelido ok)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="leaf" className="mt-5">
              <Send className="h-4 w-4" />
              Enviar para verificação
            </Button>
          </form>
        ))}

      {fotos.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-muted-foreground">
          Ainda não há fotos aprovadas.
        </div>
      ) : (
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {fotos.map((p) => (
            <figure
              key={p.id}
              className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
            >
              <img
                src={p.imageUrl}
                alt={p.title}
                className={cn(
                  "w-full object-cover transition duration-500 group-hover:scale-[1.03]",
                  p.description && p.description.length > 80 ? "h-96" : "h-64",
                )}
                crossOrigin="anonymous"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 to-transparent p-4 pt-12 text-white">
                <p className="font-display text-base font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs text-white/80">
                  {p.description}
                  {p.description ? " · " : ""}
                  {p.author} · {fmtShort(p.createdAt)}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
