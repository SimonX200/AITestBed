# AI Benchmark — Todo-Execution Test

## Einleitung

Dieses Repository dient als Benchmark, um die Fähigkeit von KI-Modellen bei der isolierten Ausführung von Aufgaben zu testen. Im Fokus steht die Fähigkeit der KI, eine detaillierte Aufgabenbeschreibung (Todo) präzise und vollständig umzusetzen — ohne dabei auf andere Teile des Repositories zurückzugreifen.

Der Benchmark testet insbesondere:
- **Isolierte Ausführung**: Die KI soll nur die angeforderten Dateien erstellen, ohne den Rest des Repositories zu lesen oder zu verändern.
- **Vollständigkeit**: Kein Task darf übersprungen werden.
- **Reproduzierbarkeit**: Alle Node.js-Kommandos müssen über `npm run` skriptbar sein.
- **Testabdeckung**: Sowohl Unit-Tests als auch E2E-Tests gegen einen Docker-Container.
- **Dokumentation**: Generierung eines Reports mit Bearbeitungsdauern.

## Getestet mit

| Komponente       | Version / Commit                                          |
|------------------|-----------------------------------------------------------|
| Editor           | [VSCode / Cline](https://github.com/cline/cline)         |
| LLM              | llama.cpp (git commit `d9e03f107`)                        |
| Prompt           | `execute @todo.prompt.md`                                 |

## Test Environment Infos

Details zur Testumgebung, verwendete Tools und Konfiguration finden Sie in der Datei **[Test Environment Infos](./TestEnvironmentInfo.md)**.

### Cline Settings

Die Cline-Einstellungen, die für diesen Benchmark verwendet wurden, sind ebenfalls in den **[Test Environment Infos](./TestEnvironmentInfo.md)** dokumentiert.

## Benchmark-Ausführung

### Prompt

Der Benchmark wird mit folgendem Prompt gestartet:

```
execute @todo.prompt.md
```

Dies weist Cline an, die Datei `todo.prompt.md` zu lesen und die darin beschriebenen Aufgaben strikt isoliert auszuführen.

### Erwartete Ergebnisse

Nach erfolgreicher Ausführung des Prompts sollte im Verzeichnis `Example11` (oder `Example10`, je nach Durchlauf) folgendes vorliegen:

```
Example11/
├── sessionManager.ts      # Interface + Klasse
├── deploy.sh              # Deployment-Skript
├── e2e-run.sh             # E2E-Container-Skript
├── Dockerfile             # Wird on-the-fly erstellt
├── package.json           # Abhängigkeiten & Scripts
├── tsconfig.json          # TypeScript-Konfiguration
├── tests/
│   └── sessionManager.test.ts   # Unit-Tests
├── e2e/
│   └── sessionManager.e2e.test.ts  # E2E-Tests
├── dist/
│   └── bundle.js          # Kompiliertes Ergebnis
└── Report.md              # Report mit Bearbeitungsdauern
```

### Verfügbare npm Scripts

| Befehl         | Beschreibung                                          |
|----------------|-------------------------------------------------------|
| `npm run build` | Kompiliert `sessionManager.ts` → `dist/bundle.js`    |
| `npm test`      | Führt Unit-Tests aus (mocha + ts-mocha)              |
| `npm run e2e`   | Startet Docker-Container, führt E2E-Tests aus, stoppt Container |

## Bewertungskriterien

| Kriterium              | Gewichtung |
|------------------------|------------|
| Vollständigkeit        | Hoch       |
| Korrekte Testabdeckung | Hoch       |
| Reproduzierbarkeit     | Hoch       |
| Code-Qualität          | Mittel     |
| Dokumentation          | Mittel     |

## Lizenz

Dieses Projekt dient ausschließlich zu Test- und Benchmark-Zwecken.
