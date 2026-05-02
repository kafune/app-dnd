import { describe, expect, test } from "bun:test";
import { SEED_CHARACTERS } from "./index";

describe("seed characters", () => {
  test("mantém os 4 personagens esperados com ficha jogável", () => {
    expect(SEED_CHARACTERS).toHaveLength(4);

    for (const character of SEED_CHARACTERS) {
      expect(character.id).toBeTruthy();
      expect(character.playerName).toBeTruthy();
      expect(character.characterName).toBeTruthy();
      expect(character.hpMax).toBeGreaterThan(0);
      expect(character.hpCurrent).toBeGreaterThanOrEqual(0);
      expect(character.hpCurrent).toBeLessThanOrEqual(character.hpMax);
      expect(character.sheet.classes.length).toBeGreaterThan(0);
      expect(character.sheet.proficiencyBonus).toBe(2);
      expect(character.sheet.skills.length).toBeGreaterThan(0);
      expect(character.sheet.features.length).toBeGreaterThan(0);
    }
  });

  test("cobre os recursos homebrew importantes do MVP", () => {
    const resources = SEED_CHARACTERS.flatMap((character) =>
      character.resources.map((resource) => resource.name),
    );

    expect(resources).toContain("Graça da Rainha Corvo");
    expect(resources).toContain("Lembrança Kenku");
    expect(resources).toContain("Forma Selvagem");
    expect(resources.some((name) => name.startsWith("Cura pelas Mãos"))).toBe(true);
    expect(resources).toContain("Carne Fantasmagórica");
  });
});
