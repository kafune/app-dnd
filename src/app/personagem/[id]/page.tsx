"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Pencil, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { ALIGNMENTS } from "@/lib/types";
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
import { useUnlocked } from "@/lib/store";

export default function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const character = useStore((s) => s.characters[id]);
  const clearRolls = useStore((s) => s.clearRolls);
  const deleteCharacter = useStore((s) => s.deleteCharacter);
  const pushToast = useStore((s) => s.pushToast);
  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);
  const patchCharacter = useStore((s) => s.patchCharacter);
  const patchSheet = useStore((s) => s.patchSheet);
  const unlocked = useUnlocked(id);

  const limparHistorico = (scope: "player" | "mesa") => {
    const msg =
      scope === "mesa"
        ? "Limpar TODAS as rolagens da mesa? Isso afeta todos os jogadores."
        : "Limpar as rolagens desta ficha?";
    if (window.confirm(msg)) void clearRolls(scope === "mesa" ? undefined : id);
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
      router.push("/");
    }
  };

  if (!character) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
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
  const setClasses = (next: typeof classes) => void patchSheet(id, { classes: next });
  const updateClassEntry = (i: number, patch: Partial<(typeof classes)[number]>) =>
    setClasses(classes.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/">
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
                <EditableText
                  value={character.sheet.species}
                  onSave={(v) => patchSheet(id, { species: v })}
                />
              </label>
              <label className="text-xs text-zinc-500">
                Antecedente
                <EditableText
                  value={character.sheet.background}
                  onSave={(v) => patchSheet(id, { background: v })}
                />
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
              <div className="space-y-1">
                {classes.map((c, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-1">
                    <EditableText
                      value={c.name}
                      onSave={(v) => updateClassEntry(i, { name: v })}
                      className="w-36"
                    />
                    <EditableText
                      value={c.subclass ?? ""}
                      onSave={(v) => updateClassEntry(i, { subclass: v || undefined })}
                      placeholder="subclasse"
                      className="w-40"
                    />
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
                      onClick={() => setClasses(classes.filter((_, idx) => idx !== i))}
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
                onClick={() => setClasses([...classes, { name: "Classe", level: 1 }])}
              >
                + Classe
              </Button>
            </div>
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
