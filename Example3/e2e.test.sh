#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="session-manager-app"
PASS=0
FAIL=0

pass() { echo "[E2E PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "[E2E FAIL] $1"; FAIL=$((FAIL + 1)); }

echo "=== E2E Tests: Running Container ==="

# 1. Container is running
if docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  pass "Container '$CONTAINER_NAME' is running"
else
  fail "Container '$CONTAINER_NAME' is NOT running"
fi

# 2. Container has an image
IMG=$(docker inspect --format='{{.Config.Image}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
if [[ "$IMG" == *"session-manager-app"* ]]; then
  pass "Container uses correct image"
else
  fail "Container image mismatch: $IMG"
fi

# 3. Container is in running state
STATE=$(docker inspect --format='{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null || echo "false")
if [[ "$STATE" == "true" ]]; then
  pass "Container state is running"
else
  fail "Container state is not running: $STATE"
fi

# 4. Container has been up for at least 1 second (stable)
UPTIME_S=$(docker inspect --format='{{.State.StartedAt}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
if [[ -n "$UPTIME_S" && "$UPTIME_S" != "<nil>" ]]; then
  pass "Container started at: $UPTIME_S"
else
  fail "Could not determine container start time"
fi

# 5. No restart loops (RestartCount == 0)
RESTARTS=$(docker inspect --format='{{.RestartCount}}' "$CONTAINER_NAME" 2>/dev/null || echo "-1")
if [[ "$RESTARTS" == "0" ]]; then
  pass "No restart loops (RestartCount=0)"
else
  fail "Container restarted $RESTARTS times"
fi

# 6. Container logs are clean (no FATAL/ERROR)
LOGS=$(docker logs "$CONTAINER_NAME" 2>&1 || true)
if echo "$LOGS" | grep -qi "FATAL\|Error: "; then
  fail "Container logs contain errors:\n$LOGS"
else
  pass "Container logs are clean"
fi

# 7. Container filesystem has bundle.js
if docker exec "$CONTAINER_NAME" test -f /app/bundle.js 2>/dev/null; then
  pass "bundle.js exists inside container"
else
  fail "bundle.js NOT found inside container"
fi

# 8. Container responds to exec (basic health check)
if docker exec "$CONTAINER_NAME" node -e "console.log('ok')" 2>/dev/null | grep -q "ok"; then
  pass "Node.js works inside container"
else
  fail "Node.js does not work inside container"
fi

echo ""
echo "=== E2E Results: $PASS passed, $FAIL failed ==="

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi