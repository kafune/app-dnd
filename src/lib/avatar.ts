/**
 * Foto de perfil: recorte quadrado + JPEG pequeno no navegador antes do upload.
 * A imagem fica no servidor (`/api/characters/:id/avatar`), fora do JSON da ficha,
 * e a URL leva a versão (`?v=`) para o navegador guardar em cache imutável.
 */

export const AVATAR_SIZE = 384;

export function avatarUrl(character: { id: string; avatarVersion?: string | null }): string | null {
  if (!character.avatarVersion) return null;
  return `/api/characters/${encodeURIComponent(character.id)}/avatar?v=${encodeURIComponent(character.avatarVersion)}`;
}

/** Mesma ideia para a foto da pasta (`/api/folders/:id/avatar`). */
export function folderAvatarUrl(folder: { id: string; avatarVersion?: string | null }): string | null {
  if (!folder.avatarVersion) return null;
  return `/api/folders/${encodeURIComponent(folder.id)}/avatar?v=${encodeURIComponent(folder.avatarVersion)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Arquivo de imagem inválido."));
    image.src = src;
  });
}

/**
 * Recorta a imagem num quadrado (retratos: recorte puxado para cima, onde costuma
 * estar o rosto) e exporta JPEG de até 384 px. Uma foto de celular de 4 MB vira ~40 KB.
 */
export async function compressAvatar(file: Blob, size = AVATAR_SIZE, quality = 0.85): Promise<Blob> {
  if (file.type && !file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const side = Math.min(width, height);
    if (!side) throw new Error("Arquivo de imagem inválido.");
    const sx = (width - side) / 2;
    const sy = height > width ? (height - side) * 0.2 : (height - side) / 2;
    const out = Math.min(size, side);
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff"; // PNG com transparência vira fundo branco no JPEG
    ctx.fillRect(0, 0, out, out);
    ctx.drawImage(image, sx, sy, side, side, 0, 0, out, out);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Não foi possível comprimir a imagem.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Lado máximo da imagem de fundo do mapa: acima disso reduz (e vira JPEG). */
export const MAP_BACKGROUND_MAX = 2560;
/** Até este tamanho a imagem sobe como está (PNG com grade continua nítido). */
const MAP_BACKGROUND_RAW_LIMIT = 6 * 1024 * 1024;

/**
 * Imagem de fundo do mapa. Diferente da foto de perfil, aqui a nitidez importa
 * (a grade da imagem, os detalhes do cenário): um arquivo pequeno sobe intacto;
 * um grande é reduzido para 2560 px no lado maior.
 */
export async function prepareMapBackground(
  file: Blob,
): Promise<{ blob: Blob; width: number; height: number }> {
  if (file.type && !file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) throw new Error("Arquivo de imagem inválido.");
    const longest = Math.max(width, height);
    const supported = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (longest <= MAP_BACKGROUND_MAX && supported && file.size <= MAP_BACKGROUND_RAW_LIMIT) {
      return { blob: file, width, height };
    }
    const scale = Math.min(1, MAP_BACKGROUND_MAX / longest);
    const outW = Math.round(width * scale);
    const outH = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(image, 0, 0, outW, outH);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) throw new Error("Não foi possível comprimir a imagem.");
    return { blob, width: outW, height: outH };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Iniciais para o avatar sem foto ("Zorrilho Pabrantes" → "ZP"). */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters = words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[words.length - 1][0]}`;
  return letters.toUpperCase();
}
