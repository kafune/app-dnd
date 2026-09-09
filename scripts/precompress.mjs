/**
 * Pré-comprime os assets do `dist/` em Brotli (.br) e gzip (.gz). O binário Rust
 * embute as três versões e entrega a menor que o navegador aceitar — sem
 * comprimir nada em runtime.
 *
 *   bun scripts/precompress.mjs dist   (ou node)
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";

const root = process.argv[2] ?? "dist";
const COMPRESSIBLE = new Set([".js", ".mjs", ".css", ".html", ".svg", ".json", ".txt", ".map", ".ico"]);
const MIN_BYTES = 1024;

let files = 0;
let before = 0;
let afterBr = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(p);
      continue;
    }
    const ext = extname(name);
    if (!COMPRESSIBLE.has(ext) || st.size < MIN_BYTES) continue;
    const data = readFileSync(p);
    const br = brotliCompressSync(data, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
        [constants.BROTLI_PARAM_SIZE_HINT]: data.length,
      },
    });
    const gz = gzipSync(data, { level: 9 });
    writeFileSync(`${p}.br`, br);
    writeFileSync(`${p}.gz`, gz);
    files++;
    before += data.length;
    afterBr += br.length;
  }
}

walk(root);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`precompress: ${files} arquivos, ${kb(before)} -> ${kb(afterBr)} (brotli)`);
