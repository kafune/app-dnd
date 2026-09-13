import { useMemo } from "react";
import { featSpellOptions, grantedCastingLabel } from "@/lib/progression";
import type { AbilityKey, FeatDef, FeatSpellChoice, SpellClass } from "@/lib/types";
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

/** O talento pede que o jogador escolha uma lista de classe? */
export function featNeedsList(feat: FeatDef | undefined): boolean {
  return (feat?.spells?.pickList?.length ?? 0) > 0;
}

/** As escolhas de magia do talento estão completas (e sem repetição)? */
export function featSpellsComplete(feat: FeatDef | undefined, chosen: string[] = [], list?: SpellClass): boolean {
  // A lista de classe define o atributo de conjuração das magias: sem ela a ficha
  // não sabe calcular a CD delas.
  if (featNeedsList(feat) && !list) return false;
  const total = featSpellSlotCount(feat);
  if (total === 0) return true;
  const filled = chosen.filter(Boolean).slice(0, total);
  return filled.length === total && new Set(filled).size === total;
}

const levelLabel = (level: number) => (level === 0 ? "truque" : `magia de ${level}º círculo`);

/**
 * As magias de um talento: as fixas (só para mostrar), as que o jogador escolhe e
 * — o que a mesa mais esquece — o atributo de conjuração delas e o uso sem gastar
 * espaço de magia. Aparece embaixo da descrição do talento, na criação e no nível
 * novo da ficha.
 */
export function FeatSpellChoices({
  feat,
  chosen,
  onChange,
  list,
  onList,
  increased,
}: {
  feat: FeatDef;
  chosen: string[];
  onChange: (spells: string[]) => void;
  /** Lista de classe escolhida (Iniciado em Magia, Conjurador de Ritual). */
  list?: SpellClass;
  onList?: (list: SpellClass | undefined) => void;
  /** Atributo que o talento aumentou (define a conjuração em Tocado pelas Sombras e afins). */
  increased?: AbilityKey;
}) {
  const slots = slotsOf(feat);
  const pickList = feat.spells?.pickList;
  const casting = feat.spells?.casting;

  const options = useMemo(
    () => slots.map((choice) => featSpellOptions(choice, pickList ? list : undefined)),
    [slots, pickList, list],
  );

  if (!featHasSpells(feat)) return null;

  const setSlot = (index: number, name: string) => {
    const next = slots.map((_, i) => (i === index ? name : (chosen[i] ?? "")));
    onChange(next);
  };

  const castingLines = casting ? grantedCastingLabel(casting, { increased, list }) : null;

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
          Lista de magias (define o atributo de conjuração)
          <select
            className={selectCls}
            value={list ?? ""}
            onChange={(event) => {
              onList?.((event.target.value || undefined) as SpellClass | undefined);
              onChange([]);
            }}
          >
            <option value="">— escolha a lista —</option>
            {pickList.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      )}
      {castingLines && (
        <ul className="space-y-0.5 rounded border border-violet-300 bg-white/70 px-2 py-1 text-violet-900 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100">
          {castingLines.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      )}
      {slots.map((choice, index) => {
        const taken = new Set(chosen.filter((name, i) => i !== index && name));
        return (
          <label key={`${choice.level}:${index}`} className="block text-zinc-600 dark:text-zinc-300">
            {choice.label ?? `Escolha um(a) ${levelLabel(choice.level)}`}
            <select
              className={selectCls}
              value={chosen[index] ?? ""}
              disabled={!!pickList && !list}
              onChange={(event) => setSlot(index, event.target.value)}
            >
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
      {!featSpellsComplete(feat, chosen, list) && (
        <p className="text-amber-700 dark:text-amber-400">
          {pickList && !list ? "Escolha a lista de magias do talento." : "Escolha todas as magias do talento."}
        </p>
      )}
    </div>
  );
}
