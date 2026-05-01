"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  abilityMod,
  formatMod,
  type AbilityKey,
} from "@/lib/types";
import { roll } from "@/lib/dice";

export function Abilities({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const addRoll = useStore((s) => s.addRoll);
  if (!c) return null;

  const rollAbility = (key: AbilityKey) => {
    const mod = abilityMod(c.sheet.abilityScores[key]);
    void addRoll(
      roll(`1d20${formatMod(mod)}`, {
        characterId: c.id,
        characterName: c.characterName,
        label: `${ABILITY_LABELS[key]} (Teste)`,
      }),
    );
  };

  const rollSave = (key: AbilityKey) => {
    const mod =
      abilityMod(c.sheet.abilityScores[key]) +
      (c.sheet.saves.includes(key) ? c.sheet.proficiencyBonus : 0);
    void addRoll(
      roll(`1d20${formatMod(mod)}`, {
        characterId: c.id,
        characterName: c.characterName,
        label: `Salvaguarda de ${ABILITY_LABELS[key]}`,
      }),
    );
  };

  return (
    <Card>
      <CardBody>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ABILITY_ORDER.map((key) => {
            const score = c.sheet.abilityScores[key];
            const mod = abilityMod(score);
            const proficient = c.sheet.saves.includes(key);
            return (
              <div key={key} className="rounded-lg border border-zinc-200 p-2 text-center dark:border-zinc-800">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {ABILITY_LABELS[key]}
                </div>
                <button
                  className="block w-full font-mono text-2xl font-bold hover:text-amber-600 dark:hover:text-amber-400"
                  onClick={() => rollAbility(key)}
                  title={`Rolar teste de ${ABILITY_LABELS[key]}`}
                >
                  {formatMod(mod)}
                </button>
                <div className="text-xs text-zinc-500">{score}</div>
                <button
                  className={`mt-1 w-full rounded px-1 text-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    proficient ? "font-semibold text-amber-700 dark:text-amber-400" : "text-zinc-400"
                  }`}
                  onClick={() => rollSave(key)}
                  title={`Rolar save de ${ABILITY_LABELS[key]}`}
                >
                  save {formatMod(mod + (proficient ? c.sheet.proficiencyBonus : 0))}
                </button>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
