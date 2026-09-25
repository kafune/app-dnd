import { useMemo, useState } from "react";
import type { EquipmentRef, Item, StartingEquipment, StartingEquipmentDef } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ItemCatalogPicker } from "@/components/ItemCatalogPicker";
import {
  ARTISAN_TOOLS,
  GAMING_SETS,
  MARTIAL_MELEE_WEAPONS,
  MARTIAL_WEAPONS,
  MUSICAL_INSTRUMENTS,
  SIMPLE_MELEE_WEAPONS,
  SIMPLE_WEAPONS,
  findItem,
  groupCatalogNames,
  type CatalogGroup,
} from "@/data/itemsCatalog";
import { STARTING_EQUIPMENT } from "@/data/startingEquipment";
import { homebrewItem, itemFromName, mergeItems as addItems } from "@/lib/items";

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

type AnyRef = Extract<EquipmentRef, { any: string }>;

/** Opções de cada coringa, agrupadas ("Armas marciais — corpo a corpo"…) e em ordem alfabética. */
const ANY_GROUPS: Record<AnyRef["any"], CatalogGroup[]> = {
  "arma simples": groupCatalogNames(SIMPLE_WEAPONS),
  "arma marcial": groupCatalogNames(MARTIAL_WEAPONS),
  "arma simples corpo-a-corpo": groupCatalogNames(SIMPLE_MELEE_WEAPONS),
  "arma marcial corpo-a-corpo": groupCatalogNames(MARTIAL_MELEE_WEAPONS),
  "instrumento musical": groupCatalogNames(MUSICAL_INSTRUMENTS),
  "ferramentas de artesão": groupCatalogNames(ARTISAN_TOOLS),
  "kit de jogo": groupCatalogNames(GAMING_SETS),
};

/** Letra da opção como no livro: (a), (b), (c)… */
const optionLetter = (index: number) => `(${String.fromCharCode(97 + index)})`;

function norm(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Quantos itens um coringa concede — cada um é escolhido separadamente. */
const refCount = (ref: EquipmentRef) => Math.max(1, ref.qty ?? 1);

function refLabel(ref: EquipmentRef): string {
  if ("any" in ref) {
    const count = refCount(ref);
    return count > 1 ? `Escolher ${count} × ${ref.any}` : `Escolher ${ref.any}`;
  }
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

  /** Arma escolhida para a `slot`-ésima vaga de um coringa (padrão: a primeira da lista). */
  const pickedAny = (ref: AnyRef, key: string, slot: number) =>
    anyPick[`${key}#${slot}`] || ANY_GROUPS[ref.any][0]?.items[0]?.name || ref.any;

  /** Um ref vira 1+ itens: "duas armas marciais" são duas escolhas independentes. */
  const resolveRef = (ref: EquipmentRef, key: string): Item[] => {
    if ("item" in ref) return [itemFromName(ref.item, ref.qty ?? 1)];
    return Array.from({ length: refCount(ref) }, (_, slot) => itemFromName(pickedAny(ref, key, slot), 1));
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
    onChange(addItems(items, refs.flatMap(({ ref, key }) => resolveRef(ref, key))));
  };

  /** Os selects de um coringa: um por vaga, para o jogador escolher cada arma. */
  const anyPickers = (ref: EquipmentRef, key: string) => {
    if (!("any" in ref)) return null;
    const count = refCount(ref);
    return Array.from({ length: count }, (_, slot) => {
      const picked = pickedAny(ref, key, slot);
      const detail = findItem(picked)?.detail;
      return (
        <label key={`${key}#${slot}`} className="block pl-3">
          <span className="text-[11px] text-zinc-500">
            Qual {ref.any}?{count > 1 ? ` (${slot + 1} de ${count})` : ""}
          </span>
          <select
            className={selectCls}
            aria-label={count > 1 ? `Escolher ${ref.any} ${slot + 1}` : `Escolher ${ref.any}`}
            value={picked}
            onChange={(event) => setAnyPick((state) => ({ ...state, [`${key}#${slot}`]: event.target.value }))}
          >
            {ANY_GROUPS[ref.any].map((group) => (
              <optgroup key={group.id} label={group.label}>
                {group.items.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name} — {item.detail}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {detail && <span className="mt-0.5 block text-[11px] text-zinc-500">{detail}</span>}
        </label>
      );
    });
  };

  const ownedQuantity = (name: string) =>
    items.filter((item) => norm(item.name) === norm(name)).reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  // Item inventado na hora: entra no grupo "Homebrew do Mestre" do inventário.
  const addFree = () => {
    const name = free.trim();
    if (!name) return;
    onChange(addItems(items, [homebrewItem(name)]));
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
                <span className="block text-[11px] font-medium text-zinc-500">
                  Escolha {groupIndex + 1}: {group.length === 2 ? "(a) ou (b)" : `uma de ${group.length} opções`}
                </span>
                <select
                  className={selectCls}
                  aria-label={`Escolha ${groupIndex + 1} do equipamento de ${className}`}
                  value={optionIndex}
                  onChange={(event) => setSelected((state) => ({
                    ...state,
                    [`${className}:${groupIndex}`]: Number(event.target.value),
                  }))}
                >
                  {group.map((entry, index) => (
                    <option key={index} value={index}>{optionLetter(index)} {optionLabel(entry.items)}</option>
                  ))}
                </select>
                {option?.items.map((ref, refIndex) => anyPickers(ref, `${className}:${groupIndex}:${refIndex}`))}
              </div>
            );
          })}
          {definition.fixed.length > 0 && (
            <div className="space-y-1 text-xs text-zinc-500">
              <div>Inclui: {definition.fixed.filter((ref) => "item" in ref).map(refLabel).join("; ")}</div>
              {definition.fixed.map((ref, index) => anyPickers(ref, `${className}:fixed:${index}`))}
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
              <ItemCatalogPicker
                ownedQuantity={ownedQuantity}
                onAdd={(item, quantity) => onChange(addItems(items, [itemFromName(item.name, quantity)]))}
              />
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
