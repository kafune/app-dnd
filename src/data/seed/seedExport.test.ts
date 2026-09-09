import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { SEED_CHARACTERS } from "./index";

/**
 * O binário Rust embute `server/seed.json` para popular um banco vazio. Este
 * teste garante que o JSON não ficou para trás em relação aos seeds em TS.
 * Para regenerar: `bun run seed:export`.
 */
describe("server/seed.json", () => {
  test("está sincronizado com SEED_CHARACTERS", () => {
    const raw = readFileSync(new URL("../../../server/seed.json", import.meta.url), "utf-8");
    expect(JSON.parse(raw)).toEqual(JSON.parse(JSON.stringify(SEED_CHARACTERS)));
  });
});
