import { useEffect, useState } from "react";
import { Camera, X } from "lucide-react";
import { compressAvatar, initials } from "@/lib/avatar";
import { errorMessage } from "@/lib/api";

type Props = {
  value: Blob | null;
  onChange: (image: Blob | null) => void;
  name: string;
  color?: string;
};

/** Foto de perfil na criação: comprime no navegador e só envia depois que a ficha existe. */
export function AvatarPicker({ value, onChange, name, color }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await compressAvatar(file));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label
        className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-2 ring-zinc-200 dark:ring-zinc-700"
        style={{ backgroundColor: preview ? "#e4e4e7" : (color ?? "#7c3aed") }}
        title="Escolher foto de perfil"
      >
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            void onPick(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {preview ? (
          <img src={preview} alt="Prévia da foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <span className="font-mono text-2xl font-semibold text-white">{initials(name || "?")}</span>
        )}
        <span className="absolute inset-x-0 bottom-0 flex justify-center bg-black/45 py-0.5 text-white">
          {busy ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
        </span>
      </label>
      <div className="space-y-1 text-xs text-zinc-500">
        <div className="font-medium text-zinc-700 dark:text-zinc-300">Foto de perfil (opcional)</div>
        <p>Aparece na lista da mesa e no topo da ficha. Dá para trocar depois.</p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-red-600"
          >
            <X className="h-3 w-3" /> remover
          </button>
        )}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}
