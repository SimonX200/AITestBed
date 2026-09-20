# Performance Report — Example14

## Session Overview

| Parameter | Value |
|-----------|-------|
| **Date** | 2025-09-20 |
| **Session Start** | 19:48:18 |
| **Session End** | 19:59:17 |
| **Duration** | ~11 Minuten |
| **llama-server Build** | 10963 (d9e03f107) |
| **GPU** | NVIDIA GeForce RTX 3090 (24.0 GiB) |
| **CUDA** | 12.9 |
| **cuBLAS** | 12.901 |
| **Threads** | 16 (Batch: 16) / 32 |
| **Speculative Decoding** | draft-mtp (n_max=4, draft-p-min=0.75) |
| **Reasoning Format** | deepseek |
| **Reasoning Effort** | xhigh |

---

## Model 1: Qwen3.8-27B-UD-Q5_K_S

| Parameter | Value |
|-----------|-------|
| **Model** | Qwen3.8-27B-UD-Q5_K_S |
| **Session** | 19:50:31 – 19:57:24 |
| **Requests** | 4 |
| **Total Time** | 334.23 s |
| **Total Tokens** | 31.570 |
| **Avg Prompt Throughput** | 1.004,17 tokens/s |
| **Avg Generation Throughput** | 53,62 tokens/s |
| **Avg Draft Acceptance** | 0.8974 |
| **Mean Draft Length** | 3,58 |

### Detailed Request Metrics

| Task ID | Prompt Tokens | Generated Tokens | Prompt Time | Eval Time | Total Time | Gen Throughput | Draft Acceptance |
|---------|---------------|------------------|-------------|-----------|------------|----------------|------------------|
| 0 | 3.445 | 2.142 | 3.270 s | 38.354 s | 41.624 s | 55,82 t/s | 0.89401 |
| 790 | 4.564 | 757 | 4.362 s | 13.373 s | 17.735 s | 56,53 t/s | 0.91682 |
| 1056 | 3.316 | 6.465 | 3.326 s | 128.690 s | 132.016 s | 50,23 t/s | 0.87688 |
| 3552 | 3.093 | 7.788 | 3.401 s | 139.453 s | 142.853 s | 55,84 t/s | 0.90191 |

### Key Observations

- **Longest request (Task 3552)**: 142.85 s total, 10.881 tokens — the largest request with extended reasoning
- **Fastest request (Task 790)**: 17.74 s total, 5.321 tokens — moderate reasoning
- **Draft acceptance range**: 0.877 – 0.902 (mean: 0.897)
- **Generation speed range**: 50,23 – 56,53 tokens/s (consistent across requests)
- **Graphs reused**: 233 (Task 0, cold start)

---

## Model 2: Qwen3.6-35B-A3B-UD-IQ4_NL

| Parameter | Value |
|-----------|-------|
| **Model** | Qwen3.6-35B-A3B-UD-IQ4_NL |
| **Session** | 19:57:24 – 19:59:17 |
| **Requests** | 26 |
| **Total Time** | 83.88 s |
| **Total Tokens** | 52.546 |
| **Avg Prompt Throughput** | 2.220,25 tokens/s |
| **Avg Generation Throughput** | 166,55 tokens/s |
| **Avg Draft Acceptance** | 0.9720 |
| **Mean Draft Length** | 4,22 |

### Detailed Request Metrics

| Task ID | Prompt Tokens | Generated Tokens | Prompt Time | Eval Time | Total Time | Gen Throughput | Draft Acceptance |
|---------|---------------|------------------|-------------|-----------|------------|----------------|------------------|
| 0 | 31.742 | 324 | 10.549 s | 2.698 s | 13.248 s | 119,71 t/s | 0.92991 |
| 138 | 57 | 1.657 | 0.137 s | 8.706 s | 8.843 s | 190,22 t/s | 0.98095 |
| 512 | 1.728 | 65 | 0.776 s | 0.393 s | 1.170 s | 162,78 t/s | 0.98039 |
| 532 | 57 | 666 | 0.139 s | 3.470 s | 3.609 s | 191,62 t/s | 0.99242 |
| 678 | 67 | 77 | 0.140 s | 0.476 s | 0.616 s | 159,58 t/s | 0.95161 |
| 700 | 463 | 99 | 0.533 s | 0.648 s | 1.181 s | 151,27 t/s | 0.95946 |
| 731 | 58 | 2.994 | 0.141 s | 16.853 s | 16.993 s | 177,60 t/s | 0.96992 |
| 1440 | 252 | 85 | 0.250 s | 0.709 s | 0.958 s | 118,53 t/s | 0.98182 |
| 1475 | 80 | 292 | 0.164 s | 1.534 s | 1.698 s | 189,64 t/s | 0.96596 |
| 1543 | 422 | 330 | 0.331 s | 1.765 s | 2.096 s | 186,38 t/s | 0.98099 |
| 1619 | 696 | 107 | 0.430 s | 0.797 s | 1.227 s | 132,99 t/s | 0.91667 |
| 1653 | 149 | 84 | 0.362 s | 0.534 s | 0.897 s | 155,36 t/s | 0.96970 |
| 1677 | 114 | 63 | 0.188 s | 0.364 s | 0.552 s | 170,34 t/s | 0.98039 |
| 1694 | 857 | 625 | 0.468 s | 4.895 s | 5.362 s | 127,49 t/s | 0.96867 |
| 1921 | 130 | 82 | 0.198 s | 0.579 s | 0.777 s | 139,90 t/s | 0.95312 |
| 1946 | 252 | 301 | 0.262 s | 1.536 s | 1.798 s | 195,31 t/s | 0.97959 |
| 2011 | 539 | 69 | 0.367 s | 0.412 s | 0.779 s | 165,01 t/s | 1.00000 |
| 2031 | 531 | 154 | 0.341 s | 1.041 s | 1.381 s | 147,03 t/s | 0.98198 |
| 2078 | 1.284 | 347 | 0.908 s | 2.391 s | 3.299 s | 144,69 t/s | 0.97287 |
| 2179 | 364 | 333 | 0.311 s | 1.850 s | 2.162 s | 179,43 t/s | 0.98444 |
| 2261 | 192 | 75 | 0.222 s | 0.509 s | 0.731 s | 145,39 t/s | 1.00000 |
| 2285 | 990 | 133 | 0.719 s | 0.931 s | 1.649 s | 141,85 t/s | 0.98947 |
| 2327 | 58 | 1.019 | 0.156 s | 5.693 s | 5.849 s | 178,81 t/s | 0.97423 |
| 2556 | 67 | 103 | 0.158 s | 0.831 s | 0.989 s | 122,77 t/s | 0.97222 |
| 2593 | 85 | 83 | 0.182 s | 0.666 s | 0.848 s | 123,13 t/s | 0.98276 |
| 2623 | 471 | 674 | 0.353 s | 4.812 s | 5.165 s | 139,85 t/s | 0.95229 |

### Key Observations

- **Fastest request (Task 1677)**: 0.55 s total, 177 tokens — minimal reasoning
- **Longest request (Task 731)**: 16.99 s total, 3.052 tokens — extended reasoning with 2.994 generated tokens
- **Draft acceptance range**: 0.917 – 1.000 (mean: 0.972) — significantly higher than Model 1
- **Generation speed range**: 118,53 – 195,31 tokens/s — ~3x faster than Model 1
- **Graphs reused**: 1.030 – 1.616 (warm model state)

---

## Comparative Summary

| Metric | Model 1 (Qwen3.8-27B) | Model 2 (Qwen3.6-35B-A3B) |
|--------|----------------------|---------------------------|
| **Quantization** | Q5_K_S | IQ4_NL |
| **Requests** | 4 | 26 |
| **Total Tokens** | 31.570 | 52.546 |
| **Avg Gen Throughput** | 53,62 t/s | 166,55 t/s |
| **Avg Prompt Throughput** | 1.004,17 t/s | 2.220,25 t/s |
| **Avg Draft Acceptance** | 0.8974 | 0.9720 |
| **Mean Draft Length** | 3,58 | 4,22 |

### Key Findings

1. **Generation Speed**: Model 2 (IQ4_NL) achieves ~3.1x higher generation throughput (166,55 vs 53,62 tokens/s) despite being a larger model architecture. This is attributed to the more efficient IQ4_NL quantization vs Q5_K_S.

2. **Draft Acceptance**: Model 2 shows significantly higher draft acceptance (97,20% vs 89,74%), indicating better alignment between the draft and target models in the MTP speculative decoding setup.

3. **Prompt Processing**: Model 2 processes prompts ~2.2x faster (2.220 vs 1.004 tokens/s), benefiting from both the more efficient quantization and larger batch capacity.

4. **Speculative Decoding Efficiency**: The higher draft acceptance rate and longer mean draft length (4,22 vs 3,58) in Model 2 result in substantially better speculative decoding efficiency.

5. **Memory**: Both models fit within the 24 GiB RTX 3090, with Model 2 (IQ4_NL) using less memory despite being a larger architecture (35B vs 27B).