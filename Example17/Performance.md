# Performance: Qwen3.6-35B-A3B-UD-IQ4_NL

**Hardware:** NVIDIA GeForce RTX 3090 (24 GB VRAM) | AMD Ryzen 9 5950X (16-Core)  
**Build:** llama.cpp d9e03f107 (CUDA 12, GCC 14.3.1)  
**Speculative Decoding:** draft-mtp (n_max=4, p_min=0.75)  
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
| **GPU-Layer** | 99 |
| **Batch-Size** | 4.096 |
| **CUDA0 Modell-Buffer** | ~17.15 GiB |
| **Threads** | 16 |

---

## Benchmark-Ergebnisse

| # | Prompt (Tok) | Gen (Tok) | Prompt Zeit | Prompt Rate | Gen Zeit | Gen Rate | Gesamt Zeit | Gesamt (Tok) | Draft Accept | Acc/Pos |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 5,067 | 267 | 1.70s | 2,985.62 tok/s | 1.73s | 153.44 tok/s | 3.43s | 5,334 | 0.973 | (1.000, 0.691, 0.529, 0.412) |
| 2 | 184 | 78 | 0.15s | 1,198.22 tok/s | 0.55s | 140.99 tok/s | 0.70s | 262 | 0.964 | (1.000, 0.750, 0.500, 0.450) |
| 3 | 40 | 2,324 | 0.08s | 471.21 tok/s | 13.80s | 168.39 tok/s | 13.88s | 2,364 | 0.944 | (0.974, 0.751, 0.591, 0.467) |
| 4 | 94 | 1,289 | 0.13s | 725.10 tok/s | 5.80s | 221.95 tok/s | 5.93s | 1,383 | 0.991 | (1.000, 0.992, 0.958, 0.928) |
| 5 | 67 | 1,090 | 0.11s | 612.73 tok/s | 4.85s | 224.54 tok/s | 4.96s | 1,157 | 0.992 | (0.996, 0.978, 0.960, 0.942) |
| 6 | 130 | 75 | 0.15s | 848.51 tok/s | 0.47s | 156.40 tok/s | 0.63s | 205 | 0.982 | (1.000, 0.944, 0.611, 0.556) |
| 7 | 69 | 97 | 0.12s | 583.44 tok/s | 0.65s | 147.13 tok/s | 0.77s | 166 | 0.971 | (1.000, 0.818, 0.682, 0.545) |
| 8 | 150 | 1,130 | 0.15s | 1,000.54 tok/s | 4.89s | 230.85 tok/s | 5.04s | 1,280 | 0.992 | (0.996, 0.970, 0.961, 0.940) |
| 9 | 1,205 | 330 | 0.49s | 2,436.94 tok/s | 2.05s | 160.57 tok/s | 2.54s | 1,535 | 0.954 | (1.000, 0.762, 0.548, 0.393) |
| 10 | 67 | 224 | 0.11s | 595.03 tok/s | 1.14s | 195.69 tok/s | 1.25s | 291 | 0.983 | (1.000, 0.939, 0.857, 0.694) |
| 11 | 69 | 145 | 0.12s | 553.58 tok/s | 0.92s | 157.23 tok/s | 1.04s | 214 | 0.937 | (1.000, 0.889, 0.583, 0.417) |
| 12 | 69 | 1,130 | 0.12s | 561.26 tok/s | 7.33s | 153.97 tok/s | 7.46s | 1,199 | 0.953 | (0.973, 0.727, 0.542, 0.391) |
| 13 | 1,201 | 409 | 0.52s | 2,294.58 tok/s | 2.75s | 148.19 tok/s | 3.28s | 1,610 | 0.928 | (0.963, 0.704, 0.537, 0.417) |
| 14 | 72 | 113 | 0.14s | 520.61 tok/s | 0.65s | 171.22 tok/s | 0.79s | 185 | 0.989 | (1.000, 0.960, 0.840, 0.720) |
| 15 | 215 | 73 | 0.42s | 512.74 tok/s | 0.44s | 162.10 tok/s | 0.86s | 288 | 0.966 | (1.000, 0.824, 0.765, 0.706) |
| 16 | 506 | 84 | 0.28s | 1,831.85 tok/s | 0.62s | 133.18 tok/s | 0.90s | 590 | 0.859 | (0.889, 0.889, 0.889, 0.722) |
| 17 | 214 | 96 | 0.20s | 1,076.80 tok/s | 0.76s | 124.23 tok/s | 0.96s | 310 | 0.954 | (0.957, 0.652, 0.565, 0.522) |
| 18 | 1,715 | 162 | 0.69s | 2,491.88 tok/s | 0.97s | 165.72 tok/s | 1.66s | 1,877 | 0.984 | (1.000, 1.000, 0.886, 0.686) |
| 19 | 244 | 163 | 0.23s | 1,054.81 tok/s | 0.92s | 176.54 tok/s | 1.15s | 407 | 0.977 | (1.000, 0.865, 0.784, 0.757) |
| 20 | 76 | 64 | 0.13s | 587.53 tok/s | 0.32s | 194.66 tok/s | 0.45s | 140 | 1.000 | (1.000, 1.000, 0.923, 0.846) |
| 21 | 112 | 3,342 | 0.18s | 610.31 tok/s | 18.88s | 176.96 tok/s | 19.06s | 3,454 | 0.960 | (0.986, 0.885, 0.768, 0.663) |
| 22 | 94 | 1,264 | 0.15s | 616.64 tok/s | 5.97s | 211.67 tok/s | 6.12s | 1,358 | 0.987 | (1.000, 0.985, 0.950, 0.912) |
| 23 | 69 | 64 | 0.13s | 525.42 tok/s | 0.34s | 185.87 tok/s | 0.47s | 133 | 1.000 | (1.000, 1.000, 0.857, 0.714) |
| 24 | 72 | 76 | 0.14s | 529.46 tok/s | 0.46s | 164.26 tok/s | 0.59s | 148 | 1.000 | (1.000, 0.833, 0.722, 0.722) |
| 25 | 138 | 1,844 | 0.18s | 774.46 tok/s | 8.49s | 217.05 tok/s | 8.67s | 1,982 | 0.997 | (1.000, 0.987, 0.973, 0.960) |
| 26 | 1,941 | 993 | 0.81s | 2,408.17 tok/s | 4.57s | 216.92 tok/s | 5.38s | 2,934 | 0.994 | (1.000, 0.985, 0.975, 0.975) |
| 27 | 130 | 84 | 0.17s | 745.75 tok/s | 0.54s | 154.06 tok/s | 0.71s | 214 | 0.939 | (0.950, 0.850, 0.750, 0.550) |
| 28 | 82 | 1,830 | 0.15s | 538.15 tok/s | 8.41s | 217.41 tok/s | 8.57s | 1,912 | 0.998 | (1.000, 0.995, 0.989, 0.984) |
| 29 | 1,927 | 72 | 0.82s | 2,336.95 tok/s | 0.52s | 137.45 tok/s | 1.34s | 1,999 | 1.000 | (1.000, 0.933, 0.800, 0.667) |
| 30 | 71 | 1,941 | 0.14s | 501.21 tok/s | 9.78s | 198.45 tok/s | 9.92s | 2,012 | 0.994 | (0.995, 0.985, 0.964, 0.954) |
| 31 | 2,071 | 79 | 0.94s | 2,211.49 tok/s | 0.52s | 150.11 tok/s | 1.46s | 2,150 | 0.952 | (0.947, 0.842, 0.684, 0.632) |
| 32 | 441 | 739 | 0.46s | 951.13 tok/s | 7.19s | 102.62 tok/s | 7.65s | 1,180 | 0.979 | (0.985, 0.479, 0.273, 0.165) |
| 33 | 234 | 236 | 0.24s | 981.90 tok/s | 1.59s | 147.90 tok/s | 1.83s | 470 | 0.970 | (0.981, 0.741, 0.648, 0.574) |
| 34 | 106 | 259 | 0.18s | 595.41 tok/s | 1.57s | 164.42 tok/s | 1.75s | 365 | 0.975 | (1.000, 0.897, 0.776, 0.724) |
| 35 | 113 | 413 | 0.18s | 627.07 tok/s | 3.46s | 119.11 tok/s | 3.64s | 526 | 0.941 | (0.981, 0.639, 0.454, 0.296) |
| 36 | 123 | 77 | 0.20s | 605.53 tok/s | 0.46s | 166.21 tok/s | 0.66s | 200 | 1.000 | (1.000, 0.889, 0.722, 0.722) |
| 37 | 542 | 190 | 0.50s | 1,082.48 tok/s | 1.38s | 136.65 tok/s | 1.88s | 732 | 0.964 | (1.000, 0.804, 0.587, 0.478) |
| 38 | 309 | 1,879 | 0.53s | 584.20 tok/s | 11.47s | 163.76 tok/s | 12.00s | 2,188 | 0.945 | (0.975, 0.855, 0.767, 0.654) |
| 39 | 116 | 104 | 0.18s | 633.86 tok/s | 0.80s | 128.53 tok/s | 0.98s | 220 | 0.973 | (1.000, 0.840, 0.640, 0.400) |
| 40 | 85 | 1,221 | 0.17s | 511.27 tok/s | 8.94s | 136.50 tok/s | 9.10s | 1,306 | 0.943 | (0.967, 0.769, 0.570, 0.450) |
| 41 | 111 | 1,286 | 0.20s | 556.52 tok/s | 10.31s | 124.60 tok/s | 10.51s | 1,397 | 0.901 | (0.962, 0.674, 0.484, 0.358) |
| 42 | 1,401 | 109 | 0.74s | 1,901.45 tok/s | 0.96s | 112.18 tok/s | 1.70s | 1,510 | 0.896 | (0.933, 0.600, 0.433, 0.333) |
| 43 | 61 | 693 | 0.15s | 411.35 tok/s | 4.96s | 139.64 tok/s | 5.10s | 754 | 0.947 | (0.983, 0.761, 0.568, 0.420) |
| 44 | 116 | 111 | 0.19s | 626.89 tok/s | 0.80s | 136.65 tok/s | 0.99s | 227 | 0.988 | (1.000, 0.846, 0.654, 0.538) |
| 45 | 82 | 84 | 0.16s | 499.27 tok/s | 0.62s | 133.58 tok/s | 0.79s | 166 | 0.952 | (1.000, 0.714, 0.619, 0.476) |
| 46 | 555 | 86 | 0.34s | 1,609.46 tok/s | 0.46s | 183.94 tok/s | 0.81s | 641 | 1.000 | (1.000, 1.000, 0.889, 0.889) |
| 47 | 280 | 144 | 0.63s | 446.54 tok/s | 1.18s | 121.37 tok/s | 1.81s | 424 | 1.000 | (1.000, 0.714, 0.514, 0.429) |
| 48 | 262 | 285 | 0.40s | 659.43 tok/s | 2.15s | 132.12 tok/s | 2.55s | 547 | 0.938 | (0.972, 0.778, 0.569, 0.417) |
| 49 | 669 | 422 | 0.54s | 1,249.85 tok/s | 3.42s | 122.97 tok/s | 3.96s | 1,091 | 0.929 | (0.965, 0.673, 0.451, 0.327) |

**Durchschnitt (Qwen3.6-35B-A3B-UD-IQ4_NL):**
- **Prompt Processing:** ~0.32s | ~1,005 tok/s (stark variierend, Cache-abhangig)
- **Generation Rate:** ~170.3 tok/s (gewichtet) / ~161.0 tok/s (arithmetisch)
- **Draft Acceptance Rate:** ~96.6%
- **Mean Draft Length:** ~4.14
- **Total Prompt Tokens:** 23,767
- **Total Gen Tokens:** 29,270

---

## Analyse

### Qwen3.6-35B-A3B-UD-IQ4_NL (Mixture-of-Experts)

1. **Hohe Generation Rate:** ~170 tok/s gewichtet trotz 35B Gesamtparametern
2. **Nur 3B aktiv** pro Token → effiziente MoE-Architektur
3. **Sehr hohe Draft-Acceptance-Rate** (96.6%) → exzellentes Speculative Decoding
4. **Lange durchschnittliche Draft-Länge** (4.14) → effiziente Token-Vorhersage
5. **Prompt-Rate stark variierend:** 471-2,986 tok/s (abhangig von Cache-Treffern)
6. **Prompt Cache effektiv:** Kurze Prompts (<200 Tok) in ~0.15s verarbeitet
7. **IQ4_NL Quantisierung** ermoglicht 192K Context bei 24GB VRAM

### Beobachtungen

- **Request 1** (5,067 Prompt-Tok): Erster Request nach Model-Load, langsame Prompt-Verarbeitung (1.70s), aber hohe Rate (2,986 tok/s)
- **Requests 2-8**: Cache-Treffer bei kurzen Prompts, Prompt-Rate 500-1,200 tok/s
- **Requests 9, 13, 18, 26, 29, 31**: Lange Prompts (1,200-2,071 Tok) mit Prompt-Raten 2,200-2,500 tok/s
- **Request 21** (3,342 Gen-Tok): Langste Generation (18.88s), aber konstante Rate (177 tok/s)
- **Requests 20, 23, 24, 36, 46, 47**: 100% Draft Acceptance → perfekte Speculative Decoding Treffer
- **Request 16**: Niedrigste Draft Acceptance (85.9%) → langste Positionen (4) am schwierigsten

### VRAM-Verteilung (geschatzt)

| Komponente | Grosse |
|---|---|
| **Modell-Buffer** | ~17.15 GiB |
| **KV-Buffer (192K)** | ~3.5 GiB |
| **Compute-Buffer** | ~0.6 GiB |
| **Prompt Cache** | 8.0 GiB (limit) |
| **Gesamt (ca.)** | ~21.5 GiB von 24 GiB |

---

*Generiert aus: Example17/llama-server.log*  
*llama.cpp build: d9e03f107 | CUDA 12 | RTX 3090 (24 GB)*
