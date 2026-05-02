export const CHARACTER_PINS: Record<string, string> = {
  "joao-lindao": "7429",
  "camargo-fofo": "3816",
  "vinicius-fofo": "9052",
  "ruda-felpudo": "6148",
};

export function validateCharacterPin(id: string, pin: string | undefined): boolean {
  return CHARACTER_PINS[id] === pin?.trim();
}
