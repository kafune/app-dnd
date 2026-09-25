import { useState } from "react";
import { Camera } from "lucide-react";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/avatar";
import { ImageCropDialog } from "@/components/ui/ImageCropDialog";
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
  /** Arquivo escolhido, aguardando o ajuste (recorte/zoom) no diálogo. */
  const [pending, setPending] = useState<File | null>(null);

  const onError = (e: unknown) => {
    setPending(null);
    pushToast({ title: "Não foi possível usar essa imagem", description: errorMessage(e), tone: "danger" });
  };

  const onCropped = async (image: Blob) => {
    setPending(null);
    setBusy(true);
    try {
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
          const file = event.target.files?.[0];
          if (file) setPending(file);
          event.target.value = ""; // permite escolher o mesmo arquivo de novo
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
      {pending && (
        <ImageCropDialog
          file={pending}
          title="Ajustar foto da criatura"
          onConfirm={(image) => void onCropped(image)}
          onCancel={() => setPending(null)}
          onError={onError}
        />
      )}
    </label>
  );
}
