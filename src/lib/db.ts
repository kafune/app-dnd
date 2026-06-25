import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Character, DiceRoll } from "./types";
import { SEED_CHARACTERS } from "@/data/seed";
import { PUBLIC_CHARACTER_MAP } from "@/data/publicCharacters";
import { CHARACTER_PINS } from "./characterPins";

/**
 * Valida o PIN de uma ficha. Fichas seed têm PIN no mapa fixo (CHARACTER_PINS);
 * fichas criadas pelo usuário guardam o PIN no próprio registro (campo `pin`).
 * Sem PIN definido => ficha aberta (qualquer um edita).
 */
function characterPinOk(stored: Character, pin: string | undefined): boolean {
  const expected = CHARACTER_PINS[stored.id] ?? stored.pin;
  if (!expected) return true;
  return expected === pin?.trim();
}

const DB_PATH = process.env.APP_DND_DB || "./data/app-dnd.sqlite";

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rolls (
      id TEXT PRIMARY KEY,
      character_id TEXT,
      character_name TEXT,
      label TEXT,
      expression TEXT,
      result INTEGER,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS rolls_created_idx ON rolls (created_at DESC);
  `);

  // Seed se vazio
  const count = db.prepare("SELECT COUNT(*) as n FROM characters").get() as { n: number };
  if (count.n === 0) {
    const insert = db.prepare(
      "INSERT INTO characters (id, data, updated_at) VALUES (?, ?, datetime('now'))",
    );
    const tx = db.transaction((rows: Character[]) => {
      for (const c of rows) insert.run(c.id, JSON.stringify(c));
    });
    tx(SEED_CHARACTERS);
  }

  _db = db;
  return db;
}

// === Characters ===

export function listCharacters(): Character[] {
  const rows = getDb().prepare("SELECT data FROM characters ORDER BY id").all() as {
    data: string;
  }[];
  return rows.map((r) => toPublicCharacter(JSON.parse(r.data) as Character));
}

function getStoredCharacter(id: string): Character | null {
  const row = getDb().prepare("SELECT data FROM characters WHERE id = ?").get(id) as
    | { data: string }
    | undefined;
  return row ? (JSON.parse(row.data) as Character) : null;
}

export function getCharacter(
  id: string,
  pin?: string,
): { ok: true; character: Character } | { ok: false; reason: "not_found" | "bad_pin" } {
  const character = getStoredCharacter(id);
  if (!character) return { ok: false, reason: "not_found" };
  if (!characterPinOk(character, pin)) return { ok: false, reason: "bad_pin" };
  return { ok: true, character: toAuthorizedCharacter(character) };
}

export function characterExists(id: string): boolean {
  const row = getDb().prepare("SELECT 1 FROM characters WHERE id = ?").get(id);
  return Boolean(row);
}

export function upsertCharacter(c: Character): Character {
  const next: Character = { ...c, updatedAt: new Date().toISOString() };
  getDb()
    .prepare(
      `INSERT INTO characters (id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    )
    .run(next.id, JSON.stringify(next), next.updatedAt);
  return next;
}

export function patchCharacter(
  id: string,
  patch: Partial<Character>,
  pin?: string,
): { ok: true; character: Character } | { ok: false; reason: "not_found" | "bad_pin" } {
  const db = getDb();
  return db.transaction(() => {
    const current = getStoredCharacter(id);
    if (!current) return { ok: false as const, reason: "not_found" as const };
    if (!characterPinOk(current, pin)) {
      return { ok: false as const, reason: "bad_pin" as const };
    }
    const next: Character = {
      ...current,
      ...patch,
      id: current.id,
      pin: current.pin,
      protected: true,
      updatedAt: new Date().toISOString(),
    };
    db.prepare(
      "UPDATE characters SET data = ?, updated_at = ? WHERE id = ?",
    ).run(JSON.stringify(next), next.updatedAt!, id);
    return { ok: true as const, character: toAuthorizedCharacter(next) };
  })();
}

export function toPublicCharacter(character: Character): Character {
  const fallback = PUBLIC_CHARACTER_MAP[character.id];
  // Fichas seed têm resumo curado; fichas novas recebem um resumo mascarado
  // (só identidade + espécie/classes p/ o card) para nunca vazar `pin`/sheet.
  const base = fallback ?? maskedPublic(character);
  return {
    ...base,
    playerName: character.playerName,
    characterName: character.characterName,
    color: character.color,
    protected: true,
    updatedAt: character.updatedAt,
  };
}

/** Resumo público mínimo de uma ficha sem entrada curada (sem `pin`, sem sheet completo). */
function maskedPublic(c: Character): Character {
  return {
    id: c.id,
    playerName: c.playerName,
    characterName: c.characterName,
    color: c.color,
    protected: true,
    updatedAt: c.updatedAt,
    hpCurrent: 0,
    hpMax: 0,
    hpTemp: 0,
    spellSlots: {},
    resources: [],
    sheet: {
      species: c.sheet.species,
      classes: c.sheet.classes,
      background: "",
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      saves: [],
      skills: [],
      proficiencies: [],
      languages: [],
      ac: 0,
      speed: 0,
      initiativeBonus: 0,
      proficiencyBonus: 0,
      weapons: [],
      features: [],
      spells: { saveDC: 0, attackMod: 0, castingAbility: "int", cantrips: [], known: [] },
      inventory: { coins: { gp: 0, sp: 0, cp: 0 }, items: [] },
      appearance: { size: "", height: "" },
      personality: { trait: "", ideal: "", flaw: "", why: "", backstory: "" },
    },
  };
}

function toAuthorizedCharacter(character: Character): Character {
  const safeCharacter = { ...character };
  delete safeCharacter.pin;
  return {
    ...safeCharacter,
    protected: true,
  };
}

// === Rolls ===

export function listRolls(limit = 50): DiceRoll[] {
  const rows = getDb()
    .prepare(
      "SELECT id, character_id, character_name, label, expression, result, detail, created_at FROM rolls ORDER BY created_at DESC LIMIT ?",
    )
    .all(limit) as {
    id: string;
    character_id: string | null;
    character_name: string | null;
    label: string;
    expression: string;
    result: number;
    detail: string;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    characterId: r.character_id,
    characterName: r.character_name ?? undefined,
    label: r.label,
    expression: r.expression,
    result: r.result,
    detail: JSON.parse(r.detail) as DiceRoll["detail"],
    createdAt: r.created_at,
  }));
}

export function insertRoll(r: DiceRoll): DiceRoll {
  getDb()
    .prepare(
      `INSERT INTO rolls (id, character_id, character_name, label, expression, result, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      r.id,
      r.characterId,
      r.characterName ?? null,
      r.label,
      r.expression,
      r.result,
      JSON.stringify(r.detail),
      r.createdAt,
    );

  // Mantém só os 200 mais recentes
  getDb().exec(
    "DELETE FROM rolls WHERE id NOT IN (SELECT id FROM rolls ORDER BY created_at DESC LIMIT 200)",
  );

  return r;
}
