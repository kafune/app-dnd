import { NextRequest, NextResponse } from "next/server";
import { insertRoll, listRolls } from "@/lib/db";
import { eventBus } from "@/lib/eventBus";
import type { DiceRoll } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
  return NextResponse.json({ rolls: listRolls(Math.min(200, Math.max(1, limit))) });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { roll: DiceRoll };
  if (!body?.roll || typeof body.roll.id !== "string") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const stored = insertRoll(body.roll);
  eventBus.publish({ type: "roll", roll: stored });
  return NextResponse.json({ roll: stored });
}
