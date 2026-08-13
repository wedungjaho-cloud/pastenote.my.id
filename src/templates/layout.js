/**
 * PasteNote — Layout v4.3
 * Inter Variable + JetBrains Mono
 * Theme toggle on ALL pages — English UI
 */
import { icon } from './icons.js';

export function layout({ title, body, scripts, bodyClass, headerEmail, adminHeader }) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title||'PasteNote')} — PasteNote</title>
  <meta name="description" content="PasteNote — Private note and inbox viewer.">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/main.css?v=5.3">
</head>
<body class="${bodyClass||''}">

  ${adminHeader ? renderAdminHeader() : renderHeader(headerEmail)}

  ${body}

  <div id="toast" class="toast-box"></div>

  <script>
  (function(){
    var th=localStorage.getItem('pn_theme')||'dark';
    document.documentElement.setAttribute('data-theme',th);
    updIcon();

    window.toggleTheme=function(){
      var c=document.documentElement.getAttribute('data-theme');
      var n=c==='dark'?'light':'dark';
      document.documentElement.setAttribute('data-theme',n);
      localStorage.setItem('pn_theme',n);
      updIcon();
    };

    function updIcon(){
      var b=document.getElementById('themeBtn');
      if(!b)return;
      var d=document.documentElement.getAttribute('data-theme')!=='light';
      b.innerHTML=d
        ?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
        :'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    }
  })();

  window.showToast=function(ic,msg){
    var c=document.getElementById('toast');
    if(!c)return;
    var el=document.createElement('div');
    el.className='toast';
    el.innerHTML='<span>'+msg+'</span>';
    c.appendChild(el);
    setTimeout(function(){el.classList.add('out');setTimeout(function(){el.remove()},200)},3000);
  };
  </script>

  ${scripts?'<script>'+scripts+'</script>':''}
</body>
</html>`;
}

function renderHeader(email) {
  return `
  <header class="hdr">
    <div class="hdr-in">
      <a href="/" class="brand">
        <span class="brand-name">paste<span class="brand-dot">note</span></span>
      </a>
      <div class="hdr-r">
        ${email?'<span class="hdr-email">'+esc(email)+'</span>':''}
        <button id="themeBtn" class="theme-btn" onclick="toggleTheme()" title="Toggle theme"></button>
      </div>
    </div>
  </header>`;
}

function renderAdminHeader() {
  return `
  <header class="hdr hdr-admin">
    <div class="hdr-in">
      <a href="/atmin" class="brand">
        <span class="brand-name">paste<span class="brand-dot">note</span></span>
        <span class="brand-tag">Admin</span>
      </a>
      <nav class="nav-pills">
        <button class="nav-pill active" data-tab="pages">Pages</button>
        <button class="nav-pill" data-tab="tools">Tools</button>
        <button class="nav-pill" data-tab="settings">Settings</button>
      </nav>
      <div class="hdr-r">
        <button id="themeBtn" class="theme-btn" onclick="toggleTheme()" title="Toggle theme"></button>
        <button id="logoutBtn" class="btn btn-g btn-sm">
          ${icon('logout','i-16')}
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>`;
}

export { icon };

export function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
