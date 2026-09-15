import { useState } from "react";
import { Camera } from "lucide-react";
import { useStore } from "@/lib/store";
import { compressAvatar, initials } from "@/lib/avatar";
import { creatureAvatarUrl } from "@/lib/map";
import { errorMessage } from "@/lib/api";
import type { Creature } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = {
  creature: Pick<Creature, "id" | "folderId" | "name" | "avatarVersion">;
  size?: number;
  /** Clicar abre o seletor de arquivo (só o Mestre chega aqui). */
  editable?: boolean;
  className?: string;
};

/** Foto da criatura (vira o token dela no mapa); sem foto, iniciais sobre vermelho escuro. */
export function CreatureAvatar({ creature, size = 40, editable = false, className }: Props) {
  const uploadCreatureAvatar = useStore((s) => s.uploadCreatureAvatar);
  const pushToast = useStore((s) => s.pushToast);
  const [busy, setBusy] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = creatureAvatarUrl(creature);
  const showImage = !!src && failedSrc !== src;

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const image = await compressAvatar(file);
      await uploadCreatureAvatar(creature.folderId, creature.id, image);
    } catch (e) {
      pushToast({ title: "Não foi possível usar essa imagem", description: errorMessage(e), tone: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const face = showImage ? (
    <img
      src={src}
      alt={`Foto de ${creature.name}`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="select-none font-mono font-semibold text-white" style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}>
      {initials(creature.name)}
    </span>
  );

  const circle = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white dark:ring-zinc-900",
    className,
  );
  const style = { width: size, height: size, backgroundColor: showImage ? "#e4e4e7" : "#7f1d1d" };

  if (!editable) {
    return (
      <span className={circle} style={style}>
        {face}
      </span>
    );
  }

  return (
    <label className={cn(circle, "group cursor-pointer")} style={style} title={src ? "Trocar foto da criatura" : "Enviar foto da criatura"}>
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
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </span>
    </label>
  );
}
