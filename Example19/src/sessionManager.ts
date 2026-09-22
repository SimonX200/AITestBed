import express, { Request, Response, Application } from 'express';
import { createClient, RedisClientType } from 'redis';

/**
 * Repräsentiert eine Benutzersitzung mit Metadaten.
 */
export interface UserSession {
    id: string;
    token: string;
    expiresAt: Date;
    roles: string[];
}

/**
 * SessionManager verwaltet Benutzer-Sessions mit in-memory Map und Redis-Persistenz.
 * Bietet CRUD-Operationen für Sessions mit automatischem Cleanup abgelaufener Einträge.
 */
export class SessionManager {
    /** Interne Map für schnellen Zugriff auf Sessions */
    private sessions: Map<string, UserSession> = new Map();
    private redisClient: RedisClientType | null = null;

    /**
     * Erstellt einen neuen SessionManager.
     * @param redisUrl - Optionaler Redis-URL für persistente Speicherung.
     */
    constructor(redisUrl?: string) {
        if (redisUrl) {
            this.redisClient = createClient({ url: redisUrl });
            this.redisClient.on('error', (err) => console.error('Redis Error:', err));
        }
    }

    /**
     * Stellt eine Verbindung zu Redis her und lädt persistente Sessions.
     */
    async connect(): Promise<void> {
        if (this.redisClient && !this.redisClient.isReady) {
            await this.redisClient.connect();
            const keys = await this.redisClient.keys('session:*');
            for (const key of keys) {
                const data = await this.redisClient.get(key);
                if (data) {
                    const session: UserSession = JSON.parse(data);
                    session.expiresAt = new Date(session.expiresAt);
                    this.sessions.set(session.id, session);
                }
            }
            console.log(`Geladen: ${keys.length} Sessions aus Redis`);
        }
    }

    /**
     * Erzeugt eine neue Session für einen Benutzer.
     * @param userId - Eindeutige Benutzer-ID.
     * @param roles - Liste der Rollen der Session.
     * @returns Die erstellte UserSession.
     */
    async addSession(userId: string, roles: string[]): Promise<UserSession> {
        const id = crypto.randomUUID();
        const token = crypto.randomUUID() + crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 3600000);

        const session: UserSession = { id, token, expiresAt, roles };
        this.sessions.set(id, session);

        if (this.redisClient) {
            await this.redisClient.set(`session:${id}`, JSON.stringify(session));
        }

        return session;
    }

    /**
     * Ruft eine Session anhand ihrer ID ab.
     * Prüft automatisch auf Ablauf und löscht ungültige Sessions.
     * @param id - Die Session-ID.
     * @returns Die UserSession oder null wenn nicht gefunden/abgelaufen.
     */
    async getSession(id: string): Promise<UserSession | null> {
        const session = this.sessions.get(id);
        if (!session) return null;

        if (new Date() > session.expiresAt) {
            await this.removeSession(id);
            return null;
        }

        return session;
    }

    /**
     * Prüft ob eine Session gültig ist (existiert und nicht abgelaufen).
     * @param id - Die Session-ID.
     * @returns true wenn die Session gültig ist.
     */
    async hasValidSession(id: string): Promise<boolean> {
        const session = await this.getSession(id);
        return session !== null;
    }

    /**
     * Löscht eine bestehende Session.
     * @param id - Die Session-ID.
     * @returns true wenn die Session gelöscht wurde.
     */
    async removeSession(id: string): Promise<boolean> {
        const removed = this.sessions.delete(id);
        if (removed && this.redisClient) {
            await this.redisClient.del(`session:${id}`);
        }
        return removed;
    }

    /**
     * Löscht alle abgelaufenen Sessions aus Speicher und Redis.
     * @returns Anzahl der gelöschten Sessions.
     */
    async cleanupExpired(): Promise<number> {
        const now = new Date();
        const expired: string[] = [];

        for (const [id, session] of this.sessions) {
            if (now > session.expiresAt) {
                expired.push(id);
            }
        }

        for (const id of expired) {
            await this.removeSession(id);
        }

        return expired.length;
    }

    /**
     * Startet den HTTP-Server mit REST-API Endpunkten.
     * @param port - Port auf dem der Server lauscht.
     * @returns Die Express Application Instanz.
     */
    async startServer(port: number): Promise<Application> {
        const app = express();
        app.use(express.json());

        // POST /sessions - Erstelle eine neue Session
        app.post('/sessions', async (req: Request, res: Response) => {
            try {
                const { userId, roles = [] } = req.body;
                if (!userId) {
                    res.status(400).json({ error: 'userId is required' });
                    return;
                }
                const session = await this.addSession(userId, roles);
                res.status(201).json(session);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // GET /sessions/:id - Hole eine Session
        app.get('/sessions/:id', async (req: Request, res: Response) => {
            try {
                const session = await this.getSession(req.params.id);
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                res.json(session);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // GET /sessions/:id/valid - Prüfe Session Gültigkeit
        app.get('/sessions/:id/valid', async (req: Request, res: Response) => {
            try {
                const isValid = await this.hasValidSession(req.params.id);
                res.json({ valid: isValid });
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // DELETE /sessions/expired - Lösche abgelaufene Sessions
        app.delete('/sessions/expired', async (req: Request, res: Response) => {
            try {
                const count = await this.cleanupExpired();
                res.json({ cleaned: count });
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // GET /health - Health Check
        app.get('/health', (_req: Request, res: Response) => {
            res.json({ status: 'ok' });
        });

        await new Promise<void>((resolve) => {
            app.listen(port, () => resolve());
        });

        return app;
    }
}

// Starte Server nur wenn direkt ausgeführt (nicht beim Import)
if (require.main === module) {
    const port = parseInt(process.env.PORT || '3000', 10);
    const redisUrl = process.env.REDIS_URL;
    const manager = new SessionManager(redisUrl);

    manager.connect().then(async () => {
        await manager.startServer(port);
        console.log(`SessionManager running on port ${port}`);
    });
}