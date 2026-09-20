# E2E Test Report — SessionManager Docker Container

## Summary

All 7 E2E tests passed successfully against the Dockerized `SessionManager` application.

## Test Results

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Container is running | ✔ Pass | 22.2ms |
| 2 | Correct image (`session-app:latest`) | ✔ Pass | 20.1ms |
| 3 | Port 3000 exposed | ✔ Pass | 21.0ms |
| 4 | `bundle.js` present in container | ✔ Pass | 57.1ms |
| 5 | Alpine base image layers | ✔ Pass | 35.5ms |
| 6 | Valid output on execution | ✔ Pass | 93.5ms |
| 7 | `bundle.js` exists in build context | ✔ Pass | 5.3ms |

**Total:** 7 tests, 0 failures, ~10.8s duration

## Fixes Applied

1. **Shell quoting in `dockerRun`**: Modified the helper function to quote arguments containing special shell characters (`{`, `}`, `$`, `` ` ``, etc.) so that Docker `--format` strings like `{{json .Config.ExposedPorts}}` are passed correctly to the shell.

2. **Alpine base image assertion**: Changed the check from looking for the literal string `node:20-alpine` (which doesn't appear in `docker history` output) to checking for `alpine` — the `node:20-alpine` image uses `alpine-minirootfs` in its layers, which is what `docker history` reports.

## Container Lifecycle

- Container `session-app` was started with `-p 3000:3000` mapping.
- The `after` hook automatically stopped and removed the container after all tests completed.
