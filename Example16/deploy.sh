#!/usr/bin/env bash
set -euo pipefail

# ─── deploy.sh – Bauen, Dockerisieren und Starten des SessionManagers ─────────
# Verwendung:
#   ./deploy.sh              # Bauen und starten
#   ./deploy.sh stop         # Container stoppen und entfernen
#   ./deploy.sh rebuild      # Neu bauen und starten
# ──────────────────────────────────────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER_NAME="sessionmanager-app"
IMAGE_NAME="sessionmanager:latest"
PORT="${EXAMPLE_SESSIONMANAGER_PORT:-3000}"

echo "=== SessionManager Deploy Script ==="
echo "Port: $PORT"
echo "Project: $PROJECT_DIR"

# ── Funktion: Container stoppen ──────────────────────────────────────────────
stop_container() {
  echo "Stopping container '$CONTAINER_NAME'..."
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  echo "Container stopped."
}

# ── Funktion: Dockerfile erstellen ───────────────────────────────────────────
create_dockerfile() {
  cat > "$PROJECT_DIR/Dockerfile" << 'DOCKERFILE_EOF'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
EXPOSE 3000
CMD ["node", "bundle.js"]
DOCKERFILE_EOF
  echo "Dockerfile created."
}

# ── Funktion: npm install -D esbuild (falls nicht vorhanden) ─────────────────
ensure_esbuild() {
  if ! command -v esbuild &>/dev/null && ! [ -f "$PROJECT_DIR/node_modules/.bin/esbuild" ]; then
    echo "Installing esbuild..."
    npm install -D esbuild
  else
    echo "esbuild already available."
  fi
}

# ── Funktion: TypeScript mit esbuild kompilieren ─────────────────────────────
build() {
  echo "Building with esbuild..."
  mkdir -p "$PROJECT_DIR/dist"
  npx esbuild src/sessionManager.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --outfile=dist/bundle.js \
    --format=cjs
  echo "Build complete: dist/bundle.js"
}

# ── Funktion: Docker Image bauen ─────────────────────────────────────────────
docker_build() {
  echo "Building Docker image..."
  create_dockerfile
  docker build -t "$IMAGE_NAME" "$PROJECT_DIR"
  echo "Docker image built: $IMAGE_NAME"
}

# ── Funktion: Docker Container starten ───────────────────────────────────────
docker_run() {
  echo "Starting Docker container..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "${PORT}:3000" \
    -e EXAMPLE_SESSIONMANAGER_PORT=3000 \
    "$IMAGE_NAME"
  echo "Container started on port $PORT"
  sleep 2
  echo "Health check:"
  curl -s "http://localhost:${PORT}/api/health" || echo "Health check failed (container may still be starting)"
}

# ── Hauptlogik ───────────────────────────────────────────────────────────────
case "${1:-deploy}" in
  deploy)
    ensure_esbuild
    build
    stop_container
    docker_build
    docker_run
    ;;
  stop)
    stop_container
    ;;
  rebuild)
    ensure_esbuild
    build
    stop_container
    docker_build
    docker_run
    ;;
  *)
    echo "Usage: $0 {deploy|stop|rebuild}"
    exit 1
    ;;
esac

echo "=== Deploy complete ==="
