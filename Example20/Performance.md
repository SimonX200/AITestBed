# Performance Analyse - SessionManager

## Übersicht

Diese Analyse basiert auf den Logs des llama-servers während der Ausführung des Example20-Projekts.

**Log-Datei:** `logs-Example20-llama-server-20260926-013136.log`

**Zeitraum:** 26. Sep 2026, 01:20:36 - 01:29:33

**Gesamtdauer:** ~9 Minuten (537 Sekunden)

## Hardware

| Komponente | Spezifikation |
|------------|--------------|
| CPU | AMD Ryzen 9 5950X 16-Core Processor |
| GPU | NVIDIA GeForce RTX 3090 (24 GB VRAM, ~22 GB frei) |
| RAM | 128 GB (128 GB frei) |
| CUDA | ARCHS = 860 (Ampere) |

## Modell

| Parameter | Wert |
|-----------|------|
| Modell | Qwen3.6-35B-A3B-UD-IQ4_NL |
| Quantisierung | IQ4_NL (4-bit) |
| Modellgröße | ~24 GB VRAM |
| Kontextgröße | 200.000 Tokens |
| Threads | 12 (GPU) / 32 (CPU) |

## Request-Metriken

| Metrik | Wert |
|--------|------|
| **Anzahl Requests** | 76 |
| **Gesamtdauer** | ~9 Minuten |
| **Min. Antwortzeit** | 598,67 ms |
| **Max. Antwortzeit** | 24.674,54 ms |
| **Ø Antwortzeit** | 3.534,52 ms |
| **Min. Tokens pro Request** | 139 |
| **Max. Tokens pro Request** | 8.034 |
| **Ø Tokens pro Request** | 1.039,13 |
| **Gesamt Tokens generiert** | 78.974 |

## Prompt-Evaluation

| Metrik | Wert |
|--------|------|
| **Min. Prompt-Eval-Zeit** | 87,45 ms |
| **Max. Prompt-Eval-Zeit** | 1.945,31 ms |
| **Ø Prompt-Eval-Zeit** | 400,08 ms |
| **Min. Prompt-Tokens/sec** | 209,65 |
| **Max. Prompt-Tokens/sec** | 2.946,21 |
| **Ø Prompt-Tokens/sec** | 771,08 |

## Token-Generierung (Eval)

| Metrik | Wert |
|--------|------|
| **Min. Eval-Zeit** | 398,67 ms |
| **Max. Eval-Zeit** | 24.019,63 ms |
| **Ø Eval-Zeit** | 3.134,44 ms |
| **Min. Tokens/sec** | 107,50 |
| **Max. Tokens/sec** | 227,08 |
| **Ø Tokens/sec** | 151,96 |

## Draft-Akzeptanz (Mirostat/Speculative Decoding)

| Metrik | Wert |
|--------|------|
| **Min. Akzeptanzrate** | 84,81 % |
| **Max. Akzeptanzrate** | 100,00 % |
| **Ø Akzeptanzrate** | 96,04 % |
| **Min. Mean Len** | 2,98 |
| **Max. Mean Len** | 4,95 |
| **Ø Mean Len** | 4,09 |

## Graph-Wiederverwendung

| Metrik | Wert |
|--------|------|
| **Min. wiederverwendete Graphen** | 32 |
| **Max. wiederverwendete Graphen** | 5.988 |
| **Ø wiederverwendete Graphen** | 4.148,42 |

## Performance-Verteilung

### Antwortzeiten

| Percentile | Zeit |
|------------|------|
| P50 (Median) | ~3.000 ms |
| P90 | ~8.000 ms |
| P95 | ~15.000 ms |
| P99 | ~24.000 ms |

### Tokens pro Request

| Percentile | Tokens |
|------------|--------|
| P50 (Median) | ~800 |
| P90 | ~3.000 |
| P95 | ~5.000 |
| P99 | ~8.000 |

## Performance-Analyse

### Stärken

1. **Hohe Draft-Akzeptanzrate (96,04 %)** - Das speculative decoding funktioniert sehr effektiv und beschleunigt die Token-Generierung erheblich.
2. **Gute Graph-Wiederverwendung (Ø 4.148)** - CUDA-Graphen werden effizient wiederverwendet, was Overhead reduziert.
3. **Stabile Token-Generierungsrate (Ø 152 t/s)** - Konsistente Performance über alle Requests hinweg.
4. **Effiziente Prompt-Evaluation (Ø 771 t/s)** - Schnelles Processing der Eingabetokens.

### Optimierungspotenzial

1. **Maximale Antwortzeit (24,67 s)** - Bei langen Requests mit vielen Tokens kann die Antwortzeit signifikant ansteigen.
2. **Prompt-Eval-Zeit variiert stark (87 ms - 1.945 ms)** - Abhängig von der Kontextlänge.
3. **VRAM-Nutzung (~24 GB)** - Das Modell nutzt fast den gesamten VRAM der RTX 3090, was keine Kapazität für andere Tasks lässt.

## Empfehlungen

1. **Batch-Verarbeitung** - Bei hohen Lasten Requests bündeln, um die GPU-Auslastung zu optimieren.
2. **Kontext-Management** - Lange Kontexte (>10.000 Tokens) können die Antwortzeit signifikant erhöhen.
3. **Monitoring** - Die P99-Latenz von ~24s sollte überwacht werden, besonders bei interaktiven Anwendungen.
4. **GPU-Auslastung** - Mit 96 % VRAM-Nutzung ist die GPU nahezu ausgelastet - keine Kapazität für parallele Modelle.
