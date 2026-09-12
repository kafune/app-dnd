/**
 * "Lembretes": o que o jogador esquece na hora do combate.
 *
 * Varre as características da ficha atrás das frases que importam no meio da
 * sessão — resistências, imunidades, vantagens e desvantagens permanentes — e
 * junta a elas os avisos da armadura equipada e os números passivos da ficha.
 */
import { acWarnings } from "./armor";
import { abilityMod, formatMod, isInspiration, SKILL_TO_ABILITY, type Character } from "./types";

export type ReminderTone = "good" | "bad" | "info";

export type Reminder = {
  text: string;
  tone: ReminderTone;
  /** Característica/armadura de onde veio. */
  source?: string;
};

/** Frases que valem um lembrete, com o tom de cada uma. */
const PATTERNS: { re: RegExp; tone: ReminderTone }[] = [
  { re: /\bresist[êe]ncia\s+a\b/i, tone: "good" },
  { re: /\bimunidade\s+a\b|\bimune\s+a\b/i, tone: "good" },
  { re: /\bvulnerabilidade\s+a\b/i, tone: "bad" },
  { re: /\bdesvantagem\b/i, tone: "bad" },
  { re: /\bvantagem\b/i, tone: "good" },
  { re: /n[ãa]o pode ser (surpreendid|enfeiti[çc]ad|amedrontad|colocad|posto)/i, tone: "good" },
  { re: /n[ãa]o precisa (dormir|respirar|de comida)/i, tone: "good" },
  { re: /\bvis[ãa]o no escuro\b/i, tone: "info" },
];

/** Trechos genéricos demais para virar lembrete (condicionais de uso pontual). */
const SKIP = /\bse voc[êe] (gastar|usar|escolher)\b|uma vez por|ao terminar um descanso/i;

function sentences(text: string): string[] {
  return text
    .split(/\r?\n|(?<=[.;])\s+/)
    .map((s) => s.replace(/^[•\-\s]+/, "").trim())
    .filter((s) => s.length >= 12 && s.length <= 180);
}

function key(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Lembretes da ficha, do mais urgente (estado atual) ao mais estático (traços). */
export function remindersFor(character: Character): Reminder[] {
  const sheet = character.sheet;
  const out: Reminder[] = [];
  const seen = new Set<string>();
  const push = (reminder: Reminder) => {
    const k = key(reminder.text);
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(reminder);
  };

  // --- estado atual
  if (character.hpCurrent === 0) {
    push({ text: "Você está com 0 PV: role testes de resistência contra a morte no seu turno.", tone: "bad" });
  } else if (character.hpMax > 0 && character.hpCurrent <= character.hpMax / 4) {
    push({ text: `PV baixo: ${character.hpCurrent}/${character.hpMax}.`, tone: "bad" });
  }
  const inspiration = character.resources.find(isInspiration);
  if (inspiration && inspiration.current > 0) {
    push({
      text: `Você tem ${inspiration.current} de Inspiração — gaste para rolar com vantagem.`,
      tone: "good",
    });
  }

  // --- números passivos que ninguém lembra de calcular
  const perception = sheet.skills.find((s) => s.name === "Percepção");
  const wisMod = abilityMod(sheet.abilityScores[SKILL_TO_ABILITY["Percepção"]]);
  const passive =
    10 + wisMod + (perception?.proficient ? sheet.proficiencyBonus : 0) + (perception?.expert ? sheet.proficiencyBonus : 0);
  push({ text: `Percepção passiva ${passive}.`, tone: "info" });
  push({
    text: `Bônus de proficiência ${formatMod(sheet.proficiencyBonus)} · Iniciativa ${formatMod(
      sheet.initiativeBonus || abilityMod(sheet.abilityScores.dex),
    )} · Deslocamento ${sheet.speed} m.`,
    tone: "info",
  });

  // --- armadura equipada
  for (const warning of acWarnings(sheet)) push({ text: warning, tone: "bad", source: "Armadura" });

  // --- características e traços
  for (const feature of sheet.features) {
    for (const sentence of sentences(feature.description)) {
      if (SKIP.test(sentence)) continue;
      const hit = PATTERNS.find((p) => p.re.test(sentence));
      if (!hit) continue;
      push({ text: sentence, tone: hit.tone, source: feature.name });
    }
  }

  return out;
}
