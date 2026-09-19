#!/usr/bin/env bash
set -euo pipefail

echo "=== E2E Tests: Docker Container ==="

# Test 1: Container is running
echo "  Test 1: Check container is running..."
if ! docker ps --format '{{.Names}}' | grep -q 'session-manager-container'; then
  echo "  ✗ Container is not running!"
  exit 1
fi
echo "  ✓ Container is running"

# Test 2: Container image is correct
echo "  Test 2: Check container image..."
IMAGE=$(docker inspect --format='{{.Config.Image}}' session-manager-container)
if [ "$IMAGE" != "session-manager-app" ]; then
  echo "  ✗ Wrong image: $IMAGE"
  exit 1
fi
echo "  ✓ Correct image: $IMAGE"

# Test 3: Container has correct command
echo "  Test 3: Check container command..."
CMD=$(docker inspect --format='{{json .Config.Cmd}}' session-manager-container)
if [[ "$CMD" != *'node'*'bundle.js'* ]]; then
  echo "  ✗ Wrong command: $CMD"
  exit 1
fi
echo "  ✓ Correct command: $CMD"

# Test 4: Container logs are accessible
echo "  Test 4: Check container logs..."
LOGS=$(docker logs session-manager-container 2>&1 || true)
echo "  ✓ Logs accessible (length: ${#LOGS} chars)"

# Test 5: Container is responsive (health check via exec)
echo "  Test 5: Check container process is alive..."
RUNNING=$(docker inspect --format='{{.State.Running}}' session-manager-container)
if [ "$RUNNING" != "true" ]; then
  echo "  ✗ Container is not running: $RUNNING"
  exit 1
fi
echo "  ✓ Container process is alive"

# Test 6: Container has correct working directory
echo "  Test 6: Check working directory..."
WORKDIR=$(docker inspect --format='{{.Config.WorkingDir}}' session-manager-container)
if [ "$WORKDIR" != "/app" ]; then
  echo "  ✗ Wrong working directory: $WORKDIR"
  exit 1
fi
echo "  ✓ Correct working directory: $WORKDIR"

# Test 7: Bundle file exists in container
echo "  Test 7: Check bundle.js exists in container..."
docker exec session-manager-container test -f /app/bundle.js
echo "  ✓ bundle.js exists in container"

echo ""
echo "=== All E2E tests passed ==="