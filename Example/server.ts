import { createServer } from "http";
import { SessionManager } from "./sessionManager";

const sessionManager = new SessionManager();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method || "GET";

  res.setHeader("Content-Type", "application/json");

  if (method === "GET" && path === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
    return;
  }

  if (method === "GET" && path.startsWith("/session/")) {
    const id = path.replace("/session/", "");
    const session = sessionManager.getSession(id);
    if (session) {
      res.writeHead(200);
      res.end(JSON.stringify(session));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Session not found or expired" }));
    }
    return;
  }

  if (method === "POST" && path === "/session") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const { id, token, expiresAt, roles } = JSON.parse(body);
        const session = sessionManager.addSession(id, token, new Date(expiresAt), roles);
        res.writeHead(201);
        res.end(JSON.stringify(session));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body" }));
      }
    });
    return;
  }

  if (method === "DELETE" && path.startsWith("/session/")) {
    const id = path.replace("/session/", "");
    const removed = sessionManager.removeSession(id);
    res.writeHead(removed ? 200 : 404);
    res.end(JSON.stringify({ removed }));
    return;
  }

  if (method === "GET" && path === "/sessions") {
    const sessions = sessionManager.getAllSessions();
    res.writeHead(200);
    res.end(JSON.stringify(sessions));
    return;
  }

  if (method === "POST" && path === "/cleanup") {
    const removed = sessionManager.cleanupExpired();
    res.writeHead(200);
    res.end(JSON.stringify({ removed }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Session Manager API running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  sessionManager.stop();
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  sessionManager.stop();
  server.close(() => process.exit(0));
});