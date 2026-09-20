# Performance Report: Example11

**Datum:** 20. September 2026  
**Session-Zeitraum:** 15:23:24 – 15:28:12 (4 Min. 48 Sek.)  
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
| Gesamte Anfragen | 55 |
| Verarbeitete Tokens (gesamt) | 33.808 |
| Timing-Einträge | 346 |
| Ø Token-Generierungsgeschwindigkeit | 166,80 t/s |
| Ø Draft-Akzeptanzrate | 96,48 % |

---

## Erste Anfrage (Kaltstart)

| Metrik | Wert |
|--------|------|
| Prompt Eval | 1.283,82 ms / 3.510 Tokens (2.734,03 t/s) |
| Eval (Generation) | 1.696,04 ms / 238 Tokens (139,74 t/s) |
| **Gesamt** | **2.979,86 ms / 3.748 Tokens** |
| Draft-Akzeptanz | 92,94 % (158/170, Ø Länge: 3,47) |

---

## Timing-Statistiken

### Prompt Eval Time

| Statistik | Zeit | Tokens |
|-----------|------|--------|
| Minimum | 84,65 ms | 40 |
| Maximum | 1.283,82 ms | 3.510 |

> Der erste Prompt (Kaltstart) benötigt ~1,28 Sekunden für 3.510 Tokens.  
> Nachfolgende Prompts (inkrementell): 85–431 ms für 40–393 Tokens.

### Eval Time (Token-Generation)

| Statistik | Zeit | Tokens | Geschw. |
|-----------|------|--------|---------|
| Minimum | 261,80 ms | 51 | 190,99 t/s |
| Maximum | 12.252,82 ms | 2.071 | 168,94 t/s |

### Token-Generierungsgeschwindigkeit (tg)

| Messung | Tokens generiert | Geschw. | 3s-Durchschnitt |
|---------|-----------------|---------|-----------------|
| 1 | 543 | 179,25 t/s | 179,57 t/s |
| 2 | 558 | 185,45 t/s | 185,77 t/s |
| 3 | 1.133 | 188,05 t/s | 190,63 t/s |
| 4 | 530 | 175,02 t/s | 175,34 t/s |
| 5 | 1.038 | 171,66 t/s | 168,30 t/s |
| 6 | 1.537 | 169,68 t/s | 165,70 t/s |
| 7 | 2.033 | 168,59 t/s | 165,33 t/s |
| 8 | 656 | 218,24 t/s | 218,55 t/s |
| 9 | 1.338 | 222,00 t/s | 225,74 t/s |
| 10 | 367 | 121,62 t/s | 121,94 t/s |
| 11 | 427 | 141,72 t/s | 142,05 t/s |
| 12 | 592 | 196,91 t/s | 197,23 t/s |
| 13 | 388 | 128,12 t/s | 128,44 t/s |
| 14 | 804 | 133,03 t/s | 137,95 t/s |
| 15 | 1.226 | 135,53 t/s | 140,57 t/s |
| 16 | 404 | 133,97 t/s | 134,29 t/s |

**Ø Geschwindigkeit: 166,80 t/s**

---

## Draft-Akzeptanzraten

| Messung | Akzeptiert / Generiert | Rate | Ø Länge |
|---------|----------------------|------|---------|
| 1 | 158 / 170 | 92,94 % | 3,47 |
| 2 | 42 / 49 | 85,71 % | 3,62 |
| 3 | 601 / 639 | 94,05 % | 4,15 |
| 4 | 41 / 44 | 93,18 % | 4,15 |
| 5 | 44 / 46 | 95,65 % | 3,93 |
| 6 | 361 / 382 | 94,50 % | 3,78 |
| 7 | 56 / 57 | 98,25 % | 4,73 |
| 8 | 38 / 38 | 100,00 % | 4,45 |
| 9 | 85 / 96 | 88,54 % | 3,36 |
| 10 | 207 / 213 | 97,18 % | 4,00 |
| 11 | 127 / 134 | 94,78 % | 3,95 |
| 12 | 176 / 179 | 98,32 % | 4,52 |
| 13 | 50 / 50 | 100,00 % | 4,57 |
| 14 | 1.129 / 1.176 | 95,93 % | 4,24 |
| 15 | 1.498 / 1.573 | 95,23 % | 4,11 |
| 16 | 1.375 / 1.384 | 99,35 % | 4,86 |
| 17 | 58 / 60 | 96,67 % | 4,62 |
| 18 | 60 / 60 | 100,00 % | 4,16 |
| 19 | 52 / 56 | 92,86 % | 4,06 |
| 20 | 74 / 76 | 97,37 % | 4,52 |

**Ø Akzeptanzrate: 96,48 %**

---

## Analyse

- **Prompt-Eingabe:** Der Kaltstart-Prompt (3.510 Tokens) dauert ~1,28 Sekunden. Inkrementelle Prompts liegen bei 85–431 ms für 40–393 Tokens.
- **Token-Generation:** Die durchschnittliche Generierungsgeschwindigkeit liegt bei ~167 t/s. Es wurden 55 Anfragen mit bis zu 2.071 Tokens pro Generation verarbeitet.
- **Speculative Decoding:** Die Draft-Akzeptanzrate von 96,48 % ist die höchste aller drei Examples und zeigt eine sehr effektive draft-mtp-Performance.
- **Skalierung:** Bei sehr langen Generationen (bis 2.071 Tokens, ~12,25 Sek.) bleibt die Geschwindigkeit stabil (~169 t/s).
- **Besonderheit:** Beispiel 11 verzeichnete die meisten Anfragen (55) und die höchste Anzahl an Token-Generierungsmessungen (16), was auf eine intensivere Nutzung hindeutet.
