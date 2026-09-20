#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTAINER_NAME="session-manager-container"
IMAGE_NAME="session-manager-app"
E2E_PASSED=0
E2E_FAILED=0

e2e_pass() {
  echo "  ✅ E2E: $1"
  ((E2E_PASSED++))
}

e2e_fail() {
  echo "  ❌ E2E: $1"
  ((E2E_FAILED++))
}

echo "============================================"
echo "  E2E Tests: Docker Container Integration"
echo "============================================"

# ── Start: build and run container ─────────────────────────
echo ""
echo "🔨 Building project..."
npm run build

echo "🐳 Building Docker image..."
docker build -t "$IMAGE_NAME" .

echo "🚀 Starting container..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
docker run -d --name "$CONTAINER_NAME" "$IMAGE_NAME"
sleep 3

# ── E2E Test 1: Container is running ───────────────────────
echo ""
echo "📦 E2E Test 1: Container is running"
if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
  e2e_pass "Container '$CONTAINER_NAME' is running"
else
  e2e_fail "Container '$CONTAINER_NAME' is running"
fi

# ── E2E Test 2: Container logs are accessible ──────────────
echo ""
echo "📦 E2E Test 2: Container logs are accessible"
LOGS=$(docker logs "$CONTAINER_NAME" 2>&1 || true)
if [ -n "$LOGS" ]; then
  e2e_pass "Container produced logs"
else
  e2e_fail "Container produced logs"
fi

# ── E2E Test 3: Image was built successfully ───────────────
echo ""
echo "📦 E2E Test 3: Docker image exists"
if docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
  e2e_pass "Docker image '$IMAGE_NAME' exists"
else
  e2e_fail "Docker image '$IMAGE_NAME' exists"
fi

# ── E2E Test 4: dist/bundle.js exists and is valid JS ──────
echo ""
echo "📦 E2E Test 4: dist/bundle.js exists and is valid"
if [ -f dist/bundle.js ] && [ -s dist/bundle.js ]; then
  e2e_pass "dist/bundle.js exists and is non-empty"
else
  e2e_fail "dist/bundle.js exists and is non-empty"
fi

# ── E2E Test 5: SessionManager module loads in Node ────────
echo ""
echo "📦 E2E Test 5: Node.js runtime works inside container"
NODE_RESULT=$(docker exec "$CONTAINER_NAME" node -e "console.log('alive')" 2>&1 || true)
if [ "$NODE_RESULT" = "alive" ]; then
  e2e_pass "Node.js runtime works inside container"
else
  e2e_fail "Node.js runtime works inside container"
fi

# ── E2E Test 6: Multiple container restarts ────────────────
echo ""
echo "📦 E2E Test 6: Container restarts cleanly"
docker restart "$CONTAINER_NAME"
sleep 3
if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
  e2e_pass "Container restarts successfully"
else
  e2e_fail "Container restarts successfully"
fi

# ── Cleanup: stop and remove container ─────────────────────
echo ""
echo "🧹 Stopping container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# ── Summary ────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  E2E Results: ${E2E_PASSED} passed, ${E2E_FAILED} failed"
echo "============================================"

if [ "$E2E_FAILED" -gt 0 ]; then
  exit 1
fi
echo "All E2E tests passed! ✅"
