#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
CONTAINER_NAME="session-app"

echo "=== Deploy Script ==="

# --- Step 1: Install esbuild if not present ---
echo "[1/6] Checking esbuild..."
if ! command -v esbuild &>/dev/null && [ ! -f "$SCRIPT_DIR/node_modules/.bin/esbuild" ]; then
    echo "  Installing esbuild..."
    npm install -D esbuild
else
    echo "  esbuild already available."
fi

# --- Step 2: Compile TypeScript with esbuild ---
echo "[2/6] Compiling sessionManager.ts → dist/bundle.js ..."
mkdir -p "$DIST_DIR"
npx esbuild sessionManager.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --outfile="$DIST_DIR/bundle.js" \
  --format=cjs

echo "  Compiled successfully."

# --- Step 3: Create Dockerfile on-the-fly ---
echo "[3/6] Creating Dockerfile ..."
cat > "$SCRIPT_DIR/Dockerfile" <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
EXPOSE 3000
CMD ["node", "bundle.js"]
DOCKERFILE
echo "  Dockerfile created."

# --- Step 4: Build Docker image ---
echo "[4/6] Building Docker image $CONTAINER_NAME:latest ..."
docker build -t "$CONTAINER_NAME:latest" "$SCRIPT_DIR"
echo "  Image built."

# --- Step 5: Stop any previous container ---
echo "[5/6] Cleaning up previous container ..."
docker rm -f "$CONTAINER_NAME" &>/dev/null || true

# --- Step 6: Run container in background ---
echo "[6/6] Starting container $CONTAINER_NAME in background ..."
docker run -d --name "$CONTAINER_NAME" -p 3000:3000 "$CONTAINER_NAME:latest"
echo "  Container started."

echo "=== Deploy complete ==="
echo "  Container: $CONTAINER_NAME"
echo "  Image:     $CONTAINER_NAME:latest"
echo "  Bundle:    $DIST_DIR/bundle.js"
