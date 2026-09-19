#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTAINER_NAME="session-manager-app"

# ── 1. Install esbuild if missing ──────────────────────────────────
if ! npm list -g esbuild &>/dev/null && ! command -v esbuild &>/dev/null; then
  echo "[deploy] Installing esbuild…"
  npm install -D esbuild
fi

# ── 2. Compile TypeScript → dist/bundle.js ─────────────────────────
echo "[deploy] Compiling sessionManager.ts with esbuild…"
mkdir -p dist
npx esbuild sessionManager.ts \
  --bundle \
  --outfile=dist/bundle.js \
  --platform=node \
  --format=cjs

echo "[deploy] Build OK → dist/bundle.js"

# ── 3. Create Dockerfile on-the-fly ────────────────────────────────
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
CMD ["node", "bundle.js"]
DOCKERFILE

echo "[deploy] Dockerfile created."

# ── 4. Build Docker image ──────────────────────────────────────────
echo "[deploy] Building Docker image…"
docker build -t session-manager-app .

# ── 5. Remove stale container (if any) and start in background ─────
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

echo "[deploy] Starting container '$CONTAINER_NAME' in background…"
docker run -d --name "$CONTAINER_NAME" session-manager-app

echo "[deploy] Container running. ID: $(docker ps -q --filter name=$CONTAINER_NAME)"
echo "[deploy] Done."