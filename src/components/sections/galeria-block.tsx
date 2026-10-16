import { useMemo, useState, type FormEvent } from "react";
import { Camera, CheckCircle2, Images, Send } from "lucide-react";
import { useData } from "@/components/data-provider";
import { ImageUpload } from "@/components/image-upload";
import { Carrossel } from "@/components/carrossel";
import { fmtShort } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/*
 * Galeria da comunidade: envio de fotos + mural em carrossel, com visualizador
 * ampliado (lightbox) ao clicar numa foto.
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
  const [fotoAberta, setFotoAberta] = useState<string | null>(null);

  const foto = fotos.find((f) => f.id === fotoAberta) ?? null;

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
            <h3 className="font-display text-xl font-semibold text-primary">
              Envie uma foto do território
            </h3>
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

      <div className="mt-8">
        <Carrossel
          rotulo="Galeria de fotos da comunidade"
          vazio={
            <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
              Ainda não há fotos aprovadas.
            </p>
          }
        >
          {fotos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFotoAberta(p.id)}
              className="group block h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-card transition hover:-translate-y-1"
            >
              <div className="overflow-hidden">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="p-4">
                <p className="truncate font-display text-base font-semibold text-primary">
                  {p.title}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {p.author} · {fmtShort(p.createdAt)}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary underline-offset-2 group-hover:underline">
                  <Images className="h-3.5 w-3.5" />
                  Ampliar foto
                </span>
              </div>
            </button>
          ))}
        </Carrossel>
      </div>

      <Dialog
        open={!!foto}
        onOpenChange={(v) => {
          if (!v) setFotoAberta(null);
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden bg-card p-0">
          {foto && (
            <div>
              <img
                src={foto.imageUrl}
                alt={foto.title}
                className="max-h-[65vh] w-full bg-foreground/95 object-contain"
                crossOrigin="anonymous"
              />
              <div className="p-5">
                <DialogTitle className="font-display text-lg font-semibold text-primary">
                  {foto.title}
                </DialogTitle>
                {foto.description && (
                  <DialogDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {foto.description}
                  </DialogDescription>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Enviada por {foto.author} · {fmtShort(foto.createdAt)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
