#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# deploy.sh
# Kompiliert sessionManager.ts, erstellt Dockerfile, baut und startet Docker-Container
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTAINER_NAME="session-manager-app"
IMAGE_NAME="session-manager:latest"

echo "============================================"
echo "  Deploy Script - Session Manager"
echo "============================================"

# --- Schritt 1: npm install -D esbuild ---
echo ""
echo "[1/5] Installiere esbuild..."
if ! npm list esbuild &>/dev/null; then
  npm install -D esbuild
else
  echo "esbuild ist bereits installiert."
fi

# --- Schritt 2: Kompilieren mit esbuild ---
echo ""
echo "[2/5] Kompiliere sessionManager.ts mit esbuild..."
npx esbuild sessionManager.ts \
  --bundle \
  --platform=node \
  --outfile=dist/bundle.js \
  --format=cjs \
  --minify

echo "Kompilation erfolgreich: dist/bundle.js"

# --- Schritt 3: Dockerfile erstellen ---
echo ""
echo "[3/5] Erstelle Dockerfile..."
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
EXPOSE 3000
ENV PORT=3000
CMD ["node", "bundle.js"]
DOCKERFILE
echo "Dockerfile erstellt."

# --- Schritt 4: Docker-Container stoppen (falls läuft) und neu bauen ---
echo ""
echo "[4/5] Baue Docker-Image..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true
docker build -t "$IMAGE_NAME" .

echo "Docker-Image gebaut: $IMAGE_NAME"

# --- Schritt 5: Container starten ---
echo ""
echo "[5/5] Starte Docker-Container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p 3000:3000 \
  "$IMAGE_NAME"

echo ""
echo "============================================"
echo "  Deployment erfolgreich!"
echo "  Container: $CONTAINER_NAME"
echo "  Image:     $IMAGE_NAME"
echo "  URL:       http://localhost:3000"
echo "============================================"
echo ""
echo "Container-Status:"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
