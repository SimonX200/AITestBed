#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
IMAGE_NAME="session-manager-app"
CONTAINER_NAME="session-manager-container"

echo "=== Deploy Script ==="

# 1. Install esbuild if not present
echo "[1/5] Checking esbuild..."
if ! npm list -g esbuild &>/dev/null && ! ls "$SCRIPT_DIR/node_modules/esbuild" &>/dev/null; then
  echo "  Installing esbuild..."
  npm install -D esbuild
else
  echo "  esbuild already installed."
fi

# 2. Ensure dist directory exists
mkdir -p "$DIST_DIR"

# 3. Compile sessionManager.ts to dist/bundle.js using esbuild
echo "[2/5] Compiling sessionManager.ts -> dist/bundle.js ..."
npx esbuild sessionManager.ts \
  --bundle \
  --outfile="$DIST_DIR/bundle.js" \
  --platform=node \
  --target=node20.0 \
  --minify

echo "  Build successful."

# 4. Create Dockerfile on-the-fly
echo "[3/5] Creating Dockerfile ..."
cat > "$SCRIPT_DIR/Dockerfile" <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./
CMD ["node", "bundle.js"]
DOCKERFILE
echo "  Dockerfile created."

# 5. Build Docker image
echo "[4/5] Building Docker image '$IMAGE_NAME' ..."
docker build -t "$IMAGE_NAME" "$SCRIPT_DIR"

# 6. Run container in background (stop old one first if exists)
echo "[5/5] Starting container '$CONTAINER_NAME' ..."
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER_NAME" -p 3000:3000 "$IMAGE_NAME"

echo ""
echo "=== Deploy complete ==="
echo "  Image : $IMAGE_NAME"
echo "  Container: $CONTAINER_NAME (running in background)"
echo ""
echo "To stop: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"