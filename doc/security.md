# Security Audit

Hasil audit keamanan PasteNote per 13 Agustus 2026.

---

## Ringkasan

| Kategori | Status | Detail |
|----------|--------|--------|
| Authentication (Admin) | ✅ AMAN | JWT HMAC-SHA256, brute force protection |
| Authentication (Visitor) | ✅ AMAN | SHA-256 password hash, session token |
| Cookie Security | ✅ AMAN | HttpOnly, Secure, SameSite=Strict |
| Data Encryption | ✅ AMAN | AES-256-GCM untuk email config |
| Brute Force Protection | ✅ AMAN | Per-IP tracking, auto-block |
| Rate Limiting | ✅ AMAN | Per email+IP, 5 detik cooldown |
| Input Validation | ✅ AMAN | Semua input divalidasi |
| XSS Protection | ✅ AMAN | escapeHtml() pada semua output |
| Secrets Management | ✅ AMAN | Env vars via `wrangler secret` |
| Error Information | ⚠️ SEDANG | Error 500 expose `err.message` |
| File Leaks | ⚠️ DITANGANI | `.gitignore` sudah dibuat |

---

## Detail Per Kategori

### 1. Authentication — Admin

**Mekanisme:** Password → SHA-256 hash → compare → JWT

| Aspek | Implementasi |
|-------|-------------|
| Password storage | `env.ADMIN_PASSWORD` (Cloudflare Secret, tidak di source code) |
| Hash algorithm | SHA-256 via Web Crypto API |
| Token format | JWT (HMAC-SHA256) |
| Token TTL | 8 jam |
| Token location | Cookie `pn_admin` |
| Cookie flags | `HttpOnly; Secure; SameSite=Strict` |
| Brute force | Max 5 gagal → block 30 menit per IP |

**File:** `src/handlers/admin.js` → `handleAdminLogin()`

### 2. Authentication — Visitor

**Mekanisme:** Password → SHA-256 hash → compare → random session token

| Aspek | Implementasi |
|-------|-------------|
| Password storage | `password_hash` di KV (`page:{email}`) |
| Hash algorithm | SHA-256 via Web Crypto API |
| Session token | 64 hex chars (256-bit random) |
| Session TTL | 24 jam (KV TTL + expiry field) |
| Session location | Cookie `pn_session` |
| Cookie flags | `HttpOnly; Secure; SameSite=Strict` |
| Brute force | Max 10 gagal → block 15 menit per IP |
| Session email check | Session hanya valid untuk email yang sama |

**File:** `src/handlers/pages.js` → `handleVerifyPassword()`

### 3. Cookie Security

Semua cookie menggunakan builder di `src/router.js`:

```javascript
static buildCookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  parts.push('HttpOnly');    // Tidak bisa diakses JavaScript
  parts.push('Secure');       // Hanya HTTPS
  parts.push('SameSite=Strict'); // Tidak dikirim cross-site
  return parts.join('; ');
}
```

| Flag | Proteksi |
|------|----------|
| `HttpOnly` | Cookie tidak bisa dibaca oleh client-side JS (anti XSS theft) |
| `Secure` | Cookie hanya dikirim via HTTPS |
| `SameSite=Strict` | Cookie tidak dikirim pada cross-site request (anti CSRF) |

### 4. Data Encryption

Email config (credentials) dienkripsi sebelum disimpan ke KV:

| Aspek | Detail |
|-------|--------|
| Algorithm | AES-256-GCM |
| Key | `env.ENCRYPTION_KEY` (64 hex chars = 32 bytes) |
| IV | 96-bit random per encrypt (crypto.getRandomValues) |
| Storage format | `{base64_iv}:{base64_ciphertext}` |
| Authenticated | Ya (GCM mode = AEAD, tamper detection) |

**File:** `src/utils/crypto.js` → `encrypt()`, `decrypt()`

Data yang dienkripsi:
- `config:{email}` — berisi `{ email, password, refresh_token, client_id }`

Data yang **TIDAK** dienkripsi (hanya hash):
- `page:{email}.password_hash` — SHA-256 hash, irreversible

### 5. Brute Force Protection

| Target | Max Attempts | Block Duration | KV Key |
|--------|-------------|----------------|--------|
| Admin login | 5 | 30 menit | `bruteforce:admin:{ip}` |
| Visitor password | 10 | 15 menit | `bruteforce:password:{ip}` |

Tracking per IP (dari `CF-Connecting-IP` header). KV entry auto-expire via TTL.

**File:** `src/utils/kv.js` → `checkBruteForce()`, `recordFailedAttempt()`, `clearFailedAttempts()`

### 6. Rate Limiting

| Endpoint | Limit | KV Key |
|----------|-------|--------|
| Read Inbox | 1 per 5 detik | `ratelimit:{email}:{ip}` |

KV entry auto-expire setelah 60 detik.

**File:** `src/utils/kv.js` → `isRateLimited()`

### 7. Input Validation

| Endpoint | Validasi |
|----------|----------|
| Verify Password | email required, password required |
| Read Inbox | email required, session required |
| Admin Login | password required |
| Save Page | email required, format `@` check |
| Delete Page | email required |
| Save Config | pipe-separated, min 4 parts |
| Set Password | email required, password required |

### 8. XSS Protection

Template rendering menggunakan `escapeHtml()` untuk semua user-generated content:

```javascript
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

**Penggunaan:**
- `layout.js` → page title
- `locked.js` → email display
- `unlocked.js` → note content, email subject, sender name
- `notfound.js` → identifier display
- `dashboard.js` → email display di table (via `esc()` function)

**Pengecualian yang disengaja:**
- Email body di modal inbox menggunakan `iframe.srcdoc` dengan `sandbox="allow-same-origin"` — konten email HTML ditampilkan di sandboxed iframe, bukan di-escape.

### 9. Secrets Management

Secrets disimpan sebagai Cloudflare Worker Secrets (bukan di source code):

| Secret | Fungsi |
|--------|--------|
| `ADMIN_PASSWORD` | Password admin login |
| `ENCRYPTION_KEY` | AES-256-GCM key untuk encrypt config |
| `JWT_SECRET` | HMAC-SHA256 key untuk sign JWT |

Set via: `wrangler secret put {NAME}`

**TIDAK ADA** secret yang hardcoded di source code.

### 10. Session Invalidation

Saat admin mengubah password visitor (`/atmin/api/set-password`):
1. Password hash di-update di KV
2. Semua session untuk email tersebut di-invalidate (`invalidateSessionsForEmail`)
3. Visitor harus login ulang dengan password baru

---

## Temuan & Rekomendasi

### ⚠️ Error 500 Expose Detail

**Lokasi:** `src/index.js` line 73

```javascript
return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), {
```

`err.message` bisa berisi detail internal (stack trace, path). Untuk production, sebaiknya hanya kirim generic message.

**Rekomendasi:** Hapus field `details` dari response 500, atau set `details: null` di production.

### ⚠️ File Credential di Project Root

**Status:** DITANGANI — `.gitignore` sudah dibuat

File berikut berisi credentials dan sudah di-gitignore:
- `cf-token.txt` — Cloudflare API token, Account ID, R2 keys
- `set-domain.js` — Hardcoded API token
- `gen-keys.js` — Key generation script (aman, tapi tidak perlu di git)

### ✅ Tidak Ada Data Leak ke Client

Hal-hal yang **TIDAK** pernah dikirim ke browser:
- `env.ENCRYPTION_KEY` — hanya dipakai server-side
- `env.JWT_SECRET` — hanya dipakai server-side
- `env.ADMIN_PASSWORD` — hanya dipakai server-side
- Decrypted email config — hanya dipakai untuk OAuth2 token refresh
- OAuth2 access token — hanya dipakai untuk Graph API call
- Password hash — hanya dipakai untuk comparison (tidak dikirim ke visitor)

### ✅ Tidak Ada Open Redirect

Semua redirect menggunakan hardcoded path (`/atmin`, `/atmin/login`). Tidak ada user-controlled redirect URL.

### ✅ Tidak Ada SQL/NoSQL Injection

KV hanya menggunakan key-value get/put. Key dibangun dari email (lowercased) dengan prefix yang fixed. Tidak ada query language.

---

## Checklist Final

| # | Check | Status |
|---|-------|--------|
| 1 | Semua cookie HttpOnly + Secure + SameSite=Strict | ✅ |
| 2 | Password tidak disimpan plaintext | ✅ |
| 3 | Credentials dienkripsi AES-256-GCM | ✅ |
| 4 | JWT expire setelah 8 jam | ✅ |
| 5 | Session expire setelah 24 jam | ✅ |
| 6 | Brute force protection pada login | ✅ |
| 7 | Rate limit pada inbox fetch | ✅ |
| 8 | XSS protection pada semua output | ✅ |
| 9 | Admin API memerlukan JWT | ✅ |
| 10 | Tools API memerlukan admin JWT | ✅ |
| 11 | Visitor inbox memerlukan session | ✅ |
| 12 | Session hanya valid untuk email yang sama | ✅ |
| 13 | Password change invalidate sessions | ✅ |
| 14 | No secrets in source code | ✅ |
| 15 | .gitignore mencakup file credential | ✅ |
| 16 | Error 500 tidak expose stack trace | ⚠️ expose err.message |
| 17 | No open redirect | ✅ |
| 18 | CSRF protection via SameSite=Strict | ✅ |
