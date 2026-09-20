# Performance Report: Example13

**Datum:** 20. September 2026  
**Session-Zeitraum:** 18:33:47 – 18:38:40 (4 Min. 53 Sek.)  
**Modell:** Qwen3.8-27B-UD-Q5_K_S

---

## Server-Informationen

| Parameter | Wert |
|-----------|------|
| Build | 10963 (d9e03f107) |
| CUDA ARCHS | 610, 860 |
| Threads | 8 (Batch: 8) / 32 |
| Speculative Decoding | draft-mtp (n_max=4, draft-p-min=0.75) |
| Reasoning Format | deepseek |
| Reasoning Effort | xhigh |
| Sleep Idle | 300 Sekunden |

## Speichernutzung

| Komponente | Größe |
|------------|-------|
| Gesamt (Host) | 898 MiB |
| Modell | 682 MiB |
| Sonstige | 216 MiB |

---

## Zusammenfassung

| Metrik | Wert |
|--------|------|
| Gesamte Anfragen | 20 |
| Verarbeitete Tokens (gesamt) | 24.000 |
| Timing-Einträge | 187 |
| Ø Token-Generierungsgeschwindigkeit | 65,06 t/s |
| Ø Draft-Akzeptanzrate | 94,01 % |

---

## Erste Anfrage (Kaltstart)

| Metrik | Wert |
|--------|------|
| Prompt Eval | 3.509,14 ms / 3.593 Tokens (1.023,90 t/s) |
| Eval (Generation) | 1.704,29 ms / 100 Tokens (58,09 t/s) |
| **Gesamt** | **5.213,44 ms / 3.693 Tokens** |
| Draft-Akzeptanz | 95,83 % (69/72, Ø Länge: 4,29) |

---

## Timing-Statistiken

### Prompt Eval Time

| Statistik | Zeit | Tokens |
|-----------|------|--------|
| Minimum | 193,28 ms | 45 |
| Maximum | 3.509,14 ms | 3.593 |

> Der erste Prompt (Kaltstart) benötigt ~3,51 Sekunden für 3.593 Tokens.  
> Nachfolgende Prompts (inkrementell): 217–1.387 ms für 69–1.258 Tokens.

### Eval Time (Token-Generation)

| Statistik | Zeit | Tokens | Geschw. |
|-----------|------|--------|---------|
| Minimum | 998,03 ms | 68 | 67,13 t/s |
| Maximum | 57.834,11 ms | 3.263 | 56,40 t/s |

### Token-Generierungsgeschwindigkeit (tg)

| Messung | Tokens generiert | Geschw. | 3s-Durchschnitt |
|---------|-----------------|---------|-----------------|
| 1 | 171 | 56,40 t/s | 56,73 t/s |
| 2 | 308 | 50,99 t/s | 45,56 t/s |
| 3 | 159 | 52,55 t/s | 52,88 t/s |
| 4 | 329 | 54,16 t/s | 55,75 t/s |
| 5 | 480 | 52,62 t/s | 49,57 t/s |
| 6 | 637 | 52,51 t/s | 52,15 t/s |
| 7 | 811 | 53,55 t/s | 57,77 t/s |
| 8 | 929 | 51,11 t/s | 38,93 t/s |
| 9 | 1.057 | 49,88 t/s | 42,44 t/s |
| 10 | 1.252 | 51,65 t/s | 64,00 t/s |
| 11 | 1.483 | 54,37 t/s | 76,00 t/s |
| 12 | 1.675 | 55,22 t/s | 62,86 t/s |
| 13 | 1.839 | 55,17 t/s | 54,61 t/s |
| 14 | 2.025 | 55,71 t/s | 61,63 t/s |
| 15 | 2.245 | 56,97 t/s | 72,05 t/s |
| 16 | 2.439 | 57,46 t/s | 63,81 t/s |
| 17 | 2.590 | 56,98 t/s | 50,25 t/s |
| 18 | 2.768 | 57,08 t/s | 58,57 t/s |
| 19 | 2.916 | 56,58 t/s | 48,51 t/s |
| 20 | 3.064 | 56,11 t/s | 48,33 t/s |
| 21 | 3.251 | 56,41 t/s | 61,76 t/s |
| 22 | 203 | 67,13 t/s | 67,46 t/s |
| 23 | 421 | 69,38 t/s | 71,60 t/s |
| 24 | 646 | 71,12 t/s | 74,60 t/s |
| 25 | 875 | 72,34 t/s | 76,01 t/s |
| 26 | 1.102 | 72,72 t/s | 74,24 t/s |
| 27 | 1.323 | 72,86 t/s | 73,58 t/s |
| 28 | 1.545 | 73,01 t/s | 73,87 t/s |
| 29 | 1.786 | 73,77 t/s | 79,10 t/s |
| 30 | 239 | 78,05 t/s | 78,37 t/s |
| 31 | 494 | 80,85 t/s | 83,66 t/s |
| 32 | 737 | 80,82 t/s | 80,76 t/s |
| 33 | 241 | 79,01 t/s | 79,34 t/s |
| 34 | 490 | 80,42 t/s | 81,83 t/s |
| 35 | 735 | 80,75 t/s | 81,40 t/s |
| 36 | 984 | 81,03 t/s | 81,89 t/s |
| 37 | 225 | 74,28 t/s | 74,61 t/s |
| 38 | 475 | 78,64 t/s | 83,00 t/s |
| 39 | 725 | 80,06 t/s | 82,91 t/s |
| 40 | 975 | 80,70 t/s | 82,61 t/s |
| 41 | 198 | 64,90 t/s | 65,23 t/s |
| 42 | 415 | 68,05 t/s | 71,19 t/s |
| 43 | 632 | 68,97 t/s | 70,79 t/s |
| 44 | 202 | 66,87 t/s | 67,20 t/s |
| 45 | 213 | 70,38 t/s | 70,71 t/s |
| 46 | 427 | 70,24 t/s | 70,10 t/s |
| 47 | 632 | 69,26 t/s | 67,31 t/s |
| 48 | 853 | 70,12 t/s | 72,69 t/s |
| 49 | 1.062 | 69,88 t/s | 68,92 t/s |
| 50 | 1.239 | 68,03 t/s | 58,75 t/s |
| 51 | 191 | 62,09 t/s | 62,42 t/s |
| 52 | 396 | 65,04 t/s | 68,04 t/s |
| 53 | 629 | 68,85 t/s | 76,44 t/s |
| 54 | 859 | 70,66 t/s | 76,12 t/s |
| 55 | 1.081 | 71,08 t/s | 72,73 t/s |
| 56 | 1.306 | 71,51 t/s | 73,68 t/s |
| 57 | 1.537 | 72,19 t/s | 76,27 t/s |
| 58 | 145 | 47,33 t/s | 47,66 t/s |
| 59 | 197 | 64,72 t/s | 65,05 t/s |
| 60 | 384 | 63,45 t/s | 62,17 t/s |
| 61 | 566 | 62,16 t/s | 59,61 t/s |
| 62 | 760 | 62,73 t/s | 64,46 t/s |
| 63 | 167 | 54,59 t/s | 54,92 t/s |
| 64 | 346 | 57,10 t/s | 59,63 t/s |
| 65 | 528 | 58,19 t/s | 60,37 t/s |

**Ø Geschwindigkeit: 65,06 t/s**

---

## Draft-Akzeptanzraten

| Messung | Akzeptiert / Generiert | Rate | Ø Länge |
|---------|----------------------|------|---------|
| 1 | 69 / 72 | 95,83 % | 4,29 |
| 2 | 286 / 324 | 88,27 % | 3,40 |
| 3 | 2.113 / 2.347 | 90,03 % | 3,68 |
| 4 | 1.484 / 1.585 | 93,63 % | 4,42 |
| 5 | 671 / 673 | 99,70 % | 4,88 |
| 6 | 927 / 932 | 99,46 % | 4,93 |
| 7 | 55 / 55 | 100,00 % | 3,50 |
| 8 | 939 / 944 | 99,47 % | 4,95 |
| 9 | 492 / 527 | 93,36 % | 4,32 |
| 10 | 247 / 260 | 95,00 % | 4,53 |
| 11 | 984 / 1.075 | 91,54 % | 4,29 |
| 12 | 1.315 / 1.364 | 96,41 % | 4,59 |
| 13 | 79 / 83 | 95,18 % | 4,16 |
| 14 | 53 / 55 | 96,36 % | 4,53 |
| 15 | 53 / 56 | 94,64 % | 3,94 |
| 16 | 121 / 134 | 90,30 % | 4,10 |
| 17 | 190 / 209 | 90,91 % | 3,68 |
| 18 | 655 / 708 | 92,51 % | 4,03 |
| 19 | 112 / 125 | 89,60 % | 3,73 |
| 20 | 460 / 523 | 87,95 % | 3,88 |

**Ø Akzeptanzrate: 94,01 %**

---

## Analyse

- **Prompt-Eingabe:** Der Kaltstart-Prompt (3.593 Tokens) dauert ~3,51 Sekunden (1.023,90 t/s). Inkrementelle Prompts liegen bei 217–1.387 ms für 69–1.258 Tokens.
- **Token-Generation:** Die durchschnittliche Generierungsgeschwindigkeit liegt bei ~65 t/s — deutlich niedriger als in den Examples 10–12 (162–185 t/s). Grund: Beispiel 13 nutzt das dichte Modell **Qwen3.8-27B-UD-Q5_K_S** (27B Parameter, alle aktiv), während die Examples 10–12 das MoE-Modell Qwen3.6-35B-A3B (nur ~3B aktive Parameter) verwendeten.
- **Speculative Decoding:** Die Draft-Akzeptanzrate von 94,01 % ist die niedrigste aller vier Examples, aber weiterhin gut. Beste Einzelwerte: 100,00 % (Messung 7) und 99,70 % (Messung 5); schlechtester Wert: 87,95 % (Messung 20).
- **Skalierung:** Die längste Einzel-Generation (3.263 Tokens, ~57,83 Sekunden) ist die längste aller vier Examples; die Geschwindigkeit bleibt dabei stabil (~56 t/s).
- **Besonderheit:** Beispiel 13 ist das einzige Example mit einem dichten (non-MoE) Modell und verzeichnet die höchste Einzel-Eval-Zeit (57.834,11 ms) sowie die niedrigste durchschnittliche Generierungsgeschwindigkeit.

---

## Vergleich der Examples

| Metrik | Example10 | Example11 | Example12 | Example13 |
|--------|-----------|-----------|-----------|-----------|
| Modell | Qwen3.6-35B-A3B (MoE) | Qwen3.6-35B-A3B (MoE) | Qwen3.6-35B-A3B (MoE) | Qwen3.8-27B (dicht) |
| Session-Dauer | 2 Min. 56 Sek. | 4 Min. 48 Sek. | 4 Min. 32 Sek. | 4 Min. 53 Sek. |
| Anfragen | 33 | 55 | 43 | 20 |
| Tokens (gesamt) | 21.962 | 33.808 | 44.639 | 24.000 |
| Ø Generierungs-Gschw. | 162,05 t/s | 166,80 t/s | 184,69 t/s | 65,06 t/s |
| Ø Draft-Akzeptanz | 95,31 % | 96,48 % | 95,52 % | 94,01 % |
| Höchste Generierungs-Gschw. | 187,30 t/s | 222,00 t/s | 240,07 t/s | 81,03 t/s |
| Höchste Eval-Zeit | 7.948,84 ms | 12.252,82 ms | 12.815,26 ms | 57.834,11 ms |

