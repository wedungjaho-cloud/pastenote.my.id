# Panduan Deployment

Cara deploy, konfigurasi secrets, dan setup custom domain PasteNote.

---

## Prerequisites

- Node.js >= 18
- Cloudflare account
- Cloudflare API token dengan permissions:
  - Workers Scripts: Edit
  - Workers KV Storage: Edit
  - Workers Routes: Edit (opsional, untuk custom domain)

---

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Encryption Keys

Jalankan sekali untuk generate key:

```bash
node gen-keys.js
```

Output:
```
ENCRYPTION_KEY: a1b2c3d4...  (64 hex chars)
JWT_SECRET: e5f6a7b8...       (64 hex chars)
```

Simpan output ini — dibutuhkan untuk step selanjutnya.

### 3. Set Secrets

```bash
# Set satu per satu (wrangler akan prompt input)
wrangler secret put ADMIN_PASSWORD
# Masukkan: password admin yang diinginkan

wrangler secret put ENCRYPTION_KEY
# Masukkan: output dari gen-keys.js

wrangler secret put JWT_SECRET
# Masukkan: output dari gen-keys.js
```

### 4. Create KV Namespace

Jika belum ada:

```bash
wrangler kv namespace create KV
```

Lalu update `wrangler.jsonc` dengan ID yang diberikan:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "YOUR_KV_NAMESPACE_ID"
    }
  ]
}
```

---

## Deploy

### Deploy ke Cloudflare Workers

```bash
# Dengan environment variables
CLOUDFLARE_API_TOKEN=your_token npx wrangler deploy

# Atau jika sudah login via wrangler
npm run deploy
```

Output yang diharapkan:
```
Total Upload: ~138 KiB / gzip: ~26 KiB
Uploaded pastenote
Deployed pastenote triggers
  https://pastenote.domwebku.workers.dev
```

### Verify Deployment

```bash
curl https://pastenote.domwebku.workers.dev/
# Harus return HTML landing page
```

---

## Custom Domain Setup

### Opsi 1: Via Wrangler Config (Jika Token Punya Zone Permission)

Tambahkan di `wrangler.jsonc`:

```jsonc
{
  "routes": [
    { "pattern": "pastenote.my.id", "zone_id": "YOUR_ZONE_ID" }
  ]
}
```

### Opsi 2: Via API (Jika Token Terbatas)

Gunakan script `set-domain.js` (sudah ada di project root):

```bash
node set-domain.js
```

Script ini memanggil Cloudflare Workers Domain API untuk bind hostname ke worker.

### DNS Setup

Di Cloudflare Dashboard → DNS:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| AAAA | pastenote | 100:: | ✅ Proxied |

Atau gunakan CNAME:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | pastenote | pastenote.domwebku.workers.dev | ✅ Proxied |

---

## Konfigurasi

### wrangler.jsonc

```jsonc
{
  "name": "pastenote",          // Nama worker
  "main": "src/index.js",       // Entry point
  "compatibility_date": "2025-04-01",
  "workers_dev": true,           // Aktifkan *.workers.dev URL
  "kv_namespaces": [
    {
      "binding": "KV",           // Accessible as env.KV
      "id": "740c51abe04d4528aa40bd7afe5999d5"
    }
  ],
  "vars": {}                     // Public vars (kosong, semua pakai secrets)
}
```

### Environment Variables (Secrets)

| Name | Tipe | Deskripsi |
|------|------|-----------|
| `ADMIN_PASSWORD` | Secret | Password untuk login admin (`/atmin`) |
| `ENCRYPTION_KEY` | Secret | AES-256-GCM key (64 hex chars) untuk encrypt email config |
| `JWT_SECRET` | Secret | HMAC-SHA256 key (64 hex chars) untuk sign JWT admin |

> ⚠️ **JANGAN** taruh secrets di `vars` section wrangler.jsonc — itu plaintext dan akan terexpose.

---

## Update / Redeploy

```bash
# Edit source code, lalu:
npm run deploy
```

Worker akan di-update secara zero-downtime (Cloudflare handles rolling deployment).

---

## Rollback

Jika deployment bermasalah:

```bash
# List versions
wrangler versions list

# Rollback ke version sebelumnya
wrangler rollback
```

---

## Local Development

```bash
npm run dev
```

Ini menjalankan `wrangler dev` yang:
- Buat local server di `http://localhost:8787`
- Menggunakan remote KV (production data)
- Secrets tersedia dari Cloudflare

Untuk local-only KV (tidak akses production data):

```bash
wrangler dev --local
```

---

## Troubleshooting

### Error: "Worker not found"
→ Pastikan `name` di `wrangler.jsonc` benar dan sudah di-deploy.

### Error: "KV namespace not found"
→ Cek `id` di `kv_namespaces` sesuai dengan namespace yang sudah dibuat.

### Error: "AADSTS90023" saat OAuth2
→ Scope harus `https://graph.microsoft.com/Mail.Read offline_access`, bukan `.default`.

### Error: "Token refresh failed"
→ Refresh token mungkin expired. Gunakan Tools → Get Token untuk generate ulang.

### Custom domain tidak resolve
→ Pastikan DNS record sudah di-proxy (orange cloud) dan ada AAAA/CNAME record.
