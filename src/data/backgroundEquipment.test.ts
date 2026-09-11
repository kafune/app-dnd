import { describe, expect, test } from "bun:test";
import { buildCharacter, emptyDraft } from "@/lib/createCharacter";
import { BACKGROUNDS_CATALOG } from "./backgroundsCatalog";
import { BACKGROUND_KITS, backgroundGrants, findBackgroundKit, missingToolChoice } from "./backgroundEquipment";
import { findItem } from "./itemsCatalog";

describe("equipamento dos antecedentes", () => {
  test("todo antecedente do catálogo tem equipamento cadastrado", () => {
    for (const background of BACKGROUNDS_CATALOG) expect(findBackgroundKit(background.name), background.name).toBeDefined();
    expect(Object.keys(BACKGROUND_KITS)).toHaveLength(BACKGROUNDS_CATALOG.length);
  });

  test("ferramentas fixas e à escolha existem no catálogo de itens", () => {
    for (const [name, kit] of Object.entries(BACKGROUND_KITS)) {
      for (const tool of kit.tools ?? []) {
        if (!tool.startsWith("Veículos")) expect(findItem(tool)?.name, `${name}: ${tool}`).toBe(tool);
      }
      for (const choice of kit.toolChoices ?? []) {
        for (const group of choice.from) {
          for (const option of group.options) expect(findItem(option)?.name, `${name}: ${option}`).toBe(option);
        }
      }
    }
  });

  test("Acólito: itens, quantidades e ouro", () => {
    const grants = backgroundGrants("Acólito");
    expect(grants.gold).toBe(15);
    expect(grants.items.map((item) => item.name)).toEqual([
      "Símbolo Sagrado",
      "Livro de orações",
      "Bastões de incenso",
      "Vestimentas",
      "Roupas Comuns",
    ]);
    expect(grants.items.find((item) => item.name === "Bastões de incenso")?.quantity).toBe(5);
    expect(grants.items[0].description).toContain("foco de conjuração");
    expect(grants.tools).toEqual([]);
  });

  test("Artista: o instrumento escolhido vira proficiência e item", () => {
    expect(missingToolChoice("Artista (Entretenimento)")).toBe("Instrumento musical");
    const grants = backgroundGrants("Artista (Entretenimento)", [], [["Alaúde"]]);
    expect(grants.tools).toEqual(["Kit de Disfarce", "Alaúde"]);
    expect(grants.items.map((item) => item.name)).toContain("Alaúde");
    expect(missingToolChoice("Artista (Entretenimento)", [["Alaúde"]])).toBeNull();
  });

  test("Caçador de Recompensas: duas ferramentas de grupos diferentes, sem ir para o inventário", () => {
    expect(missingToolChoice("Caçador de Recompensas", [["Alaúde", "Flauta"]])).not.toBeNull();
    expect(missingToolChoice("Caçador de Recompensas", [["Alaúde", "Ferramentas de Ladrão"]])).toBeNull();
    const grants = backgroundGrants("Caçador de Recompensas", [], [["Alaúde", "Ferramentas de Ladrão"]]);
    expect(grants.items.map((item) => item.name)).toEqual(["Roupas da profissão"]);
    expect(grants.tools).toEqual(["Alaúde", "Ferramentas de Ladrão"]);
  });

  test("Charlatão: escolha do golpe favorito", () => {
    expect(backgroundGrants("Charlatão").items.find((item) => item.name.startsWith("Garrafas"))?.quantity).toBe(10);
    expect(backgroundGrants("Charlatão", [2]).items.map((item) => item.name)).toContain("Baralho de cartas marcadas");
  });

  test("a ficha criada recebe itens, ouro e ferramentas do antecedente", () => {
    const character = buildCharacter(
      {
        ...emptyDraft(),
        playerName: "P",
        characterName: "C",
        pin: "1",
        background: "Criminoso",
        backgroundToolPicks: [["Conjunto de Dados"]],
        coins: { gp: 3, sp: 0, cp: 0 },
        inventoryItems: [{ name: "Roupas Comuns", quantity: 1 }],
        classes: [
          { name: "Ladino", level: 1, hitDie: "d8", saves: ["dex", "int"], proficiencies: ["Armaduras leves", "Ferramentas de ladrão"] },
        ],
      },
      "c",
    );
    expect(character.sheet.inventory.coins.gp).toBe(18);
    expect(character.sheet.inventory.items.find((item) => item.name === "Pé de Cabra")).toBeDefined();
    expect(character.sheet.inventory.items.find((item) => item.name === "Roupas Comuns")?.quantity).toBe(2);
    expect(character.sheet.proficiencies).toEqual(["Armaduras leves", "Ferramentas de ladrão", "Conjunto de Dados"]);
  });
});
