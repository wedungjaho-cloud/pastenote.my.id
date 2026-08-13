# KV Schema

Struktur lengkap semua key di Cloudflare KV namespace.

---

## Overview

| Prefix | Fungsi | TTL |
|--------|--------|-----|
| `page:{email}` | Data halaman (note, settings, password hash) | Permanen |
| `config:{email}` | Encrypted email credentials | Permanen |
| `session:{token}` | Visitor session | 24 jam |
| `settings:global` | Pengaturan global | Permanen |
| `ratelimit:{email}:{ip}` | Rate limit tracking | 60 detik |
| `bruteforce:{type}:{ip}` | Brute force tracking | 15-30 menit |

---

## Detail Per Key

### `page:{email}`

Menyimpan data halaman visitor. Email di-lowercase.

```json
{
  "email": "test@outlook.com",
  "note": "Catatan untuk visitor",
  "inbox_enabled": true,
  "password_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "created_at": "2026-08-13T04:00:00.000Z",
  "updated_at": "2026-08-13T04:30:00.000Z"
}
```

| Field | Type | Deskripsi |
|-------|------|-----------|
| `email` | string | Email (lowercase) |
| `note` | string | Catatan yang ditampilkan ke visitor |
| `inbox_enabled` | boolean | Apakah fitur inbox aktif |
| `password_hash` | string\|null | SHA-256 hash password visitor |
| `created_at` | string (ISO) | Tanggal dibuat |
| `updated_at` | string (ISO) | Tanggal terakhir diupdate |

**Saat ditampilkan di admin list**, field tambahan ditambah runtime (tidak disimpan):
- `has_password` (boolean) — `!!password_hash`
- `has_config` (boolean) — cek apakah `config:{email}` ada di KV

---

### `config:{email}`

Menyimpan encrypted email credentials. **Value adalah string terenkripsi, bukan JSON.**

**Format value:** `{base64_iv}:{base64_ciphertext}`

Setelah decrypt, isinya:
```json
{
  "email": "actual@outlook.com",
  "password": "emailPassword123",
  "refresh_token": "0.AVYA...",
  "client_id": "9e5f94bc-e8a4-4e73-b8be-63364c29d753"
}
```

| Field | Type | Deskripsi |
|-------|------|-----------|
| `email` | string | Email akun Outlook |
| `password` | string | Password akun |
| `refresh_token` | string | OAuth2 refresh token (dirotasi oleh Microsoft) |
| `client_id` | string | Azure AD application client ID |

**Encryption:**
- Algorithm: AES-256-GCM
- Key: `env.ENCRYPTION_KEY` (64 hex chars = 32 bytes)
- IV: 12 bytes random per encrypt
- AEAD: Ya (tamper detection)

---

### `session:{token}`

Menyimpan visitor session. Token adalah 64 hex chars random.

```json
{
  "email": "test@outlook.com",
  "created_at": "2026-08-13T04:00:00.000Z",
  "expires_at": "2026-08-14T04:00:00.000Z"
}
```

| Field | Type | Deskripsi |
|-------|------|-----------|
| `email` | string | Email halaman (lowercase) |
| `created_at` | string (ISO) | Saat session dibuat |
| `expires_at` | string (ISO) | Saat session expired (24 jam dari create) |

**KV TTL:** 86400 detik (24 jam) — auto-delete

**Validasi:**
- Token harus ada di KV
- `session.email` harus cocok dengan email yang di-request
- `expires_at` harus di masa depan (double-check selain KV TTL)

---

### `settings:global`

Pengaturan global aplikasi.

```json
{
  "default_note": "Selamat datang di PasteNote."
}
```

| Field | Type | Deskripsi |
|-------|------|-----------|
| `default_note` | string | Note default jika halaman belum punya note khusus |

---

### `ratelimit:{email}:{ip}`

Tracking rate limit per email+IP combination.

**Value:** Unix timestamp (string) dari request terakhir.

**KV TTL:** 60 detik

**Logic:** Jika `now - lastRequest < 5000ms` → rate limited

---

### `bruteforce:{type}:{ip}`

Tracking brute force attempts. `type` = `admin` atau `password`.

```json
{
  "count": 3,
  "first_attempt": 1723521600000
}
```

| Field | Type | Deskripsi |
|-------|------|-----------|
| `count` | number | Jumlah percobaan gagal |
| `first_attempt` | number | Timestamp (ms) percobaan pertama |

**KV TTL:**
- `admin`: 1800 detik (30 menit)
- `password`: 900 detik (15 menit)

**Block threshold:**
- `admin`: 5 percobaan gagal
- `password`: 10 percobaan gagal

**Reset:** Otomatis setelah login berhasil (`clearFailedAttempts`)

---

## Key Naming Convention

Semua email di-lowercase sebelum dipakai sebagai key:
```javascript
const e = email.toLowerCase();
```

Contoh key:
```
page:test@outlook.com
config:test@outlook.com
session:a1b2c3d4e5f6...
settings:global
ratelimit:test@outlook.com:203.0.113.1
bruteforce:admin:203.0.113.1
bruteforce:password:198.51.100.42
```
