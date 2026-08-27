/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — Design System v7
 *  Font: Inter + JetBrains Mono
 *  Palette: Void #0b0c0e · Green #3ecf8e · Amber #e8a94b
 *  Identity: Private Vault — grid bg, clean borders, no glow on buttons
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
  /* Surface tiers — cool blue-black */
  --s0:#0b0c0e;  /* void / deepest */
  --s1:#0b0c0e;  /* page bg */
  --s2:#141519;  /* card bg / surface */
  --s3:#1b1d22;  /* raised / surface-2 */
  --s4:#22242a;  /* hover / surface-3 */
  --s5:#262930;  /* active */

  /* Text */
  --t1:#edeef1;  /* primary — ink */
  --t2:#c7c9cf;  /* secondary — ink-dim */
  --t3:#8a8d96;  /* muted */
  --t4:#5f6169;  /* muted-2 / disabled */

  /* Palette */
  --sage:#3ecf8e;
  --cream:#edeef1;
  --forest:#3ecf8e;
  --forest-h:#2fb87d;
  --forest-a:rgba(62,207,142,.14);
  --amber:#e8a94b;
  --amber-h:#f0bd6f;
  --amber-a:rgba(232,169,75,.13);

  /* Semantic */
  --red:#e5625e;
  --red-a:rgba(229,98,94,.12);

  /* Surface utils */
  --border:#262930;
  --border-h:#34373f;
  --glass:rgba(11,12,14,.82);
  --on-forest:#08130e;
  --on-amber:#1a1400;

  /* Elevation */
  --sh1:0 1px 0 rgba(255,255,255,.02) inset;
  --sh2:0 4px 12px rgba(0,0,0,.3);
  --sh3:0 8px 24px rgba(0,0,0,.4);
  --sh4:0 20px 50px -20px rgba(0,0,0,.7);
  --focus:0 0 0 4px var(--forest-a);

  color-scheme:dark;
}

/* ═══════════════════════════════════════
   LIGHT THEME
   ═══════════════════════════════════════ */
[data-theme="light"]{
  /* Warm cream surfaces — matching reference light palette */
  --s0:#eae8e4;
  --s1:#f8f8f6;
  --s2:#ffffff;
  --s3:#f2f1ed;
  --s4:#eae9e5;
  --s5:#e2e0db;

  --t1:#141519;
  --t2:#3a3d42;
  --t3:#6a6d72;
  --t4:#9a9da2;

  --sage:#1a8f5c;
  --cream:#f8f8f6;
  --forest:#1a8f5c;
  --forest-h:#147a4e;
  --forest-a:rgba(26,143,92,.09);
  --amber:#9a7520;
  --amber-h:#846418;
  --amber-a:rgba(154,117,32,.09);

  --red:#c0362b;
  --red-a:rgba(192,54,43,.07);

  --border:#e2e0db;
  --border-h:#cbc9c3;
  --glass:rgba(248,248,246,.88);
  --on-forest:#fff;
  --on-amber:#fff;

  --sh1:0 1px 3px rgba(0,0,0,.05);
  --sh2:0 4px 12px rgba(0,0,0,.06);
  --sh3:0 8px 24px rgba(0,0,0,.07);
  --sh4:0 12px 36px rgba(0,0,0,.09);
  --focus:0 0 0 4px var(--forest-a);

  color-scheme:light;
}

/* ═══ CONSTANTS ═══ */
:root{
  --ease:cubic-bezier(.22,1,.36,1);
  --ease-out:cubic-bezier(0,0,.2,1);
  --ease-spring:cubic-bezier(.34,1.56,.64,1);
  --dur:180ms;
  --dur-slow:320ms;
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
   TYPOGRAPHY — Reference-matched sizes
   h1: 19px/700  h2: 14.5px/700  h3: 13.5px/600
   body: 13.5px  small: 12px  label: 10.5px
   ═══════════════════════════════════════ */
h1,.h1{font-size:19px;font-weight:700;line-height:1.25;letter-spacing:-.01em}
h2,.h2{font-size:14.5px;font-weight:700;line-height:1.35;letter-spacing:-.005em}
h3,.h3{font-size:13.5px;font-weight:600;line-height:1.4}

.display{font-size:2rem;font-weight:700;line-height:1.2;letter-spacing:-.03em}

.text-sm{font-size:12px}
.text-xs{font-size:10.5px}
.text-mono{font-family:'JetBrains Mono',monospace;font-size:12px}

.label{
  font-size:10.5px;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;
  color:var(--t4);
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
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  border-bottom:1px solid var(--border);
  z-index:100;
  display:flex;align-items:center;justify-content:center;
  transition:background var(--dur) var(--ease);
}

.hdr-in{
  max-width:1280px;width:100%;
  padding:0 28px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}

.brand{display:flex;align-items:center;gap:9px;text-decoration:none;color:var(--t1)}
.brand:hover{color:var(--t1)}
.brand-name{font-size:17px;font-weight:800;letter-spacing:-.01em}
.brand-dot{color:var(--forest)}
.brand-tag{
  font-size:9px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;
  color:var(--amber);background:var(--amber-a);
  padding:2px 6px;border-radius:99px;
  transition:transform var(--dur) var(--ease-spring);
}
.brand:hover .brand-tag{transform:scale(1.05)}

.hdr-r{display:flex;align-items:center;gap:10px}

/* Account pill — ref 02 */
.hdr-email{
  font-family:'JetBrains Mono',monospace;font-size:12px;
  color:var(--t3);background:var(--s2);border:1px solid var(--border);
  border-radius:999px;padding:7px 13px;
}

/* Theme / icon button — 34px circle, ref 02 */
.theme-btn,.icon-btn{
  width:34px;height:34px;
  display:flex;align-items:center;justify-content:center;
  background:var(--s2);border:1px solid var(--border);
  border-radius:999px;color:var(--t3);cursor:pointer;
  transition:border-color .15s,color .15s,transform .12s;
}
.theme-btn:hover,.icon-btn:hover{color:var(--t1);border-color:var(--border-h)}
.theme-btn:active,.icon-btn:active{transform:scale(.94)}
.theme-btn svg,.icon-btn svg{width:16px;height:16px}


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
.page{flex:1;max-width:700px;width:100%;margin:0 auto;padding:88px 24px 60px}
.page-wide{max-width:1280px}

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
  overflow:hidden;
  animation:fadeUp .5s var(--ease) both;
}
.card-header{
  padding:16px 20px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  border-bottom:1px solid var(--border);
}
.card-header-l{display:flex;align-items:center;gap:10px}
.card-header-r{display:flex;align-items:center;gap:10px}
.card-body{padding:18px 20px 20px}

.card-icon{
  width:30px;height:30px;
  display:flex;align-items:center;justify-content:center;
  border-radius:9px;
}
.card-icon svg{width:15px;height:15px}
.card-icon.forest{color:var(--forest);background:var(--forest-a)}
.card-icon.amber{color:var(--amber);background:var(--amber-a)}
.card-icon.sage{color:var(--sage);background:rgba(191,198,196,.12)}


/* ═══════════════════════════════════════
   BUTTONS — with micro-animations
   ═══════════════════════════════════════ */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  font-family:inherit;font-size:12.5px;font-weight:600;
  padding:8px 14px;border:none;border-radius:8px;
  cursor:pointer;white-space:nowrap;text-decoration:none;
  transition:background .15s,transform .12s,border-color .15s,color .15s;
  position:relative;
}
.btn:active{transform:scale(.96)}

/* Primary — ref btn-primary: green-dim bg, green text, green border */
.btn-p{background:var(--forest-a);color:var(--forest);border:1px solid rgba(62,207,142,.35)}
.btn-p:hover{background:rgba(62,207,142,.22)}
.btn-p svg{width:13px;height:13px}

/* Accent — amber */
.btn-a{background:var(--amber-a);color:var(--amber);border:1px solid rgba(232,169,75,.32)}
.btn-a:hover{background:rgba(232,169,75,.22)}

/* Secondary — ghost with border */
.btn-s{background:transparent;border:1px solid var(--border-h);color:var(--t1)}
.btn-s:hover{background:var(--s4);border-color:var(--border-h)}

/* Ghost — no border */
.btn-g{background:transparent;color:var(--t2);border:none}
.btn-g:hover{background:var(--s4);color:var(--t1)}

.btn-danger{color:var(--red) !important;border-color:var(--red-a) !important}
.btn-danger:hover{background:var(--red-a) !important}
.btn-confirming{color:#fff !important;background:var(--red) !important;border-color:var(--red) !important}

.btn-sm{font-size:11px;padding:5px 10px;border-radius:6px}

/* Full-width unlock/login — ref button.unlock: height:48px, gradient green */
.btn-full{width:100%;height:48px;font-size:14.5px;font-weight:700;letter-spacing:.01em;border-radius:12px;background:linear-gradient(180deg,var(--forest),var(--forest-h));color:var(--on-forest);border:none}
.btn-full:hover{filter:brightness(1.07)}

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
/* Input — ref: height:48px, surface-2 bg, mono for password */
.inp{
  width:100%;height:48px;font-family:inherit;font-size:15px;
  color:var(--t1);background:var(--s3);
  border:1px solid var(--border);border-radius:12px;
  padding:0 16px;outline:none;
  transition:border-color .18s var(--ease),box-shadow .18s var(--ease),background .18s var(--ease);
}
.inp::placeholder{color:var(--t4);font-family:inherit;font-size:13.5px}
.inp:hover{border-color:var(--border-h)}
.inp:focus{border-color:var(--forest);box-shadow:var(--focus);background:var(--s4)}
.inp-pw{font-family:'JetBrains Mono',monospace;letter-spacing:3px}
.inp-pw::placeholder{letter-spacing:normal;font-family:inherit}

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
.toggle{position:relative;display:inline-block;width:36px;height:20px;cursor:pointer}
.toggle input{display:none}
.toggle-track{
  position:absolute;inset:0;
  background:var(--s4);border:1px solid var(--border);border-radius:999px;
  transition:background var(--dur) var(--ease),border-color var(--dur) var(--ease);
}
.toggle-track::before{
  content:'';position:absolute;
  width:14px;height:14px;left:2px;top:2px;
  background:var(--t4);border-radius:50%;
  transition:transform .2s var(--ease),background .2s var(--ease);
}
.toggle input:checked+.toggle-track{background:var(--forest-a);border-color:rgba(62,207,142,.4)}
.toggle input:checked+.toggle-track::before{
  transform:translateX(16px);background:var(--forest);
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

/* Status banner — ref .banner: green-dim + green border */
.status{
  display:flex;align-items:center;gap:8px;
  padding:9px 13px;border-radius:8px;
  font-size:12px;margin:0;
}
.status-ok{background:var(--forest-a);color:var(--forest);border:1px solid rgba(62,207,142,.25)}
.status-err{background:var(--red-a);color:var(--red);border:1px solid rgba(229,98,94,.2)}
.status-load{background:var(--amber-a);color:var(--amber);border:1px solid rgba(232,169,75,.25)}


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
  max-width:376px;width:100%;
  background:linear-gradient(180deg,var(--s2),var(--s2) 60%,#121317);
  border:1px solid var(--border);
  border-radius:20px;padding:38px 32px 30px;text-align:center;
  box-shadow:var(--sh1),var(--sh4);
  animation:rise .5s var(--ease) both;
}
@keyframes rise{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}

.lock-icon{
  width:56px;height:56px;margin:0 auto 22px;
  display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 30% 25%,var(--s4),var(--s3));
  border:1px solid var(--border-h);border-radius:15px;
  box-shadow:0 0 0 1px rgba(62,207,142,.12),0 0 26px -4px rgba(62,207,142,.25);
  position:relative;color:var(--forest);
  transition:transform var(--dur-slow) var(--ease-spring);
}
.lock-card:hover .lock-icon{transform:scale(1.08) rotate(-3deg)}
.lock-icon::after{
  content:'';position:absolute;inset:-1px;border-radius:inherit;
  box-shadow:0 0 0 1px rgba(62,207,142,.22);
  animation:sealPulse 2.6s ease-in-out infinite;
}
@keyframes sealPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}

.lock-title{font-size:1.1875rem;font-weight:700;letter-spacing:-.01em;margin-bottom:4px}
.lock-sub{
  font-family:'JetBrains Mono',monospace;font-size:.78rem;
  color:var(--t3);margin-bottom:24px;word-break:break-all;
  display:flex;align-items:center;justify-content:center;gap:6px;
}
.lock-form{display:flex;flex-direction:column;gap:12px}
.lock-err{
  display:flex;align-items:center;gap:6px;
  padding:0;padding-left:2px;color:var(--red);
  font-size:.75rem;margin-top:0;
  animation:shake .32s var(--ease);
}
@keyframes shake{
  0%,100%{transform:translateX(0)}
  25%{transform:translateX(-4px)}
  75%{transform:translateX(4px)}
}


/* ═══════════════════════════════════════
   UNLOCKED — note + inbox
   ═══════════════════════════════════════ */
/* Notes body — ref: 13.5px, line-height:1.6, ink-dim */
.note-text{
  font-size:13.5px;line-height:1.6;color:var(--t2);
  white-space:pre-wrap;
}

/* Inbox — ref 02-dashboard + 04-embedded */
.inbox-empty,.inbox-off{
  text-align:center;padding:40px 24px;
  color:var(--t3);font-size:13.5px;
}
.mail-list{display:flex;flex-direction:column;padding:8px 8px 8px}
.mail-row{
  display:flex;align-items:center;gap:13px;
  padding:13px 12px;border-radius:12px;
  cursor:pointer;transition:background .15s var(--ease);
  animation:fadeUp .4s var(--ease) both;
}
.mail-row:hover{background:var(--s3)}
.mail-row.unread .mail-sender{font-weight:700}

.mail-avatar{
  width:38px;height:38px;border-radius:11px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:14px;
  text-transform:uppercase;
}
.mail-avatar.a1{background:rgba(229,98,94,.14);color:#f0908c}
.mail-avatar.a2{background:rgba(147,124,229,.16);color:#b6a4f5}
.mail-avatar.a3{background:rgba(94,153,229,.16);color:#8fbdf5}
.mail-avatar.a4{background:rgba(232,169,75,.14);color:#f0bd6f}
.mail-avatar.a5{background:rgba(62,207,142,.14);color:#3ecf8e}

.mail-body{flex:1;min-width:0;overflow:hidden}
.mail-top{display:flex;align-items:baseline;gap:7px}
.mail-sender{font-weight:600;font-size:13.5px;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mail-time{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--t4);white-space:nowrap;margin-left:auto;flex-shrink:0}
.mail-subj{
  font-size:13px;font-weight:500;color:var(--t2);white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;display:block;
}
.mail-row.unread .mail-subj{font-weight:600;color:var(--t1)}
.mail-preview{font-size:12px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;margin-top:2px}

/* Row right — ref: flex-direction:column, align-items:flex-end */
.mail-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
/* OTP code chip — ref .code-chip exact */
.otp-code{
  display:flex;align-items:center;gap:6px;
  font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;
  color:var(--amber-h);background:var(--amber-a);
  padding:5px 9px;border-radius:8px;border:1px solid rgba(232,169,75,.32);
  letter-spacing:.03em;white-space:nowrap;cursor:pointer;
  transition:background .15s,transform .1s;
}
.otp-code:hover{background:rgba(232,169,75,.22)}
.otp-code:active{transform:scale(.95)}
.otp-code svg{width:12px;height:12px;color:var(--amber)}
.otp-code.copied{background:var(--forest-a);border-color:rgba(62,207,142,.4);color:var(--forest)}
.otp-code.copied svg{color:var(--forest)}
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
  -webkit-appearance:none;appearance:none;
  font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--t2);
  background:var(--s3) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%238a8d96" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>') no-repeat right 9px center/13px;
  border:1px solid var(--border);border-radius:8px;padding:7px 26px 7px 11px;cursor:pointer;outline:none;
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
/* Mail item — expand/collapse like ref 04 */
.mail-item{transition:background var(--dur) var(--ease)}
.mail-item.expanded{background:var(--s3);border-radius:12px;margin:4px 0}
.mail-item.expanded .mail-row{border-bottom:none}

/* Panel — ref 04: overflow hidden, max-height transition */
.mail-detail{
  padding:4px 12px 14px;
  animation:fadeSlide .25s var(--ease) both;
}
@keyframes fadeSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

/* Detail header row — ref 03/04 combined */
.mail-detail-row{
  display:flex;align-items:flex-start;justify-content:space-between;gap:14px;
  padding-bottom:10px;margin-bottom:4px;
}
.mail-detail-left{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.mail-detail-sender{font-size:13.5px;font-weight:700;color:var(--t1);line-height:1.4}
.mail-detail-addr{font-weight:400;color:var(--t3);font-size:12px}

/* Toggle meta button */
.mail-toggle-btn{
  display:inline-flex;align-items:center;gap:3px;
  background:none;border:none;cursor:pointer;padding:0;
  font-family:inherit;font-size:12px;color:var(--t3);
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
.mail-detail-date{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--t4);white-space:nowrap;line-height:1.4}

/* Meta table — ref 04: surface-2 bg, border, 12px radius */
.mail-detail-meta{
  margin:8px 0 12px;padding:2px 16px;
  background:var(--s3);border:1px solid var(--border);border-radius:12px;
  animation:fadeSlide .2s var(--ease) both;
}
.mail-meta-tbl{border-collapse:collapse;width:100%}
.mail-meta-tbl td{padding:9px 0;vertical-align:top;border-bottom:1px solid var(--border);font-size:12px}
.mail-meta-tbl tr:last-child td{border-bottom:none}
.meta-k{color:var(--t4);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;padding-right:14px;width:50px;padding-top:10px}
.meta-v{color:var(--t2);word-break:break-all}
.meta-v.mono{font-family:'JetBrains Mono',monospace;font-size:11.5px}

/* Email body — ref: content-frame with border */
.mail-detail-body{
  padding:0 0 4px;min-height:80px;
  border:1px solid var(--border);border-radius:12px;overflow:hidden;
}
.mail-detail-body iframe{border-radius:0;background:#f3f1ec;min-height:200px}

.otp-lg{font-size:13px;padding:6px 12px}


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
  max-width:376px;width:100%;
  background:linear-gradient(180deg,var(--s2),var(--s2) 60%,#121317);
  border:1px solid var(--border);
  border-radius:20px;padding:38px 32px 30px;text-align:center;
  box-shadow:var(--sh1),var(--sh4);
  animation:rise .5s var(--ease) both;
}

.alogin-icon{
  width:56px;height:56px;margin:0 auto 22px;
  display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 30% 25%,var(--s4),var(--s3));
  border:1px solid var(--border-h);border-radius:15px;
  color:var(--amber);
  transition:transform var(--dur-slow) var(--ease-spring);
}
.alogin-card:hover .alogin-icon{transform:scale(1.08) rotate(3deg)}

.alogin-title{font-size:1.1875rem;font-weight:700;letter-spacing:-.01em;margin-bottom:4px}
.alogin-sub{font-size:.78rem;color:var(--t3);margin-bottom:24px}
.inp-group{margin-bottom:12px}
.err-msg{
  display:flex;align-items:center;gap:6px;
  padding:0;padding-left:2px;color:var(--red);
  font-size:.75rem;margin-top:4px;
  animation:shake .32s var(--ease);
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
   RESPONSIVE — Gmail-style breakpoints
   ═══════════════════════════════════════ */

/* Phone < 640 */
@media(max-width:639px){
  .hdr{height:auto;padding:10px 0}
  .hdr-in{padding:0 16px;flex-wrap:wrap;gap:2px 8px}
  .brand-name{font-size:15px}
  .hdr-r{flex:0 0 auto;gap:6px}
  .hdr-email{display:none}

  .hdr.hdr-admin{height:auto;padding:10px 0}
  .hdr.hdr-admin .hdr-in{flex-wrap:wrap;justify-content:center;gap:8px}
  .hdr.hdr-admin .nav-pills{order:10;width:100%;justify-content:center}

  .page{padding:70px 16px 24px}
  .page-center{padding:70px 16px 24px}
  .page-wide{max-width:100%}
  .hdr.hdr-admin~.page{padding-top:100px}

  .stats{grid-template-columns:1fr;gap:8px}
  .stat{flex-direction:row;align-items:center;justify-content:space-between;padding:12px 16px}
  .stat-num{font-size:1.375rem}

  .card{border-radius:12px}
  .card-header{padding:12px 16px;flex-wrap:wrap;gap:8px}
  .card-body{padding:14px 16px 16px}

  .results-grid,.results-2col{grid-template-columns:1fr}

  .land-title .brand-name{font-size:1.375rem}

  .lock-card,.alogin-card{padding:28px 20px;border-radius:16px}
  .lock-title,.alogin-title{font-size:17px}

  .modal-bg{padding:12px}
  .modal{border-radius:16px}
  .modal-top{padding:16px 16px 4px}
  .modal-meta{padding:0 16px 8px}
  .modal-content{padding:0 16px 16px}

  .toast-box{left:16px;right:16px;bottom:16px}

  /* Compact mail rows */
  .mail-list{padding:4px 4px}
  .mail-row{padding:10px 10px;gap:10px;border-radius:10px}
  .mail-avatar{width:32px;height:32px;font-size:12px;border-radius:9px}
  .mail-sender{font-size:13px}
  .mail-subj{font-size:12px}
  .mail-time{font-size:9px}
  .mail-right{display:none}
  .mail-detail{padding:4px 10px 12px}
  .mail-detail-row{flex-direction:column;gap:6px}
  .mail-detail-right{align-items:flex-start;flex-direction:row;gap:8px;flex-wrap:wrap}
  .mail-detail-meta{padding:2px 12px;border-radius:10px}
  .meta-k{padding-right:8px;font-size:9px}
  .mail-detail-body{border-radius:10px}

  .nf-code{font-size:3rem}
  .display{font-size:1.5rem}

  .field-actions .btn{width:100%}
  .btn-full{height:44px;font-size:13.5px}
  .inp{height:44px;font-size:14px}
}

/* Tablet 640-1023 */
@media(min-width:640px) and (max-width:1023px){
  .stats{grid-template-columns:repeat(3,1fr);gap:10px}
  .stat-num{font-size:1.5rem}
  .results-grid{grid-template-columns:repeat(2,1fr)}
}

/* Desktop 1024+ */
@media(min-width:1024px){
  .hdr-in{padding:0 32px}
  .page-wide{padding:88px 32px 48px}
}

/* Wide Desktop 1440+ */
@media(min-width:1440px){
  .hdr-in{padding:0 48px;max-width:1440px}
  .page-wide{max-width:1440px;padding:88px 48px 48px}
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
