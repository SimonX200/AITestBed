# Progress - AITestBed

## Fortschritt der Examples

### Example10-13: SessionManager + Google AI
- SessionManager mit Redis-Persistenz, Docker Compose, Jest Tests
- Example12: Google AI Integration mit separater Performance-Analyse

### Example14: Modellvergleich Qwen3.8-27B vs Qwen3.6-35B-A3B
- Direkter Performance-Vergleich in Perf.md
- Qwen3.6-35B-A3B: ~3x schnellere Generation (~158 tok/s vs ~54 tok/s)
- Höhere Draft-Acceptance-Rate: 97,3% vs 89,7%
- Geringerer KV-Speicher: 1,36 GiB vs 2,29 GiB

### Example15-20: SessionManager Iterationen
- Jede Iteration verbessert Docker-Setup, Testing, Dokumentation
- Consistentes Pattern: esbuild → Docker → Jest E2E
- Performance-Monitoring über llama-server logs

### Example21: SessionManager (aktuell)
- **Status:** ✅ Abgeschlossen
- **Performance.md generiert:** 26. Sep 2026
- **Ergebnisse:**
  - 73 Requests über ~10 Minuten
  - Ø Antwortzeit: 4,2s (P50: 1,6s, P99: 28,4s)
  - Token-Generation: Ø 101 tok/s (81-129 tok/s)
  - Prompt-Eval: Ø 987 tok/s (264-2.037 tok/s)
  - Gesamt generierte Tokens: 29.531
  - Graph-Wiederverwendung: Ø 17.896
  - Modell-Ladezeit: ~24 Sekunden
- **Empfehlungen:** Reasoning-Effort anpassen, Batch-Verarbeitung, Kontext-Management

## Bekannte Muster
- llama-server Router-Mode mit on-demand model loading
- Speculative Decoding mit deepseek reasoning format
- CUDA-Graph Wiederverwendung reduziert Overhead signifikant
- Prompt-Caching bei wiederkehrenden Prompts: 2.625ms → <100ms
- VRAM-Nutzung ~93% (22,3/24 GiB) bei Qwen3.6-35B-A3B

## Offene Tasks
- Keine explizit offen; alle Examples abgeschlossen
- Potenziell: Cross-Example Performance-Trendanalyse
- Potenziell: Reasoning-Effort Vergleich (xhigh vs medium vs low)
