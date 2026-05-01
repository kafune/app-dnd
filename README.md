# Mesa do Pierre — D&D companion

Webapp de fichas para uma mesa de D&D 5e (BR). Roda inteiro num único processo Node — backend SQLite + Server-Sent Events para sync em tempo real entre os celulares da galera.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4
- Zustand no cliente
- **better-sqlite3** pra persistência (arquivo único `data/app-dnd.sqlite`)
- **Server-Sent Events** (`/api/events`) pra propagar mudanças de ficha e rolagens em tempo real

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000). O SQLite é criado em `./data/app-dnd.sqlite` na primeira request e populado com as 4 fichas.

## Deploy em VPS

Requisitos: Node 20+ e build-essentials (`apt install build-essential` no Debian/Ubuntu — better-sqlite3 compila um módulo nativo).

```bash
# clonar
git clone <repo> app-dnd && cd app-dnd

# instalar e buildar
npm ci
npm run build

# rodar
npm start  # ou: PORT=8080 npm start
```

### Com pm2 (processo permanente)

```bash
npm install -g pm2
pm2 start npm --name app-dnd -- start
pm2 save
pm2 startup     # gera linha do systemd pra rodar no boot
```

### Com systemd

`/etc/systemd/system/app-dnd.service`:

```ini
[Unit]
Description=Mesa do Pierre (app-dnd)
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/app-dnd
ExecStart=/usr/bin/node /srv/app-dnd/node_modules/.bin/next start -p 3000
Restart=always
User=app
Environment=NODE_ENV=production
Environment=APP_DND_DB=/srv/app-dnd/data/app-dnd.sqlite

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable --now app-dnd
```

### Nginx reverse proxy (com SSE)

Importante: SSE precisa de `proxy_buffering off` e timeouts longos.

```nginx
server {
  listen 443 ssl http2;
  server_name dnd.exemplo.com;
  # ... certificados ssl ...

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # SSE
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 24h;
    chunked_transfer_encoding off;
  }
}
```

### Backup do banco

O SQLite é um arquivo só. Backup é `cp data/app-dnd.sqlite backup/`. Em runtime, use:

```bash
sqlite3 data/app-dnd.sqlite ".backup 'backup/app-dnd-$(date +%F).sqlite'"
```

## Atalhos da ficha

- Clique no atributo → rola `1d20+mod` como teste.
- Clique em "save +X" no atributo → rola salvaguarda.
- Clique em uma perícia → rola. **Shift = vantagem**, **Alt = desvantagem**.
- Clique em "Acerto" / "Dano" no card de Combate para rolar a arma.
- Pode editar HP/slots/recursos só após "destravar" com o PIN (se definido).

## Modelo de dados

Tudo num arquivo `app-dnd.sqlite`:

- `characters (id PK, data JSON blob, updated_at)` — a ficha inteira como JSON
- `rolls (id PK, character_id, label, expression, result, detail JSON, created_at)` — histórico (mantém últimas 200)

PINs são armazenados na ficha (`Character.pin`). Sem PIN, a ficha é editável por qualquer cliente. Com PIN, o cliente precisa ter feito "destravar" (que passa a validar o PIN nas requisições).

## Arquitetura

```
Cliente (Zustand)
   ↓ fetch
   ↓ EventSource('/api/events')   ← SSE para receber updates
   ↓
Next.js Route Handlers (Node runtime)
   ↓
SQLite (better-sqlite3, WAL)
   ↑
EventBus (in-memory) → broadcast SSE pra todos os clientes
```

Como o EventBus é in-memory por processo, **não escale para múltiplas instâncias** (a sincronização realtime quebraria entre processos). Para a mesa, um Node único basta.

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
