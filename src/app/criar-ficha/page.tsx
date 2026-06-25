"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AbilityScoresEditor, type AbilityMode } from "@/components/create/AbilityScoresEditor";
import { SpellPicker } from "@/components/create/SpellPicker";
import { EquipmentPicker } from "@/components/create/EquipmentPicker";
import { TraitPicker } from "@/components/create/TraitPicker";
import { findTrait } from "@/data/traitsCatalog";
import { RACES_CATALOG, findRace } from "@/data/racesCatalog";
import { CLASSES_CATALOG, findClass, classFeaturesUpTo } from "@/data/classesCatalog";
import { SKILLS_CATALOG } from "@/data/skillsCatalog";
import {
  buildCharacter,
  emptyDraft,
  emptyClass,
  finalScores,
  proficiencyBonusForLevel,
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
  type SkillName,
} from "@/lib/types";

const selectCls =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const CUSTOM = "__custom__";

export default function CriarFicha() {
  const router = useRouter();
  const createCharacter = useStore((s) => s.createCharacter);
  const pushToast = useStore((s) => s.pushToast);

  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft);
  const [raceMode, setRaceMode] = useState<"catalog" | "custom">("catalog");
  const [abilityMode, setAbilityMode] = useState<AbilityMode>("pointbuy");
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const upd = (patch: Partial<CharacterDraft>) => setDraft((d) => ({ ...d, ...patch }));

  // Perícias se baseiam na 1ª classe (regra 5e); as demais entram via multiclasse.
  const primaryClass = findClass(draft.classes[0]?.name ?? "");
  const skillOptions: string[] = showAllSkills
    ? SKILLS_CATALOG.map((s) => s.name)
    : (primaryClass?.skillProficiencies?.from ?? SKILLS_CATALOG.map((s) => s.name));
  const skillChoose = primaryClass?.skillProficiencies?.choose ?? null;

  const casterClassNames = draft.classes
    .filter((c) => c.spellcastingAbility && c.name.trim())
    .map((c) => c.name);

  const scores = useMemo(
    () => finalScores(draft.baseScores, draft.raceBonuses),
    [draft.baseScores, draft.raceBonuses],
  );
  const profBonus = proficiencyBonusForLevel(totalLevel(draft.classes));
  const previewHp = draft.hpOverride ?? totalHp(draft.classes, abilityMod(scores.con));
  const previewAc = draft.acOverride ?? 10 + abilityMod(scores.dex);

  function onSelectRace(value: string) {
    if (value === CUSTOM) {
      setRaceMode("custom");
      upd({ raceName: "", raceBonuses: {}, raceTraits: [] });
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
      size: r.size || "Médio",
      speed: r.speed ?? 9,
      raceTraits: r.traits,
    });
  }

  function setClasses(next: DraftClass[]) {
    upd({ classes: next });
  }

  function updateClass(index: number, patch: Partial<DraftClass>) {
    setClasses(draft.classes.map((c, i) => (i === index ? { ...c, ...patch } : c)));
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
    setClasses([...draft.classes, emptyClass()]);
  }

  function removeClass(index: number) {
    if (draft.classes.length <= 1) return;
    setClasses(draft.classes.filter((_, i) => i !== index));
  }

  function toggleSkill(name: string) {
    const has = draft.skills.includes(name as SkillName);
    upd({
      skills: has
        ? draft.skills.filter((s) => s !== name)
        : [...draft.skills, name as SkillName],
    });
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

    setSubmitting(true);
    try {
      // Traços/talentos escolhidos -> features com descrição (do catálogo)
      const traitFeatures = draft.raceTraits.map((name) => {
        const t = findTrait(name);
        return {
          name,
          source: t?.kind === "talento" ? "Talento" : draft.raceName || "Raça",
          description: t?.description ?? "",
        };
      });
      // Características de classe ganhas até o nível de cada classe
      const classFeatures = draft.classes.flatMap((cl) =>
        cl.name.trim()
          ? classFeaturesUpTo(cl.name, cl.level).map((f) => ({
              name: f.name,
              source: `${cl.name} ${f.level}`,
              description: "",
            }))
          : [],
      );
      const character = buildCharacter(
        { ...draft, extraFeatures: [...traitFeatures, ...classFeatures] },
        "",
      );
      const id = await createCharacter(character);
      pushToast({ title: `${draft.characterName} criado!`, tone: "success" });
      router.push(`/personagem/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar a ficha.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/"
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
              <Input
                value={draft.background}
                onChange={(e) => upd({ background: e.target.value })}
                placeholder="Ex: Forasteiro"
              />
            </Field>
            <Field label="Tendência (opcional)">
              <Input
                value={draft.alignment ?? ""}
                onChange={(e) => upd({ alignment: e.target.value })}
                placeholder="Ex: Caótico e Bom"
              />
            </Field>
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
                <option value={CUSTOM}>✎ Custom (homebrew)…</option>
              </select>
            </Field>

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
                <Input value={draft.size} onChange={(e) => upd({ size: e.target.value })} />
              </Field>
              <Field label="Deslocamento (m)">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={draft.speed}
                  onChange={(e) => upd({ speed: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Idiomas (separados por vírgula)">
                <Input
                  value={draft.languages.join(", ")}
                  onChange={(e) =>
                    upd({ languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                  }
                />
              </Field>
            </div>

            <div>
              <span className="mb-1 block text-xs font-medium text-zinc-500">
                Traços & talentos (escolha da lista — mostra a descrição)
              </span>
              <TraitPicker
                selected={draft.raceTraits}
                onChange={(raceTraits) => upd({ raceTraits })}
              />
            </div>
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
              const catalog = findClass(cl.name);
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
                          level: Math.min(20, Math.max(1, Number(e.target.value) || 1)),
                        })
                      }
                    />
                  </Field>
                  <Field label="Subclasse">
                    <select
                      className={selectCls}
                      value={cl.subclass ?? ""}
                      onChange={(e) => updateClass(i, { subclass: e.target.value || undefined })}
                      disabled={!catalog?.subclasses?.length}
                    >
                      <option value="">— nenhuma —</option>
                      {catalog?.subclasses?.map((s) => (
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
            <Button type="button" variant="outline" size="sm" onClick={addClass}>
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

        {/* Atributos */}
        <Card>
          <CardHeader>
            <CardTitle>Atributos</CardTitle>
          </CardHeader>
          <CardBody>
            <AbilityScoresEditor
              scores={draft.baseScores}
              bonuses={draft.raceBonuses}
              mode={abilityMode}
              onMode={setAbilityMode}
              onChange={(s) => upd({ baseScores: s })}
            />
          </CardBody>
        </Card>

        {/* Perícias */}
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <CardTitle>Perícias</CardTitle>
              <label className="flex items-center gap-1 text-xs text-zinc-500">
                <input
                  type="checkbox"
                  checked={showAllSkills}
                  onChange={(e) => setShowAllSkills(e.target.checked)}
                />
                todas (homebrew)
              </label>
            </div>
          </CardHeader>
          <CardBody>
            {skillChoose != null && (
              <p className="mb-2 text-xs text-zinc-500">
                {primaryClass?.name}: escolha <strong>{skillChoose}</strong> — selecionadas:{" "}
                {draft.skills.length}
              </p>
            )}
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {skillOptions.map((name) => (
                <label key={name} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.skills.includes(name as SkillName)}
                    onChange={() => toggleSkill(name)}
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
              <SpellPicker
                classNames={casterClassNames}
                cantrips={draft.cantrips}
                known={draft.knownSpells}
                onChange={(cantrips, knownSpells) => upd({ cantrips, knownSpells })}
              />
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
              key={draft.classes[0]?.name ?? "none"}
              equipment={primaryClass?.startingEquipment}
              items={draft.inventoryItems}
              onChange={(inventoryItems) => upd({ inventoryItems })}
            />
          </CardBody>
        </Card>

        {/* Derivados */}
        <Card>
          <CardHeader>
            <CardTitle>Combate (auto-calculado, editável)</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="PV máximo">
              <Input
                type="number"
                inputMode="numeric"
                value={previewHp}
                onChange={(e) => upd({ hpOverride: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="CA">
              <Input
                type="number"
                inputMode="numeric"
                value={previewAc}
                onChange={(e) => upd({ acOverride: Number(e.target.value) || 0 })}
              />
            </Field>
            <Stat label="Iniciativa" value={formatMod(abilityMod(scores.dex))} />
            <Stat label="Bônus de prof." value={formatMod(profBonus)} />
          </CardBody>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/")} disabled={submitting}>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
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
