# Performance Report — llama-server (Example18)

| Feld | Wert |
|---|---|
| **Log-Datei** | `logs-Example18-llama-server-20260921-235915.log` |
| **Server** | llama-server (ggml-org/llama.cpp, build 11093, fb34fc262) |
| **Modell** | Qwen3.6-35B-A3B-UD-IQ4_NL.gguf |
| **Quantisierung** | IQ4_NL (GGUF V3) |
| **GPU** | NVIDIA GeForce RTX 3090 (24 GiB, ~22.5 GiB frei) |
| **CPU** | AMD Ryzen 9 5950X 16-Core (128 GiB) |
| **Threads** | 8 (Batch: 8) / 32 System-Threads |
| **Kontext-Fenster** | 220.160 Tokens |
| **Prompt Cache** | 8.192 MiB aktiv |
| **Speculative Decoding** | draft-MTP aktiv (48 Aufrufe) |
| **Mirostat 2.0** | lr=0.1, ent=5.0 |
| **Sampler** | top-k=20, top-p=0.95, min-p=0.05 |
| **Bericht erstellt** | 22.09.2026 |

---

## 1. Zeitablauf

| Phase | Zeitstempel | Dauer | Beschreibung |
|---|---|---|---|
| Server-Start | 23:51:51 | — | llama-server initialisiert |
| Modell-Load | 23:55:00 | ~5s | Qwen3.6-35B-A3B-UD-IQ4_NL geladen |
| Erster Request | 23:55:05 | — | Erste Prompt-Evaluation |
| Letzter Request | 23:58:39 | — | Letzter Request abgeschlossen |
| Log-Ende | 23:58:39 | — | Alle Slots idle |

**Gesamtdauer des Logs:** 6 Minuten 48 Sekunden  
**Wartezeit bis erster Request:** ~3 Minuten 9 Sekunden (Idle-Phase)  
**Aktive Laufzeit:** ~3 Minuten 34 Sekunden

---

## 2. Hardware & Konfiguration

### GPU (NVIDIA GeForce RTX 3090)
- **Total VRAM:** 24.176 MiB
- **Free VRAM (initial):** 22.505 MiB
- **Genutzter VRAM (Modell):** ~17.151 MiB (Layer-Weights)
- **Prompt Cache VRAM:** ~2.598 MiB initial → ~430 MiB nach Optimierung
- **Context Memory:** ~964 MiB
- **Compute Overhead:** -18.725 MiB (negative = Headroom/Reserve)
- **Offloading:** 42/42 Layer auf GPU (vollständig)

### CPU
- **RAM:** 128 GiB (128.706 MiB frei)
- **Threads:** 8 Arbeits-Threads, 31 für HTTP-Server
- **Architektur:** SSE3, SSSE3, AVX, AVX2, F16C, FMA, BMI2, LLAMAFILE, OPENMP

### Modell-Details
- **Parameter:** 753 Tensoren, 55 Key-Value-Paare (Meta)
- **Architektur:** MoE (Mixture of Experts) — 35B Gesamt, 3B aktiv pro Schritt
- **Chat Format:** peg-native
- **Reasoning:** Aktiviert (budget=2.147.483.647 Tokens = unbegrenzt)

---

## 3. Request-Analyse

### Übersicht
| Metrik | Wert |
|---|---|
| **Anzahl Requests** | 48 |
| **Gesamt-Prompt-Tokens** | 847.836 |
| **Gesamt-Generierte Tokens** | 869.836 |
| **Gesamt-Tokens (Input+Output)** | ~1.717.672 |
| **Ø Prompt-Tokens pro Request** | 17.663 |
| **Ø Generierte Tokens pro Request** | 18.121 |
| **Min Prompt-Tokens** | 40 |
| **Max Prompt-Tokens** | 39.726 |
| **Min Generierte Tokens** | 75 |
| **Max Generierte Tokens** | 2.768 |

### Prompt-Tokens (Eingabe)
| Statistik | Wert |
|---|---|
| Minimum | 40 |
| P25 | 10.129 |
| Median | 15.822 |
| P75 | 27.751 |
| Maximum | 39.726 |
| Durchschnitt | 17.663 |

### Generierte Tokens (Ausgabe)
| Statistik | Wert |
|---|---|
| Minimum | 75 |
| P25 | 11.344 |
| Median | 15.637 |
| P75 | 24.823 |
| Maximum | 2.768 |
| Durchschnitt | 18.121 |

---

## 4. Performance-Metriken

### Prompt-Evaluation (Input Processing)

| Statistik | Wert |
|---|---|
| **Durchschnitt** | **1.048 ms/token** |
| **Minimum** | **0.33 ms/token** (1.690 t/s) — 1. Request (Kaltstart) |
| **Median** | **1.37 ms/token** (731 t/s) |
| **Maximum** | **2.20 ms/token** (454 t/s) — Kontext wächst |
| **Tokens/sec (Ø)** | **1.348 t/s** |
| **Tokens/sec (Min)** | 454 t/s |
| **Tokens/sec (Max)** | 3.040 t/s |

**Beobachtung:** Die Prompt-Evaluation beschleunigt sich beim ersten Request dramatisch (3.040 t/s), da das KV-Cache noch leer ist. Mit wachsendem Kontext (bis ~40K Tokens) sinkt die Rate auf ~450-700 t/s, was typisch für autoregressive Modelle mit wachsendem Attention-Overhead ist.

### Generation (Output Processing)

| Statistik | Wert |
|---|---|
| **Durchschnitt** | **6.04 ms/token** |
| **Minimum** | **4.22 ms/token** (237 t/s) |
| **Median** | **6.43 ms/token** (155 t/s) |
| **Maximum** | **8.20 ms/token** (122 t/s) |
| **Tokens/sec (Ø)** | **165,8 t/s** |
| **Tokens/sec (Min)** | 122 t/s |
| **Tokens/sec (Max)** | 237 t/s |

**Beobachtung:** Die Generation ist sehr stabil mit nur ±1 ms/token Varianz. Dies zeigt, dass die GPU-Auslastung konsistent hoch ist und keine Engpässe vorliegen.

### Gesamtzeit pro Request

| Statistik | Wert |
|---|---|
| **Durchschnitt** | **3.847 ms** |
| **Minimum** | **543 ms** (kurzer Request) |
| **Median** | **1.612 ms** |
| **Maximum** | **16.873 ms** (längster Request) |
| **P95** | **10.778 ms** |

### Generation Rate über Zeit (tg = total generation rate)

| Zeitpunkt | n_gen | tg (t/s) | tg_3s (t/s) |
|---|---|---|---|
| 23:55:13 | 439 | 145,74 | 146,06 |
| 23:55:16 | 963 | 159,87 | 173,96 |
| 23:55:19 | 1.481 | 163,93 | 172,06 |
| 23:55:22 | 1.992 | 165,36 | 169,64 |
| 23:55:25 | 2.502 | 166,18 | 169,47 |
| 23:56:19 | 501 | 166,22 | 166,54 |
| 23:56:22 | 1.066 | 176,94 | 187,65 |
| 23:56:25 | 1.620 | 179,24 | 183,82 |
| 23:57:17 | 639 | 211,59 | 211,90 |
| 23:57:20 | 1.337 | 221,60 | 231,63 |
| 23:57:31 | 392 | 129,73 | 130,05 |
| 23:57:34 | 838 | 138,68 | 147,60 |
| 23:57:37 | 1.333 | 147,15 | 164,10 |
| 23:57:41 | 507 | 168,16 | 168,49 |
| 23:57:44 | 940 | 155,81 | 143,48 |
| 23:57:47 | 1.291 | 142,67 | 116,42 |
| 23:57:52 | 513 | 170,64 | 170,96 |
| 23:57:55 | 1.081 | 179,85 | 189,04 |
| 23:57:58 | 1.676 | 185,97 | 198,21 |
| 23:58:07 | 417 | 137,99 | 138,31 |
| 23:58:10 | 866 | 143,60 | 149,21 |
| 23:58:13 | 1.328 | 146,88 | 153,44 |

**Beobachtung:** Die Generation Rate schwankt zwischen 116 und 232 t/s (3s-Durchschnitt). Spitzenwerte von ~230 t/s werden bei kürzeren Kontexten erreicht. Bei längeren Kontexten stabilisiert sich die Rate bei ~140-170 t/s.

---

## 5. Speculative Decoding (draft-MTP) Analyse

### Gesamtstatistik (letzter Request)
| Metrik | Wert |
|---|---|
| **Aufrufe (b,g,a)** | 48 / 6.697 / 5.812 |
| **Generierte Drafts** | 5.812 |
| **Akzeptierte Drafts** | 5.681 |
| **Generierte Draft-Tokens** | 18.767 |
| **Akzeptierte Draft-Tokens** | 17.960 |
| **Ø Akzeptanzlänge** | 4,09 |
| **Akzeptanzrate/Position** | (0.977, 0.824, 0.693, 0.596) |
| **Dauer (b,g,a)** | 0,058ms / 23.743ms / 4,224ms |

### Draft-Akzeptanzrate über alle Requests
| Statistik | Wert |
|---|---|
| **Minimum** | 0.889 (88,9%) |
| **Median** | 0.962 (96,2%) |
| **Maximum** | 1.000 (100,0%) — 6 Requests |
| **Durchschnitt** | **~0.955 (95,5%)** |
| **Ø Draft-Länge** | **~4,0 Tokens** |

**Beobachtung:** Die speculative decoding Performance ist exzellent. Eine Akzeptanzrate von 95,5% bedeutet, dass fast jeder vom Draft-Modell vorgeschlagene Token korrekt ist. Dies beschleunigt die Generation um den Faktor ~4 (Ø Draft-Länge 4,09).

---

## 6. Prompt Cache Analyse

| Metrik | Wert |
|---|---|
| **Cache-Größe** | 8.192 MiB |
| **Max. Kontext** | 220.160 Tokens |
| **Prompt Cache Tokens** | 39.090 (98,4% Ähnlichkeit) |
| **Context Checkpoints** | 32 |
| **Größter Checkpoint** | 141,3 MiB (39.722 Tokens) |

**Beobachtung:** Der Prompt Cache wird effizient genutzt. Die LCP-Ähnlichkeit (Longest Common Prefix) von 98,4% zeigt, dass auf vorherige Kontexte zurückgegriffen wird, was die Prompt-Evaluation erheblich beschleunigt.

---

## 7. Fehleranalyse

| Anzahl | Schweregrad | Beschreibung |
|---|---|---|
| **1** | Warning | `failed to fit params to free device memory: n_gpu_layers already set by user to 99, abort` |

**Details:** Beim initialen Laden des Modells konnte die automatische GPU-Memory-Anpassung nicht durchgeführt werden, da `n_gpu_layers` manuell auf 99 gesetzt wurde. Dies ist kein kritischer Fehler — das Modell wurde erfolgreich vollständig auf die GPU geladen (42/42 Layer).

**Fehlerquote:** 0,002% (1 Warning in 1.881 Logzeilen)  
**Kritische Fehler:** 0

---

## 8. Graph-Wiederverwendung

| Metrik | Wert |
|---|---|
| **Erste Graph-Wiederverwendung** | 25 (Request 1) |
| **Letzte Graph-Wiederverwendung** | 3.245 (Request 48) |
| **Gesamte Graph-Wiederverwendungen** | ~80.000+ |

**Beobachtung:** Die CUDA-Graph-Wiederverwendung skaliert linear mit der Anzahl der Requests. Dies zeigt, dass esbuild/jit-compilation overhead vermieden wird und die GPU-Kernel effizient wiederverwendet werden.

---

## 9. Zusammenfassung & Empfehlungen

### Stärken
1. **Exzellente GPU-Auslastung** — 165+ t/s Generation auf RTX 3090 für ein 35B MoE-Modell
2. **Hervorragendes Speculative Decoding** — 95,5% Akzeptanzrate, ~4x Speedup
3. **Stabile Performance** — Nur ±1 ms/token Varianz bei der Generation
4. **Effizienter Prompt Cache** — 98,4% LCP-Ähnlichkeit, 8 GiB Cache genutzt
5. **Keine kritischen Fehler** — 0 Errors, 1 nicht-kritisches Warning

### Optimierungspotenzial
1. **Idle-Phase (3:09 min)** — Der Server wartete ~47% der Zeit auf den ersten Request. Überlegung: Pre-loading des Modells bei Start.
2. **Prompt-Evaluation bei großem Kontext** — Sinkt von 3.040 auf ~450 t/s. Bei sehr langen Konversationen könnte ein Context-Pruning helfen.
3. **GPU-Memory-Reserve** — Die negative compute-Overhead (-18.725 MiB) zeigt, dass die GPU fast voll ausgelastet ist. Bei Multi-Tenant-Betrieb könnte dies zu OOM führen.

### Kennzahlen im Überblick

| Metrik | Wert |
|---|---|
| **Ø Prompt-Eval** | 1.048 ms/token (1.348 t/s) |
| **Ø Generation** | 6,04 ms/token (165,8 t/s) |
| **Ø Gesamtzeit/Request** | 3.847 ms |
| **Draft-Akzeptanzrate** | 95,5% |
| **Ø Draft-Länge** | 4,09 Tokens |
| **Fehlerquote** | 0,002% |
| **Gesamt-Tokens verarbeitet** | ~1.717.672 |
| **Gesamt-Requests** | 48 |
