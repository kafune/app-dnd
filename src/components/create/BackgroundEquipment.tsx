import {
  backgroundGrants,
  findBackgroundKit,
  toolGroupOf,
} from "@/data/backgroundEquipment";
import type { CharacterDraft } from "@/lib/createCharacter";
import { selectCls } from "./common";

type Props = {
  draft: CharacterDraft;
  upd: (patch: Partial<CharacterDraft>) => void;
};

/**
 * Equipamento, ouro e ferramentas do antecedente escolhido. Entra sozinho no
 * inventário, nas moedas e nas proficiências quando a ficha é criada; aqui o
 * jogador só resolve as escolhas ("instrumento à sua escolha", "golpe favorito"…).
 */
export function BackgroundEquipment({ draft, upd }: Props) {
  if (!draft.background.trim()) return null;
  const kit = findBackgroundKit(draft.background);
  if (!kit) {
    return (
      <p className="rounded-md border border-zinc-200 p-3 text-xs text-zinc-500 dark:border-zinc-800">
        Este antecedente não tem equipamento cadastrado. Adicione os itens dele pela lista abaixo.
      </p>
    );
  }
  const equipmentChoices = draft.backgroundEquipmentChoices ?? [];
  const toolPicks = draft.backgroundToolPicks ?? [];
  const grants = backgroundGrants(draft.background, equipmentChoices, toolPicks);

  const setEquipmentChoice = (group: number, option: number) => {
    const next = [...equipmentChoices];
    next[group] = option;
    upd({ backgroundEquipmentChoices: next });
  };

  const setToolPick = (choice: number, index: number, value: string) => {
    const next = toolPicks.map((picks) => [...picks]);
    while (next.length <= choice) next.push([]);
    next[choice][index] = value;
    upd({ backgroundToolPicks: next });
  };

  return (
    <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm font-medium">Equipamento do antecedente · {draft.background}</div>
        <span className="text-xs text-emerald-700 dark:text-emerald-400">entra automaticamente na ficha</span>
      </div>

      {kit.choices?.map((group, groupIndex) => (
        <select
          key={groupIndex}
          className={selectCls}
          aria-label={`Escolha do equipamento ${groupIndex + 1}`}
          value={equipmentChoices[groupIndex] ?? 0}
          onChange={(event) => setEquipmentChoice(groupIndex, Number(event.target.value))}
        >
          {group.map((option, optionIndex) => (
            <option key={option.label} value={optionIndex}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {kit.toolChoices?.map((choice, choiceIndex) => {
        const picks = toolPicks[choiceIndex] ?? [];
        return (
          <div key={choice.label} className="space-y-1">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {choice.label}: escolha {choice.count}.{" "}
              {choice.addsItem ? "Vira proficiência e também vai para o inventário." : "Vira proficiência."}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: choice.count }, (_, pickIndex) => (
                <select
                  key={pickIndex}
                  className={selectCls}
                  aria-label={`${choice.label} ${pickIndex + 1}`}
                  value={picks[pickIndex] ?? ""}
                  onChange={(event) => setToolPick(choiceIndex, pickIndex, event.target.value)}
                >
                  <option value="">— escolha —</option>
                  {choice.from.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map((tool) => {
                        const others = picks.filter((pick, index) => index !== pickIndex && pick);
                        const disabled =
                          others.includes(tool) ||
                          (!!choice.distinctGroups && others.some((pick) => toolGroupOf(choice, pick) === group.group));
                        return (
                          <option key={tool} value={tool} disabled={disabled}>
                            {tool}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              ))}
            </div>
          </div>
        );
      })}

      <ul className="space-y-0.5 text-sm">
        {grants.items.map((item) => (
          <li key={item.name}>
            <strong>
              {item.name}
              {(item.quantity ?? 1) > 1 ? ` ×${item.quantity}` : ""}
            </strong>
            {item.description && <span className="ml-1 text-xs text-zinc-500">— {item.description}</span>}
          </li>
        ))}
        <li>
          <strong>{grants.gold} po</strong> <span className="text-xs text-zinc-500">— somados às moedas abaixo</span>
        </li>
      </ul>
      {grants.tools.length > 0 && (
        <p className="text-xs text-zinc-600 dark:text-zinc-300">
          <strong>Proficiências em ferramentas:</strong> {grants.tools.join(", ")}
        </p>
      )}
    </div>
  );
}
