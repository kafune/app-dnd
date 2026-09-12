import { describe, expect, test } from "bun:test";
import { groupFeatures } from "./features";
import type { Feature, Sheet } from "./types";

const feature = (name: string, origin: Feature["origin"]): Feature => ({
  name,
  source: "",
  description: "",
  origin,
});

const sheet = {
  species: "Anão",
  background: "Soldado",
  raceInfo: { race: "Anão", subrace: "Anão da Colina" },
  classes: [
    { name: "Ladino", subclass: "Trapaceiro Arcano", level: 5 },
    { name: "Guerreiro", level: 2 },
  ],
  features: [
    feature("Ataque Furtivo", { kind: "class", name: "Ladino", level: 1 }),
    feature("Emboscada Mágica", { kind: "subclass", name: "Trapaceiro Arcano", level: 9 }),
    feature("Retomar o Fôlego", { kind: "class", name: "Guerreiro", level: 1 }),
    feature("Visão no Escuro", { kind: "race", name: "Anão" }),
    feature("Alerta", { kind: "feat", name: "Alerta", level: 4 }),
    feature("Posição Militar", { kind: "background", name: "Soldado" }),
    feature("Bênção do Mestre", { kind: "custom", name: "Mestre" }),
  ],
} as unknown as Sheet;

describe("características por origem", () => {
  test("separa raça, cada classe (com a subclasse dela), talentos, antecedente e o resto", () => {
    const groups = groupFeatures(sheet);
    expect(groups.map((group) => group.label)).toEqual([
      "Raça: Anão",
      "Classe 1: Ladino 5 · Trapaceiro Arcano",
      "Classe 2: Guerreiro 2",
      "Talentos",
      "Antecedente: Soldado",
      "Outras (Mestre e homebrew)",
    ]);
    expect(groups[1].features.map((f) => f.name)).toEqual(["Ataque Furtivo", "Emboscada Mágica"]);
    expect(groups[2].features.map((f) => f.name)).toEqual(["Retomar o Fôlego"]);
    expect(groups[5].features.map((f) => f.name)).toEqual(["Bênção do Mestre"]);
  });

  test("cada característica aparece em um grupo só, e grupos vazios somem", () => {
    const groups = groupFeatures({ ...sheet, features: [feature("Alerta", { kind: "feat", name: "Alerta", level: 4 })] });
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Talentos");
  });
});

describe("fichas antigas (sem origem estruturada)", () => {
  const legacy = {
    species: "Kenku",
    background: "Pirata",
    raceInfo: { race: "Kenku" },
    classes: [{ name: "Bardo", subclass: "Colégio da Eloquência", level: 3 }],
    features: [
      { name: "Canção do Descanso", source: "Bardo", description: "" },
      { name: "Língua Prateada", source: "Colégio da Eloquência", description: "" },
      { name: "Mimicry", source: "Kenku", description: "" },
      { name: "Reputação Ruim", source: "Antecedente: Pirata", description: "" },
      { name: "Bênção estranha", source: "Mestre", description: "" },
    ],
  } as unknown as Sheet;

  test("usa o texto de `source` para agrupar", () => {
    const groups = groupFeatures(legacy);
    expect(groups.map((group) => [group.label, group.features.map((f) => f.name)])).toEqual([
      ["Raça: Kenku", ["Mimicry"]],
      ["Classe 1: Bardo 3 · Colégio da Eloquência", ["Canção do Descanso", "Língua Prateada"]],
      ["Antecedente: Pirata", ["Reputação Ruim"]],
      ["Outras (Mestre e homebrew)", ["Bênção estranha"]],
    ]);
  });
});
