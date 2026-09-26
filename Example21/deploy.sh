#!/bin/bash
set -e

# ============================================================
# deploy.sh - Build, deploy, and manage SessionManager Docker container
# ============================================================
# Usage:
#   ./deploy.sh build    - Build the Docker image
#   ./deploy.sh up       - Start the containers
#   ./deploy.sh down     - Stop and remove containers
#   ./deploy.sh e2e      - Run E2E tests (up, test, down)
#   ./deploy.sh restart  - Restart the containers
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR/deploy"
PROJECT_DIR="$SCRIPT_DIR"

# Get a random free port
get_free_port() {
  python3 -c "import socket; s=socket.socket(); s.bind(('',0)); print(s.getsockname()[1]); s.close()" 2>/dev/null || \
  node -e "const s=require('net').createServer(); s.listen(0,()=>{console.log(s.address().port);s.close()})" 2>/dev/null || \
  echo $((RANDOM % 10000 + 20000))
}

# Install esbuild if not present
install_esbuild() {
  echo "[deploy] Checking for esbuild..."
  if ! npm list esbuild &>/dev/null; then
    echo "[deploy] Installing esbuild..."
    npm install -D esbuild
  fi
  echo "[deploy] esbuild ready."
}

# Compile TypeScript with esbuild
compile_with_esbuild() {
  echo "[deploy] Compiling with esbuild..."
  npx esbuild src/sessionManager.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --outfile=dist/bundle.js \
    --external:express \
    --external:ioredis \
    --external:@types/express \
    --external:@types/node
  echo "[deploy] Compilation complete: dist/bundle.js"
}

# Create Dockerfile on-the-fly
create_dockerfile() {
  echo "[deploy] Creating Dockerfile..."
  cat > "$DEPLOY_DIR/Dockerfile" << 'DOCKERFILEEOF'
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production 2>/dev/null || npm install --only=production

# Copy compiled bundle
COPY dist/bundle.js ./dist/bundle.js

EXPOSE 3000

CMD ["node", "dist/bundle.js"]
DOCKERFILEEOF
  echo "[deploy] Dockerfile created."
}

# Build Docker image
build_docker() {
  echo "[deploy] Building Docker image..."
  cd "$DEPLOY_DIR"
  docker compose build
  echo "[deploy] Docker image built."
}

# Start containers
start_containers() {
  local port="${1:-3000}"
  export EXAMPLE_SESSIONMANAGER_PORT="$port"
  echo "[deploy] Starting containers on port $port..."
  cd "$DEPLOY_DIR"
  docker compose up -d
  echo "[deploy] Containers started."
  # Wait for health check
  echo "[deploy] Waiting for services to be healthy..."
  docker compose exec -T session-manager node -e "
    const http = require('http');
    const req = http.get('http://localhost:3000/health', (res) => {
      if (res.statusCode === 200) {
        console.log('Service is healthy');
        process.exit(0);
      } else {
        process.exit(1);
      }
    });
    req.on('error', () => {});
    req.setTimeout(5000, () => { process.exit(1); });
  " 2>/dev/null || {
    echo "[deploy] Waiting for service to become available..."
    for i in $(seq 1 30); do
      if curl -s http://localhost:$port/health >/dev/null 2>&1; then
        echo "[deploy] Service is healthy."
        return 0
      fi
      sleep 1
    done
    echo "[deploy] WARNING: Service health check timed out"
    return 1
  }
}

# Stop containers
stop_containers() {
  echo "[deploy] Stopping containers..."
  cd "$DEPLOY_DIR"
  docker compose down
  echo "[deploy] Containers stopped."
}

# Run E2E tests
e2e_tests() {
  echo "[deploy] Running E2E tests..."
  local port
  port=$(get_free_port)
  echo "[deploy] Using random port: $port"

  # Start services
  start_containers "$port"

  # Run E2E tests
  echo "[deploy] Running E2E test suite..."
  cd "$PROJECT_DIR"
  EXAMPLE_SESSIONMANAGER_PORT="$port" npx jest --config jest.config.js tests/sessionManager.e2e.test.ts || {
    echo "[deploy] E2E tests failed. Collecting logs..."
    cd "$DEPLOY_DIR"
    docker compose logs
    cd "$PROJECT_DIR"
    stop_containers
    exit 1
  }

  # Stop services
  stop_containers
  echo "[deploy] E2E tests completed successfully."
}

# Main command handler
case "${1:-up}" in
  build)
    install_esbuild
    compile_with_esbuild
    create_dockerfile
    build_docker
    ;;
  up)
    install_esbuild
    compile_with_esbuild
    create_dockerfile
    build_docker
    start_containers
    ;;
  down)
    stop_containers
    ;;
  e2e)
    e2e_tests
    ;;
  restart)
    stop_containers
    start_containers
    ;;
  *)
    echo "Usage: $0 {build|up|down|e2e|restart}"
    exit 1
    ;;
esac
