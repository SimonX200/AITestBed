#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="session-manager-app"
CONTAINER_NAME="session-manager-container"

echo "=== E2E Test Runner ==="

# Ensure build is up to date
echo "[1/4] Building project..."
cd "$SCRIPT_DIR"
npm run build

# Ensure container is running
echo "[2/4] Ensuring container is running..."
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "  Container not running. Starting..."
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  docker run -d --name "$CONTAINER_NAME" -p 3000:3000 "$IMAGE_NAME"
fi

# Wait for container to be ready
echo "[3/4] Waiting for container to be ready..."
for i in $(seq 1 15); do
  if curl -s http://localhost:3000/health >/dev/null 2>&1; then
    echo "  Container is ready!"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "  ERROR: Container did not become ready in time."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# Run E2E tests
echo "[4/4] Running E2E tests..."
cd "$SCRIPT_DIR"
node node_modules/.bin/jest --testPathPattern="tests/.*\.e2e\.test\.js" --forceExit --detectOpenHandles
TEST_EXIT=$?

# Tear down container
echo ""
echo "=== Tearing down container ==="
docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true

echo "=== E2E complete ==="
exit $TEST_EXIT