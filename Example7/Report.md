# Report: Example7 - Session Manager

## Übersicht

Dieser Report dokumentiert die Bearbeitung der Aufgaben für das Session Manager Projekt in `Example7`.

---

## Task 1: sessionManager.ts

**Beschreibung:** Erstellung der `sessionManager.ts` mit Interface `UserSession` und Klasse `SessionManager`.

**Inhalt:**
- Interface `UserSession` mit Feldern: `id`, `token`, `expiresAt`, `roles`
- Klasse `SessionManager` mit:
  - Interner `Map<string, UserSession>` zur Speicherung der Sessions
  - `addSession()` - Erstellt eine neue Session
  - `hasSession()` - Prüft ob eine Session existiert und aktiv ist
  - `getSession()` - Gibt eine Session zurück oder undefined (löscht automatisch abgelaufene)
  - `removeSession()` - Löscht eine Session manuell
  - `getAllSessions()` - Gibt alle aktiven Sessions zurück
  - `startAutoCleanup()` - Startet automatisches Bereinigen abgelaufener Sessions (standardmäßig alle 60 Sekunden)
  - `stopAutoCleanup()` - Stoppt die automatische Bereinigung
  - `cleanupExpired()` - Private Methode zur manuellen Bereinigung abgelaufener Sessions
- Integrierter HTTP-Server (Port 3000) mit REST-API für E2E-Tests

**Bearbeitungsdauer:** ~5 Minuten

---

## Task 2: deploy.sh

**Beschreibung:** Bash-Skript für Build, Docker-Image Erstellung und Container Start.

**Inhalt:**
1. Installiert `esbuild` als Dev-Dependency (falls nicht vorhanden)
2. Kompiliert `sessionManager.ts` mit esbuild zu `dist/bundle.js`
3. Erstellt ein minimales Dockerfile (Basis: `node:20-alpine`)
4. Stoppt und entfernt alte Container
5. Baut das Docker-Image
6. Startet den Container im Hintergrund auf Port 3000

**Bearbeitungsdauer:** ~3 Minuten

---

## Task 3: Tests

### Unit Tests (tests/sessionManager.test.ts)

**Beschreibung:** Unit Tests für alle SessionManager-Methoden.

**Testabdeckung:**
- `addSession` - 2 Tests
- `hasSession` - 3 Tests (inkl. Ablauf-Test)
- `getSession` - 3 Tests (inkl. Ablauf-Test)
- `removeSession` - 2 Tests
- `getAllSessions` - 2 Tests (inkl. Ablauf-Test)
- `startAutoCleanup / stopAutoCleanup` - 2 Tests
- `cleanupExpired` - 1 Test

**Ergebnis:** 15 von 15 Tests bestanden ✅

**Bearbeitungsdauer:** ~8 Minuten

### E2E Tests (tests/e2e/sessionManager.e2e.test.ts)

**Beschreibung:** End-to-End Tests gegen den laufenden Docker-Container.

**Testabdeckung:**
- Health Check (GET /health)
- Session erstellen (POST /session)
- Session abrufen (GET /session)
- Sessions auflisten (GET /sessions)
- Session löschen (DELETE /session)
- Cleanup (POST /cleanup)
- Session-Ablauf über API

**Ergebnis:** 11 von 11 Tests bestanden ✅

**Bearbeitungsdauer:** ~10 Minuten

---

## Zusammenfassung der Bearbeitungsdauer

| Task | Dauer |
|------|-------|
| Task 1: sessionManager.ts | ~5 Minuten |
| Task 2: deploy.sh | ~3 Minuten |
| Task 3: Unit Tests | ~8 Minuten |
| Task 3: E2E Tests | ~10 Minuten |
| **Gesamt** | **~26 Minuten** |

---

## Verwendete Technologien

- **TypeScript** - Hauptsprache
- **esbuild** - JavaScript/TypeScript Bundler
- **Docker** - Containerisierung
- **Node.js 20** - Laufzeitumgebung
- **Mocha + Chai** - Testframework
- **ts-mocha** - TypeScript-Unterstützung für Mocha

---

## npm Scripts

| Befehl | Beschreibung |
|--------|-------------|
| `npm run build` | Kompiliert sessionManager.ts mit esbuild |
| `npm test` | Führt Unit Tests aus |
| `npm run e2e` | Startet Docker-Container, führt E2E Tests aus, stoppt Container |

---

## Erstellte Dateien

```
Example7/
├── sessionManager.ts      # Hauptmodul mit SessionManager und HTTP-Server
├── deploy.sh              # Deployment-Skript
├── e2e-run.sh             # E2E Test Runner
├── Dockerfile             # Docker-Konfiguration
├── package.json           # Projekt-Konfiguration
├── tsconfig.json          # TypeScript-Konfiguration
├── Report.md              # Dieser Report
├── dist/
│   └── bundle.js          # Kompiliertes Bundle
└── tests/
    ├── sessionManager.test.ts    # Unit Tests
    └── e2e/
        └── sessionManager.e2e.test.ts  # E2E Tests
```
