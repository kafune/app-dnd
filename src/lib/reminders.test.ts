import { afterEach, describe, expect, test } from "bun:test";
import { isAlways, remindersFor, type Reminder } from "./reminders";
import { setHomebrewItems } from "@/data/homebrewRegistry";
import type { Character, Feature, HomebrewReminder } from "./types";

function character(features: Feature[]): Character {
  return {
    id: "t",
    playerName: "Teste",
    characterName: "Teste",
    hpCurrent: 20,
    hpMax: 20,
    hpTemp: 0,
    spellSlots: {},
    resources: [],
    sheet: {
      species: "Shade",
      classes: [{ name: "Paladino", level: 3 }],
      background: "",
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      saves: [],
      skills: [],
      proficiencies: [],
      languages: [],
      ac: 10,
      speed: 9,
      initiativeBonus: 0,
      proficiencyBonus: 2,
      weapons: [],
      features,
      spells: { saveDC: 8, attackMod: 0, castingAbility: "cha", cantrips: [], known: [] },
      inventory: { coins: { gp: 0, sp: 0, cp: 0 }, items: [] },
      appearance: { size: "Médio", height: "" },
      personality: { trait: "", ideal: "", flaw: "", why: "", backstory: "" },
    },
  };
}

const feature = (name: string, description = ""): Feature => ({ name, source: "Teste", description });
const find = (list: Reminder[], part: string) => list.find((r) => r.text.includes(part) || r.source?.includes(part));

// O registro de homebrew é de módulo: cada teste que mexe nele devolve vazio.
afterEach(() => setHomebrewItems([]));

describe("lembretes", () => {
  test("transformação não vira efeito permanente", () => {
    const list = remindersFor(character([feature("Carne Fantasmagórica (1/longo)")]));
    const ghost = find(list, "Carne Fantasmagórica")!;
    expect(ghost).toBeDefined();
    expect(isAlways(ghost)).toBe(false);
    expect(ghost.when).toContain("Carne Fantasmagórica ligada");
    expect(ghost.text).toContain("Fora da transformação");
  });

  test("traço realmente permanente continua permanente", () => {
    const list = remindersFor(character([feature("Resiliência Anã")]));
    const dwarf = find(list, "Resiliência Anã")!;
    expect(isAlways(dwarf)).toBe(true);
    expect(dwarf.text).toContain("veneno");
  });

  test("Canalizar Divindade avisa que o efeito só vale no uso gasto", () => {
    const list = remindersFor(character([feature("Canalizar Divindade: Voto de Inimizade")]));
    const channel = find(list, "Canalizar Divindade")!;
    expect(isAlways(channel)).toBe(false);
    expect(channel.when).toContain("gastar um uso");
  });

  test("Ancestral Dracônico usa o dragão escolhido", () => {
    const list = remindersFor(character([feature("Ancestral Dracônico (Vermelho)")]));
    const ancestry = find(list, "Ancestral Dracônico")!;
    expect(ancestry.text).toContain("fogo");
    expect(isAlways(ancestry)).toBe(true);
  });

  test("característica homebrew que precisa ser ligada sai marcada como condicional", () => {
    const list = remindersFor(
      character([
        feature(
          "Manto de Cinzas",
          "Como uma ação, você se cobre de cinzas por 1 minuto. Você tem resistência a dano de fogo.",
        ),
      ]),
    );
    const homebrew = find(list, "resistência a dano de fogo")!;
    expect(homebrew).toBeDefined();
    expect(isAlways(homebrew)).toBe(false);
    expect(homebrew.when).toContain("Manto de Cinzas");
  });

  test("o lembrete marcado pelo Mestre no traço homebrew manda na varredura", () => {
    const reminder: HomebrewReminder = {
      text: "Você enxerga criaturas invisíveis a até 9 m.",
      tone: "good",
    };
    setHomebrewItems([
      { id: "hb-1", kind: "trait", updatedAt: "", data: { name: "Olhos de Vidro", description: "Nada aqui vira lembrete sozinho.", reminder } },
    ]);
    const list = remindersFor(character([feature("Olhos de Vidro", "Nada aqui vira lembrete sozinho.")]));
    const custom = find(list, "criaturas invisíveis")!;
    expect(custom).toBeDefined();
    expect(isAlways(custom)).toBe(true);
    expect(custom.tone).toBe("good");
  });

  test("a condição do lembrete do Mestre tira ele de “sempre ativo”", () => {
    setHomebrewItems([
      {
        id: "hb-2",
        kind: "feat",
        updatedAt: "",
        data: {
          name: "Lâmina da Rainha Corvo",
          description: "Descrição longa que não caberia no lembrete.",
          reminder: { text: "+1d6 de dano necrótico.", when: "só com a lâmina invocada", tone: "good" },
        },
      },
    ]);
    const list = remindersFor(character([feature("Lâmina da Rainha Corvo")]));
    const custom = find(list, "necrótico")!;
    expect(custom).toBeDefined();
    expect(isAlways(custom)).toBe(false);
    expect(custom.when).toBe("só com a lâmina invocada");
  });

  test("sem texto próprio, o lembrete do Mestre mostra a descrição inteira", () => {
    setHomebrewItems([
      {
        id: "hb-3",
        kind: "trait",
        updatedAt: "",
        data: { name: "Pele de Obsidiana", description: "Sua CA mínima é 13.", reminder: { tone: "info" } },
      },
    ]);
    const list = remindersFor(character([feature("Pele de Obsidiana", "Sua CA mínima é 13.")]));
    expect(find(list, "Sua CA mínima é 13.")).toBeDefined();
  });

  test("homebrew sem a caixinha marcada continua caindo na varredura", () => {
    setHomebrewItems([
      {
        id: "hb-4",
        kind: "trait",
        updatedAt: "",
        data: { name: "Casco Duro", description: "Você tem resistência a dano perfurante." },
      },
    ]);
    const list = remindersFor(character([feature("Casco Duro", "Você tem resistência a dano perfurante.")]));
    const scanned = find(list, "resistência a dano perfurante")!;
    expect(scanned).toBeDefined();
    expect(isAlways(scanned)).toBe(true);
  });

  test("tabela de rolagem e ficha de criatura invocada não viram lembrete", () => {
    const list = remindersFor(
      character([
        feature("Surto de Magia Selvagem", "71–72: Você ganha resistência a todos os danos pelo próximo minuto."),
        feature("Invocar Bicho", "Imunidade a dano: fogo.\nSentidos: visão no escuro 18 m, Percepção passiva 12."),
      ]),
    );
    expect(find(list, "71–72")).toBeUndefined();
    expect(find(list, "Imunidade a dano")).toBeUndefined();
  });
});
