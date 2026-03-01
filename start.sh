#!/usr/bin/env bash
# start.sh — build and run the full TaleWorld stack with Docker Compose
#
# Usage:
#   ./start.sh          # start everything (builds images if needed)
#   ./start.sh --build  # force-rebuild images before starting
#   ./start.sh down     # stop and remove containers
#   ./start.sh logs     # follow logs from all services
#
# Prerequisites: Docker + Docker Compose v2 (docker compose)
#
# Env files:
#   storytelling/.env   — MISTRAL_API_KEY, ELEVENLABS_API_KEY, etc.
#   (optional) .env     — override VITE_AUTH_USERNAME/PASSWORD for the frontend
#
# The frontend is baked into the Docker image at build time (Vite env vars must
# be set before "npm run build").  To change VITE_* values you must rebuild:
#   ./start.sh --build

set -euo pipefail

COMPOSE="docker compose"

# ─── helper ───────────────────────────────────────────────────────────────────

die() { echo "ERROR: $*" >&2; exit 1; }

check_deps() {
  command -v docker >/dev/null 2>&1 || die "Docker is not installed or not in PATH"
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required (install Docker Desktop)"
}

check_env() {
  local env_file="storytelling/.env"
  if [[ ! -f "$env_file" ]]; then
    if [[ -f "storytelling/.env.example" ]]; then
      echo "  storytelling/.env not found — copying from .env.example"
      cp storytelling/.env.example storytelling/.env
      echo "  Edit storytelling/.env and add your API keys, then re-run ./start.sh"
      exit 1
    else
      die "storytelling/.env not found and no .env.example to copy from"
    fi
  fi

  # Warn if placeholder keys are still present
  if grep -q "MISTRAL_API_KEY=$" storytelling/.env 2>/dev/null || \
     grep -q "MISTRAL_API_KEY=your" storytelling/.env 2>/dev/null; then
    echo "  WARNING: MISTRAL_API_KEY looks unconfigured in storytelling/.env"
  fi
  if grep -q "ELEVENLABS_API_KEY=sk_\*" storytelling/.env 2>/dev/null; then
    echo "  WARNING: ELEVENLABS_API_KEY looks unconfigured in storytelling/.env"
  fi
}

# ─── subcommands ──────────────────────────────────────────────────────────────

cmd_down() {
  echo "Stopping containers..."
  $COMPOSE down
}

cmd_logs() {
  $COMPOSE logs -f
}

cmd_up() {
  local build_flag=""
  [[ "${1:-}" == "--build" ]] && build_flag="--build"

  echo ""
  echo "  TaleWorld"
  echo "  ─────────────────────────────────"
  echo "  Backend  → http://localhost:8000"
  echo "  Dev UI   → http://localhost:8000/dev-ui"
  echo "  Frontend → http://localhost:4173"
  echo "  ─────────────────────────────────"
  echo ""

  $COMPOSE up $build_flag --remove-orphans
}

# ─── main ─────────────────────────────────────────────────────────────────────

check_deps

case "${1:-}" in
  down)   cmd_down ;;
  logs)   cmd_logs ;;
  --build) check_env; cmd_up --build ;;
  "")     check_env; cmd_up ;;
  *)      echo "Usage: $0 [--build | down | logs]"; exit 1 ;;
esac
