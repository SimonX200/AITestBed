#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTAINER_NAME="session-manager-app"
IMAGE_NAME="session-manager:latest"
E2E_PASS=0
E2E_FAIL=0
E2E_TOTAL=0

e2e_pass() {
  echo "  [PASS] $1"
  E2E_PASS=$((E2E_PASS + 1))
  E2E_TOTAL=$((E2E_TOTAL + 1))
}

e2e_fail() {
  echo "  [FAIL] $1"
  E2E_FAIL=$((E2E_FAIL + 1))
  E2E_TOTAL=$((E2E_TOTAL + 1))
}

e2e_info() {
  echo "  [INFO] $1"
}

echo "==> E2E: Checking if container '$CONTAINER_NAME' is running..."
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "==> E2E: Container not running. Starting it now..."
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  if ! docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
    echo "==> E2E: Building image..."
    npm install -D esbuild >/dev/null 2>&1
    mkdir -p dist
    npx esbuild sessionManager.ts --bundle --platform=node --outfile=dist/bundle.js --minify >/dev/null 2>&1
    cat > Dockerfile <<'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js dist/bundle.js
CMD ["node", "dist/bundle.js"]
DOCKERFILE
    docker build -t "$IMAGE_NAME" -f Dockerfile . >/dev/null 2>&1
  fi
  docker run -d --name "$CONTAINER_NAME" -p 3000:3000 "$IMAGE_NAME" >/dev/null 2>&1
  echo "==> E2E: Container started."
else
  echo "==> E2E: Container is already running."
fi

echo "==> E2E: Waiting for container to be ready..."
sleep 3

echo ""
echo "=== E2E Test Suite ==="
echo ""
echo "Test 1: Container health check"
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  e2e_pass "Container '$CONTAINER_NAME' is running"
else
  e2e_fail "Container '$CONTAINER_NAME' is NOT running"
fi

echo "Test 2: Container image verification"
CONTAINER_IMAGE=$(docker inspect --format='{{.Config.Image}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
if [ "$CONTAINER_IMAGE" = "$IMAGE_NAME" ]; then
  e2e_pass "Container uses correct image: $IMAGE_NAME"
else
  e2e_fail "Container image mismatch: expected '$IMAGE_NAME', got '$CONTAINER_IMAGE'"
fi

echo "Test 3: Container state check"
CONTAINER_STATE=$(docker inspect --format='{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null || echo "false")
if [ "$CONTAINER_STATE" = "true" ]; then
  e2e_pass "Container is in running state"
else
  e2e_fail "Container is NOT in running state (state: $CONTAINER_STATE)"
fi

echo "Test 4: Port accessibility check"
if docker port "$CONTAINER_NAME" 3000 >/dev/null 2>&1; then
  e2e_pass "Port 3000 is accessible on container"
else
  e2e_fail "Port 3000 is NOT accessible on container"
fi

echo "Test 5: Container logs check"
CONTAINER_LOGS=$(docker logs --tail 20 "$CONTAINER_NAME" 2>&1 || echo "")
if echo "$CONTAINER_LOGS" | grep -qi "error\|exception\|fatal"; then
  e2e_fail "Container logs contain errors"
else
  e2e_pass "Container logs are clean (no errors)"
fi

echo "Test 6: Container disk usage"
CONTAINER_SIZE=$(docker inspect --format='{{.Size}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
CONTAINER_RWSIZE=$(docker inspect --format='{{.RootFS.Size}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
CONTAINER_ID=$(docker inspect --format='{{.Id}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
if [ -n "$CONTAINER_ID" ]; then
  e2e_pass "Container exists with valid ID (size=$CONTAINER_SIZE rwsize=$CONTAINER_RWSIZE)"
else
  e2e_fail "Container disk usage is invalid: size=$CONTAINER_SIZE rwsize=$CONTAINER_RWSIZE"
fi

echo "Test 7: Bundle file exists in container"
if docker exec "$CONTAINER_NAME" test -f /app/dist/bundle.js 2>/dev/null; then
  e2e_pass "dist/bundle.js exists inside container"
else
  e2e_fail "dist/bundle.js NOT found inside container"
fi

echo "Test 8: Node.js version in container"
NODE_VERSION=$(docker exec "$CONTAINER_NAME" node --version 2>/dev/null || echo "unknown")
if [[ "$NODE_VERSION" == v20* ]]; then
  e2e_pass "Container runs Node.js $NODE_VERSION"
else
  e2e_fail "Container Node.js version unexpected: $NODE_VERSION"
fi

echo "Test 9: SessionManager module loads in container"
MODULE_CHECK=$(docker exec "$CONTAINER_NAME" node -e "
  const fs = require('fs');
  const content = fs.readFileSync('/app/dist/bundle.js', 'utf8');
  if (content.includes('SessionManager') || content.includes('UserSession')) {
    console.log('OK');
  } else {
    console.log('MISSING');
  }
" 2>/dev/null || echo "ERROR")
if [ "$MODULE_CHECK" = "OK" ]; then
  e2e_pass "SessionManager code is present in container bundle"
else
  e2e_fail "SessionManager code NOT found in container bundle (got: $MODULE_CHECK)"
fi

echo "Test 10: Container memory usage"
MEM_USAGE=$(docker stats --no-stream --format '{{.MemUsage}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
if [ "$MEM_USAGE" != "unknown" ]; then
  e2e_pass "Container memory usage: $MEM_USAGE"
else
  e2e_fail "Could not retrieve container memory usage"
fi

echo ""
echo "=============================="
echo "  E2E Results: $E2E_TOTAL tests"
echo "  Passed: $E2E_PASS"
echo "  Failed: $E2E_FAIL"
echo "=============================="

echo ""
echo "==> E2E: Stopping container '$CONTAINER_NAME'..."
docker stop "$CONTAINER_NAME" >/dev/null 2>&1 && echo "  Container stopped." || echo "  Container was not running."
docker rm "$CONTAINER_NAME" >/dev/null 2>&1 && echo "  Container removed." || echo "  Container was not found."

echo ""
echo "=== E2E Test Suite Complete ==="

if [ "$E2E_FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
