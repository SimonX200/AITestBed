#!/usr/bin/env bash
set -e

echo "=== deploy.sh: Starting deployment ==="

# 1. Install esbuild if not present
if ! command -v esbuild &> /dev/null && ! npm list -g esbuild &> /dev/null; then
  echo "[1/5] Installing esbuild..."
  npm install -D esbuild
else
  echo "[1/5] esbuild already available."
fi

# 2. Build sessionManager.ts with esbuild
echo "[2/5] Building sessionManager.ts -> dist/bundle.js ..."
mkdir -p dist
npx esbuild sessionManager.ts --bundle --outfile=dist/bundle.js --platform=node

# 3. Create Dockerfile on-the-fly
echo "[3/5] Creating Dockerfile ..."
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./bundle.js
EXPOSE 3000
CMD ["node", "bundle.js"]
DOCKERFILE

# 4. Build Docker image
echo "[4/5] Building Docker image example10:latest ..."
docker build -t example10:latest .

# 5. Run container in background (stop old one first)
echo "[5/5] Starting Docker container ..."
docker rm -f example10-app 2>/dev/null || true
docker run -d --name example10-app -p 3000:3000 example10:latest

echo "=== deploy.sh: Deployment complete ==="
echo "Container is running. Use 'docker logs example10-app' to see output."
