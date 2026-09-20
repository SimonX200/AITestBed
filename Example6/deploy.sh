#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Step 1: Install dependencies ==="
npm install 2>/dev/null || true

echo "=== Step 2: Compile sessionManager.ts with esbuild ==="
mkdir -p dist
npx esbuild server.ts --bundle --outfile=dist/bundle.js --platform=node --target=node20

echo "=== Step 3: Create Dockerfile ==="
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js /app/bundle.js
CMD ["node", "bundle.js"]
DOCKERFILE

echo "=== Step 4: Build Docker image ==="
docker build -t session-manager-app .

echo "=== Step 5: Run Docker container ==="
docker rm -f session-manager-container 2>/dev/null || true
docker run -d --name session-manager-container -p 3000:3000 session-manager-app

echo "=== Deploy complete ==="
echo "Container is running. Use 'docker logs session-manager-container' to check."
