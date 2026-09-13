/**
 * "Lembretes": o que o jogador esquece na hora do combate.
 *
 * O lembrete só serve se disser QUANDO o efeito vale. A versão antiga recortava
 * frases soltas das descrições e, com isso, transformava efeito ligado em efeito
 * permanente — a ficha do Shade dizia "tem resistência a concussão, cortante e
 * perfurante" sem contar que isso só existe com a Carne Fantasmagórica ativa, e a
 * de clérigo anunciava os bônus de Canalizar Divindade como se estivessem sempre
 * de pé.
 *
 * Agora cada lembrete carrega uma condição (`when`): `null` = vale o tempo todo;
 * texto = a condição que liga o efeito; string vazia = a própria frase já diz a
 * condição. Os textos das características que importam em combate são escritos à
 * mão em `@/data/remindersCatalog`; o que não estiver lá continua saindo da
 * varredura das descrições, mas agora a varredura detecta quando a característica
 * precisa ser ligada e marca o lembrete como condicional em vez de permanente.
 */
import { acWarnings } from "./armor";
import {
  DRACONIC_DAMAGE,
  REMINDER_IGNORE,
  REMINDER_RULES,
  type ReminderRule,
  type ReminderTone,
} from "@/data/remindersCatalog";
import { abilityMod, formatMod, isInspiration, SKILL_TO_ABILITY, type Character, type Feature } from "./types";

export type { ReminderTone };

export type Reminder = {
  text: string;
  tone: ReminderTone;
  /** Característica/armadura de onde veio. */
  source?: string;
  /** Condição que liga o efeito. `null` = vale o tempo todo; "" = a frase já diz. */
  when: string | null;
};

/** O lembrete vale o tempo todo? */
export const isAlways = (reminder: Reminder) => reminder.when === null;

function norm(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** "Ancestral Dracônico (Vermelho)" -> "ancestral draconico". */
function baseName(name: string): string {
  return norm(name.replace(/\s*\([^)]*\)\s*$/, ""));
}

/** "Ancestral Dracônico (Vermelho)" -> "Vermelho". */
function choiceOf(name: string): string {
  return /\(([^)]*)\)\s*$/.exec(name)?.[1]?.trim() ?? "";
}

const EXACT_RULES = new Map<string, ReminderRule[]>();
const PREFIX_RULES: ReminderRule[] = [];
for (const rule of REMINDER_RULES) {
  const key = norm(rule.feature);
  if (rule.prefix) PREFIX_RULES.push(rule);
  const list = EXACT_RULES.get(key);
  if (list) list.push(rule);
  else EXACT_RULES.set(key, [rule]);
}
const IGNORED = new Set(REMINDER_IGNORE.map(norm));

/** As regras escritas à mão para uma característica (vazio = cai na varredura). */
function rulesFor(featureName: string): ReminderRule[] {
  const base = baseName(featureName);
  const exact = EXACT_RULES.get(base);
  if (exact) return exact;
  return PREFIX_RULES.filter((rule) => base.startsWith(norm(rule.feature)));
}

// --- varredura das descrições (o que não tem texto escrito à mão)

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

/** Trechos que não viram lembrete: tabelas, blocos de criatura e notas sobre o inimigo. */
const SKIP: RegExp[] = [
  /\bse voc[êe] (gastar|usar|escolher)\b/i,
  /uma vez por|ao terminar um descanso/i,
  /^\s*\d+\s*[–—-]\s*\d+\s*:/, // linhas de tabela (Surto de Magia Selvagem)
  /percep[çc][ãa]o passiva\s*\d/i, // bloco de criatura invocada
  // rótulos de ficha de criatura: "Imunidade a dano: fogo.", "Sentidos: visão no escuro 18 m"
  /^(imunidades?|sentidos|resist[êe]ncias?|condi[çc][õo]es|deslocamento|pontos de vida)\b[^.:]{0,24}:/i,
  /\b[ée] imune a (esse|essa|este|esta|isso)\b/i,
];

/** A frase já explica sozinha quando o efeito vale? */
const SELF_CONDITION =
  /\benquanto\b|\bquando\b|\bsempre que\b|\bdurante\b|\bnessa forma\b|\bnesse estado\b|\bdesde que\b|\bse (voc[êe]|estiver|ele|ela|o alvo|a criatura|n[ãa]o)\b|\bat[ée] o (fim|final|in[íi]cio)\b|\bpor 1 minuto\b/i;

/** A característica precisa ser ligada (ação, reação, transformação, duração)? */
const ACTIVATION =
  /\b(como uma a[çc][ãa]o|com uma a[çc][ãa]o|usar sua a[çc][ãa]o|usar sua rea[çc][ãa]o|a[çc][ãa]o b[ôo]nus|voc[êe] pode (usar|entrar|assumir|gastar|invocar|se transformar)|por 1 minuto|dura \d+ (minuto|rodada|hora)|enquanto durar|durante esse tempo|at[ée] voc[êe] (emergir|encerr))/i;

function sentences(text: string): string[] {
  return text
    .split(/\r?\n|(?<=[.;])\s+/)
    .map((s) => s.replace(/^[•\-\s]+/, "").trim())
    .filter((s) => s.length >= 12 && s.length <= 180);
}

/** Lembretes tirados da descrição de uma característica sem texto escrito à mão. */
function scanFeature(feature: Feature): Reminder[] {
  const activated = ACTIVATION.test(feature.description);
  // "Canalização Divina (1/curto)" -> "Canalização Divina" no rótulo da condição.
  const plainName = feature.name.replace(/\s*\([^)]*\)\s*$/, "");
  const out: Reminder[] = [];
  for (const sentence of sentences(feature.description)) {
    if (SKIP.some((re) => re.test(sentence))) continue;
    const hit = PATTERNS.find((p) => p.re.test(sentence));
    if (!hit) continue;
    // A frase que já carrega a condição fica como está; a que parece permanente
    // só é anunciada como permanente se a característica não precisar ser ligada.
    const when = SELF_CONDITION.test(sentence) ? "" : activated ? `só com ${plainName} em uso` : null;
    out.push({ text: sentence, tone: hit.tone, source: feature.name, when });
  }
  return out;
}

function key(text: string): string {
  return norm(text).replace(/[^a-z0-9]+/g, " ").trim();
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
    push({ text: "Você está com 0 PV: role testes de resistência contra a morte no seu turno.", tone: "bad", when: null });
  } else if (character.hpMax > 0 && character.hpCurrent <= character.hpMax / 4) {
    push({ text: `PV baixo: ${character.hpCurrent}/${character.hpMax}.`, tone: "bad", when: null });
  }
  const inspiration = character.resources.find(isInspiration);
  if (inspiration && inspiration.current > 0) {
    push({
      text: `Você tem ${inspiration.current} de Inspiração — gaste para rolar com vantagem.`,
      tone: "good",
      when: null,
    });
  }

  // --- números passivos que ninguém lembra de calcular
  const perception = sheet.skills.find((s) => s.name === "Percepção");
  const wisMod = abilityMod(sheet.abilityScores[SKILL_TO_ABILITY["Percepção"]]);
  const passive =
    10 + wisMod + (perception?.proficient ? sheet.proficiencyBonus : 0) + (perception?.expert ? sheet.proficiencyBonus : 0);
  push({ text: `Percepção passiva ${passive}.`, tone: "info", when: null });
  push({
    text: `Bônus de proficiência ${formatMod(sheet.proficiencyBonus)} · Iniciativa ${formatMod(
      sheet.initiativeBonus || abilityMod(sheet.abilityScores.dex),
    )} · Deslocamento ${sheet.speed} m.`,
    tone: "info",
    when: null,
  });

  // --- armadura equipada
  for (const warning of acWarnings(sheet)) push({ text: warning, tone: "bad", source: "Armadura", when: null });

  // --- características e traços
  for (const feature of sheet.features) {
    const base = baseName(feature.name);
    // Ancestral Dracônico: a resistência depende do dragão que o jogador escolheu.
    if (base === "ancestral draconico") {
      const damage = DRACONIC_DAMAGE[norm(choiceOf(feature.name))];
      push({
        text: damage
          ? `Resistência a dano ${damage} (ancestral ${choiceOf(feature.name).toLowerCase()}).`
          : "Resistência ao tipo de dano do seu ancestral dracônico — escolha o dragão na ficha.",
        tone: "good",
        source: feature.name,
        when: null,
      });
      continue;
    }
    const rules = rulesFor(feature.name);
    if (rules.length > 0) {
      for (const rule of rules) push({ text: rule.text, tone: rule.tone, source: feature.name, when: rule.when });
      continue;
    }
    if (IGNORED.has(base)) continue;
    for (const reminder of scanFeature(feature)) push(reminder);
  }

  // Permanentes primeiro: é o que vale enquanto ninguém liga nada.
  return [...out.filter(isAlways), ...out.filter((reminder) => !isAlways(reminder))];
}
