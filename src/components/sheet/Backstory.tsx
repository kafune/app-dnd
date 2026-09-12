import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore, useUnlocked } from "@/lib/store";
import { cn } from "@/lib/cn";

/**
 * História do personagem: um bloco de notas gigante, igual ao das Notas da Sessão,
 * mas que só abre para escrita no modo de edição — assim ninguém reescreve a
 * própria história sem querer no meio da sessão.
 */
export function Backstory({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);
  if (!character) return null;
  const saved = character.sheet.personality?.backstory ?? "";
  return <BackstoryEditor key={`${character.id}:${saved}`} id={id} saved={saved} />;
}

function BackstoryEditor({ id, saved }: { id: string; saved: string }) {
  const character = useStore((s) => s.characters[id]);
  const patchSheet = useStore((s) => s.patchSheet);
  const pushToast = useStore((s) => s.pushToast);
  const editMode = useStore((s) => s.editMode);
  const unlocked = useUnlocked(id);
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);

  if (!character) return null;
  const editable = editMode && unlocked;
  const dirty = draft !== saved;

  const save = async () => {
    if (!editable || !dirty) return;
    setSaving(true);
    const ok = await patchSheet(id, {
      personality: { ...character.sheet.personality, backstory: draft },
    });
    setSaving(false);
    pushToast({
      title: ok ? "História salva" : "Falha ao salvar a história",
      description: ok ? `${character.characterName} foi atualizado.` : "Confira o PIN e tente de novo.",
      tone: ok ? "success" : "danger",
    });
  };

  if (!editable && !saved) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            <BookOpen className="mr-1 inline h-3.5 w-3.5" />
            História do Personagem
          </CardTitle>
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">
            {editable ? "editável" : "só no modo de edição"}
          </span>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {editable ? (
          <>
            <textarea
              value={draft}
              disabled={saving}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="De onde veio, quem deixou para trás, o que procura, com quem tem contas a acertar…"
              className={cn(
                "min-h-64 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6",
                "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/40",
                "disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
              )}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                {dirty ? "Há alterações não salvas." : saved ? "História sincronizada." : "Nada escrito ainda."}
              </p>
              <Button size="sm" disabled={!dirty || saving} onClick={save}>
                {saving ? "salvando…" : "salvar história"}
              </Button>
            </div>
          </>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">{saved}</p>
        )}
      </CardBody>
    </Card>
  );
}
