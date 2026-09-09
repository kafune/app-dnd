import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AbilityScoresEditor, type AbilityMode } from "@/components/create/AbilityScoresEditor";
// O catálogo de magias (600 KB) só é baixado quando a ficha tem classe conjuradora.
const SpellPicker = lazy(() =>
  import("@/components/create/SpellPicker").then((m) => ({ default: m.SpellPicker })),
);
import { EquipmentPicker } from "@/components/create/EquipmentPicker";
import { CREATURE_SIZES, ALIGNMENTS, LANGUAGES } from "@/lib/types";
import { RACES_CATALOG, findRace, findSubrace } from "@/data/racesCatalog";
import { BACKGROUNDS_CATALOG, backgroundLanguages, findBackground } from "@/data/backgroundsCatalog";
import { CLASSES_CATALOG, classFeaturesUpTo, findClass, findClassDef, subclassNames } from "@/data/classesCatalog";
import { FEATS_CATALOG, findFeat } from "@/data/featsCatalog";
import { SKILLS_CATALOG } from "@/data/skillsCatalog";
import {
  buildCharacter,
  draftScores,
  emptyDraft,
  emptyClass,
  fixedSkills,
  proficiencyBonusForLevel,
  skillBudget,
  totalRaceBonuses,
  totalHp,
  totalLevel,
  type CharacterDraft,
  type DraftClass,
} from "@/lib/createCharacter";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  abilityMod,
  formatMod,
  type AbilityKey,
  type AbilityScores,
  type AsiDecision,
  type SkillName,
} from "@/lib/types";
import {
  allSpellCaps,
  clampClassLevels,
  MAX_LEVEL,
  reachedAsis,
  spellViolations,
  type SkillBudgetPart,
} from "@/lib/progression";

const selectCls =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const CUSTOM = "__custom__";

export default function CriarFicha() {
  const navigate = useNavigate();
  const createCharacter = useStore((s) => s.createCharacter);
  const pushToast = useStore((s) => s.pushToast);

  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft);
  const [raceMode, setRaceMode] = useState<"catalog" | "custom">("catalog");
  const [bgMode, setBgMode] = useState<"catalog" | "custom">("catalog");
  const [abilityMode, setAbilityMode] = useState<AbilityMode>("pointbuy");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const upd = (patch: Partial<CharacterDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const selectedRace = useMemo(() => findRace(draft.raceName), [draft.raceName]);
  const selectedSubrace = useMemo(
    () => findSubrace(draft.raceName, draft.subraceName ?? ""),
    [draft.raceName, draft.subraceName],
  );
  const selectedBackground = useMemo(
    () => (bgMode === "catalog" ? findBackground(draft.background) : undefined),
    [bgMode, draft.background],
  );
  const budget = skillBudget(draft);
  const fixedSkillNames = fixedSkills(draft);
  const allowedSkillNames = new Set(
    budget.parts.flatMap((part) => part.from ?? SKILLS_CATALOG.map((skill) => skill.name)),
  );
  const skillOptions = SKILLS_CATALOG.map((skill) => skill.name).filter((name) => allowedSkillNames.has(name));

  const casterClasses = draft.classes.filter((c) => c.name.trim());
  const casterClassNames = casterClasses.map((c) => c.name);

  const scores = useMemo(() => draftScores(draft), [draft]);
  const spellCaps = allSpellCaps(casterClasses, scores);
  const extraLanguageMax =
    (selectedRace?.extraLanguages ?? 0) +
    draft.raceTraits.reduce((sum, trait) => sum + (typeof trait === "string" ? 0 : (trait.extraLanguages ?? 0)), 0) +
    backgroundLanguages(selectedBackground);
  const raceSkillMax = draft.raceTraits.reduce(
    (sum, trait) => sum + (typeof trait === "string" ? 0 : (trait.skillChoices ?? 0)),
    0,
  );
  const raceAbilityChoiceMax =
    (selectedRace?.abilityScoreIncrease.choose?.count ?? 0) +
    (selectedSubrace?.abilityScoreIncrease.choose?.count ?? 0);
  const profBonus = proficiencyBonusForLevel(totalLevel(draft.classes));
  const previewHp = draft.hpOverride ?? totalHp(draft.classes, abilityMod(scores.con));
  const previewAc = draft.acOverride ?? 10 + abilityMod(scores.dex);

  function onSelectRace(value: string) {
    if (value === CUSTOM) {
      setRaceMode("custom");
      upd({ raceName: "", subraceName: undefined, raceBonuses: {}, raceChoiceBonuses: [], raceTraits: [], skills: [] });
      return;
    }
    setRaceMode("catalog");
    const r = findRace(value);
    if (!r) return;
    const bonuses: Partial<Record<AbilityKey, number>> = {};
    for (const k of ABILITY_ORDER) {
      const v = r.abilityScoreIncrease[k];
      if (v) bonuses[k] = v;
    }
    upd({
      raceName: r.name,
      raceBonuses: bonuses,
      subraceName: undefined,
      size: r.size,
      speed: r.speed,
      languages: r.languages,
      extraLanguages: [],
      raceTraits: r.traits,
      raceChoiceBonuses: [],
      traitChoices: {},
      raceFeat: undefined,
      raceSkillChoices: [],
      skills: [],
    });
  }

  function onSelectSubrace(value: string) {
    const race = findRace(draft.raceName);
    const subrace = findSubrace(draft.raceName, value);
    if (!race || !subrace) return;
    const bonuses: Partial<Record<AbilityKey, number>> = {};
    for (const key of ABILITY_ORDER) {
      const amount = (race.abilityScoreIncrease[key] ?? 0) + (subrace.abilityScoreIncrease[key] ?? 0);
      if (amount) bonuses[key] = amount;
    }
    upd({
      subraceName: subrace.name,
      raceBonuses: bonuses,
      raceChoiceBonuses: [],
      speed: subrace.speed ?? race.speed,
      languages: race.languages,
      extraLanguages: [],
      raceTraits: [...race.traits, ...subrace.traits],
      traitChoices: {},
      raceFeat: undefined,
      raceSkillChoices: [],
      skills: [],
    });
  }

  function onSelectBackground(value: string) {
    if (value === CUSTOM) {
      setBgMode("custom");
      upd({ background: "", skills: [], extraLanguages: [] });
      return;
    }
    setBgMode("catalog");
    const b = findBackground(value);
    upd({ background: b?.name ?? value, skills: [], extraLanguages: [] });
  }

  function setClasses(next: DraftClass[]) {
    upd({ classes: next, skills: [], cantrips: [], knownSpells: [], advancement: [] });
  }

  function updateClass(index: number, patch: Partial<DraftClass>) {
    const next = draft.classes.map((current, i) => {
      if (i !== index) return current;
      const updated = { ...current, ...patch };
      const definition = findClassDef(updated.name);
      if (definition && updated.level < definition.subclassLevel) updated.subclass = undefined;
      return updated;
    });
    setClasses(clampClassLevels(next, index));
  }

  function onSelectClass(index: number, value: string) {
    const c = findClass(value);
    if (!c) {
      updateClass(index, { name: value });
      return;
    }
    const profs = [c.armorProficiencies, c.weaponProficiencies, c.toolProficiencies].filter(
      (p) => p && !/nenhuma/i.test(p),
    );
    updateClass(index, {
      name: c.name,
      subclass: undefined,
      hitDie: c.hitDie,
      saves: c.savingThrows,
      proficiencies: profs,
      spellcastingAbility: c.spellcastingAbility,
    });
    // ao trocar a 1ª classe, zera as perícias (a lista de opções muda)
    if (index === 0) upd({ skills: [] });
  }

  function addClass() {
    if (totalLevel(draft.classes) >= MAX_LEVEL) return;
    setClasses([...draft.classes, emptyClass()]);
  }

  function removeClass(index: number) {
    if (draft.classes.length <= 1) return;
    setClasses(draft.classes.filter((_, i) => i !== index));
  }

  function toggleSkill(name: string) {
    const skill = name as SkillName;
    const has = draft.skills.includes(skill);
    const next = has ? draft.skills.filter((s) => s !== skill) : [...draft.skills, skill];
    if (!has && !skillSelectionFits(next, budget.parts)) return;
    if (!has && next.length > budget.total) return;
    upd({ skills: next });
  }

  function setCustomBonus(k: AbilityKey, value: number) {
    const next = { ...draft.raceBonuses };
    if (value) next[k] = value;
    else delete next[k];
    upd({ raceBonuses: next });
  }

  async function onSubmit() {
    setError(null);
    if (!draft.characterName.trim()) return setError("Dê um nome ao personagem.");
    if (!draft.playerName.trim()) return setError("Informe o nome do jogador.");
    if (!draft.pin.trim()) return setError("Defina um PIN para proteger a ficha.");
    if (raceMode === "custom" && !draft.raceName.trim())
      return setError("Dê um nome à raça custom.");
    if (!draft.classes.some((c) => c.name.trim())) return setError("Escolha uma classe.");
    if (totalLevel(draft.classes) > MAX_LEVEL) return setError("O nível total máximo é 20.");
    if (selectedRace?.subraceRequired && !draft.subraceName) return setError("Escolha uma sub-raça.");
    if (draft.raceChoiceBonuses.length !== raceAbilityChoiceMax)
      return setError(`Escolha exatamente ${raceAbilityChoiceMax} bônus racial(is) de atributo.`);
    if (draft.raceTraits.some((trait) => typeof trait !== "string" && trait.choice && !draft.traitChoices[trait.name]))
      return setError("Complete as escolhas dos traços raciais.");
    if (draft.raceTraits.some((trait) => typeof trait !== "string" && trait.feat) && !draft.raceFeat)
      return setError("Escolha o talento concedido pela raça.");
    if (draft.extraLanguages.length !== extraLanguageMax)
      return setError(`Escolha exatamente ${extraLanguageMax} idioma(s) adicional(is).`);
    if (draft.raceSkillChoices.length !== raceSkillMax)
      return setError(`Escolha exatamente ${raceSkillMax} perícia(s) racial(is).`);
    if (draft.skills.length !== budget.total || !skillSelectionFits(draft.skills, budget.parts))
      return setError(`Escolha exatamente ${budget.total} perícia(s) permitida(s) pelas classes e antecedente.`);
    if (reachedAsis(draft.classes).length !== draft.advancement.length)
      return setError("Decida todos os aumentos de atributo/talentos da progressão.");
    if (!draft.advancement.every((decision) => validAdvancementDecision(decision, scores)))
      return setError("Complete cada aumento de atributo ou escolha de talento.");
    const spellIssues = spellViolations(draft.classes, scores, draft.cantrips, draft.knownSpells);
    if (spellIssues.length) return setError(spellIssues[0]);

    setSubmitting(true);
    try {
      const character = buildCharacter(draft, "");
      const id = await createCharacter(character);
      pushToast({ title: `${draft.characterName} criado!`, tone: "success" });
      navigate(`/personagem/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar a ficha.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-mono text-2xl font-bold tracking-tight">Criar ficha</h1>

      <div className="space-y-4">
        {/* Identidade */}
        <Card>
          <CardHeader>
            <CardTitle>Identidade</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nome do personagem">
              <Input
                value={draft.characterName}
                onChange={(e) => upd({ characterName: e.target.value })}
                placeholder="Ex: Thorin Pedra-Forte"
              />
            </Field>
            <Field label="Jogador">
              <Input
                value={draft.playerName}
                onChange={(e) => upd({ playerName: e.target.value })}
                placeholder="Seu nome"
              />
            </Field>
            <Field label="PIN (protege a edição)">
              <Input
                value={draft.pin}
                onChange={(e) => upd({ pin: e.target.value })}
                inputMode="numeric"
                placeholder="ex: 1234"
              />
            </Field>
            <Field label="Cor (opcional)">
              <input
                type="color"
                value={draft.color ?? "#7c3aed"}
                onChange={(e) => upd({ color: e.target.value })}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
              />
            </Field>
            <Field label="Antecedente">
              <select
                className={selectCls}
                value={bgMode === "custom" ? CUSTOM : draft.background}
                onChange={(e) => onSelectBackground(e.target.value)}
              >
                <option value="">— escolha —</option>
                {BACKGROUNDS_CATALOG.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              {bgMode === "custom" && (
                <Input
                  className="mt-2"
                  value={draft.background}
                  onChange={(e) => upd({ background: e.target.value })}
                  placeholder="Ex: Caçador de Tempestades"
                />
              )}
            </Field>
            <Field label="Tendência (opcional)">
              <select
                className={selectCls}
                value={draft.alignment ?? ""}
                onChange={(e) => upd({ alignment: e.target.value || undefined })}
              >
                <option value="">— escolha —</option>
                {ALIGNMENTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
            {bgMode === "catalog" && selectedBackground && (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-800/50 sm:col-span-2">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  {selectedBackground.source}
                </div>
                <dl className="space-y-1">
                  <BgRow label="Perícias" value={selectedBackground.skills} />
                  {selectedBackground.tools && (
                    <BgRow label="Ferramentas" value={selectedBackground.tools} />
                  )}
                  {selectedBackground.languages && (
                    <BgRow label="Idiomas" value={selectedBackground.languages} />
                  )}
                  <BgRow label="Equipamento" value={selectedBackground.equipment} />
                  {selectedBackground.variants?.length ? (
                    <BgRow label="Variantes" value={selectedBackground.variants.join(", ")} />
                  ) : null}
                </dl>
                <div className="mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-700">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                    {selectedBackground.feature.name}.
                  </span>{" "}
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {selectedBackground.feature.description}
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Raça */}
        <Card>
          <CardHeader>
            <CardTitle>Raça</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Field label="Raça">
              <select
                className={selectCls}
                value={raceMode === "custom" ? CUSTOM : draft.raceName}
                onChange={(e) => onSelectRace(e.target.value)}
              >
                <option value="">— escolha —</option>
                {RACES_CATALOG.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>

            {selectedRace?.subraces.length ? (
              <Field label="Sub-raça">
                <select
                  className={selectCls}
                  value={draft.subraceName ?? ""}
                  onChange={(event) => onSelectSubrace(event.target.value)}
                >
                  <option value="">— escolha —</option>
                  {selectedRace.subraces.map((subrace) => (
                    <option key={subrace.name} value={subrace.name}>
                      {subrace.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            {raceMode === "custom" && (
              <>
                <Field label="Nome da raça custom">
                  <Input
                    value={draft.raceName}
                    onChange={(e) => upd({ raceName: e.target.value })}
                    placeholder="Ex: Meio-dragão Cristalino"
                  />
                </Field>
                <div>
                  <div className="mb-1 text-xs font-medium text-zinc-500">Bônus de atributo</div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {ABILITY_ORDER.map((k) => (
                      <label key={k} className="text-center text-xs">
                        <span className="block text-zinc-500">{ABILITY_LABELS[k].slice(0, 3)}</span>
                        <Input
                          type="number"
                          inputMode="numeric"
                          className="h-8 px-1 text-center"
                          value={draft.raceBonuses[k] ?? 0}
                          onChange={(e) => setCustomBonus(k, Number(e.target.value) || 0)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Tamanho">
                <select
                  className={selectCls}
                  value={CREATURE_SIZES.includes(draft.size as (typeof CREATURE_SIZES)[number]) ? draft.size : "Médio"}
                  onChange={(e) => upd({ size: e.target.value })}
                  disabled={raceMode === "catalog" && !!selectedRace}
                >
                  {CREATURE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Deslocamento (m)">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={draft.speed}
                  onChange={(e) => upd({ speed: Number(e.target.value) || 0 })}
                  disabled={raceMode === "catalog" && !!selectedRace}
                />
              </Field>
              <Field label="Idiomas padrão">
                <Input value={draft.languages.join(", ")} disabled={raceMode === "catalog"} />
              </Field>
            </div>

            {extraLanguageMax > 0 && (
              <ChoiceGrid
                label={`Idiomas adicionais: escolha ${extraLanguageMax}`}
                options={LANGUAGES.filter((language) => !draft.languages.includes(language))}
                selected={draft.extraLanguages}
                max={extraLanguageMax}
                onChange={(extraLanguages) => upd({ extraLanguages })}
              />
            )}

            {raceAbilityChoiceMax > 0 && (
              <div>
                <div className="mb-1 text-xs font-medium text-zinc-500">
                  Bônus racial à escolha ({draft.raceChoiceBonuses.length}/{raceAbilityChoiceMax})
                </div>
                <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
                  {ABILITY_ORDER.map((key) => {
                    const checked = draft.raceChoiceBonuses.includes(key);
                    return (
                      <label key={key} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!checked && draft.raceChoiceBonuses.length >= raceAbilityChoiceMax}
                          onChange={() => upd({
                            raceChoiceBonuses: checked
                              ? draft.raceChoiceBonuses.filter((entry) => entry !== key)
                              : [...draft.raceChoiceBonuses, key],
                          })}
                        />
                        {ABILITY_LABELS[key].slice(0, 3)}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {raceSkillMax > 0 && (
              <ChoiceGrid
                label={`Perícias raciais: escolha ${raceSkillMax}`}
                options={SKILLS_CATALOG.map((skill) => skill.name).filter((name) => !fixedSkillNames.includes(name))}
                selected={draft.raceSkillChoices}
                max={raceSkillMax}
                onChange={(raceSkillChoices) => {
                  const next = raceSkillChoices as SkillName[];
                  upd({ raceSkillChoices: next, skills: draft.skills.filter((skill) => !next.includes(skill)) });
                }}
              />
            )}

            {draft.raceTraits.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-500">Traços raciais automáticos</div>
                {draft.raceTraits.map((rawTrait) => {
                  if (typeof rawTrait === "string") return null;
                  const trait = rawTrait;
                  return (
                    <div key={trait.name} className="rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                      <div className="font-medium">{trait.name}</div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{trait.description}</p>
                      {trait.choice && (
                        <select
                          className={`${selectCls} mt-2`}
                          value={draft.traitChoices[trait.name] ?? ""}
                          onChange={(event) =>
                            upd({ traitChoices: { ...draft.traitChoices, [trait.name]: event.target.value } })
                          }
                        >
                          <option value="">— {trait.choice.label} —</option>
                          {trait.choice.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
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
                          {FEATS_CATALOG.filter((feat) => !feat.races || feat.races.includes(draft.raceName)).map((feat) => (
                            <option key={feat.name} value={feat.name}>{feat.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Classes (multiclasse) */}
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <CardTitle>Classe(s)</CardTitle>
              <span className="text-xs text-zinc-500">Nível total: {totalLevel(draft.classes)}</span>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {draft.classes.map((cl, i) => {
              const detailedClass = findClassDef(cl.name);
              return (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end"
                >
                  <Field label={i === 0 ? "Classe" : `Classe ${i + 1}`}>
                    <select
                      className={selectCls}
                      value={cl.name}
                      onChange={(e) => onSelectClass(i, e.target.value)}
                    >
                      <option value="">— escolha —</option>
                      {CLASSES_CATALOG.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Nível">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={20}
                      className="w-20"
                      value={cl.level}
                      onChange={(e) =>
                        updateClass(i, {
                          level: Math.min(MAX_LEVEL, Math.max(1, Number(e.target.value) || 1)),
                        })
                      }
                    />
                  </Field>
                  <Field label="Subclasse">
                    <select
                      className={selectCls}
                      value={cl.subclass ?? ""}
                      onChange={(e) => updateClass(i, { subclass: e.target.value || undefined })}
                      disabled={!detailedClass?.subclasses.length || cl.level < detailedClass.subclassLevel}
                    >
                      <option value="">{detailedClass && cl.level < detailedClass.subclassLevel ? `— disponível no nível ${detailedClass.subclassLevel} —` : "— nenhuma —"}</option>
                      {subclassNames(cl.name).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {draft.classes.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeClass(i)}
                      title="Remover classe"
                    >
                      ✕
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addClass}
              disabled={totalLevel(draft.classes) >= MAX_LEVEL || draft.classes.some((entry) => !entry.name.trim())}
            >
              + Adicionar classe (multiclasse)
            </Button>
          </CardBody>
        </Card>

        {/* Progressão de características */}
        {draft.classes.some((c) => c.name.trim()) && (
          <Card>
            <CardHeader>
              <CardTitle>Progressão de características</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {draft.classes
                .filter((c) => c.name.trim())
                .map((cl, i) => (
                  <ClassProgression key={i} className={cl.name} level={cl.level} />
                ))}
              <p className="text-xs text-zinc-500">
                As características até o nível escolhido entram automaticamente na ficha.
              </p>
            </CardBody>
          </Card>
        )}

        {reachedAsis(draft.classes).length > 0 && (
          <AdvancementChoices draft={draft} onChange={(advancement) => upd({ advancement })} scores={scores} />
        )}

        {/* Atributos */}
        <Card>
          <CardHeader>
            <CardTitle>Atributos</CardTitle>
          </CardHeader>
          <CardBody>
            <AbilityScoresEditor
              scores={draft.baseScores}
              bonuses={totalRaceBonuses(draft)}
              mode={abilityMode}
              onMode={setAbilityMode}
              onChange={(s) => upd({ baseScores: s })}
            />
          </CardBody>
        </Card>

        {/* Perícias */}
        <Card>
          <CardHeader>
            <CardTitle>Perícias</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="mb-2 text-xs text-zinc-500">
              Escolha <strong>{budget.total}</strong> — selecionadas: {draft.skills.length}. Fixas: {fixedSkillNames.join(", ") || "nenhuma"}.
            </p>
            <div className="mb-2 space-y-0.5 text-[11px] text-zinc-500">
              {budget.parts.map((part) => <div key={part.label}>{part.label}: {part.count}</div>)}
            </div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {skillOptions.map((name) => (
                <label key={name} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.skills.includes(name as SkillName)}
                    onChange={() => toggleSkill(name)}
                    disabled={fixedSkillNames.includes(name as SkillName)}
                  />
                  {name}
                </label>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Magias */}
        {casterClassNames.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Magias</CardTitle>
            </CardHeader>
            <CardBody>
              <Suspense fallback={<p className="text-sm text-zinc-500">Carregando catálogo de magias…</p>}>
                <SpellPicker
                  classNames={casterClassNames}
                  caps={spellCaps}
                  cantrips={draft.cantrips}
                  known={draft.knownSpells}
                  onChange={(cantrips, knownSpells) => upd({ cantrips, knownSpells })}
                />
              </Suspense>
            </CardBody>
          </Card>
        )}

        {/* Equipamento & inventário */}
        <Card>
          <CardHeader>
            <CardTitle>Equipamento & inventário</CardTitle>
          </CardHeader>
          <CardBody>
            <EquipmentPicker
              key={draft.classes.map((entry) => entry.name).join("|")}
              classNames={draft.classes.map((entry) => entry.name).filter(Boolean)}
              items={draft.inventoryItems}
              onChange={(inventoryItems) => upd({ inventoryItems })}
            />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["gp", "sp", "cp"] as const).map((coin) => (
                <Field key={coin} label={coin === "gp" ? "Ouro (po)" : coin === "sp" ? "Prata (pp)" : "Cobre (pc)"}>
                  <Input
                    type="number"
                    min={0}
                    value={draft.coins[coin]}
                    onChange={(event) => upd({ coins: { ...draft.coins, [coin]: Math.max(0, Number(event.target.value) || 0) } })}
                  />
                </Field>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Derivados */}
        <Card>
          <CardHeader>
            <CardTitle>Combate (auto-calculado)</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="PV máximo" value={String(previewHp)} />
            <Stat label="CA" value={String(previewAc)} />
            <Stat label="Iniciativa" value={formatMod(abilityMod(scores.dex))} />
            <Stat label="Bônus de prof." value={formatMod(profBonus)} />
          </CardBody>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate("/")} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="success" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Criando…" : "Criar ficha"}
          </Button>
        </div>
      </div>
    </main>
  );
}

function ChoiceGrid({
  label,
  options,
  selected,
  max,
  onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  max: number;
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-zinc-500">
        {label} ({selected.length}/{max})
      </div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label key={option} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && selected.length >= max}
                onChange={() => onChange(checked ? selected.filter((value) => value !== option) : [...selected, option])}
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function skillSelectionFits(selected: SkillName[], parts: SkillBudgetPart[]): boolean {
  if (selected.length > parts.reduce((total, part) => total + part.count, 0)) return false;
  const slots = parts.flatMap((part) =>
    Array.from({ length: part.count }, () => new Set(part.from ?? SKILLS_CATALOG.map((skill) => skill.name))),
  );
  const ordered = [...selected].sort(
    (a, b) => slots.filter((slot) => slot.has(a)).length - slots.filter((slot) => slot.has(b)).length,
  );
  const used = new Set<number>();
  const place = (index: number): boolean => {
    if (index >= ordered.length) return true;
    for (let slot = 0; slot < slots.length; slot += 1) {
      if (used.has(slot) || !slots[slot].has(ordered[index])) continue;
      used.add(slot);
      if (place(index + 1)) return true;
      used.delete(slot);
    }
    return false;
  };
  return place(0);
}

function decisionPicks(decision: AsiDecision | undefined): AbilityKey[] {
  if (decision?.kind !== "asi") return [];
  return ABILITY_ORDER.flatMap((key) => Array.from({ length: decision.abilities?.[key] ?? 0 }, () => key));
}

function validAdvancementDecision(decision: AsiDecision, scores: AbilityScores): boolean {
  if (decision.kind === "feat") {
    if (!decision.feat) return false;
    const feat = findFeat(decision.feat);
    if (!feat?.abilityIncrease) return true;
    return ABILITY_ORDER.some(
      (key) => (decision.abilities?.[key] ?? 0) === feat.abilityIncrease!.amount && scores[key] <= 20,
    );
  }
  return ABILITY_ORDER.reduce((sum, key) => sum + (decision.abilities?.[key] ?? 0), 0) === 2;
}

function AdvancementChoices({
  draft,
  scores,
  onChange,
}: {
  draft: CharacterDraft;
  scores: AbilityScores;
  onChange: (next: AsiDecision[]) => void;
}) {
  const slots = reachedAsis(draft.classes);
  const update = (slot: { className: string; level: number }, next: AsiDecision) => {
    onChange([
      ...draft.advancement.filter(
        (decision) => !(decision.className === slot.className && decision.level === slot.level),
      ),
      next,
    ]);
  };
  return (
    <Card>
      <CardHeader><CardTitle>Aumentos de atributo ou talentos</CardTitle></CardHeader>
      <CardBody className="space-y-3">
        {slots.map((slot) => {
          const decision = draft.advancement.find(
            (entry) => entry.className === slot.className && entry.level === slot.level,
          );
          const picks = decisionPicks(decision);
          const feat = decision?.feat ? findFeat(decision.feat) : undefined;
          return (
            <div key={`${slot.className}:${slot.level}`} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 text-sm font-medium">{slot.className} · nível {slot.level}</div>
              <select
                className={selectCls}
                value={decision?.kind ?? ""}
                onChange={(event) => {
                  const kind = event.target.value as "asi" | "feat";
                  if (!kind) {
                    onChange(draft.advancement.filter((entry) => !(entry.className === slot.className && entry.level === slot.level)));
                  } else {
                    update(slot, { className: slot.className, level: slot.level, kind, ...(kind === "asi" ? { abilities: {} } : {}) });
                  }
                }}
              >
                <option value="">— decidir —</option>
                <option value="asi">Aumentar atributos (+2 ou +1/+1)</option>
                <option value="feat">Escolher um talento</option>
              </select>
              {decision?.kind === "asi" && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[0, 1].map((index) => (
                    <select
                      key={index}
                      className={selectCls}
                      value={picks[index] ?? ""}
                      onChange={(event) => {
                        const nextPicks = [...picks];
                        nextPicks[index] = event.target.value as AbilityKey;
                        const abilities: Partial<Record<AbilityKey, number>> = {};
                        for (const key of nextPicks.filter(Boolean)) abilities[key] = (abilities[key] ?? 0) + 1;
                        update(slot, { ...decision, abilities });
                      }}
                    >
                      <option value="">— atributo +1 —</option>
                      {ABILITY_ORDER.map((key) => (
                        <option key={key} value={key} disabled={scores[key] + (picks.filter((pick) => pick === key).length || 1) > 20}>
                          {ABILITY_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              )}
              {decision?.kind === "feat" && (
                <div className="mt-2 space-y-2">
                  <select
                    className={selectCls}
                    value={decision.feat ?? ""}
                    onChange={(event) => update(slot, { ...decision, feat: event.target.value, abilities: undefined })}
                  >
                    <option value="">— talento —</option>
                    {FEATS_CATALOG.filter((entry) => !entry.races || entry.races.includes(draft.raceName)).map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {entry.name}{entry.prerequisite ? ` — pré-requisito: ${entry.prerequisite}` : ""}
                      </option>
                    ))}
                  </select>
                  {feat?.abilityIncrease && (
                    <select
                      className={selectCls}
                      value={ABILITY_ORDER.find((key) => (decision.abilities?.[key] ?? 0) > 0) ?? ""}
                      onChange={(event) => update(slot, { ...decision, abilities: { [event.target.value]: feat.abilityIncrease!.amount } })}
                    >
                      <option value="">— atributo do talento —</option>
                      {feat.abilityIncrease.choose.map((key) => (
                        <option key={key} value={key} disabled={scores[key] >= 20}>{ABILITY_LABELS[key]}</option>
                      ))}
                    </select>
                  )}
                  {feat && <p className="text-xs text-zinc-600 dark:text-zinc-300">{feat.description}</p>}
                </div>
              )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function BgRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-medium text-zinc-500">{label}:</dt>
      <dd className="text-zinc-600 dark:text-zinc-300">{value}</dd>
    </div>
  );
}

function ClassProgression({ className, level }: { className: string; level: number }) {
  const feats = classFeaturesUpTo(className, level);
  if (feats.length === 0) return null;
  const byLevel = new Map<number, string[]>();
  for (const f of feats) {
    if (!byLevel.has(f.level)) byLevel.set(f.level, []);
    byLevel.get(f.level)!.push(f.name);
  }
  return (
    <div>
      <div className="mb-1 text-sm font-medium">
        {className} <span className="text-xs text-zinc-500">(até o nível {level})</span>
      </div>
      <ul className="space-y-0.5 text-sm">
        {[...byLevel.keys()]
          .sort((a, b) => a - b)
          .map((lvl) => (
            <li key={lvl} className="flex gap-2">
              <span className="w-8 shrink-0 text-right text-xs text-zinc-500">{lvl}º</span>
              <span>{byLevel.get(lvl)!.join(", ")}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="font-mono text-lg">{value}</div>
    </div>
  );
}
