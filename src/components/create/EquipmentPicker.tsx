"use client";

import { useMemo, useState } from "react";
import type { Item, StartingEquipment } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ITEMS_CATALOG,
  ITEM_CATEGORY_ORDER,
  SIMPLE_WEAPONS,
  MARTIAL_WEAPONS,
  type CatalogItem,
} from "@/data/itemsCatalog";

const selectCls =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

type Props = {
  equipment?: StartingEquipment;
  items: Item[];
  onChange: (items: Item[]) => void;
};

/** Detecta o coringa "qualquer arma simples/marcial" no texto do equipamento. */
const WEAPON_PLACEHOLDER = /qualquer arma (simples|marcial)/gi;

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const DETAIL_BY_NAME = new Map(ITEMS_CATALOG.map((i) => [i.name.toLowerCase(), i.detail]));

export function EquipmentPicker({ equipment, items, onChange }: Props) {
  const choices = equipment?.choices ?? [];
  // o pai passa key={classe} -> o componente remonta ao trocar de classe, reiniciando a seleção
  const [sel, setSel] = useState<number[]>(() => choices.map(() => 0));
  const [free, setFree] = useState("");
  // arma escolhida para cada coringa ("simples"/"marcial")
  const [weaponPick, setWeaponPick] = useState<{ simples: string; marcial: string }>({
    simples: SIMPLE_WEAPONS[0] ?? "",
    marcial: MARTIAL_WEAPONS[0] ?? "",
  });
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [presetQuery, setPresetQuery] = useState("");

  // Nomes que serão adicionados com a seleção atual (para detectar coringas).
  const pendingNames = [
    ...choices.map((opts, i) => opts[sel[i] ?? 0]).filter(Boolean),
    ...(equipment?.fixed ?? []),
  ];
  const placeholderKinds = new Set<string>();
  for (const n of pendingNames) {
    for (const m of n.matchAll(WEAPON_PLACEHOLDER)) placeholderKinds.add(m[1].toLowerCase());
  }

  /** Substitui o coringa pelo nome da arma escolhida (mantém o resto do texto). */
  function resolveName(name: string): string {
    return name.replace(WEAPON_PLACEHOLDER, (_m, kind: string) => {
      const k = kind.toLowerCase() as "simples" | "marcial";
      return weaponPick[k] || `qualquer arma ${kind}`;
    });
  }

  function addStarting() {
    const existing = new Set(items.map((it) => it.name.toLowerCase()));
    const toAdd: Item[] = [];
    for (const raw of pendingNames) {
      const name = resolveName(raw);
      if (existing.has(name.toLowerCase())) continue;
      existing.add(name.toLowerCase());
      const detail = DETAIL_BY_NAME.get(name.toLowerCase());
      toAdd.push(detail ? { name, description: detail, quantity: 1 } : { name, quantity: 1 });
    }
    if (toAdd.length) onChange([...items, ...toAdd]);
  }

  function addFree() {
    const name = free.trim();
    if (!name) return;
    onChange([...items, { name, quantity: 1 }]);
    setFree("");
  }

  function addPreset(it: CatalogItem) {
    if (items.some((x) => x.name.toLowerCase() === it.name.toLowerCase())) return;
    onChange([...items, { name: it.name, description: it.detail, quantity: 1 }]);
  }

  const presetMatches = useMemo(() => {
    const q = norm(presetQuery.trim());
    const list = q
      ? ITEMS_CATALOG.filter((i) => norm(i.name).includes(q) || norm(i.detail).includes(q))
      : ITEMS_CATALOG;
    return ITEM_CATEGORY_ORDER.map((cat) => ({
      cat,
      items: list.filter((i) => i.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [presetQuery]);

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
              Inclui: {equipment.fixed.map(resolveName).join("; ")}
            </p>
          )}
          {/* Escolha da arma concreta para "qualquer arma simples/marcial" */}
          {[...placeholderKinds].map((kind) => (
            <label key={kind} className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">
                Escolha a arma {kind} (de &quot;qualquer arma {kind}&quot;)
              </span>
              <select
                className={selectCls}
                value={weaponPick[kind as "simples" | "marcial"]}
                onChange={(e) =>
                  setWeaponPick((p) => ({ ...p, [kind]: e.target.value }))
                }
              >
                {(kind === "simples" ? SIMPLE_WEAPONS : MARTIAL_WEAPONS).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={addStarting}>
            Adicionar ao inventário
          </Button>
        </div>
      )}

      {/* Presets de equipamento (armas, armaduras, escudos) */}
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setPresetsOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
        >
          <span>Presets de equipamento (armas, armaduras, escudos)</span>
          <span className="text-xs text-zinc-500">{presetsOpen ? "▾" : "▸"}</span>
        </button>
        {presetsOpen && (
          <div className="space-y-2 border-t border-zinc-100 p-2 dark:border-zinc-800">
            <Input
              value={presetQuery}
              onChange={(e) => setPresetQuery(e.target.value)}
              placeholder="Buscar item…"
              className="max-w-xs"
            />
            {presetMatches.map(({ cat, items: catItems }) => (
              <div key={cat}>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  {cat}
                </div>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {catItems.map((it) => {
                    const added = items.some(
                      (x) => x.name.toLowerCase() === it.name.toLowerCase(),
                    );
                    return (
                      <button
                        key={it.name}
                        type="button"
                        disabled={added}
                        onClick={() => addPreset(it)}
                        title={it.detail}
                        className={`flex items-center justify-between gap-2 rounded border px-2 py-1 text-left text-xs ${
                          added
                            ? "cursor-default border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <span className="font-medium">{it.name}</span>
                        <span className="shrink-0 text-zinc-500">{added ? "✓" : it.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <span>
                  {it.name}
                  {it.description && (
                    <span className="ml-1 text-xs text-zinc-500">— {it.description}</span>
                  )}
                </span>
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
