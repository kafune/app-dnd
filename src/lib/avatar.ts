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

/** Recorte quadrado em pixels naturais da imagem (canto superior esquerdo + lado). */
export type AvatarCrop = { x: number; y: number; side: number };

/** Zoom máximo no ajuste da foto (1 = o menor zoom em que a imagem cobre o quadrado). */
export const AVATAR_MAX_ZOOM = 6;

/**
 * Recorte automático: o maior quadrado centralizado; em retratos, puxado para cima
 * (20% da sobra), onde costuma estar o rosto.
 */
export function defaultAvatarCrop(width: number, height: number): AvatarCrop {
  const side = Math.min(width, height);
  return {
    x: (width - side) / 2,
    y: height > width ? (height - side) * 0.2 : (height - side) / 2,
    side,
  };
}

/** Zoom atual do recorte: 1 quando o quadrado ocupa o lado menor inteiro. */
export function avatarCropZoom(crop: AvatarCrop, width: number, height: number): number {
  return Math.min(width, height) / crop.side;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Mantém o recorte dentro da imagem: o lado fica entre o lado menor inteiro (zoom 1)
 * e `1/maxZoom` dele, e o quadrado nunca sai da foto (sem faixas vazias).
 */
export function clampAvatarCrop(
  crop: AvatarCrop,
  width: number,
  height: number,
  maxZoom = AVATAR_MAX_ZOOM,
): AvatarCrop {
  const full = Math.min(width, height);
  const side = clamp(crop.side, full / Math.max(1, maxZoom), full);
  return {
    x: clamp(crop.x, 0, width - side),
    y: clamp(crop.y, 0, height - side),
    side,
  };
}

/** Arrasta a janela do recorte `dx`/`dy` pixels naturais (positivo = direita/baixo). */
export function panAvatarCrop(
  crop: AvatarCrop,
  width: number,
  height: number,
  dx: number,
  dy: number,
  maxZoom = AVATAR_MAX_ZOOM,
): AvatarCrop {
  return clampAvatarCrop({ ...crop, x: crop.x + dx, y: crop.y + dy }, width, height, maxZoom);
}

/**
 * Muda o zoom mantendo parado o ponto da imagem sob a âncora (`anchorX`/`anchorY` em
 * fração do quadrado: 0,5/0,5 = centro; o dedo ou o cursor no gesto de pinça/roda).
 */
export function zoomAvatarCrop(
  crop: AvatarCrop,
  width: number,
  height: number,
  zoom: number,
  anchorX = 0.5,
  anchorY = 0.5,
  maxZoom = AVATAR_MAX_ZOOM,
): AvatarCrop {
  const full = Math.min(width, height);
  const side = full / clamp(zoom, 1, Math.max(1, maxZoom));
  const px = crop.x + anchorX * crop.side;
  const py = crop.y + anchorY * crop.side;
  return clampAvatarCrop({ x: px - anchorX * side, y: py - anchorY * side, side }, width, height, maxZoom);
}

/** Recusa arquivos que claramente não são imagem (antes de tentar abrir). */
export function assertImageFile(file: Blob): void {
  if (file.type && !file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
}

/**
 * Abre a imagem a partir de uma URL (`URL.createObjectURL`). HEIC num navegador que
 * não o decodifica, ou arquivo corrompido, vira "Arquivo de imagem inválido.".
 */
export async function decodeAvatarImage(src: string): Promise<HTMLImageElement> {
  const image = await loadImage(src);
  if (!image.naturalWidth || !image.naturalHeight) throw new Error("Arquivo de imagem inválido.");
  return image;
}

/** Desenha o recorte num canvas e exporta JPEG de até `size` px. */
export async function renderAvatarCrop(
  image: HTMLImageElement,
  crop: AvatarCrop,
  size = AVATAR_SIZE,
  quality = 0.85,
): Promise<Blob> {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) throw new Error("Arquivo de imagem inválido.");
  const { x, y, side } = clampAvatarCrop(crop, width, height);
  const out = Math.max(1, Math.round(Math.min(size, side)));
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff"; // PNG com transparência vira fundo branco no JPEG
  ctx.fillRect(0, 0, out, out);
  ctx.drawImage(image, x, y, side, side, 0, 0, out, out);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Não foi possível comprimir a imagem.");
  return blob;
}

/**
 * Recorta a foto no quadrado escolhido (`crop` em pixels naturais; `null` = recorte
 * automático de `defaultAvatarCrop`) e exporta JPEG de até 384 px.
 */
export async function cropAvatar(
  file: Blob,
  crop: AvatarCrop | null,
  size = AVATAR_SIZE,
  quality = 0.85,
): Promise<Blob> {
  assertImageFile(file);
  const url = URL.createObjectURL(file);
  try {
    const image = await decodeAvatarImage(url);
    return await renderAvatarCrop(
      image,
      crop ?? defaultAvatarCrop(image.naturalWidth, image.naturalHeight),
      size,
      quality,
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Recorte automático (sem ajuste): quadrado centralizado, retratos puxados para cima,
 * JPEG de até 384 px. Uma foto de celular de 4 MB vira ~40 KB.
 */
export function compressAvatar(file: Blob, size = AVATAR_SIZE, quality = 0.85): Promise<Blob> {
  return cropAvatar(file, null, size, quality);
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
  assertImageFile(file);
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
