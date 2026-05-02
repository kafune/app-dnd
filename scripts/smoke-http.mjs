import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const port = Number(process.env.SMOKE_PORT ?? "3100");
const baseUrl = `http://127.0.0.1:${port}`;
const JOAO_PIN = "7429";
const tmpDir = mkdtempSync(join(tmpdir(), "app-dnd-smoke-"));
const dbPath = join(tmpDir, "app-dnd.sqlite");

const server = spawn("node_modules/.bin/next", ["start", "--port", String(port)], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    APP_DND_DB: dbPath,
    NEXT_TELEMETRY_DISABLED: "1",
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

try {
  await waitForServer();
  await assertPage("/", "Mundo Pankleos");
  await assertPage("/personagem/joao-lindao", "Ficha Protegida");
  await assertCharactersApi();
  await assertCharacterPatch();
  await assertRollsApi();
  await assertEventsApi();
  console.log("Smoke HTTP passou: páginas, APIs, persistência SQLite e SSE estão respondendo.");
} finally {
  server.kill("SIGTERM");
  await waitForExit();
  rmSync(tmpDir, { recursive: true, force: true });
}

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  let lastError;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`next start encerrou cedo:\n${serverOutput}`);
    }

    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(250);
  }

  throw new Error(`Servidor não ficou pronto: ${String(lastError)}\n${serverOutput}`);
}

async function assertPage(path, expectedText) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.status, 200, `${path} deve responder 200`);
  const html = await response.text();
  assert.match(html, new RegExp(escapeRegExp(expectedText)), `${path} deve conter ${expectedText}`);
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
    body: JSON.stringify({ patch: { hpCurrent: 13, notes }, pin: JOAO_PIN }),
  });
  assert.equal(patchResponse.status, 200, "PATCH de personagem deve responder 200");
  const patched = await patchResponse.json();
  assert.equal(patched.character.hpCurrent, 13, "PATCH deve persistir PV atual");
  assert.equal(patched.character.notes, notes, "PATCH deve persistir notas");

  const getResponse = await fetch(`${baseUrl}/api/characters/joao-lindao`, {
    headers: { "x-character-pin": JOAO_PIN },
  });
  assert.equal(getResponse.status, 200, "GET do personagem deve responder 200");
  const fetched = await getResponse.json();
  assert.equal(fetched.character.hpCurrent, 13, "GET deve refletir patch persistido");
  assert.equal(fetched.character.notes, notes, "GET deve refletir notas persistidas");
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

  const listResponse = await fetch(`${baseUrl}/api/rolls?limit=5`);
  assert.equal(listResponse.status, 200, "GET de rolagens deve responder 200");
  const body = await listResponse.json();
  assert.ok(
    body.rolls.some((storedRoll) => storedRoll.id === roll.id && storedRoll.result === 18),
    "rolagem criada deve aparecer no histórico",
  );
}

async function assertEventsApi() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${baseUrl}/api/events`, { signal: controller.signal });
    assert.equal(response.status, 200, "SSE deve responder 200");
    assert.equal(
      response.headers.get("content-type")?.includes("text/event-stream"),
      true,
      "SSE deve usar text/event-stream",
    );

    const reader = response.body?.getReader();
    assert.ok(reader, "SSE deve retornar stream");
    const chunk = await reader.read();
    const text = new TextDecoder().decode(chunk.value);
    assert.match(text, /event: hello/, "SSE deve enviar evento hello inicial");
    await reader.cancel();
  } finally {
    clearTimeout(timeout);
  }
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

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
