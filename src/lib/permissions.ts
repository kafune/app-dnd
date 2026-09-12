/**
 * Quem pode mexer em quê na ficha.
 *
 * O jogador cuida do dia a dia do personagem (PV, contadores, notas, história) e
 * das escolhas que a progressão abre para ele. Tudo que define o poder do
 * personagem — níveis, atributos, perícias, itens, recursos, espaços de magia — é
 * do Mestre. O servidor aplica as mesmas regras; isto aqui só ajusta a tela.
 */
import { casterProfile } from "./progression";
import type { Sheet } from "./types";

export type SheetPermissions = {
  /** Nome do jogador/personagem, cor, foto, tendência. */
  identity: boolean;
  /** Classes, subclasses e níveis. */
  classes: boolean;
  abilityScores: boolean;
  skills: boolean;
  /** Itens do inventário e moedas. */
  inventory: boolean;
  /** Armas e as opções de combate (CA, iniciativa, deslocamento, proficiência). */
  combat: boolean;
  /** Criar/remover recursos e mudar o máximo deles. */
  resources: boolean;
  /** Criar/remover níveis de espaço e mudar o máximo. */
  spellSlots: boolean;
  /** Trocar as magias conhecidas/preparadas. */
  spells: boolean;
  /** Características e talentos (fora das decisões de progressão). */
  features: boolean;
  /** PV máximo. */
  hpMax: boolean;
  /** Proficiências e idiomas. */
  proficiencies: boolean;
};

const MASTER_ONLY: SheetPermissions = {
  identity: true,
  classes: true,
  abilityScores: true,
  skills: true,
  inventory: true,
  combat: true,
  resources: true,
  spellSlots: true,
  spells: true,
  features: true,
  hpMax: true,
  proficiencies: true,
};

/**
 * O jogador pode trocar as magias escolhidas? Conjuradores plenos, de pacto e
 * meio-conjuradores trocam magias ao subir de nível ou a cada descanso longo; as
 * subclasses de um terço (Trapaceiro Arcano, Cavaleiro Arcano) têm uma lista
 * fechada que o Mestre controla.
 */
export function canSwapSpells(sheet: Sheet): boolean {
  const profiles = sheet.classes
    .map((entry) => casterProfile(entry.name, entry.subclass))
    .filter((p): p is NonNullable<typeof p> => !!p);
  return profiles.length > 0 && profiles.some((p) => p.kind !== "third");
}

/** Permissões de edição da ficha para o papel com que ela foi destravada. */
export function sheetPermissions(isMaster: boolean, sheet: Sheet): SheetPermissions {
  if (isMaster) return MASTER_ONLY;
  return {
    identity: true,
    classes: false,
    abilityScores: false,
    skills: false,
    inventory: false,
    combat: false,
    resources: false,
    spellSlots: false,
    spells: canSwapSpells(sheet),
    features: false,
    hpMax: false,
    proficiencies: false,
  };
}
