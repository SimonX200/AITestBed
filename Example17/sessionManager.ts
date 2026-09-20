/**
 * SessionManager - Managt User-Sessions mit automatischer Ablaufprüfung
 * 
 * Stellt HTTP-Endpunkte bereit für Session-Erstellung, Prüfung und Verwaltung.
 * Läuft standardmäßig auf Port 3000 (kann über SESSION_MANAGER_PORT gesetzt werden).
 */

import * as http from 'http';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Repräsentiert eine aktive Benutzersitzung */
export interface UserSession {
  /** Eindeutige Session-ID */
  id: string;
  /** Authentifizierungstoken */
  token: string;
  /** Zeitpunkt des Session-Ablaufs */
  expiresAt: Date;
  /** Rollen/Rechte der Session */
  roles: string[];
}

// ─── SessionManager Klasse ────────────────────────────────────────────────────

/**
 * Verwaltet aktive Sessions in einer Map mit automatischer Bereinigung.
 * 
 * Features:
 * - Hinzufügen neuer Sessions
 * - Prüfen auf Gültigkeit
 * - Automatisches Löschen abgelaufener Sessions alle 60 Sekunden
 * - HTTP-Server für REST-Endpunkte
 */
export class SessionManager {
  /** Interne Map aller aktiven Sessions, key = sessionId */
  private sessions: Map<string, UserSession> = new Map();
  
  /** Intervall-Handle für die automatische Bereinigung */
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Erstellt eine neue Session und speichert sie.
   * @param token - Das Authentifizierungstoken
   * @param roles - Die Rollen/Rechte der Session
   * @param ttlSeconds - Time-to-Live in Sekunden (Standard: 3600 = 1 Stunde)
   * @returns Die erstellte UserSession
   */
  addSession(token: string, roles: string[], ttlSeconds: number = 3600): UserSession {
    const id = this.generateId();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const session: UserSession = { id, token, expiresAt, roles };
    this.sessions.set(id, session);
    return session;
  }

  /**
   * Prüft, ob eine Session existiert und noch gültig ist.
   * @param sessionId - Die zu prüfende Session-ID
   * @returns Die Session oder null wenn nicht vorhanden/abgelaufen
   */
  getSession(sessionId: string): UserSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  /**
   * Prüft ob eine Session gültig ist (ohne automatische Bereinigung).
   * @param sessionId - Die zu prüfende Session-ID
   * @returns true wenn gültig
   */
  isValid(sessionId: string): boolean {
    return this.getSession(sessionId) !== null;
  }

  /**
   * Entfernt eine Session manuell.
   * @param sessionId - Die zu löschende Session-ID
   * @returns true wenn entfernt
   */
  removeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Gibt alle aktiven Sessions zurück.
   * @returns Array aller nicht-abgelaufenen Sessions
   */
  getAllSessions(): UserSession[] {
    const now = new Date();
    const result: UserSession[] = [];
    for (const [id, session] of this.sessions.entries()) {
      if (now <= session.expiresAt) {
        result.push(session);
      }
    }
    return result;
  }

  /** Startet die automatische Bereinigung abgelaufener Sessions (alle 60s). */
  startCleanup(): void {
    if (this.cleanupInterval) return;
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /** Stoppt die automatische Bereinigung. */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /** Bereinigt manuell alle abgelaufenen Sessions. */
  cleanupExpired(): number {
    const now = new Date();
    let removed = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }

  /** Generiert eine zufällige Session-ID. */
  private generateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(array[i] % chars.length);
    }
    return result;
  }

  /** Startet den HTTP-Server mit REST-Endpunkten. */
  startServer(port: number = 3000): http.Server {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '', `http://localhost:${port}`);
      const method = req.method || 'GET';

      res.setHeader('Content-Type', 'application/json');

      // ── POST /sessions - Neue Session erstellen ──
      if (method === 'POST' && url.pathname === '/sessions') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { token, roles, ttl } = JSON.parse(body || '{}');
            if (!token) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'token is required' }));
              return;
            }
            const session = this.addSession(token, roles || [], ttl || 3600);
            res.writeHead(201);
            res.end(JSON.stringify(session));
          } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }

      // ── GET /sessions/:id - Session abrufen ──
      if (method === 'GET' && url.pathname.startsWith('/sessions/')) {
        const sessionId = url.pathname.split('/')[2];
        if (!sessionId) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'sessionId required' }));
          return;
        }
        const session = this.getSession(sessionId);
        if (session) {
          res.writeHead(200);
          res.end(JSON.stringify(session));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Session not found or expired' }));
        }
        return;
      }

      // ── DELETE /sessions/:id - Session löschen ──
      if (method === 'DELETE' && url.pathname.startsWith('/sessions/')) {
        const sessionId = url.pathname.split('/')[2];
        if (!sessionId) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'sessionId required' }));
          return;
        }
        const removed = this.removeSession(sessionId);
        if (removed) {
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: 'Session removed' }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Session not found' }));
        }
        return;
      }

      // ── GET /sessions - Alle Sessions ──
      if (method === 'GET' && url.pathname === '/sessions') {
        res.writeHead(200);
        res.end(JSON.stringify(this.getAllSessions()));
        return;
      }

      // ── POST /sessions/cleanup - Manuelle Bereinigung ──
      if (method === 'POST' && url.pathname === '/sessions/cleanup') {
        const removed = this.cleanupExpired();
        res.writeHead(200);
        res.end(JSON.stringify({ removed }));
        return;
      }

      // ── GET /health - Health-Check ──
      if (method === 'GET' && url.pathname === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', activeSessions: this.getAllSessions().length }));
        return;
      }

      // 404 für alles andere
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    server.listen(port, () => {
      console.log(`SessionManager running on port ${port}`);
      this.startCleanup();
    });

    return server;
  }
}


// ─── CLI / Direct Execution ───────────────────────────────────────────────────
// Startet den Server nur beim direkten Ausführen, nicht beim Import als Modul

if (require.main === module) {
  const port = parseInt(process.env.SESSION_MANAGER_PORT || '3000', 10);
  const manager = new SessionManager();
  const server = manager.startServer(port);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    manager.stopCleanup();
    server.close(() => process.exit(0));
  });
}
