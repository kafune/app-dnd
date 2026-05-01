import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Character, DiceRoll } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;
  _client = createClient(url!, anonKey!, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return _client;
}

// === Mapeadores DB <-> domínio ===

type CharacterRow = {
  id: string;
  player_name: string;
  character_name: string;
  pin: string | null;
  color: string | null;
  sheet: Character["sheet"];
  hp_current: number;
  hp_max: number;
  hp_temp: number;
  spell_slots: Character["spellSlots"];
  resources: Character["resources"];
  notes: string | null;
  updated_at: string;
};

export function rowToCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    playerName: row.player_name,
    characterName: row.character_name,
    pin: row.pin ?? undefined,
    color: row.color ?? undefined,
    sheet: row.sheet,
    hpCurrent: row.hp_current,
    hpMax: row.hp_max,
    hpTemp: row.hp_temp,
    spellSlots: row.spell_slots,
    resources: row.resources,
    notes: row.notes ?? "",
    updatedAt: row.updated_at,
  };
}

export function characterToRow(c: Character): CharacterRow {
  return {
    id: c.id,
    player_name: c.playerName,
    character_name: c.characterName,
    pin: c.pin ?? null,
    color: c.color ?? null,
    sheet: c.sheet,
    hp_current: c.hpCurrent,
    hp_max: c.hpMax,
    hp_temp: c.hpTemp,
    spell_slots: c.spellSlots,
    resources: c.resources,
    notes: c.notes ?? "",
    updated_at: c.updatedAt ?? new Date().toISOString(),
  };
}

type DiceRow = {
  id: string;
  character_id: string | null;
  character_name: string | null;
  label: string | null;
  expression: string | null;
  result: number | null;
  detail: DiceRoll["detail"] | null;
  created_at: string;
};

export function rowToRoll(row: DiceRow): DiceRoll {
  return {
    id: row.id,
    characterId: row.character_id,
    characterName: row.character_name ?? undefined,
    label: row.label ?? "",
    expression: row.expression ?? "",
    result: row.result ?? 0,
    detail: row.detail ?? { rolls: [], modifier: 0 },
    createdAt: row.created_at,
  };
}
