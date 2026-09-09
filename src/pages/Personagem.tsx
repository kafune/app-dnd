import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Trash2, Pencil, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { ABILITY_LABELS, ABILITY_ORDER, ALIGNMENTS, type AbilityKey, type AsiDecision } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HpTracker } from "@/components/sheet/HpTracker";
import { Abilities } from "@/components/sheet/Abilities";
import { Skills } from "@/components/sheet/Skills";
import { SpellSlots } from "@/components/sheet/SpellSlots";
import { Resources } from "@/components/sheet/Resources";
import { RestButtons } from "@/components/sheet/RestButtons";
import { Combat } from "@/components/sheet/Combat";
import { Spells } from "@/components/sheet/Spells";
import { Features } from "@/components/sheet/Features";
import { Notes } from "@/components/sheet/Notes";
import { CharacterAccessGate } from "@/components/sheet/CharacterAccessGate";
import {
  ProficienciesAndLanguages,
  Inventory,
  Personality,
} from "@/components/sheet/Misc";
import { PinLock } from "@/components/sheet/PinLock";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { RollHistory } from "@/components/dice/RollHistory";
import { ChangeLog } from "@/components/sheet/ChangeLog";
import { useIsMaster, useUnlocked } from "@/lib/store";
import { CLASSES_CATALOG, findClassDef, subclassNames } from "@/data/classesCatalog";
import { FEATS_CATALOG, findFeat } from "@/data/featsCatalog";
import {
  applyAsiDecision,
  applyClassChange,
  clampClassLevels,
  MAX_LEVEL,
  pendingAsis,
  totalLevelOf,
} from "@/lib/progression";

export default function CharacterPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const character = useStore((s) => s.characters[id]);
  const clearRolls = useStore((s) => s.clearRolls);
  const deleteCharacter = useStore((s) => s.deleteCharacter);
  const pushToast = useStore((s) => s.pushToast);
  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);
  const patchCharacter = useStore((s) => s.patchCharacter);
  const patchSheet = useStore((s) => s.patchSheet);
  const unlocked = useUnlocked(id);
  const isMaster = useIsMaster(id);

  const limparHistorico = (scope: "player" | "mesa") => {
    const msg =
      scope === "mesa"
        ? "Limpar TODAS as rolagens da mesa? Isso afeta todos os jogadores."
        : "Limpar as rolagens desta ficha?";
    // O PIN desta ficha autoriza os dois casos: a própria e a mesa toda.
    if (window.confirm(msg)) void clearRolls(scope === "mesa" ? undefined : id, id);
  };

  const onDelete = async () => {
    if (!character) return;
    const name = character.characterName || "esta ficha";
    if (!window.confirm(`Deletar ${name} permanentemente? Esta ação não pode ser desfeita.`)) {
      return;
    }
    const ok = await deleteCharacter(id);
    if (ok) {
      pushToast({ title: `${name} foi deletado.`, tone: "success" });
      navigate("/");
    }
  };

  if (!character) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </Link>
        <p className="mt-6 text-zinc-500">Personagem não encontrado.</p>
      </main>
    );
  }

  if (!unlocked) {
    return <CharacterAccessGate id={id} />;
  }

  const cls = character.sheet.classes
    .map((k) => `${k.name}${k.subclass ? ` (${k.subclass})` : ""} ${k.level}`)
    .join(" / ");

  const classes = character.sheet.classes;
  const setClasses = async (raw: typeof classes, changed = Math.max(0, raw.length - 1)) => {
    const next = isMaster ? raw : clampClassLevels(raw, Math.min(changed, raw.length - 1));
    const result = applyClassChange(character, next);
    const ok = await patchCharacter(id, {
      sheet: result.character.sheet,
      hpCurrent: result.character.hpCurrent,
      hpMax: result.character.hpMax,
      spellSlots: result.character.spellSlots,
      resources: result.character.resources,
    });
    if (!ok) return;
    const gained = result.summary.gained.map((feature) => feature.name);
    const spellNews = result.summary.spells
      .filter((spell) => spell.deltaCantrips > 0 || spell.deltaSpells > 0)
      .map((spell) => `${spell.className}: +${spell.deltaCantrips} truque(s), +${spell.deltaSpells} magia(s), até ${spell.maxLevel}º`);
    pushToast({
      title: `Nível total ${result.summary.prevLevel} → ${result.summary.nextLevel}`,
      description: [
        gained.length ? `Ganhou: ${gained.join(", ")}.` : "",
        spellNews.join(" "),
        result.summary.pendingAsi.length ? `${result.summary.pendingAsi.length} aumento(s) de atributo/talento pendente(s).` : "",
        result.summary.warnings.join(" "),
      ].filter(Boolean).join(" ") || "Progressão recalculada.",
      tone: result.summary.warnings.length ? "danger" : "success",
    });
  };
  const updateClassEntry = (i: number, patch: Partial<(typeof classes)[number]>) => {
    const next = classes.map((current, index) => {
      if (index !== i) return current;
      const updated = { ...current, ...patch };
      const definition = findClassDef(updated.name);
      if (!isMaster && definition && updated.level < definition.subclassLevel) updated.subclass = undefined;
      return updated;
    });
    void setClasses(next, i);
  };

  const saveAdvancement = async (decision: AsiDecision) => {
    const next = applyAsiDecision(character, decision);
    const ok = await patchCharacter(id, { sheet: next.sheet });
    if (ok) pushToast({ title: decision.kind === "feat" ? `Talento ${decision.feat} adicionado` : "Atributos aumentados", tone: "success" });
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3 w-3" /> Mesa
          </Button>
        </Link>
        <PinLock id={id} />
        <div className="ml-auto flex items-center gap-2">
          {editMode && (
            <Button variant="danger" size="sm" onClick={() => void onDelete()}>
              <Trash2 className="h-3 w-3" /> Deletar
            </Button>
          )}
          <Button
            variant={editMode ? "success" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Check className="h-3 w-3" /> Concluir edição
              </>
            ) : (
              <>
                <Pencil className="h-3 w-3" /> Editar ficha
              </>
            )}
          </Button>
        </div>
      </div>

      <header
        className="mb-6 rounded-xl border-l-4 bg-white p-4 shadow-sm dark:bg-zinc-900"
        style={{ borderLeftColor: character.color }}
      >
        {editMode ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="text-xs text-zinc-500">
                Jogador
                <EditableText
                  value={character.playerName}
                  onSave={(v) => patchCharacter(id, { playerName: v })}
                />
              </label>
              <label className="text-xs text-zinc-500">
                Personagem
                <EditableText
                  value={character.characterName}
                  onSave={(v) => patchCharacter(id, { characterName: v })}
                />
              </label>
              <label className="text-xs text-zinc-500">
                Espécie/Raça
                {isMaster ? (
                  <EditableText value={character.sheet.species} onSave={(v) => patchSheet(id, { species: v })} />
                ) : (
                  <span className="block py-2 text-sm text-zinc-800 dark:text-zinc-200">{character.sheet.species}</span>
                )}
              </label>
              <label className="text-xs text-zinc-500">
                Antecedente
                {isMaster ? (
                  <EditableText value={character.sheet.background} onSave={(v) => patchSheet(id, { background: v })} />
                ) : (
                  <span className="block py-2 text-sm text-zinc-800 dark:text-zinc-200">{character.sheet.background}</span>
                )}
              </label>
              <label className="text-xs text-zinc-500">
                Tendência
                <select
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  value={
                    ALIGNMENTS.includes(
                      (character.sheet.alignment ?? "") as (typeof ALIGNMENTS)[number],
                    )
                      ? character.sheet.alignment
                      : ""
                  }
                  onChange={(e) => patchSheet(id, { alignment: e.target.value })}
                >
                  <option value="">— escolha —</option>
                  {ALIGNMENTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-zinc-500">
                Cor
                <input
                  type="color"
                  value={character.color ?? "#7c3aed"}
                  onChange={(e) => patchCharacter(id, { color: e.target.value })}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
            </div>
            {/* Classes */}
            <div>
              <div className="mb-1 text-xs text-zinc-500">Classes</div>
              <div className="mb-2 text-xs text-zinc-500">Nível total: {totalLevelOf(classes)}/{isMaster ? "∞ (Mestre)" : MAX_LEVEL}</div>
              <div className="space-y-1">
                {classes.map((c, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-1">
                    {isMaster ? (
                      <EditableText value={c.name} onSave={(v) => updateClassEntry(i, { name: v })} className="w-36" />
                    ) : (
                      <select
                        className="h-9 w-36 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        value={c.name}
                        onChange={(event) => updateClassEntry(i, { name: event.target.value, subclass: undefined })}
                      >
                        {CLASSES_CATALOG.map((entry) => <option key={entry.name} value={entry.name}>{entry.name}</option>)}
                      </select>
                    )}
                    {isMaster ? (
                      <EditableText value={c.subclass ?? ""} onSave={(v) => updateClassEntry(i, { subclass: v || undefined })} placeholder="subclasse" className="w-40" />
                    ) : (
                      <select
                        className="h-9 w-40 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        value={c.subclass ?? ""}
                        disabled={!findClassDef(c.name)?.subclasses.length || c.level < (findClassDef(c.name)?.subclassLevel ?? 1)}
                        onChange={(event) => updateClassEntry(i, { subclass: event.target.value || undefined })}
                      >
                        <option value="">— subclasse —</option>
                        {subclassNames(c.name).map((name) => <option key={name} value={name}>{name}</option>)}
                      </select>
                    )}
                    <EditableNumber
                      value={c.level}
                      min={1}
                      max={20}
                      onSave={(v) => updateClassEntry(i, { level: v })}
                      className="w-16"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remover classe"
                      disabled={classes.length <= 1}
                      onClick={() => void setClasses(classes.filter((_, idx) => idx !== i), Math.max(0, i - 1))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                disabled={!isMaster && totalLevelOf(classes) >= MAX_LEVEL}
                onClick={() => void setClasses([...classes, { name: isMaster ? "Classe custom" : CLASSES_CATALOG[0].name, level: 1 }])}
              >
                + Classe
              </Button>
            </div>
            {pendingAsis(classes, character.sheet.advancement).length > 0 && (
              <PendingAdvancement characterId={id} onSave={saveAdvancement} />
            )}
          </div>
        ) : (
          <>
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {character.playerName}
            </div>
            <h1 className="font-mono text-3xl font-bold">{character.characterName}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {character.sheet.species} · {cls} · {character.sheet.background}
            </p>
          </>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <HpTracker id={id} />
          <Abilities id={id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SpellSlots id={id} />
            <Resources id={id} />
          </div>
          <RestButtons id={id} />
          <Combat id={id} />
          <Skills id={id} />
          <Spells id={id} />
          <Features id={id} />
          <Notes id={id} />
          <ProficienciesAndLanguages id={id} />
          <Inventory id={id} />
          <Personality id={id} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Rolar Dados</CardTitle>
            </CardHeader>
            <CardBody>
              <DiceRoller characterId={id} characterName={character.characterName} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">esta ficha</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => limparHistorico("player")}
                    aria-label="Limpar rolagens desta ficha"
                    title="Limpar rolagens desta ficha"
                  >
                    <Trash2 className="h-3 w-3" /> Limpar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <RollHistory characterId={id} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mesa</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">todos</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => limparHistorico("mesa")}
                    aria-label="Limpar todas as rolagens da mesa"
                    title="Limpar todas as rolagens da mesa"
                  >
                    <Trash2 className="h-3 w-3" /> Limpar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <RollHistory />
            </CardBody>
          </Card>

          <ChangeLog id={id} />
        </aside>
      </div>
    </main>
  );
}

type PendingChoice = {
  kind: "asi" | "feat";
  first?: AbilityKey;
  second?: AbilityKey;
  feat?: string;
  featAbility?: AbilityKey;
};

function PendingAdvancement({
  characterId,
  onSave,
}: {
  characterId: string;
  onSave: (decision: AsiDecision) => Promise<void>;
}) {
  const character = useStore((state) => state.characters[characterId]);
  const [choices, setChoices] = useState<Record<string, PendingChoice>>({});
  if (!character) return null;
  const pending = pendingAsis(character.sheet.classes, character.sheet.advancement);
  return (
    <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
      <div className="text-sm font-medium">Progressão pendente</div>
      {pending.map((slot) => {
        const key = `${slot.className}:${slot.level}`;
        const choice = choices[key] ?? { kind: "asi" };
        const feat = choice.feat ? findFeat(choice.feat) : undefined;
        const setChoice = (patch: Partial<PendingChoice>) =>
          setChoices((state) => ({ ...state, [key]: { ...choice, ...patch } }));
        const valid = choice.kind === "asi"
          ? !!choice.first && !!choice.second
          : !!choice.feat && (!feat?.abilityIncrease || !!choice.featAbility);
        return (
          <div key={key} className="space-y-2 rounded border border-amber-200 bg-white p-2 dark:border-amber-900 dark:bg-zinc-900">
            <div className="text-xs font-medium">{slot.className} · nível {slot.level}</div>
            <select
              className="h-8 w-full rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              value={choice.kind}
              onChange={(event) => setChoice({ kind: event.target.value as "asi" | "feat", first: undefined, second: undefined, feat: undefined, featAbility: undefined })}
            >
              <option value="asi">Aumentar atributos</option>
              <option value="feat">Ganhar talento</option>
            </select>
            {choice.kind === "asi" ? (
              <div className="grid grid-cols-2 gap-2">
                {(["first", "second"] as const).map((field) => (
                  <select
                    key={field}
                    className="h-8 rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    value={choice[field] ?? ""}
                    onChange={(event) => setChoice({ [field]: event.target.value as AbilityKey })}
                  >
                    <option value="">— atributo +1 —</option>
                    {ABILITY_ORDER.map((ability) => (
                      <option
                        key={ability}
                        value={ability}
                        disabled={
                          character.sheet.abilityScores[ability] >= 20 ||
                          (field === "second" && choice.first === ability && character.sheet.abilityScores[ability] >= 19)
                        }
                      >
                        {ABILITY_LABELS[ability]}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  className="h-8 w-full rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  value={choice.feat ?? ""}
                  onChange={(event) => setChoice({ feat: event.target.value, featAbility: undefined })}
                >
                  <option value="">— talento —</option>
                  {FEATS_CATALOG.filter((entry) => !entry.races || entry.races.includes(character.sheet.raceInfo?.race ?? character.sheet.species)).map((entry) => (
                    <option key={entry.name} value={entry.name}>
                      {entry.name}{entry.prerequisite ? ` — pré-requisito: ${entry.prerequisite}` : ""}
                    </option>
                  ))}
                </select>
                {feat?.abilityIncrease && (
                  <select
                    className="h-8 w-full rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    value={choice.featAbility ?? ""}
                    onChange={(event) => setChoice({ featAbility: event.target.value as AbilityKey })}
                  >
                    <option value="">— atributo do talento —</option>
                    {feat.abilityIncrease.choose.map((ability) => (
                      <option key={ability} value={ability} disabled={character.sheet.abilityScores[ability] >= 20}>
                        {ABILITY_LABELS[ability]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            <Button
              size="sm"
              disabled={!valid}
              onClick={() => {
                const abilities: Partial<Record<AbilityKey, number>> = {};
                if (choice.kind === "asi") {
                  if (choice.first) abilities[choice.first] = (abilities[choice.first] ?? 0) + 1;
                  if (choice.second) abilities[choice.second] = (abilities[choice.second] ?? 0) + 1;
                } else if (feat?.abilityIncrease && choice.featAbility) {
                  abilities[choice.featAbility] = feat.abilityIncrease.amount;
                }
                void onSave({
                  className: slot.className,
                  level: slot.level,
                  kind: choice.kind,
                  ...(choice.kind === "feat" ? { feat: choice.feat } : {}),
                  ...(Object.keys(abilities).length ? { abilities } : {}),
                });
              }}
            >
              Aplicar escolha
            </Button>
          </div>
        );
      })}
    </div>
  );
}
