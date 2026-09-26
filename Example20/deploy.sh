#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${SCRIPT_DIR}/deploy"
DATA_DIR="${SCRIPT_DIR}/data"

# ─── Helper Functions ────────────────────────────────────────────────────────

find_free_port() {
  python3 -c "import socket; s=socket.socket(); s.bind(('',0)); print(s.getsockname()[1]); s.close()" 2>/dev/null || \
  node -e "const s=require('net').createServer(); s.listen(0,()=>{console.log(s.address().port);s.close()}" 2>/dev/null || \
  echo $((RANDOM % 10000 + 20000))
}

# ─── Build ───────────────────────────────────────────────────────────────────

do_build() {
  echo "[deploy] Installing dependencies..."
  cd "${SCRIPT_DIR}"
  npm install

  echo "[deploy] Installing esbuild..."
  npm install -D esbuild

  echo "[deploy] Building with esbuild..."
  npm run build
  echo "[deploy] Build complete: dist/bundle.js"
}

# ─── Docker Compose E2E Setup ───────────────────────────────────────────────

do_e2e_setup() {
  echo "[deploy] Setting up E2E environment..."
  cd "${SCRIPT_DIR}"

  # Find a free port for the session manager
  E2E_PORT=$(find_free_port)
  export EXAMPLE_SESSIONMANAGER_PORT=${E2E_PORT}
  echo "[deploy] Using port ${E2E_PORT} for session-manager"

  # Create docker-compose.override.yaml for E2E with dynamic port
  cat > "${DEPLOY_DIR}/docker-compose.e2e.yaml" << COMPOSE_EOF
version: '3.8'

services:
  session-manager:
    build:
      context: ..
      dockerfile: deploy/Dockerfile
    ports:
      - "${E2E_PORT}:3000"
    environment:
      - EXAMPLE_SESSIONMANAGER_PORT=3000
      - PORT=3000
    volumes:
      - ../data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 5s

volumes:
  data:
COMPOSE_EOF

  # Build and start
  echo "[deploy] Building Docker image..."
  docker compose -f "${DEPLOY_DIR}/docker-compose.e2e.yaml" build --no-cache

  echo "[deploy] Starting containers..."
  docker compose -f "${DEPLOY_DIR}/docker-compose.e2e.yaml" up -d

  # Wait for health check
  echo "[deploy] Waiting for container to be healthy..."
  for i in $(seq 1 30); do
    if docker compose -f "${DEPLOY_DIR}/docker-compose.e2e.yaml" ps | grep -q "healthy\|Up"; then
      HEALTH=$(docker compose -f "${DEPLOY_DIR}/docker-compose.e2e.yaml" ps -q session-manager 2>/dev/null || true)
      if [ -n "$HEALTH" ]; then
        echo "[deploy] Container is running on port ${E2E_PORT}"
        echo "${E2E_PORT}" > "${SCRIPT_DIR}/.e2e_port"
        return 0
      fi
    fi
    sleep 2
  done

  echo "[deploy] WARNING: Container may not be healthy, but starting tests anyway"
  echo "${E2E_PORT}" > "${SCRIPT_DIR}/.e2e_port"
}

# ─── Docker Compose E2E Teardown ────────────────────────────────────────────

do_e2e_teardown() {
  echo "[deploy] Tearing down E2E environment..."
  cd "${SCRIPT_DIR}"

  if [ -f "${DEPLOY_DIR}/docker-compose.e2e.yaml" ]; then
    docker compose -f "${DEPLOY_DIR}/docker-compose.e2e.yaml" down 2>/dev/null || true
    rm -f "${DEPLOY_DIR}/docker-compose.e2e.yaml"
  fi

  rm -f "${SCRIPT_DIR}/.e2e_port"
  echo "[deploy] E2E teardown complete"
}

# ─── Main ────────────────────────────────────────────────────────────────────

case "${1:-build}" in
  build)
    do_build
    ;;
  e2e)
    do_build
    do_e2e_setup
    echo "[deploy] Running E2E tests..."
    cd "${SCRIPT_DIR}"
    npm test -- --testPathPattern="e2e"
    do_e2e_teardown
    ;;
  e2e-setup)
    do_build
    do_e2e_setup
    ;;
  e2e-teardown)
    do_e2e_teardown
    ;;
  *)
    echo "Usage: $0 {build|e2e|e2e-setup|e2e-teardown}"
    exit 1
    ;;
esac
