export function getRefinedCSS() {
  return `
/* ═══════════════════════════════════════
   PasteNote — Refined Visual Layer v5.2
   Merged: v5.1 landing + ui-revamp admin/visitor polish
   ═══════════════════════════════════════ */
:root{
  --ui-ease:cubic-bezier(.22,.61,.36,1);
  --ui-fast:140ms;
  --ui-base:220ms;
}

/* Subtle ambient gradient */
body{background-image:radial-gradient(circle at 50% -20%,rgba(111,143,114,.08),transparent 40%)}

/* ═══════════════════════════════════════
   HEADER
   ═══════════════════════════════════════ */
.brand-name{letter-spacing:-.035em}
.theme-btn{background:transparent;color:var(--t3);border:1px solid var(--border);transition:color var(--ui-fast) var(--ui-ease),background var(--ui-fast) var(--ui-ease),border-color var(--ui-fast) var(--ui-ease)}
.theme-btn:hover{background:var(--s3);color:var(--t1);border-color:var(--border-h);transform:none;box-shadow:none}
.theme-btn:active{transform:scale(.96)}

/* ═══════════════════════════════════════
   NAV PILLS (admin tabs)
   ═══════════════════════════════════════ */
.nav-pills{background:transparent;border:0;padding:0;gap:4px}
.nav-pill{padding:7px 13px;border-radius:8px;color:var(--t3);transition:background var(--ui-fast) var(--ui-ease),color var(--ui-fast) var(--ui-ease)}
.nav-pill:hover{background:var(--s3);color:var(--t1)}
.nav-pill.active{background:var(--s3);color:var(--t1);box-shadow:none}

/* ═══════════════════════════════════════
   CARD — softer, cleaner
   ═══════════════════════════════════════ */
.card{border-radius:14px;box-shadow:0 1px 1px rgba(0,0,0,.08);transition:border-color var(--ui-base) var(--ui-ease),background var(--ui-base) var(--ui-ease),box-shadow var(--ui-base) var(--ui-ease),transform var(--ui-base) var(--ui-ease)}
.card:hover{border-color:var(--border-h);box-shadow:0 4px 16px rgba(0,0,0,.08)}
.card-icon,.card:hover .card-icon{transform:none;transition:background var(--ui-base) var(--ui-ease),color var(--ui-base) var(--ui-ease)}

/* ═══════════════════════════════════════
   BUTTONS — refined motion
   ═══════════════════════════════════════ */
.btn{transition:background var(--ui-fast) var(--ui-ease),border-color var(--ui-fast) var(--ui-ease),color var(--ui-fast) var(--ui-ease),transform 100ms var(--ui-ease),opacity var(--ui-fast) var(--ui-ease)}
.btn:hover{box-shadow:none}
.btn:active{transform:translateY(1px) scale(.985)}
.btn-p{font-weight:600}

/* ═══════════════════════════════════════
   INPUT — smooth transitions
   ═══════════════════════════════════════ */
.inp{transition:border-color var(--ui-fast) var(--ui-ease),background var(--ui-fast) var(--ui-ease),box-shadow var(--ui-fast) var(--ui-ease)}

/* ═══════════════════════════════════════
   LOCKED & ADMIN LOGIN — entry animation
   ═══════════════════════════════════════ */
.locked .lock-card,.admin-login .alogin-card{box-shadow:none;animation:uiIn .55s var(--ui-ease) both}
.lock-card:hover,.alogin-card:hover{box-shadow:0 14px 36px rgba(0,0,0,.14)}
.lock-card{max-width:400px}
.lock-icon{animation:uiPulse 2.8s ease-in-out infinite}
.lock-card:hover .lock-icon{animation:none}
.alogin-card{border-top:2px solid var(--amber)}
.nf-card{animation:uiIn .55s var(--ui-ease) both}
.nf-code{opacity:.6}

/* ═══════════════════════════════════════
   ADMIN DASHBOARD — polished data view
   ═══════════════════════════════════════ */
.admin-dash .page{padding-top:88px}
.admin-dash .stats{grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
.admin-dash .stat{position:relative;padding:16px 18px;border-radius:12px;background:transparent;box-shadow:none;transition:background var(--ui-base) var(--ui-ease),border-color var(--ui-base) var(--ui-ease),transform var(--ui-base) var(--ui-ease)}
.admin-dash .stat:hover{transform:translateY(-2px);background:var(--s2);box-shadow:0 10px 24px rgba(0,0,0,.12)}
.admin-dash .stat:nth-child(1),.admin-dash .stat:nth-child(2),.admin-dash .stat:nth-child(3){border-left:1px solid var(--border-h)}
.admin-dash .stat-num{font-size:1.9rem;letter-spacing:-.04em}
.admin-dash .stat-name{font-size:.63rem}
.admin-dash .card-header{padding:14px 18px}
.admin-dash .card-body{padding:10px 18px 16px}
.admin-dash .tbl{min-width:720px;border-spacing:0 4px}
.admin-dash .tbl thead th{background:transparent;border:0;padding:8px 12px;color:var(--t4);font-size:.61rem}
.admin-dash .tbl tbody tr{background:transparent;transition:background var(--ui-fast) var(--ui-ease),transform var(--ui-fast) var(--ui-ease)}
.admin-dash .tbl tbody tr:hover{background:var(--s3);transform:translateX(2px)}
.admin-dash .tbl tbody td{border-top:1px solid transparent;border-bottom:1px solid transparent;padding:12px}
.admin-dash .tbl tbody tr:hover td{border-color:var(--border)}
.admin-dash .tbl-link,.admin-dash .tbl tbody td:nth-child(3){font-family:'JetBrains Mono',monospace;font-size:.74rem;color:var(--forest)}
.admin-dash .badge{padding:3px 7px;font-size:.58rem;letter-spacing:.06em}
.admin-dash .field-actions{position:sticky;bottom:0;padding:14px 0;background:linear-gradient(transparent,var(--s2) 25%)}
.admin-dash .tab{animation:uiTab .25s var(--ui-ease) both}

/* ═══════════════════════════════════════
   UNLOCKED — visitor inbox polish
   ═══════════════════════════════════════ */
.unlocked .page{max-width:1040px}
.unlocked .card{border-radius:16px}
.unlocked .note-text{font-size:1rem;line-height:1.85;max-width:780px}
.unlocked .card-header{padding:15px 18px}
.unlocked .card-body{padding:18px}
.unlocked .mail-list{gap:0}
.unlocked .mail-item{background:transparent;border-bottom:1px solid var(--border);transition:background var(--ui-fast) var(--ui-ease),border-color var(--ui-fast) var(--ui-ease)}
.unlocked .mail-item:last-child{border-bottom:0}
.unlocked .mail-row{min-height:68px;padding:13px 16px;transition:background var(--ui-fast) var(--ui-ease),padding-left var(--ui-fast) var(--ui-ease)}
.unlocked .mail-row:hover{background:var(--s3);padding-left:20px}
.unlocked .mail-row.unread{background:transparent}
.unlocked .mail-row.unread .mail-sender,.unlocked .mail-row.unread .mail-subj{font-weight:700}
.unlocked .mail-avatar{width:34px;height:34px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.unlocked .mail-right{opacity:.9;transition:opacity var(--ui-fast) var(--ui-ease),transform var(--ui-fast) var(--ui-ease)}
.unlocked .mail-row:hover .mail-right{opacity:1;transform:translateX(-2px)}
.unlocked .otp-code{background:var(--s3);border:1px solid var(--border);color:var(--amber);padding:5px 9px;transition:background var(--ui-fast) var(--ui-ease),border-color var(--ui-fast) var(--ui-ease),color var(--ui-fast) var(--ui-ease)}
.unlocked .otp-code:hover{transform:none;background:var(--amber-a);border-color:var(--amber);color:var(--amber-h)}
.unlocked .copy-btn{border-color:var(--border);transition:background var(--ui-fast) var(--ui-ease),color var(--ui-fast) var(--ui-ease)}
.unlocked .mail-item.expanded{margin:4px 0;background:var(--s3);border:1px solid var(--border-h);box-shadow:0 10px 28px rgba(0,0,0,.12)}
.unlocked .mail-detail{animation:mailOpen .28s var(--ui-ease) both;padding-top:2px}
.unlocked .mail-detail-meta{animation:metaOpen .22s var(--ui-ease) both}
.unlocked .inbox-empty{padding:54px 24px}
.unlocked .cd-badge{animation:none}
.unlocked .status{border:1px solid var(--border)}

/* Delete button & confirm */
.mail-del-btn{display:inline-flex;align-items:center;justify-content:center;background:none;border:1px solid transparent;cursor:pointer;padding:5px;border-radius:6px;color:var(--t4);transition:color var(--ui-fast) var(--ui-ease),background var(--ui-fast) var(--ui-ease),border-color var(--ui-fast) var(--ui-ease);margin-left:6px}
.mail-del-btn:hover{color:var(--red);background:var(--red-a);border-color:rgba(212,101,74,.15)}
.mail-del-confirm{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--s4);border:1px solid var(--border-h);border-radius:10px;margin:10px 16px 12px;animation:uiIn .18s var(--ui-ease) both}
.mail-del-confirm>span{font-size:.78rem;color:var(--t2);font-weight:500;flex:1}
.mail-del-confirm>svg{color:var(--red)}
.mail-del-actions{display:flex;gap:6px;flex-shrink:0}
.mail-del-cancel{font-family:inherit}
.mail-del-go{background:var(--red)!important;border:none!important;color:#fff!important;font-family:inherit}
.mail-del-go:hover{background:#c44a32!important}
.unlocked .mail-item.deleting{opacity:0;transform:translateX(-16px);max-height:0;padding:0;margin:0;border:0;overflow:hidden;transition:opacity .22s var(--ui-ease),transform .22s var(--ui-ease),max-height .28s .08s var(--ui-ease),padding .28s .08s var(--ui-ease),margin .28s .08s var(--ui-ease)}

/* ═══════════════════════════════════════
   LANDING — editorial composition (v5.1)
   ═══════════════════════════════════════ */
.landing-shell{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 56px}
.landing-panel{width:min(720px,100%);padding:clamp(18px,4vw,42px) 0 0}

.landing-brandline{display:flex;align-items:center;gap:10px;margin-bottom:46px;opacity:0;animation:uiIn .65s var(--ui-ease) forwards}
.landing-mark{width:8px;height:8px;border-radius:50%;background:var(--forest);box-shadow:0 0 0 5px var(--forest-a)}
.landing-kicker{font-size:.625rem;letter-spacing:.16em;font-weight:700;color:var(--t3);text-transform:uppercase}

.landing-copy{max-width:650px;opacity:0;animation:uiIn .7s .06s var(--ui-ease) forwards}
.landing-title{font-size:clamp(2.7rem,7vw,5.2rem);line-height:.98;letter-spacing:-.06em;font-weight:700;margin:0 0 24px;color:var(--t1)}
.landing-title em{font-style:normal;color:var(--t2);font-weight:400}
.landing-lede{max-width:540px;font-size:clamp(.95rem,1.7vw,1.05rem);line-height:1.7;color:var(--t2)}

.landing-access{margin-top:54px;border-top:1px solid var(--border-h);border-bottom:1px solid var(--border-h);padding:18px 0 8px;opacity:0;animation:uiIn .7s .13s var(--ui-ease) forwards}
.landing-access-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.landing-access-note{font-size:.72rem;color:var(--t4)}
.landing-url{font-family:'JetBrains Mono',monospace;font-size:clamp(.78rem,1.8vw,.88rem);color:var(--t3);padding:14px 0 22px;overflow:auto;white-space:nowrap}
.landing-url strong{color:var(--forest);font-weight:600}
.landing-rule{height:1px;background:var(--border);margin-bottom:2px}
.landing-step{display:grid;grid-template-columns:42px 1fr;gap:8px;padding:15px 0;border-bottom:1px solid var(--border);transition:padding-left var(--ui-base) var(--ui-ease)}
.landing-step:last-child{border-bottom:0}
.landing-step>span{font-family:'JetBrains Mono',monospace;font-size:.68rem;color:var(--forest);padding-top:3px}
.landing-step p{font-size:.86rem;color:var(--t2);line-height:1.5;margin:0}
.landing-step:hover{padding-left:5px}
.landing-footnote{font-size:.72rem;color:var(--t4);margin-top:22px;opacity:0;animation:uiIn .7s .2s var(--ui-ease) forwards}
.landing-foot{margin-top:48px;padding-top:20px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;opacity:0;animation:uiIn .7s .26s var(--ui-ease) forwards}
.landing-foot-dot{width:5px;height:5px;border-radius:50%;background:var(--forest);opacity:.5}
.landing-foot-text{font-size:.68rem;color:var(--t4);letter-spacing:.04em}

/* ═══════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════ */
@keyframes uiIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes uiPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes uiTab{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@keyframes mailOpen{from{opacity:0;transform:translateY(-5px);clip-path:inset(0 0 8% 0)}to{opacity:1;transform:none;clip-path:inset(0)}}
@keyframes metaOpen{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}

.fade-up{animation:uiIn .5s var(--ui-ease) both}
.fade-up-d1{animation-delay:70ms}
.fade-up-d2{animation-delay:120ms}
.fade-up-d3{animation-delay:170ms}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important;scroll-behavior:auto!important}}

/* ═══════════════════════════════════════
   RESPONSIVE — mobile
   ═══════════════════════════════════════ */
@media(max-width:720px){
  .admin-dash .stats{grid-template-columns:1fr;gap:6px}
  .admin-dash .stat{flex-direction:row;align-items:center;justify-content:space-between}
  .unlocked .card-header{align-items:flex-start}
  .unlocked .mail-row{padding-left:12px;padding-right:12px}
  .unlocked .mail-row:hover{padding-left:14px}
  .unlocked .mail-right{display:none}
}
@media(max-width:639px){
  .landing-shell{padding:80px 20px 40px}
  .landing-brandline{margin-bottom:34px}
  .landing-title{font-size:clamp(2.2rem,12vw,3.5rem)}
  .landing-access{margin-top:36px}
  .landing-step{grid-template-columns:34px 1fr}
  .landing-foot{margin-top:36px}
}
`;
}
