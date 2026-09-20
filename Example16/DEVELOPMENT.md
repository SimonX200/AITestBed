# SessionManager - Entwicklerdokumentation

## Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         UserSession                             │
├─────────────────────────────────────────────────────────────────┤
│ - id: string                                                    │
│ - token: string                                                 │
│ - expiresAt: Date                                               │
│ - roles: string[]                                               │
└─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │  erstellt / verwaltet
                                  │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SessionManager                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - sessions: Map<string, UserSession>                                            │
│ - cleanupInterval: NodeJS.Timeout | null                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + start(): void                                                                 │
│ + stop(): void                                                                  │
│ + createSession(roles: string[], expiresInMs: number): UserSession              │
│ + getSession(id: string): UserSession | null                                    │
│ + getByToken(token: string): UserSession | null                                 │
│ + deleteSession(id: string): boolean                                            │
│ + getAllSessions(): UserSession[]                                               │
│ + cleanupExpired(): void                                                        │
│ + hasRole(session: UserSession, requiredRole: string): boolean                  │
│ - generateId(): string                                                          │
│ - generateToken(): string                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │  verwendet
                                  │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     createSessionServer()                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Parameter:                                                                      │
│   - sessionManager: SessionManager                                              │
│   - port: number                                                                │
│ Returns: Server (http)                                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│ HTTP Endpoints:                                                                 │
│   POST   /api/sessions              → createSession()                           │
│   GET    /api/sessions              → getAllSessions()                          │
│   GET    /api/sessions/:id          → getSession()                              │
│   DELETE /api/sessions/:id          → deleteSession()                           │
│   GET    /api/sessions/validate/:token → getByToken()                           │
│   GET    /api/health                → health check                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Architektur

### Komponenten

1. **SessionManager** (Kernlogik)
   - Verwaltet Sessions in einer `Map<string, UserSession>`
   - Automatische Bereinigung via `setInterval` (60s)
   - Thread-safe durch Single-Thread-Node.js

2. **HTTP Server** (Express.js)
   - RESTful API über Express.js
   - JSON-basierte Request/Response-Formatierung
   - Graceful Shutdown via SIGINT/SIGTERM

3. **Deployment** (Docker)
   - esbuild für TypeScript-Bundling
   - Node 20 Alpine Docker-Image
   - Konfigurierbarer Port über Umgebungsvariable

### Datenfluss

```
Client → HTTP Request → Express Router → SessionManager → Map<id, UserSession>
```

### Session-Lebenszyklus

```
[Erstellt] → [Aktiv] → (abgelaufen) → [Bereinigt]
     ↑                       ↑
  createSession        cleanupExpired (60s Intervall)
```

## Test-Strategie

### Unit Tests (sessionManager.test.ts)
- Testen der SessionManager-Klasse isoliert
- Abdeckung aller Methoden: createSession, getSession, getByToken, deleteSession, getAllSessions, cleanupExpired, hasRole
- Test des automatischen Bereinigungs-Intervalls

### E2E Tests (sessionManager.e2e.test.ts)
- Starten eines Docker-Containers mit dem SessionManager
- Testen aller HTTP-Endpunkte über echte HTTP-Requests
- Verifizierung von Statuscodes und Response-Formaten

## Build-Prozess

```
TypeScript (src/) → esbuild → CommonJS Bundle (dist/bundle.js) → Docker Image
```

## Skripte

| Befehl | Beschreibung |
|--------|-------------|
| `npm run build` | Kompiliert TypeScript mit esbuild |
| `npm run test:unit` | Führt Unit-Tests aus |
| `npm run e2e` | Führt E2E-Tests mit Docker-Container aus |
| `npm run deploy` | Bauen und starten des Docker-Containers |
| `npm run deploy:stop` | Stoppt den Docker-Container |
