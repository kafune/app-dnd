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

/** Iniciais para o avatar sem foto ("Zorrilho Pabrantes" → "ZP"). */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters = words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[words.length - 1][0]}`;
  return letters.toUpperCase();
}
