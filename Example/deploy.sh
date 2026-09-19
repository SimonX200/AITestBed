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

echo "=== Step 2: Compile server.ts with esbuild ==="
mkdir -p dist
npx esbuild server.ts --bundle --outfile=dist/server.js --platform=node --target=node20

echo "=== Step 3: Create Dockerfile ==="
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/server.js .
EXPOSE 3000
CMD ["node", "server.js"]
DOCKERFILE

echo "=== Step 4: Build Docker image ==="
docker build -t session-manager-app .

echo "=== Step 5: Run Docker container in background ==="
docker rm -f session-manager-container 2>/dev/null || true
docker run -d --name session-manager-container -p 3000:3000 session-manager-app

echo "=== Deploy complete ==="
echo "Container: session-manager-container"
echo "Image:     session-manager-app"