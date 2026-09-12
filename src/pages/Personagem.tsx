import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Trash2, Pencil, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { ALIGNMENTS, CREATURE_SIZES, type AbilityKey, type AsiDecision } from "@/lib/types";
import { sheetPermissions } from "@/lib/permissions";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { PointAllocator, allocatedPoints } from "@/components/PointAllocator";
import { fromAllocation, toAllocation } from "@/components/create/AdvancementChoices";
import { HpTracker } from "@/components/sheet/HpTracker";
import { Abilities } from "@/components/sheet/Abilities";
import { Skills } from "@/components/sheet/Skills";
import { SpellSlots } from "@/components/sheet/SpellSlots";
import { Resources } from "@/components/sheet/Resources";
import { Combat } from "@/components/sheet/Combat";
import { Spells } from "@/components/sheet/Spells";
import { Features } from "@/components/sheet/Features";
import { Notes } from "@/components/sheet/Notes";
import { Backstory } from "@/components/sheet/Backstory";
import { Reminders } from "@/components/sheet/Reminders";
import { OptionalFeatures } from "@/components/sheet/OptionalFeatures";
import { TablePanel } from "@/components/sheet/TablePanel";
import { CharacterAccessGate } from "@/components/sheet/CharacterAccessGate";
import { ProficienciesAndLanguages, Inventory, Personality } from "@/components/sheet/Misc";
import { PinLock } from "@/components/sheet/PinLock";
import { EditableText, EditableNumber } from "@/components/sheet/edit/EditControls";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { ChangeLog } from "@/components/sheet/ChangeLog";
import { useIsMaster, useUnlocked } from "@/lib/store";
import { CLASSES_CATALOG, findClassDef, subclassNames } from "@/data/classesCatalog";
import { allFeats, findFeat } from "@/data/featsCatalog";
import {
  applyAbilityIncrease,
  applyAsiDecision,
  applyClassChange,
  clampClassLevels,
  MAX_LEVEL,
  pendingAsis,
  totalLevelOf,
} from "@/lib/progression";

const selectCls =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export default function CharacterPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const character = useStore((s) => s.characters[id]);
  const clearRolls = useStore((s) => s.clearRolls);
  const deleteCharacter = useStore((s) => s.deleteCharacter);
  const removeAvatar = useStore((s) => s.removeAvatar);
  const pushToast = useStore((s) => s.pushToast);
  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);
  const patchCharacter = useStore((s) => s.patchCharacter);
  const patchSheet = useStore((s) => s.patchSheet);
  const unlocked = useUnlocked(id);
  const isMaster = useIsMaster(id);
  const hasCharacter = !!character;
  const folderId = character?.folderId;
  const folderName = useStore((s) => (folderId ? s.folders[folderId]?.name : undefined));
  const loadCharacterSummary = useStore((s) => s.loadCharacterSummary);
  const watchCharacterFolder = useStore((s) => s.watchCharacterFolder);
  const [missingId, setMissingId] = useState<string | null>(null);
  const folderHref = folderId ? `/pasta/${folderId}` : "/";
  const folderLabel = folderId ? (folderName ?? "Pasta") : "Fichas DnD";

  // Link direto, sem ter passado pela pasta: busca o resumo para mostrar a tela de PIN.
  useEffect(() => {
    if (hasCharacter) return;
    let cancelled = false;
    void loadCharacterSummary(id).then((found) => {
      if (!cancelled && !found) setMissingId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [id, hasCharacter, loadCharacterSummary]);

  // Mesa (rolagens) e tempo real da pasta desta ficha.
  useEffect(() => {
    if (unlocked && folderId) watchCharacterFolder(id);
  }, [id, unlocked, folderId, watchCharacterFolder]);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clearScope, setClearScope] = useState<"mesa" | null>(null);

  const onDelete = async () => {
    const name = character?.characterName || "A ficha";
    setDeleting(true);
    const ok = await deleteCharacter(id);
    setDeleting(false);
    if (!ok) return; // a store já mostrou o motivo num toast
    setConfirmDelete(false);
    setEditMode(false);
    pushToast({ title: `${name} foi deletado.`, tone: "success" });
    navigate(folderHref);
  };

  const onClearRolls = () => {
    if (!clearScope) return;
    // O PIN desta ficha autoriza limpar a mesa inteira da pasta.
    void clearRolls(undefined, id);
    setClearScope(null);
  };

  if (!character) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-3 w-3" /> Fichas DnD
        </Link>
        <p className="mt-6 text-zinc-500">{missingId === id ? "Personagem não encontrado." : "Carregando…"}</p>
      </main>
    );
  }

  if (!unlocked) {
    return <CharacterAccessGate id={id} />;
  }

  const cls = character.sheet.classes
    .map((k) => `${k.name}${k.subclass ? ` (${k.subclass})` : ""} ${k.level}`)
    .join(" / ");
  const size = character.sheet.appearance?.size;
  const can = sheetPermissions(isMaster, character.sheet);

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
      description:
        [
          gained.length ? `Ganhou: ${gained.join(", ")}.` : "",
          spellNews.join(" "),
          result.summary.pendingAsi.length ? `${result.summary.pendingAsi.length} aumento(s) de atributo/talento pendente(s).` : "",
          result.summary.warnings.join(" "),
        ]
          .filter(Boolean)
          .join(" ") || "Progressão recalculada.",
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
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <Link to={folderHref}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3 w-3" /> <span className="max-w-[10rem] truncate">{folderLabel}</span>
          </Button>
        </Link>
        <PinLock id={id} />
        <div className="ml-auto flex items-center gap-2">
          {editMode && (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3 w-3" /> Deletar ficha
            </Button>
          )}
          <Button variant={editMode ? "success" : "outline"} size="sm" onClick={() => setEditMode(!editMode)}>
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
            <div className="flex flex-wrap items-center gap-3">
              <CharacterAvatar character={character} size={72} editable />
              <div className="space-y-1 text-xs text-zinc-500">
                <div>Toque na foto para enviar ou trocar a foto de perfil.</div>
                {character.avatarVersion && (
                  <Button variant="ghost" size="sm" onClick={() => void removeAvatar(id)}>
                    <Trash2 className="h-3 w-3" /> Remover foto
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="text-xs text-zinc-500">
                Jogador
                <EditableText value={character.playerName} onSave={(v) => patchCharacter(id, { playerName: v })} />
              </label>
              <label className="text-xs text-zinc-500">
                Personagem
                <EditableText value={character.characterName} onSave={(v) => patchCharacter(id, { characterName: v })} />
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
                Tamanho
                {isMaster ? (
                  <select
                    className={selectCls}
                    value={CREATURE_SIZES.includes(size as (typeof CREATURE_SIZES)[number]) ? size : "Médio"}
                    onChange={(e) => patchSheet(id, { appearance: { ...character.sheet.appearance, size: e.target.value } })}
                  >
                    {CREATURE_SIZES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="block py-2 text-sm text-zinc-800 dark:text-zinc-200">{size || "—"}</span>
                )}
              </label>
              <label className="text-xs text-zinc-500">
                Tendência
                <select
                  className={selectCls}
                  value={
                    ALIGNMENTS.includes((character.sheet.alignment ?? "") as (typeof ALIGNMENTS)[number])
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
            {/* Classes: subir de nível é decisão do Mestre. */}
            {!can.classes ? (
              <div className="rounded-md border border-zinc-200 p-2 text-xs text-zinc-500 dark:border-zinc-800">
                <div className="mb-0.5">Classes</div>
                <div className="text-sm text-zinc-800 dark:text-zinc-200">{cls}</div>
                <div className="mt-1">Quem sobe o seu nível é o Mestre. Quando ele subir, a escolha de atributo ou talento aparece aqui.</div>
              </div>
            ) : (
            <div>
              <div className="mb-1 text-xs text-zinc-500">Classes</div>
              <div className="mb-2 text-xs text-zinc-500">
                Nível total: {totalLevelOf(classes)}/{isMaster ? "∞ (Mestre)" : MAX_LEVEL}
              </div>
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
                        {CLASSES_CATALOG.map((entry) => (
                          <option key={entry.name} value={entry.name}>
                            {entry.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {isMaster ? (
                      <EditableText
                        value={c.subclass ?? ""}
                        onSave={(v) => updateClassEntry(i, { subclass: v || undefined })}
                        placeholder="subclasse"
                        className="w-40"
                      />
                    ) : (
                      <select
                        className="h-9 w-40 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        value={c.subclass ?? ""}
                        disabled={!findClassDef(c.name)?.subclasses.length || c.level < (findClassDef(c.name)?.subclassLevel ?? 1)}
                        onChange={(event) => updateClassEntry(i, { subclass: event.target.value || undefined })}
                      >
                        <option value="">— subclasse —</option>
                        {subclassNames(c.name).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    )}
                    <EditableNumber value={c.level} min={1} max={20} onSave={(v) => updateClassEntry(i, { level: v })} className="w-16" />
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
            )}
            {pendingAsis(classes, character.sheet.advancement).length > 0 && (
              <PendingAdvancement characterId={id} onSave={saveAdvancement} />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <CharacterAvatar character={character} size={80} editable />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-zinc-500">{character.playerName}</div>
              <h1 className="break-words font-mono text-3xl font-bold">{character.characterName}</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {[character.sheet.species, size, cls, character.sheet.background].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* grid-cols-1 = minmax(0, 1fr): selects com opções longas (modo edição) não alargam a página no celular */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Ordem da ficha: estado atual → combate → o que sabe fazer → o que carrega → texto livre. */}
        <div className="space-y-4 lg:col-span-2">
          <HpTracker id={id} />
          <Abilities id={id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SpellSlots id={id} />
            <Resources id={id} />
          </div>
          <Combat id={id} />
          <ProficienciesAndLanguages id={id} />
          <Skills id={id} />
          <Spells id={id} />
          <Inventory id={id} />
          <OptionalFeatures id={id} />
          <Features id={id} />
          <Personality id={id} />
          <Notes id={id} />
          <Backstory id={id} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
          <Reminders id={id} />

          <Card>
            <CardHeader>
              <CardTitle>Rolar Dados</CardTitle>
            </CardHeader>
            <CardBody>
              <DiceRoller characterId={id} characterName={character.characterName} />
            </CardBody>
          </Card>

          <TablePanel id={id} onClear={() => setClearScope("mesa")} />

          <ChangeLog id={id} />
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Deletar ${character.characterName}?`}
        description="A ficha, a foto de perfil, o log de alterações e as rolagens dela serão apagados para sempre. Não dá para desfazer."
        confirmLabel="Deletar para sempre"
        busy={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void onDelete()}
      />
      <ConfirmDialog
        open={clearScope !== null}
        title="Limpar TODAS as rolagens da mesa?"
        description="Isso apaga as rolagens de todas as fichas desta pasta, para todo mundo."
        confirmLabel="Limpar"
        onCancel={() => setClearScope(null)}
        onConfirm={onClearRolls}
      />
    </main>
  );
}

type PendingChoice = {
  kind: "asi" | "feat";
  /** Incrementos já no formato da ficha (+1 por ponto; talento: +amount). */
  abilities: Partial<Record<AbilityKey, number>>;
  feat?: string;
};

function PendingAdvancement({
  characterId,
  onSave,
}: {
  characterId: string;
  onSave: (decision: AsiDecision) => Promise<void>;
}) {
  const character = useStore((state) => state.characters[characterId]);
  useStore((state) => state.homebrew); // talentos homebrew novos aparecem sem recarregar
  const [choices, setChoices] = useState<Record<string, PendingChoice>>({});
  if (!character) return null;
  const pending = pendingAsis(character.sheet.classes, character.sheet.advancement);
  const raceName = character.sheet.raceInfo?.race ?? character.sheet.species;
  const feats = allFeats().filter((entry) => !entry.races || entry.races.includes(raceName));
  return (
    <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
      <div className="text-sm font-medium">Progressão pendente</div>
      {pending.map((slot) => {
        const key = `${slot.className}:${slot.level}`;
        const choice = choices[key] ?? { kind: "asi", abilities: {} };
        const feat = choice.kind === "feat" && choice.feat ? findFeat(choice.feat) : undefined;
        const setChoice = (patch: Partial<PendingChoice>) =>
          setChoices((state) => ({ ...state, [key]: { ...choice, ...patch } }));
        const preview = applyAbilityIncrease(character.sheet.abilityScores, choice.abilities);
        const valid =
          choice.kind === "asi"
            ? allocatedPoints(choice.abilities) === 2
            : !!choice.feat && (!feat?.abilityIncrease || allocatedPoints(choice.abilities) === feat.abilityIncrease.amount);
        return (
          <div key={key} className="space-y-2 rounded border border-amber-200 bg-white p-2 dark:border-amber-900 dark:bg-zinc-900">
            <div className="text-xs font-medium">
              {slot.className} · nível {slot.level}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={choice.kind === "asi" ? "success" : "outline"}
                onClick={() => choice.kind !== "asi" && setChoice({ kind: "asi", abilities: {}, feat: undefined })}
              >
                Pontos de atributo
              </Button>
              <Button
                size="sm"
                variant={choice.kind === "feat" ? "success" : "outline"}
                onClick={() => choice.kind !== "feat" && setChoice({ kind: "feat", abilities: {}, feat: undefined })}
              >
                Talento
              </Button>
            </div>
            {choice.kind === "asi" ? (
              <PointAllocator
                points={2}
                maxPerAbility={2}
                allocation={choice.abilities}
                scores={preview}
                onChange={(abilities) => setChoice({ abilities })}
              />
            ) : (
              <div className="space-y-2">
                <select
                  className="h-8 w-full rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  value={choice.feat ?? ""}
                  onChange={(event) => setChoice({ feat: event.target.value || undefined, abilities: {} })}
                >
                  <option value="">— talento —</option>
                  {feats.map((entry) => (
                    <option key={entry.name} value={entry.name}>
                      {entry.name}
                      {entry.source === "Homebrew" ? " (homebrew)" : ""}
                      {entry.prerequisite ? ` — pré-requisito: ${entry.prerequisite}` : ""}
                    </option>
                  ))}
                </select>
                {feat?.abilityIncrease && (
                  <PointAllocator
                    points={1}
                    amount={feat.abilityIncrease.amount}
                    allowed={feat.abilityIncrease.choose}
                    allocation={toAllocation(choice.abilities, feat.abilityIncrease.amount)}
                    scores={preview}
                    onChange={(allocation) => setChoice({ abilities: fromAllocation(allocation, feat.abilityIncrease!.amount) })}
                  />
                )}
                {feat && <p className="whitespace-pre-line text-xs text-zinc-600 dark:text-zinc-300">{feat.description}</p>}
              </div>
            )}
            <Button
              size="sm"
              disabled={!valid}
              onClick={() =>
                void onSave({
                  className: slot.className,
                  level: slot.level,
                  kind: choice.kind,
                  ...(choice.kind === "feat" ? { feat: choice.feat } : {}),
                  ...(Object.keys(choice.abilities).length ? { abilities: choice.abilities } : {}),
                })
              }
            >
              Aplicar escolha
            </Button>
          </div>
        );
      })}
    </div>
  );
}
