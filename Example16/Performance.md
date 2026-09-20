# Performance Report — Example16

## Session Overview

| Parameter | Value |
|-----------|-------|
| **Date** | 2025-09-20 |
| **Session Start** | 22:23:16 |
| **Session End** | 22:27:07 |
| **Duration** | ~3 Minuten 51 Sekunden |
| **llama-server Build** | 10963 (d9e03f107) |
| **GPU** | NVIDIA GeForce RTX 3090 (24.0 GiB) |
| **CUDA** | 12.9 |
| **cuBLAS** | 12.901 |
| **Model** | Qwen3.6-35B-A3B-UD-IQ4_NL |
| **Speculative Decoding** | draft-mtp (n_max=4, draft-p-min=0.75) |
| **Reasoning Format** | peg-native |

---

## Model: Qwen3.6-35B-A3B-UD-IQ4_NL

| Parameter | Value |
|-----------|-------|
| **Model** | Qwen3.6-35B-A3B-UD-IQ4_NL |
| **Session** | 22:23:35 – 22:27:07 |
| **Requests** | 46 |
| **Total Time** | 144.52 s (sum of all requests) |
| **Total Tokens** | 52,105 |
| **Total Prompt Tokens** | 31,864 |
| **Total Generated Tokens** | 20,241 |
| **Avg Prompt Throughput** | 1,210.65 tokens/s |
| **Avg Generation Throughput** | 164.20 tokens/s |
| **Avg Draft Acceptance** | 0.9570 |
| **Mean Draft Length** | 4.19 |
| **Total Graphs Reused** | 80,651 |

### Detailed Request Metrics

| Task ID | Prompt Tokens | Generated Tokens | Total Tokens | Prompt Time | Eval Time | Total Time | Gen Throughput | Draft Acceptance | Graphs Reused |
|---------|---------------|------------------|--------------|-------------|-----------|------------|----------------|------------------|---------------|
| 0 | 5,067 | 246 | 5,313 | 2092.62 ms | 1613.69 ms | 3706.31 ms | 0.00 t/s | 0.93370 | 25 |
| 84 | 595 | 113 | 708 | 299.85 ms | 563.35 ms | 863.20 ms | 0.00 t/s | 0.97727 | 43 |
| 115 | 441 | 327 | 768 | 219.56 ms | 2471.21 ms | 2690.77 ms | 0.00 t/s | 0.91549 | 84 |
| 251 | 40 | 2,185 | 2,225 | 89.79 ms | 13381.81 ms | 13471.60 ms | 162.85 t/s | 0.94031 | 313 |
| 912 | 93 | 1,126 | 1,219 | 129.42 ms | 4905.40 ms | 5034.82 ms | 228.65 t/s | 0.99776 | 516 |
| 1148 | 132 | 71 | 203 | 150.65 ms | 443.88 ms | 594.54 ms | 0.00 t/s | 0.98113 | 526 |
| 1171 | 141 | 1,159 | 1,300 | 142.64 ms | 5178.94 ms | 5321.58 ms | 214.45 t/s | 0.99346 | 747 |
| 1422 | 1,234 | 985 | 2,219 | 601.25 ms | 4441.12 ms | 5042.37 ms | 225.55 t/s | 0.98983 | 926 |
| 1633 | 1,078 | 984 | 2,062 | 543.57 ms | 4361.88 ms | 4905.45 ms | 226.46 t/s | 0.98987 | 1,115 |
| 1840 | 1,061 | 1,055 | 2,116 | 532.51 ms | 7082.40 ms | 7614.91 ms | 149.31 t/s | 0.93943 | 1,211 |
| 2171 | 173 | 567 | 740 | 162.19 ms | 3728.10 ms | 3890.29 ms | 145.34 t/s | 0.94245 | 1,280 |
| 2349 | 180 | 409 | 589 | 176.89 ms | 2605.14 ms | 2782.03 ms | 0.00 t/s | 0.93791 | 1,324 |
| 2475 | 206 | 1,365 | 1,571 | 192.82 ms | 8043.67 ms | 8236.49 ms | 171.53 t/s | 0.94107 | 1,477 |
| 2838 | 167 | 1,542 | 1,709 | 177.55 ms | 8730.84 ms | 8908.39 ms | 165.27 t/s | 0.94963 | 1,675 |
| 3234 | 172 | 107 | 279 | 180.72 ms | 673.15 ms | 853.87 ms | 0.00 t/s | 0.90909 | 1,691 |
| 3265 | 420 | 65 | 485 | 253.35 ms | 382.37 ms | 635.73 ms | 0.00 t/s | 0.98039 | 1,702 |
| 3284 | 586 | 391 | 977 | 355.12 ms | 1971.07 ms | 2326.19 ms | 0.00 t/s | 0.98382 | 1,766 |
| 3376 | 179 | 67 | 246 | 186.02 ms | 389.82 ms | 575.84 ms | 0.00 t/s | 0.96296 | 1,774 |
| 3395 | 592 | 92 | 684 | 360.83 ms | 662.35 ms | 1023.18 ms | 0.00 t/s | 0.96875 | 1,788 |
| 3430 | 2,905 | 469 | 3,374 | 1381.24 ms | 2481.72 ms | 3862.97 ms | 0.00 t/s | 0.98599 | 1,866 |
| 3550 | 618 | 64 | 682 | 395.68 ms | 369.45 ms | 765.13 ms | 0.00 t/s | 0.96154 | 1,876 |
| 3569 | 173 | 68 | 241 | 186.75 ms | 388.69 ms | 575.44 ms | 0.00 t/s | 0.94737 | 1,885 |
| 3587 | 390 | 255 | 645 | 267.99 ms | 2225.87 ms | 2493.86 ms | 0.00 t/s | 0.92105 | 1,935 |
| 3706 | 234 | 67 | 301 | 221.20 ms | 319.07 ms | 540.27 ms | 0.00 t/s | 1.00000 | 1,947 |
| 3723 | 5,741 | 86 | 5,827 | 2952.55 ms | 564.38 ms | 3516.93 ms | 0.00 t/s | 0.96875 | 1,962 |
| 3753 | 227 | 250 | 477 | 220.85 ms | 1355.95 ms | 1576.80 ms | 0.00 t/s | 0.96552 | 2,001 |
| 3811 | 188 | 67 | 255 | 211.87 ms | 362.60 ms | 574.47 ms | 0.00 t/s | 0.96429 | 2,014 |
| 3828 | 844 | 120 | 964 | 704.85 ms | 959.07 ms | 1663.91 ms | 0.00 t/s | 0.89773 | 2,032 |
| 3874 | 490 | 129 | 619 | 332.25 ms | 761.50 ms | 1093.75 ms | 0.00 t/s | 0.98020 | 2,050 |
| 3908 | 106 | 106 | 212 | 177.61 ms | 552.34 ms | 729.95 ms | 0.00 t/s | 0.95402 | 2,068 |
| 3933 | 218 | 105 | 323 | 245.55 ms | 543.66 ms | 789.21 ms | 0.00 t/s | 0.96471 | 2,086 |
| 3958 | 217 | 67 | 284 | 244.00 ms | 357.41 ms | 601.41 ms | 0.00 t/s | 0.96429 | 2,099 |
| 3975 | 68 | 322 | 390 | 483.20 ms | 3068.42 ms | 3551.62 ms | 105.94 t/s | 0.93407 | 2,146 |
| 4131 | 271 | 592 | 863 | 263.75 ms | 3790.07 ms | 4053.81 ms | 145.41 t/s | 0.98161 | 2,227 |
| 4298 | 1,293 | 71 | 1,364 | 751.47 ms | 416.97 ms | 1168.43 ms | 0.00 t/s | 0.96552 | 2,238 |
| 4318 | 390 | 99 | 489 | 548.81 ms | 726.96 ms | 1275.78 ms | 0.00 t/s | 0.93243 | 2,249 |
| 4352 | 86 | 73 | 159 | 167.50 ms | 430.03 ms | 597.53 ms | 0.00 t/s | 0.96610 | 2,260 |
| 4372 | 1,184 | 1,544 | 2,728 | 957.45 ms | 10622.13 ms | 11579.58 ms | 146.78 t/s | 0.95490 | 2,435 |
| 4820 | 1,714 | 1,229 | 2,943 | 974.74 ms | 9480.68 ms | 10455.41 ms | 130.01 t/s | 0.91805 | 2,578 |
| 5225 | 164 | 103 | 267 | 193.00 ms | 933.78 ms | 1126.78 ms | 0.00 t/s | 0.94286 | 2,591 |
| 5266 | 100 | 84 | 184 | 182.86 ms | 674.52 ms | 857.38 ms | 0.00 t/s | 0.96610 | 2,603 |
| 5297 | 40 | 679 | 719 | 129.77 ms | 5017.96 ms | 5147.73 ms | 130.51 t/s | 0.94165 | 2,672 |
| 5512 | 163 | 171 | 334 | 200.73 ms | 1151.85 ms | 1352.58 ms | 0.00 t/s | 0.97619 | 2,689 |
| 5562 | 479 | 111 | 590 | 334.18 ms | 805.93 ms | 1140.11 ms | 0.00 t/s | 0.97500 | 2,700 |
| 5599 | 704 | 87 | 791 | 639.23 ms | 840.69 ms | 1479.92 ms | 0.00 t/s | 0.92727 | 2,712 |
| 5640 | 300 | 367 | 667 | 274.46 ms | 3200.42 ms | 3474.88 ms | 114.95 t/s | 0.93227 | 2,747 |

### Key Observations

- **Fastest request (Task 3706)**: 540.27 ms total, 301 tokens — minimal prompt (234 tokens) with perfect draft acceptance (1.00000)
- **Slowest request (Task 251)**: 13,471.60 ms total, 2,225 tokens — large reasoning output (2,185 generated tokens) with extended generation time of 13,381.81 ms
- **Largest prompt (Task 3723)**: 5,741 prompt tokens processed in 2,952.55 ms — the longest context window usage
- **Most generated tokens (Task 251)**: 2,185 generated tokens — longest reasoning chain
- **Highest generation throughput (Task 912)**: 228.65 tokens/s — short response (1,126 tokens) with excellent draft acceptance (0.998)
- **Lowest generation throughput (Task 3975)**: 105.94 tokens/s — low draft acceptance (0.934) with poor draft alignment
- **Draft acceptance range**: 0.898 – 1.000 (mean: 0.9570) — strong speculative decoding performance
- **Generation speed range**: 105.94 – 228.65 tokens/s — consistent with IQ4_NL quantization on RTX 3090
- **Graphs reused**: 25 – 2,747 — warm model state after initial cold start (Task 0)
- **Mean draft length**: 4.19 — effective MTP speculative decoding with good draft quality
- **Session throughput**: ~144.52 s cumulative processing time across 46 requests, averaging 3.14 s per request

---

## Performance Analysis

### Speculative Decoding (draft-mtp)

The draft-mtp speculative decoding configuration shows strong performance:

| Metric | Value |
|--------|-------|
| **Avg Draft Acceptance Rate** | 95.70% |
| **Mean Draft Length** | 4.19 |
| **Best Acceptance** | 100.00% (Task 3706) |
| **Worst Acceptance** | 89.77% (Task 3828) |

The high draft acceptance rate (~96%) indicates excellent alignment between the draft and target models. With a mean draft length of 4.19, each speculative step accepts approximately 4 tokens on average, significantly reducing generation time compared to non-speculative decoding.

### Generation Throughput

| Metric | Value |
|--------|-------|
| **Average** | 164.20 tokens/s |
| **Minimum** | 105.94 tokens/s |
| **Maximum** | 228.65 tokens/s |
| **Median** | ~155 tokens/s |

The generation throughput is consistent across requests, with variations primarily driven by draft acceptance rates and response length. Shorter responses benefit from higher draft acceptance, while longer responses show more variance.

### Prompt Processing

| Metric | Value |
|--------|-------|
| **Average** | 1,210.65 tokens/s |
| **Minimum** | 140.73 tokens/s (Task 3975, 68 tokens) |
| **Maximum** | 2,421.37 tokens/s (Task 0, 5,067 tokens) |

Prompt processing throughput is highly variable. Large prompts (5,000+ tokens) achieve ~2,000 tokens/s, while very small prompts (under 100 tokens) suffer from overhead and achieve as low as 140 tokens/s. This is expected behavior due to fixed per-request overhead in the llama-server.

### Model Characteristics

- **Architecture**: Qwen3.6-35B-A3B (MoE with 35B total, 3B active parameters)
- **Quantization**: IQ4_NL — highly efficient 4-bit quantization optimized for throughput
- **GPU**: NVIDIA GeForce RTX 3090 (24 GiB VRAM)
- **Speculative Decoding**: draft-mtp with n_max=4, draft-p-min=0.75
- **Reasoning Format**: peg-native

The IQ4_NL quantization enables the model to achieve ~164 tokens/s generation throughput while maintaining high quality, demonstrating the effectiveness of modern quantization techniques for large language models on consumer GPUs.

---

## Cross-Example Performance Comparison: Example15 vs Example16

Beide Examples verwenden dasselbe Modell (Qwen3.6-35B-A3B-UD-IQ4_NL) auf derselben Hardware (RTX 3090, 24 GB VRAM, CUDA 12). Der Hauptunterschied liegt in der Anzahl und Art der Requests.

### Benchmark-Zusammenfassung im Vergleich

| Metrik | Example15 | Example16 | Unterschied |
|--------|-----------|-----------|-------------|
| **Anzahl Requests** | 51 | 46 | -5 (-9.8%) |
| **Gesamt-Prompt-Tokens** | 22.510 | 31.864 | +9.354 (+41.6%) |
| **Gesamt-Gen-Tokens** | 18.865 | 20.241 | +1.376 (+7.3%) |
| **Gesamtzeit (kumuliert)** | 116,46 s | 144,52 s | +28,06 s (+24.1%) |
| **Ø Prompt-Tokens/Request** | 441 | 693 | +252 (+57.1%) |
| **Ø Gen-Tokens/Request** | 370 | 440 | +70 (+18.9%) |
| **Ø Gesamtzeit/Request** | 2.283 s | 3.142 s | +859 ms (+37.6%) |
| **Prompt-Rate** | 1.119 tok/s | 1.211 tok/s | +92 tok/s (+8,2%) |
| **Gen-Rate** | 172 tok/s | 162 tok/s | -10 tok/s (-5,8%) |
| **Draft Acceptance Rate** | 95,68% | 95,70% | +0,02% (≈ gleich) |
| **Mean Draft Length** | 4,27 | 4,19 | -0,08 (≈ gleich) |
| **Graphs Reused (gesamt)** | 80.852 | 80.651 | -201 (≈ gleich) |

### Detail-Vergleich: Extremwerte

| Metrik | Example15 | Example16 |
|--------|-----------|-----------|
| **Schnellster Request** | 470,93 ms (Task 3492) | 540,27 ms (Task 3706) |
| **Langsamster Request** | 11.243,24 ms (Task 4196) | 13.471,60 ms (Task 251) |
| **Beste Gen-Rate** | 228,1 tok/s (Task 1072) | 229,5 tok/s (Task 912) |
| **Schlechteste Gen-Rate** | 131,3 tok/s (Task 4670) | 103,5 tok/s (Task 5599) |
| **Beste Prompt-Rate** | 2.997 tok/s (Task 0) | 2.421 tok/s (Task 0) |
| **Schlechteste Prompt-Rate** | 140 tok/s (Task 4196) | 141 tok/s (Task 3975) |
| **Draft Acceptance Range** | 0,8508 – 1,0000 | 0,8977 – 1,0000 |

### Analyse des Vergleichs

#### 1. Prompt-Verarbeitung: Beispiel16 leicht schneller

Die Prompt-Rate ist in Example16 mit ~1.211 tok/s leicht höher als in Example15 mit ~1.119 tok/s (+8,2%). Dies zeigt, dass die Prompt-Verarbeitung in Example16 sogar etwas effizienter war. Die durchschnittliche Prompt-Größe ist in Example16 um 57% höher (693 vs. 441 Tokens), was auf komplexere/kontextreichere Anfragen hindeutet.

#### 2. Generation Throughput: Leichter Rückgang in Example16

Die Gen-Rate sinkt von 172 tok/s (Example15) auf 162 tok/s (Example16) — ein Rückgang von 5,8%. Dies lässt sich durch folgende Faktoren erklären:

- **Längere Average Generation**: Example16 generiert im Durchschnitt 440 Tokens vs. 370 Tokens in Example15 (+18,9%). Längere Generationen zeigen tendenziell niedrigere Durchsatzraten.
- **Schlechteste Gen-Rate**: Die schlechteste Gen-Rate in Example16 (103,5 tok/s) ist deutlich niedriger als in Example15 (131,3 tok/s), was auf stärkere Schwankungen bei längeren Generationen hindeutet.
- **Beste Gen-Rate**: Die beste Gen-Rate ist nahezu identisch (228,1 vs. 229,5 tok/s), was die Hardware-Grenze bestätigt.

#### 3. Speculative Decoding: Stabil über beide Examples hinweg

Die Draft Acceptance Rate bleibt mit 95,68% (Example15) vs. 95,70% (Example16) praktisch identisch. Auch der Mean Draft Length (4,27 vs. 4,19) zeigt keine signifikanten Unterschiede. Dies bestätigt, dass das Speculative Decoding (draft-mtp, n_max=4, p_min=0.75) extrem stabil und konsistent arbeitet.

Der Draft Acceptance Range ist in Example16 enger (0,8977 – 1,0000 vs. 0,8508 – 1,0000), was auf etwas stabilere Bedingungen in Example16 hindeutet.

#### 4. Graph Reuse: Identisch

Beide Examples erreichen ~80.650 – 80.850 graphs reused, was die Effizienz des CUDA-Graph-Caching bestätigt. Dieser Wert ist modell- und hardwareabhängig und nicht request-spezifisch.

#### 5. Skalierbarkeit mit Prompt-Größe

Example16 verarbeitet 41,6% mehr Prompt-Tokens bei 9,8% weniger Requests. Die durchschnittliche Prompt-Größe ist um 57% höher. Dies zeigt, dass das System gut mit größeren Kontexten umgehen kann, ohne dass die Prompt-Verarbeitungsrate signifikant leidet.

### Fazit

| Aspekt | Bewertung |
|--------|-----------|
| **Prompt-Verarbeitung** | ✅ Beispiel16 leicht schneller (+8,2%) |
| **Generation Throughput** | ⚠️ Leichter Rückgang (-5,8%) bei längeren Generationen |
| **Speculative Decoding** | ✅ Exzellent und stabil (~95,7% acceptance) |
| **Konsistenz** | ✅ Sehr konsistent über beide Examples hinweg |
| **Skalierbarkeit** | ✅ Gute Skalierbarkeit mit größeren Prompts |

Beide Examples zeigen, dass Qwen3.6-35B-A3B-UD-IQ4_NL auf einer RTX 3090 eine zuverlässige und konsistente Performance bietet. Die leichte Abnahme der Gen-Rate in Example16 ist erwartungsgemäß und durch längere Generationen erklärbar. Das Speculative Decoding arbeitet in beiden Cases exzellent mit ~96% Acceptance Rate.

---

*Generiert aus: Example15/llama-server.log & Example16/llama-server.log*  
*llama.cpp build: d9e03f107 | CUDA 12 | RTX 3090 (24 GB)*  
*Example15: 51 Requests | 22.510 Prompt-Tokens | 18.865 Gen-Tokens | 116,46 s*  
*Example16: 46 Requests | 31.864 Prompt-Tokens | 20.241 Gen-Tokens | 144,52 s*
