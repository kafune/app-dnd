import { describe, expect, test } from "bun:test";
import { groupProficiencies, proficiencyTopic, splitProficiencies } from "./proficiencies";

describe("proficiências por tópico", () => {
  test("quebra vírgulas fora de parênteses e remove Nenhuma e duplicatas", () => {
    expect(
      splitProficiencies([
        "Armaduras leves, armaduras médias, escudos (druidas não usam armaduras ou escudos feitos de metal)",
        "Nenhuma",
        "Escudos (druidas não usam armaduras ou escudos feitos de metal)",
      ]),
    ).toEqual([
      "Armaduras leves",
      "Armaduras médias",
      "Escudos (druidas não usam armaduras ou escudos feitos de metal)",
    ]);
  });

  test("classifica armaduras, armas e ferramentas das fichas reais", () => {
    expect(proficiencyTopic("Todas as armaduras")).toBe("armaduras");
    expect(proficiencyTopic("Escudo Leve (Trance)")).toBe("armaduras");
    expect(proficiencyTopic("Armas Simples e Marciais")).toBe("armas");
    expect(proficiencyTopic("Besta de Mão")).toBe("armas");
    expect(proficiencyTopic("Espadas Longas e Curtas")).toBe("armas");
    expect(proficiencyTopic("Clavas")).toBe("armas");
    expect(proficiencyTopic("Ferramentas de Entalhador")).toBe("ferramentas");
    expect(proficiencyTopic("Kit de herbalismo")).toBe("ferramentas");
    expect(proficiencyTopic("Três instrumentos musicais à sua escolha")).toBe("ferramentas");
    expect(proficiencyTopic("Veículos (terrestres)")).toBe("ferramentas");
  });

  test("agrupa na ordem de exibição", () => {
    const groups = groupProficiencies([
      "Armas simples, espadas curtas",
      "Ferramentas de ladrão",
      "Armaduras leves",
    ]);
    expect(groups.map((group) => group.topic)).toEqual(["armaduras", "armas", "ferramentas"]);
    expect(groups[1].items).toEqual(["Armas simples", "Espadas curtas"]);
  });
});
