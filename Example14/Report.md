# Report – Example14: SessionManager

## Aufgaben & Bearbeitungsdauer

| # | Task | Beschreibung | Dauer |
|---|------|--------------|-------|
| 1 | `sessionManager.ts` | Interface `UserSession`, Klasse `SessionManager` (interne Map, add/check/delete/list, automatisches `setInterval` alle 60 s), HTTP-Server (health, sessions CRUD) | **10 s** |
| 2 | `deploy.sh` | `npm install -D esbuild` (falls nicht vorhanden), Kompilierung nach `dist/bundle.js`, Dockerfile (node:20-alpine) on-the-fly, Image bauen + Container im Hintergrund starten | **12 s** |
| 3 | Tests | `sessionManager.test.ts` (11 Unit-Tests), `sessionManager.e2e.test.ts` (12 E2E-Tests gegen den laufenden Docker-Container), `package.json` mit `npm run build` / `npm test` / `npm run e2e` | **58 s** |

### Gesamtdauer aller Tasks: **80 s** (≈ 1 min 20 s)

## Erstellte Dateien

- `sessionManager.ts` – SessionManager + HTTP-Server (Entry Point für den Container)
- `deploy.sh` – Build- & Deploy-Skript (esbuild → Dockerfile → Docker-Container)
- `sessionManager.test.ts` – Unit-Tests (node:test + tsx)
- `sessionManager.e2e.test.ts` – E2E-Tests gegen den laufenden Container
- `package.json` – npm-Skripte
- `Dockerfile` – wird von `deploy.sh` on-the-fly erzeugt
- `dist/bundle.js` – esbuild-Bundle
- `Report.md` – dieser Report

## Reproduzierbare npm-Kommandos

| Kommando | Wirkung |
|----------|---------|
| `npm run build` | `sessionManager.ts` → `dist/bundle.js` (esbuild) |
| `npm test` | 11 Unit-Tests ausführen |
| `npm run e2e` | Container hochfahren (`deploy.sh`), 12 E2E-Tests gegen den Container, Container danach wieder stoppen/entfernen |

## Testergebnisse

- **Unit-Tests:** 11/11 bestanden (addSession, checkSession, deleteSession, listSessions, cleanup, automatisches Cleanup-Interval)
- **E2E-Tests:** 12/12 bestanden gegen den laufenden Docker-Container (`sessionmanager-example14`, Port 3000)
  - `GET /health` → 200
  - `POST /sessions` → 201 (inkl. 400-Fälle: fehlendes Token, ungültiges JSON)
  - `GET /sessions/:id` → 200 / 404 (unbekannt, abgelaufen)
  - `GET /sessions` → Liste
  - `DELETE /sessions/:id` → 200 / 404
  - unbekannte Route → 404

## Abschluss

- Alle Tasks ausgeführt, keiner übersprungen.
- `npm run build`, `npm test`, `npm run e2e` reproduzierbar.
- Docker-Container `sessionmanager-example14` wurde nach den E2E-Tests gestoppt und entfernt – **läuft nicht mehr** (verifiziert via `docker ps`).
