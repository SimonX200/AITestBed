#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTAINER_NAME="session-manager-app"
IMAGE_NAME="session-manager:latest"
E2E_FAILED=0

echo "========================================"
echo "  E2E Test Suite - Session Manager"
echo "========================================"

# Step 1: Build the project
echo ""
echo "[1/5] Building project..."
npm run build

# Step 2: Stop and remove old container
echo ""
echo "[2/5] Stopping old container (if any)..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Step 3: Build Docker image
echo ""
echo "[3/5] Building Docker image..."
docker build -t "$IMAGE_NAME" .

# Step 4: Run container
echo ""
echo "[4/5] Starting container..."
docker run -d --name "$CONTAINER_NAME" -p 3000:3000 "$IMAGE_NAME"

# Wait for container to be ready
echo "  Waiting for server to be ready..."
for i in $(seq 1 10); do
  if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "  Server is ready!"
    break
  fi
  if [ "$i" -eq 10 ]; then
    echo "  ERROR: Server did not start in time"
    docker logs "$CONTAINER_NAME"
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# Step 5: Run E2E tests
echo ""
echo "[5/5] Running E2E tests..."
echo ""

if npx ts-mocha tests/e2e/sessionManager.e2e.test.ts --paths --timeout 10000 2>&1; then
  echo ""
  echo "========================================"
  echo "  E2E Tests: PASSED"
  echo "========================================"
  E2E_FAILED=0
else
  echo ""
  echo "========================================"
  echo "  E2E Tests: FAILED"
  echo "========================================"
  E2E_FAILED=1
fi

# Cleanup: stop and remove container
echo ""
echo "Cleaning up container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo ""
echo "Container stopped and removed."
exit $E2E_FAILED
