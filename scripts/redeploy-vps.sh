#!/usr/bin/env bash
# =============================================================================
# scripts/redeploy-vps.sh — atualização de rotina do app-dnd que JÁ roda na VPS.
#
#   bash scripts/redeploy-vps.sh              # pull + build + smoke + restart + verify
#   bash scripts/redeploy-vps.sh -y           # sem perguntar nada
#   bash scripts/redeploy-vps.sh --no-pull    # builda o código que já está aqui
#   bash scripts/redeploy-vps.sh --force      # rebuilda mesmo sem mudanças
#   bash scripts/redeploy-vps.sh rollback     # volta o binário anterior (segundos)
#
# Diferente do deploy-vps.sh, que MIGRA o deploy antigo de Next.js para o Rust
# (uma vez só). Aqui o app Rust já está no pm2 e a gente só troca a versão:
#
#   1. guardas (não-root, dono do repo, toolchain, pm2)
#   2. git pull --ff-only
#   3. build do frontend + binário  (o binário atual vira .deploy/app-dnd.prev)
#   4. smoke test em porta livre com SQLite temporário — produção intocada
#   5. backup do banco
#   6. pm2 restart na MESMA porta/host/banco de antes
#   7. verificação completa (delegada ao `deploy-vps.sh verify`)
#   8. verificação falhou? restaura o binário anterior e reinicia sozinho
#
# O app só é reiniciado depois que a versão nova compilou E passou no smoke.
# O banco nunca é tocado pelo build; o backup é só rede de segurança.
#
# Variáveis: APP_DND_PORT / APP_DND_HOST / APP_DND_DB sobrescrevem o que estiver
# valendo hoje (o default é reusar exatamente a configuração do processo no ar).
# =============================================================================
set -euo pipefail

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
cd "$(dirname "${BASH_SOURCE[0]}")/.."
ROOT="$(pwd)"
APP_NAME="app-dnd"
STATE_DIR="$ROOT/.deploy"
BACKUP_DIR="$ROOT/backup"
BIN="$ROOT/server/target/release/app-dnd"
PREV_BIN="$STATE_DIR/app-dnd.prev"

MODE="redeploy"; ASSUME_YES=0; DO_PULL=1; FORCE=0
for arg in "$@"; do
  case "$arg" in
    rollback)  MODE="rollback" ;;
    redeploy)  MODE="redeploy" ;;
    -y|--yes)  ASSUME_YES=1 ;;
    --no-pull) DO_PULL=0 ;;
    --force)   FORCE=1 ;;
    *) printf 'argumento desconhecido: %s\n' "$arg" >&2; exit 2 ;;
  esac
done

# ----------------------------------------------------------------------------- log
if [ -t 1 ]; then C_B=$'\e[1m'; C_G=$'\e[32m'; C_Y=$'\e[33m'; C_R=$'\e[31m'; C_0=$'\e[0m'; else C_B=; C_G=; C_Y=; C_R=; C_0=; fi
step() { printf '\n%s==> %s%s\n' "$C_B" "$*" "$C_0"; }
info() { printf '    %s\n' "$*"; }
ok()   { printf '    %s\xe2\x9c\x94%s %s\n' "$C_G" "$C_0" "$*"; }
warn() { printf '    %s\xe2\x9a\xa0%s %s\n' "$C_Y" "$C_0" "$*"; }
die()  { printf '\n%s\xe2\x9c\x98 %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }
confirm() {
  [ "$ASSUME_YES" -eq 1 ] && return 0
  printf '\n%s%s [s/N] %s' "$C_Y" "$1" "$C_0"
  read -r answer
  case "$answer" in s|S|y|Y|sim|SIM) return 0 ;; *) die "cancelado." ;; esac
}

export PATH="$HOME/.cargo/bin:$HOME/.bun/bin:$HOME/.local/bin:/usr/local/bin:$PATH"
[ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"

port_free() { [ -z "$(ss -ltnH "sport = :$1" 2>/dev/null)" ]; }
find_free_port() {
  local p
  for p in 3731 3732 3733 3734 3735 3736 3737 3738; do
    port_free "$p" && { echo "$p"; return; }
  done
  die "nao achei porta livre para o smoke test"
}
http_code() { curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$@" 2>/dev/null || echo 000; }
wait_http() { # url, segundos
  local i
  for i in $(seq 1 $(( $2 * 4 ))); do [ "$(http_code "$1")" = "200" ] && return 0; sleep 0.25; done
  return 1
}

# Configuração do processo que está no ar. Reusar é o comportamento certo: um
# redeploy não é hora de mudar porta, interface ou caminho do banco sem querer.
PORT=""; HOST=""; DB=""
read_live_config() {
  local out=""
  if have pm2 && have python3; then
    out=$(pm2 jlist 2>/dev/null | APP="$APP_NAME" python3 -c '
import json, os, sys
try: apps = json.load(sys.stdin)
except Exception: apps = []
for a in apps:
    if a.get("name") != os.environ["APP"]: continue
    e = a.get("pm2_env") or {}
    for k in ("PORT", "HOST", "APP_DND_DB"):
        print(str(e.get(k) or "").replace("\n", " "))
    break
' 2>/dev/null | tr -d '\r' || true)
  fi
  if [ -n "$out" ]; then
    local f; mapfile -t f <<<"$out"
    PORT="${f[0]:-}"; HOST="${f[1]:-}"; DB="${f[2]:-}"
  fi
  # o deploy-vps.sh grava esses arquivos quando sobe o app; servem de 2ª fonte
  [ -n "$PORT" ] || PORT=$(cat "$STATE_DIR/port" 2>/dev/null || true)
  [ -n "$HOST" ] || HOST=$(cat "$STATE_DIR/host" 2>/dev/null || true)
  PORT="${APP_DND_PORT:-${PORT:-8080}}"
  HOST="${APP_DND_HOST:-${HOST:-127.0.0.1}}"
  DB="${APP_DND_DB:-${DB:-$ROOT/data/app-dnd.sqlite}}"
}

sql() { # arquivo, consulta
  if have sqlite3; then sqlite3 "$1" "$2"
  elif have python3; then python3 - "$1" "$2" <<'PY'
import sqlite3, sys
con = sqlite3.connect(sys.argv[1])
for row in con.execute(sys.argv[2]): print("|".join(str(c) for c in row))
PY
  else return 1; fi
}

restart_app() {
  APP_DND_PORT="$PORT" APP_DND_HOST="$HOST" APP_DND_DB="$DB" \
    pm2 restart "$APP_NAME" --update-env >/dev/null 2>&1 ||
  APP_DND_PORT="$PORT" APP_DND_HOST="$HOST" APP_DND_DB="$DB" \
    pm2 start ecosystem.config.cjs --update-env >/dev/null
  pm2 save --force >/dev/null 2>&1 || true
}

# rename troca o arquivo mesmo com o processo rodando; cp por cima daria "Text file busy"
restore_prev_bin() {
  cp "$PREV_BIN" "$BIN.new" && mv -f "$BIN.new" "$BIN"
}

# ============================================================================= ROLLBACK
if [ "$MODE" = "rollback" ]; then
  step "Rollback: voltando o binário anterior"
  [ -f "$PREV_BIN" ] || die "nao existe $PREV_BIN (nenhum redeploy anterior guardou um binario)"
  read_live_config
  info "binário guardado: $(du -h "$PREV_BIN" | cut -f1), $(date -r "$PREV_BIN" '+%F %T')"
  confirm "Restaurar esse binário e reiniciar o app em $HOST:$PORT?"
  restore_prev_bin
  restart_app
  wait_http "http://127.0.0.1:$PORT/api/health" 20 && ok "app respondendo de novo" || die "app nao respondeu (pm2 logs $APP_NAME)"
  PREV_COMMIT=$(cat "$STATE_DIR/previous-redeploy-commit" 2>/dev/null || true)
  [ -n "$PREV_COMMIT" ] && info "o código no disco segue no commit atual; para voltar também: git reset --hard $PREV_COMMIT"
  bash scripts/deploy-vps.sh verify
  exit $?
fi

# ============================================================================= 1. GUARDAS
step "1/7 Guardas"
[ "$(id -u)" = "0" ] && die "nao rode como root: o pm2, o cargo e os arquivos sao do usuario dono do repo; root deixaria target/ e data/ com dono errado."
[ -n "${SUDO_USER:-}" ] && die "nao rode com sudo (mesmo motivo). Rode como o usuario dono do repositorio."
ok "usuário: $(id -un)"

git rev-parse --git-dir >/dev/null 2>&1 || die "nao e um repositorio git"
if have stat; then
  OWNER=$(stat -c %U "$ROOT" 2>/dev/null || true)
  if [ -n "$OWNER" ] && [ "$OWNER" != "$(id -un)" ]; then
    die "o repositorio e do usuario '$OWNER' e voce e '$(id -un)'"
  fi
fi
[ -f server/Cargo.toml ] || die "server/Cargo.toml nao existe - este repo nao esta na versao Rust"

for t in cargo cc git curl ss; do
  have "$t" || die "$t ausente. Para a primeira instalacao use: bash scripts/deploy-vps.sh deploy"
done
if have bun; then JS="bun"; PKG="bun"
elif have node; then JS="node"; PKG="npm"
else die "instale bun ou node 20+"; fi
have pm2 || die "pm2 ausente - este script assume o app ja rodando; use deploy-vps.sh na primeira vez"
ok "toolchain: cargo $(cargo --version | awk '{print $2}'), $PKG, pm2 $(pm2 -v 2>/dev/null | tail -1)"

read_live_config
info "configuração no ar: $HOST:$PORT (db: $DB)"
if [ -n "$(pm2 pid "$APP_NAME" 2>/dev/null | tr -d '[:space:]')" ]; then
  ok "pm2 '$APP_NAME' presente"
else
  warn "pm2 nao tem '$APP_NAME' rodando - vou subir do zero com o ecosystem.config.cjs"
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  warn "ha alteracoes locais nao commitadas neste repositorio:"
  git status --short | sed 's/^/      /'
  [ "$DO_PULL" -eq 1 ] && die "commite, descarte (git checkout -- .) ou rode com --no-pull"
fi

# ============================================================================= 2. CÓDIGO
HEAD_BEFORE=$(git rev-parse HEAD)
step "2/7 Código"
if [ "$DO_PULL" -eq 1 ]; then
  info "branch: $(git rev-parse --abbrev-ref HEAD)"
  git pull --ff-only || die "git pull falhou (divergiu do remoto? resolva a mao)"
  HEAD_AFTER=$(git rev-parse HEAD)
  if [ "$HEAD_BEFORE" = "$HEAD_AFTER" ]; then
    info "já estava atualizado ($(git rev-parse --short HEAD))"
  else
    ok "atualizado: ${HEAD_BEFORE:0:8} -> ${HEAD_AFTER:0:8}"
    git --no-pager log --oneline "$HEAD_BEFORE..$HEAD_AFTER" | sed 's/^/      /'
    # O bash lê o script conforme executa: se o pull trocou ESTE arquivo, seguir
    # em frente executaria um meio-termo entre as duas versões.
    if ! git diff --quiet "$HEAD_BEFORE" "$HEAD_AFTER" -- "scripts/$(basename "$SELF")"; then
      [ "${REDEPLOY_REEXEC:-0}" = "1" ] && die "o script mudou de novo no pull; rode outra vez a mao"
      warn "o proprio script de redeploy mudou no pull - reiniciando com a versao nova"
      REDEPLOY_REEXEC=1 exec bash "$SELF" "$@"
    fi
  fi
else
  info "--no-pull: usando o código que já está aqui ($(git rev-parse --short HEAD))"
  HEAD_AFTER="$HEAD_BEFORE"
fi

# Nada mudou e o binário é mais novo que as fontes? Não há o que buildar.
sources_changed() {
  [ -x "$BIN" ] || return 0
  [ -n "$(find src server/src server/Cargo.toml server/seed.json package.json bun.lock index.html vite.config.ts \
            -newer "$BIN" -print -quit 2>/dev/null)" ]
}
if [ "$FORCE" -eq 0 ] && [ "$HEAD_BEFORE" = "$HEAD_AFTER" ] && ! sources_changed; then
  ok "binário já está na frente de todas as fontes - nada a rebuildar (use --force para forçar)"
  step "Verificando o app que está no ar"
  exec bash scripts/deploy-vps.sh verify
fi

confirm "Buildar $(git rev-parse --short HEAD), rodar o smoke e reiniciar o app em $HOST:$PORT?"

# ============================================================================= 3. BUILD
step "3/7 Build (frontend -> pré-compressão -> binário)"
mkdir -p "$STATE_DIR"
if [ -x "$BIN" ]; then
  cp "$BIN" "$PREV_BIN"
  echo "$HEAD_BEFORE" > "$STATE_DIR/previous-redeploy-commit"
  ok "binário atual guardado em .deploy/app-dnd.prev (rollback em segundos)"
fi

if [ "$PKG" = "bun" ]; then bun install --frozen-lockfile; else npm install --no-audit --no-fund; fi
rm -rf dist
if [ "$PKG" = "bun" ]; then bun run vite build; else npx vite build; fi
[ -f dist/index.html ] || die "vite build nao gerou dist/index.html"
"$JS" scripts/precompress.mjs dist
NBR=$(find dist -name '*.br' | wc -l)
[ "$NBR" -ge 3 ] || die "pre-compressao nao gerou os .br"
ok "dist/ pronto ($NBR arquivos .br)"

cargo build --release --manifest-path server/Cargo.toml
[ -x "$BIN" ] || die "cargo build nao gerou $BIN"
ASSET=$(grep -oE 'assets/[^"]+\.js' dist/index.html | head -1 || true)
if [ -n "$ASSET" ] && grep -q "$(basename "$ASSET")" "$BIN"; then
  ok "binário ($(du -h "$BIN" | cut -f1)) embute o dist/ recém-gerado"
else
  die "o binario nao embute o dist/ atual - build fora de ordem"
fi

# ============================================================================= 4. SMOKE
step "4/7 Smoke test do binário novo (produção segue no ar, intocada)"
SMOKE_P=$(find_free_port)
SMOKE_PORT="$SMOKE_P" SMOKE_BINARY="$BIN" "$JS" scripts/smoke-http.mjs ||
  die "smoke test falhou - NADA foi reiniciado; o app antigo continua no ar. Corrija e rode de novo."
ok "smoke passou na porta $SMOKE_P"

# ============================================================================= 5. BACKUP
step "5/7 Backup do banco"
mkdir -p "$BACKUP_DIR"
if [ -f "$DB" ]; then
  DEST="$BACKUP_DIR/app-dnd-$(date +%Y%m%d-%H%M%S).sqlite"
  if have sqlite3; then
    sqlite3 "$DB" ".backup '$DEST'"
  elif have python3; then
    python3 - "$DB" "$DEST" <<'PY'
import sqlite3, sys
src = sqlite3.connect(sys.argv[1]); dst = sqlite3.connect(sys.argv[2])
src.backup(dst); dst.close(); src.close()
PY
  else
    cp "$DB" "$DEST"
  fi
  [ -s "$DEST" ] || die "backup saiu vazio em $DEST"
  CHARS=$(sql "$DEST" "SELECT COUNT(*) FROM characters" 2>/dev/null || echo "?")
  ok "backup: $DEST ($CHARS fichas)"
  ls -1t "$BACKUP_DIR"/app-dnd-*.sqlite 2>/dev/null | tail -n +11 | xargs -r rm -f
else
  warn "banco ainda nao existe em $DB (sera criado com o seed na subida)"
fi

# ============================================================================= 6. RESTART
step "6/7 Reiniciando o app em $HOST:$PORT"
echo "$PORT" > "$STATE_DIR/port"; echo "$HOST" > "$STATE_DIR/host"
restart_app
if wait_http "http://127.0.0.1:$PORT/api/health" 20; then
  ok "/api/health respondeu"
else
  warn "o app nao respondeu em 20 s - restaurando o binario anterior"
  if [ -f "$PREV_BIN" ]; then
    restore_prev_bin
    restart_app
    if wait_http "http://127.0.0.1:$PORT/api/health" 20; then
      warn "versao ANTERIOR restaurada e no ar"
    else
      die "nem a versao anterior subiu - pm2 logs $APP_NAME"
    fi
  fi
  die "redeploy abortado; veja: pm2 logs $APP_NAME"
fi

# ============================================================================= 7. VERIFY
step "7/7 Verificação completa"
if bash scripts/deploy-vps.sh verify; then
  printf '\n%s\xe2\x9c\x94 Redeploy concluido.%s  %s -> %s\n' "$C_G" "$C_0" "${HEAD_BEFORE:0:8}" "$(git rev-parse --short HEAD)"
  info "logs: pm2 logs $APP_NAME     voltar atrás: bash scripts/redeploy-vps.sh rollback"
else
  printf '\n%s\xe2\x9c\x98 A verificacao apontou falhas.%s\n' "$C_R" "$C_0"
  if [ -f "$PREV_BIN" ]; then
    confirm "Restaurar o binário anterior e reiniciar?"
    restore_prev_bin
    restart_app
    wait_http "http://127.0.0.1:$PORT/api/health" 20 && ok "versão anterior restaurada" || warn "a versao anterior nao subiu - pm2 logs $APP_NAME"
    info "o código continua no commit novo; para voltar também: git reset --hard $HEAD_BEFORE"
  fi
  exit 1
fi
