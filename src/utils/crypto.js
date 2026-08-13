/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — Crypto Utilities
 *  AES-256-GCM encryption, SHA-256 hashing, JWT, key generation.
 *  Uses Web Crypto API (available in Cloudflare Workers).
 * ═══════════════════════════════════════════════════════════
 */

// ─── AES-256-GCM Encryption ─────────────────────────────────

/**
 * Import a hex-encoded key string as a CryptoKey for AES-GCM.
 * @param {string} hexKey - 64-char hex string (32 bytes)
 */
async function importKey(hexKey) {
  const keyBytes = hexToBytes(hexKey);
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * @param {string} plaintext - Data to encrypt
 * @param {string} hexKey - 64-char hex encryption key (env.ENCRYPTION_KEY)
 * @returns {string} Format: "{base64_iv}:{base64_ciphertext}"
 */
export async function encrypt(plaintext, hexKey) {
  const key = await importKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const ivB64 = bytesToBase64(iv);
  const ctB64 = bytesToBase64(new Uint8Array(ciphertext));
  return `${ivB64}:${ctB64}`;
}

/**
 * Decrypt a string previously encrypted with encrypt().
 * @param {string} encryptedStr - Format: "{base64_iv}:{base64_ciphertext}"
 * @param {string} hexKey - Same key used for encryption
 * @returns {string} Decrypted plaintext
 */
export async function decrypt(encryptedStr, hexKey) {
  const key = await importKey(hexKey);
  const [ivB64, ctB64] = encryptedStr.split(':');
  const iv = base64ToBytes(ivB64);
  const ciphertext = base64ToBytes(ctB64);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}


// ─── SHA-256 Hashing ─────────────────────────────────────────

/**
 * SHA-256 hash a string, return hex digest.
 * Used for hashing access keys and admin password.
 * @param {string} input
 * @returns {string} Hex-encoded SHA-256 hash
 */
export async function sha256(input) {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return bytesToHex(new Uint8Array(hashBuffer));
}


// ─── JWT (Lightweight) ───────────────────────────────────────

/**
 * Sign a JWT payload using HMAC-SHA256.
 * @param {object} payload - Data to encode
 * @param {string} secret - JWT secret (env.JWT_SECRET)
 * @param {number} expiresInSeconds - TTL (default 8 hours)
 * @returns {string} Signed JWT string
 */
export async function signJWT(payload, secret, expiresInSeconds = 28800) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  const encodedSignature = base64UrlEncodeBytes(new Uint8Array(signature));

  return `${signingInput}.${encodedSignature}`;
}

/**
 * Verify and decode a JWT.
 * @param {string} token - JWT string
 * @param {string} secret - JWT secret
 * @returns {object|null} Decoded payload or null if invalid/expired
 */
export async function verifyJWT(token, secret) {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

    // Verify signature
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlDecodeBytes(encodedSignature);
    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(signingInput));
    if (!valid) return null;

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}


// ─── Key Generation ──────────────────────────────────────────

/**
 * Generate a random access key.
 * Format: "ak_" + 32 random hex chars = 35 char total.
 * @returns {string} e.g. "ak_7f3c9d2e1a4b8f6e0123456789abcdef"
 */
export function generateAccessKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return 'ak_' + bytesToHex(bytes);
}

/**
 * Generate a random session token (64 hex chars).
 * @returns {string}
 */
export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

/**
 * Generate a random encryption key (64 hex chars = 32 bytes).
 * Utility for initial setup.
 * @returns {string}
 */
export function generateEncryptionKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}


// ─── Byte/String Conversion Helpers ──────────────────────────

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

function base64UrlEncodeBytes(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecodeBytes(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return base64ToBytes(str);
}
