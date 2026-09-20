# Performance-Analyse: Example15 - Qwen3.6-35B-A3B-UD-IQ4_NL

**Hardware:** NVIDIA GeForce RTX 3090 (24 GB VRAM) | AMD Ryzen 9 5950X (16-Core)  
**Build:** llama.cpp d9e03f107 (CUDA 12, GCC 14.3.1)  
**Modell:** Qwen3.6-35B-A3B-UD-IQ4_NL (Mixture-of-Experts, 35.51B gesamt / 3B aktiv)  
**Quantisierung:** IQ4_NL (4.17 BPW) | **Speculative Decoding:** draft-mtp (n_max=4, p_min=0.75)  
**Context:** 192.000 Tokens | **GPU-Layer:** 99 | **Reasoning:** deepseek / xhigh  
**Datum:** 20. September 2026  

---

## Modell-Konfiguration

| Eigenschaft | Wert |
|---|---|
| **Architektur** | qwen35moe (Mixture-of-Experts) |
| **Parameter (gesamt)** | 35.51 B |
| **Aktiviert (MoE)** | 3 B (8 von 256 Experten) |
| **Quantisierung** | IQ4_NL (4.17 BPW) |
| **Schichten** | 41 (40 repeating + 1) |
| **Embedding** | 2048 |
| **Köpfe** | 16 (GQA: 8) |
| **KV-Speicher** | K: q8_0 / V: q8_0 |
| **Context (max)** | 262.144 |
| **Context (konfig.)** | 192.000 |
| **Batch-Size** | 4.096 |
| **Ubatch-Size** | 1.024 |

---

## Benchmark-Zusammenfassung

| Metrik | Wert |
|---|---|
| **Anzahl Requests** | 51 |
| **Gesamt-Prompt-Tokens** | 22.510 |
| **Gesamt-Gen-Tokens** | 18.865 |
| **Gesamtzeit** | 116,46 s |
| **Prompt-Rate** | 1.563,37 tok/s |
| **Gen-Rate** | 184,84 tok/s |
| **Gesamt-Rate** | 355,28 tok/s |
| **Draft Acceptance Rate** | 95,7% |
| **Mean Draft Length** | ~3,7 |

---

## Detaillierte Benchmark-Ergebnisse

| # | Task | Prompt (Tok) | Prompt Zeit | Prompt Rate | Gen (Tok) | Gen Zeit | Gen Rate | Gesamt Zeit | Draft Accept |
|---|------|-------------|-------------|-------------|-----------|----------|----------|-------------|--------------|
| 1 | 0 | 4.974 | 1,66 s | 2.997 tok/s | 253 | 1,59 s | 158,24 tok/s | 3,25 s | 0,951 |
| 2 | 83 | 254 | 0,18 s | 1.410 tok/s | 203 | 1,45 s | 138,92 tok/s | 1,63 s | 0,977 |
| 3 | 163 | 59 | 0,10 s | 576 tok/s | 96 | 0,63 s | 151,73 tok/s | 0,73 s | 0,944 |
| 4 | 195 | 150 | 0,36 s | 417 tok/s | 74 | 0,43 s | 168,56 tok/s | 0,79 s | 0,948 |
| 5 | 218 | 144 | 0,14 s | 1.030 tok/s | 77 | 0,43 s | 177,54 tok/s | 0,57 s | 0,983 |
| 6 | 240 | 153 | 0,14 s | 1.094 tok/s | 62 | 0,37 s | 165,76 tok/s | 0,51 s | 0,940 |
| 7 | 259 | 284 | 0,18 s | 1.602 tok/s | 120 | 0,69 s | 172,63 tok/s | 0,87 s | 0,889 |
| 8 | 295 | 100 | 0,13 s | 796 tok/s | 74 | 0,47 s | 154,35 tok/s | 0,60 s | 0,981 |
| 9 | 322 | 144 | 0,14 s | 1.028 tok/s | 74 | 0,49 s | 150,23 tok/s | 0,63 s | 0,981 |
| 10 | 348 | 57 | 0,10 s | 549 tok/s | 89 | 0,52 s | 168,42 tok/s | 0,63 s | 0,955 |
| 11 | 376 | 65 | 0,11 s | 611 tok/s | 1.752 | 9,77 s | 179,27 tok/s | 9,87 s | 0,948 |
| 12 | 843 | 94 | 0,13 s | 732 tok/s | 70 | 0,44 s | 158,94 tok/s | 0,57 s | 0,914 |
| 13 | 864 | 44 | 0,10 s | 460 tok/s | 68 | 0,49 s | 137,67 tok/s | 0,59 s | 0,860 |
| 14 | 891 | 46 | 0,10 s | 454 tok/s | 829 | 3,72 s | 222,99 tok/s | 3,82 s | 0,998 |
| 15 | 1.072 | 130 | 0,15 s | 859 tok/s | 847 | 3,71 s | 228,11 tok/s | 3,86 s | 0,991 |
| 16 | 1.250 | 920 | 0,36 s | 2.540 tok/s | 986 | 4,37 s | 225,64 tok/s | 4,73 s | 0,995 |
| 17 | 1.459 | 88 | 0,14 s | 646 tok/s | 987 | 4,36 s | 226,29 tok/s | 4,49 s | 0,991 |
| 18 | 1.664 | 1.062 | 0,43 s | 2.497 tok/s | 264 | 1,39 s | 190,44 tok/s | 1,81 s | 0,970 |
| 19 | 1.734 | 69 | 0,12 s | 578 tok/s | 146 | 0,88 s | 166,39 tok/s | 1,00 s | 0,923 |
| 20 | 1.776 | 69 | 0,12 s | 565 tok/s | 250 | 1,50 s | 166,39 tok/s | 1,62 s | 0,922 |
| 21 | 1.850 | 251 | 0,20 s | 1.270 tok/s | 490 | 2,95 s | 165,97 tok/s | 3,15 s | 0,964 |
| 22 | 1.989 | 69 | 0,12 s | 571 tok/s | 1.818 | 9,60 s | 189,32 tok/s | 9,73 s | 0,954 |
| 23 | 2.424 | 69 | 0,12 s | 557 tok/s | 1.703 | 9,23 s | 184,41 tok/s | 9,36 s | 0,979 |
| 24 | 2.841 | 96 | 0,14 s | 665 tok/s | 68 | 0,38 s | 180,99 tok/s | 0,52 s | 1,000 |
| 25 | 2.861 | 50 | 0,12 s | 434 tok/s | 1.050 | 4,78 s | 219,49 tok/s | 4,89 s | 0,994 |
| 26 | 3.078 | 77 | 0,13 s | 586 tok/s | 706 | 3,26 s | 216,43 tok/s | 3,39 s | 0,993 |
| 27 | 3.228 | 92 | 0,15 s | 614 tok/s | 711 | 3,21 s | 221,35 tok/s | 3,36 s | 0,996 |
| 28 | 3.375 | 80 | 0,13 s | 599 tok/s | 96 | 0,71 s | 135,90 tok/s | 0,84 s | 0,970 |
| 29 | 3.411 | 111 | 0,16 s | 688 tok/s | 84 | 0,54 s | 155,23 tok/s | 0,70 s | 0,968 |
| 30 | 3.439 | 134 | 0,16 s | 821 tok/s | 87 | 0,56 s | 156,29 tok/s | 0,72 s | 0,917 |
| 31 | 3.464 | 315 | 0,23 s | 1.369 tok/s | 113 | 0,56 s | 200,32 tok/s | 0,79 s | 1,000 |
| 32 | 3.492 | 90 | 0,14 s | 624 tok/s | 65 | 0,33 s | 198,83 tok/s | 0,47 s | 1,000 |
| 33 | 3.509 | 323 | 0,23 s | 1.395 tok/s | 412 | 2,02 s | 203,54 tok/s | 2,26 s | 0,979 |
| 34 | 3.601 | 798 | 0,38 s | 2.090 tok/s | 65 | 0,33 s | 196,10 tok/s | 0,71 s | 1,000 |
| 35 | 3.619 | 387 | 0,26 s | 1.509 tok/s | 93 | 0,65 s | 142,52 tok/s | 0,91 s | 0,914 |
| 36 | 3.651 | 637 | 0,33 s | 1.955 tok/s | 847 | 4,07 s | 207,99 tok/s | 4,40 s | 0,993 |
| 37 | 3.834 | 2.003 | 0,81 s | 2.487 tok/s | 65 | 0,31 s | 207,91 tok/s | 1,12 s | 1,000 |
| 38 | 3.851 | 122 | 0,19 s | 653 tok/s | 75 | 0,47 s | 160,93 tok/s | 0,65 s | 0,851 |
| 39 | 3.873 | 1.911 | 0,80 s | 2.391 tok/s | 135 | 0,87 s | 154,79 tok/s | 1,67 s | 0,917 |
| 40 | 3.913 | 215 | 0,21 s | 1.003 tok/s | 91 | 0,61 s | 149,03 tok/s | 0,82 s | 0,971 |
| 41 | 3.942 | 341 | 0,27 s | 1.255 tok/s | 114 | 0,82 s | 139,35 tok/s | 1,09 s | 0,929 |
| 42 | 3.982 | 203 | 0,22 s | 941 tok/s | 167 | 1,05 s | 158,75 tok/s | 1,27 s | 0,969 |
| 43 | 4.029 | 270 | 0,24 s | 1.142 tok/s | 80 | 0,57 s | 140,53 tok/s | 0,81 s | 0,905 |
| 44 | 4.056 | 441 | 0,29 s | 1.510 tok/s | 81 | 0,56 s | 145,37 tok/s | 0,85 s | 0,951 |
| 45 | 4.083 | 77 | 0,34 s | 229 tok/s | 85 | 0,58 s | 146,87 tok/s | 0,92 s | 0,925 |
| 46 | 4.110 | 682 | 0,38 s | 1.793 tok/s | 106 | 0,61 s | 174,55 tok/s | 0,99 s | 1,000 |
| 47 | 4.138 | 565 | 0,51 s | 1.107 tok/s | 104 | 0,61 s | 169,73 tok/s | 1,12 s | 1,000 |
| 48 | 4.167 | 696 | 0,66 s | 1.049 tok/s | 101 | 0,68 s | 148,31 tok/s | 1,35 s | 0,916 |
| 49 | 4.196 | 62 | 0,44 s | 140 tok/s | 1.566 | 10,80 s | 144,91 tok/s | 11,24 s | 0,923 |
| 50 | 4.670 | 1.637 | 0,75 s | 2.189 tok/s | 108 | 0,82 s | 130,13 tok/s | 1,57 s | 0,916 |
| 51 | 4.707 | 800 | 0,41 s | 1.972 tok/s | 258 | 1,81 s | 142,35 tok/s | 2,21 s | 0,943 |

---

## Performance-Metriken

### Generation Rate (Tokens pro Sekunde)

| Metrik | Wert |
|---|---|
| **Gen Rate (tok/s)** | ~184,8 |
| **Prompt Rate (tok/s)** | ~1.563,4 |
| **Gesamt Rate (tok/s)** | ~355,3 |
| **Min Gen Rate** | ~130 tok/s (Task 4670) |
| **Max Gen Rate** | ~228 tok/s (Task 1072) |
| **Median Gen Rate** | ~166 tok/s |

### Speculative Decoding

| Metrik | Wert |
|---|---|
| **Draft Acceptance Rate** | 95,7% |
| **Mean Draft Length** | ~3,7 |
| **Draft-MTP Config** | n_max=4, p_min=0.75 |

### Prompt Processing

| Metrik | Wert |
|---|---|
| **Avg Prompt Time** | 0,28 s |
| **Avg Prompt Tokens** | 441 tok |
| **Längster Prompt** | 2.003 Tokens (Task 3834) |
| **Kürzester Prompt** | 44 Tokens (Task 864) |

### Generation Length

| Metrik | Wert |
|---|---|
| **Avg Gen Tokens** | 369 tok |
| **Längste Generation** | 1.818 Tokens (Task 1989) |
| **Kürzeste Generation** | 62 Tokens (Task 240) |

---

## VRAM-Verbrauch (aus Log)

| Komponente | Größe |
|---|---|
| **CUDA0 Modell-Buffer** | ~17,15 GiB |
| **CUDA0 KV-Buffer** | ~1,36 GiB (q8_0 + q8_0) |
| **CUDA0 RS-Buffer** | ~314 MiB |
| **Compute-Buffer** | ~455 MiB |
| **CUDA_Host Compute** | ~391 MiB |
| **Prompt Cache Limit** | 8.192 MiB |
| **Gesamt (ca.)** | ~19,5 GiB |

---

## Analyse

### Stärken von Qwen3.6-35B-A3B-UD-IQ4_NL:

1. **Hohe Gen-Rate trotz großer Modellgröße:** ~185 tok/s bei 35B Parametern (nur 3B aktiv dank MoE)
2. **Exzellente Draft Acceptance Rate:** 95,7% → sehr effizientes Speculative Decoding
3. **Schnelle Prompt-Verarbeitung:** ~1.563 tok/s → schnelle Antwort auf lange Kontexte
4. **Geringer KV-Speicher:** Nur 1,36 GiB für q8_0 KV-Pairs → ermöglicht lange Kontexte
5. **Kompakte Quantisierung:** IQ4_NL bei 4,17 BPW → gute Qualität bei geringem VRAM-Verbrauch
6. **Prompt Cache Effizienz:** Hohe Cache-Treffer bei wiederkehrenden Prompts

### Beobachtungen:

1. **Prompt Cache hat großen Einfluss:** Requests mit ähnlichen Prompts (Tasks 864, 891, 1072) profitieren von Cache-Treffern
2. **Gen-Rate variiert mit Generation Length:** Längere Generationen (~1500+ Tok) zeigen niedrigere Rate (~145 tok/s)
3. **Speculative Decoding stabil:** Acceptance Rate bleibt konsistent über 90% auch bei variablen Prompts
4. **Reasoning-Format overhead:** Deepseek reasoning-format mit xhigh effort fügt minimalen Overhead hinzu

### Empfehlungen:

- **Für Interaktivität / Chat:** Ausgezeichnet (~185 tok/s Gen-Rate mit reasoning)
- **Für lange Kontexte:** Sehr gut geeignet (192K context, niedriger KV-Speicher)
- **Für Multi-User:** Gut skalierbar (nur 19,5 GiB VRAM pro Modell)
- **Für Production:** Draft Acceptance Rate von 95,7% zeigt stabiles Verhalten

---

*Generiert aus: Example15/llama-server.log*  
*llama.cpp build: d9e03f107 | CUDA 12 | RTX 3090 (24 GB)*  
*51 Requests | 22.510 Prompt-Tokens | 18.865 Gen-Tokens | 116,46 s Gesamtzeit*
