import express, { Request, Response } from 'express';
import { createServer, Server } from 'http';

// ─── Data Models ───────────────────────────────────────────────────────────────

/**
 * Repräsentiert eine Benutzer-Sitzung mit Token, Ablaufzeit und Rollen.
 */
export interface UserSession {
  /** Eindeutige ID der Session */
  id: string;
  /** Authentifizierungs-Token */
  token: string;
  /** Zeitpunkt, ab dem die Session abgelaufen ist */
  expiresAt: Date;
  /** Berechtigungsrollen des Benutzers */
  roles: string[];
}

// ─── Session Manager ───────────────────────────────────────────────────────────

/**
 * Verwaltet Benutzer-Sessions mit automatischer Bereinigung abgelaufener Einträge.
 *
 * Intern wird eine Map verwendet, um Sessions schnell nach ID zugreifen zu können.
 * Alle 60 Sekunden werden automatisch Sessions gelöscht, deren expiresAt-Wert
 * bereits in der Vergangenheit liegt.
 */
export class SessionManager {
  private sessions = new Map<string, UserSession>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Startet den SessionManager und initialisiert den automatischen Bereinigungs-Intervall.
   * Der Intervall läuft alle 60 Sekunden.
   */
  start(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60_000);
  }

  /**
   * Stoppt den SessionManager und den automatischen Bereinigungs-Intervall.
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Erstellt eine neue Session mit einem zufälligen Token und einer Ablaufzeit
   * von standardmäßig 1 Stunde ab jetzt.
   */
  createSession(roles: string[] = [], expiresInMs: number = 3600000): UserSession {
    const id = this.generateId();
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + expiresInMs);
    const session: UserSession = { id, token, expiresAt, roles };
    this.sessions.set(id, session);
    return session;
  }

  /**
   * Prüft, ob eine Session mit der gegebenen ID existiert und nicht abgelaufen ist.
   */
  getSession(id: string): UserSession | null {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (session.expiresAt <= new Date()) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  /**
   * Prüft eine Session anhand ihres Tokens.
   */
  getByToken(token: string): UserSession | null {
    for (const session of this.sessions.values()) {
      if (session.token === token && session.expiresAt > new Date()) {
        return session;
      }
    }
    return null;
  }

  /**
   * Löscht eine Session anhand ihrer ID.
   */
  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * Gibt alle noch aktiven (nicht abgelaufenen) Sessions zurück.
   */
  getAllSessions(): UserSession[] {
    const now = new Date();
    const result: UserSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.expiresAt > now) {
        result.push(session);
      }
    }
    return result;
  }

  /**
   * Bereinigt manuell alle abgelaufenen Sessions.
   */
  cleanupExpired(): void {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * Prüft, ob der Benutzer die angeforderte Rolle hat.
   */
  hasRole(session: UserSession, requiredRole: string): boolean {
    return session.roles.includes(requiredRole);
  }

  private generateId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateToken(): string {
    return `tok_${Math.random().toString(36).substring(2, 34)}_${Date.now()}`;
  }
}

// ─── HTTP Server ───────────────────────────────────────────────────────────────

/**
 * Erstellt einen Express-HTTP-Server mit Session-Management-Endpoints.
 *
 * Endpunkte:
 *   POST   /api/sessions          - Neue Session erstellen
 *   GET    /api/sessions          - Alle aktiven Sessions auflisten
 *   GET    /api/sessions/:id      - Session nach ID abrufen
 *   DELETE /api/sessions/:id      - Session löschen
 *   GET    /api/sessions/validate/:token - Session-Token validieren
 *   GET    /api/health            - Health-Check
 */
export function createSessionServer(sessionManager: SessionManager, port: number): Server {
  const app = express();
  app.use(express.json());

  // POST /api/sessions - Session erstellen
  app.post('/api/sessions', (req: Request, res: Response) => {
    const { roles, expiresIn } = req.body || {};
    const expiresInMs = typeof expiresIn === 'number' ? expiresIn : 3600000;
    const session = sessionManager.createSession(
      Array.isArray(roles) ? roles : [],
      expiresInMs
    );
    res.status(201).json(session);
  });

  // GET /api/sessions - Alle aktiven Sessions
  app.get('/api/sessions', (_req: Request, res: Response) => {
    const sessions = sessionManager.getAllSessions();
    res.json(sessions);
  });

  // GET /api/sessions/:id - Session nach ID
  app.get('/api/sessions/:id', (req: Request, res: Response) => {
    const session = sessionManager.getSession(req.params.id as string);
    if (!session) {
      res.status(404).json({ error: 'Session not found or expired' });
      return;
    }
    res.json(session);
  });

  // DELETE /api/sessions/:id - Session löschen
  app.delete('/api/sessions/:id', (req: Request, res: Response) => {
    const deleted = sessionManager.deleteSession(req.params.id as string);
    if (!deleted) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.status(200).json({ message: 'Session deleted' });
  });

  // GET /api/sessions/validate/:token - Token validieren
  app.get('/api/sessions/validate/:token', (req: Request, res: Response) => {
    const session = sessionManager.getByToken(req.params.token as string);
    if (!session) {
      res.status(404).json({ error: 'Invalid or expired token' });
      return;
    }
    res.json(session);
  });

  // GET /api/health - Health-Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', activeSessions: sessionManager.getAllSessions().length });
  });

  const httpServer = createServer(app);
  return httpServer;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────
// Nur ausführen, wenn diese Datei direkt gestartet wird (nicht beim Import)

if (typeof require !== 'undefined' && require.main === module) {
  const PORT = parseInt(process.env.EXAMPLE_SESSIONMANAGER_PORT || '3000', 10);
  const sessionManager = new SessionManager();
  const server = createSessionServer(sessionManager, PORT);

  server.listen(PORT, () => {
    sessionManager.start();
    console.log(`SessionManager running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    sessionManager.stop();
    server.close(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    sessionManager.stop();
    server.close(() => process.exit(0));
  });
} else if (typeof module !== 'undefined' && module.exports) {
  // Export für Test- und Import-Zwecke
  module.exports = { SessionManager, UserSession: undefined as any, createSessionServer };
}

