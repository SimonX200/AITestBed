#!/usr/bin/env bash
# run-e2e.sh - Startet Docker Container, führt E2E-Tests aus, stoppt Container
#
# Usage:
#   ./run-e2e.sh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_NAME="session-manager-e2e"
IMAGE_NAME="session-manager:latest"

# Zufälligen freien Port finden
find_free_port() {
  local port
  for port in $(shuf -i 15000-16000 -n 1); do
    if ! ss -tlnp | grep -q ":${port} "; then
      echo "$port"
      return
    fi
  done
  echo 15999
}

E2E_PORT=$(find_free_port)
export Example_SessionManager_Port="$E2E_PORT"

echo "=== E2E Tests: Port $E2E_PORT ==="

# Bauen
cd "$PROJECT_DIR"
bash deploy.sh deploy

# E2E Tests ausführen
echo "=== Starte E2E Tests ==="
cd "$PROJECT_DIR"
npx jest --testPathPattern="e2e" --forceExit --detectOpenHandles "$@"

# Container stoppen
echo "=== Stoppe E2E Container ==="
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "=== E2E Tests abgeschlossen ==="
