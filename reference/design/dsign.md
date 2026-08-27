01 – Lock screen: seal/lock icon dikasih glow ring halus + subtle grid background biar berasa "vault", bukan flat card kosong. Input password pakai font mono dengan letter-spacing biar dot-nya rapi, ada toggle show/hide, dan tombol Unlock ada loading state → success check yang smooth.

02 – Dashboard: hierarki dirapiin — nama pengirim (bold) dipisah jelas dari subject (medium), preview di-truncate satu baris, dan kolom kanan sekarang bertingkat: waktu di atas, kode di bawah (di versi lama semua numpuk sejajar jadi rame). Kode OTP dikasih warna amber konsisten sebagai "semantic color" biar beda dari aksi hijau (brand/primary). Toggle, dropdown interval, dan tombol Read Inbox distilin ulang jadi satu grup kontrol yang rapi.

03 – Email standalone: header sticky dengan back button, meta info (from/to/date) dipisah dari konten email biar gampang di-scan. Konten email aslinya ditaruh dalam "frame" dengan topbar mini (kayak browser chrome) buat negasin bahwa itu konten eksternal yang di-render, bukan bagian dari UI pastenote sendiri.

04 – Dashboard dengan email terbuka: beda dari halaman 03 — ini pakai pola accordion, list tetap keliatan (collapsed), item yang dibuka expand inline dengan versi ringkas dari meta+konten, plus link "Buka di halaman penuh" ke halaman 03. Klik row lain otomatis switch.

Semua interaksi (copy code, toggle, expand, unlock) beneran jalan dan transisinya di-tune ke ~150–300ms biar smooth tapi gak lebay. Font pakai Inter (UI) + JetBrains Mono (kode & data teknis) biar ada kontras hierarki yang jelas antara teks biasa dan data.