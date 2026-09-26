#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$SCRIPT_DIR/deploy"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Step 1: Install esbuild if not present
log_info "Checking esbuild installation..."
cd "$PROJECT_DIR"
if ! npm list esbuild &>/dev/null; then
  log_info "Installing esbuild..."
  npm install -D esbuild
else
  log_info "esbuild already installed."
fi

# Step 2: Compile sessionManager.ts to dist/bundle.js
log_info "Compiling sessionManager.ts with esbuild..."
npm run build

if [ ! -f "$PROJECT_DIR/dist/bundle.js" ]; then
  log_error "Build failed: dist/bundle.js not found"
  exit 1
fi
log_info "Build successful: dist/bundle.js"

# Step 3: Create Dockerfile on-the-fly (if not already created)
if [ ! -f "$DEPLOY_DIR/Dockerfile" ]; then
  log_info "Creating Dockerfile..."
  cat > "$DEPLOY_DIR/Dockerfile" << 'INNEREOF'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
EXPOSE 3000
CMD ["node", "bundle.js"]
INNEREOF
  log_info "Dockerfile created."
fi

# Step 4: Determine port
if [ -n "$EXAMPLE_SESSIONMANAGER_PORT" ]; then
  PORT="$EXAMPLE_SESSIONMANAGER_PORT"
  log_info "Using port from environment: $PORT"
else
  # Find a free port
  PORT=$(python3 -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 0))
print(s.getsockname()[1])
s.close()
" 2>/dev/null || echo "3000")
  log_info "Using random free port: $PORT"
fi

# Step 5: Start services with docker compose
log_info "Starting services with docker compose..."
cd "$DEPLOY_DIR"
export EXAMPLE_SESSIONMANAGER_PORT="$PORT"

docker compose down 2>/dev/null || true
docker compose up -d --build

log_info "Services started!"
log_info "Session Manager: http://localhost:$PORT"
log_info "Redis: localhost:6379"
log_info "Health check: http://localhost:$PORT/api/health"

# Wait for services to be ready
log_info "Waiting for services to be ready..."
for i in $(seq 1 30); do
  if curl -s "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    log_info "Services are ready!"
    exit 0
  fi
  sleep 1
done

log_error "Services failed to start within 30 seconds"
docker compose logs
docker compose down
exit 1
