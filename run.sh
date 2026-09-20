#!/usr/bin/env bash
# MR2S 구성 요소 실행 스크립트
#
#   ./run.sh              backend 와 웹 클라이언트 세 개를 모두 띄운다
#   ./run.sh backend      최적화 API 서버만
#   ./run.sh frontend     mr2s-frontend 만
#   ./run.sh twin         twin-world 만
#   ./run.sh sim          simulation-react 만
#   ./run.sh stop         이 스크립트가 띄운 것을 모두 내린다
#   ./run.sh status       띄워 둔 것과 주소를 보여 준다
#
# 먼저 ./install_and_build.sh 를 실행해 두어야 한다.
# 로그는 .run/logs/, 프로세스 번호는 .run/pids/ 에 남는다.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT/.run"
LOG_DIR="$RUN_DIR/logs"
PID_DIR="$RUN_DIR/pids"
BACKEND_URL="http://localhost:8000"

mkdir -p "$LOG_DIR" "$PID_DIR"

log() { printf '\n==> %s\n' "$1"; }

# 이름, 포트, 주소를 한 곳에서 관리한다.
port_of() {
  case "$1" in
    backend)  echo 8000 ;;
    frontend) echo 5173 ;;
    twin)     echo 5174 ;;
    sim)      echo 5175 ;;
  esac
}

label_of() {
  case "$1" in
    backend)  echo "최적화 API 서버" ;;
    frontend) echo "mr2s-frontend (그래프 편집·기법 비교)" ;;
    twin)     echo "twin-world (디지털 트윈 시뮬레이션)" ;;
    sim)      echo "simulation-react (2D 프로토타입)" ;;
  esac
}

is_running() {
  local pid_file="$PID_DIR/$1.pid"
  [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

require_install() {
  local path="$1" hint="$2"
  [ -e "$path" ] || {
    echo "$hint 가 없습니다. 먼저 ./install_and_build.sh 를 실행하세요." >&2
    exit 1
  }
}

wait_until_up() {
  local name="$1" port="$2"
  for _ in $(seq 1 60); do
    if curl -s -o /dev/null -m 1 "http://localhost:$port/"; then
      return 0
    fi
    sleep 1
  done
  echo "$name 이 http://localhost:$port 에서 응답하지 않습니다. $LOG_DIR/$name.log 를 확인하세요." >&2
  return 1
}

start_backend() {
  is_running backend && { echo "backend 는 이미 떠 있습니다."; return 0; }
  require_install "$ROOT/mr2s-backend/.venv" "mr2s-backend/.venv"
  log "backend 실행 ($BACKEND_URL)"
  # exec 로 subshell 을 그대로 대체해야 기록한 pid 가 실제 프로세스이고,
  # 표준 출력이 로그 파일로 넘어가 이 스크립트가 붙들리지 않는다.
  ( cd "$ROOT/mr2s-backend" && exec ./.venv/bin/python main.py ) \
    >"$LOG_DIR/backend.log" 2>&1 &
  echo $! >"$PID_DIR/backend.pid"
  wait_until_up backend 8000
}

# 웹 클라이언트 세 개는 모두 Vite 기본 포트 5173 을 쓰므로 포트를 지정해 나눈다.
# twin-world 와 simulation-react 는 VITE_PROXY_TARGET 으로 로컬 backend 를
# 가리킬 수 있다. mr2s-frontend 는 프록시 대상이 vite.config.ts 에 적혀 있다.
start_web() {
  local name="$1" dir="$2" port; port="$(port_of "$name")"
  is_running "$name" && { echo "$name 은 이미 떠 있습니다."; return 0; }
  require_install "$ROOT/$dir/node_modules" "$dir/node_modules"
  log "$name 실행 (http://localhost:$port)"
  ( cd "$ROOT/$dir" && VITE_PROXY_TARGET="$BACKEND_URL" \
      exec npm run dev -- --port "$port" --strictPort ) \
    >"$LOG_DIR/$name.log" 2>&1 &
  echo $! >"$PID_DIR/$name.pid"
  wait_until_up "$name" "$port"
}

stop_all() {
  local stopped=0
  for name in backend frontend twin sim; do
    local pid_file="$PID_DIR/$name.pid"
    [ -f "$pid_file" ] || continue
    local pid; pid="$(cat "$pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      pkill -P "$pid" >/dev/null 2>&1 || true
      kill "$pid" 2>/dev/null || true
      echo "$name 내림 (pid $pid)"
      stopped=1
    fi
    # npm 이 남긴 자식이 포트를 붙들고 있는 경우가 있어 한 번 더 확인한다.
    fuser -k -n tcp "$(port_of "$name")" 2>/dev/null || true
    rm -f "$pid_file"
  done
  [ "$stopped" = 1 ] || echo "띄워 둔 것이 없습니다."
}

status() {
  printf '\n%-10s %-8s %-6s %s\n' 이름 상태 포트 설명
  for name in backend frontend twin sim; do
    local state="내려감"
    is_running "$name" && state="떠 있음"
    printf '%-10s %-8s %-6s %s\n' "$name" "$state" "$(port_of "$name")" "$(label_of "$name")"
  done
  printf '\n주소: %s · http://localhost:5173 · http://localhost:5174 · http://localhost:5175\n' "$BACKEND_URL"
}

case "${1:-all}" in
  backend)  start_backend ;;
  frontend) start_web frontend mr2s-frontend ;;
  twin)     start_web twin twin-world ;;
  sim)      start_web sim simulation-react ;;
  stop)     stop_all; exit 0 ;;
  status)   status; exit 0 ;;
  all)
    start_backend
    start_web frontend mr2s-frontend
    start_web twin twin-world
    start_web sim simulation-react
    ;;
  *) echo "알 수 없는 대상: $1 (backend | frontend | twin | sim | all | stop | status)" >&2; exit 1 ;;
esac

status
printf '\n내릴 때는 ./run.sh stop 을 실행한다.\n'
