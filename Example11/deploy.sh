#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTAINER_NAME="session-manager-app"
IMAGE_NAME="session-manager:latest"

# ── Step 1: Install esbuild as dev dependency ──────────────────────────
echo "==> Installing esbuild..."
npm install -D esbuild

# ── Step 2: Compile sessionManager.ts to dist/bundle.js ───────────────
echo "==> Compiling sessionManager.ts with esbuild..."
mkdir -p dist
npx esbuild sessionManager.ts \
  --bundle \
  --platform=node \
  --outfile=dist/bundle.js \
  --minify

echo "==> Build successful: dist/bundle.js"

# ── Step 3: Create Dockerfile on-the-fly ──────────────────────────────
echo "==> Creating Dockerfile..."
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js dist/bundle.js
CMD ["node", "dist/bundle.js"]
DOCKERFILE

# ── Step 4: Build Docker image ────────────────────────────────────────
echo "==> Building Docker image..."
docker build -t "$IMAGE_NAME" -f Dockerfile .

# ── Step 5: Run container in background ───────────────────────────────
echo "==> Stopping any existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Starting container in background..."
docker run -d --name "$CONTAINER_NAME" -p 3000:3000 "$IMAGE_NAME"

echo "==> Container '$CONTAINER_NAME' is running."
docker ps --filter "name=$CONTAINER_NAME"

echo ""
echo "=== Deployment complete ==="
