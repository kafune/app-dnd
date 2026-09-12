import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { fixedSkills, type CharacterDraft } from "@/lib/createCharacter";
import { expertiseBudget, optionalFeaturesFor } from "@/lib/progression";
import type { SkillName } from "@/lib/types";

type Props = {
  draft: CharacterDraft;
  upd: (patch: Partial<CharacterDraft>) => void;
};

const classEntries = (draft: CharacterDraft) =>
  draft.classes
    .filter((c) => c.name.trim())
    .map((c) => ({ name: c.name, level: c.level, subclass: c.subclass }));

const draftFeats = (draft: CharacterDraft) => [
  ...(draft.raceFeat ? [draft.raceFeat] : []),
  ...draft.advancement.filter((d) => d.feat).map((d) => d.feat!),
];

/**
 * Características opcionais do Caldeirão de Tasha. O livro deixa a critério da
 * mesa, então elas entram por escolha — antes apareciam sozinhas na ficha.
 */
export function OptionalFeaturesPicker({ draft, upd }: Props) {
  const available = optionalFeaturesFor(classEntries(draft));
  if (available.length === 0) return null;
  const adopted = draft.optionalFeatures ?? [];

  const toggle = (name: string) =>
    upd({
      optionalFeatures: adopted.includes(name) ? adopted.filter((n) => n !== name) : [...adopted, name],
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle>Características opcionais (Tasha)</CardTitle>
          <span className="text-xs text-zinc-500">
            {adopted.length}/{available.length} adotadas
          </span>
        </div>
      </CardHeader>
      <CardBody className="space-y-2">
        <p className="text-xs text-zinc-500">
          Regras opcionais do Caldeirão de Tasha para a sua classe. Combine com o Mestre: marque só as que a mesa usa.
        </p>
        {available.map((feature) => {
          const on = adopted.includes(feature.name);
          return (
            <label
              key={feature.name}
              className={`flex cursor-pointer gap-2 rounded-md border p-2 text-xs transition ${
                on
                  ? "border-emerald-400 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                  : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
              }`}
            >
              <input type="checkbox" className="mt-0.5" checked={on} onChange={() => toggle(feature.name)} />
              <span className="min-w-0">
                <strong className="text-sm">{feature.name}</strong>
                <span className="ml-1 text-zinc-500">
                  {feature.origin.name} {feature.level}
                </span>
                <p className="mt-0.5 whitespace-pre-line text-zinc-600 dark:text-zinc-300">{feature.description}</p>
              </span>
            </label>
          );
        })}
      </CardBody>
    </Card>
  );
}

/**
 * Escolha das perícias com Especialização (bônus de proficiência dobrado) que a
 * classe, a subclasse ou os talentos concedem — Ladino, Bardo, Domínio do
 * Conhecimento, Especializado em Perícia, Prodígio.
 */
export function ExpertisePicker({ draft, upd }: Props) {
  const budget = expertiseBudget(classEntries(draft), {
    adopted: draft.optionalFeatures,
    feats: draftFeats(draft),
  });
  if (budget.total === 0 && budget.fixed.length === 0) return null;

  const proficient = [...new Set<SkillName>([...fixedSkills(draft), ...draft.skills])];
  const fixedSet = new Set(budget.fixed);
  const options = proficient
    .filter((skill) => !fixedSet.has(skill))
    .filter((skill) => !budget.allowed || budget.allowed.includes(skill))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  const chosen = (draft.expertise ?? []).filter((skill) => options.includes(skill));
  const left = budget.total - chosen.length;

  const toggle = (skill: SkillName) => {
    if (chosen.includes(skill)) upd({ expertise: chosen.filter((s) => s !== skill) });
    else if (left > 0) upd({ expertise: [...chosen, skill] });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle>Especialização</CardTitle>
          <span className={left === 0 ? "text-xs text-emerald-600" : "text-xs text-zinc-500"}>
            {chosen.length}/{budget.total} escolhidas
          </span>
        </div>
      </CardHeader>
      <CardBody className="space-y-2 text-xs">
        <p className="text-zinc-500">
          Dobra o seu bônus de proficiência nos testes dessas perícias. Vem de: {budget.sources.map((s) => s.label).join(" · ")}.
        </p>
        {budget.fixed.length > 0 && (
          <p className="text-zinc-600 dark:text-zinc-300">
            Já garantidas pela subclasse: <strong>{budget.fixed.join(", ")}</strong>.
          </p>
        )}
        {budget.total > 0 &&
          (options.length === 0 ? (
            <p className="text-amber-600 dark:text-amber-400">
              Escolha as perícias em que você é proficiente primeiro — a especialização só vale sobre elas.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {options.map((skill) => {
                const on = chosen.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    disabled={!on && left <= 0}
                    onClick={() => toggle(skill)}
                    className={`rounded border px-2 py-1 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      on
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          ))}
      </CardBody>
    </Card>
  );
}
