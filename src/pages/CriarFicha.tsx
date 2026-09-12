import { lazy, Suspense, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AbilityScoresEditor, type AbilityMode } from "@/components/create/AbilityScoresEditor";
import { AdvancementChoices, sumIncrease } from "@/components/create/AdvancementChoices";
import { AvatarPicker } from "@/components/create/AvatarPicker";
import { ClassProgression } from "@/components/create/ClassProgression";
import { ExpertisePicker, OptionalFeaturesPicker } from "@/components/create/ClassOptions";
import { Field, selectCls } from "@/components/create/common";
import { EquipmentPicker } from "@/components/create/EquipmentPicker";
import { BackgroundEquipment } from "@/components/create/BackgroundEquipment";
import { missingToolChoice } from "@/data/backgroundEquipment";
import {
  extraLanguageCount,
  raceAbilityChoiceCount,
  raceSkillChoiceCount,
  RaceSection,
} from "@/components/create/RaceSection";
import { SkillsSection } from "@/components/create/SkillsSection";
// O catálogo de magias (600 KB) só é baixado quando a ficha tem classe conjuradora.
const SpellPicker = lazy(() =>
  import("@/components/create/SpellPicker").then((m) => ({ default: m.SpellPicker })),
);
import { ALIGNMENTS } from "@/lib/types";
import { resolveRace } from "@/data/racesCatalog";
import { BACKGROUNDS_CATALOG, findBackground } from "@/data/backgroundsCatalog";
import { CLASSES_CATALOG, findClass, findClassDef, subclassNames } from "@/data/classesCatalog";
import { findFeat } from "@/data/featsCatalog";
import {
  buildCharacter,
  draftScores,
  emptyDraft,
  emptyClass,
  proficiencyBonusForLevel,
  skillBudget,
  totalRaceBonuses,
  totalHp,
  totalLevel,
  type CharacterDraft,
  type DraftClass,
} from "@/lib/createCharacter";
import { skillSelectionFits } from "@/lib/skillChoice";
import {
  ABILITY_ORDER,
  abilityMod,
  formatMod,
  type AbilityKey,
  type AbilityScores,
  type AsiDecision,
  type RaceTraitDef,
} from "@/lib/types";
import {
  allSpellCaps,
  clampClassLevels,
  expertiseBudget,
  grantedSpellsFor,
  MAX_LEVEL,
  reachedAsis,
  spellViolations,
} from "@/lib/progression";

const CUSTOM = "__custom__";

export default function CriarFicha() {
  const navigate = useNavigate();
  const { folderId = "" } = useParams<{ folderId: string }>();
  const folderName = useStore((s) => s.folders[folderId]?.name);
  const canCreate = useStore((s) => !!s.openedFolders[folderId]?.canCreate);
  const createCharacter = useStore((s) => s.createCharacter);
  const uploadAvatar = useStore((s) => s.uploadAvatar);
  const pushToast = useStore((s) => s.pushToast);
  useStore((s) => s.homebrew); // re-renderiza quando o Mestre publica homebrew

  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft);
  const [bgMode, setBgMode] = useState<"catalog" | "custom">("catalog");
  const [abilityMode, setAbilityMode] = useState<AbilityMode>("pointbuy");
  const [avatar, setAvatar] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const upd = (patch: Partial<CharacterDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const selectedBackground = useMemo(
    () => (bgMode === "catalog" ? findBackground(draft.background) : undefined),
    [bgMode, draft.background],
  );
  const resolvedRace = resolveRace(draft.raceName, draft.subraceName);
  const namedClasses = draft.classes.filter((c) => c.name.trim());
  const scores = useMemo(() => draftScores(draft), [draft]);
  const spellCaps = allSpellCaps(namedClasses, scores);
  const profBonus = proficiencyBonusForLevel(totalLevel(draft.classes));
  const averageHpPreview = totalHp(draft.classes, abilityMod(scores.con));
  const previewHp = draft.hpOverride ?? averageHpPreview;
  const previewAc = draft.acOverride ?? 10 + abilityMod(scores.dex);

  // Pontos livres de aumento de atributo (2 por ASI escolhido como "pontos de atributo").
  const asiDecisions = draft.advancement.filter((decision) => decision.kind === "asi");
  const freePoints = asiDecisions.reduce((sum, decision) => sum + Math.max(0, 2 - sumIncrease(decision.abilities)), 0);
  const asiPoints: Partial<Record<AbilityKey, number>> = {};
  const increases: Partial<Record<AbilityKey, number>> = {};
  for (const decision of draft.advancement) {
    for (const key of ABILITY_ORDER) {
      const value = decision.abilities?.[key] ?? 0;
      if (!value) continue;
      increases[key] = (increases[key] ?? 0) + value;
      if (decision.kind === "asi") asiPoints[key] = (asiPoints[key] ?? 0) + value;
    }
  }

  const raceTraitDefs = draft.raceTraits.filter((trait): trait is RaceTraitDef => typeof trait !== "string");
  const grantedSpells = [
    ...namedClasses.flatMap((entry) =>
      grantedSpellsFor(entry).map((spell) => ({ name: spell.name, origin: `${spell.granted} (${entry.name} ${entry.level})` })),
    ),
    ...raceTraitDefs.flatMap((trait) =>
      (trait.spells ?? []).map((name) => ({ name, origin: `${trait.name} (${draft.raceName})` })),
    ),
  ];

  function onFreePoint(key: AbilityKey, delta: 1 | -1) {
    if (delta > 0) {
      if (scores[key] >= 20) return;
      const target = draft.advancement.find(
        (decision) => decision.kind === "asi" && sumIncrease(decision.abilities) < 2 && (decision.abilities?.[key] ?? 0) < 2,
      );
      if (!target) return;
      upd({
        advancement: draft.advancement.map((decision) =>
          decision === target
            ? { ...decision, abilities: { ...decision.abilities, [key]: (decision.abilities?.[key] ?? 0) + 1 } }
            : decision,
        ),
      });
      return;
    }
    const target = [...draft.advancement].reverse().find((decision) => decision.kind === "asi" && (decision.abilities?.[key] ?? 0) > 0);
    if (!target) return;
    const abilities = { ...target.abilities };
    const left = (abilities[key] ?? 0) - 1;
    if (left > 0) abilities[key] = left;
    else delete abilities[key];
    upd({ advancement: draft.advancement.map((decision) => (decision === target ? { ...decision, abilities } : decision)) });
  }

  function onSelectBackground(value: string) {
    if (value === CUSTOM) {
      setBgMode("custom");
      upd({ background: "", skills: [], extraLanguages: [], backgroundEquipmentChoices: [], backgroundToolPicks: [] });
      return;
    }
    setBgMode("catalog");
    const b = findBackground(value);
    upd({
      background: b?.name ?? value,
      skills: [],
      extraLanguages: [],
      backgroundEquipmentChoices: [],
      backgroundToolPicks: [],
    });
  }

  function setClasses(next: DraftClass[]) {
    // Trocar de classe invalida tudo que dependia dela: perícias, magias, ASI,
    // especialização e as opcionais de Tasha.
    upd({
      classes: next,
      skills: [],
      cantrips: [],
      knownSpells: [],
      advancement: [],
      expertise: [],
      optionalFeatures: [],
    });
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
  }

  function addClass() {
    if (totalLevel(draft.classes) >= MAX_LEVEL) return;
    setClasses([...draft.classes, emptyClass()]);
  }

  function removeClass(index: number) {
    if (draft.classes.length <= 1) return;
    setClasses(draft.classes.filter((_, i) => i !== index));
  }

  async function onSubmit() {
    setError(null);
    const budget = skillBudget(draft);
    const abilityChoices = raceAbilityChoiceCount(draft);
    const extraLanguageMax = extraLanguageCount(draft);
    const raceSkillMax = raceSkillChoiceCount(draft);
    if (!draft.characterName.trim()) return setError("Dê um nome ao personagem.");
    if (!draft.playerName.trim()) return setError("Informe o nome do jogador.");
    if (!draft.pin.trim()) return setError("Defina um PIN para proteger a ficha.");
    if (!resolvedRace) return setError("Escolha uma raça.");
    if (!namedClasses.length) return setError("Escolha uma classe.");
    if (totalLevel(draft.classes) > MAX_LEVEL) return setError("O nível total máximo é 20.");
    if (resolvedRace.race.subraceRequired && !draft.subraceName) return setError("Escolha a sub-raça ou versão da raça.");
    if (resolvedRace.noteField && !draft.raceNote?.trim())
      return setError(`Preencha o campo “${resolvedRace.noteField.label}”.`);
    if (draft.raceChoiceBonuses.length !== abilityChoices)
      return setError(`Distribua os ${abilityChoices} ponto(s) do bônus racial de atributo.`);
    if (raceTraitDefs.some((trait) => trait.choice && !draft.traitChoices[trait.name]))
      return setError("Complete as escolhas dos traços raciais.");
    if (raceTraitDefs.some((trait) => trait.feat) && !draft.raceFeat) return setError("Escolha o talento concedido pela raça.");
    if (draft.extraLanguages.length !== extraLanguageMax)
      return setError(`Escolha exatamente ${extraLanguageMax} idioma(s) adicional(is).`);
    if (draft.raceSkillChoices.length !== raceSkillMax)
      return setError(`Escolha exatamente ${raceSkillMax} perícia(s) racial(is).`);
    const missingTools = missingToolChoice(draft.background, draft.backgroundToolPicks);
    if (missingTools) return setError(`Complete a escolha do antecedente: ${missingTools}.`);
    if (draft.skills.length !== budget.total || !skillSelectionFits(draft.skills, budget.parts))
      return setError(`Escolha exatamente ${budget.total} perícia(s) permitida(s) pelas classes e antecedente.`);
    const expertise = expertiseBudget(
      namedClasses.map((c) => ({ name: c.name, level: c.level, subclass: c.subclass })),
      {
        adopted: draft.optionalFeatures,
        feats: [...(draft.raceFeat ? [draft.raceFeat] : []), ...draft.advancement.filter((d) => d.feat).map((d) => d.feat!)],
      },
    );
    if (expertise.total > 0 && (draft.expertise ?? []).length !== expertise.total)
      return setError(`Escolha exatamente ${expertise.total} perícia(s) para a Especialização.`);
    if (reachedAsis(draft.classes).length !== draft.advancement.length)
      return setError("Decida todos os aumentos de atributo ou talentos da progressão.");
    if (!draft.advancement.every((decision) => validAdvancementDecision(decision, scores)))
      return setError("Coloque todos os pontos livres de atributo e complete os talentos escolhidos.");
    const spellIssues = spellViolations(draft.classes, scores, draft.cantrips, draft.knownSpells);
    if (spellIssues.length) return setError(spellIssues[0]);

    setSubmitting(true);
    try {
      const character = { ...buildCharacter(draft, ""), folderId };
      const id = await createCharacter(character);
      // A foto vai depois que a ficha existe (a rota exige o PIN dela). Se falhar, a ficha fica sem foto.
      if (avatar) await uploadAvatar(id, avatar);
      pushToast({ title: `${character.characterName} criado!`, tone: "success" });
      navigate(`/personagem/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar a ficha.");
      setSubmitting(false);
    }
  }

  // Só cria quem abriu a pasta com a senha (ou a chave mestra); a pasta pede a senha se preciso.
  if (!canCreate) return <Navigate to={`/pasta/${folderId}`} replace />;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        to={`/pasta/${folderId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-mono text-2xl font-bold tracking-tight">Criar ficha</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        na pasta <strong className="break-words">{folderName ?? folderId}</strong>
      </p>

      <div className="space-y-4">
        {/* Identidade */}
        <Card>
          <CardHeader>
            <CardTitle>Identidade</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <AvatarPicker value={avatar} onChange={setAvatar} name={draft.characterName} color={draft.color} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nome do personagem">
                <Input
                  value={draft.characterName}
                  onChange={(e) => upd({ characterName: e.target.value })}
                  placeholder="Ex: Thorin Pedra-Forte"
                />
              </Field>
              <Field label="Jogador">
                <Input value={draft.playerName} onChange={(e) => upd({ playerName: e.target.value })} placeholder="Seu nome" />
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
            </div>
            {bgMode === "catalog" && selectedBackground && (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-800/50">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  {selectedBackground.source}
                </div>
                <dl className="space-y-1">
                  <BgRow label="Perícias" value={selectedBackground.skills} />
                  {selectedBackground.tools && <BgRow label="Ferramentas" value={selectedBackground.tools} />}
                  {selectedBackground.languages && <BgRow label="Idiomas" value={selectedBackground.languages} />}
                  <BgRow label="Equipamento" value={selectedBackground.equipment} />
                  {selectedBackground.variants?.length ? (
                    <BgRow label="Variantes" value={selectedBackground.variants.join(", ")} />
                  ) : null}
                </dl>
                <div className="mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-700">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">{selectedBackground.feature.name}.</span>{" "}
                  <span className="text-zinc-600 dark:text-zinc-300">{selectedBackground.feature.description}</span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <RaceSection draft={draft} upd={upd} scores={scores} />

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
                <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end">
                  <Field label={i === 0 ? "Classe" : `Classe ${i + 1} (multiclasse)`}>
                    <select className={selectCls} value={cl.name} onChange={(e) => onSelectClass(i, e.target.value)}>
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
                  <Field label={detailedClass?.subclassLabel ?? "Subclasse"}>
                    <select
                      className={selectCls}
                      value={cl.subclass ?? ""}
                      onChange={(e) => updateClass(i, { subclass: e.target.value || undefined })}
                      disabled={!detailedClass?.subclasses.length || cl.level < detailedClass.subclassLevel}
                    >
                      <option value="">
                        {detailedClass && cl.level < detailedClass.subclassLevel
                          ? `— disponível no nível ${detailedClass.subclassLevel} —`
                          : "— escolha —"}
                      </option>
                      {subclassNames(cl.name).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {draft.classes.length > 1 ? (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeClass(i)} title="Remover classe">
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
        {namedClasses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Progressão de características</CardTitle>
            </CardHeader>
            <CardBody className="space-y-5">
              {namedClasses.map((cl, i) => (
                <ClassProgression key={`${cl.name}:${i}`} className={cl.name} level={cl.level} subclass={cl.subclass} />
              ))}
              <p className="text-xs text-zinc-500">
                As características de classe e subclasse até o nível escolhido entram automaticamente na ficha.
              </p>
            </CardBody>
          </Card>
        )}

        <OptionalFeaturesPicker draft={draft} upd={upd} />

        {reachedAsis(draft.classes).length > 0 && (
          <AdvancementChoices
            classes={draft.classes}
            advancement={draft.advancement}
            raceName={draft.raceName}
            scores={scores}
            onChange={(advancement) => upd({ advancement })}
          />
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
              increases={increases}
              asiPoints={asiPoints}
              freePoints={freePoints}
              onFreePoint={onFreePoint}
            />
          </CardBody>
        </Card>

        <SkillsSection draft={draft} upd={upd} />

        <ExpertisePicker draft={draft} upd={upd} />

        {/* Magias */}
        {(spellCaps.length > 0 || grantedSpells.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Magias</CardTitle>
            </CardHeader>
            <CardBody>
              <Suspense fallback={<p className="text-sm text-zinc-500">Carregando catálogo de magias…</p>}>
                <SpellPicker
                  classNames={namedClasses.map((c) => c.name)}
                  caps={spellCaps}
                  cantrips={draft.cantrips}
                  known={draft.knownSpells}
                  granted={grantedSpells}
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
            {draft.background.trim() && (
              <div className="mb-4">
                <BackgroundEquipment draft={draft} upd={upd} />
              </div>
            )}
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
            <CardTitle>Combate</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="PV máximo" value={String(previewHp)} />
              <Stat label="CA" value={String(previewAc)} />
              <Stat label="Iniciativa" value={formatMod(abilityMod(scores.dex))} />
              <Stat label="Bônus de prof." value={formatMod(profBonus)} />
            </div>
            {/* PV não é fixo: quem rola os dados de vida digita o total aqui. */}
            <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <Field label="PV máximo (deixe vazio para usar a média da classe)">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    className="w-28"
                    placeholder={String(averageHpPreview)}
                    value={draft.hpOverride ?? ""}
                    onChange={(event) => {
                      const value = event.target.value.trim();
                      upd({ hpOverride: value === "" ? undefined : Math.max(1, Number(value) || 1) });
                    }}
                  />
                  {draft.hpOverride != null && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => upd({ hpOverride: undefined })}>
                      usar a média ({averageHpPreview})
                    </Button>
                  )}
                </div>
              </Field>
              <p className="mt-1 text-xs text-zinc-500">
                Rolou os dados de vida na mesa? Some o modificador de Constituição de cada nível e digite o total aqui.
                A média da classe é {averageHpPreview} PV.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* História: um bloco livre, igual ao da ficha. Opcional na criação. */}
        <Card>
          <CardHeader>
            <CardTitle>História do personagem (opcional)</CardTitle>
          </CardHeader>
          <CardBody>
            <textarea
              value={draft.backstory ?? ""}
              onChange={(event) => upd({ backstory: event.target.value })}
              placeholder="De onde veio, quem deixou para trás, o que procura… Dá para escrever depois, na ficha."
              className="min-h-40 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </CardBody>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(`/pasta/${folderId}`)} disabled={submitting}>
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

function validAdvancementDecision(decision: AsiDecision, scores: AbilityScores): boolean {
  if (decision.kind === "feat") {
    if (!decision.feat) return false;
    const feat = findFeat(decision.feat);
    if (!feat?.abilityIncrease) return true;
    return ABILITY_ORDER.some(
      (key) => (decision.abilities?.[key] ?? 0) === feat.abilityIncrease!.amount && scores[key] <= 20,
    );
  }
  return sumIncrease(decision.abilities) === 2;
}

function BgRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-medium text-zinc-500">{label}:</dt>
      <dd className="text-zinc-600 dark:text-zinc-300">{value}</dd>
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
