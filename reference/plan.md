# PRD — PasteNote (pastenote.my.id)

## 1. Ringkasan Produk
PasteNote adalah web app berbasis halaman-per-email. Setiap alamat email punya halaman unik dengan format:

```
pastenote.my.id/{email}
contoh: pastenote.my.id/budi@outlook.com
```

Di halaman tersebut, pengunjung yang punya akses (kunci) bisa melihat:
1. **Note** — catatan yang ditulis admin, khusus untuk halaman itu (atau note general jika belum ada note spesifik)
2. **Kotak Inbox** — daftar pesan masuk dari mailbox Outlook terkait
3. **Tombol "Read Inbox"** — memicu fetch pesan terbaru dari mailbox via API backend

Semua koneksi ke Outlook (kredensial/izin API) diatur per-halaman oleh admin lewat admin panel — bukan otomatis untuk semua email.

## 2. Tujuan (Goals)
- Menyediakan halaman ringkas per email yang menggabungkan catatan admin + preview inbox real-time
- Admin bisa mengelola banyak halaman/email dari satu panel terpusat
- Akses halaman dibatasi lewat kunci/token, bukan publik bebas

## 3. Non-Goals (Di luar cakupan v1)
- Bukan email client penuh (tidak ada reply, forward, compose dari PasteNote)
- Bukan tempat pemilik email login & kelola note sendiri (note murni milik admin)
- Bukan multi-provider email (fokus awal: Outlook/Microsoft 365 saja)

## 4. Peran Pengguna (User Roles)
| Role | Akses |
|---|---|
| **Admin** | Login ke admin panel. Buat/edit halaman per email, tulis note, atur koneksi API Outlook per email, generate & kelola kunci akses, aktif/nonaktifkan fitur "read inbox" per halaman |
| **Visitor (pemegang kunci)** | Buka `pastenote.my.id/{email}` + kunci akses → lihat note & inbox, klik "Read Inbox" untuk refresh pesan masuk |
| **Visitor tanpa kunci** | Tidak bisa melihat isi halaman (diarahkan ke halaman terkunci / prompt kunci) |

## 5. Alur Pengguna (User Flow)

### 5.1 Visitor
1. Visitor membuka `pastenote.my.id/{email}`
2. Sistem cek apakah halaman untuk email itu ada & apakah visitor sudah punya sesi/kunci akses valid
   - Jika belum → tampilkan halaman "locked" berisi **form input kunci** (kunci **tidak** dikirim/disimpan sebagai parameter di URL, untuk hindari bocor lewat history browser, log server, atau referrer)
   - Visitor submit kunci lewat form → jika benar, sistem set session/cookie agar visitor tidak perlu input ulang kunci setiap buka halaman yang sama
   - Jika kunci salah → tetap di halaman "locked"
3. Visitor melihat note dari admin (spesifik halaman, atau general jika belum diisi)
4. Visitor klik **Read Inbox** → backend fetch inbox terbaru via API → tampilkan daftar pesan (pengirim, subjek, waktu, cuplikan/preview)

### 5.2 Admin
1. Login ke admin panel
2. Tambah halaman baru → input alamat email
3. Atur konfigurasi koneksi API untuk email tsb (kredensial/izin akses ke mailbox Outlook)
4. Tulis/edit note untuk halaman tsb
5. Generate kunci akses untuk halaman tsb, lalu bagikan kunci ke pihak yang berhak
6. Bisa cabut/nonaktifkan akses (revoke key, disable read-inbox) kapan saja

## 6. Fitur Utama (Functional Requirements)

### 6.1 Halaman Publik per Email
- Routing dinamis: `/{email}` → render halaman sesuai data yang tersimpan untuk email tsb
- Menampilkan status: apakah fitur inbox aktif untuk halaman ini

### 6.2 Sistem Kunci Akses (Access Key)
- Setiap halaman punya kunci unik (token) yang di-generate admin
- Visitor submit kunci lewat **form di halaman "locked"** (bukan lewat parameter URL) — setelah kunci diverifikasi, sistem set session/cookie agar visitor tidak perlu input ulang di kunjungan berikutnya
- Admin bisa revoke/regenerate kunci kapan saja (otomatis invalidasi session yang sudah ada)

### 6.3 Note (Admin-only)
- Rich text atau plain text, ditulis admin lewat panel
- Bisa berupa note spesifik per halaman, fallback ke note general bila belum diisi

### 6.4 Baca Inbox via API
- Tombol "Read Inbox" memanggil backend endpoint yang terhubung ke Microsoft Graph API (atau IMAP, tergantung metode yang dipilih) untuk mailbox terkait
- Menampilkan list pesan: pengirim, subjek, waktu, preview singkat
- Fetch terjadi on-demand (saat tombol diklik), bukan real-time push (untuk v1)

### 6.5 Admin Panel
- CRUD halaman/email
- Manajemen koneksi API per email (simpan kredensial terenkripsi)
- Editor note per halaman
- Manajemen kunci akses (generate, revoke, lihat siapa yang pernah akses — opsional log)
- Toggle aktif/nonaktif fitur read-inbox per halaman

## 7. Arsitektur Teknis (Usulan)

- **Skala target v1**: ratusan halaman/email
- **Frontend**: Web app (Next.js/React atau setara) dengan routing dinamis `/[email]`
- **Backend**: API layer yang jadi perantara ke Microsoft Graph API — kredensial Outlook **tidak pernah** diekspos ke frontend/visitor
- **Autentikasi ke Outlook**: pakai Microsoft Graph API dengan OAuth per-mailbox (admin connect tiap mailbox lewat consent flow), kredensial/token disimpan terenkripsi di database, di-refresh otomatis oleh backend
- **Database**: menyimpan data halaman (email → note, status fitur, referensi token API terenkripsi, kunci akses, log akses opsional)
- **Auth admin panel**: login terpisah (bukan kunci publik) — misal email+password atau SSO

## 8. Keamanan
- Kredensial API Outlook disimpan terenkripsi di server, tidak pernah dikirim ke client
- Kunci akses halaman sebaiknya bukan predictable — pakai token acak, bukan angka urut
- Rate limiting pada tombol "Read Inbox" untuk cegah abuse ke Graph API
- HTTPS wajib di seluruh domain
- Pertimbangkan expiry/rotasi kunci akses secara berkala


contoh config gua: 
email|password|refresh_token|client_id
ElodieTobias41763@outlook.com|dhritg20476|M.C515_BL2.0.U.MsaArtifacts.-Ck3FBxC4Pokpm29Z5qWLY02dEixCWZ!TcM5iZSaI0Khrk27FWm7qPPsiuHCdh9OQPunwKpBqKtd6JtFfLP3S!OcCFJ0eDRoS32OXZn8QmoYM!PQ*MWqQ9LyO2LWxeLoqbW7nRt7tc2TYLoSP6LvERM5lvvU78ZZsd0M2dpEnzpgJFYvr!iHZ6o32cTvbatV9mh6rhycmZikf6ODVGjKfDKsLPjHzM8ZcJwDG2wpNRnumNUiHzyuARWFwPp8fmOBuCAXcKiccUYSrorgs6mQmKsrYBYTal!7cKCdDIkHN1fl9IpbLJ*gFWI4Oo!h3rCY8nDyY45in!*dOc4gK6tpzj0JSt2LPJwmdtqE8!6*yI1wMopyNyFmxpNwfBr2b686tSiFma9!jtEL14tyyOIQdQuQ$|9e5f94bc-e8a4-4e73-b8be-63364c29d753

jadi saat input config dengan format itu, user di halaman user klik read inbox maka akan ambil inbox dari sini, lu bisa cek ke file contoh.har