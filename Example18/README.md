# SessionManager

Ein speicherbasiertes Session-Management-System mit REST-HTTP-API und Docker-Unterstützung.

## Übersicht

SessionManager bietet eine einfache, aber vollständige Lösung zur Verwaltung von Benutzersitzungen:

- **In-Memory-Speicher**: Alle Sessions werden im Arbeitsspeicher gehalten (kein externes Datenbanksystem nötig)
- **Automatische Bereinigung**: Abgelaufene Sessions werden alle 60 Sekunden automatisch entfernt
- **RESTful HTTP-API**: Vollständiger CRUD-Zugriff über HTTP-Endpunkte
- **Docker-fähig**: Einfaches Deployment als Container

## Schnellstart

### Voraussetzungen

- Node.js >= 20
- Docker (für Container-Deployment)

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

Kompiliert `sessionManager.ts` zu `dist/bundle.js` mit esbuild.

### Lokaler Betrieb

```bash
npm run build
node dist/bundle.js
```

Der Server startet standardmäßig auf Port **3500**.

Port anpassen über Umgebungsvariable:

```bash
EXAMPLE_SESSIONMANAGER_PORT=8080 node dist/bundle.js
```

### Docker Deployment

```bash
./deploy.sh
```

Dies führt automatisch aus:
1. Installation der Build-Abhängigkeiten
2. Kompilieren mit esbuild
3. Erstellen des Dockerfiles
4. Bauen des Docker-Images
5. Starten des Containers

Der Container wird auf einem zufälligen freien Port gestartet (oder über `EXAMPLE_SessionManager_Port` festgelegt).

### Tests

**Unit-Tests:**
```bash
npm test
```

**E2E-Tests (gegen laufenden Container):**
```bash
npm run e2e
```

## HTTP API Reference

### Health Check

```
GET /health
```

Antwort:
```json
{
  "status": "ok",
  "timestamp": "2026-09-21T23:00:00.000Z",
  "activeSessions": 5
}
```

### Session erstellen

```
POST /sessions
Content-Type: application/json

{
  "userId": "user123",
  "roles": ["admin", "user"],
  "ttlMs": 3600000
}
```

Antwort (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "token": "abc123...",
  "expiresAt": "2026-09-22T00:00:00.000Z",
  "roles": ["admin", "user"]
}
```

### Sessions auflisten

```
GET /sessions
```

Antwort (200 OK):
```json
[
  {
    "id": "...",
    "token": "...",
    "expiresAt": "...",
    "roles": ["user"]
  }
]
```

### Session abrufen

```
GET /sessions/:id
```

Antwort (200 OK) oder (404 Not Found)

### Session löschen

```
DELETE /sessions/:id
```

Antwort (200 OK) oder (404 Not Found)

## Umgebungsvariablen

| Variable | Beschreibung | Standard |
|---|---|---|
| `EXAMPLE_SESSIONMANAGER_PORT` | Port des HTTP-Servers | `3500` |
| `EXAMPLE_SessionManager_Port` | Port für Docker-Container (E2E-Tests) | Zufällig frei |

## Architektur

```
┌─────────────────────────────────────────────┐
│              HTTP Server                    │
│  (createSessionHandler - Request Router)    │
├─────────────────────────────────────────────┤
│           SessionManager                    │
│  ┌───────────────────────────────────────┐  │
│  │  Map<string, UserSession>             │  │
│  │  - createSession()                    │  │
│  │  - getSession()                       │  │
│  │  - isValid()                          │  │
│  │  - removeSession()                    │  │
│  │  - cleanupExpired() [60s interval]    │  │
│  │  - getAllSessions()                   │  │
│  │  - getActiveSessions()                │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│         UserSession (Interface)             │
│  - id: string                               │
│  - token: string                            │
│  - expiresAt: Date                          │
│  - roles: string[]                          │
└─────────────────────────────────────────────┘
```

## Lizenz

MIT
