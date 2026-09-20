# Session Manager

Ein leichtgewichtiges Session-Management-System mit REST-API, geschrieben in TypeScript.

## Übersicht

Der Session Manager verwaltet Benutzersessions mit automatischer Ablaufprüfung und bietet eine REST-API für die vollständige Session-Verwaltung. Er kann als eigenständiger Node.js-Prozess oder in einem Docker-Container betrieben werden.

## Features

- **Session-Erstellung**: Erstellen neuer Sessions mit Token, Rollen und konfigurierbarer Lebensdauer
- **Session-Prüfung**: Validierung von Sessions auf Gültigkeit
- **Automatische Bereinigung**: Entfernt abgelaufene Sessions alle 60 Sekunden im Hintergrund
- **REST-API**: Vollständige CRUD-Operationen über HTTP
- **Docker-Support**: Einfaches Deployment in isolierten Containern
- **Graceful Shutdown**: Sauberer Shutdown bei Signalen

## Installation

```bash
npm install
```

## Nutzung

### Direkt ausführen

```bash
npm run build
npm start
```

Oder mit custom Port:

```bash
SESSION_MANAGER_PORT=8080 npm run build && SESSION_MANAGER_PORT=8080 npm start
```

### Mit Docker

```bash
./deploy.sh deploy
```

Oder mit custom Port:

```bash
Example_SessionManager_Port=8080 ./deploy.sh deploy
```

### Container verwalten

```bash
./deploy.sh stop      # Container stoppen und entfernen
./deploy.sh restart   # Container neu starten
./deploy.sh logs      # Container-Logs anzeigen
```

## API-Endpunkte

### POST /sessions
Erstellt eine neue Session.

**Request Body:**
```json
{
  "token": "mein-auth-token",
  "roles": ["admin", "user"],
  "ttl": 3600
}
```

**Response (201):**
```json
{
  "id": "abc123...",
  "token": "mein-auth-token",
  "roles": ["admin", "user"],
  "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

### GET /sessions/:id
Ruft eine einzelne Session ab.

**Response (200):**
```json
{
  "id": "abc123...",
  "token": "mein-auth-token",
  "roles": ["admin"],
  "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

**Response (404):** Session nicht gefunden oder abgelaufen.

### DELETE /sessions/:id
Löscht eine Session.

**Response (200):**
```json
{
  "success": true,
  "message": "Session removed"
}
```

### GET /sessions
Gibt alle aktiven Sessions zurück.

**Response (200):**
```json
[
  {
    "id": "abc123...",
    "token": "mein-auth-token",
    "roles": ["admin"],
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### POST /sessions/cleanup
Löst manuell die Bereinigung abgelaufener Sessions aus.

**Response (200):**
```json
{
  "removed": 5
}
```

### GET /health
Health-Check-Endpunkt.

**Response (200):**
```json
{
  "status": "ok",
  "activeSessions": 3
}
```

## Tests

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run e2e
```

## Umgebungsvariablen

| Variable | Beschreibung | Standard |
|---|---|---|
| `SESSION_MANAGER_PORT` | Port des HTTP-Servers | `3000` |
| `Example_SessionManager_Port` | Port für Docker-Deployment | `3000` |

## Struktur

```
Example17/
├── sessionManager.ts      # Hauptmodul mit SessionManager Klasse
├── sessionManager.test.ts # Unit Tests
├── sessionManager.e2e.test.ts # E2E Tests
├── deploy.sh              # Deployment-Skript
├── run-e2e.sh             # E2E Test Runner
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
├── DEVELOPMENT.md
└── REPORT.md
```
