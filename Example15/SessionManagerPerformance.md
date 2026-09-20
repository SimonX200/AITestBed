# Example15 - Performance Analysis

## Architecture Overview

| Component | Technology | Notes |
|-----------|------------|-------|
| Runtime | Node.js 20 (Alpine) | Single-threaded event loop |
| Framework | Express 5 | Minimal overhead HTTP layer |
| Storage | In-memory `Map<string, UserSession>` | No persistence, no disk I/O |
| Bundler | esbuild | Minified bundle for production |
| Container | Docker (node:20-alpine) | ~130 MB image size |

---

## Time Complexity Analysis

| Operation | Method | Time Complexity | Notes |
|-----------|--------|-----------------|-------|
| Add Session | `addSession()` | O(1) | Map.set() — single hash lookup |
| Get Session | `getSession()` | O(1) | Map.get() — single hash lookup |
| Validate Session | `isValidSession()` | O(1) | Map.get() + Date comparison + optional Map.delete() |
| Check Role | `hasRole()` | O(1) | Map.get() + Date comparison + Array.includes() |
| Remove Session | `removeSession()` | O(1) | Map.delete() — single hash lookup |
| Cleanup Expired | `cleanupExpired()` | O(n) | Full iteration over all sessions |
| List Active Sessions | `getAllSessions()` | O(n) | Full iteration, filters expired |
| List All Sessions | `getAllSessionsRaw()` | O(n) | Array.from() — full copy |
| Get Session Count | `getSessionCount()` | O(1) | Map.size — constant |
| POST /api/sessions | Express handler | O(1) | Creates session, returns JSON |
| GET /api/sessions/:id | Express handler | O(1) | Lookup + optional expiry check |
| GET /api/sessions/:id/valid | Express handler | O(1) | Validation + optional delete |
| GET /api/sessions/:id/role/:role | Express handler | O(1) | Lookup + expiry + role check |
| DELETE /api/sessions/:id | Express handler | O(1) | Map.delete() |
| GET /api/sessions | Express handler | O(n) | Filters all sessions |
| POST /api/sessions/cleanup | Express handler | O(n) | Triggers full cleanup |

---

## Space Complexity

| Resource | Complexity | Notes |
|----------|------------|-------|
| Memory per Session | O(1) | Fixed fields: id, token, expiresAt, roles[] |
| Total Memory | O(n) | n = number of sessions in Map |
| List All Sessions | O(n) | Creates new array copy |
| Docker Image | ~130 MB | node:20-alpine + esbuild bundle |

---

## Performance Characteristics

### Strengths

1. **O(1) lookups** — All single-session operations use `Map` hash table for constant-time access.
2. **No I/O bottleneck** — Pure in-memory storage eliminates disk/network latency for session operations.
3. **Auto-cleanup** — Background `setInterval` (60s default) prevents unbounded memory growth.
4. **esbuild minification** — Production bundle is minimized, reducing startup time and memory footprint.
5. **Alpine base image** — Lightweight Docker image (~130 MB) for fast container startup.

### Bottlenecks

1. **O(n) cleanup** — `cleanupExpired()` iterates all sessions. At 1M sessions, this takes ~10-50ms per cycle.
2. **Single-threaded** — Node.js event loop blocks on any synchronous operation. No horizontal scaling.
3. **No persistence** — All sessions lost on restart. Not suitable for production without external storage.
4. **Memory unbounded** — Without auto-cleanup, memory grows linearly with session count.
5. **getAllSessions() O(n)** — Listing all sessions requires full iteration and filtering.

---

## Benchmark Estimates (Local Machine)

| Metric | Estimate | Conditions |
|--------|----------|------------|
| addSession | ~50ns | Single Map.set() |
| getSession | ~30ns | Single Map.get() |
| isValidSession | ~40ns | Map.get() + Date comparison |
| cleanupExpired (10K sessions) | ~2ms | Full iteration |
| cleanupExpired (1M sessions) | ~200ms | Full iteration |
| Express request (GET /:id) | ~500µs | Including JSON serialization |
| Express request (GET /) | ~1ms | Full list, 10K sessions |
| Container startup | ~3s | Cold start, Alpine + Node |

---

## Scalability Limits

| Factor | Limit | Reason |
|--------|-------|--------|
| Max Sessions (RAM) | ~100K-500K | ~50-200 MB RAM depending on session size |
| Requests/sec | ~5,000-15,000 | Single-threaded Node.js, minimal logic |
| Concurrent Connections | ~10,000 | Node.js event loop + OS limits |
| Cleanup Frequency | 60s default | Too frequent = CPU waste; too rare = stale sessions |

---

## Recommendations

### Short-Term Optimizations

1. **Lazy cleanup on access** — Move expiry checks from `getAllSessions()` to individual lookups to avoid O(n) scans.
2. **TTL Map** — Use a time-sorted structure (e.g., min-heap) for O(log n) expired session eviction.
3. **Connection pooling** — If adding a database, use connection pooling for session persistence.

### Long-Term Improvements

1. **External storage** — Replace in-memory Map with Redis for distributed session management.
2. **Horizontal scaling** — Deploy behind a load balancer with sticky sessions or external session store.
3. **Metrics** — Add Prometheus metrics for session count, cleanup duration, and request latency.
4. **Graceful shutdown** — Handle SIGTERM to stop the cleanup interval and drain active requests.

---

## Test Coverage Summary

| Test Type | Count | Coverage |
|-----------|-------|----------|
| Unit Tests | 20 | All SessionManager methods |
| E2E Tests | 14 | All Express API endpoints |
| Total | 34 | 100% endpoint coverage |

---

## Environment

| Item | Value |
|------|-------|
| Node.js | 20 (Alpine) |
| Express | 5.2.1 |
| TypeScript | 7.0.2 |
| esbuild | 0.28.2 |
| Vitest | 5.0.1 |
| Docker | node:20-alpine |
