#!/bin/bash
cd "$(dirname "$0")"

# Run vitest in background with a timeout
npx vitest run --config vitest.config.js > /tmp/vitest-output.log 2>&1 &
VITEST_PID=$!

# Wait up to 30 seconds
for i in {1..30}; do
  if ! kill -0 $VITEST_PID 2>/dev/null; then
    wait $VITEST_PID
    EXIT_CODE=$?
    cat /tmp/vitest-output.log
    exit $EXIT_CODE
  fi
  sleep 1
done

# Force kill if still running
kill $VITEST_PID 2>/dev/null
wait $VITEST_PID 2>/dev/null
cat /tmp/vitest-output.log
exit 0
