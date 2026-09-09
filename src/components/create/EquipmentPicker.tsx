import { useMemo, useState } from "react";
import type { EquipmentRef, Item, StartingEquipment, StartingEquipmentDef } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ARTISAN_TOOLS,
  GAMING_SETS,
  ITEMS_CATALOG,
  ITEM_CATEGORY_ORDER,
  MARTIAL_MELEE_WEAPONS,
  MARTIAL_WEAPONS,
  MUSICAL_INSTRUMENTS,
  SIMPLE_MELEE_WEAPONS,
  SIMPLE_WEAPONS,
  findItem,
  type CatalogItem,
} from "@/data/itemsCatalog";
import { STARTING_EQUIPMENT } from "@/data/startingEquipment";

const selectCls =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

type Props = {
  classNames?: string[];
  /** Formato antigo, mantido para chamadas legadas. */
  equipment?: StartingEquipment;
  items: Item[];
  onChange: (items: Item[]) => void;
  /** Libera catálogo geral e item livre; usado apenas pelo Mestre na ficha pronta. */
  allowCustom?: boolean;
};

const ANY_OPTIONS: Record<Extract<EquipmentRef, { any: string }>["any"], string[]> = {
  "arma simples": SIMPLE_WEAPONS,
  "arma marcial": MARTIAL_WEAPONS,
  "arma simples corpo-a-corpo": SIMPLE_MELEE_WEAPONS,
  "arma marcial corpo-a-corpo": MARTIAL_MELEE_WEAPONS,
  "instrumento musical": MUSICAL_INSTRUMENTS,
  "ferramentas de artesão": ARTISAN_TOOLS,
  "kit de jogo": GAMING_SETS,
};

function norm(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function itemFromName(name: string, quantity = 1): Item {
  const catalog = findItem(name);
  return catalog
    ? { name: catalog.name, description: catalog.detail, quantity }
    : { name, quantity };
}

function addItems(existing: Item[], additions: Item[]): Item[] {
  const next = existing.map((item) => ({ ...item }));
  for (const addition of additions) {
    const found = next.find((item) => norm(item.name) === norm(addition.name));
    if (found) found.quantity = (found.quantity ?? 1) + (addition.quantity ?? 1);
    else next.push(addition);
  }
  return next;
}

function refLabel(ref: EquipmentRef): string {
  if ("any" in ref) return `Escolher ${ref.any}${(ref.qty ?? 1) > 1 ? ` ×${ref.qty}` : ""}`;
  const item = findItem(ref.item);
  return `${item?.name ?? ref.item}${(ref.qty ?? 1) > 1 ? ` ×${ref.qty}` : ""}${item?.detail ? ` — ${item.detail}` : ""}`;
}

function optionLabel(refs: EquipmentRef[]): string {
  return refs.map(refLabel).join(" + ");
}

export function EquipmentPicker({ classNames = [], equipment, items, onChange, allowCustom = false }: Props) {
  const definitions = classNames
    .map((className) => [className, STARTING_EQUIPMENT[className]] as const)
    .filter((entry): entry is readonly [string, StartingEquipmentDef] => !!entry[1]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [anyPick, setAnyPick] = useState<Record<string, string>>({});
  const [free, setFree] = useState("");
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [presetQuery, setPresetQuery] = useState("");

  const legacy = useMemo<StartingEquipmentDef | null>(() => {
    if (!equipment || definitions.length > 0) return null;
    return {
      choices: equipment.choices.map((group) =>
        group.map((label) => ({ label, items: [{ item: label }] })),
      ),
      fixed: equipment.fixed.map((item) => ({ item })),
      gold: "",
    };
  }, [definitions.length, equipment]);
  const allDefinitions = legacy ? [["Classe", legacy] as const] : definitions;

  const resolveRef = (ref: EquipmentRef, key: string): Item => {
    if ("item" in ref) return itemFromName(ref.item, ref.qty ?? 1);
    const name = anyPick[key] || ANY_OPTIONS[ref.any][0] || ref.any;
    return itemFromName(name, ref.qty ?? 1);
  };

  const addStarting = (className: string, definition: StartingEquipmentDef) => {
    const refs: Array<{ ref: EquipmentRef; key: string }> = definition.fixed.map((ref, index) => ({
      ref,
      key: `${className}:fixed:${index}`,
    }));
    definition.choices.forEach((group, groupIndex) => {
      const option = group[selected[`${className}:${groupIndex}`] ?? 0];
      option?.items.forEach((ref, refIndex) => refs.push({
        ref,
        key: `${className}:${groupIndex}:${refIndex}`,
      }));
    });
    onChange(addItems(items, refs.map(({ ref, key }) => resolveRef(ref, key))));
  };

  const presetMatches = useMemo(() => {
    const query = norm(presetQuery.trim());
    const list = query
      ? ITEMS_CATALOG.filter((item) => norm(item.name).includes(query) || norm(item.detail).includes(query))
      : ITEMS_CATALOG;
    return ITEM_CATEGORY_ORDER.map((category) => ({
      category,
      items: list.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0);
  }, [presetQuery]);

  const addPreset = (item: CatalogItem) => onChange(addItems(items, [itemFromName(item.name)]));
  const addFree = () => {
    const name = free.trim();
    if (!name) return;
    onChange(addItems(items, [{ name, quantity: 1 }]));
    setFree("");
  };

  return (
    <div className="space-y-3">
      {allDefinitions.map(([className, definition]) => (
        <div key={className} className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-sm font-medium">Equipamento inicial · {className}</div>
            {definition.gold && <span className="text-xs text-zinc-500">ou {definition.gold}</span>}
          </div>
          {definition.choices.map((group, groupIndex) => {
            const optionIndex = selected[`${className}:${groupIndex}`] ?? 0;
            const option = group[optionIndex];
            return (
              <div key={groupIndex} className="space-y-1">
                <select
                  className={selectCls}
                  value={optionIndex}
                  onChange={(event) => setSelected((state) => ({
                    ...state,
                    [`${className}:${groupIndex}`]: Number(event.target.value),
                  }))}
                >
                  {group.map((entry, index) => (
                    <option key={index} value={index}>{optionLabel(entry.items)}</option>
                  ))}
                </select>
                {option?.items.map((ref, refIndex) => {
                  if (!("any" in ref)) return null;
                  const key = `${className}:${groupIndex}:${refIndex}`;
                  return (
                    <select
                      key={key}
                      className={selectCls}
                      value={anyPick[key] ?? ANY_OPTIONS[ref.any][0] ?? ""}
                      onChange={(event) => setAnyPick((state) => ({ ...state, [key]: event.target.value }))}
                    >
                      {ANY_OPTIONS[ref.any].map((name) => {
                        const item = findItem(name);
                        return <option key={name} value={name}>{name}{item?.detail ? ` — ${item.detail}` : ""}</option>;
                      })}
                    </select>
                  );
                })}
              </div>
            );
          })}
          {definition.fixed.length > 0 && (
            <div className="space-y-1 text-xs text-zinc-500">
              <div>Inclui: {definition.fixed.filter((ref) => "item" in ref).map(refLabel).join("; ")}</div>
              {definition.fixed.map((ref, index) => {
                if (!("any" in ref)) return null;
                const key = `${className}:fixed:${index}`;
                return (
                  <select
                    key={key}
                    className={selectCls}
                    value={anyPick[key] ?? ANY_OPTIONS[ref.any][0] ?? ""}
                    onChange={(event) => setAnyPick((state) => ({ ...state, [key]: event.target.value }))}
                  >
                    {ANY_OPTIONS[ref.any].map((name) => <option key={name} value={name}>{refLabel({ item: name })}</option>)}
                  </select>
                );
              })}
            </div>
          )}
          <Button type="button" size="sm" variant="outline" onClick={() => addStarting(className, definition)}>
            Adicionar equipamento de {className}
          </Button>
        </div>
      ))}

      {allowCustom && (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setPresetsOpen((open) => !open)}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
          >
            <span>Catálogo e custom/homebrew</span>
            <span className="text-xs text-zinc-500">{presetsOpen ? "▾" : "▸"}</span>
          </button>
          {presetsOpen && (
            <div className="space-y-2 border-t border-zinc-100 p-2 dark:border-zinc-800">
              <Input value={presetQuery} onChange={(event) => setPresetQuery(event.target.value)} placeholder="Buscar item…" />
              {presetMatches.map((group) => (
                <div key={group.category}>
                  <div className="mb-1 text-[11px] font-semibold uppercase text-zinc-400">{group.category}</div>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <button key={item.name} type="button" onClick={() => addPreset(item)} className="rounded border border-zinc-200 px-2 py-1 text-left text-xs dark:border-zinc-800">
                        <strong>{item.name}</strong> — {item.detail} · {item.price}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Input value={free} onChange={(event) => setFree(event.target.value)} placeholder="Item custom/homebrew…" />
                <Button type="button" variant="outline" onClick={addFree}>+</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="mb-1 text-xs font-medium text-zinc-500">Inventário ({items.length})</div>
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={`${item.name}:${index}`} className="flex items-start justify-between gap-2 rounded border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-800">
              <span>
                <strong>{item.name}{(item.quantity ?? 1) > 1 ? ` ×${item.quantity}` : ""}</strong>
                {item.description && <span className="ml-1 text-xs text-zinc-500">— {item.description}</span>}
              </span>
              <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-zinc-400 hover:text-red-600">remover</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
