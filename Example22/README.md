# Session Manager

A robust session management system with Redis persistence and HTTP API.

## Features

- **User Session Management**: Create, read, update, and delete user sessions
- **Redis Persistence**: Sessions are stored in Redis for durability and scalability
- **Automatic Expiration**: Expired sessions are automatically cleaned up
- **HTTP API**: RESTful API for all session operations
- **Docker Support**: Easy deployment with Docker Compose

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Running with Docker (Recommended)

```bash
# Start all services (Session Manager + Redis)
./deploy.sh

# Or using Docker Compose directly
cd deploy
export EXAMPLE_SESSIONMANAGER_PORT=3000
docker compose up -d
```

### Running Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start Redis (via Docker)
docker compose -f deploy/docker-compose.yaml up -d redis

# Run the server
REDIS_URL=redis://localhost:6379 PORT=3000 node dist/bundle.js
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns the health status of the service.

**Response:**
```json
{
  "status": "ok",
  "redisConnected": true,
  "sessionCount": 0,
  "timestamp": "2026-09-26T14:58:26.513Z"
}
```

### Create Session
```
POST /api/sessions
Content-Type: application/json

{
  "token": "user-auth-token",
  "roles": ["user", "admin"],
  "expiresIn": 3600,
  "id": "custom-session-id"  // optional
}
```

**Response (201):**
```json
{
  "id": "sess_123_abc",
  "token": "user-auth-token",
  "expiresAt": "2026-09-26T15:58:26.513Z",
  "roles": ["user", "admin"]
}
```

### Get Session by ID
```
GET /api/sessions/:id
```

**Response (200):**
```json
{
  "id": "sess_123_abc",
  "token": "user-auth-token",
  "expiresAt": "2026-09-26T15:58:26.513Z",
  "roles": ["user", "admin"]
}
```

### Get Session by Token
```
GET /api/sessions/token/:token
```

### List All Sessions
```
GET /api/sessions
```

**Response:**
```json
{
  "sessions": [...],
  "count": 5
}
```

### Delete Session
```
DELETE /api/sessions/:id
```

### Cleanup Expired Sessions
```
POST /api/sessions/cleanup
```

**Response:**
```json
{
  "message": "Cleanup completed",
  "removed": 3
}
```

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests (requires running server)
npm run e2e
```

## Configuration

| Environment Variable     | Description                    | Default          |
|--------------------------|--------------------------------|------------------|
| `PORT`                   | HTTP server port               | `3000`           |
| `REDIS_URL`              | Redis connection URL           | `redis://localhost:6379` |
| `EXAMPLE_SESSIONMANAGER_PORT` | Docker port for E2E tests | `3000`           |
