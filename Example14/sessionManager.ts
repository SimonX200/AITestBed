import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

/**
 * Represents an authenticated user session.
 */
export interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

/**
 * Manages user sessions in an internal Map.
 * An automatic setInterval (default: every 60 seconds) removes expired sessions.
 */
export class SessionManager {
  private readonly sessions = new Map<string, UserSession>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly cleanupIntervalMs: number = 60_000) {}

  /**
   * Adds a new session.
   */
  addSession(
    token: string,
    ttlMs: number,
    roles: string[] = [],
    id?: string
  ): UserSession {
    const sessionId = id ?? randomUUID();
    const session: UserSession = {
      id: sessionId,
      token,
      expiresAt: new Date(Date.now() + ttlMs),
      roles,
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Checks whether a session exists and is still valid.
   * Expired sessions are removed on the fly.
   */
  checkSession(id: string): UserSession | null {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (session.expiresAt.getTime() <= Date.now()) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  /**
   * Deletes a session.
   */
  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * Returns all currently stored sessions.
   */
  listSessions(): UserSession[] {
    return [...this.sessions.values()];
  }

  /**
   * Removes all expired sessions.
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    for (const [id, session] of this.sessions) {
      if (session.expiresAt.getTime() <= now) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Starts the automatic cleanup interval.
   */
  startCleanup(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupIntervalMs);
    this.cleanupTimer.unref();
  }
}

/* ------------------------------------------------------------------ */
/* HTTP Server                                                         */
/* ------------------------------------------------------------------ */

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export function createSessionServer(manager: SessionManager) {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const path = url.pathname;

      if (req.method === "GET" && path === "/health") {
        sendJson(res, 200, { status: "ok" });
        return;
      }

      if (req.method === "POST" && path === "/sessions") {
        const raw = await readBody(req);
        let body: Record<string, unknown>;
        try {
          body = JSON.parse(raw || "{}");
        } catch {
          sendJson(res, 400, { error: "Invalid JSON body" });
          return;
        }
        const token = typeof body.token === "string" ? body.token : "";
        if (!token) {
          sendJson(res, 400, { error: "Field 'token' (string) is required" });
          return;
        }
        const ttlMs = typeof body.ttlMs === "number" ? body.ttlMs : 300_000;
        const roles = Array.isArray(body.roles)
          ? (body.roles as unknown[]).filter((r): r is string => typeof r === "string")
          : [];
        const id = typeof body.id === "string" ? body.id : undefined;
        const session = manager.addSession(token, ttlMs, roles, id);
        sendJson(res, 201, session);
        return;
      }

      if (req.method === "GET" && path === "/sessions") {
        sendJson(res, 200, manager.listSessions());
        return;
      }

      const match = path.match(/^\/sessions\/([^/]+)$/);
      if (match) {
        const id = decodeURIComponent(match[1]);
        if (req.method === "GET") {
          const session = manager.checkSession(id);
          if (!session) {
            sendJson(res, 404, { error: "Session not found or expired" });
            return;
          }
          sendJson(res, 200, session);
          return;
        }
        if (req.method === "DELETE") {
          const deleted = manager.deleteSession(id);
          if (!deleted) {
            sendJson(res, 404, { error: "Session not found" });
            return;
          }
          sendJson(res, 200, { deleted: true, id });
          return;
        }
      }

      sendJson(res, 404, { error: "Not found" });
    } catch (err) {
      sendJson(res, 500, { error: err instanceof Error ? err.message : "Internal error" });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Entry point (used by the esbuild bundle / Docker container)         */
/* ------------------------------------------------------------------ */

const isMain =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isMain) {
  const manager = new SessionManager(60_000);
  manager.startCleanup();
  const port = Number(process.env.PORT ?? 3000);
  const server = createSessionServer(manager);
  server.listen(port, () => {
    console.log(`SessionManager HTTP server listening on port ${port}`);
  });
}
