# Arsitektur Sistem

## Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Runtime | Cloudflare Workers (V8 Isolate) |
| Storage | Cloudflare KV (Key-Value) |
| Domain | `pastenote.my.id` (Cloudflare DNS) |
| Bundler | Wrangler (esbuild bawaan) |
| Crypto | Web Crypto API (native Workers) |
| External API | Microsoft Graph API (inbox), Azure AD OAuth2 (token) |

## Struktur Folder

```
pastenote.my.id/
├── doc/                        # Dokumentasi (folder ini)
├── reference/                  # File referensi development (HAR, design, plan)
│   ├── DESIGN.md
│   ├── plan.md
│   ├── analyze-har.js
│   ├── check-token.js
│   └── design/
├── src/                        # Source code utama
│   ├── index.js                # Entry point — routing semua request
│   ├── router.js               # Router utility (response builder, cookie builder)
│   ├── handlers/
│   │   ├── admin.js            # Admin panel handlers (login, CRUD, settings)
│   │   ├── pages.js            # Visitor handlers (page render, password verify, inbox)
│   │   └── tools.js            # Admin tools (check-live, get-token)
│   ├── utils/
│   │   ├── crypto.js           # AES-256-GCM, SHA-256, JWT, key generation
│   │   └── kv.js               # Semua KV operations (CRUD, session, rate-limit)
│   ├── templates/
│   │   ├── layout.js           # Base HTML layout (head, footer, theme, toast)
│   │   ├── landing.js          # Landing page (/)
│   │   ├── locked.js           # Visitor locked page (password form)
│   │   ├── unlocked.js         # Visitor unlocked page (note + inbox)
│   │   ├── notfound.js         # 404 page
│   │   └── admin/
│   │       ├── login.js        # Admin login page
│   │       └── dashboard.js    # Admin dashboard (SPA-like, tabs)
│   └── styles/
│       └── main.css.js         # CSS sebagai JS string (served via /assets/main.css)
├── .gitignore
├── package.json
└── wrangler.jsonc              # Wrangler config (KV binding, worker name)
```

## Data Flow

### Visitor Flow

```
Browser → GET /{email}
  │
  ├─ Page tidak ada → renderNotFound(email) → 404
  │
  ├─ Session valid (cookie pn_session) → renderUnlocked(page) → 200
  │   └─ [Read Inbox] POST /api/read-inbox
  │       ├─ Validate session
  │       ├─ Decrypt config dari KV
  │       ├─ Refresh OAuth2 token (Microsoft)
  │       ├─ Fetch inbox dari Graph API
  │       └─ Return messages[]
  │
  └─ Session tidak valid → renderLocked(email) → 200
      └─ [Submit Password] POST /api/verify-password
          ├─ Check brute force
          ├─ Verify password hash (SHA-256)
          ├─ Create session (KV, TTL 24h)
          └─ Set cookie pn_session → reload → renderUnlocked
```

### Admin Flow

```
Browser → GET /atmin
  │
  ├─ JWT valid (cookie pn_admin) → renderAdminDashboard(pages, settings)
  │   ├─ [Tab: Halaman] CRUD pages
  │   │   ├─ GET  /atmin/api/pages        → listPages
  │   │   ├─ POST /atmin/api/pages        → savePage + setPassword + saveConfig
  │   │   ├─ POST /atmin/api/delete-page  → deletePage
  │   │   └─ POST /atmin/api/set-password → setPagePassword + invalidateSessions
  │   ├─ [Tab: Tools]
  │   │   ├─ POST /api/tools/check-live   → bulk OAuth2 token refresh test
  │   │   └─ POST /api/tools/get-token    → bulk ROPC grant
  │   └─ [Tab: Settings]
  │       ├─ GET  /atmin/api/settings     → getGlobalSettings
  │       └─ POST /atmin/api/settings     → saveGlobalSettings
  │
  └─ JWT tidak valid → renderAdminLogin()
      └─ [Submit] POST /atmin/api/login
          ├─ Check brute force
          ├─ Verify admin password (SHA-256 vs env.ADMIN_PASSWORD)
          ├─ Sign JWT (HMAC-SHA256, TTL 8h)
          └─ Set cookie pn_admin → redirect /atmin
```

### OAuth2 Token Refresh Flow

```
Worker → POST https://login.microsoftonline.com/consumers/oauth2/v2.0/token
  Body:
    grant_type    = refresh_token
    refresh_token = {dari encrypted KV config}
    client_id     = {dari encrypted KV config}
    scope         = https://graph.microsoft.com/Mail.Read offline_access

  Response:
    access_token  → dipakai untuk Graph API
    refresh_token → disimpan kembali ke KV (Microsoft merotasi)
```

### Graph API Inbox Fetch

```
Worker → GET https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages
  Headers:
    Authorization: Bearer {access_token}
  Query:
    $top=15
    $orderby=receivedDateTime desc
    $select=subject,from,receivedDateTime,bodyPreview,body,isRead

  Response → transform ke format internal:
    { subject, from, fromEmail, date, preview, body, isRead }
```

## Module Dependency Graph

```
index.js
  ├── router.js
  ├── handlers/pages.js
  │     ├── utils/kv.js
  │     │     └── utils/crypto.js
  │     ├── templates/locked.js
  │     │     └── templates/layout.js
  │     ├── templates/unlocked.js
  │     │     └── templates/layout.js
  │     └── templates/notfound.js
  │           └── templates/layout.js
  ├── handlers/admin.js
  │     ├── utils/crypto.js
  │     ├── utils/kv.js
  │     ├── templates/admin/login.js
  │     │     └── templates/layout.js
  │     └── templates/admin/dashboard.js
  │           └── templates/layout.js
  ├── handlers/tools.js
  │     └── utils/crypto.js
  ├── templates/landing.js
  │     └── templates/layout.js
  └── styles/main.css.js
```
