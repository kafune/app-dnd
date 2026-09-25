import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  AVATAR_MAX_ZOOM,
  type AvatarCrop,
  assertImageFile,
  avatarCropZoom,
  decodeAvatarImage,
  defaultAvatarCrop,
  panAvatarCrop,
  renderAvatarCrop,
  zoomAvatarCrop,
} from "@/lib/avatar";
import { cn } from "@/lib/cn";

type Props = {
  /** Arquivo escolhido; o diálogo fica aberto enquanto estiver montado. */
  file: Blob;
  /** Máscara redonda (foto de perfil) ou quadrada com cantos arredondados (pasta). */
  shape?: "circle" | "square";
  title?: string;
  /** Recebe o JPEG já recortado (até 384 px), como o antigo `compressAvatar`. */
  onConfirm: (image: Blob) => void;
  onCancel: () => void;
  /** Arquivo que não abre (HEIC fora do Safari, corrompido…) ou falha ao exportar. */
  onError: (error: unknown) => void;
};

type Loaded = { src: string; image: HTMLImageElement; width: number; height: number };
type Point = { x: number; y: number };

function centroid(points: Point[]): Point {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

/** Distância média até o centro: a razão entre dois instantes é o fator da pinça. */
function spread(points: Point[]): number {
  const c = centroid(points);
  return points.reduce((acc, p) => acc + Math.hypot(p.x - c.x, p.y - c.y), 0) / points.length;
}

/**
 * Ajuste da foto antes do envio: arrastar posiciona, zoom pelo controle deslizante,
 * pela roda do mouse ou com dois dedos. O recorte começa igual ao automático
 * (centralizado, retratos puxados para cima) e nunca deixa sobrar borda vazia.
 */
export function ImageCropDialog({
  file,
  shape = "circle",
  title = "Ajustar foto",
  onConfirm,
  onCancel,
  onError,
}: Props) {
  const titleId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [crop, setCrop] = useState<AvatarCrop | null>(null);
  const [busy, setBusy] = useState(false);

  // Callbacks do pai podem mudar a cada render; o efeito de carga não deve reiniciar.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    try {
      assertImageFile(file);
      url = URL.createObjectURL(file);
    } catch (e) {
      onErrorRef.current(e);
      return;
    }
    const src = url;
    decodeAvatarImage(src).then(
      (image) => {
        if (cancelled) return;
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        setLoaded({ src, image, width, height });
        setCrop(defaultAvatarCrop(width, height));
      },
      (e) => {
        if (!cancelled) onErrorRef.current(e);
      },
    );
    return () => {
      cancelled = true;
      URL.revokeObjectURL(src);
    };
  }, [file]);

  // Sem rolar a página por trás enquanto se arrasta a foto.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  useEffect(() => {
    if (loaded) stageRef.current?.focus({ preventScroll: true });
  }, [loaded]);

  /**
   * Aplica um gesto em px de tela: arrasto (`dx`/`dy`) e zoom por `factor` em torno
   * do ponto (`ax`, `ay`) em coordenadas da janela.
   */
  const move = useCallback(
    (dx: number, dy: number, factor: number, ax: number, ay: number) => {
      const stage = stageRef.current;
      if (!stage || !loaded) return;
      const rect = stage.getBoundingClientRect();
      const px = rect.width;
      if (!px) return;
      const { width, height } = loaded;
      setCrop((current) => {
        if (!current) return current;
        const ratio = current.side / px; // pixels naturais por px de tela
        let next = panAvatarCrop(current, width, height, -dx * ratio, -dy * ratio);
        if (factor !== 1) {
          next = zoomAvatarCrop(
            next,
            width,
            height,
            avatarCropZoom(next, width, height) * factor,
            (ax - rect.left) / px,
            (ay - rect.top) / px,
          );
        }
        return next;
      });
    },
    [loaded],
  );

  // Roda do mouse: o listener do React é passivo e não impede a rolagem da página.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      move(0, 0, Math.exp(-delta * 0.0015), event.clientX, event.clientY);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [move]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!loaded || busy) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const map = pointers.current;
    if (!map.has(event.pointerId)) return;
    const before = [...map.values()];
    map.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const after = [...map.values()];
    const c0 = centroid(before);
    const c1 = centroid(after);
    const s0 = spread(before);
    const factor = after.length > 1 && s0 > 0 ? spread(after) / s0 : 1;
    move(c1.x - c0.x, c1.y - c0.y, factor, c1.x, c1.y);
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
  };

  const setZoom = (zoom: number) => {
    if (!loaded) return;
    setCrop((current) => current && zoomAvatarCrop(current, loaded.width, loaded.height, zoom));
  };

  const reset = () => {
    if (loaded) setCrop(defaultAvatarCrop(loaded.width, loaded.height));
  };

  const onStageKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!loaded || !crop) return;
    const step = crop.side * 0.05;
    const pan: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const zoom = avatarCropZoom(crop, loaded.width, loaded.height);
    if (pan[event.key]) {
      const [dx, dy] = pan[event.key];
      setCrop(panAvatarCrop(crop, loaded.width, loaded.height, dx, dy));
    } else if (event.key === "+" || event.key === "=") {
      setZoom(zoom * 1.2);
    } else if (event.key === "-") {
      setZoom(zoom / 1.2);
    } else if (event.key === "0") {
      reset();
    } else {
      return;
    }
    event.preventDefault();
  };

  const confirm = async () => {
    if (!loaded || !crop) return;
    setBusy(true);
    try {
      onConfirm(await renderAvatarCrop(loaded.image, crop));
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  };

  const zoom = loaded && crop ? avatarCropZoom(crop, loaded.width, loaded.height) : 1;
  const stop = (event: React.SyntheticEvent) => event.stopPropagation();

  return createPortal(
    // O portal ainda propaga eventos pela árvore do React: não deixa o clique chegar
    // ao <label> do avatar (reabriria o seletor) nem a cartões clicáveis por trás.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/60 p-3"
      onClick={stop}
      onPointerDown={stop}
      onKeyDown={stop}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Arraste para posicionar. Zoom pelo controle, pela roda do mouse ou com dois dedos.
          </p>
        </div>

        <div
          ref={stageRef}
          tabIndex={0}
          aria-label="Área de recorte (setas movem, + e − dão zoom)"
          className={cn(
            "relative mx-auto aspect-square w-full touch-none select-none overflow-hidden rounded-lg bg-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
            loaded ? "cursor-grab active:cursor-grabbing" : "cursor-wait",
          )}
          style={{ maxWidth: "min(100%, calc(100dvh - 16rem))" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onLostPointerCapture={onPointerEnd}
          onKeyDown={onStageKey}
        >
          {loaded && crop ? (
            <>
              <img
                src={loaded.src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute max-w-none select-none"
                style={{
                  left: `${(-crop.x / crop.side) * 100}%`,
                  top: `${(-crop.y / crop.side) * 100}%`,
                  width: `${(loaded.width / crop.side) * 100}%`,
                  height: `${(loaded.height / crop.side) * 100}%`,
                }}
              />
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 border-2 border-white/80",
                  shape === "circle" ? "rounded-full" : "rounded-[15%]",
                )}
                style={{ boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)" }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Afastar"
            disabled={!loaded || busy || zoom <= 1.0001}
            onClick={() => setZoom(zoom / 1.25)}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <input
            type="range"
            min={1}
            max={AVATAR_MAX_ZOOM}
            step={0.01}
            value={zoom}
            disabled={!loaded || busy}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="Zoom"
            className="h-11 min-w-0 flex-1 cursor-pointer accent-zinc-700 dark:accent-zinc-300"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Aproximar"
            disabled={!loaded || busy || zoom >= AVATAR_MAX_ZOOM - 0.0001}
            onClick={() => setZoom(zoom * 1.25)}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Centralizar"
            title="Centralizar (recorte automático)"
            disabled={!loaded || busy}
            onClick={reset}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-2 sm:justify-end">
          <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="success"
            size="lg"
            className="flex-1 sm:flex-none"
            onClick={() => void confirm()}
            disabled={!loaded || !crop || busy}
          >
            {busy ? "Aguarde…" : "Usar foto"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
