export function getRefinedCSS() {
  return `
/* ═══════════════════════════════════════
   PasteNote — Refined Visual Layer v5.1
   quiet motion · softer hierarchy · polish
   ═══════════════════════════════════════ */
:root{
  --motion:cubic-bezier(.22,.61,.36,1);
  --motion-fast:140ms;
  --motion-base:220ms;
}

/* Subtle ambient gradient on body */
body{background-image:radial-gradient(circle at 50% -20%,rgba(111,143,114,.08),transparent 40%)}

/* Header refinements */
.brand-name{letter-spacing:-.035em}
.theme-btn{background:transparent;color:var(--t3);border:1px solid var(--border);transition:color var(--motion-fast) var(--motion),background var(--motion-fast) var(--motion),border-color var(--motion-fast) var(--motion)}
.theme-btn:hover{background:var(--s3);color:var(--t1);border-color:var(--border-h);transform:none;box-shadow:none}
.theme-btn:active{transform:scale(.96)}

/* Card — softer shadow on hover */
.card{box-shadow:0 1px 1px rgba(0,0,0,.08);transition:border-color var(--motion-base) var(--motion),background var(--motion-base) var(--motion),box-shadow var(--motion-base) var(--motion)}
.card:hover{border-color:var(--border-h);box-shadow:0 4px 16px rgba(0,0,0,.08)}
.card-icon,.card:hover .card-icon{transition:background var(--motion-base) var(--motion),color var(--motion-base) var(--motion);transform:none}

/* Button — refined motion, keep ripple intact */
.btn{transition:background var(--motion-fast) var(--motion),border-color var(--motion-fast) var(--motion),color var(--motion-fast) var(--motion),transform 90ms var(--motion)}
.btn:hover{box-shadow:none}
.btn:active{transform:translateY(1px) scale(.985)}

/* ═══════════════════════════════════════
   CENTERED PAGES — lock, admin login, 404
   Apply pn-reveal to cards
   ═══════════════════════════════════════ */
.lock-card,.alogin-card,.nf-card{opacity:0;animation:pn-reveal .6s var(--motion) forwards}

/* Lock page — tighter card, subtle pulse on icon */
.lock-card{max-width:400px;border-radius:18px}
.lock-icon{animation:pn-pulse 2.8s ease-in-out infinite}
.lock-card:hover .lock-icon{animation:none}

/* Admin login — accent top border */
.alogin-card{border-top:2px solid var(--amber)}

/* Button primary — slightly stronger for dark mode */
.btn-p{background:var(--forest);color:var(--on-forest);font-weight:600}
.btn-p:hover{background:var(--forest-h)}

/* 404 — pn-reveal already applied via .nf-card above */
.nf-code{opacity:.6}

/* ═══════════════════════════════════════
   LANDING — editorial composition
   ═══════════════════════════════════════ */
.landing-shell{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 56px}
.landing-panel{width:min(720px,100%);padding:clamp(18px,4vw,42px) 0 0}

.landing-brandline{display:flex;align-items:center;gap:10px;margin-bottom:46px;opacity:0;animation:pn-reveal .65s var(--motion) forwards}
.landing-mark{width:8px;height:8px;border-radius:50%;background:var(--forest);box-shadow:0 0 0 5px var(--forest-a)}
.landing-kicker{font-size:.625rem;letter-spacing:.16em;font-weight:700;color:var(--t3);text-transform:uppercase}

.landing-copy{max-width:650px;opacity:0;animation:pn-reveal .7s .06s var(--motion) forwards}
.landing-title{font-size:clamp(2.7rem,7vw,5.2rem);line-height:.98;letter-spacing:-.06em;font-weight:700;margin:0 0 24px;color:var(--t1)}
.landing-title em{font-style:normal;color:var(--t2);font-weight:400}
.landing-lede{max-width:540px;font-size:clamp(.95rem,1.7vw,1.05rem);line-height:1.7;color:var(--t2)}

.landing-access{margin-top:54px;border-top:1px solid var(--border-h);border-bottom:1px solid var(--border-h);padding:18px 0 8px;opacity:0;animation:pn-reveal .7s .13s var(--motion) forwards}
.landing-access-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.landing-access-note{font-size:.72rem;color:var(--t4)}
.landing-url{font-family:'JetBrains Mono',monospace;font-size:clamp(.78rem,1.8vw,.88rem);color:var(--t3);padding:14px 0 22px;overflow:auto;white-space:nowrap}
.landing-url strong{color:var(--forest);font-weight:600}
.landing-rule{height:1px;background:var(--border);margin-bottom:2px}
.landing-step{display:grid;grid-template-columns:42px 1fr;gap:8px;padding:15px 0;border-bottom:1px solid var(--border);transition:padding-left var(--motion-base) var(--motion)}
.landing-step:last-child{border-bottom:0}
.landing-step>span{font-family:'JetBrains Mono',monospace;font-size:.68rem;color:var(--forest);padding-top:3px}
.landing-step p{font-size:.86rem;color:var(--t2);line-height:1.5;margin:0}
.landing-step:hover{padding-left:5px}
.landing-footnote{font-size:.72rem;color:var(--t4);margin-top:22px;opacity:0;animation:pn-reveal .7s .2s var(--motion) forwards}

/* Landing footer */
.landing-foot{margin-top:48px;padding-top:20px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;opacity:0;animation:pn-reveal .7s .26s var(--motion) forwards}
.landing-foot-dot{width:5px;height:5px;border-radius:50%;background:var(--forest);opacity:.5}
.landing-foot-text{font-size:.68rem;color:var(--t4);letter-spacing:.04em}

/* ═══════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════ */
@keyframes pn-reveal{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes pn-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}

.fade-up{animation:pn-reveal .55s var(--motion) both}
.fade-up-d1{animation-delay:.07s}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important;scroll-behavior:auto!important}}

/* ═══════════════════════════════════════
   RESPONSIVE — mobile
   ═══════════════════════════════════════ */
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
