# SessionManager

A production-ready user session management system built with Node.js, Express, and Redis.

## Features

- **Session Lifecycle Management**: Create, retrieve, validate, and delete user sessions
- **Persistent Storage**: Redis-backed storage ensures sessions survive application restarts
- **Automatic Expiry**: Sessions automatically expire after a configurable duration
- **Role-Based Access**: Assign multiple roles to each session
- **RESTful API**: Clean HTTP API with OpenAPI 3.0 specification
- **Docker Support**: Full containerization with Docker Compose
- **Comprehensive Testing**: Unit tests and E2E tests against live Docker containers

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm

### Installation

```bash
npm install
```

### Running with Docker (Recommended)

```bash
# Build and start all services
./deploy.sh up

# Run E2E tests
./deploy.sh e2e

# Stop all services
./deploy.sh down
```

### Running Locally

```bash
# Ensure Redis is running on localhost:6379
npm run build
node dist/bundle.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/sessions` | Create a new session |
| GET | `/api/sessions/:id` | Get session by ID |
| POST | `/api/sessions/:id/validate` | Validate session |
| DELETE | `/api/sessions/:id` | Delete session |
| POST | `/api/sessions/cleanup` | Cleanup expired sessions |
| GET | `/api/sessions` | Get all active sessions |

### Example: Create a Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "roles": ["admin", "editor"],
    "durationMinutes": 60
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "token": "a1b2c3d4e5f6...",
    "expiresAt": "2026-09-26T13:00:00.000Z",
    "roles": ["admin", "editor"]
  }
}
```

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `EXAMPLE_SESSIONMANAGER_PORT` | HTTP server port | `3000` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

## Project Structure

```
Example21/
├── src/
│   └── sessionManager.ts    # Main application code
├── tests/
│   ├── sessionManager.test.ts      # Unit tests
│   └── sessionManager.e2e.test.ts  # E2E tests
├── deploy/
│   ├── docker-compose.yaml  # Docker Compose configuration
│   └── Dockerfile           # Docker image definition
├── deploy.sh                # Build and deployment script
├── openapi.yaml             # OpenAPI 3.0 specification
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
├── DEVELOPMENT.md
└── REPORT.md
```

## Testing

```bash
# Run all unit tests
npm test

# Run E2E tests (builds Docker, starts containers, tests, stops)
npm run e2e
```

## OpenAPI Specification

Full API documentation is available in `openapi.yaml`. Import it into any OpenAPI-compatible tool (Swagger UI, Postman, etc.) for interactive API exploration.
