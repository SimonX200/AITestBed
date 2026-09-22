# Development Guide — SessionManager

## Class Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UserSession (Interface)                     │
├─────────────────────────────────────────────────────────────────────┤
│ - id: string                                                        │
│ - token: string                                                     │
│ - expiresAt: Date                                                   │
│ - roles: string[]                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │  implements
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                        SessionManager (Class)                       │
├─────────────────────────────────────────────────────────────────────┤
│ - sessions: Map<string, UserSession>                                │
│ - cleanupInterval: NodeJS.Timeout | null                            │
├─────────────────────────────────────────────────────────────────────┤
│ + constructor()                                                     │
│ + createSession(userId, roles, ttlMs): UserSession                  │
│ + getSession(id): UserSession | undefined                           │
│ + isValid(id): boolean                                              │
│ + removeSession(id): boolean                                        │
│ + getAllSessions(): UserSession[]                                   │
│ + getActiveSessions(): UserSession[]                                │
│ + cleanupExpired(): number                                          │
│ + stop(): void                                                      │
│ + clear(): void                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ - generateId(): string                                              │
│ - generateToken(): string                                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │  used by
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                   createSessionHandler (Function)                   │
│                   → http.RequestListener                            │
├─────────────────────────────────────────────────────────────────────┤
│ + (req, res): void                                                  │
│   Routes:                                                           │
│     GET    /health       → Health check                             │
│     POST   /sessions     → Create session                           │
│     GET    /sessions     → List active sessions                     │
│     GET    /sessions/:id → Get session details                      │
│     DELETE /sessions/:id → Delete session                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │  creates
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                      startServer (Function)                         │
│                      → http.Server                                  │
├─────────────────────────────────────────────────────────────────────┤
│ + (sessionManager, port?): http.Server                              │
│   - Liest Port aus EXAMPLE_SESSIONMANAGER_PORT                      │
│   - Startet HTTP-Server                                             │
│   - Registriert SIGINT/SIGM handler                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Projektstruktur

```
Example18/
├── sessionManager.ts          # Hauptquellcode (SessionManager + HTTP API)
├── sessionManager.test.ts     # Unit-Tests (SessionManager Klasse)
├── sessionManager.e2e.test.ts # E2E-Tests (HTTP API gegen Docker)
├── deploy.sh                  # Build & Docker Deployment Skript
├── package.json               # Node.js Projektdefinition
├── tsconfig.json              # TypeScript Konfiguration
├── jest.config.js             # Jest Test Konfiguration
├── Dockerfile                 # Docker Image Definition
├── README.md                  # Benutzerdokumentation
├── DEVELOPMENT.md             # Diese Datei (Entwicklerdokumentation)
├── openapi-spec.json          # OpenAPI 3.0 Spezifikation
└── dist/
    └── bundle.js              # Kompiliertes Bundle (esbuild)
```

## Entwicklungsumgebung aufsetzen

```bash
# Abhängigkeiten installieren
npm install

# Build ausführen
npm run build

# Tests ausführen
npm test              # Unit-Tests
npm run e2e           # E2E-Tests (startet Docker)
```

## Wichtige Entscheidungen

### esbuild statt tsc
- **Begründung**: Deutlich schnellere Kompilierung, ideal für CI/CD-Pipelines
- **Nachteil**: Keine Typprüfung während des Builds (muss separat mit `tsc --noEmit` geprüft werden)

### Node.js native crypto statt uuid-Package
- **Begründung**: Keine externen Abhängigkeiten, native Unterstützung seit Node.js 14.17
- **Funktionen**: `crypto.randomUUID()` für IDs, `crypto.randomBytes()` für Tokens

### setInterval statt cron-Job
- **Begründung**: Einfache Implementierung, keine externen Abhängigkeiten
- **Intervall**: 60 Sekunden (konfigurierbar im Konstruktor)

### In-Memory statt Datenbank
- **Begründung**: Einfachheit, keine externen Abhängigkeiten
- **Einschränkung**: Sessions gehen beim Neustart verloren

## Test-Strategie

### Unit-Tests (sessionManager.test.ts)
- Testen die `SessionManager`-Klasse direkt
- Keine HTTP-Anforderungen
- Testen: Erstellen, Abrufen, Validieren, Löschen, Bereinigen

### E2E-Tests (sessionManager.e2e.test.ts)
- Testen die HTTP-API gegen einen laufenden Docker-Container
- Testen alle Endpunkte: /health, POST/GET/DELETE /sessions
- Verwenden `fetch()` aus Node.js 18+

## OpenAPI Spezifikation

Die OpenAPI 3.0 Spezifikation befindet sich in `openapi-spec.json`.

Zum Anzeigen mit Swagger UI:
```bash
npx swagger-ui-cli openapi-spec.json
```

## Deployment

### Lokal
```bash
npm run build
node dist/bundle.js
```

### Docker
```bash
./deploy.sh
```

### Docker stoppen
```bash
./deploy.sh stop
```
