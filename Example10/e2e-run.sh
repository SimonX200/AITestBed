#!/usr/bin/env bash
set -e

echo "=== e2e-run.sh: Starting E2E test suite ==="

# --- Bring up Docker container ---
echo "[E2E] Building and starting container..."
docker rm -f example10-app 2>/dev/null || true
docker rmi example10:latest 2>/dev/null || true

# Build the bundle
npx esbuild sessionManager.ts --bundle --outfile=dist/bundle.js --platform=node

# Create Dockerfile
cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./bundle.js
EXPOSE 3000
CMD ["node", "bundle.js"]
DOCKERFILE

docker build -t example10:latest .
docker run -d --name example10-app -p 3000:3000 example10:latest

# Wait for container to be ready
echo "[E2E] Waiting for container to start..."
sleep 3

# --- Run E2E tests ---
echo "[E2E] Running E2E tests..."
npx ts-mocha -P tsconfig.json e2e/**/*.test.ts
E2E_EXIT=$?

# --- Tear down Docker container ---
echo "[E2E] Stopping container..."
docker rm -f example10-app 2>/dev/null || true

if [ $E2E_EXIT -eq 0 ]; then
  echo "=== e2e-run.sh: E2E tests PASSED ==="
else
  echo "=== e2e-run.sh: E2E tests FAILED (exit code: $E2E_EXIT) ==="
fi

exit $E2E_EXIT
