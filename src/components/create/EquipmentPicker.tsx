"use client";

import { useState } from "react";
import type { Item, StartingEquipment } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const selectCls =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

type Props = {
  equipment?: StartingEquipment;
  items: Item[];
  onChange: (items: Item[]) => void;
};

export function EquipmentPicker({ equipment, items, onChange }: Props) {
  const choices = equipment?.choices ?? [];
  // o pai passa key={classe} -> o componente remonta ao trocar de classe, reiniciando a seleção
  const [sel, setSel] = useState<number[]>(() => choices.map(() => 0));
  const [free, setFree] = useState("");

  function addStarting() {
    const chosen = choices.map((opts, i) => opts[sel[i] ?? 0]).filter(Boolean);
    const fixed = equipment?.fixed ?? [];
    const names = [...chosen, ...fixed];
    const existing = new Set(items.map((it) => it.name.toLowerCase()));
    const toAdd = names
      .filter((n) => !existing.has(n.toLowerCase()))
      .map<Item>((name) => ({ name, quantity: 1 }));
    if (toAdd.length) onChange([...items, ...toAdd]);
  }

  function addFree() {
    const name = free.trim();
    if (!name) return;
    onChange([...items, { name, quantity: 1 }]);
    setFree("");
  }

  return (
    <div className="space-y-3">
      {(choices.length > 0 || (equipment?.fixed?.length ?? 0) > 0) && (
        <div className="space-y-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
          <div className="text-xs font-medium text-zinc-500">Equipamento inicial da classe</div>
          {choices.map((opts, i) => (
            <select
              key={i}
              className={selectCls}
              value={sel[i] ?? 0}
              onChange={(e) =>
                setSel(sel.map((v, idx) => (idx === i ? Number(e.target.value) : v)))
              }
            >
              {opts.map((o, oi) => (
                <option key={oi} value={oi}>
                  {o}
                </option>
              ))}
            </select>
          ))}
          {equipment?.fixed && equipment.fixed.length > 0 && (
            <p className="text-xs text-zinc-500">
              Inclui: {equipment.fixed.join("; ")}
            </p>
          )}
          <Button type="button" size="sm" variant="outline" onClick={addStarting}>
            Adicionar ao inventário
          </Button>
        </div>
      )}

      <div>
        <div className="mb-1 text-xs font-medium text-zinc-500">
          Inventário ({items.length})
        </div>
        {items.length > 0 && (
          <ul className="mb-2 space-y-1">
            {items.map((it, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-800"
              >
                <span>{it.name}</span>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                  className="text-xs text-zinc-400 hover:text-red-600"
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Input
            value={free}
            onChange={(e) => setFree(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFree();
              }
            }}
            placeholder="Adicionar item livre…"
          />
          <Button type="button" variant="outline" onClick={addFree}>
            +
          </Button>
        </div>
      </div>
    </div>
  );
}
