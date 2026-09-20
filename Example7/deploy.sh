#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTAINER_NAME="session-manager-app"
IMAGE_NAME="session-manager:latest"

echo "=== Step 1: Install esbuild ==="
if ! npm list -g esbuild &>/dev/null && ! command -v esbuild &>/dev/null; then
  npm install -D esbuild
else
  echo "esbuild already installed."
fi

echo "=== Step 2: Compile sessionManager.ts with esbuild ==="
mkdir -p dist
npx esbuild sessionManager.ts --bundle --outfile=dist/bundle.js --platform=node --minify

echo "=== Step 3: Create Dockerfile ==="
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
CMD ["node", "bundle.js"]
DOCKERFILE

echo "=== Step 4: Stop and remove old container (if running) ==="
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "=== Step 5: Build Docker image ==="
docker build -t "$IMAGE_NAME" .

echo "=== Step 6: Run Docker container in background ==="
docker run -d --name "$CONTAINER_NAME" -p 3000:3000 "$IMAGE_NAME"

echo "=== Deployment complete ==="
echo "Container: $CONTAINER_NAME"
echo "Image: $IMAGE_NAME"
docker ps --filter "name=$CONTAINER_NAME"
