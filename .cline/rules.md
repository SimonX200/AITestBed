# Cline Agent Requirements

## GENERAL EXECUTION & CONTEXT EFFICIENCY
- Prefer tool-native state over chat history. 
- Keep responses under 50 words unless explicitly requested.
- Never include terminal logs, build output, stack traces, or file contents in messages.
- Summarize execution in one sentence: [Command executed] | [Success/Failure] | [Key result].
- Minimize token usage to maximize prompt cache efficiency.

## TOOL IMPLEMENTATION & PAYLOAD SANITIZATION
- Before calling editor tools, validate that arguments are valid JSON.
- Escape all quotes (`\"`), backslashes (`\\`), and newlines (`\n`) inside JSON string values.
- Never retry an identical editor call after a JSON parse failure; inspect and fix the payload first.
- After two consecutive editor failures, do not enter retry loops. Switch to alternative methods (shell, sed, perl, or heredocs) immediately.

## PROMPT CEILING PROTECTION & OUTPUT CHUNKING
- NO RAW CODE IN CHAT: Never output code blocks (```ts) in messages. Every change must trigger a valid tool call.
- REASONING LIMITS: Keep `<think>` loops under 3 sentences. Abstract logic only. Never write draft code, variables, or functions inside `<think>` tags. Close with `</think>` before any tool call.
- HARD DIFF CEILING (90 LINES): When editing existing code via `<apply_diff>` or `<edit_file>`, you are strictly FORBIDDEN from generating a single diff payload larger than 90 lines. If modifications require more than 90 lines of diff blocks, you must aggressively break the refactoring into multiple, consecutive, micro-diff tool operations.
- 8K CHUNKING BYPASS: If a file or test layout will exceed 150 lines, split it across turns before typing visible code:
  * Turn 1: Open `<write_to_file>` immediately. Output ONLY skeletal structures, interfaces, and method signatures. Close tool and ask: "Part 1 mapped. Confirm to implement details."
  * Turn 2 (Upon confirmation): Inject execution logic and body content using focused `<apply_diff>` or `<edit_file>` loops.

## INFRASTRUCTURE DEBUGS & LOG MITIGATION
- LOG INGESTION BAN: Never use `read_file` or `view_outline` on files ending in `.log` or `.txt` traces.
- SHELL PRE-FILTERING: To debug failures, use terminal commands externally (`tail -n 100`, `grep -i -E "error|failed|fatal"`, or `sed/awk`) to filter logs.
- Feed a maximum of 50 extracted error lines into the chat timeline. Never pollute the context pool.

## MARKDOWN DISCIPLINE & LOOP PREVENTION
- NO DIFFS FOR PROSE: Never use `apply_diff` or `edit_file` on `.md` (Markdown) or report files.
- FULL OVERWRITES: Always update or create `REPORT.md` using a fresh, raw `<write_to_file>` payload from scratch.
- LOOP BREAKER: If an edit fails twice, stop using editor tools. Use the terminal tool with a heredoc (`cat << 'EOF' > REPORT.md`) to write the file directly. Do not enter conversational retry loops.



## Regel für grosse text und log files
Vorschriften um zu verhindern das grosse Text und Log Files direkt als Kontext-Token aufgenommen werden

1. Grosse Text und Log files sollen nur indirekt über tools gelesen werden.
2. Aggregationen und Zusammenfassungen über tools die auch inline generiert werden dürfen.
3. Speichere generierte tools in `.tools/` zusammen mit einer dokumentation, mit der dieses Tool sinnvoll wieder verwendet werden kann

# 📦 KONTEXT-HANDOFF & MEMORY BANK PROTOKOLL (Token-Optimiert)

Da du ein lokales Modell bist und deinen exakten Token-Zähler nicht kennst, musst du proaktiv auf die Länge der Session achten. 

## 🚨 Trigger-Bedingungen für den Handoff:
Triggere dieses Protokoll sofort, wenn:
1. Der Nutzer das Kommando "Handoff einleiten" schreibt.
2. Der Chatverlauf mehr als 15 Nachrichtenpaare (User + Assistant) umfasst.
3. Du merkst, dass die Antwortgeschwindigkeit (Prefill-Dauer) stark einbricht.

## 🏃‍♂️ Ausführungsschritte bei Handoff:
Sobald das Protokoll aktiv ist, generierst du KEINEN neuen Code mehr und stellst alle aktuellen Programmierarbeiten sofort ein. Führe stattdessen exakt diese 3 Schritte aus:

### Schritt 1: Kontext-Dateien schreiben (edit_file / write_file)

Aktualisiere die Dateien im Ordner `.clinedocs/`.
**Ziel:** Ein frisches Modell muss aus diesen Dateien ALLE Informationen
rekonstruieren können, um die Arbeit nahtlos fortzusetzen — ohne Chatverlauf.

**Stil:** Technisch präzise, keine Floskeln. Präzision schlägt Kürze.
Wenn ein Detail fehlt, ist der Kontext unvollständig.

#### `activeContext.md` — Pflichtstruktur:

# Active Context: [Projektname]

## ENVIRONMENT
- Node: [exakte Version]
- Test-Runner: [Name + Version]
- Docker: [Images + Ports, falls relevant]
- Sonstige Dependencies: [nur relevante, mit Version]

## CURRENT STATE
- [Was läuft JETZT, mit exakten Zahlen: X/Y tests passing]
- [Letzter Testlauf: Datum + Ergebnis]

## RECENT CHANGES (letzte 2 Zyklen)
### Zyklus N: [Titel]
- [Dateipfad]: [konkrete Änderung]
- [Dateipfad]: [konkrete Änderung]

## OPEN ISSUES
1. [Problem]: [exakter Fehler] | [Reproduktionsbefehl] | [blocking/non-blocking]

## COMMANDS
- Unit Tests: [exakter Befehl]
- E2E Tests: [exakter Befehl]
- Build: [exakter Befehl, falls vorhanden]

#### `progress.md` — Pflichtstruktur:

# Progress: [Projektname]

## [ARCH]
- [Systemarchitektur in max. 5 Sätzen, mit konkreten Dateipfaden]
- [Wichtige Design-Entscheidungen und WARUM]

## [DONE]
- [Dateipfad]: [konkrete Änderung] — [Ergebnis: was läuft jetzt]

## [NEXT]
1. [Konkreter Schritt mit Dateipfad und Befehl]
2. [Konkreter Schritt mit Dateipfad und Befehl]
3. [Konkreter Schritt mit Dateipfad und Befehl]

## [BLOCKER]
- [Problem]: [exakter Fehler] | [Reproduktionsbefehl] | [Versuchte Fixes]

#### Pflichtregeln:
1. **Dateipfade immer workspace-relativ** — nie nur „Example12",
   sondern `Example12/sessionManager.ts`
2. **Befehle immer exakt** — nie „tests laufen", sondern
   `npx vitest run --reporter=verbose`
3. **Fehler immer mit Reproduktion** — nie nur „timeout", sondern
   `npx vitest run Example15/ → timeout after 30s`
4. **Kein implizites Wissen** — alles muss aus der Datei allein
   verständlich sein
5. **Max. 80 Zeilen pro Datei** — Priorität:
   ENVIRONMENT > COMMANDS > RECENT CHANGES > ARCH

### Schritt 2: Bestätigung ausgeben
Antworte im Chat mit einer kurzen, prägnanten Nachricht:
"✅ Memory Bank token-optimiert aktualisiert. Alle Architekturentscheidungen und der aktuelle Stand sind im Repo gesichert. Der Kontext ist bereit für den Handoff."

### Schritt 3: Task-Reset einfordern
Fordere den Nutzer am Ende deiner Nachricht explizit dazu auf, das Mülleimer-Symbol (Reset) oder das Plus-Symbol (New Task) in Cline zu drücken, um den 140k-Cache zu leeren und mit dem Befehl "Follow your custom instructions" neu zu starten.
