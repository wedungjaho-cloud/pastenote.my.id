/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — Design System v4 (Awwwards-grade)
 *  Font: Inter Variable (single family, weight 400-700)
 *  Palette: Sage #BFC6C4 · Cream #E8E2D8 · Forest #6F8F72 · Amber #F2A65A
 *  Motion: cubic-bezier easing, 200-300ms, purposeful micro-interactions
 * ═══════════════════════════════════════════════════════════
 */

export function getMainCSS() {
  return CSS;
}

const CSS = `
/* ═══ RESET ═══ */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

/* ═══════════════════════════════════════
   DARK THEME
   ═══════════════════════════════════════ */
:root,[data-theme="dark"]{
  /* Surface — near-black */
  --s0:#0a0a09;  /* deepest bg */
  --s1:#0f0f0e;  /* page bg */
  --s2:#161614;  /* card bg */
  --s3:#1c1c19;  /* raised */
  --s4:#242421;  /* hover */
  --s5:#2e2e2a;  /* active */

  /* Text — cream tones */
  --t1:#E8E2D8;  /* primary */
  --t2:#BFC6C4;  /* secondary — sage */
  --t3:#8a8e8c;  /* muted */
  --t4:#5d615f;  /* disabled */

  /* Palette */
  --sage:#BFC6C4;
  --cream:#E8E2D8;
  --forest:#6F8F72;
  --forest-h:#82a385;
  --forest-a:rgba(111,143,114,.12);
  --amber:#F2A65A;
  --amber-h:#f5b46e;
  --amber-a:rgba(242,166,90,.10);

  /* Semantic */
  --red:#D4654A;
  --red-a:rgba(212,101,74,.10);

  /* Surface utils */
  --border:rgba(191,198,196,.06);
  --border-h:rgba(191,198,196,.12);
  --glass:rgba(10,10,9,.88);
  --on-forest:#0a0a09;
  --on-amber:#0a0a09;

  /* Elevation */
  --sh1:0 1px 2px rgba(0,0,0,.3);
  --sh2:0 4px 12px rgba(0,0,0,.25);
  --sh3:0 8px 30px rgba(0,0,0,.35);
  --sh4:0 16px 48px rgba(0,0,0,.4);
  --focus:0 0 0 2px var(--forest),0 0 0 4px var(--forest-a);

  color-scheme:dark;
}

/* ═══════════════════════════════════════
   LIGHT THEME
   ═══════════════════════════════════════ */
[data-theme="light"]{
  --s0:#EDE9E3;
  --s1:#F5F2ED;
  --s2:#FFFFFF;
  --s3:#FFFFFF;
  --s4:#F0EDE7;
  --s5:#E8E4DE;

  --t1:#1a1a17;
  --t2:#4a4d4b;
  --t3:#7a7d7b;
  --t4:#a0a3a1;

  --sage:#9a9f9d;
  --cream:#F5F2ED;
  --forest:#4A7A4E;
  --forest-h:#3d6940;
  --forest-a:rgba(74,122,78,.08);
  --amber:#D4872E;
  --amber-h:#c07a28;
  --amber-a:rgba(212,135,46,.08);

  --red:#C14532;
  --red-a:rgba(193,69,50,.06);

  --border:rgba(42,42,38,.06);
  --border-h:rgba(42,42,38,.12);
  --glass:rgba(245,242,237,.88);
  --on-forest:#fff;
  --on-amber:#fff;

  --sh1:0 1px 2px rgba(0,0,0,.04);
  --sh2:0 4px 12px rgba(0,0,0,.05);
  --sh3:0 8px 30px rgba(0,0,0,.06);
  --sh4:0 16px 48px rgba(0,0,0,.08);
  --focus:0 0 0 2px var(--forest),0 0 0 4px var(--forest-a);

  color-scheme:light;
}

/* ═══ CONSTANTS ═══ */
:root{
  --ease:cubic-bezier(.4,0,.2,1);
  --ease-out:cubic-bezier(0,0,.2,1);
  --ease-spring:cubic-bezier(.34,1.56,.64,1);
  --dur:220ms;
  --dur-slow:350ms;
}


/* ═══════════════════════════════════════
   BASE
   ═══════════════════════════════════════ */
html{font-size:16px;scroll-behavior:smooth}

body{
  font-family:'Inter',system-ui,-apple-system,sans-serif;
  background:var(--s1);
  color:var(--t1);
  line-height:1.5;
  min-height:100vh;
  display:flex;flex-direction:column;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  font-feature-settings:'cv11','ss01';
}

a{color:var(--forest);text-decoration:none;transition:color var(--dur) var(--ease)}
a:hover{color:var(--forest-h)}

code{
  font-family:'JetBrains Mono',monospace;
  background:var(--forest-a);color:var(--forest);
  padding:2px 6px;border-radius:4px;font-size:.8125em;
  font-weight:500;
}

::selection{background:var(--forest);color:var(--on-forest)}

/* Focus visible */
:focus-visible{outline:none;box-shadow:var(--focus)}


/* ═══════════════════════════════════════
   ICONS (SVG inline)
   ═══════════════════════════════════════ */
.i{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.i svg{width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
.i-16 svg{width:16px;height:16px}
.i-20 svg{width:20px;height:20px}
.i-24 svg{width:24px;height:24px}
.i-32 svg{width:32px;height:32px}


/* ═══════════════════════════════════════
   TYPOGRAPHY (Inter weight hierarchy)
   Display 32/700 → H1 24/700 → H2 18/600
   → Body 15/400 → Small 13/400 → Label 11/600
   ═══════════════════════════════════════ */
h1,.h1{font-size:1.5rem;font-weight:700;line-height:1.25;letter-spacing:-.02em}
h2,.h2{font-size:1.125rem;font-weight:600;line-height:1.35;letter-spacing:-.01em}
h3,.h3{font-size:1rem;font-weight:600;line-height:1.4}

.display{font-size:2rem;font-weight:700;line-height:1.2;letter-spacing:-.03em}

.text-sm{font-size:.8125rem}
.text-xs{font-size:.6875rem}
.text-mono{font-family:'JetBrains Mono',monospace;font-size:.8125rem}

.label{
  font-size:.6875rem;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;
  color:var(--t3);
}

.text-t2{color:var(--t2)}
.text-t3{color:var(--t3)}
.text-forest{color:var(--forest)}
.text-amber{color:var(--amber)}
.text-red{color:var(--red)}


/* ═══════════════════════════════════════
   HEADER — glass nav, present on ALL pages
   ═══════════════════════════════════════ */
.hdr{
  position:fixed;top:0;left:0;right:0;height:56px;
  background:var(--glass);
  backdrop-filter:blur(24px) saturate(1.4);
  -webkit-backdrop-filter:blur(24px) saturate(1.4);
  border-bottom:1px solid var(--border);
  z-index:100;
  display:flex;align-items:center;justify-content:center;
  transition:background var(--dur) var(--ease);
}

.hdr-in{
  max-width:1280px;width:100%;
  padding:0 24px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}

.brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--t1)}
.brand:hover{color:var(--t1)}
.brand-name{font-size:1.0625rem;font-weight:700;letter-spacing:-.025em}
.brand-dot{color:var(--forest)}
.brand-tag{
  font-size:.5625rem;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;
  color:var(--amber);background:var(--amber-a);
  padding:2px 6px;border-radius:99px;
  transition:transform var(--dur) var(--ease-spring);
}
.brand:hover .brand-tag{transform:scale(1.05)}

.hdr-r{display:flex;align-items:center;gap:6px}

.hdr-email{
  font-family:'JetBrains Mono',monospace;font-size:.75rem;
  color:var(--t3);
}

/* Theme toggle — amber accent */
.theme-btn{
  width:34px;height:34px;
  display:flex;align-items:center;justify-content:center;
  background:var(--amber-a);border:1px solid transparent;
  border-radius:8px;color:var(--amber);cursor:pointer;
  transition:all var(--dur) var(--ease);
}
.theme-btn:hover{
  background:var(--amber);color:var(--on-amber);
  transform:rotate(15deg);
  box-shadow:0 0 16px var(--amber-a);
}
.theme-btn:active{transform:rotate(15deg) scale(.92)}


/* ═══ ADMIN NAV ═══ */
.nav-pills{
  display:flex;background:var(--s2);
  border:1px solid var(--border);border-radius:10px;
  padding:3px;gap:2px;
}
.nav-pill{
  background:none;border:none;
  color:var(--t3);font-family:inherit;
  font-size:.8125rem;font-weight:500;
  padding:6px 16px;border-radius:8px;
  cursor:pointer;
  transition:all var(--dur) var(--ease);
  position:relative;
}
.nav-pill:hover{color:var(--t1)}
.nav-pill.active{
  color:var(--t1);background:var(--s4);
  font-weight:600;box-shadow:var(--sh1);
}


/* ═══════════════════════════════════════
   PAGE WRAPPER
   ═══════════════════════════════════════ */
.page{flex:1;max-width:1280px;width:100%;margin:0 auto;padding:80px 24px 40px}

/* centered page (login, locked, 404, landing) */
.page-center{
  flex:1;display:flex;align-items:center;justify-content:center;
  padding:80px 24px 40px;
}


/* ═══════════════════════════════════════
   CARD — main container
   ═══════════════════════════════════════ */
.card{
  background:var(--s2);
  border:1px solid var(--border);
  border-radius:16px;
  transition:border-color var(--dur) var(--ease),box-shadow var(--dur) var(--ease);
}
.card:hover{border-color:var(--border-h)}
.card-header{
  padding:16px 20px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  border-bottom:1px solid var(--border);
}
.card-header-l{display:flex;align-items:center;gap:10px}
.card-header-r{display:flex;align-items:center;gap:8px}
.card-body{padding:16px 20px}

.card-icon{
  width:34px;height:34px;
  display:flex;align-items:center;justify-content:center;
  border-radius:10px;
  transition:transform var(--dur) var(--ease-spring);
}
.card:hover .card-icon{transform:scale(1.08) rotate(-2deg)}
.card-icon.forest{color:var(--forest);background:var(--forest-a)}
.card-icon.amber{color:var(--amber);background:var(--amber-a)}
.card-icon.sage{color:var(--sage);background:rgba(191,198,196,.12)}


/* ═══════════════════════════════════════
   BUTTONS — with micro-animations
   ═══════════════════════════════════════ */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  font-family:inherit;font-size:.8125rem;font-weight:600;
  padding:8px 16px;border:none;border-radius:8px;
  cursor:pointer;white-space:nowrap;text-decoration:none;
  transition:all var(--dur) var(--ease);
  position:relative;overflow:hidden;
}
.btn::after{
  content:'';position:absolute;inset:0;
  background:currentColor;opacity:0;
  transition:opacity var(--dur) var(--ease);
}
.btn:hover::after{opacity:.06}
.btn:active{transform:scale(.97);transition-duration:80ms}

/* Primary — forest green */
.btn-p{background:var(--forest);color:var(--on-forest)}
.btn-p:hover{background:var(--forest-h);box-shadow:0 2px 12px var(--forest-a)}

/* Accent — amber */
.btn-a{background:var(--amber);color:var(--on-amber)}
.btn-a:hover{background:var(--amber-h);box-shadow:0 2px 12px var(--amber-a)}

/* Secondary */
.btn-s{background:transparent;border:1px solid var(--border-h);color:var(--t1)}
.btn-s:hover{background:var(--s4);border-color:var(--border-h)}

/* Ghost */
.btn-g{background:transparent;color:var(--t2);border:none}
.btn-g:hover{background:var(--s4);color:var(--t1)}

.btn-danger{color:var(--red) !important}
.btn-danger:hover{background:var(--red-a) !important}
.btn-confirming{color:#fff !important;background:var(--red) !important}

.btn-sm{font-size:.75rem;padding:5px 10px;border-radius:6px}
.btn-full{width:100%;padding:10px 16px;font-size:.875rem;border-radius:10px}

/* Spinner */
.spinner{
  width:14px;height:14px;
  border:2px solid rgba(255,255,255,.2);
  border-top-color:currentColor;
  border-radius:50%;animation:spin .5s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
.btn-loader{display:inline-flex;align-items:center}


/* ═══════════════════════════════════════
   INPUTS — with focus animation
   ═══════════════════════════════════════ */
.inp{
  width:100%;font-family:inherit;font-size:.9375rem;
  color:var(--t1);background:var(--s0);
  border:1px solid var(--border);border-radius:10px;
  padding:10px 14px;outline:none;
  transition:all var(--dur) var(--ease);
}
.inp::placeholder{color:var(--t4)}
.inp:hover{border-color:var(--border-h)}
.inp:focus{border-color:var(--forest);box-shadow:var(--focus);background:var(--s1)}

.inp-ta{resize:vertical;min-height:90px;line-height:1.6}
.inp-mono{font-family:'JetBrains Mono',monospace;font-size:.8125rem}

.field{margin-bottom:16px}
.field-label{
  display:block;font-size:.6875rem;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;
  color:var(--t3);margin-bottom:6px;
}
.field-hint{display:block;font-size:.75rem;color:var(--t3);margin-top:4px}
.field-row{display:flex;align-items:center;gap:12px}
.field-actions{padding-top:6px}


/* ═══ TOGGLE ═══ */
.toggle{position:relative;display:inline-block;width:40px;height:22px;cursor:pointer}
.toggle input{display:none}
.toggle-track{
  position:absolute;inset:0;
  background:var(--s5);border-radius:99px;
  transition:background var(--dur) var(--ease);
}
.toggle-track::before{
  content:'';position:absolute;
  width:16px;height:16px;left:3px;top:3px;
  background:var(--t1);border-radius:50%;
  transition:transform var(--dur) var(--ease-spring);
  box-shadow:var(--sh1);
}
.toggle input:checked+.toggle-track{background:var(--forest)}
.toggle input:checked+.toggle-track::before{
  transform:translateX(18px);background:var(--on-forest);
}


/* ═══ CUSTOM CHECKBOX ═══ */
.tbl input[type="checkbox"],
.page-cb,
#selectAll{
  appearance:none;-webkit-appearance:none;
  width:16px;height:16px;border-radius:4px;
  border:1.5px solid var(--border-h);background:var(--s3);
  cursor:pointer;position:relative;flex-shrink:0;
  transition:all var(--dur) var(--ease);
}
.tbl input[type="checkbox"]:hover,
.page-cb:hover,
#selectAll:hover{
  border-color:var(--forest);background:var(--forest-a);
}
.tbl input[type="checkbox"]:checked,
.page-cb:checked,
#selectAll:checked{
  background:var(--forest);border-color:var(--forest);
}
.tbl input[type="checkbox"]:checked::after,
.page-cb:checked::after,
#selectAll:checked::after{
  content:'';position:absolute;
  left:4.5px;top:1.5px;width:5px;height:9px;
  border:solid var(--on-forest);border-width:0 2px 2px 0;
  transform:rotate(45deg);
}
.tbl input[type="checkbox"]:focus-visible,
.page-cb:focus-visible,
#selectAll:focus-visible{
  box-shadow:var(--focus);
}


/* ═══════════════════════════════════════
   BADGES
   ═══════════════════════════════════════ */
.badge{
  display:inline-flex;align-items:center;
  font-size:.625rem;font-weight:700;
  letter-spacing:.04em;text-transform:uppercase;
  padding:3px 8px;border-radius:99px;
}
.badge-g{background:var(--forest-a);color:var(--forest)}
.badge-r{background:var(--red-a);color:var(--red)}
.badge-a{background:var(--amber-a);color:var(--amber)}

.status{
  display:flex;align-items:center;gap:8px;
  padding:8px 14px;border-radius:8px;
  font-size:.8125rem;margin:10px 0;
}
.status-ok{background:var(--forest-a);color:var(--forest)}
.status-err{background:var(--red-a);color:var(--red)}
.status-load{background:var(--amber-a);color:var(--amber)}


/* ═══════════════════════════════════════
   STATS — Bento grid
   ═══════════════════════════════════════ */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}

.stat{
  background:var(--s2);border:1px solid var(--border);border-radius:14px;
  padding:18px 20px;
  display:flex;flex-direction:column;gap:6px;
  transition:all var(--dur) var(--ease);
}
.stat:hover{
  border-color:var(--border-h);
  transform:translateY(-1px);
  box-shadow:var(--sh2);
}
.stat:nth-child(1){border-left:3px solid var(--forest)}
.stat:nth-child(2){border-left:3px solid var(--amber)}
.stat:nth-child(3){border-left:3px solid var(--sage)}

.stat-num{font-size:1.75rem;font-weight:700;letter-spacing:-.03em;line-height:1;color:var(--t1)}
.stat-name{font-size:.6875rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.stat-inline{font-size:.8125rem;color:var(--t2);font-weight:500}

.btn-danger{color:var(--red) !important;border-color:var(--red-a) !important}
.btn-danger:hover{background:var(--red-a) !important}
.btn-confirming{background:var(--red) !important;color:var(--on-forest) !important;border-color:var(--red) !important}



/* ═══════════════════════════════════════
   TABLE — scrollable, compact
   ═══════════════════════════════════════ */
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}

.tbl{width:100%;border-collapse:separate;border-spacing:0;font-size:.8125rem;min-width:520px}
.tbl thead th{
  font-size:.6875rem;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;
  color:var(--t3);padding:8px 12px;text-align:left;
  border-bottom:1px solid var(--border);
  white-space:nowrap;position:sticky;top:0;background:var(--s2);
}
.tbl tbody td{padding:10px 12px;vertical-align:middle;color:var(--t1);white-space:nowrap}
.tbl tbody tr{transition:background var(--dur) var(--ease)}
.tbl tbody tr:hover{background:var(--s4)}

.tbl-link{
  color:var(--forest);font-family:'JetBrains Mono',monospace;font-size:.75rem;
  transition:color var(--dur) var(--ease);
}
.tbl-link:hover{color:var(--forest-h)}

.empty{text-align:center;padding:40px 24px;color:var(--t3);font-size:.875rem}


/* ═══════════════════════════════════════
   LANDING
   ═══════════════════════════════════════ */
.land-card{max-width:400px;width:100%;text-align:center}
.land-title{margin-bottom:8px}
.land-title .brand-name{font-size:1.75rem}
.land-sub{font-size:.9375rem;color:var(--t2);margin-bottom:28px;line-height:1.6}

.info-box{
  background:var(--s2);border:1px solid var(--border);
  border-radius:14px;padding:20px;text-align:left;margin-bottom:20px;
  transition:border-color var(--dur) var(--ease);
}
.info-box:hover{border-color:var(--border-h)}

.info-label{
  font-size:.6875rem;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--amber);
  margin-bottom:14px;padding-bottom:10px;
  border-bottom:1px solid var(--border);
}
.steps{list-style:none;counter-reset:st;padding:0}
.steps li{
  counter-increment:st;position:relative;
  padding-left:28px;margin-bottom:14px;
  font-size:.875rem;line-height:1.6;color:var(--t2);
}
.steps li::before{
  content:counter(st);position:absolute;left:0;top:2px;
  width:18px;height:18px;display:flex;align-items:center;justify-content:center;
  background:var(--forest-a);color:var(--forest);border-radius:99px;
  font-size:.625rem;font-weight:800;font-family:'JetBrains Mono',monospace;
}
.steps li:last-child{margin-bottom:0}
.hl{color:var(--amber);font-weight:600}
.land-muted{font-size:.75rem;color:var(--t4)}


/* ═══════════════════════════════════════
   LOCKED
   ═══════════════════════════════════════ */
.lock-card{
  max-width:360px;width:100%;
  background:var(--s2);border:1px solid var(--border);
  border-radius:20px;padding:36px 28px;text-align:center;
  transition:border-color var(--dur) var(--ease),box-shadow var(--dur-slow) var(--ease);
}
.lock-card:hover{border-color:var(--border-h);box-shadow:var(--sh3)}

.lock-icon{
  width:48px;height:48px;margin:0 auto 18px;
  display:flex;align-items:center;justify-content:center;
  background:var(--forest-a);border-radius:14px;color:var(--forest);
  transition:transform var(--dur-slow) var(--ease-spring);
}
.lock-card:hover .lock-icon{transform:scale(1.08) rotate(-3deg)}

.lock-title{font-size:1.25rem;font-weight:700;letter-spacing:-.015em;margin-bottom:4px}
.lock-sub{
  font-family:'JetBrains Mono',monospace;font-size:.75rem;
  color:var(--t3);margin-bottom:24px;word-break:break-all;
}
.lock-form{display:flex;flex-direction:column;gap:10px}
.lock-err{
  display:flex;align-items:center;gap:8px;
  padding:8px 12px;background:var(--red-a);color:var(--red);
  border-radius:8px;font-size:.8125rem;margin-top:8px;
  animation:shake .4s var(--ease);
}
@keyframes shake{
  0%,100%{transform:translateX(0)}
  25%{transform:translateX(-4px)}
  75%{transform:translateX(4px)}
}


/* ═══════════════════════════════════════
   UNLOCKED — note + inbox
   ═══════════════════════════════════════ */
.note-text{
  font-size:.9375rem;line-height:1.75;color:var(--t1);
  white-space:pre-wrap;
}

/* Inbox — Gmail-style */
.inbox-empty,.inbox-off{
  text-align:center;padding:40px 24px;
  color:var(--t3);font-size:.875rem;
}
.mail-list{display:flex;flex-direction:column}
.mail-row{
  display:flex;align-items:center;gap:12px;
  padding:12px 16px;
  cursor:pointer;transition:background var(--dur) var(--ease);
}
.mail-row:hover{background:var(--s4)}
.mail-row.unread{background:var(--s3)}
.mail-row.unread:hover{background:var(--s4)}

.mail-avatar{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:.875rem;color:#fff;
  background:var(--forest);text-transform:uppercase;
}
.mail-avatar.a1{background:#6F8F72}
.mail-avatar.a2{background:#7B8FA1}
.mail-avatar.a3{background:#A17B6F}
.mail-avatar.a4{background:#8F6FA1}
.mail-avatar.a5{background:#6F9FA1}

.mail-body{flex:1;min-width:0;overflow:hidden}
.mail-top{display:flex;align-items:baseline;gap:8px;margin-bottom:2px}
.mail-sender{font-weight:600;font-size:.8125rem;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mail-row.unread .mail-sender{font-weight:700}
.mail-time{font-size:.6875rem;color:var(--t3);white-space:nowrap;margin-left:auto;flex-shrink:0}
.mail-subj{
  font-size:.8125rem;font-weight:500;color:var(--t1);white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;display:block;
}
.mail-row.unread .mail-subj{font-weight:600}
.mail-preview{font-size:.75rem;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;margin-top:1px}

.mail-right{display:flex;align-items:center;gap:6px;flex-shrink:0}
.otp-cell{display:flex;align-items:center;gap:4px}
.otp-code{
  font-family:'JetBrains Mono',monospace;font-size:.8125rem;font-weight:700;
  color:var(--amber);background:var(--amber-a);
  padding:4px 10px;border-radius:6px;
  letter-spacing:.02em;white-space:nowrap;
  transition:transform var(--dur) var(--ease-spring);
}
.otp-code:hover{transform:scale(1.04)}
.copy-btn{
  font-family:inherit;font-size:.625rem;font-weight:600;
  background:transparent;border:1px solid var(--border);
  color:var(--t3);padding:3px 6px;border-radius:4px;
  cursor:pointer;transition:all var(--dur) var(--ease);
}
.copy-btn:hover{background:var(--s4);color:var(--t1);border-color:var(--border-h)}
.copy-btn.ok{background:var(--forest-a);color:var(--forest);border-color:var(--forest)}


/* ═══ AUTO REFRESH ═══ */
.ar-wrap{display:flex;align-items:center;gap:6px}
.sel-sm{
  font-family:inherit;font-size:.75rem;color:var(--t2);
  background:var(--s4);border:1px solid var(--border);
  border-radius:6px;padding:4px 8px;cursor:pointer;outline:none;
}
.sel-sm:focus{border-color:var(--forest)}
.cd-badge{
  font-family:'JetBrains Mono',monospace;font-size:.6875rem;font-weight:700;
  color:var(--amber);background:var(--amber-a);
  padding:2px 8px;border-radius:99px;
  animation:pulse 1s infinite;
}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}


/* ═══════════════════════════════════════
   MAIL DETAIL — Gmail-style inline expand
   ═══════════════════════════════════════ */
.mail-item{border-bottom:1px solid var(--border);transition:background var(--dur) var(--ease)}
.mail-item:last-child{border-bottom:none}
.mail-item.expanded{background:var(--s3);border-radius:12px;margin:4px 0;border:1px solid var(--border-h);border-bottom:1px solid var(--border-h)}
.mail-item.expanded .mail-row{border-bottom:none}

.mail-detail{
  padding:0 16px 16px 64px;
  animation:fadeSlide .2s var(--ease-out);
}
@keyframes fadeSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

/* Detail row: sender+toggle left, date+OTP right */
.mail-detail-row{
  display:flex;align-items:flex-start;justify-content:space-between;gap:16px;
  padding-bottom:12px;border-bottom:1px solid var(--border);margin-bottom:4px;
}
.mail-detail-left{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.mail-detail-sender{font-size:.8125rem;font-weight:600;color:var(--t1);line-height:1.4}
.mail-detail-addr{font-weight:400;color:var(--t3);font-size:.75rem}

/* Toggle button — clean, minimal */
.mail-toggle-btn{
  display:inline-flex;align-items:center;gap:3px;
  background:none;border:none;cursor:pointer;padding:0;
  font-family:inherit;font-size:.75rem;color:var(--t3);
  line-height:1.4;text-align:left;
}
.mail-toggle-btn:hover{color:var(--t2)}
.mail-toggle-ico{
  display:inline-block;width:0;height:0;
  border-left:3.5px solid transparent;border-right:3.5px solid transparent;
  border-top:4px solid var(--t3);
  transition:transform .2s var(--ease);
  margin-left:2px;flex-shrink:0;
}
.mail-toggle-ico.open{transform:rotate(180deg)}

/* Right side — date + OTP */
.mail-detail-right{
  display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;
}
.mail-detail-date{font-size:.6875rem;color:var(--t3);white-space:nowrap;line-height:1.4}

/* Collapsible meta table */
.mail-detail-meta{
  margin:8px 0;padding:10px 14px;
  background:var(--s4);border:1px solid var(--border);border-radius:8px;
  font-size:.8125rem;
  animation:fadeSlide .2s var(--ease-out);
}
.mail-meta-tbl{border-collapse:collapse;width:100%}
.mail-meta-tbl td{padding:3px 0;vertical-align:top}
.meta-k{color:var(--t3);font-weight:500;white-space:nowrap;padding-right:14px;width:1%}
.meta-v{color:var(--t1);word-break:break-all}

/* Email body */
.mail-detail-body{
  padding:12px 0 4px;min-height:100px;
}
.mail-detail-body iframe{border-radius:8px;background:#fff}

.otp-lg{font-size:1rem;padding:6px 14px}


/* ═══ TOAST ═══ */
.toast-box{
  position:fixed;bottom:20px;right:20px;
  z-index:300;display:flex;flex-direction:column;gap:6px;
}
.toast{
  display:flex;align-items:center;gap:8px;
  background:var(--s3);border:1px solid var(--border);
  border-radius:10px;padding:10px 16px;
  font-size:.8125rem;color:var(--t1);
  box-shadow:var(--sh3);
  animation:toastIn .25s var(--ease-out);
}
.toast.out{animation:toastOut .2s var(--ease) forwards}
@keyframes toastIn{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}
@keyframes toastOut{to{opacity:0;transform:translateY(4px) scale(.98)}}


/* ═══ 404 ═══ */
.nf-card{max-width:380px;width:100%;text-align:center}
.nf-code{font-size:4rem;font-weight:800;color:var(--t4);line-height:1;margin-bottom:6px;letter-spacing:-.04em}
.nf-title{font-size:1.25rem;font-weight:700;margin-bottom:6px}
.nf-desc{font-size:.875rem;color:var(--t2);margin-bottom:24px;line-height:1.6}


/* ═══ ADMIN LOGIN ═══ */
.alogin-card{
  max-width:340px;width:100%;
  background:var(--s2);border:1px solid var(--border);
  border-radius:20px;padding:36px 28px;text-align:center;
  transition:border-color var(--dur) var(--ease),box-shadow var(--dur-slow) var(--ease);
}
.alogin-card:hover{border-color:var(--border-h);box-shadow:var(--sh3)}

.alogin-icon{
  width:48px;height:48px;margin:0 auto 18px;
  display:flex;align-items:center;justify-content:center;
  background:var(--amber-a);border-radius:14px;color:var(--amber);
  transition:transform var(--dur-slow) var(--ease-spring);
}
.alogin-card:hover .alogin-icon{transform:scale(1.08) rotate(3deg)}

.alogin-title{font-size:1.25rem;font-weight:700;letter-spacing:-.015em;margin-bottom:4px}
.alogin-sub{font-size:.8125rem;color:var(--t3);margin-bottom:24px}
.inp-group{margin-bottom:10px}
.err-msg{
  display:flex;align-items:center;gap:8px;
  padding:8px 12px;background:var(--red-a);color:var(--red);
  border-radius:8px;font-size:.8125rem;margin-top:10px;
  animation:shake .4s var(--ease);
}


/* ═══ TOOLS ═══ */
.results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}
.results-2col{grid-template-columns:repeat(2,1fr)}
.result-box{
  background:var(--s3);border:1px solid var(--border);
  border-radius:10px;overflow:hidden;
  transition:border-color var(--dur) var(--ease);
}
.result-box:hover{border-color:var(--border-h)}
.result-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 12px;border-bottom:1px solid var(--border);
}
.result-tag{
  font-size:.6875rem;font-weight:700;
  letter-spacing:.05em;text-transform:uppercase;color:var(--t3);
}
.result-cnt{color:var(--forest);margin-left:4px}
.result-ta{
  width:100%;min-height:90px;padding:8px 12px;
  background:transparent;border:none;color:var(--t1);
  font-family:'JetBrains Mono',monospace;font-size:.75rem;
  line-height:1.5;resize:vertical;outline:none;
}
.box-ok .result-tag{color:var(--forest)}
.box-die .result-tag{color:var(--red)}
.box-err .result-tag{color:var(--amber)}

.fmt-stats{display:flex;gap:12px;margin-top:8px}
.fmt-out{
  margin-top:10px;background:var(--s3);
  border:1px solid var(--border);border-radius:10px;overflow:hidden;
}
.fmt-out-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 12px;border-bottom:1px solid var(--border);
  font-size:.8125rem;color:var(--t2);
}
.stat-inline{font-size:.8125rem;color:var(--t2)}
.stat-inline strong{color:var(--t1)}


/* ═══ FOOTER ═══ */
.ft{
  text-align:center;padding:16px 24px;
  color:var(--t4);font-size:.75rem;
  border-top:1px solid var(--border);
}


/* ═══════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════ */

/* Phone < 640 */
@media(max-width:639px){
  .hdr{height:auto;padding:10px 0}
  .hdr-in{padding:0 16px;flex-wrap:wrap;gap:2px 8px}
  .brand-name{font-size:.9375rem}
  .hdr-r{flex:0 0 100%;justify-content:space-between;gap:4px}
  .hdr-email{max-width:none;font-size:.625rem;overflow:visible;white-space:normal}

  .hdr.hdr-admin{height:auto;padding:10px 0}
  .hdr.hdr-admin .hdr-in{flex-wrap:wrap;justify-content:center;gap:8px}
  .hdr.hdr-admin .nav-pills{order:10;width:100%;justify-content:center}

  .page{padding:90px 16px 24px}
  .page-center{padding:90px 16px 24px}
  .hdr.hdr-admin~.page{padding-top:110px}

  .stats{grid-template-columns:1fr;gap:8px}
  .stat{flex-direction:row;align-items:center;justify-content:space-between;padding:12px 16px}
  .stat-num{font-size:1.375rem}

  .card-header{padding:12px 16px;flex-wrap:wrap;gap:8px}
  .card-body{padding:12px 16px}

  .results-grid,.results-2col{grid-template-columns:1fr}

  .land-title .brand-name{font-size:1.375rem}

  .lock-card,.alogin-card{padding:28px 20px;border-radius:16px}
  .lock-title,.alogin-title{font-size:1.125rem}

  .modal-bg{padding:12px}
  .modal{border-radius:16px}
  .modal-top{padding:16px 16px 4px}
  .modal-meta{padding:0 16px 8px}
  .modal-content{padding:0 16px 16px}

  .toast-box{left:16px;right:16px;bottom:16px}

  .mail-row{padding:10px 12px;gap:10px}
  .mail-avatar{width:32px;height:32px;font-size:.75rem}
  .mail-right{display:none}
  .mail-time{font-size:.625rem}
  .mail-detail{padding:0 12px 12px 12px}
  .mail-detail-row{flex-direction:column;gap:6px}
  .mail-detail-right{align-items:flex-start;flex-direction:row;gap:8px;flex-wrap:wrap}
  .mail-detail-meta{padding:8px 10px;font-size:.75rem}
  .meta-k{padding-right:8px}

  .nf-code{font-size:3rem}
  .display{font-size:1.5rem}

  .field-actions .btn{width:100%}
  .btn-full{font-size:.9375rem;padding:12px 16px}
}

/* Tablet 640-1023 */
@media(min-width:640px) and (max-width:1023px){
  .stats{grid-template-columns:repeat(3,1fr);gap:10px}
  .stat-num{font-size:1.5rem}
  .results-grid{grid-template-columns:repeat(2,1fr)}
  .hdr-email{max-width:none}
}

/* Desktop 1024+ */
@media(min-width:1024px){
  .hdr-in{padding:0 32px}
  .page{padding:88px 32px 48px}
}

/* Wide Desktop 1440+ */
@media(min-width:1440px){
  .hdr-in{padding:0 48px;max-width:1440px}
  .page{max-width:1440px;padding:88px 48px 48px}
  .stats{gap:16px}
}


/* ═══ SCROLLBAR ═══ */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--s5);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--t4)}

/* ═══ ANIMATIONS ═══ */
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.fade-up{animation:fadeUp var(--dur-slow) var(--ease-out) both}
.fade-up-d1{animation-delay:50ms}
.fade-up-d2{animation-delay:100ms}
.fade-up-d3{animation-delay:150ms}

/* ═══ FORGOT PASSWORD ═══ */
.forgot-link{text-align:center;margin-top:12px}
.forgot-link a{color:var(--t3);font-size:.8125rem;text-decoration:none;transition:color var(--dur-fast) var(--ease-out)}
.forgot-link a:hover{color:var(--forest)}
.alogin-desc{color:var(--t3);font-size:.8125rem;line-height:1.5;text-align:center;margin-bottom:16px}
.ok-msg{display:flex;align-items:center;gap:8px;margin-top:12px;padding:10px 14px;border-radius:var(--r2);background:var(--forest-a);color:var(--forest);font-size:.8125rem;border:1px solid rgba(111,143,114,.2)}
.ok-msg .i{color:var(--forest)}
`;
