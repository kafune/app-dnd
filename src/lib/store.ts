import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, DiceRoll, HomebrewItem, HomebrewKind, Sheet } from "./types";
import { PUBLIC_CHARACTER_MAP, PUBLIC_CHARACTERS } from "@/data/publicCharacters";
import { setHomebrewItems } from "@/data/homebrewRegistry";
import { api, ApiError, errorMessage, type AccessRole } from "./api";

export type AppToast = {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "danger";
};

export type HomebrewSaveResult = { ok: true; item: HomebrewItem } | { ok: false; error: string };

type Store = {
  characters: Record<string, Character>;
  rolls: DiceRoll[];
  toasts: AppToast[];
  // PIN guardado por device por personagem; usado para mandar nas requests
  pins: Record<string, string>;
  /** Papel com que cada ficha foi destravada neste aparelho (mestre × jogador). */
  roles: Record<string, AccessRole>;
  /** Chave mestra validada neste aparelho (libera a página do Mestre / homebrew). */
  masterPin: string | null;
  /** Raças, talentos e traços homebrew do Mestre. */
  homebrew: HomebrewItem[];
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
  uploadAvatar: (id: string, image: Blob) => Promise<boolean>;
  removeAvatar: (id: string) => Promise<boolean>;
  unlock: (id: string, pin: string) => Promise<boolean>;
  lock: (id: string) => void;
  unlockMaster: (pin: string) => Promise<boolean>;
  lockMaster: () => void;
  saveHomebrew: (kind: HomebrewKind, data: HomebrewItem["data"], id?: string) => Promise<HomebrewSaveResult>;
  deleteHomebrew: (id: string) => Promise<boolean>;
  addRoll: (r: DiceRoll) => Promise<void>;
  /** `actorId`: de quem é o PIN usado para autorizar (default: `characterId`). */
  clearRolls: (characterId?: string, actorId?: string) => Promise<void>;
  pushToast: (toast: Omit<AppToast, "id">) => void;
  dismissToast: (id: string) => void;
  hydrate: () => Promise<void>;
};

/**
 * Fichas apagadas nesta aba. Respostas e eventos que chegam atrasados (um PATCH em
 * voo, um GET disparado por SSE) não podem ressuscitar a ficha na tela — era isso
 * que fazia a ficha "voltar" depois de deletada.
 */
const deletedIds = new Set<string>();

function sortHomebrew(items: HomebrewItem[]): HomebrewItem[] {
  return [...items].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.data.name.localeCompare(b.data.name, "pt-BR"),
  );
}

function withoutCharacter(s: Store, id: string): Partial<Store> {
  const characters = { ...s.characters };
  delete characters[id];
  const pins = { ...s.pins };
  delete pins[id];
  const roles = { ...s.roles };
  delete roles[id];
  return { characters, pins, roles, rolls: s.rolls.filter((r) => r.characterId !== id) };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      /** Atualiza o registro de catálogo ANTES do estado, para o re-render já enxergar o homebrew novo. */
      const applyHomebrew = (items: HomebrewItem[]) => {
        const sorted = sortHomebrew(items);
        setHomebrewItems(sorted);
        set({ homebrew: sorted });
      };

      /** Guarda a ficha completa devolvida pelo servidor (se não foi apagada nesse meio-tempo). */
      const storeAuthorized = (id: string, character: Character, role?: AccessRole) => {
        if (deletedIds.has(id)) return;
        set((s) => ({
          characters: { ...s.characters, [id]: character },
          roles: role ? { ...s.roles, [id]: role } : s.roles,
          patchError: null,
        }));
      };

      return {
        characters: Object.fromEntries(PUBLIC_CHARACTERS.map((c) => [c.id, c])),
        rolls: [],
        toasts: [],
        pins: {},
        roles: {},
        masterPin: null,
        homebrew: [],
        hydrated: false,
        realtimeReady: false,
        patchError: null,
        editMode: false,

        setEditMode: (v) => set({ editMode: v }),

        setLocalCharacter: (c) => set((s) => ({ characters: { ...s.characters, [c.id]: c } })),

        createCharacter: async (character) => {
          const { character: saved, role } = await api.createCharacter(character);
          set((s) => ({
            characters: { ...s.characters, [saved.id]: saved },
            // O criador já fica destravado com o PIN que digitou.
            pins: character.pin ? { ...s.pins, [saved.id]: character.pin } : s.pins,
            roles: character.pin ? { ...s.roles, [saved.id]: role ?? "jogador" } : s.roles,
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
            const { character, role } = await api.patchCharacter(id, patch, pin);
            storeAuthorized(id, character, role);
            return !deletedIds.has(id);
          } catch (e) {
            if (e instanceof ApiError && e.status === 404) {
              // Apagada em outro aparelho: tira da tela em vez de restaurar.
              deletedIds.add(id);
              set((s) => withoutCharacter(s, id));
              return false;
            }
            // rollback se falhou
            if (prev && !deletedIds.has(id)) {
              set((s) => ({ characters: { ...s.characters, [id]: prev } }));
            }
            set({ patchError: errorMessage(e) });
            return false;
          }
        },

        deleteCharacter: async (id) => {
          const pin = get().pins[id];
          try {
            await api.deleteCharacter(id, pin);
          } catch (e) {
            // 404 = já foi apagada (por outro aparelho): só limpa a tela.
            if (!(e instanceof ApiError && e.status === 404)) {
              get().pushToast({
                title: "Falha ao deletar a ficha",
                description: errorMessage(e),
                tone: "danger",
              });
              return false;
            }
          }
          deletedIds.add(id);
          set((s) => withoutCharacter(s, id));
          return true;
        },

        uploadAvatar: async (id, image) => {
          try {
            const { character, role } = await api.uploadAvatar(id, image, get().pins[id]);
            storeAuthorized(id, character, role);
            return true;
          } catch (e) {
            get().pushToast({ title: "Não foi possível salvar a foto", description: errorMessage(e), tone: "danger" });
            return false;
          }
        },

        removeAvatar: async (id) => {
          try {
            const { character, role } = await api.removeAvatar(id, get().pins[id]);
            storeAuthorized(id, character, role);
            return true;
          } catch (e) {
            get().pushToast({ title: "Não foi possível remover a foto", description: errorMessage(e), tone: "danger" });
            return false;
          }
        },

        // Patch de campos do sheet (mescla com o sheet atual e envia via patchCharacter).
        patchSheet: async (id, partial) => {
          const c = get().characters[id];
          if (!c) return false;
          return get().patchCharacter(id, { sheet: { ...c.sheet, ...partial } });
        },

        unlock: async (id, rawPin) => {
          const pin = rawPin.trim();
          try {
            const { character, role } = await api.getCharacter(id, pin);
            set((s) => ({
              characters: { ...s.characters, [id]: character },
              pins: { ...s.pins, [id]: pin },
              roles: { ...s.roles, [id]: role ?? "jogador" },
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
            const roles = { ...s.roles };
            delete roles[id];
            return {
              characters: {
                ...s.characters,
                ...(PUBLIC_CHARACTER_MAP[id] ? { [id]: PUBLIC_CHARACTER_MAP[id] } : {}),
              },
              pins: next,
              roles,
            };
          }),

        unlockMaster: async (rawPin) => {
          const pin = rawPin.trim();
          try {
            await api.checkMaster(pin);
            set({ masterPin: pin });
            return true;
          } catch {
            return false;
          }
        },

        lockMaster: () => set({ masterPin: null }),

        saveHomebrew: async (kind, data, id) => {
          const pin = get().masterPin;
          if (!pin) return { ok: false, error: "Entre com a chave mestra primeiro." };
          try {
            const { item } = id ? await api.updateHomebrew(id, data, pin) : await api.createHomebrew(kind, data, pin);
            applyHomebrew([...get().homebrew.filter((entry) => entry.id !== item.id), item]);
            return { ok: true, item };
          } catch (e) {
            if (e instanceof ApiError && e.code === "bad_pin") set({ masterPin: null });
            return { ok: false, error: errorMessage(e) };
          }
        },

        deleteHomebrew: async (id) => {
          const pin = get().masterPin;
          if (!pin) return false;
          try {
            await api.deleteHomebrew(id, pin);
          } catch (e) {
            if (!(e instanceof ApiError && e.status === 404)) {
              get().pushToast({ title: "Falha ao apagar o homebrew", description: errorMessage(e), tone: "danger" });
              return false;
            }
          }
          applyHomebrew(get().homebrew.filter((entry) => entry.id !== id));
          return true;
        },

        addRoll: async (r) => {
          const pin = r.characterId ? get().pins[r.characterId] : undefined;
          set((s) => ({ rolls: [r, ...s.rolls].slice(0, 50) }));
          try {
            await api.postRoll(r, pin);
          } catch {
            // Não chegou na mesa (PIN recusado ou sem rede): tira da tela em vez de
            // deixar uma rolagem que só existe aqui e some no próximo carregamento.
            set((s) => ({ rolls: s.rolls.filter((x) => x.id !== r.id) }));
            get().pushToast({
              title: "A rolagem não foi para a mesa",
              description: "Sem conexão ou PIN recusado — nada foi registrado.",
              tone: "danger",
            });
          }
        },

        clearRolls: async (characterId, actorId) => {
          const pin = get().pins[actorId ?? characterId ?? ""];
          const prev = get().rolls;
          // update otimista
          set({
            rolls: characterId ? prev.filter((r) => r.characterId !== characterId) : [],
          });
          try {
            await api.clearRolls(characterId, pin);
          } catch (e) {
            set({ rolls: prev }); // rollback
            get().pushToast({
              title: "Falha ao limpar o histórico",
              description: errorMessage(e),
              tone: "danger",
            });
          }
        },

        pushToast: (toast) =>
          set((s) => ({
            toasts: [{ ...toast, id: cryptoRandomId() }, ...s.toasts].slice(0, 4),
          })),

        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) })),

        hydrate: async () => {
          if (get().hydrated) return;
          set({ hydrated: true });

          try {
            const [{ characters }, { rolls }, { items }] = await Promise.all([
              api.listCharacters(),
              api.listRolls(50),
              // Servidor antigo (sem homebrew) não pode derrubar a mesa.
              api.listHomebrew().catch(() => ({ items: [] as HomebrewItem[] })),
            ]);
            applyHomebrew(items);
            const map: Record<string, Character> = {};
            for (const c of characters) map[c.id] = c;
            // Fichas já destravadas neste aparelho: busca as versões completas em paralelo.
            await Promise.all(
              Object.entries(get().pins).map(async ([id, pin]) => {
                try {
                  const { character, role } = await api.getCharacter(id, pin);
                  map[id] = character;
                  if (role) set((s) => ({ roles: { ...s.roles, [id]: role } }));
                } catch {
                  // PIN removido/alterado no servidor: mantém só o resumo público.
                }
              }),
            );
            for (const id of deletedIds) delete map[id];
            set({ characters: map, rolls });
          } catch {
            // offline: mantém o estado persistido / seed
          }

          connectSse(set, get, applyHomebrew);
        },
      };
    },
    {
      name: "app-dnd-store",
      partialize: (s) => ({
        pins: s.pins,
        roles: s.roles,
        masterPin: s.masterPin,
        // characters/rolls/homebrew vêm do servidor; persistimos só as chaves do aparelho
      }),
    },
  ),
);

function connectSse(
  set: (partial: Partial<Store>) => void,
  get: () => Store,
  applyHomebrew: (items: HomebrewItem[]) => void,
) {
  if (typeof window === "undefined") return;
  let attempts = 0;

  const removeCharacter = (id: string) => {
    deletedIds.add(id);
    if (!(id in get().characters)) return;
    set(withoutCharacter(get(), id));
  };

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
        const incoming = data.character;
        if (deletedIds.has(incoming.id)) return;
        const previous = get().characters[incoming.id];
        const pin = get().pins[incoming.id];
        if (pin && previous) {
          // Mesma versão que já temos (ex.: eco do nosso próprio PATCH): nada a buscar.
          if (previous.updatedAt && previous.updatedAt === incoming.updatedAt) return;
          // Ficha destravada aqui: NÃO troca pela versão pública (zeraria PV/slots na
          // tela por um instante). Só atualiza a identidade e busca a versão completa.
          set({
            characters: {
              ...get().characters,
              [incoming.id]: {
                ...previous,
                playerName: incoming.playerName,
                characterName: incoming.characterName,
                color: incoming.color,
                avatarVersion: incoming.avatarVersion,
              },
            },
          });
          void api
            .getCharacter(incoming.id, pin)
            .then(({ character }) => {
              if (deletedIds.has(character.id)) return;
              set({ characters: { ...get().characters, [character.id]: character } });
            })
            .catch((e) => {
              if (deletedIds.has(incoming.id)) return;
              if (e instanceof ApiError && e.status === 404) {
                removeCharacter(incoming.id);
                return;
              }
              // PIN não serve mais: rebaixa para o resumo público recebido.
              set({ characters: { ...get().characters, [incoming.id]: incoming } });
            });
        } else {
          set({ characters: { ...get().characters, [incoming.id]: incoming } });
        }
        if (previous && previous.updatedAt !== incoming.updatedAt) {
          get().pushToast({
            title: `${incoming.characterName} foi atualizado`,
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
        removeCharacter(data.id);
      } catch {
        // ignore
      }
    });
    es.addEventListener("homebrew", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { item: HomebrewItem };
        applyHomebrew([...get().homebrew.filter((entry) => entry.id !== data.item.id), data.item]);
      } catch {
        // ignore
      }
    });
    es.addEventListener("homebrew-deleted", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { id: string };
        applyHomebrew(get().homebrew.filter((entry) => entry.id !== data.id));
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
          tone: data.roll.detail.crit ? "success" : data.roll.detail.fumble ? "danger" : "default",
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
          rolls: data.characterId ? rolls.filter((r) => r.characterId !== data.characterId) : [],
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

/** A ficha foi destravada com a chave mestra neste aparelho? */
export const useIsMaster = (id: string) => useStore((s) => s.roles[id] === "mestre");

export const useUnlocked = (id: string) =>
  useStore((s) => {
    const c = s.characters[id];
    if (!c) return false;
    if (!c.protected) return true;
    return Boolean(s.pins[id]);
  });
