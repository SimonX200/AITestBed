# SessionManager

A robust session management system with persistent storage and a RESTful HTTP API.

## Overview

SessionManager provides a complete solution for creating, managing, and persisting user sessions. It features:

- **In-memory caching** for fast session lookups
- **Persistent storage** via SQLite for session durability across restarts
- **RESTful HTTP API** built with Express.js
- **Docker deployment** with automated build and run scripts
- **Comprehensive test suite** including unit and end-to-end tests

## Features

- Create sessions with customizable expiration times and role assignments
- Retrieve sessions by ID or token
- List all active sessions
- Delete sessions manually
- Automatic expiration cleanup
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
node dist/bundle.js
```

The server starts on port `3000` by default, or use `EXAMPLE_SESSIONMANAGER_PORT` to set a custom port.

### Docker Deployment

```bash
# Build and deploy
bash deploy.sh build

# Deploy with Docker Compose
cd deploy
docker compose up -d
```

### Running Tests

```bash
# Unit tests
npm test

# E2E tests (builds and runs Docker container)
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

## Project Structure

```
Example20/
├── src/
│   └── sessionManager.ts      # Core session management logic
├── tests/
│   ├── sessionManager.test.ts  # Unit tests
│   └── sessionManager.e2e.test.ts  # E2E tests
├── deploy/
│   ├── docker-compose.yaml     # Docker Compose configuration
│   └── Dockerfile              # Docker image definition
├── deploy.sh                   # Build and deployment script
├── openapi.json                # OpenAPI 3.0 specification
├── package.json
├── tsconfig.json
├── README.md
└── DEVELOPMENT.md
```

## License

MIT
