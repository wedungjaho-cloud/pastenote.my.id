# Functional Test Report

Hasil test fungsional lengkap. Dijalankan pada 13 Agustus 2026.

---

## Test Environment

| Item | Value |
|------|-------|
| Worker URL | `https://pastenote.my.id` |
| Worker dev URL | `https://pastenote.domwebku.workers.dev` |
| Worker Version | `e51166c2-5c8b-40f2-8f59-5d95d316c6fa` |
| Test date | 2026-08-13 |

---

## Test Results Summary

| # | Test Case | Status |
|---|-----------|--------|
| 1 | Landing page render | ✅ PASS |
| 2 | Admin login — correct password | ✅ PASS |
| 3 | Admin login — wrong password | ✅ PASS |
| 4 | Admin dashboard render | ✅ PASS |
| 5 | Create page (save) | ✅ PASS |
| 6 | Edit page | ✅ PASS |
| 7 | Delete page | ✅ PASS |
| 8 | Set visitor password | ✅ PASS |
| 9 | Admin logout | ✅ PASS |
| 10 | Visitor locked page render | ✅ PASS |
| 11 | Visitor password verify — correct | ✅ PASS |
| 12 | Visitor password verify — wrong | ✅ PASS |
| 13 | Visitor unlocked page render | ✅ PASS |
| 14 | 404 page (unknown email) | ✅ PASS |
| 15 | 404 page (unknown path) | ✅ PASS |
| 16 | Unauthorized API access | ✅ PASS |
| 17 | Tab navigation (admin) | ✅ PASS |
| 18 | Settings save/load | ✅ PASS |
| 19 | Theme toggle (dark/light) | ✅ PASS |
| 20 | Auto Format tool | ✅ PASS |

---

## Detailed Test Cases

### 1. Landing Page

**URL:** `GET https://pastenote.my.id/`
**Expected:** Tampilan simpel, brand name, cara akses, no data leak
**Result:** ✅ Tampil clean. Tidak ada data sensitif exposed.

---

### 2-3. Admin Login

**URL:** `POST /atmin/api/login`

| Input | Expected | Result |
|-------|----------|--------|
| `{"password":"somayBos2026"}` | 200, JWT cookie set | ✅ Login berhasil, redirect ke dashboard |
| `{"password":"wrongpass"}` | 401, "Password salah" | ✅ Error message tampil |
| `{"password":""}` | 400, "Password wajib diisi" | ✅ Form validation |

---

### 4. Admin Dashboard

**URL:** `GET /atmin` (with JWT cookie)
**Expected:** Dashboard dengan 3 tab (Halaman, Tools, Settings), stats, page list
**Result:** ✅ Semua tab berfungsi, stats akurat

---

### 5. Create Page

**URL:** `POST /atmin/api/pages`
**Input:**
```json
{
  "email": "test@outlook.com",
  "note": "Test page",
  "password": "test123",
  "inbox_enabled": true
}
```
**Expected:** Page tersimpan, muncul di list
**Result:** ✅ Page created, tampil di table dengan PW: "Set", Inbox: "On"

---

### 6. Edit Page

**Action:** Klik Edit pada page yang ada, ubah note, simpan
**Expected:** Note terupdate, toast "disimpan"
**Result:** ✅ Edit form pre-fill data existing, save berhasil

---

### 7. Delete Page

**Action:** Klik Hapus → button berubah "Yakin?" → klik lagi
**Expected:** Page terhapus dari list dan KV
**Result:** ✅ Inline confirmation bekerja, page hilang dari table, stats terupdate

**Detail flow:**
1. Klik "Hapus" → text berubah jadi "Yakin?" (3 detik timeout)
2. Klik "Yakin?" → POST /atmin/api/delete-page → success
3. Page dihapus dari tabel, stats terupdate

---

### 8. Set Visitor Password

**Via:** Edit page → isi field "Password Visitor" → Simpan
**Expected:** Password hash tersimpan di KV, `has_password: true`
**Result:** ✅ Password tersimpan, badge berubah dari "-" ke "Set"

---

### 9. Admin Logout

**Action:** Klik Logout
**Expected:** Cookie pn_admin dihapus, redirect ke login
**Result:** ✅ Redirect ke /atmin/login, dashboard tidak accessible

---

### 10-11. Visitor Password Verify

**URL:** `POST /api/verify-password`

| Input | Expected | Result |
|-------|----------|--------|
| `{"email":"test@outlook.com","password":"test123"}` | 200, session cookie set | ✅ Redirect ke unlocked page |
| `{"email":"test@outlook.com","password":"wrong"}` | 401, "Password salah" | ✅ Error tampil, input di-clear |

---

### 12-13. Visitor Page States

| URL | Session | Expected | Result |
|-----|---------|----------|--------|
| `/test@outlook.com` | Tidak ada | Locked page (password form) | ✅ |
| `/test@outlook.com` | Valid | Unlocked page (note + inbox) | ✅ |

---

### 14-15. 404 Pages

| URL | Expected | Result |
|-----|----------|--------|
| `/unknown@outlook.com` | "Email unknown@outlook.com belum terdaftar" | ✅ |
| `/randompath` | "Halaman yang kamu cari tidak ada" | ✅ |
| `/deletetest@outlook.com` | 404 (setelah delete) | ✅ |

---

### 16. Unauthorized API Access

| URL | Method | Expected | Result |
|-----|--------|----------|--------|
| `/atmin/api/pages` | GET (no cookie) | 401 Unauthorized | ✅ |
| `/api/tools/check-live` | POST (no cookie) | 401 Unauthorized | ✅ |
| `/api/read-inbox` | POST (no session) | 401 "Session tidak valid" | ✅ |
| `/atmin/api/delete-page` | POST (no cookie) | 401 Unauthorized | ✅ |

---

### 17. Tab Navigation

**Action:** Klik tab Halaman, Tools, Settings
**Expected:** Content switch tanpa page reload
**Result:** ✅ Tab switching smooth, content correct

---

### 18. Settings Save/Load

**Action:** Ubah "Note Default" → Simpan → Reload page
**Expected:** Settings tersimpan dan ter-load ulang
**Result:** ✅ Settings persistent di KV

---

### 19. Theme Toggle

**Action:** Klik tombol theme (☀️/🌙)
**Expected:** Switch dark ↔ light, persist di localStorage
**Result:** ✅ Theme switch smooth, persist setelah reload

---

### 20. Auto Format Tool

**Input:** Paste akun campuran dengan berbagai separator (|, :, ;, tab)
**Expected:** Output dalam format `email|password`, duplikat dihapus
**Result:** ✅ Format benar, duplikat count akurat

---

## Not Tested (Require External Service)

| Feature | Reason |
|---------|--------|
| Read Inbox (Graph API) | Memerlukan valid OAuth2 config |
| Check Live tool | Memerlukan valid credentials |
| Get Token tool | Memerlukan valid email+password |
| Auto Refresh inbox | Dependen pada Read Inbox |

Fitur-fitur di atas memerlukan akun Outlook yang valid dengan OAuth2 config yang sudah di-setup. Logic code sudah diaudit dan correct, tapi end-to-end test memerlukan real credentials.
