import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore, useUnlocked } from "@/lib/store";
import { cn } from "@/lib/cn";

/**
 * História do personagem: um bloco de notas gigante, igual ao das Notas da Sessão,
 * mas que só abre para escrita no modo de edição — assim ninguém reescreve a
 * própria história sem querer no meio da sessão.
 *
 * Nasce fechada. Histórias passam de mil caracteres e ninguém relê a própria no
 * meio da sessão; aberta, ela empurrava o resto da ficha para fora da tela. A
 * setinha do cabeçalho abre e fecha, e entrar no modo de edição abre sozinho (se
 * você foi editar, é para escrever).
 */
export function Backstory({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);
  const editMode = useStore((s) => s.editMode);
  const unlocked = useUnlocked(id);
  const [open, setOpen] = useState(false);
  const editable = editMode && unlocked;

  useEffect(() => {
    if (editable) setOpen(true);
  }, [editable]);

  if (!character) return null;
  const saved = character.sheet.personality?.backstory ?? "";
  if (!editable && !saved) return null;

  return (
    <Card>
      <CardHeader className="p-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
          )}
          <CardTitle className="min-w-0 flex-1">
            <BookOpen className="mr-1 inline h-3.5 w-3.5" />
            História do Personagem
          </CardTitle>
          <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-500">
            {open ? (editable ? "editável" : "só no modo de edição") : summary(saved)}
          </span>
        </button>
      </CardHeader>
      {open && <BackstoryEditor key={`${character.id}:${saved}`} id={id} saved={saved} />}
    </Card>
  );
}

/** "3 parágrafos · 1.240 caracteres" — o bastante para saber se vale abrir. */
function summary(saved: string): string {
  if (!saved.trim()) return "vazia";
  const paragraphs = saved.split(/\n\s*\n/).filter((part) => part.trim()).length;
  return `${paragraphs} parágrafo${paragraphs === 1 ? "" : "s"} · ${saved.length.toLocaleString("pt-BR")} caracteres`;
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

  return (
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
  );
}
