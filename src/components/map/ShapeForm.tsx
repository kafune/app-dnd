import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SHAPE_LABELS, describeShape, type MapShape, type ShapeKind } from "@/lib/map";

const selectCls = "h-8 rounded-md border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

/** Formulário de "Inserir elementos": uma forma do PHB com as medidas em metros. */
export function ShapeForm({ onInsert, onClose, fixedColor }: { fixedColor?: string; onInsert: (shape: Omit<MapShape, "x" | "y">) => void; onClose: () => void }) {
  const [kind, setKind] = useState<ShapeKind>("esfera");
  const [radius, setRadius] = useState("6");
  const [length, setLength] = useState("9");
  const [width, setWidth] = useState("1.5");
  const [side, setSide] = useState("4.5");
  const [color, setColor] = useState("#a855f7");
  const [label, setLabel] = useState("");

  const n = (v: string) => Math.max(0.5, Number(v.replace(",", ".")) || 0.5);
  const dims =
    kind === "esfera" || kind === "cilindro"
      ? { radius: n(radius) }
      : kind === "cone"
        ? { length: n(length) }
        : kind === "linha"
          ? { length: n(length), width: n(width) }
          : { side: n(side), centered: true };

  return (
    <form
      className="flex flex-wrap items-end gap-2 border-b border-zinc-100 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/60"
      onSubmit={(event) => {
        event.preventDefault();
        onInsert({
          id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          kind,
          rotation: 0,
          color: fixedColor ?? color,
          ...(label.trim() ? { label: label.trim() } : {}),
          ...dims,
        });
      }}
    >
      <label className="flex flex-col gap-0.5">
        Forma
        <select className={selectCls} value={kind} onChange={(e) => setKind(e.target.value as ShapeKind)}>
          {(Object.keys(SHAPE_LABELS) as ShapeKind[]).map((k) => (
            <option key={k} value={k}>
              {SHAPE_LABELS[k]}
            </option>
          ))}
        </select>
      </label>
      {(kind === "esfera" || kind === "cilindro") && (
        <label className="flex flex-col gap-0.5">
          Raio (m)
          <Input inputMode="decimal" value={radius} onChange={(e) => setRadius(e.target.value)} className="h-8 w-20 text-xs" />
        </label>
      )}
      {(kind === "cone" || kind === "linha") && (
        <label className="flex flex-col gap-0.5">
          Comprimento (m)
          <Input inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} className="h-8 w-20 text-xs" />
        </label>
      )}
      {kind === "linha" && (
        <label className="flex flex-col gap-0.5">
          Largura (m)
          <Input inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} className="h-8 w-20 text-xs" />
        </label>
      )}
      {(kind === "cubo" || kind === "quadrado") && (
        <label className="flex flex-col gap-0.5">
          Lado (m)
          <Input inputMode="decimal" value={side} onChange={(e) => setSide(e.target.value)} className="h-8 w-20 text-xs" />
        </label>
      )}
      <label className="flex flex-col gap-0.5">
        Rótulo
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex.: Bola de Fogo" className="h-8 w-36 text-xs" />
      </label>
      {!fixedColor && <label className="flex flex-col gap-0.5">
        Cor
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 rounded border border-zinc-300 bg-white dark:border-zinc-700" />
      </label>}
      <Button type="submit" size="sm">
        Inserir {describeShape({ kind, ...dims })}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onClose}>
        Fechar
      </Button>
      <span className="basis-full text-[11px] text-zinc-500">
        A forma aparece no centro do mapa: arraste para posicionar e, com ela selecionada, puxe o círculo branco para girar.
      </span>
    </form>
  );
}
