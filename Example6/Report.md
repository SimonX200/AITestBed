# Example6 - Session Manager Report

## Übersicht

Dieses Projekt implementiert einen Session-Manager in TypeScript mit Docker-Deployment und umfassenden Tests.

---

## Task 1: sessionManager.ts

**Beschreibung:**  
Erstellung der Datei `sessionManager.ts` mit:
- Interface `UserSession` (id, token, expiresAt, roles)
- Klasse `SessionManager` mit interner Map
- Methoden: `addSession`, `hasSession`, `getSession`, `removeSession`, `cleanupExpired`, `getAllSessions`, `getSessionCount`
- Automatischer Cleanup via `setInterval` (60 Sekunden)

**Bearbeitungsdauer:** ca. 30 Sekunden

---

## Task 2: deploy.sh

**Beschreibung:**  
Erstellung des Bash-Skripts `deploy.sh` mit:
- `npm install` für Abhängigkeiten
- Kompilierung von `sessionManager.ts` zu `dist/bundle.js` via esbuild
- On-the-fly Erstellung eines Dockerfiles (Basis: node:20-alpine)
- Docker-Image Build und Container Start im Hintergrund

**Bearbeitungsdauer:** ca. 25 Sekunden

---

## Task 3: Tests

**Beschreibung:**  
Erstellung von Unit- und E2E-Tests:

### Unit-Tests (sessionManager.test.ts)
- **addSession & hasSession** - Sessions hinzufügen und prüfen
- **getSession** - Session-Daten zurückgeben
- **Expired Sessions** - Abgelaufene Sessions werden nicht zurückgegeben
- **removeSession** - Sessions entfernen
- **cleanupExpired** - Automatische Bereinigung abgelaufener Sessions
- **getAllSessions** - Alle Sessions abrufen
- **startAutoCleanup / stopAutoCleanup** - Auto-Cleanup Test (1.5s Wartezeit)

**Ergebnis:** 18 Tests bestanden ✅

### E2E-Tests (run-e2e.sh)
- Container läuft nach dem Start
- Container-Logs sind zugänglich
- Docker-Image wurde erfolgreich gebaut
- dist/bundle.js existiert und ist gültig
- Node.js Runtime funktioniert im Container
- Container startet nach Neustart sauber

**Ergebnis:** 6 Tests bestanden ✅

**Bearbeitungsdauer:** ca. 90 Sekunden

---

## Task 4: Report.md

**Beschreibung:**  
Generierung dieses Reports mit Bearbeitungsdauern.

**Bearbeitungsdauer:** ca. 5 Sekunden

---

## Zusammenfassung der Bearbeitungsdauern

| Task | Dauer |
|------|-------|
| Task 1: sessionManager.ts | ~30s |
| Task 2: deploy.sh | ~25s |
| Task 3: Tests | ~90s |
| Task 4: Report.md | ~5s |
| **Gesamt** | **~150s (2m 30s)** |

**Tatsächliche Gesamtdauer:** 185 Sekunden (3m 5s)

---

## Erstellte Dateien

| Datei | Beschreibung |
|-------|-------------|
| `sessionManager.ts` | Session Manager Implementierung |
| `sessionManager.test.ts` | Unit-Tests |
| `deploy.sh` | Deployment-Skript |
| `run-e2e.sh` | E2E-Tests |
| `Dockerfile` | Docker-Konfiguration |
| `package.json` | Projekt-Konfiguration |
| `Report.md` | Dieser Report |

---

## npm Scripts

```bash
npm run build    # Kompiliert sessionManager.ts zu dist/bundle.js
npm test         # Führt Unit-Tests aus
npm run e2e      # Führt E2E-Tests aus (baut Docker-Container, testet, stoppt)
```

---

## Status

- [x] Alle Unit-Tests bestanden (18/18)
- [x] Alle E2E-Tests bestanden (6/6)
- [x] Docker-Container wurde erfolgreich gestoppt und entfernt
