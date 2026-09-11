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
const MASTER_PIN = "670067";
// PNG 1×1 válido, para a foto de perfil.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);
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
    // Fixa os PINs: na VPS o ambiente pode ter APP_DND_MASTER_PIN/APP_DND_CHARACTER_PINS
    // próprios, e as asserções de autorização abaixo esperam os defaults.
    APP_DND_MASTER_PIN: MASTER_PIN,
    APP_DND_CHARACTER_PINS: `joao-lindao:${JOAO_PIN},camargo-fofo:3816,vinicius-fofo:9052,ruda-felpudo:6148`,
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
  await assertMasterAndHomebrew();
  await assertAvatars();
  await assertPinTrim();
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
  assert.equal(original.role, "jogador", "PIN da ficha deve receber papel de jogador");
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
    headers: { "x-character-pin": MASTER_PIN },
  });
  assert.equal(master.status, 200, "chave mestra deve abrir qualquer ficha");
  assert.equal((await master.json()).role, "mestre", "chave mestra deve receber papel de mestre");
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
  assert.equal(body.role, "jogador", "criador entra como jogador");
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

/** Cria uma ficha mínima para os testes e devolve o corpo da resposta. */
async function createSmokeCharacter(characterName, pin, extra = {}) {
  const response = await fetch(`${baseUrl}/api/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      character: {
        playerName: "Smoke",
        characterName,
        ...(pin === undefined ? {} : { pin }),
        sheet: { species: "Humano", classes: [{ name: "Guerreiro", level: 1 }], abilityScores: { str: 10 } },
        hpCurrent: 10,
        hpMax: 10,
        hpTemp: 0,
        spellSlots: {},
        resources: [],
        ...extra,
      },
    }),
  });
  assert.equal(response.status, 201, `POST de ${characterName} deve criar a ficha`);
  return response.json();
}

async function assertMasterAndHomebrew() {
  const master = (pin) =>
    fetch(`${baseUrl}/api/master`, { method: "POST", headers: pin ? { "x-character-pin": pin } : {} });
  assert.equal((await master()).status, 403, "checagem da chave mestra sem PIN deve dar 403");
  assert.equal((await master(JOAO_PIN)).status, 403, "PIN de jogador não é chave mestra");
  const ok = await master(MASTER_PIN);
  assert.equal(ok.status, 200, "chave mestra deve ser aceita");
  assert.deepEqual(await ok.json(), { ok: true });

  const hb = (method, path, body, pin) =>
    fetch(`${baseUrl}/api/homebrew${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(pin ? { "x-character-pin": pin } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  const race = { kind: "race", data: { name: "Shade Smoke", description: "Espírito preso ao mundo.", traits: [] } };
  assert.equal((await hb("POST", "", race)).status, 403, "criar homebrew sem PIN deve dar 403");
  assert.equal((await hb("POST", "", race, JOAO_PIN)).status, 403, "criar homebrew exige a chave mestra");

  const badKind = await hb("POST", "", { kind: "classe", data: { name: "X" } }, MASTER_PIN);
  assert.equal(badKind.status, 400);
  assert.deepEqual(await badKind.json(), { error: "bad_kind" });
  const noName = await hb("POST", "", { kind: "feat", data: { name: "   " } }, MASTER_PIN);
  assert.equal(noName.status, 400);
  assert.deepEqual(await noName.json(), { error: "bad_request" });

  const created = await hb("POST", "", race, MASTER_PIN);
  assert.equal(created.status, 201, "Mestre cria raça homebrew");
  const { item } = await created.json();
  assert.match(item.id, /^hb-[0-9a-f]{10}$/);
  assert.equal(item.kind, "race");
  assert.equal(item.data.name, "Shade Smoke");
  assert.ok(item.updatedAt, "item deve ter updatedAt");

  const dup = await hb("POST", "", { kind: "race", data: { name: "  SHADE smóke " } }, MASTER_PIN);
  assert.equal(dup.status, 409, "nome repetido (caixa/acento/espaço) deve dar 409");
  assert.deepEqual(await dup.json(), { error: "name_taken" });

  const otherKind = await hb("POST", "", { kind: "feat", data: { name: "Shade Smoke" } }, MASTER_PIN);
  assert.equal(otherKind.status, 201, "mesmo nome em outro tipo é permitido");
  const featId = (await otherKind.json()).item.id;

  let list = await fetch(`${baseUrl}/api/homebrew`).then((r) => r.json());
  assert.ok(list.items.some((entry) => entry.id === item.id && entry.data.name === "Shade Smoke"), "GET lista a raça");
  assert.equal(list.items[0].kind, "feat", "lista ordenada por tipo");

  const renamed = { data: { ...race.data, name: "Shade Smoke Revisada" } };
  assert.equal((await hb("PUT", `/${item.id}`, renamed)).status, 403, "editar homebrew exige a chave mestra");
  assert.equal((await hb("PUT", "/hb-nao-existe", renamed, MASTER_PIN)).status, 404);
  const clash = await hb("PUT", `/${item.id}`, { data: { name: "shade smoke" } }, MASTER_PIN);
  assert.equal(clash.status, 200, "renomear para o próprio nome não conflita");
  const put = await hb("PUT", `/${item.id}`, renamed, MASTER_PIN);
  assert.equal(put.status, 200, "Mestre edita homebrew");
  const updated = (await put.json()).item;
  assert.equal(updated.kind, "race");
  assert.equal(updated.data.name, "Shade Smoke Revisada");

  list = await fetch(`${baseUrl}/api/homebrew`).then((r) => r.json());
  assert.equal(
    list.items.find((entry) => entry.id === item.id)?.data.name,
    "Shade Smoke Revisada",
    "cache do homebrew deve ser invalidado após edição",
  );

  assert.equal((await hb("DELETE", `/${item.id}`)).status, 403, "apagar homebrew exige a chave mestra");
  const removed = await hb("DELETE", `/${item.id}`, undefined, MASTER_PIN);
  assert.equal(removed.status, 200);
  assert.deepEqual(await removed.json(), { ok: true });
  assert.equal((await hb("DELETE", `/${item.id}`, undefined, MASTER_PIN)).status, 404, "apagar de novo dá 404");
  assert.equal((await hb("DELETE", `/${featId}`, undefined, MASTER_PIN)).status, 200);
  list = await fetch(`${baseUrl}/api/homebrew`).then((r) => r.json());
  assert.equal(list.items.length, 0, "homebrew removido some da lista");
}

async function assertAvatars() {
  const pin = "5555";
  const body = await createSmokeCharacter("Smoke Avatar", pin, { avatarVersion: "hack" });
  const id = body.character.id;
  assert.equal(body.character.avatarVersion, undefined, "cliente não define avatarVersion na criação");
  const url = `${baseUrl}/api/characters/${id}/avatar`;
  const put = (bytes, type, withPin) =>
    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": type, ...(withPin ? { "x-character-pin": withPin } : {}) },
      body: bytes,
    });

  assert.equal((await fetch(url)).status, 404, "sem foto, GET dá 404");
  assert.equal((await put(PNG_1X1, "image/png")).status, 403, "PUT sem PIN deve dar 403");
  assert.equal((await put(PNG_1X1, "image/png", "0000")).status, 403, "PUT com PIN errado deve dar 403");
  const ghost = await fetch(`${baseUrl}/api/characters/nao-existe/avatar`, {
    method: "PUT",
    headers: { "Content-Type": "image/png", "x-character-pin": pin },
    body: PNG_1X1,
  });
  assert.equal(ghost.status, 404, "PUT para ficha inexistente deve dar 404");

  const badType = await put(PNG_1X1, "text/plain", pin);
  assert.equal(badType.status, 415);
  assert.deepEqual(await badType.json(), { error: "bad_type" });
  const badMagic = await put(Buffer.from("isto não é uma imagem"), "image/png", pin);
  assert.equal(badMagic.status, 400);
  assert.deepEqual(await badMagic.json(), { error: "bad_image" });
  assert.equal((await put(PNG_1X1, "image/jpeg", pin)).status, 400, "tipo declarado precisa bater com os bytes");
  const tooLarge = await put(Buffer.alloc(1024 * 1024 + 16), "image/png", pin);
  assert.equal(tooLarge.status, 413, "foto acima de 1 MB deve dar 413");

  const uploaded = await put(PNG_1X1, "image/png; charset=binary", pin);
  assert.equal(uploaded.status, 200, "PUT com PIN deve gravar a foto");
  const saved = await uploaded.json();
  assert.equal(saved.role, "jogador");
  const version = saved.character.avatarVersion;
  assert.match(version, /^[0-9a-f]{12}$/, "ficha ganha avatarVersion");
  assert.equal(saved.character.pin, undefined, "resposta não expõe PIN");

  const got = await fetch(url);
  assert.equal(got.status, 200);
  assert.equal(got.headers.get("content-type"), "image/png");
  assert.equal(got.headers.get("etag"), `"${version}"`);
  assert.equal(got.headers.get("cache-control"), "no-cache", "sem ?v= revalida");
  assert.equal(got.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(Buffer.from(await got.arrayBuffer()), PNG_1X1, "GET devolve os mesmos bytes");

  const versioned = await fetch(`${url}?v=${version}`);
  assert.match(versioned.headers.get("cache-control") ?? "", /immutable/, "?v=<versão> é cache imutável");
  await versioned.arrayBuffer();
  const stale = await fetch(`${url}?v=velha`);
  assert.equal(stale.headers.get("cache-control"), "no-cache", "versão errada não é imutável");
  await stale.arrayBuffer();
  const revalidated = await fetch(url, { headers: { "if-none-match": `"${version}"` } });
  assert.equal(revalidated.status, 304, "ETag igual deve responder 304");

  let list = await fetch(`${baseUrl}/api/characters`).then((r) => r.json());
  assert.equal(list.characters.find((c) => c.id === id)?.avatarVersion, version, "listagem pública traz avatarVersion");
  assert.equal(list.characters.find((c) => c.id === "joao-lindao")?.avatarVersion, null, "sem foto, avatarVersion é null");

  const log = await fetch(`${baseUrl}/api/characters/${id}?log=1`, { headers: { "x-character-pin": pin } }).then((r) => r.json());
  assert.deepEqual(log.log[0].changes, [{ field: "Foto de perfil", note: "atualizada" }], "upload entra no log");

  const hacked = await fetch(`${baseUrl}/api/characters/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patch: { avatarVersion: "hack", hpCurrent: 7 }, pin }),
  }).then((r) => r.json());
  assert.equal(hacked.character.avatarVersion, version, "PATCH não troca avatarVersion");
  assert.equal(hacked.character.hpCurrent, 7);

  const del = (withPin) =>
    fetch(url, { method: "DELETE", headers: withPin ? { "x-character-pin": withPin } : {} });
  assert.equal((await del()).status, 403, "DELETE da foto sem PIN deve dar 403");
  const cleared = await del(pin);
  assert.equal(cleared.status, 200);
  assert.equal((await cleared.json()).character.avatarVersion, undefined, "DELETE limpa avatarVersion");
  assert.equal((await fetch(url)).status, 404, "foto removida dá 404");
  assert.equal((await del(pin)).status, 200, "DELETE da foto é idempotente");
  list = await fetch(`${baseUrl}/api/characters`).then((r) => r.json());
  assert.equal(list.characters.find((c) => c.id === id)?.avatarVersion, null, "cache público invalidado ao remover");

  assert.equal((await put(PNG_1X1, "image/png", pin)).status, 200);
  const gone = await fetch(`${baseUrl}/api/characters/${id}`, { method: "DELETE", headers: { "x-character-pin": pin } });
  assert.equal(gone.status, 200);
  assert.equal((await fetch(url)).status, 404, "deletar a ficha apaga a foto");
}

async function assertPinTrim() {
  const trimmed = await createSmokeCharacter("Smoke Pin Trim", " 9999 ");
  assert.equal(trimmed.character.protected, true, "PIN com espaços ainda protege a ficha");
  const id = trimmed.character.id;
  const patched = await fetch(`${baseUrl}/api/characters/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patch: { hpCurrent: 3 }, pin: "9999" }),
  });
  assert.equal(patched.status, 200, "PIN é guardado aparado: PATCH com '9999' funciona");
  const opened = await fetch(`${baseUrl}/api/characters/${id}`, { headers: { "x-character-pin": "9999" } });
  assert.equal(opened.status, 200, "GET com o PIN aparado funciona");
  await opened.arrayBuffer();

  // A resposta autorizada sempre marca `protected: true`; o que prova que o PIN só de
  // espaços foi descartado é a ficha abrir sem PIN nenhum.
  const blank = await createSmokeCharacter("Smoke Pin Vazio", "   ");
  const openGet = await fetch(`${baseUrl}/api/characters/${blank.character.id}`);
  assert.equal(openGet.status, 200, "PIN só de espaços vira ficha aberta (abre sem PIN)");
  await openGet.arrayBuffer();

  assert.equal(
    (await fetch(`${baseUrl}/api/characters/${id}`, { method: "DELETE", headers: { "x-character-pin": "9999" } })).status,
    200,
  );
  assert.equal((await fetch(`${baseUrl}/api/characters/${blank.character.id}`, { method: "DELETE" })).status, 200);
  const after = await fetch(`${baseUrl}/api/characters`).then((r) => r.json());
  assert.equal(after.characters.length, 4, "fichas de teste removidas");
}

async function assertRollsApi() {
  const novaRolagem = () => ({
    id: randomUUID(),
    characterId: "joao-lindao",
    characterName: "Zorrilho Pabrantes",
    label: "Smoke Furtividade",
    expression: "1d20+6",
    result: 18,
    detail: { rolls: [12], modifier: 6 },
    createdAt: new Date().toISOString(),
  });
  const post = (roll, pin) =>
    fetch(`${baseUrl}/api/rolls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(pin ? { "x-character-pin": pin } : {}),
      },
      body: JSON.stringify({ roll }),
    });
  const del = (query, pin) =>
    fetch(`${baseUrl}/api/rolls${query}`, {
      method: "DELETE",
      headers: pin ? { "x-character-pin": pin } : {},
    });

  // --- escrita sem autorização não entra no histórico
  const semPin = await post(novaRolagem());
  assert.equal(semPin.status, 403, "POST sem PIN deve ser negado");
  assert.deepEqual(await semPin.json(), { error: "bad_pin" });

  const pinErrado = await post(novaRolagem(), "0000");
  assert.equal(pinErrado.status, 403, "POST com PIN errado deve ser negado");

  const fichaFantasma = await post({ ...novaRolagem(), characterId: "nao-existe" }, JOAO_PIN);
  assert.equal(fichaFantasma.status, 404, "POST para ficha inexistente deve dar 404");

  const avulsa = await post({ ...novaRolagem(), characterId: null, characterName: undefined });
  assert.equal(avulsa.status, 403, "rolagem sem ficha exige a chave mestra");

  const vazio = await fetch(`${baseUrl}/api/rolls?limit=5`).then((r) => r.json());
  assert.equal(vazio.rolls.length, 0, "nada recusado pode ter entrado no histórico");

  // --- escrita autorizada
  const minha = novaRolagem();
  const postResponse = await post(minha, JOAO_PIN);
  assert.equal(postResponse.status, 200, "POST com o PIN da ficha deve responder 200");
  const posted = await postResponse.json();
  assert.deepEqual(posted.roll, minha, "POST deve devolver a rolagem intacta");

  const doMestre = await post(
    { ...novaRolagem(), characterId: null, characterName: undefined },
    MASTER_PIN,
  );
  assert.equal(doMestre.status, 200, "chave mestra pode rolar sem ficha");

  const falsificada = await post(
    { ...novaRolagem(), characterName: "Mestre dos Magos" },
    JOAO_PIN,
  ).then((r) => r.json());
  assert.equal(
    falsificada.roll.characterName,
    "Zorrilho Pabrantes",
    "o nome exibido vem do servidor, não do cliente",
  );

  const listResponse = await fetch(`${baseUrl}/api/rolls?limit=5`);
  assert.equal(listResponse.status, 200, "GET de rolagens deve responder 200");
  const body = await listResponse.json();
  assert.ok(
    body.rolls.some((storedRoll) => storedRoll.id === minha.id && storedRoll.result === 18),
    "rolagem criada deve aparecer no histórico",
  );

  // --- limpeza também exige PIN
  const limparSemPin = await del("?characterId=joao-lindao");
  assert.equal(limparSemPin.status, 403, "DELETE de uma ficha sem PIN deve ser negado");

  const limparMesaSemPin = await del("");
  assert.equal(limparMesaSemPin.status, 403, "DELETE da mesa toda sem PIN deve ser negado");

  const daFicha = await del("?characterId=joao-lindao", JOAO_PIN).then((r) => r.json());
  assert.deepEqual(daFicha, { ok: true, removed: 2 }, "só saem as rolagens da ficha");

  // Limpar a mesa inteira é destrutivo para todos, mas qualquer PIN da mesa serve.
  const daMesa = await del("", JOAO_PIN).then((r) => r.json());
  assert.deepEqual(daMesa, { ok: true, removed: 1 }, "PIN de jogador limpa a mesa toda");
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
      headers: { "Content-Type": "application/json", "x-character-pin": MASTER_PIN },
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
