#!/usr/bin/env bash
# deploy.sh - Baut und deployt den SessionManager in Docker
#
# Usage:
#   ./deploy.sh              # Bauen und starten
#   ./deploy.sh stop         # Container stoppen und entfernen
#   ./deploy.sh restart      # Container neu starten
#   ./deploy.sh logs         # Container-Logs anzeigen
#
# Environment:
#   Example_SessionManager_Port  - Port für den Container (Standard: 3000)

set -euo pipefail

# ─── Konfiguration ────────────────────────────────────────────────────────────
PORT="${Example_SessionManager_Port:-3000}"
CONTAINER_NAME="session-manager"
IMAGE_NAME="session-manager:latest"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

log() {
  echo -e "\033[1;34m[deploy]\033[0m $1"
}

error() {
  echo -e "\033[1;31m[deploy ERROR]\033[0m $1" >&2
}

# ─── Schritt 1: npm install -D esbuild ───────────────────────────────────────

install_deps() {
  log "Prüfe esbuild Installation..."
  if ! command -v esbuild &>/dev/null && ! npm list -g esbuild &>/dev/null; then
    log "Installiere esbuild..."
    cd "$PROJECT_DIR"
    npm install -D esbuild typescript @types/node 2>&1 | tail -5
  else
    log "esbuild bereits installiert."
  fi
}

# ─── Schritt 2: Kompilieren mit esbuild ──────────────────────────────────────

build() {
  log "Kompiliere sessionManager.ts mit esbuild..."
  cd "$PROJECT_DIR"
  mkdir -p dist
  npx esbuild sessionManager.ts \
    --bundle \
    --platform=node \
    --outfile=dist/bundle.js \
    --minify 2>&1
  log "Build erfolgreich: dist/bundle.js"
}

# ─── Schritt 3: Dockerfile erstellen ─────────────────────────────────────────

create_dockerfile() {
  log "Erstelle Dockerfile..."
  cat > "$PROJECT_DIR/Dockerfile" <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "bundle.js"]
DOCKERFILE
  log "Dockerfile erstellt."
}

# ─── Schritt 4: Docker Container bauen und starten ───────────────────────────

docker_build() {
  log "Bauen Docker Image..."
  cd "$PROJECT_DIR"
  docker build -t "$IMAGE_NAME" . 2>&1
  log "Docker Image gebaut: $IMAGE_NAME"
}

docker_stop() {
  log "Stoppe Container..."
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
}

docker_start() {
  log "Starte Container auf Port $PORT..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "${PORT}:3000" \
    -e SESSION_MANAGER_PORT=3000 \
    --restart unless-stopped \
    "$IMAGE_NAME" 2>&1
  log "Container gestartet. Port: $PORT"
  sleep 2
  # Health-Check
  if curl -sf "http://localhost:${PORT}/health" >/dev/null 2>&1; then
    log "Health-Check: OK"
  else
    error "Health-Check fehlgeschlagen!"
    docker logs "$CONTAINER_NAME" 2>&1 | tail -10
    return 1
  fi
}

docker_logs() {
  docker logs -f "$CONTAINER_NAME" 2>&1
}

# ─── Hauptlogik ───────────────────────────────────────────────────────────────

case "${1:-deploy}" in
  deploy)
    install_deps
    build
    create_dockerfile
    docker_build
    docker_stop
    docker_start
    ;;
  stop)
    docker_stop
    log "Container gestoppt."
    ;;
  restart)
    docker_stop
    docker_start
    ;;
  logs)
    docker_logs
    ;;
  *)
    echo "Usage: $0 {deploy|stop|restart|logs}"
    exit 1
    ;;
esac
