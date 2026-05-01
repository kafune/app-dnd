import type { DiceRoll } from "./types";

export type RollOptions = {
  advantage?: boolean;
  disadvantage?: boolean;
  label?: string;
  characterId?: string | null;
  characterName?: string;
};

export type ParsedExpr = {
  count: number;
  sides: number;
  modifier: number;
};

export function parseExpression(expr: string): ParsedExpr {
  const cleaned = expr.replace(/\s+/g, "").toLowerCase();
  const m = cleaned.match(/^(\d+)?d(\d+)([+-]\d+)?$/);
  if (!m) throw new Error(`Expressão inválida: ${expr}`);
  const count = Number(m[1] ?? "1");
  const sides = Number(m[2]);
  const modifier = m[3] ? Number(m[3]) : 0;
  if (count < 1 || sides < 2) throw new Error(`Dados inválidos: ${expr}`);
  return { count, sides, modifier };
}

const rollOne = (sides: number) => Math.floor(Math.random() * sides) + 1;

export function roll(expr: string, opts: RollOptions = {}): DiceRoll {
  const { count, sides, modifier } = parseExpression(expr);
  const isD20 = sides === 20 && count === 1;

  let rolls: number[];
  let discarded: number | undefined;
  let crit: boolean | undefined;
  let fumble: boolean | undefined;

  if (isD20 && (opts.advantage || opts.disadvantage)) {
    const a = rollOne(20);
    const b = rollOne(20);
    const chosen = opts.advantage ? Math.max(a, b) : Math.min(a, b);
    discarded = a === chosen ? b : a;
    rolls = [chosen];
  } else {
    rolls = Array.from({ length: count }, () => rollOne(sides));
  }

  if (isD20) {
    if (rolls[0] === 20) crit = true;
    if (rolls[0] === 1) fumble = true;
  }

  const total = rolls.reduce((a, b) => a + b, 0) + modifier;

  let prefix = `${count}d${sides}`;
  if (modifier !== 0) prefix += modifier > 0 ? `+${modifier}` : `${modifier}`;
  if (opts.advantage) prefix += " (vantagem)";
  if (opts.disadvantage) prefix += " (desvantagem)";

  return {
    id: cryptoRandomId(),
    characterId: opts.characterId ?? null,
    characterName: opts.characterName,
    label: opts.label ?? prefix,
    expression: prefix,
    result: total,
    detail: {
      rolls,
      modifier,
      advantage: opts.advantage,
      disadvantage: opts.disadvantage,
      crit,
      fumble,
      discarded,
    },
    createdAt: new Date().toISOString(),
  };
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const formatRollDetail = (r: DiceRoll): string => {
  const { rolls, modifier, discarded, crit, fumble } = r.detail;
  let s = `[${rolls.join(", ")}]`;
  if (discarded !== undefined) s += ` (desc: ${discarded})`;
  if (modifier !== 0) s += ` ${modifier > 0 ? "+" : ""}${modifier}`;
  if (crit) s += " 💥CRIT";
  if (fumble) s += " ☠️FUMBLE";
  return s;
};
