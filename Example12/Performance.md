# Performance Report: Example12

**Datum:** 20. September 2026  
**Session-Zeitraum:** 15:39:54 – 15:44:26 (4 Min. 32 Sek.)  
**Modell:** Qwen3.6-35B-A3B-UD-IQ4_NL

---

## Server-Informationen

| Parameter | Wert |
|-----------|------|
| Build | 10963 (d9e03f107) |
| CUDA ARCHS | 610, 860 |
| Threads | 16 (Batch: 16) / 32 |
| Speculative Decoding | draft-mtp (n_max=4, draft-p-min=0.75) |
| Reasoning Format | deepseek |
| Reasoning Effort | xhigh |
| Sleep Idle | 300 Sekunden |

## Speichernutzung

| Komponente | Größe |
|------------|-------|
| Gesamt (Host) | 787 MiB |
| Modell | 515 MiB |
| Sonstige | 272 MiB |

---

## Zusammenfassung

| Metrik | Wert |
|--------|------|
| Gesamte Anfragen | 43 |
| Verarbeitete Tokens (gesamt) | 44.639 |
| Timing-Einträge | 286 |
| Ø Token-Generierungsgeschwindigkeit | 184,69 t/s |
| Ø Draft-Akzeptanzrate | 95,52 % |

---

## Erste Anfrage (Kaltstart)

| Metrik | Wert |
|--------|------|
| Prompt Eval | 1.275,62 ms / 3.547 Tokens (2.780,62 t/s) |
| Eval (Generation) | 1.632,64 ms / 241 Tokens (147,00 t/s) |
| **Gesamt** | **2.908,26 ms / 3.788 Tokens** |
| Draft-Akzeptanz | 92,94 % (158/170, Ø Länge: 3,59) |

---

## Timing-Statistiken

### Prompt Eval Time

| Statistik | Zeit | Tokens |
|-----------|------|--------|
| Minimum | 114,84 ms | 68 |
| Maximum | 1.286,46 ms | 3.547 |

> Der erste Prompt (Kaltstart) benötigt ~1,28 Sekunden für 3.547 Tokens.  
> Nachfolgende Prompts (inkrementell): 115–852 ms für 65–1.583 Tokens.

### Eval Time (Token-Generation)

| Statistik | Zeit | Tokens | Geschw. |
|-----------|------|--------|---------|
| Minimum | 357,63 ms | 60 | 167,78 t/s |
| Maximum | 12.815,26 ms | 2.276 | 177,52 t/s |

### Token-Generierungsgeschwindigkeit (tg)

| Messung | Tokens generiert | Geschw. | 3s-Durchschnitt |
|---------|-----------------|---------|-----------------|
| 1 | 489 | 161,65 t/s | 161,97 t/s |
| 2 | 1.032 | 171,29 t/s | 180,98 t/s |
| 3 | 1.548 | 171,29 t/s | 171,30 t/s |
| 4 | 2.162 | 179,50 t/s | 204,13 t/s |
| 5 | 724 | 240,07 t/s | 240,38 t/s |
| 6 | 673 | 223,93 t/s | 224,25 t/s |
| 7 | 1.380 | 229,66 t/s | 235,38 t/s |
| 8 | 687 | 228,48 t/s | 228,80 t/s |
| 9 | 1.412 | 234,42 t/s | 240,33 t/s |
| 10 | 698 | 230,92 t/s | 231,24 t/s |
| 11 | 1.418 | 234,74 t/s | 238,55 t/s |
| 12 | 441 | 146,33 t/s | 146,66 t/s |
| 13 | 501 | 166,02 t/s | 166,34 t/s |
| 14 | 521 | 172,50 t/s | 172,82 t/s |
| 15 | 1.132 | 187,64 t/s | 202,78 t/s |
| 16 | 1.701 | 188,15 t/s | 189,17 t/s |
| 17 | 540 | 178,79 t/s | 179,11 t/s |
| 18 | 985 | 163,23 t/s | 147,67 t/s |
| 19 | 1.579 | 174,54 t/s | 197,20 t/s |
| 20 | 2.149 | 178,33 t/s | 189,70 t/s |

**Ø Geschwindigkeit: 184,69 t/s**

---

## Draft-Akzeptanzraten

| Messung | Akzeptiert / Generiert | Rate | Ø Länge |
|---------|----------------------|------|---------|
| 1 | 158 / 170 | 92,94 % | 3,59 |
| 2 | 1.646 / 1.754 | 93,84 % | 3,93 |
| 3 | 630 / 637 | 98,90 % | 4,91 |
| 4 | 1.181 / 1.188 | 99,41 % | 4,87 |
| 5 | 1.187 / 1.195 | 99,33 % | 4,90 |
| 6 | 1.189 / 1.191 | 99,83 % | 4,96 |
| 7 | 503 / 530 | 94,91 % | 3,70 |
| 8 | 527 / 552 | 95,47 % | 4,12 |
| 9 | 97 / 100 | 97,00 % | 4,03 |
| 10 | 77 / 84 | 91,67 % | 3,57 |
| 11 | 68 / 72 | 94,44 % | 3,96 |
| 12 | 1.307 / 1.359 | 96,17 % | 4,32 |
| 13 | 1.631 / 1.696 | 96,17 % | 4,28 |
| 14 | 1.066 / 1.067 | 99,91 % | 4,95 |
| 15 | 538 / 542 | 99,26 % | 4,87 |
| 16 | 59 / 61 | 96,72 % | 4,11 |
| 17 | 266 / 277 | 96,03 % | 3,92 |
| 18 | 53 / 53 | 100,00 % | 4,79 |
| 19 | 98 / 103 | 95,15 % | 3,72 |
| 20 | 130 / 137 | 94,89 % | 4,02 |

**Ø Akzeptanzrate: 95,52 %**

---

## Analyse

- **Prompt-Eingabe:** Der Kaltstart-Prompt (3.547 Tokens) dauert ~1,28 Sekunden. Inkrementelle Prompts liegen bei 115–852 ms für 65–1.583 Tokens.
- **Token-Generation:** Die durchschnittliche Generierungsgeschwindigkeit liegt bei ~185 t/s — die höchste aller drei Examples. Spitzenwerte von bis zu 240 t/s wurden erreicht.
- **Speculative Decoding:** Die Draft-Akzeptanzrate von 95,52 % ist sehr gut. Besonders bei längeren Generationen wurden Raten von über 99 % erreicht.
- **Skalierung:** Beispiel 12 verarbeitete die meisten Tokens (44.639) und zeigte die beste durchschnittliche Token-Generierungsgeschwindigkeit.
- **Besonderheit:** Beispiel 12 verzeichnete die höchste Anzahl an Token-Generierungsmessungen (20) und erreichte mit 240 t/s den höchsten Einzelwert.

---

## Vergleich der Examples

| Metrik | Example10 | Example11 | Example12 |
|--------|-----------|-----------|-----------|
| Session-Dauer | 2 Min. 56 Sek. | 4 Min. 48 Sek. | 4 Min. 32 Sek. |
| Anfragen | 33 | 55 | 43 |
| Tokens (gesamt) | 21.962 | 33.808 | 44.639 |
| Ø Generierungs-Gschw. | 162,05 t/s | 166,80 t/s | 184,69 t/s |
| Ø Draft-Akzeptanz | 95,31 % | 96,48 % | 95,52 % |
| Höchste Generierungs-Gschw. | 187,30 t/s | 222,00 t/s | 240,07 t/s |
| Höchste Eval-Zeit | 7.948,84 ms | 12.252,82 ms | 12.815,26 ms |
