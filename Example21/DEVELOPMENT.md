# Development Guide

## Architecture Overview

The SessionManager is built with a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Layer (Express)                  │
│  /health, /api/sessions, /api/sessions/:id, etc.        │
├─────────────────────────────────────────────────────────┤
│              SessionManager (Business Logic)             │
│  - Session CRUD operations                              │
│  - Expiry management                                    │
│  - Role validation                                      │
├─────────────────────────────────────────────────────────┤
│              Storage Layer                               │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ In-Memory    │    │   Redis      │                   │
│  │ Map (fast)   │◄──►│ (persistent) │                   │
│  └──────────────┘    └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## Class Diagram

```
┌──────────────────────────────────────┐
│           SessionManager             │
├──────────────────────────────────────┤
│ - redisClient: any                   │
│ - inMemoryMap: Map<string,           │
│                UserSession>          │
│ - defaultDurationMinutes: number     │
├──────────────────────────────────────┤
│ +createSession(input):               │
│   Promise<UserSession>               │
│ +getSession(id):                     │
│   Promise<UserSession | null>        │
│ +validateSession(id, token):         │
│   Promise<boolean>                   │
│ +deleteSession(id):                  │
│   Promise<boolean>                   │
│ +cleanupExpired():                   │
│   Promise<number>                    │
│ +getAllSessions():                   │
│   Promise<UserSession[]>             │
│ +close(): Promise<void>              │
│ -connectRedis(url): Promise<void>    │
│ -generateId(): string                │
│ -generateToken(): string             │
│ -serialize(session): SessionData     │
│ -deserialize(data): UserSession      │
│ -isExpired(session): boolean         │
└──────────────────────────────────────┘
              │
              │ creates / uses
              ▼
┌──────────────────────────────────────┐
│            UserSession               │
├──────────────────────────────────────┤
│ +id: string                          │
│ +token: string                       │
│ +expiresAt: Date                     │
│ +roles: string[]                     │
└──────────────────────────────────────┘
              │
              │ serializes to
              ▼
┌──────────────────────────────────────┐
│           SessionData                │
├──────────────────────────────────────┤
│ +id: string                          │
│ +token: string                       │
│ +expiresAt: string (ISO)             │
│ +roles: string[]                     │
└──────────────────────────────────────┘
              │
              │ persists to
              ▼
┌──────────────────────────────────────┐
│              Redis                   │
├──────────────────────────────────────┤
│ Key: session:{id}                    │
│   Value: JSON(SessionData)           │
│ Key: session:ids                     │
│   Type: Set<string>                  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│           createApp()                │
│  (Factory function)                  │
├──────────────────────────────────────┤
│ +createApp(sessionManager):          │
│   Application                        │
│    - GET  /health                    │
│    - POST /api/sessions              │
│    - GET  /api/sessions/:id          │
│    - POST /api/sessions/:id/validate │
│    - DELETE /api/sessions/:id        │
│    - POST /api/sessions/cleanup      │
│    - GET  /api/sessions              │
└──────────────────────────────────────┘
```

## Data Flow

### Creating a Session
```
HTTP POST /api/sessions
    └─> SessionManager.createSession()
         ├─> Generate UUID + token
         ├─> Calculate expiresAt
         ├─> Store in inMemoryMap
         └─> Persist to Redis (SET + SADD)
              └─> Return UserSession
```

### Validating a Session
```
HTTP POST /api/sessions/:id/validate
    └─> SessionManager.validateSession()
         ├─> getSession(id)
         │    ├─> Check inMemoryMap
         │    └─> Check Redis (if not in memory)
         └─> Compare token + check expiry
```

### Cleanup Expired Sessions
```
HTTP POST /api/sessions/cleanup
    └─> SessionManager.cleanupExpired()
         ├─> Iterate inMemoryMap, remove expired
         ├─> Get all IDs from Redis (SMEMBERS)
         ├─> Check each session expiry
         └─> Remove expired from both stores
```

## Testing Strategy

### Unit Tests (`tests/sessionManager.test.ts`)
- Mock Redis with in-memory Map
- Test all SessionManager methods
- ~13 test cases covering CRUD, validation, expiry

### E2E Tests (`tests/sessionManager.e2e.test.ts`)
- Deploy via Docker Compose
- Test all HTTP endpoints against live container
- Uses random port to avoid conflicts
- Automatic cleanup (up → test → down)

## Build & Deploy

### Build Process
```bash
# 1. Install esbuild
npm install -D esbuild

# 2. Compile TypeScript
npx esbuild src/sessionManager.ts \
  --bundle --platform=node \
  --target=node20 \
  --outfile=dist/bundle.js

# 3. Build Docker image
docker compose build

# 4. Start containers
docker compose up -d
```

### Docker Compose Services
- **session-manager**: Node.js 20 Alpine, runs dist/bundle.js
- **redis**: Redis 7 Alpine, persistent volume

## Adding New Features

1. Add method to `SessionManager` class in `src/sessionManager.ts`
2. Add Express route in `createApp()`
3. Add unit test in `tests/sessionManager.test.ts`
4. Add E2E test in `tests/sessionManager.e2e.test.ts`
5. Update `openapi.yaml` with new endpoint
6. Update `README.md` and `DEVELOPMENT.md`
