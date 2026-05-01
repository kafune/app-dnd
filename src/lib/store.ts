"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, DiceRoll } from "./types";
import { SEED_CHARACTERS } from "@/data/seed";
import {
  characterToRow,
  getSupabase,
  isSupabaseConfigured,
  rowToCharacter,
  rowToRoll,
} from "./supabase";

type Store = {
  characters: Record<string, Character>;
  rolls: DiceRoll[];
  unlocked: Record<string, boolean>; // ids destravados pra edição neste device
  hydrated: boolean;
  realtimeReady: boolean;

  // ações
  setCharacter: (c: Character) => Promise<void>;
  patchCharacter: (id: string, patch: Partial<Character>) => Promise<void>;
  unlock: (id: string, pin: string) => boolean;
  lock: (id: string) => void;
  addRoll: (r: DiceRoll) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      characters: Object.fromEntries(SEED_CHARACTERS.map((c) => [c.id, c])),
      rolls: [],
      unlocked: {},
      hydrated: false,
      realtimeReady: false,

      setCharacter: async (c) => {
        set((s) => ({ characters: { ...s.characters, [c.id]: c } }));
        const sb = getSupabase();
        if (sb) {
          await sb.from("characters").upsert(characterToRow(c));
        }
      },

      patchCharacter: async (id, patch) => {
        const current = get().characters[id];
        if (!current) return;
        const next: Character = { ...current, ...patch, updatedAt: new Date().toISOString() };
        await get().setCharacter(next);
      },

      unlock: (id, pin) => {
        const c = get().characters[id];
        if (!c) return false;
        // sem pin definido: livre.
        if (!c.pin) {
          set((s) => ({ unlocked: { ...s.unlocked, [id]: true } }));
          return true;
        }
        if (c.pin === pin) {
          set((s) => ({ unlocked: { ...s.unlocked, [id]: true } }));
          return true;
        }
        return false;
      },

      lock: (id) => set((s) => ({ unlocked: { ...s.unlocked, [id]: false } })),

      addRoll: async (r) => {
        set((s) => ({ rolls: [r, ...s.rolls].slice(0, 50) }));
        const sb = getSupabase();
        if (sb) {
          await sb.from("dice_rolls").insert({
            id: r.id,
            character_id: r.characterId,
            character_name: r.characterName ?? null,
            label: r.label,
            expression: r.expression,
            result: r.result,
            detail: r.detail,
            created_at: r.createdAt,
          });
        }
      },

      hydrate: async () => {
        if (get().hydrated) return;
        set({ hydrated: true });

        const sb = getSupabase();
        if (!sb) return;

        // Seed se a tabela estiver vazia
        const { data: existing, error } = await sb.from("characters").select("id").limit(1);
        if (!error && (existing ?? []).length === 0) {
          await sb.from("characters").upsert(SEED_CHARACTERS.map(characterToRow));
        }

        // Pull characters
        const { data: rows } = await sb.from("characters").select("*");
        if (rows) {
          const map: Record<string, Character> = {};
          for (const row of rows) map[row.id] = rowToCharacter(row);
          set({ characters: map });
        }

        // Pull rolls
        const { data: rollRows } = await sb
          .from("dice_rolls")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (rollRows) {
          set({ rolls: rollRows.map(rowToRoll) });
        }

        // Realtime
        sb.channel("characters-rt")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "characters" },
            (payload) => {
              if (payload.eventType === "DELETE") {
                set((s) => {
                  const next = { ...s.characters };
                  delete next[(payload.old as { id: string }).id];
                  return { characters: next };
                });
              } else {
                const c = rowToCharacter(payload.new as Parameters<typeof rowToCharacter>[0]);
                set((s) => ({ characters: { ...s.characters, [c.id]: c } }));
              }
            },
          )
          .subscribe();

        sb.channel("dice-rt")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "dice_rolls" },
            (payload) => {
              const r = rowToRoll(payload.new as Parameters<typeof rowToRoll>[0]);
              set((s) => {
                if (s.rolls.find((x) => x.id === r.id)) return s;
                return { rolls: [r, ...s.rolls].slice(0, 50) };
              });
            },
          )
          .subscribe();

        set({ realtimeReady: true });
      },
    }),
    {
      name: "app-dnd-store",
      partialize: (s) => ({
        characters: s.characters,
        unlocked: s.unlocked,
        rolls: s.rolls.slice(0, 20),
      }),
    },
  ),
);

export const useCharacter = (id: string) => useStore((s) => s.characters[id]);

export const useUnlocked = (id: string) =>
  useStore((s) => {
    const c = s.characters[id];
    if (c && !c.pin) return true;
    return Boolean(s.unlocked[id]);
  });

export { isSupabaseConfigured };
