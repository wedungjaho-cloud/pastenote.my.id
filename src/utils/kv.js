/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — KV Storage Helpers
 *  All KV read/write operations with schema definitions.
 *
 *  KV Key Schema:
 *    page:{email}           → Page data (note, settings, password_hash)
 *    config:{email}         → Encrypted credentials (email config)
 *    session:{token}        → Visitor session
 *    settings:global        → Global settings
 *    ratelimit:{email}:{ip} → Rate limit timestamps
 * ═══════════════════════════════════════════════════════════
 */

import { encrypt, decrypt, sha256, generateSessionToken } from './crypto.js';

// ─── Page Operations ─────────────────────────────────────────

/**
 * Get page data for an email.
 * @returns {object|null} Page data or null if not found
 */
export async function getPage(kv, email) {
  const raw = await kv.get(`page:${email.toLowerCase()}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

/**
 * Save/update page data.
 * Now includes password_hash for visitor auth.
 */
export async function savePage(kv, email, data) {
  const existing = await getPage(kv, email) || {};
  const page = {
    email: email.toLowerCase(),
    note: data.note ?? existing.note ?? '',
    inbox_enabled: data.inbox_enabled ?? existing.inbox_enabled ?? true,
    password_hash: data.password_hash ?? existing.password_hash ?? null,
    created_at: existing.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await kv.put(`page:${email.toLowerCase()}`, JSON.stringify(page));
  return page;
}

/**
 * Delete a page and all associated data.
 */
export async function deletePage(kv, email) {
  const e = email.toLowerCase();
  await Promise.all([
    kv.delete(`page:${e}`),
    kv.delete(`config:${e}`),
  ]);
}

/**
 * List all pages.
 * @returns {Array<object>} Array of page objects
 */
export async function listPages(kv) {
  const list = await kv.list({ prefix: 'page:' });
  const pages = [];
  for (const key of list.keys) {
    const raw = await kv.get(key.name);
    if (raw) {
      const page = JSON.parse(raw);
      // Check if page has a password set
      page.has_password = !!page.password_hash;
      // Check if config exists
      const configRaw = await kv.get(`config:${page.email}`);
      page.has_config = !!configRaw;
      pages.push(page);
    }
  }
  return pages;
}

/**
 * Set a visitor password for a page.
 * @param {string} password - Plain text password (will be hashed)
 */
export async function setPagePassword(kv, email, password) {
  const page = await getPage(kv, email);
  if (!page) return false;
  page.password_hash = await sha256(password);
  page.updated_at = new Date().toISOString();
  await kv.put(`page:${email.toLowerCase()}`, JSON.stringify(page));
  return true;
}

/**
 * Verify visitor password for a page.
 * @param {string} password - Plain text password to verify
 * @returns {boolean}
 */
export async function verifyPagePassword(kv, email, password) {
  const page = await getPage(kv, email);
  if (!page || !page.password_hash) return false;
  const inputHash = await sha256(password);
  return inputHash === page.password_hash;
}


// ─── Config (Encrypted Credentials) ─────────────────────────

/**
 * Save email config (credentials). Encrypts before storing.
 * @param {string} configStr - Format: "email|password|refresh_token|client_id"
 * @param {string} encryptionKey - Hex key from env
 */
export async function saveConfig(kv, email, configStr, encryptionKey) {
  const parts = configStr.split('|');
  if (parts.length < 4) {
    throw new Error('Format config harus: email|password|refresh_token|client_id');
  }
  const config = {
    email: parts[0].trim(),
    password: parts[1].trim(),
    refresh_token: parts[2].trim(),
    client_id: parts[3].trim(),
  };
  const encrypted = await encrypt(JSON.stringify(config), encryptionKey);
  await kv.put(`config:${email.toLowerCase()}`, encrypted);
  return true;
}

/**
 * Get decrypted config for an email.
 * @returns {object|null} {email, password, refresh_token, client_id} or null
 */
export async function getConfig(kv, email, encryptionKey) {
  const encrypted = await kv.get(`config:${email.toLowerCase()}`);
  if (!encrypted) return null;
  const decrypted = await decrypt(encrypted, encryptionKey);
  return JSON.parse(decrypted);
}

/**
 * Update only the refresh_token in config (after OAuth2 refresh).
 * Must decrypt, update, re-encrypt.
 */
export async function updateRefreshToken(kv, email, newRefreshToken, encryptionKey) {
  const config = await getConfig(kv, email, encryptionKey);
  if (!config) return false;
  config.refresh_token = newRefreshToken;
  const encrypted = await encrypt(JSON.stringify(config), encryptionKey);
  await kv.put(`config:${email.toLowerCase()}`, encrypted);
  return true;
}

/**
 * Check if a config exists for an email (without decrypting).
 */
export async function hasConfig(kv, email) {
  const raw = await kv.get(`config:${email.toLowerCase()}`);
  return !!raw;
}


// ─── Sessions ────────────────────────────────────────────────

/**
 * Create a new visitor session.
 * @returns {string} Session token (to be set in cookie)
 */
export async function createSession(kv, email) {
  const token = generateSessionToken();
  const session = {
    email: email.toLowerCase(),
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };
  // TTL: auto-expire from KV after 24 hours
  await kv.put(`session:${token}`, JSON.stringify(session), { expirationTtl: 86400 });
  return token;
}

/**
 * Validate a session token and check it matches the requested email.
 * @returns {object|null} Session data or null if invalid/expired/mismatched
 */
export async function validateSession(kv, token, email) {
  if (!token) return null;
  const raw = await kv.get(`session:${token}`);
  if (!raw) return null;

  const session = JSON.parse(raw);
  // Check email match
  if (session.email !== email.toLowerCase()) return null;
  // Check expiry (belt-and-suspenders — KV TTL handles this too)
  if (new Date(session.expires_at) < new Date()) return null;

  return session;
}

/**
 * Delete a session (logout / revoke).
 */
export async function deleteSession(kv, token) {
  await kv.delete(`session:${token}`);
}

/**
 * Invalidate all sessions for an email (e.g., when password is changed).
 * KV doesn't support prefix delete efficiently, so we list and delete.
 */
export async function invalidateSessionsForEmail(kv, email) {
  const list = await kv.list({ prefix: 'session:' });
  for (const key of list.keys) {
    const raw = await kv.get(key.name);
    if (raw) {
      const session = JSON.parse(raw);
      if (session.email === email.toLowerCase()) {
        await kv.delete(key.name);
      }
    }
  }
}


// ─── Global Settings ─────────────────────────────────────────

/**
 * Get global settings.
 */
export async function getGlobalSettings(kv) {
  const raw = await kv.get('settings:global');
  if (!raw) return { default_note: 'Selamat datang di PasteNote.' };
  return JSON.parse(raw);
}

/**
 * Save global settings.
 */
export async function saveGlobalSettings(kv, settings) {
  await kv.put('settings:global', JSON.stringify(settings));
}


// ─── Rate Limiting ───────────────────────────────────────────

/**
 * Check if a request is rate limited.
 * @param {number} intervalMs - Minimum interval between requests (default 5000ms)
 * @returns {boolean} true if rate limited (should block)
 */
export async function isRateLimited(kv, email, ip, intervalMs = 5000) {
  const key = `ratelimit:${email.toLowerCase()}:${ip}`;
  const raw = await kv.get(key);
  const now = Date.now();

  if (raw) {
    const lastRequest = parseInt(raw, 10);
    if (now - lastRequest < intervalMs) {
      return true; // Rate limited
    }
  }

  // Update timestamp, TTL 60 seconds (auto-cleanup)
  await kv.put(key, String(now), { expirationTtl: 60 });
  return false;
}


// ─── Brute Force Protection ─────────────────────────────────

/**
 * Track failed attempts. Block after maxAttempts.
 * @param {string} type - 'password' or 'admin'
 * @returns {boolean} true if blocked
 */
export async function checkBruteForce(kv, ip, type = 'password') {
  const key = `bruteforce:${type}:${ip}`;
  const raw = await kv.get(key);
  if (!raw) return false;

  const data = JSON.parse(raw);
  const maxAttempts = type === 'admin' ? 5 : 10;
  const blockDuration = type === 'admin' ? 1800 : 900; // 30min admin, 15min password

  if (data.count >= maxAttempts) {
    const elapsed = (Date.now() - data.first_attempt) / 1000;
    if (elapsed < blockDuration) return true; // Still blocked
  }
  return false;
}

/**
 * Record a failed attempt.
 */
export async function recordFailedAttempt(kv, ip, type = 'password') {
  const key = `bruteforce:${type}:${ip}`;
  const raw = await kv.get(key);
  let data = raw ? JSON.parse(raw) : { count: 0, first_attempt: Date.now() };

  data.count++;
  const ttl = type === 'admin' ? 1800 : 900;
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
}

/**
 * Clear failed attempts (on successful auth).
 */
export async function clearFailedAttempts(kv, ip, type = 'password') {
  await kv.delete(`bruteforce:${type}:${ip}`);
}
