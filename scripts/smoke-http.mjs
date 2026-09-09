/**
 * Smoke HTTP: sobe o binário Rust (release) com um SQLite temporário e valida
 * frontend embutido (SPA + compressão + cache), APIs, persistência e SSE.
 *
 *   bun run build && bun run test:smoke
 */
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const port = Number(process.env.SMOKE_PORT ?? "3100");
const baseUrl = `http://127.0.0.1:${port}`;
const JOAO_PIN = "7429";
const tmpDir = mkdtempSync(join(tmpdir(), "app-dnd-smoke-"));
const dbPath = join(tmpDir, "app-dnd.sqlite");

const exe = process.platform === "win32" ? "app-dnd.exe" : "app-dnd";
const binary =
  process.env.SMOKE_BINARY ?? join(process.cwd(), "server", "target", "release", exe);
if (!existsSync(binary)) {
  console.error(`Binário não encontrado em ${binary}. Rode \`bun run build\` antes.`);
  process.exit(1);
}

const server = spawn(binary, [], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    APP_DND_DB: dbPath,
    APP_DND_BIND: `127.0.0.1:${port}`,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

const t0 = performance.now();
try {
  await waitForServer();
  console.log(`servidor pronto em ${(performance.now() - t0).toFixed(0)} ms`);
  await assertSpa();
  await assertStaticCaching();
  await assertCharactersApi();
  await assertCharacterPatch();
  await assertCreateAndDelete();
  await assertRollsApi();
  await assertEventsApi();
  await assertLatency();
  console.log("Smoke HTTP passou: SPA, APIs, persistência SQLite e SSE estão respondendo.");
} finally {
  server.kill("SIGTERM");
  await waitForExit();
  rmSync(tmpDir, { recursive: true, force: true });
}

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  let lastError;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`servidor encerrou cedo:\n${serverOutput}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(50);
  }
  throw new Error(`Servidor não ficou pronto: ${String(lastError)}\n${serverOutput}`);
}

async function assertSpa() {
  for (const path of ["/", "/personagem/joao-lindao", "/criar-ficha"]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, `${path} deve responder 200`);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/, `${path} deve ser HTML`);
    const html = await response.text();
    assert.match(html, /Mundo Pankleos/, `${path} deve entregar o index.html do SPA`);
    assert.match(html, /\/assets\/.*\.js/, `${path} deve referenciar o bundle`);
  }
  const missing = await fetch(`${baseUrl}/assets/nao-existe.js`);
  assert.equal(missing.status, 404, "asset inexistente deve dar 404 (não index.html)");
}

async function assertStaticCaching() {
  const index = await fetch(`${baseUrl}/`);
  const html = await index.text();
  const asset = html.match(/\/assets\/[^"']+\.js/)?.[0];
  assert.ok(asset, "index.html deve apontar para um asset JS");

  const br = await fetch(`${baseUrl}${asset}`, { headers: { "accept-encoding": "br" } });
  assert.equal(br.status, 200);
  assert.equal(br.headers.get("content-encoding"), "br", "asset JS deve vir pré-comprimido em brotli");
  assert.match(br.headers.get("cache-control") ?? "", /immutable/, "assets com hash devem ter cache imutável");
  const etag = br.headers.get("etag");
  assert.ok(etag, "asset deve ter ETag");

  const cached = await fetch(`${baseUrl}${asset}`, {
    headers: { "accept-encoding": "br", "if-none-match": etag },
  });
  assert.equal(cached.status, 304, "ETag igual deve responder 304");

  const plain = await fetch(`${baseUrl}${asset}`, { headers: { "accept-encoding": "identity" } });
  assert.equal(plain.headers.get("content-encoding"), null, "sem accept-encoding deve vir sem compressão");
  assert.match(plain.headers.get("content-type") ?? "", /javascript/);
}

async function assertCharactersApi() {
  const response = await fetch(`${baseUrl}/api/characters`);
  assert.equal(response.status, 200, "/api/characters deve responder 200");
  const body = await response.json();
  assert.equal(body.characters.length, 4, "API deve retornar 4 personagens");

  const joao = body.characters.find((character) => character.id === "joao-lindao");
  assert.ok(joao, "João deve existir no seed");
  assert.equal(joao.characterName, "Zorrilho Pabrantes");
  assert.equal(joao.protected, true, "listagem pública deve marcar ficha protegida");
  assert.equal(joao.hpCurrent, 0, "listagem pública não deve expor PV da ficha");
  assert.equal(joao.pin, undefined, "API pública nunca deve expor PIN");
  assert.equal(joao.sheet.species, "Shadar-Kai");
  assert.equal(joao.sheet.classes[0].name, "Ladino");
}

async function assertCharacterPatch() {
  const notes = `Smoke notes ${randomUUID()}`;
  const deniedGet = await fetch(`${baseUrl}/api/characters/joao-lindao`);
  assert.equal(deniedGet.status, 403, "GET da ficha sem PIN deve ser negado");

  const deniedPatch = await fetch(`${baseUrl}/api/characters/joao-lindao`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patch: { hpCurrent: 13, notes } }),
  });
  assert.equal(deniedPatch.status, 403, "PATCH da ficha sem PIN deve ser negado");

  const notFound = await fetch(`${baseUrl}/api/characters/nao-existe`, {
    headers: { "x-character-pin": JOAO_PIN },
  });
  assert.equal(notFound.status, 404, "ficha inexistente deve dar 404");

  const getWithPin = await fetch(`${baseUrl}/api/characters/joao-lindao`, {
    headers: { "x-character-pin": JOAO_PIN },
  });
  assert.equal(getWithPin.status, 200, "GET da ficha com PIN deve responder 200");
  const original = await getWithPin.json();
  assert.equal(original.character.hpCurrent, 18);
  assert.equal(original.character.pin, undefined, "GET autorizado não deve expor PIN");

  const patchResponse = await fetch(`${baseUrl}/api/characters/joao-lindao`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patch: { hpCurrent: 13, notes, id: "hack", pin: "0000" }, pin: JOAO_PIN }),
  });
  assert.equal(patchResponse.status, 200, "PATCH de personagem deve responder 200");
  const patched = await patchResponse.json();
  assert.equal(patched.character.id, "joao-lindao", "PATCH não pode trocar o id");
  assert.equal(patched.character.hpCurrent, 13, "PATCH deve persistir PV atual");
  assert.equal(patched.character.notes, notes, "PATCH deve persistir notas");
  assert.equal(patched.character.pin, undefined, "PATCH não deve expor PIN");

  const stillProtected = await fetch(`${baseUrl}/api/characters/joao-lindao`, {
    headers: { "x-character-pin": "0000" },
  });
  assert.equal(stillProtected.status, 403, "PATCH não pode trocar o PIN");

  const getResponse = await fetch(`${baseUrl}/api/characters/joao-lindao`, {
    headers: { "x-character-pin": JOAO_PIN },
  });
  const fetched = await getResponse.json();
  assert.equal(fetched.character.hpCurrent, 13, "GET deve refletir patch persistido");
  assert.equal(fetched.character.notes, notes, "GET deve refletir notas persistidas");

  const logResponse = await fetch(`${baseUrl}/api/characters/joao-lindao?log=1`, {
    headers: { "x-character-pin": JOAO_PIN },
  });
  assert.equal(logResponse.status, 200);
  const { log } = await logResponse.json();
  assert.ok(log.length >= 1, "log de modificações deve registrar o PATCH");
  assert.equal(log[0].by, "jogador");
  const hpChange = log[0].changes.find((c) => c.field === "PV atual");
  assert.deepEqual(hpChange, { field: "PV atual", from: "18", to: "13" });

  const master = await fetch(`${baseUrl}/api/characters/joao-lindao`, {
    headers: { "x-character-pin": "670076" },
  });
  assert.equal(master.status, 200, "chave mestra deve abrir qualquer ficha");
}

async function assertCreateAndDelete() {
  const bad = await fetch(`${baseUrl}/api/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{nope",
  });
  assert.equal(bad.status, 400, "JSON inválido deve dar 400");
  assert.deepEqual(await bad.json(), { error: "bad_json" });

  const character = {
    playerName: "Smoke",
    characterName: "Édson Ção",
    pin: "4321",
    sheet: { species: "Anão", classes: [{ name: "Guerreiro", level: 1 }], abilityScores: { str: 10 } },
    hpCurrent: 10,
    hpMax: 10,
    hpTemp: 0,
    spellSlots: {},
    resources: [],
  };
  const created = await fetch(`${baseUrl}/api/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  });
  assert.equal(created.status, 201, "POST deve criar a ficha");
  const body = await created.json();
  assert.equal(body.character.id, "edson-cao", "id deve ser o slug do nome");
  assert.equal(body.character.pin, undefined, "POST não deve devolver o PIN");
  assert.equal(body.character.protected, true);

  const dup = await fetch(`${baseUrl}/api/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  });
  const dupBody = await dup.json();
  assert.match(dupBody.character.id, /^edson-cao-[0-9a-f]{4}$/, "id repetido ganha sufixo");

  const list = await fetch(`${baseUrl}/api/characters`).then((r) => r.json());
  assert.equal(list.characters.length, 6, "listagem deve incluir as fichas novas");

  const deniedDelete = await fetch(`${baseUrl}/api/characters/edson-cao`, { method: "DELETE" });
  assert.equal(deniedDelete.status, 403, "DELETE sem PIN deve ser negado");

  for (const id of [body.character.id, dupBody.character.id]) {
    const del = await fetch(`${baseUrl}/api/characters/${id}`, {
      method: "DELETE",
      headers: { "x-character-pin": "4321" },
    });
    assert.equal(del.status, 200, "DELETE com PIN deve funcionar");
  }
  const after = await fetch(`${baseUrl}/api/characters`).then((r) => r.json());
  assert.equal(after.characters.length, 4, "cache da listagem deve ser invalidado após escrita");
}

async function assertRollsApi() {
  const roll = {
    id: randomUUID(),
    characterId: "joao-lindao",
    characterName: "Zorrilho Pabrantes",
    label: "Smoke Furtividade",
    expression: "1d20+6",
    result: 18,
    detail: { rolls: [12], modifier: 6 },
    createdAt: new Date().toISOString(),
  };

  const postResponse = await fetch(`${baseUrl}/api/rolls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roll }),
  });
  assert.equal(postResponse.status, 200, "POST de rolagem deve responder 200");
  const posted = await postResponse.json();
  assert.deepEqual(posted.roll, roll, "POST deve devolver a rolagem intacta");

  const listResponse = await fetch(`${baseUrl}/api/rolls?limit=5`);
  assert.equal(listResponse.status, 200, "GET de rolagens deve responder 200");
  const body = await listResponse.json();
  assert.ok(
    body.rolls.some((storedRoll) => storedRoll.id === roll.id && storedRoll.result === 18),
    "rolagem criada deve aparecer no histórico",
  );

  const cleared = await fetch(`${baseUrl}/api/rolls?characterId=joao-lindao`, { method: "DELETE" });
  assert.deepEqual(await cleared.json(), { ok: true, removed: 1 });
}

async function assertEventsApi() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${baseUrl}/api/events`, { signal: controller.signal });
    assert.equal(response.status, 200, "SSE deve responder 200");
    assert.equal(
      response.headers.get("content-type")?.includes("text/event-stream"),
      true,
      "SSE deve usar text/event-stream",
    );
    assert.equal(response.headers.get("x-accel-buffering"), "no");

    const reader = response.body?.getReader();
    assert.ok(reader, "SSE deve retornar stream");
    const decoder = new TextDecoder();
    let text = decoder.decode((await reader.read()).value);
    assert.match(text, /event: hello/, "SSE deve enviar evento hello inicial");

    // Uma rolagem postada deve chegar por SSE em tempo real.
    const roll = {
      id: randomUUID(),
      characterId: null,
      label: "sse",
      expression: "1d4",
      result: 3,
      detail: { rolls: [3], modifier: 0 },
      createdAt: new Date().toISOString(),
    };
    const t0 = performance.now();
    await fetch(`${baseUrl}/api/rolls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roll }),
    });
    while (!text.includes(roll.id)) {
      const chunk = await reader.read();
      if (chunk.done) break;
      text += decoder.decode(chunk.value);
    }
    assert.match(text, /event: roll/, "SSE deve propagar a rolagem");
    console.log(`SSE: rolagem propagada em ${(performance.now() - t0).toFixed(1)} ms`);
    await reader.cancel();
  } finally {
    clearTimeout(timeout);
  }
}

async function assertLatency() {
  const n = 200;
  const t0 = performance.now();
  for (let i = 0; i < n; i++) {
    await fetch(`${baseUrl}/api/characters`);
  }
  const perReq = (performance.now() - t0) / n;
  console.log(`latência média GET /api/characters (sequencial, ${n}x): ${perReq.toFixed(2)} ms`);
}

async function waitForExit() {
  if (server.exitCode !== null) return;
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    sleep(3000).then(() => server.kill("SIGKILL")),
  ]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
