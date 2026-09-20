Führe diese Aufgabe strikt isoliert aus. Ignoriere das restliche Repository und lies keine anderen Dateien ein. Schreibe den Code direkt und ohne einleitende Erklärungen.

Alle Ergebnisse kommen in das Verzeichnis Example17


0. Ganz wichtig: 
   - Keinen Task überspringen. 
   - Überspringen ist ein fataler Fehler.
   - alle node kommandos müssen reproduzierbar über npm run gestartet werden.
     - npm run build
     - npm test
     - npm run e2e (mit hoch- und runterfahren des docker containers)


1. Erstelle die Datei `sessionManager.ts`:
   - Interface `UserSession` (id: string, token: string, expiresAt: Date, roles: string[])
   - Klasse `SessionManager` mit einer internen Map. Methode zum Hinzufügen, Prüfen und ein automatisches `setInterval` (alle 60 Sekunden), das abgelaufene Sessions löscht.

2. Erstelle direkt danach das Bash-Skript `deploy.sh`:
   - Es soll `npm install -D esbuild` ausführen (falls nicht vorhanden).
   - Die `sessionManager.ts` per esbuild zu `dist/bundle.js` kompilieren.
   - Ein minimales `Dockerfile` on-the-fly erstellen (Basis node:20-alpine), das `dist/bundle.js` per CMD startet.
   - Den Docker-Container bauen und im Hintergrund ausführen.
   - Der Docker port muss über environment Example_SessionManager_Port übergeben werden
   - Für die E2E Tests muss ein zufälliger freier Port genommen werden.

3. Erstellen von Tests
   - Prüfe die funktionen.
   - Prüfe die funktionen auch gegen den laufenden Container als E2E tests. Jede funktion eines http endpoints muss auch gegen den laufenden docker container geprüft werden. Schreibe dafür ein eigenes sessionManager.e2e.test.ts file, das den container anspricht.

4. Erstelle eine Dokumentation
   - Ein README.md mit detalierter Beschreibung aus Nutzersicht.
   - Ein DEVELOPMENT.md mit Class diagramm für Entwickler.
   - Füge auch Dokumentation in den Coder als Inline-Comments ein wenn es sinnvoll ist.

Nutze für beide Dateien jeweils einen eigenen, sauberen `write_to_file` Tool-Aufruf.

Am Ende ein Report.md generieren
   - mit der Bearbeitungsdauer jedes Task.
   - mit der Bearbeitungsdauer aller Tasks zusammen.

Dann noch sicherstellen, das der neue Docker Container nicht mehr läuft.
