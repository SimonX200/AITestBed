#!/usr/bin/env bash
#
# deploy.sh - Build, containerize, and run the SessionManager application.
#
# Usage:
#   ./deploy.sh              # Build and run
#   ./deploy.sh build        # Only build
#   ./deploy.sh run          # Only run container
#   ./deploy.sh stop         # Stop and remove container
#   ./deploy.sh clean        # Remove build artifacts and container
#
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────

readonly PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly DIST_DIR="${PROJECT_DIR}/dist"
readonly IMAGE_NAME="sessionmanager:latest"
readonly CONTAINER_NAME="sessionmanager"

# Use EXAMPLE_SessionManager_Port if set, otherwise find a free port
if [ -n "${EXAMPLE_SessionManager_Port:-}" ]; then
  readonly APP_PORT="${EXAMPLE_SessionManager_Port}"
else
  # Find a random free port between 30000-40000
  APP_PORT=$(python3 -c "import socket; s=socket.socket(); s.bind(('',0)); print(s.getsockname()[1]); s.close()" 2>/dev/null || echo $((RANDOM % 10000 + 30000)))
fi

export EXAMPLE_SessionManager_Port

# ─── Functions ────────────────────────────────────────────────────────────────

install_deps() {
  echo "[deploy] Installing build dependencies..."
  cd "$PROJECT_DIR"
  if ! command -v esbuild &>/dev/null && ! npm ls esbuild &>/dev/null; then
    npm install -D esbuild
  fi
}

build() {
  echo "[deploy] Building sessionManager.ts -> ${DIST_DIR}/bundle.js"
  cd "$PROJECT_DIR"
  mkdir -p "$DIST_DIR"
  npx esbuild sessionManager.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --outfile="${DIST_DIR}/bundle.js" \
    --format=esm
  echo "[deploy] Build complete."
}

create_dockerfile() {
  echo "[deploy] Creating Dockerfile..."
  cat > "${PROJECT_DIR}/Dockerfile" << 'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
EXPOSE 3500
CMD ["node", "bundle.js"]
DOCKERFILE
}

docker_build() {
  echo "[deploy] Building Docker image ${IMAGE_NAME}..."
  cd "$PROJECT_DIR"
  docker build -t "$IMAGE_NAME" .
  echo "[deploy] Docker image built."
}

docker_run() {
  echo "[deploy] Stopping any existing container..."
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true

  echo "[deploy] Starting container on port ${APP_PORT}..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "${APP_PORT}:3500" \
    -e EXAMPLE_SESSIONMANAGER_PORT=3500 \
    --restart unless-stopped \
    "$IMAGE_NAME"

  echo "[deploy] Container started. Access at http://localhost:${APP_PORT}"
  echo "[deploy] Container ID: $(docker ps -q --filter name=$CONTAINER_NAME | head -1)"
}

docker_stop() {
  echo "[deploy] Stopping container..."
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  echo "[deploy] Container stopped."
}

clean() {
  echo "[deploy] Cleaning up..."
  docker_stop
  rm -rf "${PROJECT_DIR}/dist"
  rm -f "${PROJECT_DIR}/Dockerfile"
  echo "[deploy] Clean complete."
}

# ─── Main ─────────────────────────────────────────────────────────────────────

case "${1:-all}" in
  build)
    install_deps
    build
    ;;
  run)
    docker_run
    ;;
  stop)
    docker_stop
    ;;
  clean)
    clean
    ;;
  all|*)
    install_deps
    build
    create_dockerfile
    docker_build
    docker_run
    ;;
esac
