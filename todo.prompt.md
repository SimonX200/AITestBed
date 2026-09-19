Führe diese Aufgabe strikt isoliert aus. Ignoriere das restliche Repository und lies keine anderen Dateien ein. Schreibe den Code direkt und ohne einleitende Erklärungen oder langes Nachdenken (kein DeepSeek-Reasoning simulieren).

1. Erstelle die Datei `sessionManager.ts`:
   - Interface `UserSession` (id: string, token: string, expiresAt: Date, roles: string[])
   - Klasse `SessionManager` mit einer internen Map. Methode zum Hinzufügen, Prüfen und ein automatisches `setInterval` (alle 60 Sekunden), das abgelaufene Sessions löscht.

2. Erstelle direkt danach das Bash-Skript `deploy.sh`:
   - Es soll `npm install -D esbuild` ausführen (falls nicht vorhanden).
   - Die `sessionManager.ts` per esbuild zu `dist/bundle.js` kompilieren.
   - Ein minimales `Dockerfile` on-the-fly erstellen (Basis node:20-alpine), das `dist/bundle.js` per CMD startet.
   - Den Docker-Container bauen und im Hintergrund ausführen.

Nutze für beide Dateien jeweils einen eigenen, sauberen `write_to_file` Tool-Aufruf.
