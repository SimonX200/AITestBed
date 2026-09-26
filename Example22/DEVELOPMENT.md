# Development Guide

## Architecture

### Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SessionManager                           │
├─────────────────────────────────────────────────────────────────┤
│ - sessions: Map<string, UserSession>                            │
│ - redisClient: RedisClientType                                  │
│ - isRedisConnected: boolean                                     │
│ - cleanupInterval: NodeJS.Timeout | null                        │
│ - cleanupMs: number                                             │
├─────────────────────────────────────────────────────────────────┤
│ + addSession(session): Promise<UserSession>                     │
│ + checkSession(id): Promise<UserSession | null>                 │
│ + getSession(id): Promise<UserSession | null>                   │
│ + getAllSessions(): Promise<UserSession[]>                      │
│ + deleteSession(id): Promise<boolean>                           │
│ + cleanupExpiredSessions(): Promise<number>                     │
│ + getSessionCount(): number                                     │
│ + isConnected(): boolean                                        │
│ + startCleanup(): void                                          │
│ + stopCleanup(): void                                           │
│ + close(): Promise<void>                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          RedisClient                             │
│  (External: redis npm package)                                  │
│  - Stores sessions with key format: session:{id}                │
│  - Auto-expiry based on session.expiresAt                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ persists to
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Redis Server                             │
│  (Docker: redis:7-alpine)                                       │
│  - Persistent storage via redis-data volume                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          createServer                           │
│  (HTTP Server Factory Function)                                 │
├─────────────────────────────────────────────────────────────────┤
│ - Handles HTTP requests                                         │
│ - Routes to SessionManager methods                              │
│ - JSON request/response handling                                │
│ - CORS support                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ manages
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UserSession (Interface)                      │
├─────────────────────────────────────────────────────────────────┤
│ + id: string                                                    │
│ + token: string                                                 │
│ + expiresAt: Date                                               │
│ + roles: string[]                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Client Request → HTTP Server → Route Handler → SessionManager → Redis
                                                                   ↓
                                                              Redis Storage
```

## Project Structure

```
Example22/
├── src/
│   └── sessionManager.ts      # Main implementation
├── tests/
│   ├── sessionManager.test.ts  # Unit tests
│   └── sessionManager.e2e.test.ts  # E2E tests
├── deploy/
│   ├── docker-compose.yaml     # Docker Compose configuration
│   └── Dockerfile              # Docker build file
├── deploy.sh                   # Deployment script
├── package.json
├── tsconfig.json               # TypeScript config (source)
├── tsconfig.tests.json         # TypeScript config (tests)
├── jest.config.js              # Jest configuration
├── README.md                   # User documentation
├── DEVELOPMENT.md              # This file
└── openapi.yaml                # OpenAPI specification
```

## Running Tests

```bash
# Unit tests only
npm test

# E2E tests (requires running server)
npm run e2e

# All tests
npm test && npm run e2e
```

## Building

```bash
# Build TypeScript and bundle with esbuild
npm run build
```

## Adding New Endpoints

1. Add route handling in `createServer()` function in `src/sessionManager.ts`
2. Add corresponding method to `SessionManager` class
3. Write unit tests in `tests/sessionManager.test.ts`
4. Write E2E tests in `tests/sessionManager.e2e.test.ts`
5. Update OpenAPI spec in `openapi.yaml`
