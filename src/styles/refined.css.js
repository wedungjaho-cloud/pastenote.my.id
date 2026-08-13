export function getRefinedCSS() {
  return `
/* PasteNote refined visual layer — quiet motion, softer hierarchy */
:root{
  --motion:cubic-bezier(.22,.61,.36,1);
  --motion-fast:140ms;
  --motion-base:220ms;
}

body{background-image:radial-gradient(circle at 50% -20%,rgba(111,143,114,.055),transparent 38%)}

.brand-name{letter-spacing:-.035em}
.theme-btn{background:transparent;color:var(--t3);border:1px solid var(--border);transition:color var(--motion-fast) var(--motion),background var(--motion-fast) var(--motion),border-color var(--motion-fast) var(--motion)}
.theme-btn:hover{background:var(--s3);color:var(--t1);border-color:var(--border-h);transform:none;box-shadow:none}
.theme-btn:active{transform:scale(.96)}

.card{box-shadow:0 1px 1px rgba(0,0,0,.08);transition:border-color var(--motion-base) var(--motion),background var(--motion-base) var(--motion),box-shadow var(--motion-base) var(--motion)}
.card:hover{border-color:var(--border-h);box-shadow:0 8px 28px rgba(0,0,0,.10)}
.card-icon,.card:hover .card-icon{transition:background var(--motion-base) var(--motion),color var(--motion-base) var(--motion);transform:none}
.btn{transition:background var(--motion-fast) var(--motion),border-color var(--motion-fast) var(--motion),color var(--motion-fast) var(--motion),transform 90ms var(--motion)}
.btn::after{display:none}
.btn:hover{box-shadow:none}
.btn:active{transform:translateY(1px) scale(.985)}

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
.landing-title em{font-style:normal;color:var(--t3);font-weight:400}
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

/* Quiet entry motion */
@keyframes pn-reveal{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fade-up{animation:pn-reveal .55s var(--motion) both}
.fade-up-d1{animation-delay:.07s}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important;scroll-behavior:auto!important}}

/* Landing responsive — mobile */
@media(max-width:639px){
  .landing-shell{padding:80px 20px 40px}
  .landing-brandline{margin-bottom:34px}
  .landing-title{font-size:clamp(2.2rem,12vw,3.5rem)}
  .landing-access{margin-top:36px}
  .landing-step{grid-template-columns:34px 1fr}
}
`;
}
