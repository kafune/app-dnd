import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { fixedSkills, skillBudget, type CharacterDraft } from "@/lib/createCharacter";
import { multiclassWithoutSkills } from "@/lib/progression";
import { ALL_SKILL_NAMES, skillAllowedBy, skillSelectionFits } from "@/lib/skillChoice";
import { cn } from "@/lib/cn";
import type { SkillName } from "@/lib/types";

type Props = {
  draft: CharacterDraft;
  upd: (patch: Partial<CharacterDraft>) => void;
};

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export function SkillsSection({ draft, upd }: Props) {
  const budget = skillBudget(draft);
  const automatic = fixedSkills(draft);
  const allowedBy = skillAllowedBy(budget.parts);
  const namedClasses = draft.classes.filter((entry) => entry.name.trim());
  const noSkills = multiclassWithoutSkills(namedClasses);

  const canAdd = (skill: SkillName) =>
    draft.skills.length < budget.total && skillSelectionFits([...draft.skills, skill], budget.parts);

  const toggle = (skill: SkillName) => {
    if (draft.skills.includes(skill)) {
      upd({ skills: draft.skills.filter((entry) => entry !== skill) });
    } else if (canAdd(skill)) {
      upd({ skills: [...draft.skills, skill] });
    }
  };

  const visible = ALL_SKILL_NAMES.filter((skill) => allowedBy.has(skill) || automatic.includes(skill));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle>Perícias</CardTitle>
          <span className={cn("text-xs", draft.skills.length === budget.total ? "text-emerald-600" : "text-zinc-500")}>
            {draft.skills.length}/{budget.total} escolhidas
          </span>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {namedClasses.length > 1 && (
          <div className="space-y-2 rounded-md border border-sky-200 bg-sky-50 p-3 text-xs text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
            <p>
              <strong>Multiclasse no Livro do Jogador (cap. 6):</strong> a primeira classe dá a escolha completa de perícias.
              Ao entrar numa nova classe, só Bardo (1 perícia qualquer), Ladino e Patrulheiro (1 perícia da lista) dão perícias;
              as outras dão apenas proficiências de armas e armaduras.
            </p>
            {noSkills.length > 0 && !draft.multiclassFullSkills && (
              <p>
                Por isso {joinNames(noSkills)} não {noSkills.length > 1 ? "somam" : "soma"} perícias aqui.
              </p>
            )}
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={!!draft.multiclassFullSkills}
                onChange={(event) => upd({ multiclassFullSkills: event.target.checked, skills: [] })}
              />
              <span>
                <strong>Regra da casa:</strong> cada classe dá a escolha completa de perícias dela (ex.: Monge 2 + Druida 2), com
                a lista de cada uma. Combine com o Mestre antes de marcar.
              </span>
            </label>
          </div>
        )}

        <ul className="space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
          {budget.parts.map((part) => (
            <li key={part.label}>
              <strong>{part.label}:</strong> {part.count} perícia{part.count > 1 ? "s" : ""}
              {part.from && part.from.length < ALL_SKILL_NAMES.length ? ` (${part.from.join(", ")})` : " (qualquer uma)"}
            </li>
          ))}
          {budget.parts.length === 0 && <li>Escolha uma classe para liberar as perícias.</li>}
          {automatic.length > 0 && (
            <li>
              <strong>Automáticas (raça e antecedente):</strong> {automatic.join(", ")}
            </li>
          )}
        </ul>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {visible.map((skill) => {
            const isAutomatic = automatic.includes(skill);
            const checked = isAutomatic || draft.skills.includes(skill);
            const disabled = isAutomatic || (!checked && !canAdd(skill));
            return (
              <label
                key={skill}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1 text-sm",
                  checked
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                    : "border-transparent",
                  disabled && !checked && "opacity-50",
                )}
              >
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(skill)} />
                <span>{skill}</span>
                <span className="ml-auto text-right text-[10px] text-zinc-500">
                  {isAutomatic ? "automática" : (allowedBy.get(skill) ?? []).join(" · ")}
                </span>
              </label>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
