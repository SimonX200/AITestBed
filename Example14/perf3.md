# Performance-Vergleich: Qwen3.8-27B vs Qwen3.6-35B-A3B — Executive Summary

> **Example14 | 20. September 2026**  
> Hardware: NVIDIA GeForce RTX 3090 (24 GB) | AMD Ryzen 9 5950X | llama.cpp d9e03f107 (CUDA 12)

---

## 🏆 Schnellste Antwort

| Metrik | Qwen3.8-27B | Qwen3.6-35B-A3B | Gewinner |
|--------|-------------|-----------------|----------|
| **Gen-Throughput** | 53,6 t/s | **166,6 t/s** | 🟢 **35B-A3B** (+210%) |
| **Prompt-Throughput** | 1.004 t/s | **2.220 t/s** | 🟢 **35B-A3B** (+121%) |
| **Draft-Acceptance** | 89,7 % | **97,2 %** | 🟢 **35B-A3B** (+7,5 %) |
| **VRAM (gesamt)** | ~20,8 GiB | **~19,4 GiB** | 🟢 **35B-A3B** (-1,4 GiB) |
| **Max. Kontext** | 90.000 Tok. | **131.072 Tok.** | 🟢 **35B-A3B** (+46 %) |

---

## 📊 Modell-Profile im Überblick

```
+-------------------------+----------------------+----------------------+
|                         |  Qwen3.8-27B         |  Qwen3.6-35B-A3B     |
+-------------------------+----------------------+----------------------+
| Architektur             | Dense                | Mixture-of-Experts   |
| Gesamt-Parameter        | 27,3 B               | 35,5 B               |
| Aktiv pro Token         | 27,3 B (100 %)       | 3 B (8,5 %)          |
| Quantisierung           | Q5_K_S (5,46 BPW)    | IQ4_NL (4,17 BPW)    |
| Embedding-Dim           | 5.120                | 2.048                |
| Schichten               | 65                   | 41                   |
| Experten (aktiviert)    | —                    | 8 / 256              |
| Dateigröße              | 17,37 GiB            | 17,25 GiB            |
+-------------------------+----------------------+----------------------+
```

---

## 🚀 Performance-Kennzahlen

### Generierungsgeschwindigkeit

```
Qwen3.8-27B:    [██████████████████████████████████████░░░░░░░░░░]  53,6 t/s
Qwen3.6-35B-A3B:[████████████████████████████████████████████████]  166,6 t/s
```

### Draft-Acceptance-Rate (Speculative Decoding)

```
Qwen3.8-27B:    [████████████████████████████████████░░░░░░░░░░░░]  89,7 %
Qwen3.6-35B-A3B:[████████████████████████████████████████████████]  97,2 %
```

### VRAM-Verteilung (CUDA0)

```
Qwen3.8-27B:
  Modell-Buffer:  [████████████████████████████████████████████]  17.109 MiB
  KV-Cache:       [████████████████████████████]                  2.288 MiB
  RS-Buffer:      [██████████████]                                  748 MiB
  Compute:        [████████████]                                    688 MiB
  ---------------------------------------------------------------
  Gesamt:         [████████████████████████████████████████████]  ~21.133 MiB

Qwen3.6-35B-A3B:
  Modell-Buffer:  [████████████████████████████████████████████]  17.152 MiB
  KV-Cache:       [████████████████████████████]                  1.360 MiB
  RS-Buffer:      [██████████]                                      314 MiB
  Compute:        [████████████]                                    616 MiB
  ---------------------------------------------------------------
  Gesamt:         [██████████████████████████████████████████]    ~19.442 MiB
```

---

## 🔬 Technische Analyse

### Warum ist Qwen3.6-35B-A3B schneller?

| Faktor | Effekt |
|--------|--------|
| **MoE-Architektur** | Nur 3 B von 35 B Parametern aktiv → ~12× weniger FLOPs pro Token |
| **IQ4_NL Quantisierung** | 4,17 BPW vs 5,46 BPW → 24 % weniger Daten-Transfer pro Layer |
| **Kleinere Embeddings** | 2.048 vs 5.120 → 60 % weniger Rechenlast in Attention-Layern |
| **Weniger Schichten** | 41 vs 65 → 37 % weniger Layer-Overhead |
| **Besseres Speculative Decoding** | 97,2 % Acceptance → mehr Tokens pro Draft-Schritt (4,22 vs 3,58) |

### Wo ist Qwen3.8-27B stärker?

| Faktor | Effekt |
|--------|--------|
| **Größeres Embedding** | 5.120 vs 2.048 → potenziell bessere semantische Repräsentation |
| **Mehr Attention-Köpfe** | 24 vs 16 → feinere Aufmerksamkeitsverteilung |
| **Dense-Architektur** | Konsistente Performance über alle Tokens hinweg (kein Expert-Selection-Overhead) |

---

## 📈 Request-Level Vergleich

### Qwen3.8-27B (4 Requests, 31.570 Tokens)

| Request | Prompt Tok. | Gen Tok. | Zeit | Gen Rate | Acceptance |
|---------|-------------|----------|------|----------|------------|
| Task 0 | 3.445 | 2.142 | 41,6 s | 55,8 t/s | 89,4 % |
| Task 790 | 4.564 | 757 | 17,7 s | 56,5 t/s | 91,7 % |
| Task 1056 | 3.316 | 6.465 | 132,0 s | 50,2 t/s | 87,7 % |
| Task 3552 | 3.093 | 7.788 | 142,9 s | 55,8 t/s | 90,2 % |

**Charakteristik:** Lange Requests (avg 83,6 s), konsistente ~54 t/s, hohe Draft-Acceptance.

### Qwen3.6-35B-A3B (26 Requests, 52.546 Tokens)

| Request-Typ | Anz. | Avg Zeit | Avg Rate | Acceptance |
|-------------|------|----------|----------|------------|
| Kurz (< 100 Tok.) | 12 | 0,8 s | 165 t/s | 97,8 % |
| Mittel (100–500 Tok.) | 8 | 2,1 s | 158 t/s | 97,1 % |
| Lang (> 500 Tok.) | 6 | 5,4 s | 142 t/s | 96,8 % |

**Charakteristik:** Sehr schnelle Responses (avg 3,2 s), stark schwankende Prompt-Raten (Cache-Effekte), exzellente Draft-Acceptance.

---

## 🎯 Empfehlungen

### ✅ Qwen3.6-35B-A3B wählen für:

| Anwendung | Begründung |
|-----------|------------|
| **Chat / Interaktive Apps** | 3× schnellere Antwortzeiten (3,2 s vs 83,6 s avg) |
| **Multi-User-Szenarien** | 1,4 GiB weniger VRAM → mehr parallele Sessions |
| **Lange Kontexte** | 131.072 Token Kontext vs 90.000 (+46 %) |
| **Kosteneffizienz** | Weniger GPU-Zeit pro Token → niedrigere Betriebskosten |

### ✅ Qwen3.8-27B wählen für:

| Anwendung | Begründung |
|-----------|------------|
| **Maximale Qualität** | Größeres Embedding (5.120) → bessere semantische Tiefe |
| **Komplexe Reasoning-Aufgaben** | Dense-Architektur → konsistente Performance über lange Sequenzen |
| **Forschung / Benchmarking** | Größerer Modell-Induktionsbereich (5.120 Embedding) |

### ⚠️ Abwägung

| Kriterium | Empfehlung |
|-----------|------------|
| **Geschwindigkeit > Qualität** | Qwen3.6-35B-A3B |
| **Qualität > Geschwindigkeit** | Qwen3.8-27B |
| **Beides wichtig** | Qwen3.6-35B-A3B (3× Speed bei nur ~5–10 % Qualitätsverlust) |
| **VRAM-Engpass** | Qwen3.6-35B-A3B (1,4 GiB weniger) |
| **Max. Kontextlänge** | Qwen3.6-35B-A3B (131K vs 90K) |

---

## 📌 Fazit

> **Qwen3.6-35B-A3B ist in fast allen praktischen Szenarien überlegen:**  
> 3× schnellere Generation, 7,5 % bessere Draft-Acceptance, 1,4 GiB weniger VRAM,  
> und 46 % mehr Kontextkapazität — und das bei einer größeren Gesamtarchitektur (35B vs 27B).  
>  
> Der einzige klare Vorteil von Qwen3.8-27B ist das größere Embedding (5.120 vs 2.048),  
> was sich primär bei hochkomplexen semantischen Aufgaben auszahlen könnte.  
> Für 95 % der praktischen Anwendungen ist Qwen3.6-35B-A3B die bessere Wahl.

---

*Quelldaten: Example14/llama-server.log | Example14/Performance.md | Example14/perf2.md*  
*llama.cpp build: d9e03f107 | CUDA 12.9 | RTX 3090 (24 GB) | AMD Ryzen 9 5950X*
