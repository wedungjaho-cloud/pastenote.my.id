/**
 * PasteNote — Locked v4.3 (English)
 */
import { layout, esc, icon } from './layout.js';
import { Router } from '../router.js';

export function renderLocked(email) {
  return Router.htmlResponse(layout({
    title: email,
    bodyClass: 'locked',
    body: `
    <div class="page-center">
      <div class="lock-card fade-up">
        <div class="lock-icon">${icon('lock','i-24')}</div>
        <h1 class="lock-title">Page Locked</h1>
        <p class="lock-sub">${esc(email)}</p>
        <form id="lockForm" class="lock-form" onsubmit="return false">
          <input type="password" id="lockPw" class="inp" placeholder="Password" autocomplete="current-password" autofocus required>
          <button type="submit" id="lockBtn" class="btn btn-p btn-full">
            <span class="btn-text">Unlock</span>
            <span class="btn-loader" style="display:none"><span class="spinner"></span></span>
          </button>
        </form>
        <div id="lockErr" class="lock-err" style="display:none">
          ${icon('alertTri','i-16')}
          <span id="lockErrText"></span>
        </div>
      </div>
    </div>`,
    scripts: `
    (function(){
      var f=document.getElementById('lockForm'),pw=document.getElementById('lockPw'),
          btn=document.getElementById('lockBtn'),err=document.getElementById('lockErr'),
          et=document.getElementById('lockErrText');
      f.addEventListener('submit',async function(e){
        e.preventDefault();
        var p=pw.value.trim();if(!p){pw.focus();return}
        btn.disabled=true;
        btn.querySelector('.btn-text').textContent='Verifying...';
        btn.querySelector('.btn-loader').style.display='inline-flex';
        err.style.display='none';
        try{
          var r=await fetch('/api/verify-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:${JSON.stringify(email)},password:p})});
          var d=await r.json();
          if(d.success){window.location.reload()}
          else{et.textContent=d.error||'Wrong password';err.style.display='flex';pw.value='';pw.focus()}
        }catch(x){et.textContent='An error occurred.';err.style.display='flex'}
        finally{btn.disabled=false;btn.querySelector('.btn-text').textContent='Unlock';btn.querySelector('.btn-loader').style.display='none'}
      });
    })();`,
  }));
}
