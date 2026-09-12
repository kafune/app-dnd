import { useMemo, useState } from "react";
import { featSpellOptions } from "@/lib/progression";
import type { FeatDef, FeatSpellChoice, SpellClass } from "@/lib/types";
import { selectCls } from "./common";

/** Uma vaga de magia aberta pelo talento (uma escolha de `count: 2` vira duas vagas). */
function slotsOf(feat: FeatDef | undefined): FeatSpellChoice[] {
  return (feat?.spells?.choices ?? []).flatMap((choice) =>
    Array.from({ length: Math.max(0, choice.count) }, () => choice),
  );
}

/** Quantas magias o talento manda escolher. */
export function featSpellSlotCount(feat: FeatDef | undefined): number {
  return slotsOf(feat).length;
}

/** O talento concede ou pede magias? */
export function featHasSpells(feat: FeatDef | undefined): boolean {
  return !!feat?.spells && ((feat.spells.fixed?.length ?? 0) > 0 || featSpellSlotCount(feat) > 0);
}

/** As escolhas de magia do talento estão completas (e sem repetição)? */
export function featSpellsComplete(feat: FeatDef | undefined, chosen: string[] = []): boolean {
  const total = featSpellSlotCount(feat);
  if (total === 0) return true;
  const filled = chosen.filter(Boolean).slice(0, total);
  return filled.length === total && new Set(filled).size === total;
}

const levelLabel = (level: number) => (level === 0 ? "truque" : `magia de ${level}º círculo`);

/**
 * As magias de um talento: as fixas (só para mostrar) e as que o jogador escolhe.
 * Aparece embaixo da descrição do talento, na criação e no nível novo da ficha.
 */
export function FeatSpellChoices({
  feat,
  chosen,
  onChange,
}: {
  feat: FeatDef;
  chosen: string[];
  onChange: (spells: string[]) => void;
}) {
  const slots = slotsOf(feat);
  const pickList = feat.spells?.pickList;
  const [list, setList] = useState<SpellClass | "">(pickList?.[0] ?? "");

  const options = useMemo(
    () => slots.map((choice) => featSpellOptions(choice, pickList ? list : undefined)),
    [slots, pickList, list],
  );

  if (!featHasSpells(feat)) return null;

  const setSlot = (index: number, name: string) => {
    const next = slots.map((_, i) => (i === index ? name : (chosen[i] ?? "")));
    onChange(next);
  };

  return (
    <div className="space-y-2 rounded-md border border-violet-300 bg-violet-50/60 p-2 text-xs dark:border-violet-900 dark:bg-violet-950/20">
      <div className="font-medium text-violet-900 dark:text-violet-200">Magias do talento</div>
      {feat.spells?.fixed?.length ? (
        <p className="text-zinc-700 dark:text-zinc-300">
          Já vêm com o talento: <strong>{feat.spells.fixed.join(", ")}</strong>.
        </p>
      ) : null}
      {pickList && (
        <label className="block text-zinc-600 dark:text-zinc-300">
          Lista de magias
          <select
            className={selectCls}
            value={list}
            onChange={(event) => {
              setList(event.target.value as SpellClass);
              onChange([]);
            }}
          >
            {pickList.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      )}
      {slots.map((choice, index) => {
        const taken = new Set(chosen.filter((name, i) => i !== index && name));
        return (
          <label key={`${choice.level}:${index}`} className="block text-zinc-600 dark:text-zinc-300">
            {choice.label ?? `Escolha um(a) ${levelLabel(choice.level)}`}
            <select className={selectCls} value={chosen[index] ?? ""} onChange={(event) => setSlot(index, event.target.value)}>
              <option value="">— escolher {levelLabel(choice.level)} —</option>
              {options[index]
                .filter((spell) => !taken.has(spell.name))
                .map((spell) => (
                  <option key={spell.name} value={spell.name}>
                    {spell.name} — {spell.school}
                  </option>
                ))}
            </select>
          </label>
        );
      })}
      {slots.length > 0 && !featSpellsComplete(feat, chosen) && (
        <p className="text-amber-700 dark:text-amber-400">Escolha todas as magias do talento.</p>
      )}
    </div>
  );
}
