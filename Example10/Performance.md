# Performance Report: Example10

**Datum:** 20. September 2026  
**Session-Zeitraum:** 12:46:25 – 12:49:21 (2 Min. 56 Sek.)  
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
| Gesamte Anfragen | 33 |
| Verarbeitete Tokens (gesamt) | 21.962 |
| Timing-Einträge | 204 |
| Ø Token-Generierungsgeschwindigkeit | 162,05 t/s |
| Ø Draft-Akzeptanzrate | 95,31 % |

---

## Erste Anfrage (Kaltstart)

| Metrik | Wert |
|--------|------|
| Prompt Eval | 1.263,33 ms / 3.524 Tokens (2.789,46 t/s) |
| Eval (Generation) | 1.221,04 ms / 182 Tokens (148,23 t/s) |
| **Gesamt** | **2.484,36 ms / 3.706 Tokens** |
| Draft-Akzeptanz | 93,94 % (124/132, Ø Länge: 3,82) |

---

## Timing-Statistiken

### Prompt Eval Time

| Statistik | Zeit | Tokens |
|-----------|------|--------|
| Minimum | 84,52 ms | 40 |
| Maximum | 1.263,33 ms | 3.524 |

> Der erste Prompt (Kaltstart) benötigt ~1.263 ms für 3.524 Tokens.  
> Nachfolgende Prompts (inkrementell): 84–447 ms für 40–326 Tokens.

### Eval Time (Token-Generation)

| Statistik | Zeit | Tokens | Geschw. |
|-----------|------|--------|---------|
| Minimum | 318,92 ms | 60 | 160,24 t/s |
| Maximum | 7.948,84 ms | 1.442 | 181,28 t/s |

### Token-Generierungsgeschwindigkeit (tg)

| Messung | Tokens generiert | Geschw. | 3s-Durchschnitt |
|---------|-----------------|---------|-----------------|
| 1 | 563 | 187,30 t/s | 187,63 t/s |
| 2 | 508 | 168,59 t/s | 168,91 t/s |
| 3 | 1.087 | 180,33 t/s | 192,03 t/s |
| 4 | 426 | 141,46 t/s | 141,79 t/s |
| 5 | 948 | 157,04 t/s | 172,50 t/s |
| 6 | 414 | 137,56 t/s | 137,88 t/s |

**Ø Geschwindigkeit: 162,05 t/s**

---

## Draft-Akzeptanzraten

| Messung | Akzeptiert / Generiert | Rate | Ø Länge |
|---------|----------------------|------|---------|
| 1 | 124 / 132 | 93,94 % | 3,82 |
| 2 | 48 / 51 | 94,12 % | 3,53 |
| 3 | 536 / 568 | 94,37 % | 3,99 |
| 4 | 227 / 239 | 94,98 % | 3,84 |
| 5 | 165 / 169 | 97,63 % | 4,67 |
| 6 | 291 / 320 | 90,94 % | 3,67 |
| 7 | 66 / 69 | 95,65 % | 4,47 |
| 8 | 1.060 / 1.125 | 94,22 % | 4,15 |
| 9 | 339 / 352 | 96,31 % | 3,92 |
| 10 | 331 / 352 | 94,03 % | 4,04 |
| 11 | 65 / 66 | 98,49 % | 4,61 |
| 12 | 47 / 49 | 95,92 % | 4,62 |
| 13 | 57 / 58 | 98,28 % | 4,35 |
| 14 | 51 / 56 | 91,07 % | 4,40 |
| 15 | 260 / 265 | 98,11 % | 4,56 |
| 16 | 48 / 49 | 97,96 % | 4,43 |
| 17 | 83 / 86 | 96,51 % | 4,32 |
| 18 | 100 / 111 | 90,09 % | 4,23 |
| 19 | 100 / 102 | 98,04 % | 4,57 |
| 20 | 300 / 302 | 99,34 % | 4,70 |

**Ø Akzeptanzrate: 95,31 %**

---

## Analyse

- **Prompt-Eingabe:** Der Kaltstart-Prompt (3.524 Tokens) dauert ~1,26 Sekunden. Inkrementelle Prompts liegen bei 85–447 ms.
- **Token-Generation:** Die durchschnittliche Generierungsgeschwindigkeit liegt bei ~162 t/s, mit Spitzenwerten bis ~187 t/s.
- **Speculative Decoding:** Die Draft-Akzeptanzrate von 95,31 % ist sehr gut und zeigt, dass das draft-mtp-Verfahren effektiv arbeitet.
- **Skalierung:** Bei längeren Generationen (bis 1.442 Tokens) bleibt die Geschwindigkeit stabil (~181 t/s).
