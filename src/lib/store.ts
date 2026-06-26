"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, DiceRoll, Sheet } from "./types";
import { PUBLIC_CHARACTER_MAP, PUBLIC_CHARACTERS } from "@/data/publicCharacters";
import { api } from "./api";

export type AppToast = {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "danger";
};

type Store = {
  characters: Record<string, Character>;
  rolls: DiceRoll[];
  toasts: AppToast[];
  // PIN guardado por device por personagem; usado para mandar nas requests
  pins: Record<string, string>;
  hydrated: boolean;
  realtimeReady: boolean;
  patchError: string | null;
  editMode: boolean;

  setEditMode: (v: boolean) => void;
  setLocalCharacter: (c: Character) => void;
  createCharacter: (character: Character) => Promise<string>;
  patchCharacter: (id: string, patch: Partial<Character>) => Promise<boolean>;
  patchSheet: (id: string, partial: Partial<Sheet>) => Promise<boolean>;
  deleteCharacter: (id: string) => Promise<boolean>;
  unlock: (id: string, pin: string) => Promise<boolean>;
  lock: (id: string) => void;
  addRoll: (r: DiceRoll) => Promise<void>;
  clearRolls: (characterId?: string) => Promise<void>;
  pushToast: (toast: Omit<AppToast, "id">) => void;
  dismissToast: (id: string) => void;
  hydrate: () => Promise<void>;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      characters: Object.fromEntries(PUBLIC_CHARACTERS.map((c) => [c.id, c])),
      rolls: [],
      toasts: [],
      pins: {},
      hydrated: false,
      realtimeReady: false,
      patchError: null,
      editMode: false,

      setEditMode: (v) => set({ editMode: v }),

      setLocalCharacter: (c) =>
        set((s) => ({ characters: { ...s.characters, [c.id]: c } })),

      createCharacter: async (character) => {
        const { character: saved } = await api.createCharacter(character);
        set((s) => ({
          characters: { ...s.characters, [saved.id]: saved },
          // O criador já fica destravado com o PIN que digitou.
          pins: character.pin ? { ...s.pins, [saved.id]: character.pin } : s.pins,
        }));
        return saved.id;
      },

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

      deleteCharacter: async (id) => {
        const pin = get().pins[id];
        try {
          await api.deleteCharacter(id, pin);
          set((s) => {
            const characters = { ...s.characters };
            delete characters[id];
            const pins = { ...s.pins };
            delete pins[id];
            return {
              characters,
              pins,
              rolls: s.rolls.filter((r) => r.characterId !== id),
            };
          });
          return true;
        } catch (e) {
          get().pushToast({
            title: "Falha ao deletar a ficha",
            description: e instanceof Error ? e.message : undefined,
            tone: "danger",
          });
          return false;
        }
      },

      // Patch de campos do sheet (mescla com o sheet atual e envia via patchCharacter).
      patchSheet: async (id, partial) => {
        const c = get().characters[id];
        if (!c) return false;
        return get().patchCharacter(id, { sheet: { ...c.sheet, ...partial } });
      },

      unlock: async (id, pin) => {
        try {
          const { character } = await api.getCharacter(id, pin);
          set((s) => ({
            characters: { ...s.characters, [id]: character },
            pins: { ...s.pins, [id]: pin },
          }));
          return true;
        } catch {
          return false;
        }
      },

      lock: (id) =>
        set((s) => {
          const next = { ...s.pins };
          delete next[id];
          return {
            characters: {
              ...s.characters,
              ...(PUBLIC_CHARACTER_MAP[id] ? { [id]: PUBLIC_CHARACTER_MAP[id] } : {}),
            },
            pins: next,
          };
        }),

      addRoll: async (r) => {
        set((s) => ({ rolls: [r, ...s.rolls].slice(0, 50) }));
        try {
          await api.postRoll(r);
        } catch {
          // se falhou, mantém local
        }
      },

      clearRolls: async (characterId) => {
        const prev = get().rolls;
        // update otimista
        set({
          rolls: characterId ? prev.filter((r) => r.characterId !== characterId) : [],
        });
        try {
          await api.clearRolls(characterId);
        } catch (e) {
          set({ rolls: prev }); // rollback
          get().pushToast({
            title: "Falha ao limpar o histórico",
            description: e instanceof Error ? e.message : undefined,
            tone: "danger",
          });
        }
      },

      pushToast: (toast) =>
        set((s) => ({
          toasts: [
            { ...toast, id: cryptoRandomId() },
            ...s.toasts,
          ].slice(0, 4),
        })),

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) })),

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
          for (const [id, pin] of Object.entries(get().pins)) {
            try {
              const { character } = await api.getCharacter(id, pin);
              map[id] = character;
            } catch {
              // PIN removido/alterado no servidor: mantém só o resumo público.
            }
          }
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
        const previous = get().characters[data.character.id];
        set({
          characters: { ...get().characters, [data.character.id]: data.character },
        });
        const pin = get().pins[data.character.id];
        if (pin) {
          void api
            .getCharacter(data.character.id, pin)
            .then(({ character }) =>
              set({
                characters: { ...get().characters, [character.id]: character },
              }),
            )
            .catch(() => {
              // Se o PIN não servir mais, rebaixa para o resumo público recebido.
            });
        }
        if (previous && previous.updatedAt !== data.character.updatedAt) {
          get().pushToast({
            title: `${data.character.characterName} foi atualizado`,
            description: "Ficha sincronizada em tempo real.",
          });
        }
      } catch {
        // ignore
      }
    });
    es.addEventListener("character-deleted", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { id: string };
        const characters = { ...get().characters };
        if (!(data.id in characters)) return;
        delete characters[data.id];
        set({ characters });
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
        get().pushToast({
          title: `${data.roll.characterName ?? "Alguém"} rolou ${data.roll.label}`,
          description: `${data.roll.expression} = ${data.roll.result}`,
          tone: data.roll.detail.crit
            ? "success"
            : data.roll.detail.fumble
              ? "danger"
              : "default",
        });
      } catch {
        // ignore
      }
    });
    es.addEventListener("rolls-cleared", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { characterId: string | null };
        const rolls = get().rolls;
        set({
          rolls: data.characterId
            ? rolls.filter((r) => r.characterId !== data.characterId)
            : [],
        });
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

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useCharacter = (id: string) => useStore((s) => s.characters[id]);

export const useUnlocked = (id: string) =>
  useStore((s) => {
    const c = s.characters[id];
    if (!c) return false;
    if (!c.protected) return true;
    return Boolean(s.pins[id]);
  });
