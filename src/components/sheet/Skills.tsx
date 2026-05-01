"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import {
  ABILITY_LABELS,
  abilityMod,
  formatMod,
  SKILL_TO_ABILITY,
  type SkillName,
} from "@/lib/types";
import { roll } from "@/lib/dice";

const ALL_SKILLS = Object.keys(SKILL_TO_ABILITY) as SkillName[];

export function Skills({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const addRoll = useStore((s) => s.addRoll);
  if (!c) return null;

  const profMap = new Map(c.sheet.skills.map((s) => [s.name, s]));

  const calc = (name: SkillName) => {
    const ability = SKILL_TO_ABILITY[name];
    const baseMod = abilityMod(c.sheet.abilityScores[ability]);
    const skill = profMap.get(name);
    let bonus = baseMod;
    if (skill?.proficient) bonus += c.sheet.proficiencyBonus;
    if (skill?.expert) bonus += c.sheet.proficiencyBonus;
    return { bonus, ability, proficient: !!skill?.proficient, expert: !!skill?.expert };
  };

  const doRoll = (name: SkillName, advantage = false, disadvantage = false) => {
    const { bonus } = calc(name);
    void addRoll(
      roll(`1d20${formatMod(bonus)}`, {
        characterId: c.id,
        characterName: c.characterName,
        label: name,
        advantage,
        disadvantage,
      }),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perícias</CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {ALL_SKILLS.map((name) => {
          const { bonus, ability, proficient, expert } = calc(name);
          return (
            <button
              key={name}
              className="group flex items-center justify-between rounded px-2 py-1 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={(e) => {
                if (e.shiftKey) doRoll(name, true);
                else if (e.altKey) doRoll(name, false, true);
                else doRoll(name);
              }}
              title="Clique para rolar (Shift = vantagem, Alt = desvantagem)"
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    expert
                      ? "bg-amber-500"
                      : proficient
                        ? "bg-emerald-500"
                        : "border border-zinc-400 bg-transparent"
                  }`}
                />
                <span className={proficient ? "font-medium" : "text-zinc-600 dark:text-zinc-400"}>
                  {name}
                </span>
                <span className="text-[10px] uppercase text-zinc-400">
                  ({ABILITY_LABELS[ability].slice(0, 3)})
                </span>
              </span>
              <span className="font-mono text-sm font-semibold">{formatMod(bonus)}</span>
            </button>
          );
        })}
      </CardBody>
    </Card>
  );
}
