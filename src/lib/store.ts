"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, DiceRoll } from "./types";
import { SEED_CHARACTERS } from "@/data/seed";
import { api } from "./api";

type Store = {
  characters: Record<string, Character>;
  rolls: DiceRoll[];
  // PIN guardado por device por personagem; usado para mandar nas requests
  pins: Record<string, string>;
  hydrated: boolean;
  realtimeReady: boolean;
  patchError: string | null;

  setLocalCharacter: (c: Character) => void;
  patchCharacter: (id: string, patch: Partial<Character>) => Promise<boolean>;
  unlock: (id: string, pin: string) => Promise<boolean>;
  lock: (id: string) => void;
  addRoll: (r: DiceRoll) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      characters: Object.fromEntries(SEED_CHARACTERS.map((c) => [c.id, c])),
      rolls: [],
      pins: {},
      hydrated: false,
      realtimeReady: false,
      patchError: null,

      setLocalCharacter: (c) =>
        set((s) => ({ characters: { ...s.characters, [c.id]: c } })),

      patchCharacter: async (id, patch) => {
        const pin = get().pins[id];
        // optimistic update
        const prev = get().characters[id];
        if (prev) {
          set((s) => ({ characters: { ...s.characters, [id]: { ...prev, ...patch } } }));
        }
        try {
          const { character } = await api.patchCharacter(id, patch, pin);
          set((s) => ({ characters: { ...s.characters, [id]: character }, patchError: null }));
          return true;
        } catch (e) {
          // rollback se falhou
          if (prev) {
            set((s) => ({ characters: { ...s.characters, [id]: prev } }));
          }
          set({ patchError: e instanceof Error ? e.message : String(e) });
          return false;
        }
      },

      unlock: async (id, pin) => {
        // tenta fazer um patch noop pra validar o PIN
        try {
          await api.patchCharacter(id, {}, pin);
          set((s) => ({ pins: { ...s.pins, [id]: pin } }));
          return true;
        } catch {
          return false;
        }
      },

      lock: (id) =>
        set((s) => {
          const next = { ...s.pins };
          delete next[id];
          return { pins: next };
        }),

      addRoll: async (r) => {
        set((s) => ({ rolls: [r, ...s.rolls].slice(0, 50) }));
        try {
          await api.postRoll(r);
        } catch {
          // se falhou, mantém local
        }
      },

      hydrate: async () => {
        if (get().hydrated) return;
        set({ hydrated: true });

        try {
          const [{ characters }, { rolls }] = await Promise.all([
            api.listCharacters(),
            api.listRolls(50),
          ]);
          const map: Record<string, Character> = {};
          for (const c of characters) map[c.id] = c;
          set({ characters: map, rolls });
        } catch {
          // offline: mantém o estado persistido / seed
        }

        connectSse(set, get);
      },
    }),
    {
      name: "app-dnd-store",
      partialize: (s) => ({
        pins: s.pins,
        // characters/rolls vem do servidor; persistimos só pins por device
      }),
    },
  ),
);

function connectSse(
  set: (partial: Partial<Store>) => void,
  get: () => Store,
) {
  if (typeof window === "undefined") return;
  let attempts = 0;

  const open = () => {
    let es: EventSource;
    try {
      es = new EventSource("/api/events");
    } catch {
      return;
    }
    es.addEventListener("hello", () => {
      set({ realtimeReady: true });
      attempts = 0;
    });
    es.addEventListener("character", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as {
          character: Character;
        };
        set({
          characters: { ...get().characters, [data.character.id]: data.character },
        });
      } catch {
        // ignore
      }
    });
    es.addEventListener("roll", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { roll: DiceRoll };
        const rolls = get().rolls;
        if (rolls.find((x) => x.id === data.roll.id)) return;
        set({ rolls: [data.roll, ...rolls].slice(0, 50) });
      } catch {
        // ignore
      }
    });
    es.onerror = () => {
      set({ realtimeReady: false });
      es.close();
      attempts++;
      const delay = Math.min(30_000, 1000 * 2 ** attempts);
      setTimeout(open, delay);
    };
  };
  open();
}

export const useCharacter = (id: string) => useStore((s) => s.characters[id]);

export const useUnlocked = (id: string) =>
  useStore((s) => {
    const c = s.characters[id];
    if (!c) return false;
    if (!c.pin) return true;
    return Boolean(s.pins[id]);
  });
