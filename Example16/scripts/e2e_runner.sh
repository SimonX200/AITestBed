#!/usr/bin/env bash
set -euo pipefail

# Finde einen freien Port
find_free_port() {
  local port
  for port in $(seq 15000 15100); do
    if ! ss -tlnp | grep -q ":${port} "; then
      echo "$port"
      return 0
    fi
  done
  echo "3000"
}

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
E2E_PORT=$(find_free_port)
export EXAMPLE_SESSIONMANAGER_PORT=$E2E_PORT

echo "=== E2E Test Runner ==="
echo "Using port: $E2E_PORT"

# Deploy
"$PROJECT_DIR/deploy.sh" deploy
sleep 3

# Run E2E tests
cd "$PROJECT_DIR"
npx jest --config jest.config.js src/sessionManager.e2e.test.ts

# Cleanup
"$PROJECT_DIR/deploy.sh" stop

echo "=== E2E Tests complete ==="
