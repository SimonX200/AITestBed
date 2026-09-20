# Development Guide - Session Manager

## Architektur

### Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SessionManager                           │
├─────────────────────────────────────────────────────────────────┤
│ - sessions: Map<string, UserSession>                            │
│ - cleanupInterval: NodeJS.Timeout | null                        │
├─────────────────────────────────────────────────────────────────┤
│ + addSession(token, roles, ttl): UserSession                    │
│ + getSession(id): UserSession | null                            │
│ + isValid(id): boolean                                          │
│ + removeSession(id): boolean                                    │
│ + getAllSessions(): UserSession[]                               │
│ + startCleanup(): void                                          │
│ + stopCleanup(): void                                           │
│ + cleanupExpired(): number                                      │
│ + startServer(port): http.Server                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        UserSession                              │
├─────────────────────────────────────────────────────────────────┤
│ + id: string         // Eindeutige Session-ID                   │
│ + token: string      // Authentifizierungstoken                 │
│ + expiresAt: Date    // Zeitpunkt des Session-Ablaufs           │
│ + roles: string[]    // Rollen/Rechte der Session               │
└─────────────────────────────────────────────────────────────────┘
```

### Sequence Diagram - Session Lifecycle

```
Client          SessionManager          HTTP-Server
  │                    │                      │
  │──POST /sessions──>│                      │
  │                    │──addSession()──>│    │
  │                    │   [Map.set()]     │    │
  │<──201 {session}──│                      │
  │                    │                      │
  │──GET /sessions/:id>│                      │
  │                    │──getSession()──>│    │
  │                    │   [Map.get()]       │    │
  │<──200 {session}──│                      │
  │                    │                      │
  │──DELETE /sess/:id>│                      │
  │                    │──removeSession()─>│  │
  │                    │   [Map.delete()]    │  │
  │<──200 {success}──│                      │
  │                    │                      │
  │  <60s interval>    │──cleanupExpired()─>│  │
  │                    │   [Map.delete()]    │  │
```

## Entwicklungsumgebung aufsetzen

### Voraussetzungen

- Node.js >= 18
- Docker >= 20.10
- npm >= 9

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

Kompiliert `sessionManager.ts` zu `dist/bundle.js` mit esbuild.

### Tests ausführen

```bash
# Unit Tests
npm test

# E2E Tests (startet Docker Container automatisch)
npm run e2e
```

## Code-Struktur

### sessionManager.ts

Das Hauptmodul enthält:

1. **UserSession Interface**: Definiert die Session-Datenstruktur
2. **SessionManager Klasse**: Core-Logik für Session-Verwaltung
3. **HTTP-Server**: REST-API Implementierung
4. **CLI Entry Point**: Direkter Start als Node.js-Anwendung

### Test-Strategie

- **sessionManager.test.ts**: Unit Tests für alle Methoden
  - Session CRUD-Operationen
  - Ablaufprüfung
  - HTTP-Endpunkte (in-process)
  - Cleanup-Intervall

- **sessionManager.e2e.test.ts**: E2E Tests gegen Docker Container
  - Alle HTTP-Endpunkte über Netzwerk
  - Container-Lebenszyklus-Management

## Deployment

### Docker

Das `deploy.sh` Skript automatisiert den gesamten Deployment-Prozess:

1. Installiert Abhängigkeiten (esbuild)
2. Kompiliert TypeScript mit esbuild
3. Erstellt Dockerfile on-the-fly
4. Baut Docker Image
5. Startet Container mit zufälligem Port

### Custom Port

```bash
Example_SessionManager_Port=8080 ./deploy.sh deploy
```

## Wichtige Entscheidungen

### Session-IDs

- 32-stellige alphanumerische Strings
- Generiert mit `crypto.getRandomValues()` (kryptographisch sicher)

### TTL (Time-To-Live)

- Standard: 3600 Sekunden (1 Stunde)
- Kann pro Session überschrieben werden
- Negative Werte = sofort abgelaufen

### Cleanup-Intervall

- Alle 60 Sekunden
- Nicht-blockierend (unref)
- Manuell auslösbar über API

### HTTP-Server

- Native Node.js `http` Module (keine externen Abhängigkeiten)
- JSON-Body-Parsing
- Graceful Shutdown bei SIGINT
