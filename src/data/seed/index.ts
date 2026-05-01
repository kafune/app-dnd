import type { Character } from "@/lib/types";
import { joao } from "./joao";
import { camargo } from "./camargo";
import { vinicius } from "./vinicius";
import { ruda } from "./ruda";

export const SEED_CHARACTERS: Character[] = [joao, camargo, vinicius, ruda];

export const getSeedById = (id: string): Character | undefined =>
  SEED_CHARACTERS.find((c) => c.id === id);
