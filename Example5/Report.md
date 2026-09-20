# Example5 — Session Manager Report

## Task-Bearbeitungsdauer

| Task | Beschreibung | Dauer |
|------|-------------|-------|
| 1 | `sessionManager.ts` erstellen (Interface, Klasse, HTTP-Server) | ~3 min |
| 2 | `deploy.sh` erstellen (esbuild, Dockerfile, Docker-Container) | ~2 min |
| 3 | Tests erstellen (Unit + E2E) | ~5 min |
| 4 | `Report.md` generieren | ~1 min |
| **Gesamt** | **Alle Tasks zusammen** | **~11 min** |

## Zusammenfassung

### Task 1 — sessionManager.ts
- Interface `UserSession` mit Feldern: `id`, `token`, `expiresAt`, `roles`
- Klasse `SessionManager` mit:
  - Interner `Map<string, UserSession>` als Speicher
  - `addSession()` — Session hinzufügen
  - `getSession()` — Session abrufen (prüft auf Ablauf)
  - `removeSession()` — Session entfernen
  - `getAllSessions()` — Alle aktiven Sessions
  - `getSessionCount()` — Gesamtanzahl (inkl. abgelaufener)
  - `cleanupExpired()` — Manuell abgelaufene Sessions löschen
  - `clearAll()` — Alle Sessions löschen
  - `startAutoCleanup()` / `stopAutoCleanup()` — Intervall (60s) für automatische Bereinigung
  - `startServer()` — HTTP-Server mit REST-Endpunkten (GET /health, GET /sessions, GET /sessions/:id, POST /sessions)
  - Auto-Start wenn direkt mit `node` ausgeführt

### Task 2 — deploy.sh
- Installiert `esbuild` falls nicht vorhanden
- Kompiliert `sessionManager.ts` → `dist/bundle.js`
- Erstellt `Dockerfile` on-the-fly (node:20-alpine)
- Baut Docker-Image `session-manager-app`
- Startet Container `session-manager-container` im Hintergrund

### Task 3 — Tests
- **Unit Tests** (11 Tests): Alle SessionManager-Methoden getestet
- **E2E Tests** (5 Tests): Gegen laufenden Docker-Container getestet
- **Alle 16 Tests bestanden** ✅

### npm-Skripte
| Befehl | Beschreibung |
|--------|-------------|
| `npm run build` | Kompiliert mit esbuild, baut Docker-Image, startet Container |
| `npm test` | Führt Unit + E2E Tests aus (E2E gegen laufenden Container) |
| `npm run e2e` | Baut, startet Container, führt E2E Tests aus, fährt Container herunter |

## Dateien im Verzeichnis Example5

```
Example5/
├── sessionManager.ts    # TypeScript-Quelldatei
├── deploy.sh            # Deployment-Skript
├── e2e-run.sh           # E2E-Test Runner
├── package.json         # npm-Konfiguration
├── tests/
│   ├── sessionManager.test.js    # Unit Tests
│   └── sessionManager.e2e.test.js # E2E Tests
├── dist/
│   ├── bundle.js          # Kompilierte App (esbuild)
│   └── sessionManager.cjs # Kompiliert für Tests (CJS)
└── Dockerfile             # Wird von deploy.sh erstellt
```

## Status
- Docker-Container: **gestoppt und entfernt** ✅