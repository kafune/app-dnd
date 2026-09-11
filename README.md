# Fichas DnD — D&D companion

Webapp de fichas de D&D 5e (BR), organizadas em **pastas** — uma por mesa/campanha. Roda inteiro num **único binário Rust**
(~10 MB de RAM, sobe em milissegundos): API + SQLite + Server-Sent Events + frontend
embutido, servindo tudo da memória com Brotli pré-comprimido.

## Stack

- **Frontend**: React 19 · Vite 7 · TypeScript · Tailwind v4 · Zustand · react-router
- **Backend**: Rust (axum + tokio) · SQLite via rusqlite (embutido, sem lib do sistema)
- **Realtime**: Server-Sent Events (`/api/events`) — broadcast em memória, um processo
- **Deploy**: um binário (`server/target/release/app-dnd`) + a pasta `data/` com o SQLite

O frontend (`dist/`) é embutido no binário na compilação: não precisa de Node, `node_modules`
nem nginx servindo arquivos estáticos em produção.

## Rodar localmente (dev)

Requisitos: [Bun](https://bun.sh) (ou Node 20+) e [Rust](https://rustup.rs) estável.

```bash
bun install
bun run dev:server   # API + SSE em http://127.0.0.1:8080 (cria ./data/app-dnd.sqlite e popula o seed)
bun run dev          # Vite em http://localhost:3000 com proxy de /api para o servidor
```

## Deploy na VPS com o script (recomendado)

Na VPS, dentro do repositório já clonado (onde o Next rodava):

```bash
git pull
bash scripts/deploy-vps.sh check       # inventário: pm2, systemd, portas, nginx, banco, toolchain (não muda nada)
bash scripts/deploy-vps.sh deploy      # fluxo completo, pede confirmação antes de mexer
bash scripts/deploy-vps.sh verify      # revalida o deploy atual quando quiser
bash scripts/deploy-vps.sh cleanup     # mata resíduos do deploy antigo (unit systemd, Next de outro usuário) e revalida
bash scripts/deploy-vps.sh rollback    # emergência: volta o código e o Next do deploy anterior
```

## Atualizar a VPS quando o código muda (redeploy)

Depois que o app Rust já está no ar, o dia a dia é outro script — mais curto e com
rollback rápido:

```bash
bash scripts/redeploy-vps.sh             # pull + build + smoke + restart + verificação
bash scripts/redeploy-vps.sh -y          # sem confirmação (para colar num alias)
bash scripts/redeploy-vps.sh --no-pull   # builda o código que já está na VPS
bash scripts/redeploy-vps.sh --force     # rebuilda mesmo sem mudanças
bash scripts/redeploy-vps.sh rollback    # volta o binário anterior em segundos
```

Ordem: guardas (recusa rodar como root/sudo) → `git pull --ff-only` → build →
**smoke test numa porta livre com SQLite temporário** → backup do banco → `pm2 restart`
na mesma porta/host/banco de antes → verificação completa (reusa o `verify` do
`deploy-vps.sh`). O app só é reiniciado depois que a versão nova compilou e passou no
smoke; se a verificação falhar, o binário anterior (guardado em `.deploy/app-dnd.prev`)
volta sozinho. Se nada mudou desde o último build, ele avisa e só revalida o que está no ar.

## Build e deploy manual em VPS (detalhes)

O `deploy` só derruba o app antigo depois que a versão Rust já compilou e passou no smoke test
numa porta temporária. Ordem: inventário → toolchain (instala rustup/pm2 se faltar) → build →
smoke → backup do banco em `backup/` → remove pm2/systemd/processos do Next → sobe o binário
no pm2 → bateria de verificações (API, contagem de fichas igual ao banco, brotli/ETag, rota do
SPA, SSE, memória, porta do nginx, resíduos do deploy antigo). Reutiliza a porta em que o app
antigo escutava; para forçar, `APP_DND_PORT=8080 APP_DND_HOST=127.0.0.1 bash scripts/deploy-vps.sh deploy`.

## Build e deploy manual em VPS

Requisitos na VPS: Rust estável (`curl https://sh.rustup.rs -sSf | sh`) e um compilador C
(`apt install build-essential`, para compilar o SQLite embutido). Bun/Node só para o build do frontend.

```bash
git clone <repo> app-dnd && cd app-dnd
bun install
bun run build        # vite build + pré-compressão br/gz + cargo build --release (embute o dist/)
bun run start        # = ./server/target/release/app-dnd  (porta 8080)
```

Variáveis de ambiente (todas opcionais):

| Variável | Default | O que faz |
| --- | --- | --- |
| `APP_DND_DB` | `./data/app-dnd.sqlite` | caminho do banco |
| `PORT` / `HOST` | `8080` / `0.0.0.0` | porta e interface (atrás do nginx use `HOST=127.0.0.1`) |
| `APP_DND_BIND` | — | `host:porta` completo, sobrescreve os dois acima |
| `APP_DND_MASTER_PIN` | (ver `CHARACTER_PINS.md`) | chave mestra do Mestre |
| `APP_DND_CHARACTER_PINS` | (ver `CHARACTER_PINS.md`) | `id:pin,id:pin` das fichas fixas do seed |

Só é preciso copiar para a VPS o binário e manter a pasta `data/`. Para atualizar:
`git pull && bun run build && pm2 restart app-dnd`.

### Com pm2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Com systemd

`/etc/systemd/system/app-dnd.service`:

```ini
[Unit]
Description=Fichas DnD (app-dnd)
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/app-dnd
ExecStart=/srv/app-dnd/server/target/release/app-dnd
Restart=always
User=app
Environment=HOST=127.0.0.1
Environment=PORT=8080
Environment=APP_DND_DB=/srv/app-dnd/data/app-dnd.sqlite

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable --now app-dnd
```

### Nginx reverse proxy (com SSE)

O binário já entrega assets com Brotli/gzip, ETag e `Cache-Control: immutable`; o nginx só
precisa fazer TLS e repassar. Importante: SSE precisa de `proxy_buffering off` e timeouts longos.

```nginx
server {
  listen 443 ssl http2;
  server_name dnd.exemplo.com;
  # ... certificados ssl ...

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # SSE
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 24h;
  }
}
```

### Backup do banco

O SQLite é um arquivo só. Em runtime, use:

```bash
sqlite3 data/app-dnd.sqlite ".backup 'backup/app-dnd-$(date +%F).sqlite'"
```

## Testes

```bash
bun run lint          # eslint
bun run typecheck     # tsc
bun run test          # regras puras (dados, descanso, criação de ficha, seed)
bun run test:server   # testes unitários do Rust (diff do log, banco em memória)
bun run test:smoke    # sobe o binário com SQLite temporário e valida SPA, APIs, cache, SSE
bun run test:all      # tudo acima + build
```

## Atalhos da ficha

- Clique no atributo → rola `1d20+mod` como teste.
- Clique em "save +X" no atributo → rola salvaguarda.
- Clique em uma perícia → rola. **Shift = vantagem**, **Alt = desvantagem**.
- Clique em "Acerto" / "Dano" no card de Combate para rolar a arma.
- Pode editar HP/slots/recursos só após "destravar" com o PIN (se definido).

## Modelo de dados

Tudo num arquivo `app-dnd.sqlite` (mesmo esquema da versão anterior em Node):

- `folders (id PK, name, pin, avatar_mime, avatar_data BLOB, avatar_version, created_at, updated_at)` — pastas: nome, foto e senha
- `characters (id PK, data JSON blob, updated_at, folder_id)` — a ficha inteira como JSON; `folder_id` espelha `folderId`
- `rolls (id PK, character_id, character_name, label, expression, result, detail JSON, created_at)` — 100 por ficha, 2000 no total
- `character_log (id PK, character_id, by, changes JSON, created_at)` — log de modificações, 100 por ficha
- `avatars (character_id PK, mime, data BLOB, version, updated_at)` — foto de perfil em bytes, fora do JSON da ficha
- `homebrew (id PK, kind, data JSON, created_at, updated_at)` — raças, talentos e traços raciais criados pelo Mestre

PINs das fichas do seed vêm de `APP_DND_CHARACTER_PINS`; fichas criadas no app guardam o PIN
no próprio registro (`Character.pin`). Sem PIN, a ficha é aberta. As APIs nunca devolvem o PIN.

**Pastas.** Só o Mestre (chave mestra) cria, edita e apaga pastas; a senha é obrigatória na
criação. Jogador entra na pasta com a senha dela e só cria ficha dentro de uma pasta. O PIN de
uma ficha também abre a pasta dela, só para ver (mesa e lista). Pasta com fichas não pode ser
apagada. Na primeira subida depois da atualização, as fichas que já existiam vão para a pasta
**Mundo Pankleos**, criada **sem senha** — defina uma em "Editar pasta".

Eventos em tempo real de ficha e rolagem só chegam a quem está inscrito na pasta
(`/api/events?folder=<id>&pin=<senha>`); eventos de pasta e homebrew chegam a todos.

Rotas além das de ficha e rolagem:

| Rota | Acesso | O que faz |
| --- | --- | --- |
| `GET /api/folders` | público | lista as pastas (nome, foto, se tem senha, quantas fichas) |
| `POST /api/folders`, `PUT` / `DELETE /api/folders/:id` | chave mestra | cria (`{name, pin}`), edita (pin vazio mantém) ou apaga pasta vazia |
| `GET /api/folders/:id` | senha da pasta, PIN de ficha dela ou chave mestra | fichas da pasta + `canCreate` |
| `GET /api/folders/:id/avatar?v=`, `PUT` / `DELETE` | público / chave mestra | foto da pasta |
| `POST /api/characters` | senha da pasta (header) ou chave mestra | cria a ficha na pasta `character.folderId` |
| `GET /api/characters` | chave mestra | resumo de todas as fichas de todas as pastas |
| `GET /api/characters/:id/summary` | público | resumo de uma ficha (tela de PIN de link direto) |
| `GET` / `DELETE /api/rolls?folder=:id` | senha da pasta, PIN de ficha dela ou chave mestra | mesa da pasta (sem `folder`: só o Mestre) |
| `GET /api/characters/:id/avatar?v=` | público | foto de perfil (cache imutável quando `v` é a versão atual) |
| `PUT` / `DELETE /api/characters/:id/avatar` | PIN da ficha ou chave mestra | troca ou remove a foto (JPEG/PNG/WebP, até 1 MB) |
| `GET /api/homebrew` | público | lista o homebrew do Mestre |
| `POST /api/homebrew`, `PUT` / `DELETE /api/homebrew/:id` | chave mestra | cria, edita ou apaga homebrew (evento SSE `homebrew`) |
| `POST /api/master` | chave mestra | confere a chave da página `/mestre` |

Na primeira subida depois da atualização, imagens antigas de "aparência" guardadas dentro da
ficha viram foto de perfil automaticamente e saem do JSON.

## Arquitetura

```
Cliente (React SPA, Zustand)
   ↓ fetch /api/*                  ↓ EventSource('/api/events')
Binário Rust (axum)
   ├─ /assets/* servidos da memória (br/gz pré-comprimidos, ETag, immutable)
   ├─ rotas JSON (compressão on-the-fly) ─→ SQLite (rusqlite, WAL, um Mutex)
   └─ SSE ←─ broadcast em memória (cada evento serializado uma vez para todos)
```

O broadcast é in-memory por processo: **não escale para múltiplas instâncias**. Para a mesa,
um processo sobra (cada request custa microssegundos).

## Personagens

- **João Lindão** — Shadar-Kai, Ladino-Trapaceiro Arcano
- **Camargo** — Kenku, Bardo-Eloquência
- **Vinicíus** — Meio-Orc, Druida-Terra (Ártico)
- **Rudá** — Shade Thri-kreen, Paladino-Vingança

## Roadmap

- [ ] Combat tracker (iniciativa + conditions)
- [ ] Compendium de magias com tooltips
- [ ] Notas de sessão compartilhadas
- [ ] Avatares (upload local em `data/avatars/`)
- [ ] Mapa de batalha com tokens
