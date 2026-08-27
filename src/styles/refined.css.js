export function getRefinedCSS() {
  return `
/* ═══════════════════════════════════════
   PasteNote — Refined Visual Layer v8
   Bg art on all pages, clean overrides
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   BACKGROUND ART — subtle on all pages
   Strong grid on lock/admin-login
   ═══════════════════════════════════════ */

/* Subtle dot-grid + radial glow on every page */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:
    radial-gradient(ellipse 800px 500px at 50% 30%,rgba(62,207,142,.04),transparent 70%),
    radial-gradient(circle 1px at center,var(--border) .5px,transparent .5px);
  background-size:100% 100%,48px 48px;
  opacity:.6;
  mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,#000 15%,transparent 80%);
  -webkit-mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,#000 15%,transparent 80%);
}
body>*{position:relative;z-index:1}

/* Lock & Admin login — strong grid */
.locked .page-center,
.admin-login .page-center{position:relative;overflow:hidden}
.locked .page-center::before,
.admin-login .page-center::before{
  content:'';position:absolute;inset:0;
  background-image:
    radial-gradient(ellipse 640px 420px at 50% 38%,rgba(62,207,142,.09),transparent 65%),
    linear-gradient(var(--border) 1px,transparent 1px),
    linear-gradient(90deg,var(--border) 1px,transparent 1px);
  background-size:100% 100%,42px 42px,42px 42px;
  opacity:1;
  mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000 10%,transparent 75%);
  -webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000 10%,transparent 75%);
  pointer-events:none;z-index:0;
}
.locked .page-center>*,
.admin-login .page-center>*{position:relative;z-index:1}

/* Light mode — warm-tinted grid */
[data-theme="light"] body::before{
  background-image:
    radial-gradient(ellipse 800px 500px at 50% 30%,rgba(26,143,92,.03),transparent 70%),
    radial-gradient(circle 1px at center,var(--border) .5px,transparent .5px);
  opacity:.5;
}
[data-theme="light"] .locked .page-center::before,
[data-theme="light"] .admin-login .page-center::before{
  background-image:
    radial-gradient(ellipse 640px 420px at 50% 38%,rgba(26,143,92,.06),transparent 65%),
    linear-gradient(var(--border) 1px,transparent 1px),
    linear-gradient(90deg,var(--border) 1px,transparent 1px);
}

/* ═══════════════════════════════════════
   HEADER — overrides
   ═══════════════════════════════════════ */
.brand-name{letter-spacing:-.015em}
.hdr{padding:16px 0;height:auto}

/* ═══════════════════════════════════════
   NAV PILLS (admin tabs)
   ═══════════════════════════════════════ */
.nav-pills{background:transparent;border:0;padding:0;gap:4px}
.nav-pill{padding:7px 13px;border-radius:8px;color:var(--t3);transition:background .15s,color .15s}
.nav-pill:hover{background:var(--s3);color:var(--t1)}
.nav-pill.active{background:var(--s3);color:var(--t1);box-shadow:none}

/* ═══════════════════════════════════════
   LOCK & ADMIN LOGIN cards
   ═══════════════════════════════════════ */
.lock-card{max-width:376px;overflow:visible;animation:rise .5s cubic-bezier(.22,1,.36,1) both}
.alogin-card{overflow:visible;animation:rise .5s cubic-bezier(.22,1,.36,1) both}
.nf-card{animation:rise .5s cubic-bezier(.22,1,.36,1) both}
.nf-code{opacity:.6}

/* Lock foot text */
.lock-foot{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.05em;color:var(--t4);text-align:center;text-transform:uppercase;margin-top:18px}

/* ═══════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════ */
.admin-dash .page{max-width:1280px;padding-top:88px}
.admin-dash .stats{grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
.admin-dash .stat{position:relative;padding:16px 18px;border-radius:12px;background:transparent;box-shadow:none;transition:background .18s,border-color .18s,transform .18s}
.admin-dash .stat:hover{transform:translateY(-2px);background:var(--s2);box-shadow:none}
.admin-dash .stat:nth-child(1),.admin-dash .stat:nth-child(2),.admin-dash .stat:nth-child(3){border-left:1px solid var(--border-h)}
.admin-dash .stat-num{font-size:1.9rem;letter-spacing:-.04em}
.admin-dash .stat-name{font-size:10px}
.admin-dash .card{overflow:hidden}
.admin-dash .card-header{padding:14px 18px}
.admin-dash .card-body{padding:10px 18px 16px}
.admin-dash .tbl{min-width:720px;border-spacing:0 4px}
.admin-dash .tbl thead th{background:transparent;border:0;padding:8px 12px;color:var(--t4);font-size:10px}
.admin-dash .tbl tbody tr{background:transparent;transition:background .15s,transform .15s}
.admin-dash .tbl tbody tr:hover{background:var(--s3);transform:translateX(2px)}
.admin-dash .tbl tbody td{border-top:1px solid transparent;border-bottom:1px solid transparent;padding:12px}
.admin-dash .tbl tbody tr:hover td{border-color:var(--border)}
.admin-dash .tbl-link,.admin-dash .tbl tbody td:nth-child(3){font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--forest)}
.admin-dash .badge{padding:3px 7px;font-size:9px;letter-spacing:.06em}
.admin-dash .field-actions{position:sticky;bottom:0;padding:14px 0;background:linear-gradient(transparent,var(--s2) 25%)}
.admin-dash .tab{animation:uiTab .25s cubic-bezier(.22,1,.36,1) both}

/* ═══════════════════════════════════════
   UNLOCKED — visitor inbox overrides
   ═══════════════════════════════════════ */
.unlocked .mail-item{background:transparent;border-bottom:none}
.unlocked .mail-item.expanded{margin:4px 0;background:var(--s3);border:1px solid var(--border);border-radius:12px}
.unlocked .mail-detail{animation:mailOpen .28s cubic-bezier(.22,1,.36,1) both;padding-top:2px}
.unlocked .mail-detail-meta{animation:metaOpen .22s cubic-bezier(.22,1,.36,1) both}
.unlocked .inbox-empty{padding:54px 24px}
.unlocked .cd-badge{animation:none}

/* Delete button & confirm */
.mail-del-btn{display:inline-flex;align-items:center;justify-content:center;background:none;border:1px solid transparent;cursor:pointer;padding:5px;border-radius:999px;color:var(--t4);transition:color .15s,background .15s,border-color .15s;margin-left:4px;width:30px;height:30px}
.mail-del-btn:hover{color:var(--red);background:var(--red-a);border-color:rgba(229,98,94,.15)}
.mail-del-btn svg{width:14px;height:14px}
.mail-del-confirm{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--s4);border:1px solid var(--border-h);border-radius:10px;margin:10px 12px 12px;animation:rise .18s cubic-bezier(.22,1,.36,1) both}
.mail-del-confirm>span{font-size:12px;color:var(--t2);font-weight:500;flex:1}
.mail-del-confirm>svg{color:var(--red)}
.mail-del-actions{display:flex;gap:6px;flex-shrink:0}
.mail-del-cancel{font-family:inherit}
.mail-del-go{background:var(--red)!important;border:none!important;color:#fff!important;font-family:inherit}
.mail-del-go:hover{background:#c44a32!important}
.unlocked .mail-item.deleting{opacity:0;transform:translateX(-16px);max-height:0;padding:0;margin:0;border:0;overflow:hidden;transition:opacity .22s,transform .22s,max-height .28s .08s,padding .28s .08s,margin .28s .08s}

/* ═══════════════════════════════════════
   LANDING
   ═══════════════════════════════════════ */
.landing-shell{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 56px}
.landing-panel{width:min(720px,100%);padding:clamp(18px,4vw,42px) 0 0}

.landing-brandline{display:flex;align-items:center;gap:10px;margin-bottom:46px;opacity:0;animation:rise .65s cubic-bezier(.22,1,.36,1) forwards}
.landing-mark{width:8px;height:8px;border-radius:50%;background:var(--forest);box-shadow:0 0 0 5px var(--forest-a)}
.landing-kicker{font-size:10px;letter-spacing:.16em;font-weight:700;color:var(--t3);text-transform:uppercase}

.landing-copy{max-width:650px;opacity:0;animation:rise .7s .06s cubic-bezier(.22,1,.36,1) forwards}
.landing-title{font-size:clamp(2.7rem,7vw,5.2rem);line-height:.98;letter-spacing:-.06em;font-weight:700;margin:0 0 24px;color:var(--t1)}
.landing-title em{font-style:normal;color:var(--t2);font-weight:400}
.landing-lede{max-width:540px;font-size:clamp(14px,1.7vw,16px);line-height:1.7;color:var(--t2)}

.landing-access{margin-top:54px;border-top:1px solid var(--border-h);border-bottom:1px solid var(--border-h);padding:18px 0 8px;opacity:0;animation:rise .7s .13s cubic-bezier(.22,1,.36,1) forwards}
.landing-access-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.landing-access-note{font-size:11px;color:var(--t4)}
.landing-url{font-family:'JetBrains Mono',monospace;font-size:clamp(12px,1.8vw,14px);color:var(--t3);padding:14px 0 22px;overflow:auto;white-space:nowrap}
.landing-url strong{color:var(--forest);font-weight:600}
.landing-rule{height:1px;background:var(--border);margin-bottom:2px}
.landing-step{display:grid;grid-template-columns:42px 1fr;gap:8px;padding:15px 0;border-bottom:1px solid var(--border);transition:padding-left .18s,background .15s}
.landing-step:last-child{border-bottom:0}
.landing-step>span{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--forest);padding-top:3px;opacity:.6}
.landing-step p{font-size:13.5px;color:var(--t2);line-height:1.5;margin:0}
.landing-step:hover{padding-left:5px;background:rgba(255,255,255,.02)}
.landing-footnote{font-size:11px;color:var(--t4);margin-top:22px;opacity:0;animation:rise .7s .2s cubic-bezier(.22,1,.36,1) forwards}
.landing-foot{margin-top:48px;padding-top:20px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;opacity:0;animation:rise .7s .26s cubic-bezier(.22,1,.36,1) forwards}
.landing-foot-dot{width:5px;height:5px;border-radius:50%;background:var(--forest);opacity:.5}
.landing-foot-text{font-size:11px;color:var(--t4);letter-spacing:.04em}

/* ═══════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════ */
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.15)}
[data-theme="light"] ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1)}
[data-theme="light"] ::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.18)}

/* ═══════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════ */
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes uiTab{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@keyframes mailOpen{from{opacity:0;transform:translateY(-5px);clip-path:inset(0 0 8% 0)}to{opacity:1;transform:none;clip-path:inset(0)}}
@keyframes metaOpen{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}

.fade-up{animation:rise .5s cubic-bezier(.22,1,.36,1) both}
.fade-up-d1{animation-delay:70ms}
.fade-up-d2{animation-delay:120ms}
.fade-up-d3{animation-delay:170ms}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important;scroll-behavior:auto!important}}

/* ═══════════════════════════════════════
   RESPONSIVE — refined overrides
   ═══════════════════════════════════════ */
@media(max-width:720px){
  .admin-dash .stats{grid-template-columns:1fr;gap:6px}
  .admin-dash .stat{flex-direction:row;align-items:center;justify-content:space-between}
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
