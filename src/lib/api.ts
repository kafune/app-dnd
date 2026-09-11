import type { Character, CharacterLogEntry, DiceRoll, Folder, HomebrewItem, HomebrewKind } from "./types";

/** Erro de API com o código do servidor (`{"error": "bad_pin"}`) e mensagem em PT-BR. */
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const FRIENDLY: Record<string, string> = {
  bad_pin: "PIN recusado pelo servidor.",
  not_found: "Não encontrado (talvez já tenha sido apagado).",
  name_taken: "Já existe um item homebrew com esse nome.",
  bad_type: "Formato de imagem não suportado (use JPEG, PNG ou WebP).",
  bad_image: "O arquivo não parece ser uma imagem válida.",
  bad_request: "Dados inválidos.",
  bad_kind: "Tipo de homebrew inválido.",
  bad_json: "Dados inválidos.",
  db_error: "Erro no banco de dados do servidor.",
  folder_required: "A ficha precisa ser criada dentro de uma pasta.",
  folder_not_found: "Pasta não encontrada (talvez tenha sido apagada).",
  bad_folder_pin: "Senha da pasta recusada. Entre na pasta de novo.",
  folder_pin_required: "Defina uma senha para a pasta.",
  folder_name_taken: "Já existe uma pasta com esse nome.",
  folder_not_empty: "A pasta ainda tem fichas. Apague as fichas dela antes.",
};

async function send<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "network", "Sem conexão com o servidor.");
  }
  if (!res.ok) {
    const body = await res.text();
    let code = `http_${res.status}`;
    try {
      code = (JSON.parse(body) as { error?: string }).error ?? code;
    } catch {
      // corpo não-JSON (ex.: proxy)
    }
    const message =
      FRIENDLY[code] ?? (res.status === 413 ? "Arquivo grande demais." : `Erro ${res.status} ${res.statusText}`.trim());
    throw new ApiError(res.status, code, message);
  }
  return (await res.json()) as T;
}

/** Papel de quem abriu a ficha, informado pelo servidor conforme o PIN usado. */
export type AccessRole = "mestre" | "jogador";
type Authorized = { character: Character; role?: AccessRole };

/** Pasta aberta: resumo, fichas dela e se a credencial usada permite criar fichas. */
export type OpenedFolder = { folder: Folder; characters: Character[]; canCreate: boolean };

// O mesmo header leva PIN de ficha, senha de pasta ou chave mestra: cada rota confere
// contra o que protege.
const pinHeader = (pin?: string): Record<string, string> => (pin ? { "x-character-pin": pin } : {});
const enc = encodeURIComponent;

export const api = {
  listFolders: () => send<{ folders: Folder[] }>("/api/folders", { cache: "no-store" }),

  /** Abre a pasta com a senha dela ou a chave mestra (pasta sem senha dispensa). */
  getFolder: (id: string, pin?: string) =>
    send<OpenedFolder>(`/api/folders/${enc(id)}`, { cache: "no-store", headers: pinHeader(pin) }),

  createFolder: (name: string, pin: string, masterPin: string) =>
    send<{ folder: Folder }>("/api/folders", {
      method: "POST",
      headers: pinHeader(masterPin),
      body: JSON.stringify({ name, pin }),
    }),

  /** Sem `pin`, a senha atual da pasta fica. */
  updateFolder: (id: string, data: { name: string; pin?: string }, masterPin: string) =>
    send<{ folder: Folder }>(`/api/folders/${enc(id)}`, {
      method: "PUT",
      headers: pinHeader(masterPin),
      body: JSON.stringify(data),
    }),

  deleteFolder: (id: string, masterPin: string) =>
    send<{ ok: true }>(`/api/folders/${enc(id)}`, { method: "DELETE", headers: pinHeader(masterPin) }),

  uploadFolderAvatar: (id: string, image: Blob, masterPin: string) =>
    send<{ folder: Folder }>(`/api/folders/${enc(id)}/avatar`, {
      method: "PUT",
      headers: { "Content-Type": image.type || "image/jpeg", ...pinHeader(masterPin) },
      body: image,
    }),

  removeFolderAvatar: (id: string, masterPin: string) =>
    send<{ folder: Folder }>(`/api/folders/${enc(id)}/avatar`, { method: "DELETE", headers: pinHeader(masterPin) }),

  /** Cria a ficha na pasta `character.folderId`; `folderPin` é a senha da pasta ou a chave mestra. */
  createCharacter: (character: Character, folderPin?: string) =>
    send<Authorized>("/api/characters", {
      method: "POST",
      headers: pinHeader(folderPin),
      body: JSON.stringify({ character }),
    }),

  /** Resumo público (nome, jogador, pasta): tela de PIN de quem chega por link direto. */
  getCharacterSummary: (id: string) =>
    send<{ character: Character }>(`/api/characters/${enc(id)}/summary`, { cache: "no-store" }),

  patchCharacter: (id: string, patch: Partial<Character>, pin?: string) =>
    send<Authorized>(`/api/characters/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ patch, pin }),
    }),

  getCharacter: (id: string, pin: string) =>
    send<Authorized>(`/api/characters/${id}`, {
      cache: "no-store",
      headers: { "x-character-pin": pin },
    }),

  deleteCharacter: (id: string, pin?: string) =>
    send<{ ok: true }>(`/api/characters/${id}`, {
      method: "DELETE",
      headers: pinHeader(pin),
    }),

  /** Envia a foto de perfil já comprimida (JPEG/PNG/WebP, bytes crus). */
  uploadAvatar: (id: string, image: Blob, pin?: string) =>
    send<Authorized>(`/api/characters/${id}/avatar`, {
      method: "PUT",
      headers: { "Content-Type": image.type || "image/jpeg", ...pinHeader(pin) },
      body: image,
    }),

  removeAvatar: (id: string, pin?: string) =>
    send<Authorized>(`/api/characters/${id}/avatar`, {
      method: "DELETE",
      headers: pinHeader(pin),
    }),

  getCharacterLog: (id: string, pin?: string) =>
    send<{ log: CharacterLogEntry[] }>(`/api/characters/${id}?log=1`, {
      cache: "no-store",
      headers: pinHeader(pin),
    }),

  /** Mesa de uma pasta: senha dela, PIN de uma ficha dela ou chave mestra. */
  listRolls: (folderId: string, pin?: string, limit = 50) =>
    send<{ rolls: DiceRoll[] }>(`/api/rolls?folder=${enc(folderId)}&limit=${limit}`, {
      cache: "no-store",
      headers: pinHeader(pin),
    }),

  // Escrever no histórico exige o PIN da ficha (ou a chave mestra), no mesmo
  // header usado pelas rotas de ficha.
  postRoll: (roll: DiceRoll, pin?: string) =>
    send<{ roll: DiceRoll }>("/api/rolls", {
      method: "POST",
      headers: pinHeader(pin),
      body: JSON.stringify({ roll }),
    }),

  /** Limpa as rolagens de uma ficha (`characterId`) ou a mesa inteira de uma pasta (`folderId`). */
  clearRolls: (scope: { characterId?: string; folderId?: string }, pin?: string) => {
    const params = new URLSearchParams();
    if (scope.characterId) params.set("characterId", scope.characterId);
    else if (scope.folderId) params.set("folder", scope.folderId);
    const query = params.toString();
    return send<{ ok: true; removed: number }>(`/api/rolls${query ? `?${query}` : ""}`, {
      method: "DELETE",
      headers: pinHeader(pin),
    });
  },

  /** Confere a chave mestra (200 = é o Mestre). */
  checkMaster: (pin: string) => send<{ ok: true }>("/api/master", { method: "POST", headers: pinHeader(pin) }),

  listHomebrew: () => send<{ items: HomebrewItem[] }>("/api/homebrew", { cache: "no-store" }),

  createHomebrew: (kind: HomebrewKind, data: HomebrewItem["data"], pin: string) =>
    send<{ item: HomebrewItem }>("/api/homebrew", {
      method: "POST",
      headers: pinHeader(pin),
      body: JSON.stringify({ kind, data }),
    }),

  updateHomebrew: (id: string, data: HomebrewItem["data"], pin: string) =>
    send<{ item: HomebrewItem }>(`/api/homebrew/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: pinHeader(pin),
      body: JSON.stringify({ data }),
    }),

  deleteHomebrew: (id: string, pin: string) =>
    send<{ ok: true }>(`/api/homebrew/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: pinHeader(pin),
    }),
};

/** Mensagem legível de um erro qualquer (ApiError ou não). */
export function errorMessage(error: unknown, fallback = "Algo deu errado."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
