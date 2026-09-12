/**
 * Classe de Armadura da ficha (D&D 5e).
 *
 * A CA deixou de ser um número solto: ela é calculada a partir da armadura e do
 * escudo que o jogador equipou no inventário, dos modificadores de atributo e das
 * características de "Defesa sem Armadura". O Mestre ainda pode fixar um valor
 * manual (`sheet.acOverride`) ou somar um bônus avulso (`sheet.acBonus`).
 */
import { findItem, isArmorItem, isShieldItem, itemDisplayName, type CatalogItem } from "@/data/itemsCatalog";
import { abilityMod, formatMod, type AbilityKey, type Character, type Sheet } from "./types";

/** Uma parcela da conta da CA ("Armadura de Couro 11", "Destreza +3"). */
export type AcPart = { label: string; value: number };

export type AcBreakdown = {
  total: number;
  parts: AcPart[];
  /** Como a base foi obtida (para explicar na ficha). */
  source: string;
  /** Fórmula legível: "11 + 3 + 2 = 16". */
  formula: string;
  /** CA fixada à mão pelo Mestre? */
  manual: boolean;
};

function norm(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Item de armadura (não escudo) do catálogo, pelo nome guardado na ficha. */
export function findArmor(name: string | null | undefined): CatalogItem | undefined {
  if (!name) return undefined;
  const item = findItem(name);
  return item && isArmorItem(name) ? item : undefined;
}

/** Item de escudo do catálogo, pelo nome guardado na ficha. */
export function findShield(name: string | null | undefined): CatalogItem | undefined {
  if (!name) return undefined;
  const item = findItem(name);
  return item && isShieldItem(name) ? item : undefined;
}

/** Defesa sem armadura concedida por classe/subclasse (base + atributos somados). */
type UnarmoredDefense = {
  label: string;
  base: number;
  abilities: AbilityKey[];
  /** Escudo cancela a característica (Monge) ou convive com ela (Bárbaro)? */
  allowsShield: boolean;
};

function unarmoredDefense(sheet: Sheet): UnarmoredDefense | null {
  for (const feature of sheet.features) {
    const name = norm(feature.name);
    const origin = norm(feature.origin?.name ?? feature.source ?? "");
    if (name === "defesa sem armadura") {
      if (origin.includes("monge")) {
        return { label: "Defesa sem Armadura (Monge)", base: 10, abilities: ["dex", "wis"], allowsShield: false };
      }
      // Bárbaro é o outro caso do PHB; fichas antigas sem origem caem aqui.
      return { label: "Defesa sem Armadura (Bárbaro)", base: 10, abilities: ["dex", "con"], allowsShield: true };
    }
    if (name === "resiliencia draconica") {
      return { label: "Resiliência Dracônica", base: 13, abilities: ["dex"], allowsShield: true };
    }
  }
  return null;
}

const ABILITY_SHORT: Record<AbilityKey, string> = {
  str: "For",
  dex: "Des",
  con: "Con",
  int: "Int",
  wis: "Sab",
  cha: "Car",
};

/** Conta a CA da ficha: armadura equipada (ou defesa sem armadura) + escudo + bônus. */
export function computeAc(sheet: Sheet): AcBreakdown {
  const dexMod = abilityMod(sheet.abilityScores.dex);
  const armor = findArmor(sheet.equippedArmor);
  const shield = findShield(sheet.equippedShield);
  const defense = unarmoredDefense(sheet);
  const parts: AcPart[] = [];
  let source: string;

  if (armor) {
    const base = armor.acBase ?? 10;
    source = itemDisplayName(armor.name);
    parts.push({ label: source, value: base });
    const cap = armor.maxDex;
    if (cap === undefined) {
      if (dexMod !== 0) parts.push({ label: "Destreza", value: dexMod });
    } else if (cap > 0) {
      const applied = Math.min(dexMod, cap);
      if (applied !== 0) parts.push({ label: `Destreza (máx. +${cap})`, value: applied });
    }
  } else if (defense) {
    source = defense.label;
    parts.push({ label: source, value: defense.base });
    for (const key of defense.abilities) {
      const mod = abilityMod(sheet.abilityScores[key]);
      if (mod !== 0) parts.push({ label: ABILITY_SHORT[key], value: mod });
    }
  } else {
    source = "Sem armadura";
    parts.push({ label: "Base", value: 10 });
    if (dexMod !== 0) parts.push({ label: "Destreza", value: dexMod });
  }

  // Monge perde a Defesa sem Armadura ao usar escudo; o bônus do escudo ainda vale.
  if (shield) {
    parts.push({ label: itemDisplayName(shield.name), value: shield.acBase ?? 2 });
  }
  const bonus = sheet.acBonus ?? 0;
  if (bonus) parts.push({ label: "Bônus", value: bonus });

  const computed = parts.reduce((sum, part) => sum + part.value, 0);
  const manual = typeof sheet.acOverride === "number";
  const total = manual ? (sheet.acOverride as number) : computed;
  const formula = parts.map((p, i) => (i === 0 ? `${p.value}` : `${p.value >= 0 ? "+" : "−"} ${Math.abs(p.value)}`)).join(" ");

  return { total, parts, source, formula: `${formula} = ${computed}`, manual };
}

/** Avisos de uso da armadura/escudo atuais (desvantagem, Força mínima, Monge com escudo). */
export function acWarnings(sheet: Sheet): string[] {
  const out: string[] = [];
  const armor = findArmor(sheet.equippedArmor);
  const shield = findShield(sheet.equippedShield);
  const strength = sheet.abilityScores.str;
  for (const item of [armor, shield]) {
    if (!item) continue;
    const label = itemDisplayName(item.name);
    if (item.stealthDisadvantage) out.push(`${label}: desvantagem em testes de Destreza (Furtividade).`);
    if (item.strengthRequirement && strength < item.strengthRequirement) {
      out.push(`${label}: exige Força ${item.strengthRequirement} (você tem ${strength}) — deslocamento −3 m.`);
    }
  }
  const defense = unarmoredDefense(sheet);
  if (shield && defense && !defense.allowsShield && !armor) {
    out.push(`${defense.label} não funciona com escudo: a CA é só 10 + Destreza + o escudo.`);
  }
  return out;
}

/** Texto curto da conta ("Armadura de Couro 11 + Des +3 + Escudo +2"). */
export function acSummary(sheet: Sheet): string {
  const { parts } = computeAc(sheet);
  return parts.map((p, i) => (i === 0 ? `${p.label} ${p.value}` : `${p.label} ${formatMod(p.value)}`)).join(" · ");
}

/**
 * Patch de ficha que equipa/desequipa um item, com a CA espelhada em `sheet.ac`.
 *
 * Equipar desfaz a CA manual: fichas antigas ganharam `acOverride` na migração
 * (para o número autorado não mudar sozinho) e, ao vestir a armadura, o jogador
 * está justamente pedindo para a CA voltar a ser calculada.
 */
export function equipPatch(character: Character, itemName: string, equip: boolean): Partial<Sheet> {
  const sheet = character.sheet;
  const next: Partial<Sheet> = isShieldItem(itemName)
    ? { equippedShield: equip ? itemName : null }
    : { equippedArmor: equip ? itemName : null };
  if (equip) next.acOverride = null;
  const merged = { ...sheet, ...next };
  return { ...next, ac: computeAc(merged).total };
}
