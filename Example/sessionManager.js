var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// sessionManager.ts
var sessionManager_exports = {};
__export(sessionManager_exports, {
  SessionManager: () => SessionManager
});
module.exports = __toCommonJS(sessionManager_exports);
var SessionManager = class {
  sessions = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor() {
    this.startAutoCleanup();
  }
  startAutoCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 6e4);
  }
  addSession(id, token, expiresAt, roles) {
    const session = { id, token, expiresAt, roles };
    this.sessions.set(id, session);
    return session;
  }
  hasSession(id) {
    const session = this.sessions.get(id);
    if (!session) return false;
    return session.expiresAt > /* @__PURE__ */ new Date();
  }
  getSession(id) {
    const session = this.sessions.get(id);
    if (!session) return void 0;
    if (session.expiresAt <= /* @__PURE__ */ new Date()) {
      this.sessions.delete(id);
      return void 0;
    }
    return session;
  }
  removeSession(id) {
    return this.sessions.delete(id);
  }
  cleanupExpired() {
    const now = /* @__PURE__ */ new Date();
    let removed = 0;
    for (const [id, session] of this.sessions) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }
  getAllSessions() {
    return Array.from(this.sessions.values()).filter((s) => s.expiresAt > /* @__PURE__ */ new Date());
  }
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SessionManager
});
