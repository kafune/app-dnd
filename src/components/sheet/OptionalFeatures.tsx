import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { applyClassChange, optionalFeaturesFor } from "@/lib/progression";
import { Sparkles } from "lucide-react";

/**
 * Características opcionais do Caldeirão de Tasha (Mira Firme, Versatilidade
 * Marcial…). O livro deixa a critério do Mestre e do jogador: aqui elas ficam
 * desligadas até alguém escolher, em vez de entrar sozinhas na ficha.
 */
export function OptionalFeatures({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);
  const patchCharacter = useStore((s) => s.patchCharacter);
  const pushToast = useStore((s) => s.pushToast);
  const editMode = useStore((s) => s.editMode);
  if (!character) return null;

  // Opcional é opcional: fora do modo de edição a ficha não fica insistindo. Quem
  // quiser adotar uma delas depois abre "Editar ficha" e marca aqui.
  if (!editMode) return null;
  const available = optionalFeaturesFor(character.sheet.classes);
  if (available.length === 0) return null;
  const adopted = new Set(character.sheet.optionalFeatures ?? []);

  const toggle = async (name: string) => {
    const next = adopted.has(name)
      ? (character.sheet.optionalFeatures ?? []).filter((entry) => entry !== name)
      : [...(character.sheet.optionalFeatures ?? []), name];
    // Recalcula a ficha com a nova lista para a característica entrar/sair de verdade.
    const withFlag = { ...character, sheet: { ...character.sheet, optionalFeatures: next } };
    const result = applyClassChange(withFlag, character.sheet.classes);
    const ok = await patchCharacter(id, {
      sheet: { ...result.character.sheet, optionalFeatures: next },
      resources: result.character.resources,
    });
    if (ok) {
      pushToast({
        title: adopted.has(name) ? `${name} removida` : `${name} adotada`,
        tone: "success",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle>
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            Características opcionais
          </CardTitle>
          <span className="text-[10px] text-zinc-500">
            {adopted.size}/{available.length} adotadas
          </span>
        </div>
      </CardHeader>
      <CardBody className="space-y-2">
        <p className="text-xs text-zinc-500">
          Regras opcionais do Caldeirão de Tasha. Combine com o Mestre antes de ligar: elas só entram na ficha se você
          quiser, e o que você não adotar não aparece fora do modo de edição.
        </p>
        {available.map((feature) => {
          const on = adopted.has(feature.name);
          return (
            <div
              key={feature.name}
              className={`space-y-1 rounded-md border p-2 ${
                on
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {feature.name}
                  <span className="ml-1 text-xs font-normal text-zinc-500">
                    {feature.origin.name} {feature.level}
                  </span>
                </span>
                <Button size="sm" variant={on ? "outline" : "success"} onClick={() => void toggle(feature.name)}>
                  {on ? "Remover" : "Adicionar"}
                </Button>
              </div>
              <p className="whitespace-pre-line text-xs text-zinc-600 dark:text-zinc-300">{feature.description}</p>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
