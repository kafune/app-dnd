import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useIsMaster, useStore } from "@/lib/store";
import {
  ABILITY_LABELS,
  abilityMod,
  formatMod,
  SKILL_TO_ABILITY,
  type Skill,
  type SkillName,
} from "@/lib/types";
import { roll } from "@/lib/dice";
import { backgroundSkills, findBackground } from "@/data/backgroundsCatalog";
import { resolveRace } from "@/data/racesCatalog";
import { classSkillBudget, expertiseBudget, featNamesOf, featSkillChoices } from "@/lib/progression";

const ALL_SKILLS = Object.keys(SKILL_TO_ABILITY) as SkillName[];

/** Parcelas do bônus de uma perícia, para mostrar a conta aberta na ficha. */
function skillParts(
  name: SkillName,
  scores: Record<string, number>,
  profBonus: number,
  skill: Skill | undefined,
) {
  const ability = SKILL_TO_ABILITY[name];
  const baseMod = abilityMod(scores[ability]);
  const parts: string[] = [formatMod(baseMod)];
  let bonus = baseMod;
  if (skill?.expert) {
    bonus += profBonus * 2;
    parts.push(`${formatMod(profBonus)} ×2`);
  } else if (skill?.proficient) {
    bonus += profBonus;
    parts.push(formatMod(profBonus));
  }
  return { bonus, ability, parts, proficient: !!skill?.proficient, expert: !!skill?.expert };
}

export function Skills({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const addRoll = useStore((s) => s.addRoll);
  const editMode = useStore((s) => s.editMode);
  const isMaster = useIsMaster(id);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;

  const profMap = new Map(c.sheet.skills.map((s) => [s.name, s]));
  const background = backgroundSkills(findBackground(c.sheet.background));
  const raceTraits = resolveRace(c.sheet.raceInfo?.race ?? c.sheet.species, c.sheet.raceInfo?.subrace)?.traits ?? [];
  const fixed = new Set<SkillName>([
    ...background.fixed,
    ...raceTraits.flatMap((trait) => trait.skills ?? []),
  ]);
  const parts = classSkillBudget(c.sheet.classes, { fullMulticlassSkills: c.sheet.houseRules?.multiclassSkills });
  const raceChoices = raceTraits.reduce((sum, trait) => sum + (trait.skillChoices ?? 0), 0);
  const featChoices = featSkillChoices(c.sheet.features);
  const maximum =
    fixed.size + background.choose + parts.reduce((sum, part) => sum + part.count, 0) + raceChoices + featChoices;
  const allowed = new Set<SkillName>(fixed);
  for (const part of parts) for (const skill of part.from ?? ALL_SKILLS) allowed.add(skill);
  for (const skill of background.from) allowed.add(skill);
  for (const trait of raceTraits) {
    if (!trait.skillChoices) continue;
    for (const skill of trait.skillChoiceFrom ?? ALL_SKILLS) allowed.add(skill);
  }
  if (featChoices > 0) for (const skill of ALL_SKILLS) allowed.add(skill);

  // Só o Mestre mexe livremente nas perícias; o jogador só gasta as especializações que ganhou.
  const canCycle = editMode && isMaster;

  // ciclo: nenhuma -> proficiente -> especialista -> nenhuma
  const cycleSkill = (name: SkillName) => {
    const cur = profMap.get(name);
    if (!isMaster && !cur?.proficient) {
      const selected = c.sheet.skills.filter((skill) => skill.proficient).length;
      if (!allowed.has(name) || selected >= maximum) return;
    }
    const others = c.sheet.skills.filter((s) => s.name !== name);
    const next = !cur?.proficient
      ? { name, proficient: true }
      : !cur.expert
        ? { name, proficient: true, expert: true }
        : null;
    void patchSheet(id, { skills: next ? [...others, next] : others });
  };

  const doRoll = (name: SkillName, advantage = false, disadvantage = false) => {
    const { bonus } = skillParts(name, c.sheet.abilityScores, c.sheet.proficiencyBonus, profMap.get(name));
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
        <div className="flex items-baseline justify-between">
          <CardTitle>Perícias</CardTitle>
          {canCycle && (
            <span className="text-xs text-zinc-500">
              {c.sheet.skills.filter((skill) => skill.proficient).length}/{maximum}
            </span>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <ExpertisePicker id={id} />
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {ALL_SKILLS.map((name) => {
            const { bonus, ability, parts: bits, proficient, expert } = skillParts(
              name,
              c.sheet.abilityScores,
              c.sheet.proficiencyBonus,
              profMap.get(name),
            );
            return (
              <button
                key={name}
                className="group flex items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={(e) => {
                  if (canCycle) cycleSkill(name);
                  else if (e.shiftKey) doRoll(name, true);
                  else if (e.altKey) doRoll(name, false, true);
                  else doRoll(name);
                }}
                title={
                  canCycle
                    ? "Clique para alternar: proficiente → especialista → nenhuma"
                    : "Clique para rolar (Shift = vantagem, Alt = desvantagem)"
                }
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      expert
                        ? "bg-amber-500"
                        : proficient
                          ? "bg-emerald-500"
                          : "border border-zinc-400 bg-transparent"
                    }`}
                  />
                  <span className={`truncate ${proficient ? "font-medium" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {name}
                  </span>
                  <span className="shrink-0 text-[10px] uppercase text-zinc-400">
                    ({ABILITY_LABELS[ability].slice(0, 3)})
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-zinc-500">
                  ({bits.join(", ")}) <strong className="text-sm text-zinc-900 dark:text-zinc-100">{formatMod(bonus)}</strong>
                </span>
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Escolha das especializações (bônus de proficiência dobrado) que a ficha ganhou
 * por classe, subclasse ou talento. O jogador só gasta o que conquistou — e o
 * painel some quando não sobra nada para escolher.
 */
export function ExpertisePicker({ id }: { id: string }) {
  const c = useStore((s) => s.characters[id]);
  const patchSheet = useStore((s) => s.patchSheet);
  if (!c) return null;

  const budget = expertiseBudget(c.sheet.classes, {
    adopted: c.sheet.optionalFeatures,
    feats: featNamesOf(c.sheet.features),
  });
  const skills = c.sheet.skills;
  const fixedSet = new Set(budget.fixed);
  // As fixas (ex.: Batedor) não gastam orçamento; as escolhidas, sim.
  const chosen = skills.filter((s) => s.expert && !fixedSet.has(s.name));
  const left = budget.total - chosen.length;
  const missingFixed = budget.fixed.filter((name) => !skills.some((s) => s.name === name && s.expert));

  if (budget.total === 0 && missingFixed.length === 0) return null;

  const setExpert = (name: SkillName, expert: boolean) => {
    const others = skills.filter((s) => s.name !== name);
    void patchSheet(id, { skills: [...others, { name, proficient: true, ...(expert ? { expert: true } : {}) }] });
  };

  const candidates = skills
    .filter((s) => s.proficient && !fixedSet.has(s.name))
    .filter((s) => !budget.allowed || budget.allowed.includes(s.name))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs dark:border-amber-800 dark:bg-amber-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <strong className="text-sm">Especialização</strong>
        <span className={left > 0 ? "font-medium text-amber-700 dark:text-amber-300" : "text-zinc-500"}>
          {left > 0 ? `${left} perícia(s) para escolher` : "tudo escolhido"}
        </span>
      </div>
      <p className="text-zinc-600 dark:text-zinc-300">
        Dobra o bônus de proficiência nos testes da perícia. Vem de: {budget.sources.map((s) => s.label).join(" · ")}.
      </p>
      {missingFixed.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span>Automáticas: {missingFixed.join(", ")}.</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const others = skills.filter((s) => !missingFixed.includes(s.name));
              void patchSheet(id, {
                skills: [...others, ...missingFixed.map((name) => ({ name, proficient: true, expert: true }))],
              });
            }}
          >
            aplicar
          </Button>
        </div>
      )}
      {candidates.length === 0 ? (
        <p className="text-zinc-500">Nenhuma perícia proficiente disponível ainda.</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {candidates.map((skill) => {
            const active = !!skill.expert;
            return (
              <button
                key={skill.name}
                type="button"
                disabled={!active && left <= 0}
                onClick={() => setExpert(skill.name, !active)}
                className={`rounded border px-2 py-0.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
