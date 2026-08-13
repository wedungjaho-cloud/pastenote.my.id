# API Reference

Semua endpoint API PasteNote beserta request/response format.

---

## Public Endpoints (Tanpa Auth)

### `GET /`

Landing page. Tidak ekspos data sensitif apapun.

**Response:** HTML page (200)

---

### `GET /{email}`

Halaman visitor. Menampilkan locked page (form password) atau unlocked page (note + inbox) tergantung session.

**Parameters:**
- `email` (path) — Alamat email, URL-encoded. Contoh: `/test@outlook.com`

**Response:**
- `200` — Locked page (jika belum login) atau Unlocked page (jika session valid)
- `404` — Halaman tidak ditemukan (email belum didaftarkan admin)

---

### `POST /api/verify-password`

Verifikasi password visitor dan buat session.

**Request Body:**
```json
{
  "email": "test@outlook.com",
  "password": "password123"
}
```

**Response:**
```json
// Success (200) — Set-Cookie: pn_session={token}
{ "success": true }

// Error (400)
{ "success": false, "error": "Email dan password wajib diisi" }

// Error (401)
{ "success": false, "error": "Password salah" }

// Error (403)
{ "success": false, "error": "Password belum diatur oleh admin" }

// Error (404)
{ "success": false, "error": "Halaman tidak ditemukan" }

// Error (429)
{ "success": false, "error": "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." }
```

**Security:**
- Brute force protection: max 10 attempts, block 15 menit per IP
- Password di-hash SHA-256 sebelum dibandingkan
- Session token: 64 hex chars, disimpan di KV dengan TTL 24 jam
- Cookie: HttpOnly, Secure, SameSite=Strict

---

### `POST /api/read-inbox`

Baca inbox email dari Microsoft Graph API. **Memerlukan session cookie valid.**

**Request Body:**
```json
{
  "email": "test@outlook.com"
}
```

**Headers Required:**
- `Cookie: pn_session={token}` — Session cookie dari verify-password

**Response:**
```json
// Success (200)
{
  "success": true,
  "messageCount": 15,
  "messages": [
    {
      "subject": "Your verification code",
      "from": "Microsoft",
      "fromEmail": "noreply@microsoft.com",
      "date": "2026-08-13T04:00:00Z",
      "preview": "Your code is 123456",
      "body": "<html>...</html>",
      "isRead": false
    }
  ]
}

// Error (401)
{ "success": false, "error": "Session tidak valid. Silakan login ulang." }

// Error (403)
{ "success": false, "error": "Fitur inbox dinonaktifkan untuk halaman ini" }

// Error (429)
{ "success": false, "error": "Terlalu cepat. Tunggu 5 detik." }

// Error (502)
{ "success": false, "error": "Token refresh gagal: {detail}" }
```

**Security:**
- Session validation (cookie harus cocok email yang di-request)
- Rate limit: 1 request per 5 detik per email+IP
- Config di-decrypt hanya di server (AES-256-GCM)
- Access token tidak pernah dikirim ke client

---

## Admin Endpoints (Memerlukan Admin JWT)

### `POST /atmin/api/login`

Login admin. Tidak perlu auth sebelumnya.

**Request Body:**
```json
{
  "password": "adminPassword123"
}
```

**Response:**
```json
// Success (200) — Set-Cookie: pn_admin={jwt}
{ "success": true }

// Error (401)
{ "success": false, "error": "Password salah" }

// Error (429)
{ "success": false, "error": "Terlalu banyak percobaan gagal. Coba lagi dalam 30 menit." }
```

**Security:**
- Brute force protection: max 5 attempts, block 30 menit per IP
- JWT: HMAC-SHA256 signed, TTL 8 jam
- Cookie: HttpOnly, Secure, SameSite=Strict

---

### `POST /atmin/api/logout`

Logout admin. Hapus cookie.

**Response:**
```json
{ "success": true }
```

---

### `GET /atmin/api/pages`

List semua halaman.

**Response:**
```json
{
  "success": true,
  "pages": [
    {
      "email": "test@outlook.com",
      "note": "Catatan halaman",
      "inbox_enabled": true,
      "password_hash": "abc123...",
      "has_password": true,
      "has_config": true,
      "created_at": "2026-08-13T04:00:00Z",
      "updated_at": "2026-08-13T04:00:00Z"
    }
  ]
}
```

> **Note:** `password_hash` dikirim ke admin dashboard tapi TIDAK ke visitor. Admin dashboard hanya menampilkan `has_password: true/false`.

---

### `POST /atmin/api/pages`

Buat atau update halaman. Sekaligus set password dan config jika disertakan.

**Request Body:**
```json
{
  "email": "test@outlook.com",
  "note": "Catatan baru",
  "inbox_enabled": true,
  "password": "visitorPassword123",
  "config": "email|password|refresh_token|client_id"
}
```

- `password` — Opsional. Hanya dikirim jika admin mau set/ubah.
- `config` — Opsional. Format pipe-separated, dienkripsi AES-256-GCM sebelum disimpan.

**Response:**
```json
{ "success": true, "page": { ... } }
```

---

### `POST /atmin/api/delete-page`

Hapus halaman beserta config.

**Request Body:**
```json
{
  "email": "test@outlook.com"
}
```

**Response:**
```json
{ "success": true }
```

**Catatan:** Route `DELETE /atmin/api/pages` juga tersedia tapi kurang reliable untuk body parsing di beberapa environment.

---

### `POST /atmin/api/set-password`

Set/ubah password visitor untuk halaman tertentu. Invalidate semua session aktif.

**Request Body:**
```json
{
  "email": "test@outlook.com",
  "password": "newPassword123"
}
```

**Response:**
```json
{ "success": true, "message": "Password berhasil diubah" }
```

---

### `GET /atmin/api/settings`

Ambil global settings.

**Response:**
```json
{
  "success": true,
  "settings": {
    "default_note": "Selamat datang di PasteNote."
  }
}
```

---

### `POST /atmin/api/settings`

Update global settings.

**Request Body:**
```json
{
  "default_note": "Note default baru"
}
```

**Response:**
```json
{ "success": true }
```

---

## Tools Endpoints (Memerlukan Admin JWT)

### `POST /api/tools/check-live`

Cek apakah akun Outlook masih aktif (via OAuth2 token refresh).

**Request Body:**
```json
{
  "credentials": "email1|pass|refresh_token|client_id\nemail2|pass|refresh_token|client_id",
  "mode": "oauth2"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    { "email": "test@outlook.com", "live": true, "error": null },
    { "email": "dead@outlook.com", "live": false, "error": "Token invalid" }
  ]
}
```

---

### `POST /api/tools/get-token`

Dapatkan refresh_token dari email+password via ROPC grant.

**Request Body:**
```json
{
  "credentials": "email|password\nemail|password|client_id"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "email": "test@outlook.com",
      "success": true,
      "formatted": "email|password|refresh_token|client_id",
      "error": null
    }
  ]
}
```

---

## Static Assets

### `GET /assets/main.css`

CSS utama. Cache 1 jam (`Cache-Control: public, max-age=3600`).

---

## HTTP Status Codes

| Code | Arti |
|------|------|
| `200` | Success |
| `400` | Bad request (input tidak valid) |
| `401` | Unauthorized (belum login / session expired) |
| `403` | Forbidden (fitur dinonaktifkan) |
| `404` | Not found (halaman/email tidak ada) |
| `429` | Too many requests (brute force / rate limit) |
| `500` | Internal server error |
| `502` | Bad gateway (OAuth2 / Graph API gagal) |
