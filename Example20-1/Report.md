# SessionManager (Redis) - Projekt Report

## Zusammenfassung

Dieses Projekt implementiert ein Session-Management-System mit **Redis** als Persistenzschicht. Redis bietet native TTL-Unterstützung, In-Memory-Performance und ist die empfohlene Lösung für Production-Systeme.

## Architektur-Entscheidung

### SQLite (Example20) vs. Redis (Example20-1)

| Kriterium | Example20 (SQLite) | Example20-1 (Redis) |
|-----------|-------------------|---------------------|
| **Setup** | Embedded, keine Abhängigkeit | Separater Container nötig |
| **Performance** | Gut (File-basiert) | Sehr gut (In-Memory) |
| **TTL-Unterstützung** | Manuell (cleanup) | Native (`EXPIRE`) |
| **Skalierbarkeit** | Limitiert | Hoch (Cluster) |
| **Eignung Demo** | ✅ Ideal | ⚠️ Overkill |
| **Eignung Production** | ⚠️ Limitiert | ✅ Empfohlen |

### Warum Redis für Production?

1. **Automatische Expiration** – Redis entfernt expired Keys automatisch
2. **Native Indizierung** – Token-basierte Lookups über Hash-Keys
3. **Hohe Durchsatz** – In-Memory Operations in Mikrosekunden
4. **Etabliert** – Wird in Example19 erfolgreich eingesetzt
5. **Cluster-fähig** – Horizontal skalierbar für hohe Last

## Projektstruktur

```
Example20-1/
├── src/
│   └── sessionManager.ts      # Core mit RedisStorage
├── tests/
│   ├── sessionManager.test.ts  # Unit Tests
│   └── sessionManager.e2e.test.ts  # E2E Tests
├── deploy/
│   ├── docker-compose.yaml     # Includes Redis
│   └── Dockerfile
├── deploy.sh
├── openapi.json
├── README.md
├── DEVELOPMENT.md
├── Performance.md
└── Report.md
```

## npm Scripts

| Befehl | Beschreibung |
|--------|-------------|
| `npm run build` | Kompiliert mit esbuild nach dist/bundle.js |
| `npm test` | Führt alle Tests aus (Unit + E2E) |
| `npm run e2e` | Führt E2E-Tests mit Docker Container aus |
| `npm run e2e-setup` | Baut und startet Docker Container für E2E |
| `npm run e2e-teardown` | Stoppt und entfernt Docker Container |

## Container-Status

Der Docker Container wurde nach den Tests erfolgreich gestoppt und entfernt.
