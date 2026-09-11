import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, DiceRoll, Folder, HomebrewItem, HomebrewKind, Sheet } from "./types";
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
export type FolderSaveResult = { ok: true; folder: Folder } | { ok: false; error: string };
/** Resultado de tentar abrir uma pasta. */
export type FolderEntry = "ok" | "bad_pin" | "not_found" | "error";

type Store = {
  /** Fichas conhecidas neste aparelho: resumos das pastas abertas + fichas destravadas. */
  characters: Record<string, Character>;
  /** Rolagens da mesa da pasta ativa. */
  rolls: DiceRoll[];
  toasts: AppToast[];
  // PIN guardado por device por personagem; usado para mandar nas requests
  pins: Record<string, string>;
  /** Papel com que cada ficha foi destravada neste aparelho (mestre × jogador). */
  roles: Record<string, AccessRole>;
  /** Chave mestra validada neste aparelho (libera o Mestre: homebrew e pastas). */
  masterPin: string | null;
  /** Raças, talentos e traços homebrew do Mestre. */
  homebrew: HomebrewItem[];
  /** Pastas (resumo público) por id. */
  folders: Record<string, Folder>;
  foldersLoaded: boolean;
  /** Senha de cada pasta guardada neste aparelho. */
  folderPins: Record<string, string>;
  /** Pastas abertas nesta sessão e se a credencial usada permite criar fichas nelas. */
  openedFolders: Record<string, { canCreate: boolean }>;
  /** Pasta cuja mesa (rolagens + eventos em tempo real) está sendo acompanhada. */
  activeFolder: string | null;
  hydrated: boolean;
  realtimeReady: boolean;
  patchError: string | null;
  editMode: boolean;

  setEditMode: (v: boolean) => void;
  setLocalCharacter: (c: Character) => void;
  /** Cria na pasta `character.folderId` com a senha guardada dela (ou a chave mestra). */
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
  /** Abre a pasta: `pin` digitado, senão a guardada, a chave mestra ou nenhuma (pasta sem senha). */
  enterFolder: (id: string, pin?: string) => Promise<FolderEntry>;
  /** Esquece a senha da pasta neste aparelho. */
  leaveFolder: (id: string) => void;
  /** Passa a acompanhar a mesa da pasta (rolagens + tempo real). Não faz nada se já está nela. */
  watchFolder: (id: string, pin?: string) => void;
  /** `watchFolder` da pasta de uma ficha, com a melhor credencial deste aparelho. */
  watchCharacterFolder: (characterId: string) => void;
  /** Busca o resumo de uma ficha que ainda não está na tela. `false` = não existe. */
  loadCharacterSummary: (id: string) => Promise<boolean>;
  createFolder: (name: string, pin: string, avatar: Blob | null) => Promise<FolderSaveResult>;
  /** `pin` vazio mantém a senha; `avatar`: Blob troca, `null` remove, `undefined` mantém. */
  updateFolder: (id: string, name: string, pin: string, avatar: Blob | null | undefined) => Promise<FolderSaveResult>;
  deleteFolder: (id: string) => Promise<boolean>;
  addRoll: (r: DiceRoll) => Promise<void>;
  /** `actorId`: de quem é o PIN usado para autorizar (default: `characterId`). Sem `characterId`, limpa a mesa da pasta. */
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

function withoutFolderAccess(s: Store, id: string): Partial<Store> {
  const folderPins = { ...s.folderPins };
  delete folderPins[id];
  const openedFolders = { ...s.openedFolders };
  delete openedFolders[id];
  return { folderPins, openedFolders };
}

function withoutFolder(s: Store, id: string): Partial<Store> {
  const folders = { ...s.folders };
  delete folders[id];
  return { ...withoutFolderAccess(s, id), folders };
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

      const removeCharacter = (id: string) => {
        deletedIds.add(id);
        if (!(id in get().characters)) return;
        set((s) => withoutCharacter(s, id));
      };

      const setFolder = (folder: Folder) => set((s) => ({ folders: { ...s.folders, [folder.id]: folder } }));

      /**
       * Recebe o resumo público de uma ficha (evento SSE ou listagem da pasta). Ficha
       * destravada aqui NÃO é trocada pela versão pública (zeraria PV/slots na tela por
       * um instante): só atualiza a identidade e, se mudou, busca a versão completa.
       */
      const receivePublic = (incoming: Character, notify: boolean) => {
        if (deletedIds.has(incoming.id)) return;
        const previous = get().characters[incoming.id];
        const pin = get().pins[incoming.id];
        if (pin && previous) {
          // Mesma versão que já temos (ex.: eco do nosso próprio PATCH): nada a buscar.
          if (previous.updatedAt && previous.updatedAt === incoming.updatedAt) return;
          set((s) => ({
            characters: {
              ...s.characters,
              [incoming.id]: {
                ...previous,
                playerName: incoming.playerName,
                characterName: incoming.characterName,
                color: incoming.color,
                avatarVersion: incoming.avatarVersion,
                folderId: incoming.folderId,
              },
            },
          }));
          void api
            .getCharacter(incoming.id, pin)
            .then(({ character }) => {
              if (deletedIds.has(character.id)) return;
              set((s) => ({ characters: { ...s.characters, [character.id]: character } }));
            })
            .catch((e) => {
              if (deletedIds.has(incoming.id)) return;
              if (e instanceof ApiError && e.status === 404) {
                removeCharacter(incoming.id);
                return;
              }
              // PIN não serve mais: rebaixa para o resumo público recebido.
              set((s) => ({ characters: { ...s.characters, [incoming.id]: incoming } }));
            });
        } else {
          set((s) => ({ characters: { ...s.characters, [incoming.id]: incoming } }));
        }
        if (notify && previous && previous.updatedAt !== incoming.updatedAt) {
          get().pushToast({
            title: `${incoming.characterName} foi atualizado`,
            description: "Ficha sincronizada em tempo real.",
          });
        }
      };

      const realtime = createRealtime(
        {
          character: ({ character }: { character: Character }) => receivePublic(character, true),
          "character-deleted": ({ id }: { id: string }) => removeCharacter(id),
          folder: ({ folder }: { folder: Folder }) => setFolder(folder),
          "folder-deleted": ({ id }: { id: string }) => set((s) => withoutFolder(s, id)),
          homebrew: ({ item }: { item: HomebrewItem }) =>
            applyHomebrew([...get().homebrew.filter((entry) => entry.id !== item.id), item]),
          "homebrew-deleted": ({ id }: { id: string }) =>
            applyHomebrew(get().homebrew.filter((entry) => entry.id !== id)),
          roll: ({ roll }: { roll: DiceRoll }) => {
            const rolls = get().rolls;
            if (rolls.some((x) => x.id === roll.id)) return;
            set({ rolls: [roll, ...rolls].slice(0, 50) });
            get().pushToast({
              title: `${roll.characterName ?? "Alguém"} rolou ${roll.label}`,
              description: `${roll.expression} = ${roll.result}`,
              tone: roll.detail.crit ? "success" : roll.detail.fumble ? "danger" : "default",
            });
          },
          "rolls-cleared": ({ characterId, folderId }: { characterId: string | null; folderId?: string | null }) =>
            set((s) => ({
              rolls: characterId
                ? s.rolls.filter((r) => r.characterId !== characterId)
                : folderId && folderId !== s.activeFolder
                  ? s.rolls
                  : [],
            })),
        },
        (ready) => set({ realtimeReady: ready }),
      );

      /** Credencial mais forte deste aparelho para uma pasta (senha > chave mestra). */
      const folderCredential = (folderId: string) => get().folderPins[folderId] ?? get().masterPin ?? undefined;

      const masterFailure = (e: unknown) => {
        if (e instanceof ApiError && e.code === "bad_pin") set({ masterPin: null });
        return { ok: false as const, error: errorMessage(e) };
      };

      return {
        characters: Object.fromEntries(PUBLIC_CHARACTERS.map((c) => [c.id, c])),
        rolls: [],
        toasts: [],
        pins: {},
        roles: {},
        masterPin: null,
        homebrew: [],
        folders: {},
        foldersLoaded: false,
        folderPins: {},
        openedFolders: {},
        activeFolder: null,
        hydrated: false,
        realtimeReady: false,
        patchError: null,
        editMode: false,

        setEditMode: (v) => set({ editMode: v }),

        setLocalCharacter: (c) => set((s) => ({ characters: { ...s.characters, [c.id]: c } })),

        createCharacter: async (character) => {
          const folderPin = character.folderId ? folderCredential(character.folderId) : undefined;
          const { character: saved, role } = await api.createCharacter(character, folderPin);
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

        enterFolder: async (id, rawPin) => {
          const typed = rawPin?.trim() || undefined;
          const pin = typed ?? folderCredential(id);
          try {
            const { folder, characters, canCreate } = await api.getFolder(id, pin);
            const listed = new Set(characters.map((c) => c.id));
            set((s) => {
              // Some da tela o que não está mais na pasta (apagada enquanto a aba dormia).
              const kept = Object.fromEntries(
                Object.entries(s.characters).filter(([cid, c]) => c.folderId !== id || listed.has(cid)),
              );
              return {
                characters: kept,
                folders: { ...s.folders, [id]: folder },
                openedFolders: { ...s.openedFolders, [id]: { canCreate } },
                folderPins: typed ? { ...s.folderPins, [id]: typed } : s.folderPins,
              };
            });
            for (const character of characters) receivePublic(character, false);
            get().watchFolder(id, pin);
            return "ok";
          } catch (e) {
            if (e instanceof ApiError && e.status === 403) {
              // Senha trocada pelo Mestre (ou digitada errada): pede de novo.
              set((s) => withoutFolderAccess(s, id));
              return "bad_pin";
            }
            if (e instanceof ApiError && e.status === 404) {
              set((s) => withoutFolder(s, id));
              return "not_found";
            }
            return "error";
          }
        },

        leaveFolder: (id) => set((s) => withoutFolderAccess(s, id)),

        watchFolder: (id, pin) => {
          if (!realtime.scope(id, pin)) return;
          set((s) => ({ activeFolder: id, rolls: s.activeFolder === id ? s.rolls : [] }));
          void api
            .listRolls(id, pin)
            .then(({ rolls }) => {
              if (get().activeFolder !== id) return;
              // Rolagens que chegaram por SSE durante o GET continuam na frente.
              const fetched = new Set(rolls.map((r) => r.id));
              set((s) => ({ rolls: [...s.rolls.filter((r) => !fetched.has(r.id)), ...rolls].slice(0, 50) }));
            })
            .catch(() => {
              // sem acesso ou offline: a mesa fica vazia
            });
        },

        watchCharacterFolder: (characterId) => {
          const folderId = get().characters[characterId]?.folderId;
          if (!folderId) return;
          get().watchFolder(folderId, folderCredential(folderId) ?? get().pins[characterId]);
        },

        loadCharacterSummary: async (id) => {
          if (get().characters[id]) return true;
          try {
            const { character } = await api.getCharacterSummary(id);
            if (deletedIds.has(id)) return false;
            set((s) => (s.characters[id] ? {} : { characters: { ...s.characters, [id]: character } }));
            return true;
          } catch (e) {
            // Só 404 é "não existe"; sem rede, continua tentando na próxima visita.
            return !(e instanceof ApiError && e.status === 404);
          }
        },

        createFolder: async (name, pin, avatar) => {
          const master = get().masterPin;
          if (!master) return { ok: false, error: "Entre com a chave mestra primeiro." };
          try {
            let { folder } = await api.createFolder(name, pin, master);
            if (avatar) {
              try {
                ({ folder } = await api.uploadFolderAvatar(folder.id, avatar, master));
              } catch (e) {
                get().pushToast({
                  title: "A pasta foi criada, mas a foto não foi salva",
                  description: errorMessage(e),
                  tone: "danger",
                });
              }
            }
            setFolder(folder);
            return { ok: true, folder };
          } catch (e) {
            return masterFailure(e);
          }
        },

        updateFolder: async (id, name, rawPin, avatar) => {
          const master = get().masterPin;
          if (!master) return { ok: false, error: "Entre com a chave mestra primeiro." };
          const pin = rawPin.trim();
          try {
            let { folder } = await api.updateFolder(id, { name, ...(pin ? { pin } : {}) }, master);
            if (avatar) ({ folder } = await api.uploadFolderAvatar(id, avatar, master));
            else if (avatar === null) ({ folder } = await api.removeFolderAvatar(id, master));
            setFolder(folder);
            // Senha nova: a guardada neste aparelho (se havia) acompanha.
            if (pin && get().folderPins[id]) set((s) => ({ folderPins: { ...s.folderPins, [id]: pin } }));
            return { ok: true, folder };
          } catch (e) {
            return masterFailure(e);
          }
        },

        deleteFolder: async (id) => {
          const master = get().masterPin;
          if (!master) return false;
          try {
            await api.deleteFolder(id, master);
          } catch (e) {
            if (!(e instanceof ApiError && e.status === 404)) {
              if (e instanceof ApiError && e.code === "bad_pin") set({ masterPin: null });
              get().pushToast({ title: "Não foi possível apagar a pasta", description: errorMessage(e), tone: "danger" });
              return false;
            }
          }
          set((s) => withoutFolder(s, id));
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
          const actor = actorId ?? characterId ?? "";
          const pin = get().pins[actor];
          // Sem ficha: a mesa inteira da pasta de quem pediu.
          const folderId = characterId ? undefined : (get().characters[actor]?.folderId ?? get().activeFolder ?? undefined);
          const prev = get().rolls;
          // update otimista
          set({
            rolls: characterId ? prev.filter((r) => r.characterId !== characterId) : [],
          });
          try {
            await api.clearRolls({ characterId, folderId }, pin);
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
          realtime.ensure();

          try {
            const [{ folders }, { items }] = await Promise.all([
              api.listFolders(),
              // Servidor antigo (sem homebrew) não pode derrubar a página.
              api.listHomebrew().catch(() => ({ items: [] as HomebrewItem[] })),
            ]);
            applyHomebrew(items);
            set((s) => ({
              folders: { ...Object.fromEntries(folders.map((f) => [f.id, f])) },
              foldersLoaded: true,
              // Pasta que sumiu enquanto a aba dormia não fica "aberta".
              openedFolders: Object.fromEntries(
                Object.entries(s.openedFolders).filter(([id]) => folders.some((f) => f.id === id)),
              ),
            }));
          } catch {
            // offline: mantém o estado persistido / seed
          }

          // Fichas já destravadas neste aparelho: busca as versões completas em paralelo.
          await Promise.all(
            Object.entries(get().pins).map(async ([id, pin]) => {
              try {
                const { character, role } = await api.getCharacter(id, pin);
                storeAuthorized(id, character, role);
              } catch (e) {
                if (e instanceof ApiError && e.status === 404) removeCharacter(id);
                // PIN removido/alterado no servidor: mantém só o resumo público.
              }
            }),
          );
        },
      };
    },
    {
      name: "app-dnd-store",
      partialize: (s) => ({
        pins: s.pins,
        roles: s.roles,
        masterPin: s.masterPin,
        folderPins: s.folderPins,
        // characters/rolls/homebrew/pastas vêm do servidor; persistimos só as chaves do aparelho
      }),
    },
  ),
);

/** Cada handler recebe o JSON do evento já com o tipo que declara. */
type RealtimeHandlers = Record<string, (data: never) => void>;

/**
 * Uma conexão SSE por aba. A inscrição (pasta + credencial) decide quais eventos de
 * ficha e rolagem chegam; eventos de pasta e homebrew chegam sempre. Reconecta com
 * backoff exponencial.
 */
function createRealtime(handlers: RealtimeHandlers, onStatus: (ready: boolean) => void) {
  let source: EventSource | null = null;
  let retry: ReturnType<typeof setTimeout> | null = null;
  let attempts = 0;
  let current: { folder?: string; pin?: string } = {};

  const open = () => {
    if (retry) {
      clearTimeout(retry);
      retry = null;
    }
    source?.close();
    const params = new URLSearchParams();
    if (current.folder) params.set("folder", current.folder);
    if (current.folder && current.pin) params.set("pin", current.pin);
    const query = params.toString();
    let es: EventSource;
    try {
      es = new EventSource(`/api/events${query ? `?${query}` : ""}`);
    } catch {
      return;
    }
    source = es;
    es.addEventListener("hello", () => {
      attempts = 0;
      onStatus(true);
    });
    for (const [event, handle] of Object.entries(handlers)) {
      es.addEventListener(event, (ev) => {
        try {
          handle(JSON.parse((ev as MessageEvent).data) as never);
        } catch {
          // evento malformado: ignora
        }
      });
    }
    es.onerror = () => {
      if (source !== es) return;
      onStatus(false);
      es.close();
      source = null;
      attempts++;
      retry = setTimeout(open, Math.min(30_000, 1000 * 2 ** attempts));
    };
  };

  return {
    /** Abre a conexão se ainda não há uma (nem uma reconexão agendada). */
    ensure() {
      if (typeof window !== "undefined" && !source && !retry) open();
    },
    /** Troca a inscrição; reabre só se mudou. Devolve se reabriu. */
    scope(folder?: string, pin?: string): boolean {
      if (typeof window === "undefined") return false;
      if (source && current.folder === folder && current.pin === pin) return false;
      current = { folder, pin };
      attempts = 0;
      open();
      return true;
    },
  };
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
