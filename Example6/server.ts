import { SessionManager } from './sessionManager';

// ── Main entry point (for Docker) ──────────────────────────
const manager = new SessionManager();
manager.startAutoCleanup();

console.log('SessionManager started. Auto-cleanup running every 60s.');
console.log('Press Ctrl+C to stop.');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  manager.stopAutoCleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  manager.stopAutoCleanup();
  process.exit(0);
});
