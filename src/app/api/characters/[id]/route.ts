import { NextRequest, NextResponse } from "next/server";
import { getCharacter, patchCharacter, toPublicCharacter } from "@/lib/db";
import { eventBus } from "@/lib/eventBus";
import type { Character } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const pin = _req.headers.get("x-character-pin") ?? undefined;
  const result = getCharacter(id, pin);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason },
      { status: result.reason === "not_found" ? 404 : 403 },
    );
  }
  return NextResponse.json({ character: result.character });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json()) as { patch: Partial<Character>; pin?: string };
  if (!body || typeof body.patch !== "object") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Não deixa o cliente sobrescrever a identidade
  const safePatch = { ...body.patch };
  delete safePatch.id;
  delete safePatch.pin;

  const result = patchCharacter(id, safePatch, body.pin);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.reason === "not_found" ? 404 : 403 });
  }
  eventBus.publish({ type: "character", character: toPublicCharacter(result.character) });
  return NextResponse.json({ character: result.character });
}
