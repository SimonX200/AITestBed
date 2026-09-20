# SessionManager

Ein REST-basierter Session-Manager mit automatischer Bereinigung abgelaufener Sessions.

## Übersicht

Der SessionManager verwaltet Benutzer-Sessions über eine HTTP-REST-API. Jede Session enthält einen eindeutigen Token, Ablaufzeit und Rollen für die Zugriffskontrolle. Abgelaufene Sessions werden automatisch alle 60 Sekunden bereinigt.

## Features

- **Session-Erstellung**: Erstellen neuer Sessions mit individuellen Rollen und Ablaufzeiten
- **Session-Abfrage**: Abrufen von Sessions per ID oder Token
- **Session-Löschung**: Manuelles Löschen von Sessions
- **Token-Validierung**: Validierung von Session-Tokens
- **Automatische Bereinigung**: Regelmäßige Entfernung abgelaufener Sessions
- **Docker-Support**: Einfaches Deployment via Docker

## Installation

### Voraussetzungen

- Node.js 20+
- Docker (für E2E-Tests und Deployment)

### Setup

```bash
npm install
```

## Nutzung

### Lokaler Betrieb

```bash
npm run build
node dist/bundle.js
```

Der Server startet standardmäßig auf Port 3000. Der Port kann über die Umgebungsvariable `EXAMPLE_SESSIONMANAGER_PORT` konfiguriert werden:

```bash
EXAMPLE_SESSIONMANAGER_PORT=8080 node dist/bundle.js
```

### Docker Deployment

```bash
npm run deploy
```

Oder direkt:

```bash
./deploy.sh deploy
```

Der Container startet auf dem in `EXAMPLE_SESSIONMANAGER_PORT` angegebenen Port (Standard: 3000).

### Container stoppen

```bash
npm run deploy:stop
```

## API-Endpunkte

### Health-Check

```
GET /api/health
```

Antwort:
```json
{
  "status": "ok",
  "activeSessions": 0
}
```

### Session erstellen

```
POST /api/sessions
Content-Type: application/json

{
  "roles": ["admin", "user"],
  "expiresIn": 3600000
}
```

Antwort (201 Created):
```json
{
  "id": "sess_1234567890_abc1234",
  "token": "tok_abc123def456_1234567890",
  "expiresAt": "2024-01-15T12:00:00.000Z",
  "roles": ["admin", "user"]
}
```

### Alle Sessions auflisten

```
GET /api/sessions
```

Antwort (200 OK):
```json
[
  {
    "id": "sess_1234567890_abc1234",
    "token": "tok_abc123def456_1234567890",
    "expiresAt": "2024-01-15T12:00:00.000Z",
    "roles": ["admin", "user"]
  }
]
```

### Session nach ID abrufen

```
GET /api/sessions/:id
```

Antwort (200 OK):
```json
{
  "id": "sess_1234567890_abc1234",
  "token": "tok_abc123def456_1234567890",
  "expiresAt": "2024-01-15T12:00:00.000Z",
  "roles": ["admin", "user"]
}
```

Antwort (404 Not Found):
```json
{
  "error": "Session not found or expired"
}
```

### Session löschen

```
DELETE /api/sessions/:id
```

Antwort (200 OK):
```json
{
  "message": "Session deleted"
}
```

### Token validieren

```
GET /api/sessions/validate/:token
```

Antwort (200 OK):
```json
{
  "id": "sess_1234567890_abc1234",
  "token": "tok_abc123def456_1234567890",
  "expiresAt": "2024-01-15T12:00:00.000Z",
  "roles": ["admin", "user"]
}
```

## Tests

### Unit Tests

```bash
npm run test:unit
```

### E2E Tests

Die E2E Tests starten einen Docker-Container und testen alle HTTP-Endpunkte:

```bash
npm run e2e
```

### Alle Tests

```bash
npm run test
```

## Konfiguration

| Umgebungsvariable | Standard | Beschreibung |
|-------------------|----------|--------------|
| `EXAMPLE_SESSIONMANAGER_PORT` | `3000` | Port des HTTP-Servers |

## Struktur

```
Example16/
├── src/
│   ├── sessionManager.ts        # Hauptcode: SessionManager + HTTP-Server
│   ├── sessionManager.test.ts   # Unit-Tests
│   └── sessionManager.e2e.test.ts # E2E-Tests gegen Docker-Container
├── scripts/
│   └── e2e_runner.sh            # E2E-Test Runner
├── deploy.sh                    # Deployment-Skript
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
├── DEVELOPMENT.md
└── REPORT.md
```
