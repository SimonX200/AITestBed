# Example10 — Projekt-Report

## Übersicht

| Feld          | Wert                          |
|---------------|-------------------------------|
| Projekt       | Example10                     |
| Datum         | 20.09.2026                    |
| Start (Epoch) | 1789901268                    |
| Ende (Epoch)  | 1789901344                    |
| **Gesamtzeit**| **76 Sekunden**               |

---

## Task 1: `sessionManager.ts`

**Beschreibung:** Interface `UserSession` und Klasse `SessionManager` mit Map-basierter Session-Verwaltung, automatischer Cleanup-Scheduled-Interval (60s).

**Erstellte Dateien:**
- `sessionManager.ts` — Interface + Klasse mit Methoden: `addSession`, `hasSession`, `getSession`, `removeSession`, `cleanupExpired`, `getAllSessions`, `getSessionCount`, `startCleanup`, `stopCleanup`

**Bearbeitungsdauer:** ~15 Sekunden

**Ergebnis:** ✅ Erfolgreich erstellt und kompiliert

---

## Task 2: `deploy.sh`

**Beschreibung:** Bash-Skript für Build mit esbuild, Dockerfile-Erstellung, Docker-Image-Build und Container-Start.

**Erstellte Dateien:**
- `deploy.sh` — Automatisches Deployment-Skript
- `Dockerfile` — Wird on-the-fly erstellt (node:20-alpine)

**Bearbeitungsdauer:** ~10 Sekunden

**Ergebnis:** ✅ Erfolgreich erstellt und ausführbar

---

## Task 3: Tests

### Unit Tests

**Beschreibung:** Tests für alle SessionManager-Methoden.

**Erstellte Dateien:**
- `tests/sessionManager.test.ts` — 11 Tests

**Test-Ergebnis:**
```
  SessionManager
    ✔ should add a session and report it as valid
    ✔ should return false for a non-existent session
    ✔ should return the session object via getSession
    ✔ should treat an expired session as invalid
    ✔ should remove expired session on getSession call
    ✔ should remove an existing session
    ✔ should return false when removing a non-existent session
    ✔ should clean up expired sessions and return count
    ✔ should return only valid sessions
    ✔ should return correct count of valid sessions
    ✔ should auto-remove expired sessions via setInterval
  11 passing (207ms)
```

**Bearbeitungsdauer:** ~25 Sekunden

**Ergebnis:** ✅ 11/11 Tests bestanden

### E2E Tests

**Beschreibung:** Tests gegen den laufenden Docker-Container.

**Erstellte Dateien:**
- `e2e/sessionManager.e2e.test.ts` — 4 E2E-Tests
- `e2e-run.sh` — Skript für Container-Hoch- und Runterfahren

**Test-Ergebnis:**
```
  E2E: SessionManager Docker Container
    ✔ should have the container running
    ✔ should respond to basic connectivity check
    ✔ should show session test-1 as valid in container logs
    ✔ should show session count of 1
  4 passing (97ms)
```

**Bearbeitungsdauer:** ~20 Sekunden

**Ergebnis:** ✅ 4/4 E2E-Tests bestanden

---

## Zusammenfassung

| Task               | Dauer      | Status |
|--------------------|------------|--------|
| Task 1: sessionManager.ts | ~15 Sek. | ✅ |
| Task 2: deploy.sh  | ~10 Sek.   | ✅ |
| Task 3: Unit Tests | ~25 Sek.   | ✅ |
| Task 3: E2E Tests  | ~20 Sek.   | ✅ |
| **Gesamt**         | **~70 Sek.** (gemessen: **76 Sek.**) | ✅ |

---

## npm Scripts

| Befehl         | Beschreibung                          |
|----------------|---------------------------------------|
| `npm run build` | Kompiliert sessionManager.ts → dist/bundle.js |
| `npm test`      | Führt Unit-Tests aus (11 Tests)       |
| `npm run e2e`   | Startet Container, führt E2E-Tests aus, stoppt Container |

---

## Container-Status

Der Docker-Container `example10-app` wurde nach den E2E-Tests erfolgreich gestoppt und entfernt.
