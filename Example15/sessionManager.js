"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = exports.SessionManager = void 0;
const express_1 = __importDefault(require("express"));
// ==================== SessionManager Class ====================
class SessionManager {
    constructor(cleanupIntervalMs = 60000) {
        this.sessions = new Map();
        this.cleanupMs = cleanupIntervalMs;
        this.cleanupInterval = null;
        this.startAutoCleanup();
    }
    /** Start automatic cleanup of expired sessions */
    startAutoCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, this.cleanupMs);
    }
    /** Stop the auto-cleanup interval */
    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    /** Add a new session */
    addSession(id, token, expiresAt, roles) {
        const session = { id, token, expiresAt, roles };
        this.sessions.set(id, session);
        return session;
    }
    /** Get a session by id */
    getSession(id) {
        return this.sessions.get(id);
    }
    /** Check if a session exists and is not expired */
    isValidSession(id) {
        const session = this.sessions.get(id);
        if (!session)
            return false;
        if (session.expiresAt <= new Date()) {
            this.sessions.delete(id);
            return false;
        }
        return true;
    }
    /** Check if user has a specific role */
    hasRole(id, role) {
        const session = this.sessions.get(id);
        if (!session)
            return false;
        if (session.expiresAt <= new Date()) {
            this.sessions.delete(id);
            return false;
        }
        return session.roles.includes(role);
    }
    /** Remove a session */
    removeSession(id) {
        return this.sessions.delete(id);
    }
    /** Remove all expired sessions */
    cleanupExpired() {
        const now = new Date();
        let removed = 0;
        for (const [id, session] of this.sessions.entries()) {
            if (session.expiresAt <= now) {
                this.sessions.delete(id);
                removed++;
            }
        }
        return removed;
    }
    /** Get all active (non-expired) sessions */
    getAllSessions() {
        const now = new Date();
        const active = [];
        for (const session of this.sessions.values()) {
            if (session.expiresAt > now) {
                active.push(session);
            }
        }
        return active;
    }
    /** Get session count */
    getSessionCount() {
        return this.sessions.size;
    }
    /** Get all sessions (including expired) */
    getAllSessionsRaw() {
        return Array.from(this.sessions.values());
    }
}
exports.SessionManager = SessionManager;
// ==================== Express App Setup ====================
const sessionManager = new SessionManager(60000);
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
// POST /api/sessions - Create a new session
app.post('/api/sessions', (req, res) => {
    const { id, token, expiresInMinutes = 30, roles = ['user'] } = req.body;
    if (!id || !token) {
        res.status(400).json({ error: 'id and token are required' });
        return;
    }
    const expiresAt = new Date(Date.now() + (expiresInMinutes || 30) * 60000);
    const session = sessionManager.addSession(id, token, expiresAt, roles);
    res.status(201).json({
        message: 'Session created',
        session: {
            id: session.id,
            token: session.token,
            expiresAt: session.expiresAt.toISOString(),
            roles: session.roles,
        },
    });
});
// GET /api/sessions/:id - Get session info
app.get('/api/sessions/:id', (req, res) => {
    const session = sessionManager.getSession(req.params.id);
    if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
    }
    if (session.expiresAt <= new Date()) {
        sessionManager.removeSession(req.params.id);
        res.status(401).json({ error: 'Session expired' });
        return;
    }
    res.json({
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        roles: session.roles,
    });
});
// GET /api/sessions/:id/valid - Check if session is valid
app.get('/api/sessions/:id/valid', (req, res) => {
    const valid = sessionManager.isValidSession(req.params.id);
    res.json({ id: req.params.id, valid });
});
// GET /api/sessions/:id/role/:role - Check if session has role
app.get('/api/sessions/:id/role/:role', (req, res) => {
    const hasRole = sessionManager.hasRole(req.params.id, req.params.role);
    res.json({ id: req.params.id, role: req.params.role, hasRole });
});
// DELETE /api/sessions/:id - Remove a session
app.delete('/api/sessions/:id', (req, res) => {
    const removed = sessionManager.removeSession(req.params.id);
    if (!removed) {
        res.status(404).json({ error: 'Session not found' });
        return;
    }
    res.json({ message: 'Session removed', id: req.params.id });
});
// GET /api/sessions - List all active sessions
app.get('/api/sessions', (req, res) => {
    const sessions = sessionManager.getAllSessions();
    res.json({ count: sessions.length, sessions: sessions.map(s => ({
            id: s.id,
            token: s.token,
            expiresAt: s.expiresAt.toISOString(),
            roles: s.roles,
        })) });
});
// POST /api/sessions/cleanup - Manually trigger cleanup
app.post('/api/sessions/cleanup', (req, res) => {
    const removed = sessionManager.cleanupExpired();
    res.json({ message: 'Cleanup completed', removed });
});
// Start server if run directly
const PORT = process.env.PORT || 3000;
let server = null;
exports.server = server;
if (require.main === module) {
    exports.server = server = app.listen(PORT, () => {
        console.log(`Session Manager API running on port ${PORT}`);
    });
}
//# sourceMappingURL=sessionManager.js.map