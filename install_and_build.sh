#!/usr/bin/env bash
# MR2S 졸업과제 구성 요소 설치·빌드 스크립트
#
#   ./install_and_build.sh            전체 설치·빌드
#   ./install_and_build.sh module     알고리즘 라이브러리만
#   ./install_and_build.sh backend    최적화 API 서버만
#   ./install_and_build.sh web        웹 클라이언트 세 개만
#   ./install_and_build.sh analysis   실험·분석 환경만
#
# 사전 준비: Python 3.11 이상, Node.js 20.19 이상 또는 22.12 이상.
# Unity 프로젝트(simulation/)는 Unity Editor 6000.4.1f1 로 직접 열어야 하므로
# 이 스크립트가 다루지 않는다.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-all}"

log() { printf '\n==> %s\n' "$1"; }

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "필요한 명령을 찾을 수 없습니다: $1" >&2
    exit 1
  }
}

install_module() {
  require python3
  log "mr2s-module 설치 (가상 환경 .venv)"
  cd "$ROOT/mr2s-module"
  [ -d .venv ] || python3 -m venv .venv
  ./.venv/bin/pip install --upgrade pip
  ./.venv/bin/pip install -e ".[test]"
  log "mr2s-module 테스트 (slow 마커 제외)"
  ./.venv/bin/python -m pytest -m "not slow" --tb=short
}

install_backend() {
  require python3
  log "mr2s-backend 설치 (가상 환경 .venv)"
  cd "$ROOT/mr2s-backend"
  [ -d .venv ] || python3 -m venv .venv
  ./.venv/bin/pip install --upgrade pip
  ./.venv/bin/pip install -r requirements.txt
  echo "실행: cd mr2s-backend && ./.venv/bin/python main.py  (http://localhost:8000)"
}

install_web() {
  require npm
  for app in mr2s-frontend twin-world simulation-react; do
    log "$app 설치·빌드"
    cd "$ROOT/$app"
    npm install
    npm run build
  done
  echo "twin-world 는 실행 전에 .env.example 을 .env.local 로 복사하고 UPSTAGE_API_KEY 를 채운다."
  echo "개발 서버 실행: cd <앱 디렉터리> && npm run dev  (http://localhost:5173)"
}

install_analysis() {
  require python3
  log "approach-analysis 설치 (가상 환경 .venv)"
  cd "$ROOT/approach-analysis"
  [ -d .venv ] || python3 -m venv .venv
  ./.venv/bin/pip install --upgrade pip
  ./.venv/bin/pip install -r requirements.txt
  echo "실험 실행 예: cd approach-analysis && ./.venv/bin/python main.py poster-results --sizes 5 10 20 --output-dir results/poster --no-cache"
}

case "$TARGET" in
  module)   install_module ;;
  backend)  install_backend ;;
  web)      install_web ;;
  analysis) install_analysis ;;
  all)      install_module; install_backend; install_web; install_analysis ;;
  *)        echo "알 수 없는 대상: $TARGET (module | backend | web | analysis | all)" >&2; exit 1 ;;
esac

log "완료"
