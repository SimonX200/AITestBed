# SessionManager

Ein robustes Session-Management-System mit Redis-Persistenz und REST-API.

## Funktionen

- **Session-Erstellung**: Erzeuge neue Benutzersessions mit Rollen-basierten Berechtigungen
- **Session-Abfrage**: Hole Session-Details anhand der Session-ID
- **Session-Validierung**: Prüfe in Echtzeit ob eine Session gültig ist
- **Auto-Cleanup**: Automatische Bereinigung abgelaufener Sessions
- **Persistente Speicherung**: Redis als persistente Datenspeicherung
- **Docker Deployment**: Einfaches Deployment mit Docker Compose

## Schnellstart

### Voraussetzungen

- Node.js >= 20
- Docker & Docker Compose
- npm

### Installation

```bash
npm install
```

### Lokaler Betrieb

```bash
# Kompilieren
npm run build

# Server starten (Port über Umgebungsvariable)
PORT=3000 REDIS_URL=redis://localhost:6379 node dist/bundle.js
```

### Docker Deployment

```bash
# Volles Deployment (kompilieren, bauen, starten)
EXAMPLE_SESSIONMANAGER_PORT=3000 bash deploy.sh start

# Stoppen
bash deploy.sh stop

# Neustart
bash deploy.sh restart
```

## API Dokumentation

### Health Check

```
GET /health
```

**Antwort:**
```json
{ "status": "ok" }
```

### Session erstellen

```
POST /sessions
Content-Type: application/json

{
  "userId": "user123",
  "roles": ["admin", "user"]
}
```

**Antwort (201):**
```json
{
  "id": "uuid-hier",
  "token": "random-token-hier",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "roles": ["admin", "user"]
}
```

### Session abrufen

```
GET /sessions/:id
```

**Antwort (200):**
```json
{
  "id": "uuid-hier",
  "token": "random-token-hier",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "roles": ["admin", "user"]
}
```

**Antwort (404):**
```json
{ "error": "Session not found" }
```

### Session validieren

```
GET /sessions/:id/valid
```

**Antwort:**
```json
{ "valid": true }
```

### Abgelaufene Sessions löschen

```
DELETE /sessions/expired
```

**Antwort:**
```json
{ "cleaned": 5 }
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

Die E2E Tests starten automatisch einen Docker Container mit einem zufälligen freien Port und testen alle API-Endpunkte.

## Umgebungsvariablen

| Variable | Beschreibung | Standard |
|---|---|---|
| `PORT` | Port des HTTP-Servers | `3000` |
| `REDIS_URL` | Redis-Verbindungs-URL | - |
| `EXAMPLE_SESSIONMANAGER_PORT` | Externer Docker-Port | `3000` |

## Projektstruktur

```
Example19/
├── src/
│   └── sessionManager.ts      # Hauptanwendung
├── tests/
│   ├── sessionManager.test.ts      # Unit Tests
│   └── sessionManager.e2e.test.ts  # E2E Tests
├── deploy/
│   └── docker-compose.yaml     # Docker Compose Konfiguration
├── deploy.sh                   # Deployment-Skript
├── package.json
├── tsconfig.json
├── jest.config.js
├── openapi.yaml               # OpenAPI Spezifikation
├── README.md                  # Diese Datei
└── DEVELOPMENT.md             # Entwicklerdokumentation
```