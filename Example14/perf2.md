# Performance-Vergleich — Example14: Qwen3.8-27B vs Qwen3.6-35B-A3B

## Hardware & System

| Parameter | Wert |
|-----------|------|
| **GPU** | NVIDIA GeForce RTX 3090 (24 GiB) |
| **CUDA** | 12.9 |
| **cuBLAS** | 12.901 |
| **CPU** | AMD Ryzen 9 5950X 16-Core Processor |
| **llama-server Build** | 10963 (d9e03f107) |
| **Speculative Decoding** | draft-mtp (n_max=4, draft-p-min=0.75) |
| **Reasoning Format** | deepseek |
| **Reasoning Effort** | xhigh |

---

## Modell-Übersicht

| Eigenschaft | Model 1: Qwen3.8-27B | Model 2: Qwen3.6-35B-A3B |
|-------------|----------------------|--------------------------|
| **Vollständiger Name** | Qwen3.8-27B-UD-Q5_K_S | Qwen3.6-35B-A3B-UD-IQ4_NL |
| **Architektur** | qwen35 (Dense) | qwen35moe (Mixture-of-Experts) |
| **Gesamt-Parameter** | 27,32 B | 35,51 B |
| **Aktiv genutzte Parameter** | 27,32 B (alle) | 3 B (8 von 256 Experts) |
| **Layers** | 65 (64 repeating + 1) | 41 (40 repeating + 1) |
| **Embedding-Dimension** | 5120 | 2048 |
| **Attention Heads** | 24 | 16 |
| **KV Heads** | 4 | 2 |
| **GQA Ratio** | 6 | 8 |
| **FF-Dimension** | 17408 | 512 (Expert FF) |
| **Expert Count** | 0 (kein MoE) | 256 |
| **Aktive Experts** | — | 8 |
| **Quantisierung** | Q5_K_S | IQ4_NL |
| **Bits per Weight** | 5,46 BPW | 4,17 BPW |
| **Dateigröße** | 17,37 GiB | 17,25 GiB |
| **Context-Größe** | 90.000 | 131.072 |
| **KV Cache (K/V)** | q8_0 / q4_0 | q8_0 / q8_0 |
| **GPU-Layers** | 99 (alle) | 99 (alle) |

---

## Performance-Vergleich

### Zusammenfassung

| Metrik | Model 1: Qwen3.8-27B | Model 2: Qwen3.6-35B-A3B | Faktor |
|--------|----------------------|--------------------------|--------|
| **Anzahl Requests** | 4 | 26 | 6,5× mehr |
| **Gesamtzeit** | 334,23 s | 83,88 s | 3,98× schneller |
| **Gesamt-Tokens** | 31.570 | 52.546 | 1,66× mehr |
| **Avg Gen Throughput** | 53,62 t/s | 166,55 t/s | **3,11× schneller** |
| **Avg Prompt Throughput** | 1.004,17 t/s | 2.220,25 t/s | **2,21× schneller** |
| **Avg Draft Acceptance** | 89,74 % | 97,20 % | **+7,46 %** |
| **Mean Draft Length** | 3,58 | 4,22 | **+17,9 %** |
| **Avg Tokens/Request** | 7.893 | 2.021 | 3,9× weniger |
| **Avg Time/Request** | 83,56 s | 3,23 s | 25,9× schneller |

---

## Detaillierter Vergleich

### 1. Generierungsgeschwindigkeit (Throughput)

| Request | Model 1 Gen (t/s) | Model 2 Gen (t/s) | Vorteil |
|---------|-------------------|-------------------|---------|
| **Task 0 (cold start)** | 55,82 | 119,71 | **2,15×** |
| **Task 790** | 56,53 | — | — |
| **Task 1056** | 50,23 | — | — |
| **Task 3552** | 55,84 | — | — |
| **Task 138** | — | 190,22 | — |
| **Task 512** | — | 162,78 | — |
| **Task 532** | — | 191,62 | — |
| **Task 678** | — | 159,58 | — |
| **Task 731** | — | 177,60 | — |
| **Task 1694** | — | 127,49 | — |
| **Task 2623** | — | 139,85 | — |
| **Durchschnitt** | **53,62** | **166,55** | **3,11×** |

**Analyse:** Model 2 erreicht mit ~166,55 tokens/s eine ~3-fach höhere Generierungsgeschwindigkeit. Dies liegt primär an:
- **IQ4_NL Quantisierung** (4,17 BPW) vs **Q5_K_S** (5,46 BPW) → weniger Daten müssen von GPU nach CPU transferiert werden
- **Mixture-of-Experts Architektur** → nur 3B von 35B Parametern sind pro Token aktiv
- **Kleinere Embedding-Dimension** (2048 vs 5120) → geringere Rechenlast pro Layer

### 2. Prompt-Verarbeitung

| Request | Model 1 Prompt (t/s) | Model 2 Prompt (t/s) |
|---------|---------------------|---------------------|
| **Task 0** | 1.053,63 | 3.008,90 |
| **Task 790** | 1.046,27 | — |
| **Task 1056** | 997,08 | — |
| **Task 3552** | 909,54 | — |
| **Task 138** | — | 414,97 |
| **Task 512** | — | 2.225,83 |
| **Task 532** | — | 410,42 |
| **Task 678** | — | 477,99 |
| **Task 731** | — | 412,08 |
| **Task 1694** | — | 1.831,66 |
| **Task 2623** | — | 1.334,59 |
| **Durchschnitt** | **1.004,17** | **2.220,25** |

**Analyse:** Model 2 verarbeitet Prompts ~2,2× schneller. Der kalte Start (Task 0) zeigt den größten Unterschied (3×), da das Modell noch nicht im Cache ist. Bei warmen Kontexten (Task 512, 2.225 t/s) profitiert Model 2 stark vom Prompt-Caching.

### 3. Speculative Decoding Effizienz

| Metrik | Model 1 | Model 2 |
|--------|---------|---------|
| **Avg Draft Acceptance** | 89,74 % | 97,20 % |
| **Mean Draft Length** | 3,58 | 4,22 |
| **Acceptance Range** | 87,69 % – 90,19 % | 91,67 % – 100,00 % |
| **Acc Rate per Position** | (0,980, 0,656, 0,474, 0,337) | (0,989, 0,893, 0,795, 0,720) |

**Analyse:** Model 2 zeigt deutlich bessere speculative decoding Ergebnisse:
- **Höhere Acceptance-Rate** (97,20 % vs 89,74 %) → das Draft-Modell trifft häufiger die richtige Vorhersage
- **Längere durchschnittliche Draft-Länge** (4,22 vs 3,58) → mehr Tokens werden pro Schritt generiert
- **Bessere Acceptance-Rate pro Position** → über alle 4 Draft-Positionen hinweg ist Model 2 konsistent besser
- **Zwei perfekte Requests** (Task 2011, Task 2261) mit 100 % Acceptance bei Model 2

### 4. Speichernutzung

| Metrik | Model 1 | Model 2 |
|--------|---------|---------|
| **Modell-Buffer (CUDA)** | 17.108,54 MiB | 17.151,70 MiB |
| **KV Cache (CUDA)** | 2.288,00 MiB | 1.360,00 MiB |
| **Recurrent State (CUDA)** | 748,12 MiB | 314,06 MiB |
| **Compute Buffer (CUDA)** | 688,30 MiB | 616,36 MiB |
| **CPU_Mapped Buffer** | 682,03 MiB | 515,31 MiB |
| **Gesamt CUDA** | ~20.832 MiB | ~19.442 MiB |
| **Freier GPU-Speicher** | ~2.083 MiB | ~2.023 MiB |

**Analyse:** Trotz der größeren Architektur (35B vs 27B) verwendet Model 2 **weniger GPU-Speicher**:
- **IQ4_NL Quantisierung** ist effizienter als Q5_K_S
- **Kleinere Embedding-Dimension** (2048 vs 5120) reduziert KV-Cache um ~40 %
- **Mixture-of-Experts** → kleinere recurrent state (314 MiB vs 748 MiB, -58 %)
- Beide Modelle nutzen ~90 % der 24 GiB GPU

### 5. Kontext-Management

| Metrik | Model 1 | Model 2 |
|--------|---------|---------|
| **Max Context** | 90.000 Tokens | 131.072 Tokens |
| **Train Context** | 262.144 Tokens | 262.144 Tokens |
| **KV Cells** | 90.112 | 131.072 |
| **Layers im KV Cache** | 16 | 10 |
| **Prompt Cache Limit** | 8.192 MiB | 8.192 MiB |
| **Context Checkpoints** | 9 erstellt | 31 erstellt |
| **Graphs Reused (Task 0)** | 233 | 41 |
| **Graphs Reused (spät)** | 2.219 | 1.616 |

**Analyse:** Model 2 unterstützt einen ~46 % größeren Kontext (131.072 vs 90.000). Die höhere Anzahl an Context Checkpoints (31 vs 9) zeigt, dass Model 2 mehr Requests im selben Kontext bearbeitet und effizienter zwischen Checkpoints wechselt.

---

## Request-Statistiken im Detail

### Model 1: Qwen3.8-27B-UD-Q5_K_S (4 Requests)

| Task ID | Prompt Tokens | Gen Tokens | Total Time | Gen Throughput | Draft Acceptance |
|---------|--------------|------------|------------|----------------|------------------|
| 0 | 3.445 | 2.142 | 41,62 s | 55,82 t/s | 89,40 % |
| 790 | 4.564 | 757 | 17,74 s | 56,53 t/s | 91,68 % |
| 1056 | 3.316 | 6.465 | 132,02 s | 50,23 t/s | 87,69 % |
| 3552 | 3.093 | 7.788 | 142,85 s | 55,84 t/s | 90,19 % |

**Bemerkungen:**
- Längster Request (Task 3552): 142,85 s mit 10.881 Total-Tokens
- Task 1056 generiert die meisten Tokens (6.465) → niedrigste Throughput (50,23 t/s)
- Alle Requests verwenden reasoning (deepseek format)
- Graphs reused steigt von 233 → 2.219 (kontinuierliches Wachsen)
| **Threads** | 8 | 8 |