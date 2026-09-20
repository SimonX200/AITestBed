# Performance-Vergleich: Alle Examples (10–17)

**Hardware:** NVIDIA GeForce RTX 3090 (24 GB VRAM) | AMD Ryzen 9 5950X (16-Core)
**Build:** llama.cpp d9e03f107 (CUDA 12, GCC 14.3.1)
**Datum:** 20. September 2026

---

## Übersichtstabelle

| Metrik | Ex10 | Ex11 | Ex12 | Ex13 | Ex14 (Mod1) | Ex14 (Mod2) | Ex15 | Ex17 |
|---|---|---|---|---|---|---|---|---|
| **Modell** | Qwen3.6-35B-A3B | Qwen3.6-35B-A3B | Qwen3.6-35B-A3B | Qwen3.8-27B | Qwen3.8-27B | Qwen3.6-35B-A3B | Qwen3.6-35B-A3B | Qwen3.6-35B-A3B |
| **Architektur** | MoE (3B aktiv) | MoE (3B aktiv) | MoE (3B aktiv) | Dense (27B) | Dense (27B) | MoE (3B aktiv) | MoE (3B aktiv) | MoE (3B aktiv) |
| **Quantisierung** | IQ4_NL | IQ4_NL | IQ4_NL | Q5_K_S | Q5_K_S | IQ4_NL | IQ4_NL | IQ4_NL |
| **Reasoning** | deepseek/xhigh | deepseek/xhigh | deepseek/xhigh | deepseek/xhigh | deepseek/xhigh | deepseek/xhigh | deepseek/xhigh | peg-native |
| **Session-Dauer** | 2:56 | 4:48 | 4:32 | 4:53 | ~11:00 | ~11:00 | ~4:00 | ~? |
| **Requests** | 33 | 55 | 43 | 20 | 4 | 26 | 51 | 49 |
| **Prompt-Tokens** | 21.962 | 33.808 | 44.639 | 24.000 | 31.570 | 52.546 | 22.510 | 23.767 |
| **Gen-Tokens** | — | — | — | — | — | — | 18.865 | 29.270 |
| **Ø Gen-Rate** | 162,05 | 166,80 | **184,69** | 65,06 | 53,62 | **166,55** | **184,84** | ~165 |
| **Max Gen-Rate** | 187,30 | 222,00 | **240,07** | 81,03 | 56,53 | **195,31** | **228,11** | **230,85** |
| **Ø Prompt-Rate** | — | — | — | — | 1.004 | **2.220** | **1.563** | ~1.005 |
| **Ø Draft Acceptance** | 95,31 | **96,48** | 95,52 | 94,01 | 89,74 | **97,20** | 95,70 | **96,60** |
| **Mean Draft Length** | — | — | — | — | 3,58 | **4,22** | ~3,7 | ~4,14 |
| **Höchste Eval-Zeit** | 7,95 s | 12,25 s | 12,82 s | **57,83 s** | 139,45 s | 16,99 s | — | — |

---

## Modell-Vergleich: MoE vs. Dense

| Metrik | Qwen3.6-35B-A3B (MoE) | Qwen3.8-27B (Dense) | Differenz |
|---|---|---|---|
| **Ø Gen-Rate (Durchschnitt)** | ~170 t/s | ~54 t/s | **MoE 3,1x schneller** |
| **Max Gen-Rate** | ~230 t/s | ~81 t/s | **MoE 2,8x schneller** |
| **Ø Draft Acceptance** | ~96,1 % | ~92 % | **MoE +4,1 %** |
| **Kaltstart Prompt** | ~1,27 s | ~3,51 s | **MoE 2,8x schneller** |
| **VRAM (geschätzt)** | ~19,5–21,5 GiB | ~? GiB | MoE effizienter |

> **Ergebnis:** Das MoE-Modell (35B, nur 3B aktiv) ist trotz grösserer Gesamtgrösse **3x schneller** als das dichte 27B-Modell. Alle 4B-Parameter des dichten Modells müssen pro Token berechnet werden, während beim MoE nur 3B aktiv sind.

---

## MoE-Modelle im Detail (Examples 10, 11, 12, 15, 16, 17)

| Metrik | Ex10 | Ex11 | Ex12 | Ex15 | Ex16 | Ex17 |
|---|---|---|---|---|---|---|
| **Reasoning** | deepseek | deepseek | deepseek | deepseek | peg-native | peg-native |
| **Requests** | 33 | 55 | 43 | 51 | 46 | 49 |
| **Gen-Tokens** | — | — | — | 18.865 | 20.241 | **29.270** |
| **Ø Gen-Rate** | 162,05 | 166,80 | **184,69** | **184,84** | 164,20 | ~165 |
| **Max Gen-Rate** | 187,30 | 222,00 | **240,07** | **228,11** | **228,65** | **230,85** |
| **Ø Draft Acceptance** | 95,31 | **96,48** | 95,52 | 95,70 | 95,70 | **96,60** |

> **Beobachtung:** Die tiefen Gen-Raten in Ex10/11 (~162–167 t/s) steigen in Ex12/15 auf ~185 t/s und bleiben dann stabil. Ex16/17 liegen leicht darunter (~164–165 t/s), was auf unterschiedliche Workloads (längere Generationen) zurückzuführen ist. Die **peg-native** Reasoning-Formate in Ex16/17 zeigen leicht andere Performance-Charakteristika als **deepseek**.

---

## Speculative Decoding: Draft Acceptance Rate

| Beispiel | Acceptance Rate | Mean Draft Length | Bewertung |
|---|---|---|---|
| Ex14 (Mod1, Dense) | 89,74 % | 3,58 | Am niedrigsten |
| Ex13 (Dense) | 94,01 % | — | Gut |
| Ex10 (MoE) | 95,31 % | — | Sehr gut |
| Ex12 (MoE) | 95,52 % | — | Sehr gut |
| Ex15 (MoE) | 95,70 % | ~3,7 | Sehr gut |
| Ex16 (MoE) | 95,70 % | 4,19 | Sehr gut |
| Ex11 (MoE) | **96,48** % | — | Exzellent |
| Ex17 (MoE) | **96,60** % | ~4,14 | Exzellent |
| Ex14 (Mod2, MoE) | **97,20** % | 4,22 | Bestwert |

> **Ergebnis:** MoE-Modelle erreichen konsistent **95–97 %** Draft Acceptance. Das dichte Modell (Ex14 Mod1) liegt bei **89,7 %**. peg-native (Ex17) und deepseek (Ex11) zeigen beide exzellente Werte.

---

## Generation Throughput: Min/Median/Max

| Metrik | Qwen3.6-35B-A3B (MoE) | Qwen3.8-27B (Dense) |
|---|---|---|
| **Minimum** | ~103 t/s | ~50 t/s |
| **Median** | ~166 t/s | ~56 t/s |
| **Ø (gewichtet)** | ~165–185 t/s | ~54–65 t/s |
| **Max** | ~240 t/s | ~81 t/s |
| **Streuung** | Mittel (103–240) | Gering (50–81) |

> **Ergebnis:** MoE-Modelle haben höhere Streuung, aber deutlich höhere Spitzenwerte. Dense-Modelle sind stabiler, aber langsamer.

---

## Prompt Processing: Kaltstart vs. Warm

| Beispiel | Kaltstart (s) | Prompt-Rate (tok/s) | Inkrementell (ms) |
|---|---|---|---|
| Ex10 | 1,26 s | 2.789 | 85–447 ms |
| Ex11 | 1,28 s | 2.734 | 85–431 ms |
| Ex12 | 1,28 s | 2.781 | 115–852 ms |
| Ex13 | 3,51 s | 1.024 | 217–1.387 ms |
| Ex14 (Mod2) | 10,55 s* | — | 0,14–0,91 s |
| Ex15 | 1,66 s | 2.997 | 0,10–0,75 s |
| Ex17 | 1,70 s | 2.986 | 0,11–0,74 s |

> *Ex14 Mod2 hatte einen Prompt mit 31.742 Tokens (extrem langer Kontext) → 10,55 s Kaltstart.
> **Ergebnis:** MoE-Modelle verarbeiten Prompts **2–3x schneller** als Dense. peg-native (Ex17) zeigt beste Prompt-Rate (2.986 tok/s).

---

## Rankings

### Generation Throughput (Ø)
| Platz | Beispiel | Rate |
|---|---|---|
| 🥇 | Ex15 | 184,84 t/s |
| 🥈 | Ex12 | 184,69 t/s |
| 🥉 | Ex11 | 166,80 t/s |
| 4 | Ex14 (Mod2) | 166,55 t/s |
| 5 | Ex17 | ~165 t/s |
| 6 | Ex16 | 164,20 t/s |
| 7 | Ex10 | 162,05 t/s |
| 8 | Ex13 | 65,06 t/s |

### Draft Acceptance Rate
| Platz | Beispiel | Rate |
|---|---|---|
| 🥇 | Ex14 (Mod2) | 97,20 % |
| 🥈 | Ex17 | 96,60 % |
| 🥉 | Ex11 | 96,48 % |
| 4 | Ex15 | 95,70 % |
| 5 | Ex16 | 95,70 % |
| 6 | Ex12 | 95,52 % |
| 7 | Ex10 | 95,31 % |
| 8 | Ex13 | 94,01 % |

### Prompt Processing (Ø Rate)
| Platz | Beispiel | Rate |
|---|---|---|
| 🥇 | Ex14 (Mod2) | 2.220 t/s |
| 🥈 | Ex15 | 1.563 t/s |
| 🥉 | Ex17 | ~1.005 t/s |
| 4 | Ex10 | 1.211 t/s |
| 5 | Ex14 (Mod1) | 1.004 t/s |

---

## Fazit

| Aspekt | Bester Example | Wert |
|---|---|---|
| **Höchste Gen-Rate** | Ex12 / Ex15 | ~185 t/s |
| **Höchste Max Gen-Rate** | Ex12 | 240,07 t/s |
| **Beste Draft Acceptance** | Ex14 (Mod2) | 97,20 % |
| **Schnellste Prompt-Verarbeitung** | Ex17 | 2.986 t/s |
| **Meiste Tokens pro Session** | Ex14 (Mod2) | 52.546 |
| **Stabilste Performance** | Ex13 (Dense) | Geringe Streuung |

> **Empfehlung:** Für maximale Throughput-Pipeline: **Qwen3.6-35B-A3B mit IQ4_NL** (MoE) erreicht ~185 t/s bei 96 %+ Draft Acceptance. Das dichte Qwen3.8-27B ist mit ~54 t/s deutlich langsamer und eignet sich nur für spezifische Use Cases, wo MoE nicht verfügbar ist.
