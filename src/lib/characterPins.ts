export const CHARACTER_PINS: Record<string, string> = {
  "joao-lindao": "7429",
  "camargo-fofo": "3816",
  "vinicius-fofo": "9052",
  "ruda-felpudo": "6148",
};

/** Chave mestra do Mestre: abre e edita QUALQUER ficha. */
export const MASTER_PIN = "670076";

export function isMasterPin(pin: string | undefined): boolean {
  return pin?.trim() === MASTER_PIN;
}

export function validateCharacterPin(id: string, pin: string | undefined): boolean {
  return isMasterPin(pin) || CHARACTER_PINS[id] === pin?.trim();
}
