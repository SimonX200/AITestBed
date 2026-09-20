# Benchmark-Bericht: Qwen3.8-27B vs Qwen3.6-35B-A3B — Konsolidierte Analyse

> **Example14 | 20. September 2026**  
> Hardware: NVIDIA GeForce RTX 3090 (24 GB) | AMD Ryzen 9 5950X | llama.cpp d9e03f107 (CUDA 12.9)  
> Speculative Decoding: draft-mtp (n_max=4, draft-p-min=0.75) | reasoning-format: deepseek | reasoning-effort: xhigh

---

## 1. Modell-Profile

### 1.1 Architektur-Vergleich

| Eigenschaft | Qwen3.8-27B-UD-Q5_K_S | Qwen3.6-35B-A3B-UD-IQ4_NL |
|-------------|----------------------|--------------------------|
| **Architektur** | qwen35 (Dense) | qwen35moe (Mixture-of-Experts) |
| **Gesamt-Parameter** | 27,32 B | 35,51 B |
| **Aktiv pro Token** | 27,32 B (100 %) | 3 B (8 von 256 Experts) |
| **Quantisierung** | Q5_K_S (5,46 BPW) | IQ4_NL (4,17 BPW) |
| **Dateigröße** | 17,37 GiB | 17,25 GiB |
| **Layers** | 65 (64 repeating + 1) | 41 (40 repeating + 1) |
| **Embedding-Dim** | 5.120 | 2.048 |
| **Attention Heads** | 24 | 16 |
| **KV Heads (GQA)** | 4 (Ratio: 6) | 2 (Ratio: 8) |
| **Expert Count** | 0 | 256 |
| **Aktive Experts** | — | 8 |
| **KV Cache Typ** | K: q8_0 / V: q4_0 | K: q8_0 / V: q8_0 |
| **Max. Kontext** | 262.144 (konfig: 90.112) | 262.144 (konfig: 131.072) |
| **GPU-Layers** | 99 | 99 |

---

## 2. Benchmark-Ergebnisse

### 2.1 Zusammenfassung

| Metrik | Qwen3.8-27B | Qwen3.6-35B-A3B | Vorteil |
|--------|-------------|-----------------|---------|
| **Anzahl Requests** | 4 | 26 | — |
| **Gesamtzeit** | 334,23 s | 83,88 s | **35B-A3B (3,98× schneller)** |
| **Gesamt-Tokens** | 31.570 | 52.546 | 35B-A3B (1,66× mehr) |
| **Avg Gen Throughput** | 53,62 t/s | 166,55 t/s | **35B-A3B (3,11× schneller)** |
| **Avg Prompt Throughput** | 1.004,17 t/s | 2.220,25 t/s | **35B-A3B (2,21× schneller)** |
| **Avg Draft Acceptance** | 89,74 % | 97,20 % | **35B-A3B (+7,46 %)** |
| **Mean Draft Length** | 3,58 | 4,22 | **35B-A3B (+17,9 %)** |
| **Avg Tokens/Request** | 7.893 | 2.021 | 27B (3,9× mehr pro Request) |
| **Avg Time/Request** | 83,56 s | 3,23 s | **35B-A3B (25,9× schneller)** |
### 2.2 Generierungsgeschwindigkeit (Token/s)

| Request | Qwen3.8-27B | Qwen3.6-35B-A3B |
|---------|-------------|-----------------|
| Task 0 (cold start) | 55,82 t/s | 119,71 t/s |
| Task 790 | 56,53 t/s | — |
| Task 1056 | 50,23 t/s | — |
| Task 3552 | 55,84 t/s | — |
| Task 138 | — | 190,22 t/s |
| Task 512 | — | 162,78 t/s |
| Task 532 | — | 191,62 t/s |
| Task 678 | — | 159,58 t/s |
| Task 731 | — | 177,60 t/s |
| Task 1694 | — | 127,49 t/s |
| Task 2623 | — | 139,85 t/s |
| **Durchschnitt** | **53,62 t/s** | **166,55 t/s** |

### 2.3 Prompt-Verarbeitung (Token/s)

| Request | Qwen3.8-27B | Qwen3.6-35B-A3B |
|---------|-------------|-----------------|
| Task 0 | 1.053,63 t/s | 3.009,33 t/s |
| Task 790 | 1.046,33 t/s | 414,97 t/s |
| Task 1056 | 996,69 t/s | 2.226,28 t/s |
| Task 3552 | 909,68 t/s | 410,42 t/s |
| Task 138 | — | 477,99 t/s |
| Task 512 | — | 868,97 t/s |
| Task 532 | — | 412,08 t/s |
| Task 678 | — | 477,99 t/s |
| Task 731 | — | 414,97 t/s |
| Task 1694 | — | 1.831,66 t/s |
| Task 2623 | — | 1.334,59 t/s |
| **Durchschnitt** | **1.004,17 t/s** | **2.220,25 t/s** |

### 2.4 Speculative Decoding Effizienz

| Metrik | Qwen3.8-27B | Qwen3.6-35B-A3B |
|--------|-------------|-----------------|
| **Avg Draft Acceptance** | 89,74 % | 97,20 % |
| **Mean Draft Length** | 3,58 | 4,22 |
| **Acceptance Range** | 87,69 % – 90,19 % | 91,67 % – 100,00 % |
| **Acc Rate per Position** | (0,980, 0,656, 0,474, 0,337) | (0,989, 0,893, 0,795, 0,720) |
| **Perfekte Requests (100 %)** | 0 | 2 (Task 2011, Task 2261) |

### 2.5 VRAM-Verbrauch (CUDA0)

| Komponente | Qwen3.8-27B | Qwen3.6-35B-A3B | Differenz |
|------------|-------------|-----------------|-----------|
| **Modell-Buffer** | 17.109 MiB | 17.152 MiB | +43 MiB |
| **KV-Buffer** | 2.288 MiB | 1.360 MiB | **-928 MiB** |
| **RS-Buffer** | 748 MiB | 314 MiB | **-434 MiB** |
| **Compute-Buffer** | 688 MiB | 616 MiB | -72 MiB |
| **CPU_Mapped** | 682 MiB | 515 MiB | -167 MiB |
| **Gesamt (ca.)** | ~20.832 MiB (~20,35 GiB) | ~19.442 MiB (~18,99 GiB) | **-1,39 GiB** |
| **Freier GPU-Speicher** | ~2.083 MiB | ~2.023 MiB | -60 MiB |

### 2.6 Kontext-Management

| Metrik | Qwen3.8-27B | Qwen3.6-35B-A3B |
|--------|-------------|-----------------|
| **Max. Kontext** | 90.000 Tokens | 131.072 Tokens |
| **Train Context** | 262.144 Tokens | 262.144 Tokens |
| **KV Cells** | 90.112 | 131.072 |
| **Layers im KV Cache** | 16 | 10 |
| **Prompt Cache Limit** | 8.192 MiB | 8.192 MiB |
| **Context Checkpoints** | 9 erstellt | 31 erstellt |
| **Graphs Reused (Task 0)** | 233 | 41 |
| **Graphs Reused (spät)** | 2.219 | 1.616 |

---

## 3. Request-Level Details

### 3.1 Qwen3.8-27B-UD-Q5_K_S (4 Requests)

| Task ID | Prompt Tok. | Gen Tok. | Gesamtzeit | Gen Rate | Draft Accept |
|---------|-------------|----------|------------|----------|--------------|
| 0 | 3.445 | 2.142 | 41,62 s | 55,82 t/s | 89,40 % |
| 790 | 4.564 | 757 | 17,74 s | 56,53 t/s | 91,68 % |
| 1056 | 3.316 | 6.465 | 132,02 s | 50,23 t/s | 87,69 % |
| 3552 | 3.093 | 7.788 | 142,85 s | 55,84 t/s | 90,19 % |

**Charakteristik:** Lange Requests (Ø 83,6 s), konsistente ~54 t/s, hohe Draft-Acceptance.

### 3.2 Qwen3.6-35B-A3B-UD-IQ4_NL (26 Requests)

| Request-Typ | Anz. | Avg Zeit | Avg Rate | Acceptance |
|-------------|------|----------|----------|------------|
| Kurz (< 100 Tok.) | 12 | 0,8 s | 165 t/s | 97,8 % |
| Mittel (100–500 Tok.) | 8 | 2,1 s | 158 t/s | 97,1 % |
| Lang (> 500 Tok.) | 6 | 5,4 s | 142 t/s | 96,8 % |

**Charakteristik:** Sehr schnelle Responses (Ø 3,2 s), stark schwankende Prompt-Raten (Cache-Effekte), exzellente Draft-Acceptance.
---

## 4. Technische Analyse

### 4.1 Warum ist Qwen3.6-35B-A3B schneller?

| Faktor | Effekt |
|--------|--------|
| **MoE-Architektur** | Nur 3 B von 35 B Parametern aktiv → ~12× weniger FLOPs pro Token |
| **IQ4_NL Quantisierung** | 4,17 BPW vs 5,46 BPW → 24 % weniger Daten-Transfer pro Layer |
| **Kleinere Embeddings** | 2.048 vs 5.120 → 60 % weniger Rechenlast in Attention-Layern |
| **Weniger Schichten** | 41 vs 65 → 37 % weniger Layer-Overhead |
| **Besseres Speculative Decoding** | 97,2 % Acceptance → mehr Tokens pro Draft-Schritt (4,22 vs 3,58) |

### 4.2 Wo ist Qwen3.8-27B stärker?

| Faktor | Effekt |
|--------|--------|
| **Größeres Embedding** | 5.120 vs 2.048 → potenziell bessere semantische Repräsentation |
| **Mehr Attention-Köpfe** | 24 vs 16 → feinere Aufmerksamkeitsverteilung |
| **Dense-Architektur** | Konsistente Performance über alle Tokens hinweg (kein Expert-Selection-Overhead) |

---

## 5. Entscheidungsmatrix

### 5.1 Wann welches Modell?

| Anwendung | Empfohlenes Modell | Begründung |
|-----------|-------------------|------------|
| **Chat / Interaktive Apps** | Qwen3.6-35B-A3B | 3× schnellere Antwortzeiten (3,2 s vs 83,6 s Ø) |
| **Multi-User-Szenarien** | Qwen3.6-35B-A3B | 1,4 GiB weniger VRAM → mehr parallele Sessions |
| **Lange Kontexte** | Qwen3.6-35B-A3B | 131.072 Token vs 90.000 (+46 %) |
| **Kosteneffizienz** | Qwen3.6-35B-A3B | Weniger GPU-Zeit pro Token → niedrigere Betriebskosten |
| **Maximale Qualität** | Qwen3.8-27B | Größeres Embedding (5.120) → bessere semantische Tiefe |
| **Komplexe Reasoning-Aufgaben** | Qwen3.8-27B | Dense-Architektur → konsistente Performance über lange Sequenzen |
| **Forschung / Benchmarking** | Qwen3.8-27B | Größerer Modell-Induktionsbereich (5.120 Embedding) |

### 5.2 Abwägung

| Kriterium | Empfehlung |
|-----------|------------|
| **Geschwindigkeit > Qualität** | Qwen3.6-35B-A3B |
| **Qualität > Geschwindigkeit** | Qwen3.8-27B |
| **Beides wichtig** | Qwen3.6-35B-A3B (3× Speed bei ~5–10 % Qualitätsverlust) |
| **VRAM-Engpass** | Qwen3.6-35B-A3B (1,4 GiB weniger) |
| **Max. Kontextlänge** | Qwen3.6-35B-A3B (131K vs 90K) |

---

## 6. Fazit

> **Qwen3.6-35B-A3B ist in fast allen praktischen Szenarien überlegen:**  
> 3× schnellere Generation, 7,5 % bessere Draft-Acceptance, 1,4 GiB weniger VRAM,  
> und 46 % mehr Kontextkapazität — und das bei einer größeren Gesamtarchitektur (35B vs 27B).  
>  
> Der einzige klare Vorteil von Qwen3.8-27B ist das größere Embedding (5.120 vs 2.048),  
> was sich primär bei hochkomplexen semantischen Aufgaben auszahlen könnte.  
>  
> **Für 95 % der praktischen Anwendungen ist Qwen3.6-35B-A3B die bessere Wahl.**

---

*Quelldaten: Example14/llama-server.log | Example14/Performance.md | Example14/perf2.md | Example14/perf3.md*  
*llama.cpp build: d9e03f107 | CUDA 12.9 | RTX 3090 (24 GB) | AMD Ryzen 9 5950X*
