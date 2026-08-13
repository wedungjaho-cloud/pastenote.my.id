# PasteNote — Dokumentasi Teknis

Dokumentasi lengkap project PasteNote, web app berbasis Cloudflare Workers untuk mengelola catatan dan inbox email per-halaman.

## Daftar Dokumen

| File | Isi |
|------|-----|
| [architecture.md](architecture.md) | Arsitektur sistem, stack teknologi, struktur folder, dan data flow |
| [api-reference.md](api-reference.md) | Referensi lengkap semua API endpoint (request/response) |
| [security.md](security.md) | Audit keamanan, proteksi, dan rekomendasi |
| [kv-schema.md](kv-schema.md) | Schema KV namespace (semua key format dan struktur data) |
| [deployment.md](deployment.md) | Panduan deploy, konfigurasi secrets, dan custom domain |
| [functional-test.md](functional-test.md) | Hasil test fungsional lengkap semua fitur |

## Quick Info

| Item | Value |
|------|-------|
| **Domain** | `pastenote.my.id` |
| **Worker Name** | `pastenote` |
| **Platform** | Cloudflare Workers |
| **Storage** | Cloudflare KV |
| **Auth** | JWT (admin), Session token + SHA-256 password hash (visitor) |
| **Encryption** | AES-256-GCM (email config) |
| **Admin URL** | `/atmin` |
