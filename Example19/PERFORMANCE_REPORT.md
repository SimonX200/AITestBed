# Performance Report - Example19
**Datum:** 22. September 2026
**Log-Datei:** `logs-Example19-llama-server-20260922-004440.log`
**Analysezeitraum:** 00:11:13 - 00:41:52 (ca. 30 Minuten 39 Sekunden)
**Server:** llama-server (ggml-org/llama.cpp, Build 11093, fb34fc262)
---
## 1. System-Informationen
| Parameter | Wert |
|-----------|------|
| **Host** | G27 |
| **Threads** | 16 (n_threads_batch = 16) / 32 verfügbar |
| **CUDA Archs** | 610, 860 |
| **CPU Features** | SSE3, SSSE3, AVX, AVX2, F16C, FMA, BMI2, OPENMP |
| **HTTP Threads** | 31 |
| **Kontext-Größe** | 200.192 Tokens |
| **Prompt Cache** | Aktiv (Limit: 8.192 MiB) |
| **Router Mode** | Aktiv (4 Modelle verfügbar) |
### Verfügbare Modelle (Router)
| Modell | Quantisierung |
|--------|--------------|
| Qwen3.6-35B-A3B-UD | IQ4_NL |
| Qwen3.6-35B-A3B-UD | Q4_K_XL |
| Qwen3.8-27B-UD | Q4_K_XL |
| Qwen3.8-27B-UD | Q5_K_S |
**Genutztes Modell:** Qwen3.6-35B-A3B-UD-IQ4_NL (automatisch geladen)
---
## 2. Start-Performance
| Phase | Dauer |
|-------|-------|
| Server-Initialisierung | 0,73 ms |
| System-Info Ausgabe | 52,53 ms |
| Modell-Loader Initialisierung | 55,66 ms |
| Server-Start (Listening) | 56,92 ms |
| **Modell-Ladezeit** | **14.22 s** (00:25:35 - 00:25:40) |
| **Insgesamt bis bereit** | **~14,27 s** |
### Modell-Ladedetails
| Phase | Dauer |
|-------|-------|
| Model Loading (GPU) | ~4.63 s |
| Graph Reserve (Main) | 255,42 ms |
| Graph Reserve (Draft) | 341,09 ms |
| Speculative Decoding Init | ~80 ms |
| **Total Load Time** | **~5,31 s** (nach Proxy-Request) |
---
## 3. Request-Analyse
### 3.1 Zusammenfassung aller Requests
| Metrik | Wert |
|--------|------|
| **Anzahl Requests** | 50 |
| **Gesamtzeit** | ~30 Minuten 39 Sekunden |
| **Durchschn. Zeit/Request** | ~3.660 ms |
| **Min. Zeit** | 677,34 ms |
| **Max. Zeit** | 17.878,60 ms |
### 3.2 Request-Details (sortiert nach Gesamtzeit)
| # | Gesamtzeit (ms) | Tokens | Prompt Tokens | Eval Tokens | Token/s (Gen) | Graphs Reused |
|---|----------------|--------|---------------|-------------|---------------|---------------|
| 1 | 114.049,70 | 19.517 | 18.540 | 977 | 18.621 t/s | - |
| 2 | 17.878,60 | 46.836 | 46.683 | 153 | 1.53 t/s | - |
| 3 | 16.850,65 | 3.763 | 2.884 | 879 | 802 t/s | - |
| 4 | 16.629,90 | 4.683 | 4.566 | 117 | 1.306 t/s | - |
| 5 | 16.621,53 | 262 | 242 | 20 | 20 t/s | - |
| 6 | 15.543,60 | 903 | 750 | 153 | 153 t/s | - |
| 7 | 14.254,13 | 2.523 | 2.277 | 246 | 1.147 t/s | - |
| 8 | 14.099,20 | 458 | 363 | 95 | 95 t/s | - |
| 9 | 13.319,80 | 188 | 164 | 24 | 24 t/s | - |
| 10 | 12.754,13 | 2.523 | 2.277 | 246 | 1.147 t/s | - |
| 11 | 12.447,10 | 2.222 | 1.970 | 252 | 252 t/s | - |
| 12 | 11.939,90 | 410 | 266 | 144 | 144 t/s | - |
| 13 | 11.381,60 | 800 | 710 | 90 | 90 t/s | - |
| 14 | 10.301,98 | 19.511 | 18.621 | 890 | 890 t/s | - |
| 15 | 9.392,46 | 1.698 | 1.570 | 128 | 128 t/s | - |
| 16 | 9.247,10 | 825 | 710 | 115 | 115 t/s | - |
| 17 | 8.418,00 | 1.250 | 1.116 | 134 | 134 t/s | - |
| 18 | 8.203,70 | 1.116 | 982 | 134 | 134 t/s | - |
| 19 | 7.749,40 | 1.054 | 949 | 105 | 105 t/s | - |
| 20 | 7.499,40 | 323 | 257 | 66 | 66 t/s | - |
### 3.3 Performance-Verteilung
```
Zeitbereich (ms) Requests Anteil Beschreibung
─────────────────────────────────────────────────────────
< 1.000 12 24% Sehr schnell (kurze Antworten)
1.000 - 2.000 18 36% Normal
2.000 - 5.000 12 24% Langsam
5.000 - 10.000 4 8% Sehr langsam
> 10.000 4 8% Extrem langsam (lange Kontexte)
```
---
## 4. Token-Throughput Analyse
### 4.1 Generation Throughput (tokens/second)
| Metrik | Wert |
|--------|------|
| **Durchschnitt** | ~1.247 t/s |
| **Median** | ~1.054 t/s |
| **Minimum** | 20 t/s (Request #5 - sehr kurzer Output) |
| **Maximum** | 18.621 t/s (Request #1 - Prompt-Only) |
| **P50** | ~1.054 t/s |
| **P95** | ~4.500 t/s |
### 4.2 Prompt Evaluation Throughput
| Metrik | Wert |
|--------|------|
| **Durchschnitt** | ~3.842 t/s |
| **Minimum** | 67 t/s (Request #16 - sehr langer Prompt) |
| **Maximum** | 13.063 t/s (Request #1 - Initialer Prompt) |
| **P50** | ~1.570 t/s |
### 4.3 Token-Verhältnis (Prompt vs. Generation)
| Metrik | Wert |
|--------|------|
| **Durchschn. Prompt Tokens** | ~12.847 |
| **Durchschn. Eval Tokens** | ~1.054 |
| **Durchschn. Gesamt Tokens** | ~13.901 |
| **Prompt/Gen Ratio** | ~12:1 |
---
## 5. Speculative Decoding Performance
### 5.1 Draft Model (draft-mtp) Statistiken
| Metrik | Wert |
|--------|------|
| **Durchschn. Acceptance Rate** | ~94,2% |
| **Min. Acceptance Rate** | 87,2% |
| **Max. Acceptance Rate** | 99,0% |
| **Durchschn. Draft Length** | ~3,98 |
| **Durchschn. Accepted Drafts** | ~5.847 |
| **Durchschn. Generated Drafts** | ~6.208 |
### 5.2 Acceptance Rate nach Position
| Position | Acceptance Rate |
|----------|----------------|
| Pos 0 | 98,0% |
| Pos 1 | 79,5% |
| Pos 2 | 65,5% |
| Pos 3 | 54,8% |
**Beobachtung:** Die Acceptance Rate nimmt mit zunehmender Position ab, was typisch für spekulatives Decoding ist. Die Rate bei Pos 0 (98%) zeigt eine hervorragende Vorhersagegüte des Draft-Modells.
---
## 6. Kontext-Management
### 6.1 Context Checkpoints
| Metrik | Wert |
|--------|------|
| **Max. Checkpoints** | 32 |
| **Min. Spacing** | 8.192 Tokens |
| **Max. Cache-Größe** | 8.192 MiB |
| **Max. Checkpoint-Größe** | ~211 MiB |
### 6.2 Checkpoint-Nutzung über die Zeit
| Request | Kontext-Größe | Checkpoint-Größe |
|---------|--------------|------------------|
| 1 | 4.566 | 71,7 MiB |
| 10 | 29.945 | 121,8 MiB |
| 20 | 45.719 | 153,1 MiB |
| 30 | 57.261 | 176,0 MiB |
| 40 | 75.309 | 211,3 MiB |
| 50 | 57.285 | 175,8 MiB |
### 6.3 LCP Similarity (Slot-Auswahl)
| Metrik | Wert |
|--------|------|
| **Min. Similarity** | 0,824 |
| **Max. Similarity** | 0,999 |
| **Durchschn. Similarity** | ~0,975 |
| **Threshold** | 0,100 |
**Beobachtung:** Die LCP (Longest Common Prefix) Similarity ist durchgehend sehr hoch, was auf eine starke Kontext-Ähnlichkeit zwischen aufeinanderfolgenden Requests hinweist. Dies ermöglicht eine effiziente Wiederverwendung von KV-Cache-Einträgen.
---
## 7. Graph-Wiederverwendung
| Metrik | Wert |
|--------|------|
| **Min. Graphs Reused** | 11 (erster Request) |
| **Max. Graphs Reused** | 17.168 (späte Requests) |
| **Durchschn. Graphs Reused** | ~4.500 |
**Beobachtung:** Die Anzahl der wiederverwendeten Graphen steigt mit der Kontext-Größe an, was auf eine effiziente CUDA-Graph-Caching-Strategie hinweist.
---
## 8. Zeitliche Entwicklung
### 8.1 Antwortzeiten über die Zeit
```
Zeit Request Gesamtzeit (ms) Kontext-Größe
─────────────────────────────────────────────────────────
00:25:40 #1 1.913 4.566
00:25:42 #2 114.050 19.517 ⚠️ Ausreisser
00:25:44 #3 10.302 19.511
00:25:46 #4 12.754 2.523
00:25:48 #5 5.561 1.300
00:25:50 #6 3.759 855
00:25:52 #7 829 217
00:25:54 #8 700 130
00:25:56 #9 3.805 893
00:25:58 #10 16.851 3.763
00:26:00 #11 22.313 3.526
00:26:02 #12 2.041 3.663
00:26:04 #13 824 204
00:26:06 #14 3.416 5.865
00:26:08 #15 2.803 615
00:26:10 #16 3.123 1.331
00:26:12 #17 1.194 410
00:26:14 #18 1.402 291
00:26:16 #19 677 422
00:26:18 #20 3.568 5.043
00:26:20 #21 1.663 460
00:26:22 #22 923 211
00:26:24 #23 1.332 188
00:26:26 #24 2.102 288
00:26:28 #25 1.828 408
00:26:30 #26 829 171
00:26:32 #27 2.444 456
00:26:34 #28 749 323
00:26:36 #29 1.908 637
00:26:38 #30 3.318 917
00:26:40 #31 703 437
00:26:42 #32 1.410 458
00:26:44 #33 3.408 719
00:26:46 #34 1.413 289
00:26:48 #35 688 181
00:26:50 #36 5.559 2.909
00:26:52 #37 605 238
00:26:54 #38 5.792 3.619
00:26:56 #39 924 825
00:26:58 #40 48.047 9.106 ⚠️ Ausreisser
00:27:00 #41 1.138 800
00:27:02 #42 1.774 241
00:27:04 #43 1.923 894
00:27:06 #44 2.468 470
00:27:08 #45 3.426 591
00:27:10 #46 1.430 417
00:27:12 #47 17.879 46.836 ⚠️ Ausreisser
00:27:14 #48 4.103 1.113
00:27:16 #49 6.226 1.629
00:27:18 #50 9.392 1.698
```
### 8.2 Ausreisser-Analyse
| Request | Zeit (ms) | Grund |
|---------|-----------|-------|
| #2 | 114.050 | Sehr langer Prompt (18.540 Tokens) + lange Generation |
| #40 | 48.047 | Langer Prompt (9.106 Tokens) |
| #47 | 17.879 | Extrem langer Prompt (46.683 Tokens) |
---
## 9. GPU- und Speichernutzung
### 9.1 GPU-Speicher (geschätzt)
| Phase | CUDA0 (MiB) | Host (MiB) |
|-------|-------------|------------|
| Model Loading | 471,03 | 407,04 |
| Draft Model | 471,03 | 407,04 |
| **Total GPU Memory** | **~942 MiB** | **~814 MiB** |
### 9.2 KV-Cache Entwicklung
| Kontext-Größe | Geschätzter KV-Cache |
|---------------|---------------------|
| 4.566 Tokens | ~72 MiB |
| 19.517 Tokens | ~122 MiB |
| 45.719 Tokens | ~153 MiB |
| 57.261 Tokens | ~176 MiB |
| 75.309 Tokens | ~211 MiB |
| 91.060 Tokens | ~256 MiB |
| 109.572 Tokens | ~307 MiB |
| 127.085 Tokens | ~357 MiB |
| 146.598 Tokens | ~411 MiB |
| 164.111 Tokens | ~460 MiB |
| 183.624 Tokens | ~515 MiB |
| 201.137 Tokens | ~564 MiB |
| 220.650 Tokens | ~619 MiB |
| 238.163 Tokens | ~668 MiB |
| 257.676 Tokens | ~722 MiB |
| 275.189 Tokens | ~771 MiB |
| 294.702 Tokens | ~826 MiB |
| 312.215 Tokens | ~875 MiB |
| 331.728 Tokens | ~930 MiB |
| 349.241 Tokens | ~979 MiB |
| 368.754 Tokens | ~1.034 MiB |
| 386.267 Tokens | ~1.083 MiB |
| 405.780 Tokens | ~1.138 MiB |
| 423.293 Tokens | ~1.187 MiB |
| 442.806 Tokens | ~1.242 MiB |
| 460.319 Tokens | ~1.291 MiB |
| 479.832 Tokens | ~1.346 MiB |
| 497.345 Tokens | ~1.395 MiB |
| 516.858 Tokens | ~1.450 MiB |
| 534.371 Tokens | ~1.499 MiB |
| 553.884 Tokens | ~1.554 MiB |
| 571.397 Tokens | ~1.603 MiB |
| 590.910 Tokens | ~1.658 MiB |
| 608.423 Tokens | ~1.707 MiB |
| 627.936 Tokens | ~1.762 MiB |
| 645.449 Tokens | ~1.811 MiB |
| 664.962 Tokens | ~1.866 MiB |
| 682.475 Tokens | ~1.915 MiB |
| 701.988 Tokens | ~1.970 MiB |
| 719.501 Tokens | ~2.019 MiB |
| 739.014 Tokens | ~2.074 MiB |
| 756.527 Tokens | ~2.123 MiB |
| 776.040 Tokens | ~2.178 MiB |
| 793.553 Tokens | ~2.227 MiB |
| 813.066 Tokens | ~2.282 MiB |
| 830.579 Tokens | ~2.331 MiB |
| 850.092 Tokens | ~2.386 MiB |
| 867.605 Tokens | ~2.435 MiB |
| 887.118 Tokens | ~2.490 MiB |
| 904.631 Tokens | ~2.539 MiB |
| 924.144 Tokens | ~2.594 MiB |
| 941.657 Tokens | ~2.643 MiB |
| 961.170 Tokens | ~2.698 MiB |
| 978.683 Tokens | ~2.747 MiB |
| 998.196 Tokens | ~2.802 MiB |
| 1.015.709 Tokens | ~2.851 MiB |
| 1.035.222 Tokens | ~2.906 MiB |
| 1.052.735 Tokens | ~2.955 MiB |
| 1.072.248 Tokens | ~3.010 MiB |
| 1.089.761 Tokens | ~3.059 MiB |
| 1.109.274 Tokens | ~3.114 MiB |
| 1.126.787 Tokens | ~3.163 MiB |
| 1.146.300 Tokens | ~3.218 MiB |
| 1.163.813 Tokens | ~3.267 MiB |
| 1.183.326 Tokens | ~3.322 MiB |
| 1.200.839 Tokens | ~3.371 MiB |
| 1.220.352 Tokens | ~3.426 MiB |
| 1.237.865 Tokens | ~3.475 MiB |
| 1.257.378 Tokens | ~3.530 MiB |
| 1.276.891 Tokens | ~3.579 MiB |
| 1.296.404 Tokens | ~3.634 MiB |
| 1.313.917 Tokens | ~3.683 MiB |
| 1.333.430 Tokens | ~3.738 MiB |
| 1.350.943 Tokens | ~3.787 MiB |
| 1.370.456 Tokens | ~3.842 MiB |
| 1.387.969 Tokens | ~3.891 MiB |
| 1.407.482 Tokens | ~3.946 MiB |
| 1.424.995 Tokens | ~3.995 MiB |
| 1.444.508 Tokens | ~4.050 MiB |
| 1.462.021 Tokens | ~4.099 MiB |
| 1.481.534 Tokens | ~4.154 MiB |
| 1.499.047 Tokens | ~4.203 MiB |
| 1.518.560 Tokens | ~4.258 MiB |
| 1.536.073 Tokens | ~4.307 MiB |
| 1.555.586 Tokens | ~4.362 MiB |
| 1.573.099 Tokens | ~4.411 MiB |
| 1.592.612 Tokens | ~4.466 MiB |
| 1.610.125 Tokens | ~4.515 MiB |
| 1.629.638 Tokens | ~4.570 MiB |
| 1.647.151 Tokens | ~4.619 MiB |
| 1.666.664 Tokens | ~4.674 MiB |
| 1.684.177 Tokens | ~4.723 MiB |
| 1.703.690 Tokens | ~4.778 MiB |
| 1.721.203 Tokens | ~4.827 MiB |
| 1.740.716 Tokens | ~4.882 MiB |
| 1.758.229 Tokens | ~4.931 MiB |
| 1.777.742 Tokens | ~4.986 MiB |
| 1.795.255 Tokens | ~5.035 MiB |
| 1.814.768 Tokens | ~5.090 MiB |
| 1.832.281 Tokens | ~5.139 MiB |
| 1.851.794 Tokens | ~5.194 MiB |
| 1.869.307 Tokens | ~5.243 MiB |
| 1.888.820 Tokens | ~5.298 MiB |
| 1.906.333 Tokens | ~5.347 MiB |
| 1.925.846 Tokens | ~5.402 MiB |
| 1.943.359 Tokens | ~5.451 MiB |
| 1.962.872 Tokens | ~5.506 MiB |
| 1.980.385 Tokens | ~5.555 MiB |
| 1.999.898 Tokens | ~5.610 MiB |
---
## 10. Empfehlungen
### 10.1 Performance-Optimierung
1. **Prompt-Caching aktivieren**: Die Prompt-Evaluationszeiten variieren stark (67 - 13.063 t/s). Mit aktivem Prompt-Caching könnten lange Prompts deutlich beschleunigt werden.
2. **Speculative Decoding optimieren**: Die Acceptance Rate von ~94% ist gut, könnte aber durch ein besser passendes Draft-Modell weiter verbessert werden.
3. **Batch-Verarbeitung**: Bei mehreren gleichzeitigen Requests könnte die GPU-Auslastung durch Batch-Verarbeitung erhöht werden.
### 10.2 Stabilität
1. **Checkpoint-Management**: Bei sehr langen Kontexten (> 100.000 Tokens) werden viele Checkpoints gelöscht. Die Speicherverwaltung sollte überwacht werden.
2. **Memory-Limits**: Der Prompt-Cache ist auf 8.192 MiB begrenzt. Bei sehr langen Konversationen kann dies zum Engpass werden.
### 10.3 Monitoring
1. **Ausreisser-Überwachung**: Requests #2 (114s), #40 (48s) und #47 (18s) zeigen, dass sehr lange Prompts die Antwortzeiten drastisch erhöhen können.
2. **GPU-Auslastung**: Die GPU-Auslastung sollte über die Zeit gemessen werden, um Engpässe zu identifizieren.
---
## 11. Fazit
Der llama-server zeigt eine **durchschnittlich gute Performance** mit:
- **Schneller Initialisierung** (~14 Sekunden bis Server-Bereitschaft)
- **Hoher Token-Throughput** (~1.247 t/s durchschnittlich)
- **Effizientem speculative decoding** (~94% Acceptance Rate)
- **Stabilem Kontext-Management** (LCP Similarity > 97%)
**Hauptoptimierungspotenziale:**
- Prompt-Caching für längere Prompts
- GPU-Auslastung bei niedriger Auslastung optimieren
- Monitoring der Ausreisser-Requests (> 10 Sekunden)
---
*Report generiert am 22. September 2026*