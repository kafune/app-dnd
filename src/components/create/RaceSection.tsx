import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PointAllocator } from "@/components/PointAllocator";
import { allRaces, resolveRace } from "@/data/racesCatalog";
import { allFeats } from "@/data/featsCatalog";
import { backgroundLanguages, backgroundSkills, findBackground } from "@/data/backgroundsCatalog";
import { useStore } from "@/lib/store";
import { ALL_SKILL_NAMES } from "@/lib/skillChoice";
import type { CharacterDraft } from "@/lib/createCharacter";
import {
  ABILITY_ORDER,
  LANGUAGES,
  type AbilityKey,
  type AbilityScores,
  type CreatureSize,
  type RaceTraitDef,
  type SkillName,
} from "@/lib/types";
import { ChoiceGrid, Field, selectCls, SourceBadge, textareaCls } from "./common";
import { Input } from "@/components/ui/Input";

type Props = {
  draft: CharacterDraft;
  upd: (patch: Partial<CharacterDraft>) => void;
  scores: AbilityScores;
};

const objectTraits = (traits: CharacterDraft["raceTraits"]): RaceTraitDef[] =>
  traits.filter((trait): trait is RaceTraitDef => typeof trait !== "string");

/** Quantos idiomas adicionais o jogador escolhe (raça + traços + antecedente). */
export function extraLanguageCount(draft: CharacterDraft): number {
  const resolved = resolveRace(draft.raceName, draft.subraceName);
  return (
    (resolved?.extraLanguages ?? 0) +
    objectTraits(draft.raceTraits).reduce((sum, trait) => sum + (trait.extraLanguages ?? 0), 0) +
    backgroundLanguages(findBackground(draft.background))
  );
}

/** Quantas perícias os traços raciais deixam escolher. */
export function raceSkillChoiceCount(draft: CharacterDraft): number {
  return objectTraits(draft.raceTraits).reduce((sum, trait) => sum + (trait.skillChoices ?? 0), 0);
}

/** Quantos pontos de atributo à escolha a raça dá. */
export function raceAbilityChoiceCount(draft: CharacterDraft): number {
  return resolveRace(draft.raceName, draft.subraceName)?.choose?.count ?? 0;
}

function countAbilities(keys: AbilityKey[]): Partial<Record<AbilityKey, number>> {
  const out: Partial<Record<AbilityKey, number>> = {};
  for (const key of keys) out[key] = (out[key] ?? 0) + 1;
  return out;
}

export function RaceSection({ draft, upd, scores }: Props) {
  useStore((s) => s.homebrew); // raças/talentos homebrew novos aparecem sem recarregar
  const races = allRaces();
  const resolved = resolveRace(draft.raceName, draft.subraceName);
  const race = resolved?.race;
  const traits = objectTraits(draft.raceTraits);

  function applyRace(raceName: string, subraceName?: string) {
    const next = resolveRace(raceName, subraceName);
    if (!next) {
      upd({
        raceName: "",
        subraceName: undefined,
        raceBonuses: {},
        raceChoiceBonuses: [],
        languages: ["Comum"],
        extraLanguages: [],
        raceTraits: [],
        traitChoices: {},
        raceFeat: undefined,
        raceSkillChoices: [],
        raceNote: undefined,
        skills: [],
      });
      return;
    }
    const sameRace = next.race.name === draft.raceName;
    upd({
      raceName: next.race.name,
      subraceName: next.subrace?.name,
      raceBonuses: next.fixedBonuses,
      raceChoiceBonuses: [],
      size: sameRace && next.sizeOptions.includes(draft.size as CreatureSize) ? draft.size : next.size,
      speed: sameRace && next.speedEditable ? draft.speed : next.speed,
      languages: next.languages,
      extraLanguages: [],
      raceTraits: next.traits,
      traitChoices: {},
      raceFeat: undefined,
      raceSkillChoices: [],
      ...(sameRace ? {} : { raceNote: undefined }),
      skills: [],
    });
  }

  const choose = resolved?.choose;
  const extraLanguageMax = extraLanguageCount(draft);
  const raceSkillMax = raceSkillChoiceCount(draft);
  const choiceTraits = traits.filter((trait) => (trait.skillChoices ?? 0) > 0);
  const restrictedSkills = choiceTraits.length > 0 && choiceTraits.every((trait) => trait.skillChoiceFrom?.length);
  const skillPool: SkillName[] = restrictedSkills
    ? [...new Set(choiceTraits.flatMap((trait) => trait.skillChoiceFrom ?? []))]
    : ALL_SKILL_NAMES;
  const automaticSkills = new Set<SkillName>([
    ...backgroundSkills(findBackground(draft.background)).fixed,
    ...traits.flatMap((trait) => trait.skills ?? []),
  ]);
  const feats = allFeats().filter((feat) => !feat.races || feat.races.includes(draft.raceName));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raça</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Raça">
            <select className={selectCls} value={draft.raceName} onChange={(event) => applyRace(event.target.value)}>
              <option value="">— escolha —</option>
              {races.map((entry) => (
                <option key={entry.name} value={entry.name}>
                  {entry.name}
                  {entry.source === "Homebrew" ? " (homebrew)" : ""}
                </option>
              ))}
            </select>
          </Field>
          {race && race.subraces.length > 0 && (
            <Field label={race.subraceRequired ? "Sub-raça / versão" : "Sub-raça / variante (opcional)"}>
              <select
                className={selectCls}
                value={draft.subraceName ?? ""}
                onChange={(event) => applyRace(race.name, event.target.value || undefined)}
              >
                <option value="">{race.subraceRequired ? "— escolha —" : "— padrão, sem variante —"}</option>
                {race.subraces.map((subrace) => (
                  <option key={subrace.name} value={subrace.name}>
                    {subrace.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {resolved && (
          <div className="space-y-1 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="flex flex-wrap items-center gap-1.5">
              <SourceBadge source={resolved.race.source} />
              {resolved.subrace?.source && resolved.subrace.source !== resolved.race.source && (
                <SourceBadge source={resolved.subrace.source} />
              )}
            </div>
            <p className="text-zinc-600 dark:text-zinc-300">{resolved.race.description}</p>
            {resolved.subrace?.description && (
              <p className="text-zinc-600 dark:text-zinc-300">
                <strong>{resolved.subrace.name}:</strong> {resolved.subrace.description}
              </p>
            )}
          </div>
        )}

        {resolved?.noteField && (
          <Field label={resolved.noteField.label} hint={resolved.noteField.help}>
            <textarea
              className={textareaCls}
              rows={3}
              value={draft.raceNote ?? ""}
              placeholder={resolved.noteField.placeholder}
              onChange={(event) => upd({ raceNote: event.target.value })}
            />
          </Field>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Tamanho">
            <select
              className={selectCls}
              value={draft.size}
              onChange={(event) => upd({ size: event.target.value })}
              disabled={!resolved || resolved.sizeOptions.length <= 1}
            >
              {(resolved?.sizeOptions ?? [draft.size]).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deslocamento (m)">
            <Input
              type="number"
              inputMode="decimal"
              step={1.5}
              min={0}
              value={draft.speed}
              onChange={(event) => upd({ speed: Math.max(0, Number(event.target.value) || 0) })}
              disabled={!resolved?.speedEditable}
            />
          </Field>
          <Field label="Idiomas da raça">
            <Input value={draft.languages.join(", ")} disabled />
          </Field>
        </div>

        {choose && (
          <div>
            <div className="mb-1 text-xs font-medium text-zinc-500">Bônus racial à escolha</div>
            <PointAllocator
              points={choose.count}
              amount={choose.amount}
              maxPerAbility={choose.maxPerAbility}
              allowed={ABILITY_ORDER.filter((key) => !choose.exclude.includes(key))}
              allocation={countAbilities(draft.raceChoiceBonuses)}
              scores={scores}
              onChange={(allocation) =>
                upd({
                  raceChoiceBonuses: ABILITY_ORDER.flatMap((key) =>
                    Array.from({ length: allocation[key] ?? 0 }, () => key),
                  ),
                })
              }
              hint={
                choose.maxPerAbility > 1
                  ? "Até 2 pontos no mesmo atributo: +2 e +1, ou +1 em três."
                  : "Clique no atributo; um ponto por atributo."
              }
            />
          </div>
        )}

        {extraLanguageMax > 0 && (
          <ChoiceGrid
            label={`Idiomas adicionais: escolha ${extraLanguageMax}`}
            options={LANGUAGES.filter((language) => !draft.languages.includes(language))}
            selected={draft.extraLanguages}
            max={extraLanguageMax}
            onChange={(extraLanguages) => upd({ extraLanguages })}
          />
        )}

        {raceSkillMax > 0 && (
          <ChoiceGrid
            label={`Perícias raciais: escolha ${raceSkillMax}${restrictedSkills ? "" : " quaisquer"}`}
            options={skillPool.filter((skill) => !automaticSkills.has(skill))}
            selected={draft.raceSkillChoices}
            max={raceSkillMax}
            onChange={(choices) => {
              const next = choices as SkillName[];
              upd({ raceSkillChoices: next, skills: draft.skills.filter((skill) => !next.includes(skill)) });
            }}
          />
        )}

        {traits.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-zinc-500">Traços raciais (entram automaticamente na ficha)</div>
            {traits.map((trait) => (
              <div key={trait.name} className="rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="font-medium">{trait.name}</span>
                  {trait.resource && (
                    <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                      {trait.resource.max === "prof" ? "usos = bônus de prof." : `${trait.resource.max} uso(s)`} ·{" "}
                      {trait.resource.recharge === "short" ? "descanso curto" : "descanso longo"}
                    </span>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-line text-xs text-zinc-600 dark:text-zinc-300">{trait.description}</p>
                {trait.choice && (
                  <select
                    className={`${selectCls} mt-2`}
                    value={draft.traitChoices[trait.name] ?? ""}
                    onChange={(event) => upd({ traitChoices: { ...draft.traitChoices, [trait.name]: event.target.value } })}
                  >
                    <option value="">— {trait.choice.label} —</option>
                    {trait.choice.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {trait.feat && (
                  <select
                    className={`${selectCls} mt-2`}
                    value={draft.raceFeat ?? ""}
                    onChange={(event) => upd({ raceFeat: event.target.value || undefined })}
                  >
                    <option value="">— escolha o talento concedido —</option>
                    {feats.map((feat) => (
                      <option key={feat.name} value={feat.name}>
                        {feat.name}
                        {feat.source === "Homebrew" ? " (homebrew)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
