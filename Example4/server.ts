import { SessionManager } from './sessionManager.js';

const manager = new SessionManager();
const PORT = process.env.PORT || 3000;

const server = require('http').createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', sessions: manager.count() }));
  } else if (req.url === '/sessions' && req.method === 'POST') {
    const id = manager.createSession({ userId: 'test', ttl: 3600 });
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ sessionId: id }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'SessionManager API', sessions: manager.count() }));
  }
});

server.listen(PORT, () => {
  console.log(`[Server] SessionManager running on port ${PORT}`);
  manager.startAutoCleanup();
});