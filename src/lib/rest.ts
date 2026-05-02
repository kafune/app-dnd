import type { Character } from "./types";

export function applyShortRest(character: Character): Pick<Character, "resources"> {
  return {
    resources: character.resources.map((resource) =>
      resource.recharge === "short"
        ? { ...resource, current: resource.max }
        : resource,
    ),
  };
}

export function applyLongRest(
  character: Character,
): Pick<Character, "hpCurrent" | "hpTemp" | "resources" | "spellSlots"> {
  return {
    hpCurrent: character.hpMax,
    hpTemp: 0,
    resources: character.resources.map((resource) =>
      resource.recharge === "long" ||
      resource.recharge === "short" ||
      resource.recharge === "dawn"
        ? { ...resource, current: resource.max }
        : resource,
    ),
    spellSlots: Object.fromEntries(
      Object.entries(character.spellSlots).map(([level, slot]) => [
        level,
        { ...slot, current: slot.max },
      ]),
    ),
  };
}
