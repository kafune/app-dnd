import { useState } from "react";
import { Camera } from "lucide-react";
import { useStore } from "@/lib/store";
import { avatarUrl, compressAvatar, initials } from "@/lib/avatar";
import { errorMessage } from "@/lib/api";
import type { Character } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = {
  character: Pick<Character, "id" | "characterName" | "color" | "avatarVersion">;
  /** Diâmetro em px. */
  size?: number;
  /** Clicar abre o seletor de arquivo e envia a foto (precisa da ficha destravada). */
  editable?: boolean;
  className?: string;
};

/** Foto de perfil redonda; sem foto, mostra as iniciais sobre a cor do personagem. */
export function CharacterAvatar({ character, size = 48, editable = false, className }: Props) {
  const uploadAvatar = useStore((s) => s.uploadAvatar);
  const pushToast = useStore((s) => s.pushToast);
  const [busy, setBusy] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = avatarUrl(character);
  const showImage = !!src && failedSrc !== src;

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const image = await compressAvatar(file);
      await uploadAvatar(character.id, image);
    } catch (e) {
      pushToast({ title: "Não foi possível usar essa imagem", description: errorMessage(e), tone: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const face = showImage ? (
    <img
      src={src}
      alt={`Foto de ${character.characterName}`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="select-none font-mono font-semibold text-white" style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}>
      {initials(character.characterName)}
    </span>
  );

  const circle = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white dark:ring-zinc-900",
    className,
  );
  const style = { width: size, height: size, backgroundColor: showImage ? "#e4e4e7" : (character.color ?? "#71717a") };

  if (!editable) {
    return (
      <span className={circle} style={style}>
        {face}
      </span>
    );
  }

  return (
    <span className="relative inline-flex shrink-0">
      <label className={cn(circle, "group cursor-pointer")} style={style} title={src ? "Trocar foto de perfil" : "Enviar foto de perfil"}>
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
        {face}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/45 text-white transition",
            busy ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          )}
        >
          {busy ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </span>
      </label>
      {!busy && (
        <span className="pointer-events-none absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Camera className="h-3.5 w-3.5" />
        </span>
      )}
    </span>
  );
}
