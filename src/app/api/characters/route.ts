import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  characterExists,
  listCharacters,
  toPublicCharacter,
  upsertCharacter,
} from "@/lib/db";
import { eventBus } from "@/lib/eventBus";
import { slugifyName } from "@/lib/createCharacter";
import type { Character } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ characters: listCharacters() });
}

function isValidPayload(c: unknown): c is Character {
  if (!c || typeof c !== "object") return false;
  const ch = c as Partial<Character>;
  return (
    typeof ch.playerName === "string" &&
    ch.playerName.trim().length > 0 &&
    typeof ch.characterName === "string" &&
    ch.characterName.trim().length > 0 &&
    typeof ch.sheet === "object" &&
    ch.sheet !== null &&
    typeof ch.sheet.abilityScores === "object"
  );
}

/** Gera um id único: slug do nome (+ sufixo curto se colidir ou vazio). */
function uniqueId(name: string): string {
  const base = slugifyName(name) || "ficha";
  if (!characterExists(base)) return base;
  let id = `${base}-${randomUUID().slice(0, 4)}`;
  while (characterExists(id)) id = `${base}-${randomUUID().slice(0, 4)}`;
  return id;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const payload = (body as { character?: unknown })?.character;
  if (!isValidPayload(payload)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const id = uniqueId(payload.characterName);
  const character: Character = {
    ...payload,
    id,
    protected: Boolean(payload.pin),
  };

  const saved = upsertCharacter(character);
  eventBus.publish({ type: "character", character: toPublicCharacter(saved) });

  // Devolve a ficha autorizada (sem expor o pin de volta).
  const authorized = { ...saved, protected: true };
  delete authorized.pin;
  return NextResponse.json({ character: authorized }, { status: 201 });
}
