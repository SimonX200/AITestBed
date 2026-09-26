# SessionManager

A robust session management system with **Redis persistent storage** and a RESTful HTTP API.

## Overview

SessionManager provides a complete solution for creating, managing, and persisting user sessions. It features:

- **In-memory caching** for fast session lookups
- **Persistent storage** via Redis with automatic TTL
- **RESTful HTTP API** built with Express.js
- **Docker deployment** with automated build and run scripts
- **Comprehensive test suite** including unit and end-to-end tests

## Features

- Create sessions with customizable expiration times and role assignments
- Retrieve sessions by ID or token
- List all active sessions
- Delete sessions manually
- Automatic expiration cleanup (handled by Redis)
- Health check endpoint

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

This compiles the TypeScript source to `dist/bundle.js` using esbuild.

### Run Locally

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Run SessionManager
node dist/bundle.js
```

The server starts on port `3000` by default, or use `EXAMPLE_SESSIONMANAGER_PORT` to set a custom port.

### Docker Deployment

```bash
# Build and deploy with Redis
bash deploy.sh build

# Deploy with Docker Compose (includes Redis)
cd deploy
docker compose up -d
```

### Running Tests

```bash
# Unit tests (requires Redis on localhost:6380)
npm test

# E2E tests (builds and runs Docker container with Redis)
npm run e2e

# E2E setup only
npm run e2e-setup

# E2E teardown only
npm run e2e-teardown
```

## API Reference

### Health Check

```
GET /api/health
```

Returns the service health status and active session count.

### Create Session

```
POST /api/sessions
Content-Type: application/json

{
  "userId": "user123",
  "roles": ["admin", "user"],
  "expiresInHours": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "token": "random-token",
    "expiresAt": "2024-01-01T00:00:00.000Z",
    "roles": ["admin", "user"]
  }
}
```

### Get Session by ID

```
GET /api/sessions/:id
```

### Get Session by Token

```
GET /api/sessions/token/:token
```

### List All Sessions

```
GET /api/sessions
```

### Delete Session

```
DELETE /api/sessions/:id
```

### Cleanup Expired Sessions

```
POST /api/sessions/cleanup
```

## Configuration

| Environment Variable       | Description                        | Default |
|---------------------------|------------------------------------|---------|
| `EXAMPLE_SESSIONMANAGER_PORT` | Port for the HTTP server       | 3000    |
| `PORT`                     | Fallback port for the HTTP server | 3000    |
| `REDIS_URL`                | Redis connection URL              | redis://localhost:6379/0 |

## Project Structure

```
Example20-1/
├── src/
│   └── sessionManager.ts      # Core session management logic
├── tests/
│   ├── sessionManager.test.ts  # Unit tests
│   └── sessionManager.e2e.test.ts  # E2E tests
├── deploy/
│   ├── docker-compose.yaml     # Docker Compose (includes Redis)
│   └── Dockerfile              # Docker image definition
├── deploy.sh                   # Build and deployment script
├── openapi.json                # OpenAPI 3.0 specification
├── package.json
├── tsconfig.json
├── README.md
├── DEVELOPMENT.md
├── Performance.md
└── Report.md
```

## License

MIT
