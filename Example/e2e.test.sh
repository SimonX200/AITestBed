#!/usr/bin/env bash
set -euo pipefail

CONTAINER="session-manager-container"
PASS=0
FAIL=0

check() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc  (expected='$expected', actual='$actual')"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== E2E Tests against running Docker container ==="

# E2E 1: Container is running
echo "[E2E 1] Container status"
STATUS=$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null || echo "false")
check "Container is running" "true" "$STATUS"

# E2E 2: Container has correct image
echo "[E2E 2] Image check"
IMAGE=$(docker inspect -f '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || echo "none")
check "Correct image" "session-manager-app" "$IMAGE"

# E2E 3: Container is accessible (port 3000)
echo "[E2E 3] Port accessibility"
if timeout 5 bash -c 'cat < /dev/null > /dev/tcp/localhost/3000' 2>/dev/null; then
  PORT_CHECK="open"
else
  PORT_CHECK="closed"
fi
check "Port 3000 is open" "open" "$PORT_CHECK"

# E2E 4: Container logs show startup
echo "[E2E 4] Container logs"
LOGS=$(docker logs "$CONTAINER" 2>&1 | head -5)
if [ -n "$LOGS" ]; then
  LOGS_CHECK="has_logs"
else
  LOGS_CHECK="no_logs"
fi
check "Container has logs" "has_logs" "$LOGS_CHECK"

# E2E 5: Container restarts cleanly
echo "[E2E 5] Container restart"
docker restart "$CONTAINER" >/dev/null 2>&1
sleep 2
STATUS2=$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null || echo "false")
check "Container running after restart" "true" "$STATUS2"

echo ""
echo "=== E2E Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi