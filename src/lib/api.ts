import type { Character, CharacterLogEntry, DiceRoll } from "./types";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return (await res.json()) as T;
}

/** Papel de quem abriu a ficha, informado pelo servidor conforme o PIN usado. */
export type AccessRole = "mestre" | "jogador";
type Authorized = { character: Character; role?: AccessRole };

export const api = {
  listCharacters: () =>
    jsonFetch<{ characters: Character[] }>("/api/characters", { cache: "no-store" }),

  createCharacter: (character: Character) =>
    jsonFetch<Authorized>("/api/characters", {
      method: "POST",
      body: JSON.stringify({ character }),
    }),

  patchCharacter: (id: string, patch: Partial<Character>, pin?: string) =>
    jsonFetch<Authorized>(`/api/characters/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ patch, pin }),
    }),

  getCharacter: (id: string, pin: string) =>
    jsonFetch<Authorized>(`/api/characters/${id}`, {
      cache: "no-store",
      headers: { "x-character-pin": pin },
    }),

  deleteCharacter: (id: string, pin?: string) =>
    jsonFetch<{ ok: true }>(`/api/characters/${id}`, {
      method: "DELETE",
      headers: pin ? { "x-character-pin": pin } : {},
    }),

  getCharacterLog: (id: string, pin?: string) =>
    jsonFetch<{ log: CharacterLogEntry[] }>(`/api/characters/${id}?log=1`, {
      cache: "no-store",
      headers: pin ? { "x-character-pin": pin } : {},
    }),

  listRolls: (limit = 50) =>
    jsonFetch<{ rolls: DiceRoll[] }>(`/api/rolls?limit=${limit}`, { cache: "no-store" }),

  // Escrever no histórico exige o PIN da ficha (ou a chave mestra), no mesmo
  // header usado pelas rotas de ficha.
  postRoll: (roll: DiceRoll, pin?: string) =>
    jsonFetch<{ roll: DiceRoll }>("/api/rolls", {
      method: "POST",
      headers: pin ? { "x-character-pin": pin } : {},
      body: JSON.stringify({ roll }),
    }),

  clearRolls: (characterId?: string, pin?: string) =>
    jsonFetch<{ ok: true; removed: number }>(
      `/api/rolls${characterId ? `?characterId=${encodeURIComponent(characterId)}` : ""}`,
      { method: "DELETE", headers: pin ? { "x-character-pin": pin } : {} },
    ),
};
