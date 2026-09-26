# Active Context - AITestBed

## Projekt-Übersicht
AI-Testbed für Performance-Benchmarks und SessionManager-Entwicklung mit llama.cpp (Qwen3.6-35B-A3B, Qwen3.8-27B) auf RTX 3090.

## Hardware
- **CPU:** AMD Ryzen 9 5950X 16-Core
- **GPU:** NVIDIA GeForce RTX 3090 (24 GB VRAM)
- **RAM:** 128 GB
- **CUDA:** ARCHS 860 (Ampere)

## Aktuelles Working Directory
`/home/aurelb/devops/AITestBed`

## Zuletzt bearbeitet
- **26. Sep 14:30** — Unit-Tests aller Examples (10–21) ausgeführt, Review.md aktualisiert
  - **Bestanden (Unit):** Example10 (11/11), 11 (19/19), 12 (19/19 ⚠️), 13 (13/13), 14 (11/11), 18 (19/19), 19 (14/14), 21 (13/13)
  - **Teilweise:** Example16 (17/17 Unit, E2E ∅), 17 (24/24 Unit, E2E ∅), 20 (17/17 Unit, E2E ∅), 20-1 (17/18 Unit, E2E ∅)
  - **Fehler:** Example15 (Vitest ESM/CommonJS-Timeout)
  - **Neu:** Example20-1 Redis roles-Persistenz defekt (1 Test failure)
- **Example21:** Performance.md generiert aus llama-server logs (73 Requests, Qwen3.6-35B-A3B)
  - Log: `logs-Example21-llama-server-20260926-135111.log` (2.470 Zeilen)
  - 73 Requests, Ø 4,2s Antwortzeit, Ø 101 tok/s Generation
  - Modell: Qwen3.6-35B-A3B-UD-Q4_K_XL, deepseek reasoning xhigh

## Beispiel-Status
| Beispiel | Thema | Status | Docs |
|----------|-------|--------|------|
| Example10 | SessionManager | ✅ | Report.md, Performance.md, PostTestReport.md |
| Example11 | SessionManager | ✅ | Report.md, Performance.md, PostTestReport.md |
| Example12 | Google AI | ✅ | Report.md, Performance.md, PostTestReport.md, Google-AI-Analysen |
| Example13 | SessionManager | ✅ | Report.md, Performance.md, PostTestReport.md |
| Example14 | Qwen3.8-27B vs Qwen3.6-35B-A3B | ✅ | Perf.md (Vergleich), Performance.md, PostTestReport.md |
| Example15 | SessionManager | ✅ | REPORT.md, Performance.md, SessionManagerPerformance.md |
| Example16 | SessionManager | ✅ | README.md, DEVELOPMENT.md, Performance.md, REPORT.md |
| Example17 | SessionManager | ✅ | README.md, DEVELOPMENT.md, Performance.md, REPORT.md |
| Example18 | SessionManager | ✅ | README.md, DEVELOPMENT.md, performance-report-Example18.md |
| Example19 | SessionManager | ✅ | README.md, DEVELOPMENT.md, PERFORMANCE_REPORT.md |
| Example20 | SessionManager | ✅ | README.md, DEVELOPMENT.md, Performance.md, Report.md |
| Example20-1 | SessionManager | ✅ | README.md, DEVELOPMENT.md, Performance.md, Report.md |
| Example21 | SessionManager | ✅ | README.md, DEVELOPMENT.md, Performance.md, REPORT.md |

## Wichtige Pfade
- Logs: `Example*/logs-Example*-llama-server-*.log`
- Performance Reports: `Example*/Performance.md` oder `Example*/PERFORMANCE_REPORT.md`
- Root Perf.md: `/home/aurelb/devops/AITestBed/Perf.md` (Qwen3.8-27B vs Qwen3.6-35B-A3B Vergleich)
- Compare.md: `/home/aurelb/devops/AITestBed/Compare.md`
- Review.md: `/home/aurelb/devops/AITestBed/Review.md`

## Patterns & Konventionen
- Jedes Example hat: `todo.prompt.md`, `src/`, `tests/`, `deploy/`, `dist/`
- deploy.sh: Build mit esbuild, Docker Compose für SessionManager + Redis
- Tests: Jest (unit) + E2E gegen Docker-Container
- llama-server Logs: `slot print_timing` enthält alle Performance-Metriken
- Performance.md Format: Übersicht, Hardware, Modell, Request-Metriken, Percentile, Analyse, Empfehlungen
