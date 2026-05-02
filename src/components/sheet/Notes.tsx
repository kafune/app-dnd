"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore, useUnlocked } from "@/lib/store";
import { cn } from "@/lib/cn";

export function Notes({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);

  if (!character) return null;

  const savedNotes = character.notes ?? "";

  return (
    <NotesEditor
      key={`${character.id}:${savedNotes}`}
      id={id}
      characterName={character.characterName}
      savedNotes={savedNotes}
    />
  );
}

function NotesEditor({
  id,
  characterName,
  savedNotes,
}: {
  id: string;
  characterName: string;
  savedNotes: string;
}) {
  const patch = useStore((s) => s.patchCharacter);
  const pushToast = useStore((s) => s.pushToast);
  const unlocked = useUnlocked(id);
  const [draft, setDraft] = useState(savedNotes);
  const [saving, setSaving] = useState(false);

  const dirty = draft !== savedNotes;

  const save = async () => {
    if (!unlocked || !dirty) return;
    setSaving(true);
    const ok = await patch(id, { notes: draft });
    setSaving(false);
    pushToast({
      title: ok ? "Notas salvas" : "Falha ao salvar notas",
      description: ok
        ? `${characterName} foi atualizado.`
        : "Confira o PIN e tente de novo.",
      tone: ok ? "success" : "danger",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            <NotebookPen className="mr-1 inline h-3.5 w-3.5" />
            Notas da Sessão
          </CardTitle>
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">
            {unlocked ? "editável" : "travado"}
          </span>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <textarea
          value={draft}
          disabled={!unlocked || saving}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            unlocked
              ? "Pistas, promessas, loot pendente, NPCs suspeitos..."
              : "Destrave a ficha pelo PIN para editar as notas."
          }
          className={cn(
            "min-h-36 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6",
            "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/40",
            "disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
          )}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            {dirty
              ? "Há alterações não salvas."
              : savedNotes
                ? "Notas sincronizadas."
                : "Nenhuma nota salva ainda."}
          </p>
          <Button
            size="sm"
            disabled={!unlocked || !dirty || saving}
            onClick={save}
          >
            {saving ? "salvando..." : "salvar notas"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
