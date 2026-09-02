import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Reduz a imagem para caber no armazenamento local da demonstração.
function compressImage(file: File, maxDim = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (err) {
        reject(err as Error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Imagem inválida"));
    };
    img.src = url;
  });
}

export function ImageUpload({
  value,
  onChange,
  label,
  className,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Envie um arquivo de imagem (JPG, PNG…)");
      }
      const dataUrl = await compressImage(file);
      if (dataUrl.length > 4_500_000) {
        throw new Error("Imagem muito grande. Escolha uma foto menor.");
      }
      onChange(dataUrl);
    } catch (err) {
      setError((err as Error).message || "Não foi possível carregar a imagem.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img
            src={value}
            alt="Prévia da foto enviada"
            className="h-44 w-full object-cover"
            crossOrigin="anonymous"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-foreground/70 text-white backdrop-blur transition hover:bg-destructive"
            aria-label="Remover foto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/40 text-muted-foreground transition hover:border-lagoon/50 hover:bg-secondary",
          )}
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-lagoon" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
          <span className="px-4 text-center text-xs">
            {label ?? "Adicionar uma foto (opcional)"}
          </span>
        </button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
