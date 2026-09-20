#!/usr/bin/env bash
#
# deploy.sh - builds and starts the SessionManager Docker container.
#   1. Installs esbuild (dev dependency) if not present.
#   2. Compiles sessionManager.ts to dist/bundle.js via esbuild.
#   3. Creates a minimal Dockerfile (node:20-alpine) on the fly.
#   4. Builds the Docker image and runs the container in the background.
#
set -euo pipefail
cd "$(dirname "$0")"

CONTAINER_NAME="sessionmanager-example13"
IMAGE_NAME="sessionmanager-example13"
HOST_PORT="${PORT:-3000}"

echo "==> [1/4] Checking esbuild ..."
if [ ! -d node_modules/esbuild ]; then
  echo "    esbuild not found - installing ..."
  npm install -D esbuild
else
  echo "    esbuild already installed."
fi

echo "==> [2/4] Compiling sessionManager.ts -> dist/bundle.js ..."
npx esbuild sessionManager.ts --bundle --platform=node --format=cjs --outfile=dist/bundle.js

echo "==> [3/4] Creating minimal Dockerfile (node:20-alpine) ..."
cat > Dockerfile <<'EOF'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./bundle.js
ENV PORT=3000
EXPOSE 3000
CMD ["node", "bundle.js"]
EOF

echo "==> [4/4] Building image and starting container in background ..."
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker build -q -t "$IMAGE_NAME" .
docker run -d --name "$CONTAINER_NAME" -p "${HOST_PORT}:3000" "$IMAGE_NAME"

echo "==> Waiting for container to become healthy ..."
for i in $(seq 1 30); do
  if curl -fsS "http://localhost:${HOST_PORT}/health" >/dev/null 2>&1; then
    echo "==> Container '$CONTAINER_NAME' is up on port ${HOST_PORT}."
    exit 0
  fi
  sleep 1
done

echo "ERROR: Container did not become healthy in time." >&2
docker logs "$CONTAINER_NAME" >&2 || true
exit 1
