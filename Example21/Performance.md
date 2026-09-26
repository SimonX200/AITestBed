# Performance Analyse - Example21 (SessionManager)

## Übersicht

Diese Analyse basiert auf den Logs des llama-servers während der Ausführung des Example21-Projekts (SessionManager E2E-Tests).

**Log-Datei:** `logs-Example21-llama-server-20260926-135111.log`

**Zeitraum:** 26. Sep 2026, 13:39:51 - 13:50:00

**Gesamtdauer:** ~10 Minuten (609 Sekunden)

## Hardware

| Komponente | Spezifikation |
|------------|--------------|
| CPU | AMD Ryzen 9 5950X 16-Core Processor |
| GPU | NVIDIA GeForce RTX 3090 (24 GB VRAM, ~22 GB frei) |
| RAM | 128 GB |
| CUDA | ARCHS = 860 (Ampere) |

## Modell

| Parameter | Wert |
|-----------|------|
| Modell | Qwen3.6-35B-A3B-UD-Q4_K_XL |
| Architektur | qwen35moe (Mixture-of-Experts) |
| Quantisierung | Q4_K_XL (5.15 BPW) |
| Modellgröße | 21.27 GiB |
| Schichten | 41 (40 repeating + 1) |
| Embedding | 2048 |
| Köpfe | 16 (GQA: 2 → 8x GQA) |
| ROPE Dimension | 64 |
| Kontext (max) | 262.144 |
| Kontext (konfig.) | 140.000 |
| KV-Buffer (CUDA0) | 1.111 MiB |
| Compute-Buffer (CUDA0) | 369 MiB |
| Compute-Buffer (Host) | 73 MiB |
| Gesamt VRAM (ca.) | ~22.3 GiB |
| Reasoning | deepseek, xhigh, budget=4096 |
| Threads | 12 (GPU) / 32 (CPU) |

## Request-Metriken

| Metrik | Wert |
|--------|------|
| **Anzahl Requests** | 73 |
| **Gesamtdauer** | ~10 Minuten |
| **Min. Antwortzeit** | 0.6 s |
| **Max. Antwortzeit** | 28.4 s |
| **Ø Antwortzeit** | 4.2 s |
| **Min. Tokens pro Request** | 154 |
| **Max. Tokens pro Request** | 4564 |
| **Ø Tokens pro Request** | 786 |
| **Gesamt Tokens generiert** | 29,531 |
| **Gesamt Prompt Tokens** | 27,820 |
| **Gesamte Tokens (Prompt+Gen)** | 57,351 |
| **Overall Throughput** | 97.2 tok/s |

## Prompt-Evaluation

| Metrik | Min | Max | Ø | P50 | P90 | P95 | P99 |
|--------|-----|-----|---|-----|-----|-----|-----|
| **Prompt-Eval-Zeit (ms)** | 99 | 2625 | 322 | 153 | 588 | 1076 | 2625 |
| **Prompt-Tokens** | 75 | 4480 | 381 | 161 | 687 | 1101 | 4480 |
| **Prompt-Rate (tok/s)** | 264 | 2037 | 987 | 841 | 1369 | 1647 | 2037 |

## Token-Generierung (Eval)

| Metrik | Min | Max | Ø | P50 | P90 | P95 | P99 |
|--------|-----|-----|---|-----|-----|-----|-----|
| **Eval-Zeit (ms)** | 418 | 28317 | 3838 | 1143 | 15042 | 17768 | 28317 |
| **Eval-Tokens (generiert)** | 55 | 3490 | 405 | 104 | 1543 | 1696 | 3490 |
| **Eval-Rate (tok/s)** | 81 | 129 | 101 | 94 | 123 | 127 | 129 |

## Antwortzeiten (Total)

| Metrik | Min | Max | Ø | P50 | P90 | P95 | P99 |
|--------|-----|-----|---|-----|-----|-----|-----|
| **Total-Zeit (ms)** | 611 | 28440 | 4160 | 1638 | 15178 | 18225 | 28440 |
| **Total-Zeit (s)** | 0.6 | 28.4 | 4.2 | 1.6 | 15.2 | 18.2 | 28.4 |

## Graph-Wiederverwendung

| Metrik | Wert |
|--------|------|
| **Min. wiederverwendete Graphen** | 54 |
| **Max. wiederverwendete Graphen** | 29280 |
| **Ø wiederverwendete Graphen** | 17896 |
| **P50 wiederverwendete Graphen** | 18860 |
| **P90 wiederverwendete Graphen** | 27817 |

## Modell-Ladezeit

| Phase | Dauer |
|-------|-------|
| Server-Start | 13:39:51 |
| Modell-Anfrage (Queue) | 13:40:03 (+12s) |
| Modell geladen & bereit | ~13:40:12 (~9s) |
| Erster Request fertig | 13:40:15 (+3s) |
| **Gesamte Ladezeit** | **~24 Sekunden** |

## Performance-Verteilung

### Antwortzeiten

| Percentile | Zeit (ms) | Zeit (s) |
|------------|-----------|----------|
| P50 (Median) | 1638 | 1.6 |
| P90 | 15178 | 15.2 |
| P95 | 18225 | 18.2 |
| P99 | 28440 | 28.4 |

### Tokens pro Request

| Percentile | Tokens |
|------------|--------|
| P50 (Median) | 390 |
| P90 | 1803 |
| P95 | 3623 |
| P99 | 4564 |

## Performance-Analyse

### Stärken

1. **Hohe Prompt-Verarbeitungsgeschwindigkeit (Ø 987 tok/s)** - Die Eingabetokens werden sehr schnell verarbeitet, besonders bei kurzen Prompts (bis zu 2.037 tok/s).
2. **Gute Graph-Wiederverwendung (Ø 17.896)** - CUDA-Graphen werden effizient wiederverwendet, was den Overhead signifikant reduziert. Spätere Requests erreichen bis zu 29.280 wiederverwendete Graphen.
3. **Stabile Token-Generierungsrate (Ø 101 tok/s)** - Die Generierungsrate ist konsistent im Bereich 81-129 tok/s, was für ein 35B MoE-Modell mit Reasoning gut ist.
4. **Effizientes Prompt-Caching** - Bei wiederkehrenden Prompts sinkt die Prompt-Eval-Zeit von bis zu 2.625 ms auf unter 100 ms.

### Optimierungspotenzial

1. **Hohe maximale Antwortzeit (28,4 s)** - Bei langen Requests mit vielen Tokens kann die Antwortzeit signifikant ansteigen (P99: 28,4 s).
2. **Reasoning-Overhead** - Das Modell verwendet deepseek reasoning mit 'xhigh' effort, was die Generierungsrate auf ~100 tok/s begrenzt (ohne reasoning wären es ~150-200 tok/s möglich).
3. **VRAM-Nutzung (~22,3 GiB)** - Das Modell nutzt ~93% des VRAM der RTX 3090, was keine Kapazität für andere Tasks lässt.
4. **Prompt-Eval-Zeit variiert stark (99 ms - 2.625 ms)** - Abhängig von der Kontextlänge und Cache-Treffern.

### Reasoning-Performance

Das Modell verwendet **deepseek reasoning format** mit **xhigh effort** und einem **reasoning budget von 4096 Tokens**. Die n_gen-Progress-Logs zeigen:

- **Typische Reasoning-Rate:** 81-127 tok/s
- **Reasoning-Budget:** 4096 Tokens max
- **Reasoning wird vor der Antwort generiert** und beeinflusst die Gesamtlatenz

## Empfehlungen

1. **Reasoning-Effort anpassen** - Bei interaktiven Anwendungen könnte 'medium' oder 'low' effort die Latenz signifikant reduzieren.
2. **Batch-Verarbeitung** - Bei hohen Lasten Requests bündeln, um die GPU-Auslastung zu optimieren.
3. **Kontext-Management** - Lange Kontexte (>10.000 Tokens) können die Antwortzeit signifikant erhöhen.
4. **Monitoring** - Die P99-Latenz von ~28s sollte überwacht werden, besonders bei interaktiven Anwendungen.
5. **GPU-Auslastung** - Mit ~93% VRAM-Nutzung ist die GPU nahezu ausgelastet - keine Kapazität für parallele Modelle.

---

*Generiert aus: Example21/logs-Example21-llama-server-20260926-135111.log*  
*llama.cpp build: 4b1a27fa0 | CUDA 12 | RTX 3090 (24 GB)*
