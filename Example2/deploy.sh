#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Step 1: Install esbuild ==="
if ! command -v esbuild &>/dev/null && [ ! -d node_modules ]; then
  npm install -D esbuild
else
  echo "esbuild already available."
fi

echo "=== Step 2: Compile sessionManager.ts with esbuild ==="
mkdir -p dist
npx esbuild sessionManager.ts \
  --bundle \
  --platform=node \
  --outfile=dist/bundle.js \
  --format=cjs

echo "=== Step 3: Create Dockerfile ==="
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./bundle.js
CMD ["node", "bundle.js"]
DOCKERFILE

echo "=== Step 4: Build Docker image ==="
docker build -t session-manager-app .

echo "=== Step 5: Run Docker container in background ==="
docker rm -f session-manager-container 2>/dev/null || true
docker run -d --name session-manager-container session-manager-app

echo "=== Deploy complete ==="
docker ps --filter "name=session-manager-container" --format "table {{.ID}}\t{{.Status}}\t{{.Names}}"