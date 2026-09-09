/**
 * Exporta as 4 fichas do seed (src/data/seed/*.ts) para server/seed.json,
 * que o binário Rust embute e usa para popular um banco vazio.
 *
 *   bun scripts/export-seed.ts
 */
import { writeFileSync } from "node:fs";
import { SEED_CHARACTERS } from "../src/data/seed";

const out = new URL("../server/seed.json", import.meta.url);
writeFileSync(out, JSON.stringify(SEED_CHARACTERS, null, 1) + "\n");
console.log(`server/seed.json: ${SEED_CHARACTERS.length} fichas exportadas.`);
