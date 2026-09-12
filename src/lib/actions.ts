/**
 * Monta a aba "Ações" da ficha: quantas ações/bônus/reações o personagem tem por
 * turno e tudo o que ele pode fazer com elas, já considerando características e
 * talentos que mudam a economia de turno (Ação Ardilosa, Surto de Ação, Ataque Extra…).
 */
import {
  ACTION_MODIFIERS,
  ACTION_SLOT_LABELS,
  ACTION_SLOT_ORDER,
  BASE_ACTIONS,
  type ActionOption,
  type ActionSlot,
} from "@/data/actionsCatalog";
import type { Sheet } from "./types";

function norm(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export type ActionEconomy = {
  /** Linhas do topo: "1 ação", "1 ação bônus"… */
  counts: { label: string; value: number }[];
  /** Quantos ataques cabem numa ação de Atacar. */
  attacksPerAction: number;
  /** Avisos e regras extras trazidas por características/talentos. */
  notes: string[];
  /** Opções agrupadas por momento do turno. */
  groups: { slot: ActionSlot; label: string; options: ActionOption[] }[];
};

/** Economia de turno do personagem, com as opções que as características dele abrem. */
export function actionEconomy(sheet: Sheet): ActionEconomy {
  const owned = sheet.features.map((f) => norm(f.name));
  let actions = 1;
  let reactions = 1;
  let attacksPerAction = 1;
  const notes: string[] = [];
  const extra: ActionOption[] = [];

  for (const modifier of ACTION_MODIFIERS) {
    const feature = sheet.features.find((_, i) => owned[i].startsWith(modifier.match));
    if (!feature) continue;
    actions += modifier.extraActions ?? 0;
    reactions += modifier.extraReactions ?? 0;
    if (modifier.attacksPerAction) attacksPerAction = Math.max(attacksPerAction, modifier.attacksPerAction);
    if (modifier.note) notes.push(modifier.note);
    for (const option of modifier.adds ?? []) extra.push({ ...option, source: feature.name });
  }

  // "Ataque Extra (2)"/"(3)" do Guerreiro: o número entre parênteses manda.
  for (const feature of sheet.features) {
    if (!norm(feature.name).startsWith("ataque extra")) continue;
    const count = /\((\d+)\)/.exec(feature.name)?.[1];
    if (count) attacksPerAction = Math.max(attacksPerAction, Number(count) + 1);
  }
  if (attacksPerAction > 1) {
    notes.unshift(`Ataque Extra: a ação de Atacar dá ${attacksPerAction} ataques.`);
  }

  const all = [...BASE_ACTIONS, ...extra];
  const groups = ACTION_SLOT_ORDER.map((slot) => ({
    slot,
    label: ACTION_SLOT_LABELS[slot],
    options: all.filter((option) => option.slot === slot),
  })).filter((group) => group.options.length > 0);

  return {
    counts: [
      { label: actions === 1 ? "ação" : "ações", value: actions },
      { label: "ação bônus", value: 1 },
      { label: reactions === 1 ? "reação" : "reações", value: reactions },
      { label: "movimento (por turno)", value: 1 },
    ],
    attacksPerAction,
    notes,
    groups,
  };
}
