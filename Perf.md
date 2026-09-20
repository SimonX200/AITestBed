# Performance-Vergleich: Qwen3.8-27B vs Qwen3.6-35B-A3B

**Hardware:** NVIDIA GeForce RTX 3090 (24 GB VRAM) | AMD Ryzen 9 5950X (16-Core)  
**Build:** llama.cpp d9e03f107 (CUDA 12, GCC 14.3.1)  
**Speculative Decoding:** draft-mtp (n_max=4, p_min=0.75) | reasoning-format: deepseek | reasoning-effort: xhigh  
**Datum:** 20. September 2026

---

## Modell-Übersicht

| Eigenschaft | Qwen3.8-27B-UD-Q5_K_S | Qwen3.6-35B-A3B-UD-IQ4_NL |
|---|---|---|
| **Architektur** | qwen35 (Dense) | qwen35moe (Mixture-of-Experts) |
| **Parameter (gesamt)** | 27.32 B | 35.51 B |
| **Aktiviert (MoE)** | n/a | 3 B (8 von 256 Experten) |
| **Quantisierung** | Q5_K_S (5.46 BPW) | IQ4_NL (4.17 BPW) |
| **Dateigröße** | 17.37 GiB | 17.25 GiB |
| **Schichten** | 65 (64 repeating + 1) | 41 (40 repeating + 1) |
| **Embedding** | 5120 | 2048 |
| **Köpfe** | 24 (GQA: 6) | 16 (GQA: 8) |
| **KV-Speicher** | K: q8_0 / V: q4_0 | K: q8_0 / V: q8_0 |
| **Context (max)** | 262.144 | 262.144 |
| **Context (konfig.)** | 90.112 | 131.072 |
| **GPU-Layer** | 99 | 99 |
| **CUDA0 Modell-Buffer** | 17.11 GiB | 17.15 GiB |
| **CUDA0 KV-Buffer** | 2.29 GiB | 1.36 GiB |
| **CUDA0 RS-Buffer** | 748 MiB | 314 MiB |
| **Threads** | 8 | 8 |

## Benchmark-Ergebnisse

### Qwen3.8-27B-UD-Q5_K_S

| # | Prompt (Tok) | Gen (Tok) | Prompt Zeit | Prompt Rate | Gen Zeit | Gen Rate | Gesamt Zeit | Gesamt (Tok) | Draft Accept | Acc/Pos |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 3.445 | 2.142 | 3.27 s | 1.054 tok/s | 38.35 s | 55.82 tok/s | 41.62 s | 5.587 | 0.894 | (0.980, 0.656, 0.474, 0.337) |
| 2 | 4.564 | 757 | 4.36 s | 1.046 tok/s | 13.37 s | 56.53 tok/s | 17.74 s | 5.321 | 0.917 | (0.984, 0.735, 0.535, 0.427) |
| 3 | 3.316 | 6.465 | 3.33 s | 0.997 tok/s | 128.69 s | 50.23 tok/s | 132.02 s | 9.781 | 0.877 | (0.945, 0.638, 0.450, 0.335) |
| 4 | 3.093 | 7.788 | 3.40 s | 0.910 tok/s | 139.45 s | 55.84 tok/s | 142.85 s | 10.881 | 0.902 | (0.955, 0.741, 0.608, 0.500) |

**Durchschnitt (Qwen3.8-27B):**
- **Prompt Processing:** ~3.6 s | ~1.000 tok/s
- **Generation Rate:** ~54.6 tok/s
- **Draft Acceptance Rate:** ~89.7%
- **Mean Draft Length:** ~3.58

---

### Qwen3.6-35B-A3B-UD-IQ4_NL

| # | Prompt (Tok) | Gen (Tok) | Prompt Zeit | Prompt Rate | Gen Zeit | Gen Rate | Gesamt Zeit | Gesamt (Tok) | Draft Accept | Acc/Pos |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 31.742 | 324 | 10.55 s | 3.009 tok/s | 2.70 s | 119.71 tok/s | 13.25 s | 32.066 | 0.930 | (0.964, 0.667, 0.452, 0.286) |
| 2 | 57 | 1.657 | 0.14 s | 414.97 tok/s | 8.71 s | 190.22 tok/s | 8.84 s | 1.714 | 0.981 | (0.992, 0.950, 0.863, 0.801) |
| 3 | 1.728 | 65 | 0.78 s | 2.226 tok/s | 0.39 s | 162.78 tok/s | 1.17 s | 1.793 | 0.980 | (1.000, 0.929, 0.857, 0.786) |
| 4 | 57 | 666 | 0.14 s | 410.42 tok/s | 3.47 s | 191.62 tok/s | 3.61 s | 723 | 0.992 | (1.000, 0.978, 0.942, 0.877) |
| 5 | 67 | 77 | 0.14 s | 477.99 tok/s | 0.48 s | 159.58 tok/s | 0.62 s | 144 | 0.952 | (1.000, 0.941, 0.824, 0.706) |
| 6 | 463 | 99 | 0.53 s | 868.97 tok/s | 0.65 s | 151.27 tok/s | 1.18 s | 562 | 0.959 | (1.000, 0.720, 0.640, 0.480) |
| 7 | 58 | 2.994 | 0.14 s | 412.08 tok/s | 16.85 s | 177.60 tok/s | 17.00 s | 3.052 | 0.970 | (0.988, 0.924, 0.823, 0.749) |
| 8 | 252 | 85 | 0.25 s | 1.009 tok/s | 0.71 s | 118.53 tok/s | 0.96 s | 337 | 0.982 | (1.000, 0.571, 0.524, 0.476) |
| 9 | 80 | 292 | 0.16 s | 488.06 tok/s | 1.53 s | 189.64 tok/s | 1.70 s | 372 | 0.966 | (0.968, 0.919, 0.887, 0.887) |
| 10 | 422 | 330 | 0.33 s | 1.275 tok/s | 1.77 s | 186.38 tok/s | 2.10 s | 752 | 0.981 | (0.971, 0.928, 0.928, 0.913) |
| 11 | 696 | 107 | 0.43 s | 1.619 tok/s | 0.80 s | 132.99 tok/s | 1.23 s | 803 | 0.917 | (0.963, 0.815, 0.630, 0.444) |
| 12 | 149 | 84 | 0.36 s | 411.11 tok/s | 0.53 s | 155.36 tok/s | 0.90 s | 233 | 0.970 | (0.900, 0.850, 0.750, 0.700) |
| 13 | 114 | 63 | 0.19 s | 605.71 tok/s | 0.36 s | 170.34 tok/s | 0.55 s | 177 | 0.980 | (1.000, 1.000, 1.000, 0.846) |
| 14 | 857 | 625 | 0.47 s | 1.832 tok/s | 4.89 s | 127.49 tok/s | 5.36 s | 1.482 | 0.969 | (0.987, 0.725, 0.490, 0.425) |
| 15 | 130 | 82 | 0.20 s | 656.84 tok/s | 0.58 s | 139.90 tok/s | 0.78 s | 212 | 0.953 | (1.000, 0.895, 0.684, 0.632) |
| 16 | 252 | 301 | 0.26 s | 962.92 tok/s | 1.54 s | 195.31 tok/s | 1.80 s | 553 | 0.980 | (1.000, 0.984, 0.952, 0.935) |
| 17 | 539 | 69 | 0.37 s | 1.469 tok/s | 0.41 s | 165.01 tok/s | 0.78 s | 608 | 1.000 | (1.000, 0.750, 0.750, 0.688) |
| 18 | 531 | 154 | 0.34 s | 1.559 tok/s | 1.04 s | 147.03 tok/s | 1.38 s | 685 | 0.982 | (1.000, 0.811, 0.622, 0.514) |
| 19 | 1.284 | 347 | 0.91 s | 1.415 tok/s | 2.39 s | 144.69 tok/s | 3.30 s | 1.631 | 0.973 | (1.000, 0.815, 0.704, 0.580) |
| 20 | 364 | 333 | 0.31 s | 1.170 tok/s | 1.85 s | 179.43 tok/s | 2.16 s | 697 | 0.984 | (1.000, 0.913, 0.899, 0.855) |
| 21 | 192 | 75 | 0.22 s | 865.06 tok/s | 0.51 s | 145.39 tok/s | 0.73 s | 267 | 1.000 | (1.000, 0.824, 0.706, 0.706) |
| 22 | 990 | 133 | 0.72 s | 1.378 tok/s | 0.93 s | 141.85 tok/s | 1.65 s | 1.123 | 0.989 | (1.000, 0.900, 0.700, 0.533) |
| 23 | 58 | 1.019 | 0.16 s | 372.72 tok/s | 5.69 s | 178.81 tok/s | 5.85 s | 1.077 | 0.974 | (0.991, 0.945, 0.886, 0.804) |
| 24 | 67 | 103 | 0.16 s | 424.67 tok/s | 0.83 s | 122.77 tok/s | 0.99 s | 170 | 0.972 | (1.000, 0.667, 0.556, 0.370) |
| 25 | 85 | 83 | 0.18 s | 466.02 tok/s | 0.67 s | 123.13 tok/s | 0.85 s | 168 | 0.983 | (1.000, 0.727, 0.500, 0.364) |
| 26 | 471 | 674 | 0.35 s | 1.335 tok/s | 4.81 s | 139.85 tok/s | 5.17 s | 1.145 | 0.952 | (0.976, 0.778, 0.629, 0.485) |

**Durchschnitt (Qwen3.6-35B-A3B):**
- **Prompt Processing:** ~0.75 s | ~1.180 tok/s (variiert stark mit Cache-Treffer)
- **Generation Rate:** ~158.5 tok/s (Durchschnitt über alle Requests)
- **Draft Acceptance Rate:** ~97.3%
- **Mean Draft Length:** ~4.39

---
## Direkter Vergleich

### Generation Rate (Tokens pro Sekunde)

| Metrik | Qwen3.8-27B | Qwen3.6-35B-A3B | Gewinn |
|---|---|---|---|
| **Gen Rate (tok/s)** | ~54.6 | ~158.5 | **+190%** |
| **Prompt Rate (tok/s)** | ~1.000 | ~1.180 | +18% |
| **Draft Acceptance** | 89.7% | 97.3% | +7.6% |
| **Mean Draft Length** | 3.58 | 4.39 | +23% |

### VRAM-Verbrauch (CUDA0)

| Komponente | Qwen3.8-27B | Qwen3.6-35B-A3B | Differenz |
|---|---|---|---|
| **Modell-Buffer** | 17.11 GiB | 17.15 GiB | +0.04 GiB |
| **KV-Buffer** | 2.29 GiB | 1.36 GiB | **-0.93 GiB** |
| **RS-Buffer** | 748 MiB | 314 MiB | **-434 MiB** |
| **Compute-Buffer** | 688 MiB | 616 MiB | -72 MiB |
| **Gesamt (ca.)** | ~20.8 GiB | ~20.0 GiB | **-0.8 GiB** |

### Kontext-Länge & Effizienz

| Metrik | Qwen3.8-27B | Qwen3.6-35B-A3B |
|---|---|---|
| **Konfigurierter Context** | 90.112 | 131.072 |
| **Prompt Cache (Request 2-4)** | 55-87% Similarity | 97-100% Similarity |
| **Checkpoint-Größe (pro 10K Tok)** | ~160 MiB | ~130 MiB |

---

## Analyse

### Qwen3.6-35B-A3B (Mixture-of-Experts) Vorteile:
1. **~3x schnellere Generation** trotz höherer Gesamtparameter (35B vs 27B)
2. **Nur 3B aktiv** pro Token → deutlich geringere Compute-Anforderungen
3. **Höhere Draft-Acceptance-Rate** (97.3% vs 89.7%) → effizienteres Speculative Decoding
4. **Längere durchschnittliche Draft-Länge** (4.39 vs 3.58) → mehr Tokens pro Draft-Schritt
5. **Geringerer KV-Speicher** (1.36 vs 2.29 GiB) → mehr Kapazität für längere Kontexte
6. **Kompakteres Embedding** (2048 vs 5120) → weniger Speicher pro Token

### Qwen3.8-27B (Dense) Vorteile:
1. **Größeres Embedding** (5120) → potenziell bessere Repräsentationsfähigkeit
2. **Mehr Aufmerksamkeit-Köpfe** (24 vs 16) → feinere Aufmerksamkeitsverteilung
3. **Bessere Prompt-Verarbeitung bei langen Prompts** (konsistente ~1000 tok/s)

### Empfehlungen:
- **Für Interaktivität / Chat:** Qwen3.6-35B-A3B ist deutlich überlegen (~3x schnellere Antwortzeiten)
- **Für lange Kontexte:** Qwen3.6-35B-A3B bei gleichem VRAM ~45% längerer Kontext möglich
- **Für maximale Qualität:** Qwen3.8-27B könnte bei komplexen Aufgaben besser sein (größerer Modell-Induktionsbereich)
- **Für Multi-User:** Qwen3.6-35B-A3B ermöglicht mehr parallele Sessions bei gleichem VRAM

---

*Generiert aus: Example14/llama-server.log*  
*llama.cpp build: d9e03f107 | CUDA 12 | RTX 3090 (24 GB)*
---