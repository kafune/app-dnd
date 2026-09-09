#!/usr/bin/env bash
# =============================================================================
# scripts/deploy-vps.sh — checa o que está no ar, remove o deploy antigo
# (Next.js/Node via pm2 ou systemd) e sobe a versão Rust, verificando cada fase.
#
# Uso (na VPS, dentro do repositório, depois de `git pull`):
#   bash scripts/deploy-vps.sh check        # inventário do que está deployado (não muda nada)
#   bash scripts/deploy-vps.sh deploy       # fluxo completo, pede confirmação antes de mexer
#   bash scripts/deploy-vps.sh deploy -y    # idem, sem confirmação
#   bash scripts/deploy-vps.sh verify       # só valida o deploy Rust atual
#   bash scripts/deploy-vps.sh cleanup      # mata resíduos do deploy antigo (systemd, Next DESTA pasta) e valida
#   APP_DND_PORT=8082 APP_DND_HOST=127.0.0.1 bash scripts/deploy-vps.sh restart   # troca porta/host sem rebuild
#   bash scripts/deploy-vps.sh rollback     # volta para o deploy anterior (Next.js)
#
# Ordem do `deploy` (o app antigo só é derrubado depois que o novo já buildou e
# passou no smoke test em porta temporária):
#   1. check      2. toolchain     3. build + smoke em porta livre
#   4. backup DB  5. remove antigo 6. sobe novo (pm2)  7. verify
#
# Variáveis opcionais: APP_DND_PORT (default: porta do deploy antigo ou 8080),
#   APP_DND_HOST (default: 127.0.0.1 se há nginx na frente, senão 0.0.0.0),
#   APP_DND_DB (default: ./data/app-dnd.sqlite)
# =============================================================================
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
ROOT="$(pwd)"
APP_NAME="app-dnd"
STATE_DIR="$ROOT/.deploy"
BACKUP_DIR="$ROOT/backup"
DB="${APP_DND_DB:-$ROOT/data/app-dnd.sqlite}"
BIN="$ROOT/server/target/release/app-dnd"
MODE="${1:-deploy}"
ASSUME_YES=0
for arg in "$@"; do [ "$arg" = "-y" ] || [ "$arg" = "--yes" ] && ASSUME_YES=1; done

# ----------------------------------------------------------------------------- log
if [ -t 1 ]; then C_B=$'\e[1m'; C_G=$'\e[32m'; C_Y=$'\e[33m'; C_R=$'\e[31m'; C_0=$'\e[0m'; else C_B=; C_G=; C_Y=; C_R=; C_0=; fi
FAILS=0; WARNS=0; PASSES=0
step() { printf '\n%s==> %s%s\n' "$C_B" "$*" "$C_0"; }
info() { printf '    %s\n' "$*"; }
ok()   { PASSES=$((PASSES+1)); printf '    %s✔%s %s\n' "$C_G" "$C_0" "$*"; }
warn() { WARNS=$((WARNS+1)); printf '    %s⚠%s %s\n' "$C_Y" "$C_0" "$*"; }
bad()  { FAILS=$((FAILS+1)); printf '    %s✘%s %s\n' "$C_R" "$C_0" "$*"; }
die()  { printf '\n%s✘ %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }
summary() {
  printf '\n%s---- %s: %d ok, %d avisos, %d falhas ----%s\n' "$C_B" "$1" "$PASSES" "$WARNS" "$FAILS" "$C_0"
  [ "$FAILS" -eq 0 ]
}
confirm() {
  [ "$ASSUME_YES" -eq 1 ] && return 0
  printf '\n%s%s [s/N] %s' "$C_Y" "$1" "$C_0"
  read -r answer
  case "$answer" in s|S|y|Y|sim|SIM) return 0 ;; *) die "cancelado pelo usuário." ;; esac
}

# PATH de ferramentas instaladas no $HOME (bun, cargo) mesmo em shell não interativo
export PATH="$HOME/.cargo/bin:$HOME/.bun/bin:$HOME/.local/bin:/usr/local/bin:$PATH"
[ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"

# ----------------------------------------------------------------------------- helpers
# quem escuta numa porta TCP: "pid cmd" ou vazio
port_owner() {
  ss -ltnpH "sport = :$1" 2>/dev/null | grep -oE 'pid=[0-9]+,fd' | head -1 | sed 's/pid=//;s/,fd//' | while read -r pid; do
    [ -n "$pid" ] && printf '%s %s' "$pid" "$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null | cut -c1-120 | sed 's/ *$//')"
  done
  return 0
}
port_free() { [ -z "$(ss -ltnH "sport = :$1" 2>/dev/null)" ]; }
find_free_port() {
  local p
  for p in 3711 3712 3713 3714 3715 3716 3717 3718 3719 3720; do port_free "$p" && { echo "$p"; return; }; done
  die "não achei porta livre para o smoke test"
}
http_code() { curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$@" 2>/dev/null || echo 000; }
wait_http() { # url, segundos
  local i; for i in $(seq 1 $(( $2 * 4 ))); do [ "$(http_code "$1")" = "200" ] && return 0; sleep 0.25; done; return 1
}

# sql "consulta" -> usa sqlite3 ou python3
sql() {
  if have sqlite3; then sqlite3 "$DB" "$1"
  elif have python3; then python3 - "$DB" "$1" <<'PY'
import sqlite3, sys
con = sqlite3.connect(sys.argv[1])
for row in con.execute(sys.argv[2]): print("|".join(str(c) for c in row))
PY
  else return 1; fi
}
db_counts() { # -> "chars rolls log"
  [ -f "$DB" ] || { echo "0 0 0"; return; }
  local c r l
  c=$(sql "SELECT COUNT(*) FROM characters" 2>/dev/null || echo "?")
  r=$(sql "SELECT COUNT(*) FROM rolls" 2>/dev/null || echo "?")
  l=$(sql "SELECT COUNT(*) FROM character_log" 2>/dev/null || echo "?")
  echo "$c $r $l"
}

# pm2: preenche PM2_* para o app (STATUS vazio = não existe)
PM2_STATUS=""; PM2_SCRIPT=""; PM2_ARGS=""; PM2_CWD=""; PM2_PID=""; PM2_RESTARTS=""; PM2_UNSTABLE=""
detect_pm2() {
  PM2_STATUS=""; PM2_SCRIPT=""; PM2_ARGS=""; PM2_CWD=""; PM2_PID=""; PM2_RESTARTS=""; PM2_UNSTABLE=""
  have pm2 || return 0
  local line
  line=$(pm2 jlist 2>/dev/null | python3 -c '
import json, sys
try: apps = json.load(sys.stdin)
except Exception: apps = []
for a in apps:
    if a.get("name") == "'"$APP_NAME"'":
        e = a.get("pm2_env", {})
        args = e.get("args", [])
        if not isinstance(args, list): args = [str(args)]
        print("\t".join(str(x) for x in [e.get("status",""), e.get("pm_exec_path",""), " ".join(args), e.get("pm_cwd",""), a.get("pid") or "", e.get("restart_time",""), e.get("unstable_restarts","")]))
        break
' 2>/dev/null || true)
  if [ -z "$line" ] && ! have python3; then
    # sem python3: raspa a tabela do `pm2 describe`
    local desc; desc=$(pm2 describe "$APP_NAME" 2>/dev/null || true)
    printf '%s' "$desc" | grep -q 'status' || return 0
    field() { printf '%s\n' "$desc" | grep -E "^│ $1 " | head -1 | awk -F'│' '{gsub(/^ +| +$/,"",$3); print $3}' || true; }
    PM2_STATUS=$(field 'status'); PM2_SCRIPT=$(field 'script path'); PM2_ARGS=$(field 'script args')
    PM2_CWD=$(field 'exec cwd'); PM2_RESTARTS=$(field 'restarts'); PM2_UNSTABLE=$(field 'unstable restarts')
    [ "$PM2_ARGS" = "N/A" ] && PM2_ARGS=""
    PM2_PID=$(pm2 pid "$APP_NAME" 2>/dev/null | tail -1 | tr -d ' ' || true)
    return 0
  fi
  [ -n "$line" ] || return 0
  IFS=$'\t' read -r PM2_STATUS PM2_SCRIPT PM2_ARGS PM2_CWD PM2_PID PM2_RESTARTS PM2_UNSTABLE <<<"$line"
}

SYSTEMD_UNIT=""; SYSTEMD_ACTIVE=""
detect_systemd() {
  SYSTEMD_UNIT=""; SYSTEMD_ACTIVE=""
  have systemctl || return 0
  # captura antes de filtrar: `systemctl | grep -q` pode falhar por SIGPIPE (falso negativo)
  local units; units=$(systemctl list-unit-files --type=service --no-legend --no-pager 2>/dev/null || true)
  if printf '%s\n' "$units" | grep -qE "^${APP_NAME}\.service"; then
    SYSTEMD_UNIT="${APP_NAME}.service"
    SYSTEMD_ACTIVE=$(systemctl is-active "$SYSTEMD_UNIT" 2>/dev/null || true)
  fi
}

NGINX_PORT=""; NGINX_SERVER=""; NGINX_BUFFERING=""; NGINX_FILES=""
detect_nginx() {
  NGINX_PORT=""; NGINX_SERVER=""; NGINX_BUFFERING=""; NGINX_FILES=""
  local dirs="/etc/nginx/sites-enabled /etc/nginx/conf.d"
  NGINX_FILES=$(grep -lsE 'proxy_pass\s+http://(127\.0\.0\.1|localhost):[0-9]+' $dirs 2>/dev/null | tr '\n' ' ' || true)
  [ -n "$NGINX_FILES" ] || return 0
  NGINX_PORT=$(grep -hoE 'proxy_pass\s+http://(127\.0\.0\.1|localhost):[0-9]+' $NGINX_FILES 2>/dev/null | grep -oE '[0-9]+$' | sort | uniq -c | sort -rn | awk 'NR==1{print $2}' || true)
  NGINX_SERVER=$(grep -hoE 'server_name\s+[^;]+' $NGINX_FILES 2>/dev/null | head -1 | awk '{print $2}' || true)
  if grep -qsE 'proxy_buffering\s+off' $NGINX_FILES 2>/dev/null; then NGINX_BUFFERING="off"; else NGINX_BUFFERING="on"; fi
}

# runtime JS para scripts .mjs (bun ou node)
JS=""; PKG=""
detect_js() {
  if have bun; then JS="bun"; PKG="bun"; elif have node; then JS="node"; PKG="npm"; else JS=""; PKG=""; fi
}

# ============================================================================= FASES
phase_check() {
  step "1/7 Inventário do que está deployado em $ROOT"
  info "commit atual: $(git rev-parse --short HEAD 2>/dev/null || echo '?') ($(git log -1 --format=%s 2>/dev/null | cut -c1-60))"
  [ -f server/Cargo.toml ] && ok "repositório já está na versão Rust (server/Cargo.toml presente)" || bad "server/Cargo.toml não existe — faça git pull da versão Rust antes"

  info "--- pm2"
  if have pm2; then
    detect_pm2
    if [ -n "$PM2_STATUS" ]; then
      info "pm2 '$APP_NAME': status=$PM2_STATUS pid=${PM2_PID:-—} restarts=$PM2_RESTARTS"
      info "  script: $PM2_SCRIPT ${PM2_ARGS:+args: $PM2_ARGS}"
      info "  cwd:    $PM2_CWD"
      case "$PM2_SCRIPT $PM2_ARGS" in
        *bun*|*next*|*npm*|*node*) warn "deploy ANTIGO (Node/Next) rodando no pm2" ;;
        *server/target/release/app-dnd*) ok "pm2 já roda o binário Rust" ;;
        *) warn "pm2 roda algo que não reconheço: $PM2_SCRIPT" ;;
      esac
    else
      info "pm2 instalado, mas sem processo '$APP_NAME'"
    fi
  else
    warn "pm2 não encontrado (será instalado no deploy)"
  fi

  info "--- systemd"
  detect_systemd
  if [ -n "$SYSTEMD_UNIT" ]; then
    warn "unit $SYSTEMD_UNIT existe (estado: $SYSTEMD_ACTIVE) — será parada e desabilitada"
  else
    info "sem unit systemd '$APP_NAME'"
  fi

  info "--- portas"
  local p owner
  for p in 3000 8080; do
    owner=$(port_owner "$p")
    if [ -n "$owner" ]; then info "porta $p: $owner"; else info "porta $p: livre"; fi
  done

  info "--- nginx"
  detect_nginx
  if [ -n "$NGINX_PORT" ]; then
    info "nginx faz proxy para 127.0.0.1:$NGINX_PORT (server_name: ${NGINX_SERVER:-?}; arquivos: $NGINX_FILES)"
    [ "$NGINX_BUFFERING" = "off" ] && ok "nginx tem proxy_buffering off (SSE ok)" || warn "nginx SEM 'proxy_buffering off' — o SSE vai atrasar; veja README"
  else
    info "nenhum proxy_pass do nginx encontrado (ou sem permissão de leitura em /etc/nginx)"
  fi

  info "--- artefatos antigos"
  [ -d .next ] && warn "pasta .next/ presente (build Next antigo)" || info ".next/ ausente"
  [ -d node_modules/next ] && warn "node_modules/next presente" || info "node_modules/next ausente"
  [ -d node_modules/better-sqlite3 ] && warn "node_modules/better-sqlite3 presente" || info "better-sqlite3 ausente"
  [ -f package-lock.json ] && warn "package-lock.json presente (a versão nova usa bun.lock)" || true

  info "--- banco"
  if [ -f "$DB" ]; then
    read -r C R L <<<"$(db_counts)"
    ok "banco $DB ($(du -h "$DB" | cut -f1)): $C fichas, $R rolagens, $L entradas de log"
    [ -f "$DB-wal" ] && info "WAL presente ($(du -h "$DB-wal" | cut -f1)) — normal com o app rodando"
    local integ; integ=$(sql "PRAGMA integrity_check" 2>/dev/null || echo "?")
    [ "$integ" = "ok" ] && ok "integrity_check: ok" || warn "integrity_check: $integ"
  else
    warn "banco ainda não existe em $DB (será criado com o seed na primeira subida)"
  fi

  info "--- binário Rust"
  if [ -x "$BIN" ]; then
    info "binário existe: $(du -h "$BIN" | cut -f1), $(date -r "$BIN" '+%F %T')"
  else
    info "binário ainda não compilado"
  fi

  info "--- toolchain"
  local t
  for t in cargo rustc cc git curl ss; do have "$t" && info "$t: $(command -v "$t")" || warn "$t: ausente"; done
  detect_js
  [ -n "$JS" ] && info "js runtime: $JS ($(command -v "$JS"))" || bad "nem bun nem node encontrados (preciso de um para buildar o frontend)"
  have sqlite3 || have python3 || warn "sem sqlite3 nem python3: checagens do banco serão puladas"
}

phase_toolchain() {
  step "2/7 Toolchain"
  if ! have cargo; then
    confirm "Rust não encontrado. Instalar via rustup em $HOME/.cargo (sem sudo)?"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
    . "$HOME/.cargo/env"
  fi
  have cargo && ok "cargo $(cargo --version | awk '{print $2}')" || die "cargo continua ausente"
  if ! have cc; then
    if have apt-get && have sudo; then
      confirm "Compilador C ausente (necessário para o SQLite embutido). Rodar 'sudo apt-get install -y build-essential'?"
      sudo apt-get install -y build-essential
    fi
  fi
  have cc && ok "cc: $(cc --version | head -1)" || die "sem compilador C (instale build-essential)"
  detect_js
  [ -n "$JS" ] || die "instale bun (curl -fsSL https://bun.sh/install | bash) ou node 20+"
  ok "frontend será buildado com $PKG"
  if ! have pm2; then
    confirm "pm2 ausente. Instalar globalmente ($PKG)?"
    if [ "$PKG" = "bun" ]; then bun add -g pm2; else npm install -g pm2; fi
    hash -r
  fi
  have pm2 && ok "pm2 $(pm2 -v 2>/dev/null | tail -1)" || die "pm2 continua ausente"
}

phase_build() {
  step "3/7 Build (frontend → pré-compressão → binário Rust)"
  if [ "$PKG" = "bun" ]; then bun install --frozen-lockfile; else npm install --no-audit --no-fund; fi
  ok "dependências do frontend instaladas"
  rm -rf dist
  if [ "$PKG" = "bun" ]; then bun run vite build; else npx vite build; fi
  [ -f dist/index.html ] || die "vite build não gerou dist/index.html"
  "$JS" scripts/precompress.mjs dist
  local nbr; nbr=$(find dist -name '*.br' | wc -l)
  [ "$nbr" -ge 3 ] && ok "dist/ pronto com $nbr arquivos .br" || die "pré-compressão não gerou .br"
  grep -q 'Mundo Pankleos' dist/index.html && ok "index.html contém o título" || bad "index.html sem título esperado"

  cargo build --release --manifest-path server/Cargo.toml
  [ -x "$BIN" ] || die "cargo build não gerou $BIN"
  ok "binário: $(du -h "$BIN" | cut -f1)"
  local asset; asset=$(grep -oE 'assets/[^"]+\.js' dist/index.html | head -1 || true)
  if [ -n "$asset" ] && grep -q "$(basename "$asset")" "$BIN"; then
    ok "binário embute o dist/ atual ($asset)"
  else
    die "binário NÃO embute o dist/ atual — ordem de build errada?"
  fi

  info "--- smoke test do binário novo em porta temporária (produção segue intocada)"
  local sp; sp=$(find_free_port); [ -n "$sp" ] || die "sem porta livre para o smoke test"
  SMOKE_PORT="$sp" SMOKE_BINARY="$BIN" "$JS" scripts/smoke-http.mjs || die "smoke test falhou — abortando sem mexer no deploy atual"
  ok "smoke test passou na porta $sp"
}

phase_backup() {
  step "4/7 Backup do banco"
  mkdir -p "$BACKUP_DIR"
  if [ ! -f "$DB" ]; then warn "sem banco para fazer backup"; return 0; fi
  local dest="$BACKUP_DIR/app-dnd-$(date +%Y%m%d-%H%M%S).sqlite"
  if have sqlite3; then
    sqlite3 "$DB" ".backup '$dest'"
  elif have python3; then
    python3 - "$DB" "$dest" <<'PY'
import sqlite3, sys
src = sqlite3.connect(sys.argv[1]); dst = sqlite3.connect(sys.argv[2])
src.backup(dst); dst.close(); src.close()
PY
  else
    cp "$DB" "$dest"; [ -f "$DB-wal" ] && cp "$DB-wal" "$dest-wal" || true
    warn "backup por cp (sem sqlite3/python3): inclui o -wal se existia"
  fi
  [ -s "$dest" ] || die "backup vazio em $dest"
  read -r C R L <<<"$(db_counts)"
  local bc; bc=$(DB="$dest" sql "SELECT COUNT(*) FROM characters" 2>/dev/null || echo "?")
  [ "$bc" = "$C" ] && ok "backup em $dest ($bc fichas, igual ao banco vivo)" || bad "backup tem $bc fichas, banco vivo tem $C"
  local integ; integ=$(DB="$dest" sql "PRAGMA integrity_check" 2>/dev/null || echo "?")
  [ "$integ" = "ok" ] || [ "$integ" = "?" ] && ok "backup íntegro" || bad "backup com integrity_check: $integ"
  echo "$dest" > "$STATE_DIR/last-backup"
  ls -1t "$BACKUP_DIR"/app-dnd-*.sqlite 2>/dev/null | tail -n +11 | xargs -r rm -f  # mantém 10
}

phase_remove() {
  step "5/7 Removendo o deploy antigo"
  mkdir -p "$STATE_DIR"
  # commit anterior, para rollback: ORIG_HEAD do git pull, senão o último commit ainda com Next
  local prev=""
  if git rev-parse -q --verify ORIG_HEAD >/dev/null 2>&1 && [ "$(git rev-parse ORIG_HEAD)" != "$(git rev-parse HEAD)" ]; then
    prev=$(git rev-parse ORIG_HEAD)
  else
    local del; del=$(git rev-list -1 HEAD -- next.config.ts 2>/dev/null || true)
    [ -n "$del" ] && prev=$(git rev-parse "$del^" 2>/dev/null || true)
  fi
  [ -n "$prev" ] && { echo "$prev" > "$STATE_DIR/previous-commit"; info "commit anterior registrado para rollback: ${prev:0:8}"; } || warn "não consegui determinar o commit anterior (rollback manual)"

  detect_pm2
  OLD_PORT=""
  if [ -n "$PM2_STATUS" ]; then
    OLD_PORT=$(printf '%s' "$PM2_ARGS" | grep -oE -- '--port[ =]?[0-9]+' | grep -oE '[0-9]+' | head -1 || true)
    [ -n "$PM2_PID" ] && [ -z "$OLD_PORT" ] && OLD_PORT=$(ss -ltnpH 2>/dev/null | grep "pid=$PM2_PID," | grep -oE ':[0-9]+\s' | head -1 | tr -d ': ' || true)
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
    pm2 save --force >/dev/null 2>&1 || true
    detect_pm2
    [ -z "$PM2_STATUS" ] && ok "pm2: '$APP_NAME' removido" || bad "pm2 ainda lista '$APP_NAME' (status $PM2_STATUS)"
  else
    info "pm2 não tinha '$APP_NAME'"
  fi
  echo "${OLD_PORT:-}" > "$STATE_DIR/old-port"

  stop_old_systemd
  kill_next_processes
}

# Para e desabilita a unit systemd do app antigo (pede sudo). O arquivo da unit fica.
stop_old_systemd() {
  detect_systemd
  [ -n "$SYSTEMD_UNIT" ] || return 0
  info "systemd $SYSTEMD_UNIT ($SYSTEMD_ACTIVE): $(systemctl show -p ExecStart --value "$SYSTEMD_UNIT" 2>/dev/null | grep -oE 'argv\[\]=[^;]+' | head -1 || true)"
  sudo systemctl disable --now "$SYSTEMD_UNIT" || warn "sudo systemctl disable --now $SYSTEMD_UNIT falhou (rode à mão)"
  sleep 1
  [ "$(systemctl is-active "$SYSTEMD_UNIT" 2>/dev/null || true)" = "active" ] && bad "systemd $SYSTEMD_UNIT ainda ativo" || ok "systemd $SYSTEMD_UNIT parado e desabilitado (arquivo da unit mantido)"
}

# Encerra processos do Next (next start/next-server/workers). Os do próprio usuário
# nesta pasta caem com kill; os de outro usuário (ex.: unit systemd como root) só
# se o comando/cwd mencionar app-dnd, via sudo. O resto é listado para decisão manual.
# Um processo é "desta app" só se o cwd, a linha de comando ou o ambiente apontam
# para ESTA pasta. Outros apps Next do mesmo usuário na VPS NUNCA são tocados.
belongs_to_this_app() { # pid
  local pid="$1" cwd cmd
  cwd=$(readlink -f "/proc/$pid/cwd" 2>/dev/null || true)
  [ "$cwd" = "$ROOT" ] && return 0
  cmd=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)
  case "$cmd" in *"$ROOT"*) return 0 ;; esac
  tr '\0' '\n' < "/proc/$pid/environ" 2>/dev/null | grep -qE "^(PWD|APP_DND_DB|PM2_HOME_DIR)=.*$ROOT" && return 0
  return 1
}

# Lista pids de processos Next DESTA app (cwd/cmd/ambiente nesta pasta), excluindo
# este script e shells que só contêm o padrão na linha de comando.
next_pids() {
  local pid cmd
  for pid in $(pgrep -f "next (start|dev)|next-server|next-router-worker" 2>/dev/null || true); do
    [ "$pid" = "$$" ] || [ "$pid" = "$PPID" ] && continue
    cmd=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)
    case "$cmd" in *deploy-vps*|*pgrep*|"bash -c "*|"sh -c "*) continue ;; esac
    belongs_to_this_app "$pid" && printf '%s ' "$pid"
  done
  return 0
}

# Processos Next de OUTRAS pastas (só para informar; nunca são mortos).
other_next_pids() {
  local pid cmd
  for pid in $(pgrep -f "next (start|dev)|next-server|next-router-worker" 2>/dev/null || true); do
    [ "$pid" = "$$" ] || [ "$pid" = "$PPID" ] && continue
    cmd=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)
    case "$cmd" in *deploy-vps*|*pgrep*|"bash -c "*|"sh -c "*) continue ;; esac
    belongs_to_this_app "$pid" || printf '%s ' "$pid"
  done
  return 0
}

kill_next_processes() {
  local others; others=$(other_next_pids)
  local pid user cwd cmd
  for pid in $others; do
    cwd=$(readlink -f "/proc/$pid/cwd" 2>/dev/null || echo "?")
    info "outro Next (não é desta app, fica intacto): pid=$pid cwd=$cwd"
  done
  local pids; pids=$(next_pids)
  if [ -z "$pids" ]; then ok "nenhum processo Next desta app rodando"; return 0; fi
  for pid in $pids; do
    [ -d "/proc/$pid" ] || continue
    user=$(stat -c %U "/proc/$pid" 2>/dev/null || echo "?")
    cwd=$(readlink -f "/proc/$pid/cwd" 2>/dev/null || echo "?")
    cmd=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null | cut -c1-100 || true)
    info "next desta app: pid=$pid user=$user cwd=$cwd cmd=$cmd"
    if [ "$user" = "$(id -un)" ]; then
      kill "$pid" 2>/dev/null || true
    else
      sudo kill "$pid" 2>/dev/null || warn "não consegui matar pid $pid (user $user): sudo kill $pid"
    fi
  done
  sleep 2
  pids=$(next_pids)
  if [ -z "$pids" ]; then ok "processos Next encerrados"; else
    for pid in $pids; do kill -9 "$pid" 2>/dev/null || sudo kill -9 "$pid" 2>/dev/null || true; done
    sleep 1
    pids=$(next_pids)
    [ -z "$pids" ] && ok "processos Next encerrados (com kill -9)" || warn "ainda há processos Next: $pids"
  fi
}

phase_remove_tail() {

  # artefatos: guarda o .next (rollback rápido) e limpa o que sobrou
  if [ -d .next ]; then rm -rf "$STATE_DIR/next-old"; mv .next "$STATE_DIR/next-old"; ok ".next/ movido para .deploy/next-old (rollback)"; fi
  rm -rf node_modules/next node_modules/better-sqlite3 node_modules/.cache 2>/dev/null || true
  [ -f package-lock.json ] && { rm -f package-lock.json; ok "package-lock.json antigo removido"; } || true

  local target="${APP_DND_PORT:-${OLD_PORT:-${NGINX_PORT:-8080}}}"
  if port_free "$target"; then ok "porta $target livre para o novo binário"; else bad "porta $target ainda ocupada: $(port_owner "$target")"; fi
}

phase_start() {
  step "6/7 Subindo o binário Rust no pm2"
  detect_nginx
  local old_port; old_port=$(cat "$STATE_DIR/old-port" 2>/dev/null || true)
  DEPLOY_PORT="${APP_DND_PORT:-${old_port:-${NGINX_PORT:-8080}}}"
  if [ -n "${APP_DND_HOST:-}" ]; then DEPLOY_HOST="$APP_DND_HOST"
  elif [ -n "$NGINX_PORT" ]; then DEPLOY_HOST="127.0.0.1"
  else DEPLOY_HOST="0.0.0.0"; fi
  if [ -n "$NGINX_PORT" ] && [ "$NGINX_PORT" != "$DEPLOY_PORT" ]; then
    warn "nginx aponta para :$NGINX_PORT mas o app vai subir em :$DEPLOY_PORT — ajuste o nginx ou use APP_DND_PORT=$NGINX_PORT"
  fi
  mkdir -p "$(dirname "$DB")"
  echo "$DEPLOY_PORT" > "$STATE_DIR/port"; echo "$DEPLOY_HOST" > "$STATE_DIR/host"
  APP_DND_PORT="$DEPLOY_PORT" APP_DND_HOST="$DEPLOY_HOST" APP_DND_DB="$DB" pm2 start ecosystem.config.cjs --update-env >/dev/null
  pm2 save --force >/dev/null 2>&1 || true
  ok "pm2 start em $DEPLOY_HOST:$DEPLOY_PORT (db: $DB)"
  info "para subir no boot (se ainda não configurou): 'pm2 startup' imprime a linha sudo a rodar"
}

phase_verify() {
  step "7/7 Verificação do deploy"
  local port host base
  port=$(cat "$STATE_DIR/port" 2>/dev/null || echo "${APP_DND_PORT:-8080}")
  host=$(cat "$STATE_DIR/host" 2>/dev/null || echo "127.0.0.1")
  base="http://127.0.0.1:$port"

  detect_pm2
  [ "$PM2_STATUS" = "online" ] && ok "pm2: '$APP_NAME' online" || bad "pm2: status '${PM2_STATUS:-inexistente}'"
  case "$PM2_SCRIPT" in *server/target/release/app-dnd*) ok "pm2 executa o binário Rust" ;; *) bad "pm2 executa '$PM2_SCRIPT', não o binário Rust" ;; esac

  wait_http "$base/api/health" 15 && ok "GET /api/health → 200 em $base" || bad "/api/health não respondeu em 15 s (pm2 logs $APP_NAME)"
  sleep 3
  detect_pm2
  [ "${PM2_RESTARTS:-0}" = "0" ] && [ "${PM2_UNSTABLE:-0}" = "0" ] && ok "processo estável (0 restarts após 3 s)" || bad "processo reiniciou ($PM2_RESTARTS restarts) — veja pm2 logs $APP_NAME"

  local owner pid; owner=$(port_owner "$port"); pid="${owner%% *}"
  case "$owner" in *app-dnd*) ok "porta $port pertence ao binário (pid $pid)" ;; *) bad "porta $port: '${owner:-ninguém}'" ;; esac
  # pm2 pode reportar pid 0 logo após o start; o dono da porta é a fonte confiável
  [ -n "$pid" ] && [ "$pid" != "0" ] && PM2_PID="$pid"
  if [ "$host" = "127.0.0.1" ]; then
    ss -ltnH "sport = :$port" 2>/dev/null | grep -q '127.0.0.1' && ok "escutando só em 127.0.0.1 (atrás do nginx)" || warn "esperava bind em 127.0.0.1"
  fi

  # API + banco
  local chars
  if have python3; then chars=$(curl -s --max-time 5 "$base/api/characters" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["characters"]))' 2>/dev/null || echo "?")
  else chars=$(curl -s --max-time 5 "$base/api/characters" | grep -o '"id":' | wc -l || echo "?"); fi
  read -r C R L <<<"$(db_counts)"
  if [ "$chars" = "$C" ]; then ok "API lista $chars fichas = banco ($C)"; elif [ "$chars" = "?" ]; then warn "não consegui contar fichas pela API"; else bad "API lista $chars fichas, banco tem $C"; fi
  (curl -s --max-time 5 "$base/api/characters" || true) | grep -q '"pin"' && bad "API pública expõe campo pin!" || ok "API pública não expõe PIN"
  [ "$(http_code "$base/api/characters/joao-lindao")" = "403" ] && ok "ficha protegida sem PIN → 403" || warn "GET /api/characters/joao-lindao sem PIN não deu 403 (ficha pode ter outro id)"
  local integ; integ=$(sql "PRAGMA integrity_check" 2>/dev/null || echo "?")
  [ "$integ" = "ok" ] || [ "$integ" = "?" ] && ok "banco íntegro após subida" || bad "integrity_check: $integ"

  # frontend
  local html; html=$(curl -s --max-time 5 "$base/" || true)
  printf '%s' "$html" | grep -q 'Mundo Pankleos' && ok "GET / entrega o index.html" || bad "GET / sem o título esperado"
  local asset; asset=$(printf '%s' "$html" | grep -oE '/assets/[^"]+\.js' | head -1 || true)
  if [ -n "$asset" ]; then
    local hdr; hdr=$(curl -sI --max-time 5 -H 'Accept-Encoding: br' "$base$asset" || true)
    printf '%s' "$hdr" | grep -qi 'content-encoding: br' && ok "asset $asset servido em brotli" || bad "asset sem brotli"
    printf '%s' "$hdr" | grep -qi 'immutable' && ok "asset com cache imutável" || bad "asset sem Cache-Control immutable"
    local etag; etag=$(printf '%s' "$hdr" | grep -i '^etag:' | awk '{print $2}' | tr -d '\r' || true)
    [ -n "$etag" ] && [ "$(http_code -H "If-None-Match: $etag" "$base$asset")" = "304" ] && ok "ETag → 304" || warn "ETag/304 não funcionou"
  else
    bad "index.html não referencia nenhum asset JS"
  fi
  (curl -s --max-time 5 "$base/personagem/joao-lindao" || true) | grep -q 'Mundo Pankleos' && ok "rota do SPA (/personagem/...) cai no index.html" || bad "rota do SPA não entrega o index.html"
  [ "$(http_code "$base/assets/nao-existe.js")" = "404" ] && ok "asset inexistente → 404" || bad "asset inexistente não deu 404"

  # SSE
  local sse; sse=$(curl -sN --max-time 3 "$base/api/events" 2>/dev/null | head -c 300 || true)
  printf '%s' "$sse" | grep -q 'event: hello' && ok "SSE responde com 'hello'" || bad "SSE não mandou 'hello'"

  # memória
  if [ -n "$PM2_PID" ]; then
    local rss; rss=$(ps -o rss= -p "$PM2_PID" 2>/dev/null | tr -d ' ' || echo 0)
    info "memória residente: $(( ${rss:-0} / 1024 )) MB"
    [ "${rss:-0}" -lt 102400 ] && ok "memória abaixo de 100 MB" || warn "memória alta para este binário"
  fi

  # nginx
  detect_nginx
  if [ -n "$NGINX_PORT" ]; then
    [ "$NGINX_PORT" = "$port" ] && ok "nginx faz proxy para a porta certa ($port)" || bad "nginx aponta para :$NGINX_PORT, app está em :$port"
    [ "$NGINX_BUFFERING" = "off" ] && ok "nginx com proxy_buffering off" || warn "nginx sem proxy_buffering off (SSE atrasado)"
    if have nginx && sudo -n nginx -t >/dev/null 2>&1; then ok "nginx -t ok"; fi
    if [ -n "$NGINX_SERVER" ]; then
      local through; through=$(http_code -H "Host: $NGINX_SERVER" "http://127.0.0.1/api/health")
      case "$through" in 200|301|302|308) ok "via nginx (Host: $NGINX_SERVER) → $through" ;; *) warn "via nginx (porta 80) → $through" ;; esac
      local https; https=$(http_code -k --resolve "$NGINX_SERVER:443:127.0.0.1" "https://$NGINX_SERVER/api/health")
      [ "$https" = "200" ] && ok "via nginx HTTPS → 200" || info "via nginx HTTPS → $https (ignorável se não há TLS local)"
    fi
  else
    info "sem nginx detectado; app acessível direto em $host:$port"
  fi

  # resíduos do deploy antigo
  local leftover; leftover=$(next_pids)
  [ -n "$leftover" ] && bad "ainda há processo Next DESTA app rodando (pids: $leftover) — rode: bash scripts/deploy-vps.sh cleanup" || ok "nenhum processo Next desta app"
  local others; others=$(other_next_pids)
  [ -n "$others" ] && info "outros apps Next na VPS (não são desta app): pids $others" || true
  [ -d .next ] && warn ".next/ ainda existe" || ok "sem .next/"
  detect_systemd
  [ "$SYSTEMD_ACTIVE" = "active" ] && bad "systemd $SYSTEMD_UNIT ativo em paralelo ao pm2" || ok "sem systemd concorrente"
}

phase_rollback() {
  step "Rollback para o deploy anterior (Next.js)"
  local prev; prev=$(cat "$STATE_DIR/previous-commit" 2>/dev/null || true)
  [ -n "$prev" ] || die "sem .deploy/previous-commit — rollback manual: git log, git checkout <commit>, npm ci && npm run build, pm2 start ecosystem.config.cjs"
  confirm "Vou parar o binário Rust, voltar o código para ${prev:0:8} e subir o Next de novo. Continuar?"
  detect_js; [ -n "$JS" ] || die "preciso de bun ou node"
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  git stash push -u -q -m "deploy-vps rollback $(date +%F-%T)" 2>/dev/null || true
  git checkout -q "$prev"
  if [ -d "$STATE_DIR/next-old" ]; then mv "$STATE_DIR/next-old" .next; ok ".next/ restaurado"; fi
  if [ "$PKG" = "bun" ]; then bun install; else npm install --no-audit --no-fund; fi
  [ -d .next ] || { if [ "$PKG" = "bun" ]; then bun run build; else npm run build; fi; }
  local port; port=$(cat "$STATE_DIR/old-port" 2>/dev/null || true); port="${port:-8080}"
  # o ecosystem antigo tem caminhos fixos (/home/paiva/...); se não bater, sobe direto
  if ! pm2 start ecosystem.config.cjs --update-env >/dev/null 2>&1; then
    warn "ecosystem.config.cjs antigo não subiu (caminho fixo?); iniciando '$PKG run start' direto"
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
    if [ "$PKG" = "bun" ]; then
      PORT="$port" pm2 start "$(command -v bun)" --name "$APP_NAME" --interpreter none --update-env -- run start -- --port "$port" >/dev/null
    else
      PORT="$port" pm2 start npm --name "$APP_NAME" --update-env -- start -- --port "$port" >/dev/null
    fi
  fi
  pm2 save --force >/dev/null 2>&1 || true
  wait_http "http://127.0.0.1:$port/" 45 && ok "Next respondendo em :$port" || bad "Next não respondeu em :$port (pm2 logs $APP_NAME)"
  info "banco não foi alterado; backups em $BACKUP_DIR"
  info "para voltar à versão Rust depois: git checkout main && bash scripts/deploy-vps.sh deploy"
  summary "rollback"
}

# ============================================================================= MAIN
mkdir -p "$STATE_DIR"
case "$MODE" in
  check)
    phase_check; summary "check" || exit 1 ;;
  verify)
    detect_js; phase_verify; summary "verify" || exit 1 ;;
  cleanup)
    # resíduos do deploy antigo que ficaram (unit systemd, processos Next desta pasta)
    step "Limpeza de resíduos do deploy antigo"
    stop_old_systemd
    kill_next_processes
    detect_js; phase_verify; summary "cleanup" || exit 1 ;;
  restart)
    # sobe de novo o binário já compilado, com APP_DND_PORT / APP_DND_HOST novos
    [ -x "$BIN" ] || die "binário não existe; rode o deploy"
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
    phase_start
    detect_js; phase_verify; summary "restart" || exit 1 ;;
  rollback)
    phase_rollback ;;
  deploy)
    phase_check
    [ "$FAILS" -eq 0 ] || die "corrija as falhas do inventário antes de continuar"
    confirm "Vou buildar a versão Rust, fazer backup do banco, derrubar o deploy antigo e subir o novo. Continuar?"
    phase_toolchain
    phase_build
    phase_backup
    phase_remove
    phase_remove_tail
    [ "$FAILS" -eq 0 ] || { warn "houve falhas na remoção; subindo mesmo assim para não ficar sem app"; }
    phase_start
    phase_verify
    if summary "deploy"; then
      printf '\n%s✔ Deploy concluído.%s  Logs: pm2 logs %s   Rollback: bash scripts/deploy-vps.sh rollback\n' "$C_G" "$C_0" "$APP_NAME"
    else
      printf '\n%s✘ Deploy com falhas.%s  Veja acima; logs: pm2 logs %s   Rollback: bash scripts/deploy-vps.sh rollback\n' "$C_R" "$C_0" "$APP_NAME"
      exit 1
    fi ;;
  *)
    die "modo desconhecido '$MODE' (use: check | deploy [-y] | verify | cleanup | restart | rollback)" ;;
esac
