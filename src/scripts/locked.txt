/* Lock page — password verify, toggle, CapsLock & unlock */
(function(){
  var em = window.__PN_EMAIL__;
  var f = document.getElementById('lockForm');
  var pw = document.getElementById('lockPw');
  var btn = document.getElementById('lockBtn');
  var err = document.getElementById('lockErr');
  var et = document.getElementById('lockErrText');
  var toggleBtn = document.getElementById('togglePwBtn');
  var eyeIcon = document.getElementById('eyeIcon');
  var capsWarn = document.getElementById('capsWarn');

  /* Toggle Password Visibility */
  if (toggleBtn && pw) {
    toggleBtn.addEventListener('click', function(){
      var isPw = pw.type === 'password';
      pw.type = isPw ? 'text' : 'password';
      if (eyeIcon) {
        eyeIcon.innerHTML = isPw
          ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
          : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
      }
      pw.focus();
    });
  }

  /* CapsLock detection */
  if (pw && capsWarn) {
    var checkCaps = function(e){
      var isCaps = e.getModifierState && e.getModifierState('CapsLock');
      capsWarn.style.display = isCaps ? 'flex' : 'none';
    };
    pw.addEventListener('keyup', checkCaps);
    pw.addEventListener('keydown', checkCaps);
  }

  /* Submit & Verify */
  f.addEventListener('submit', async function(e){
    e.preventDefault();
    var p = pw.value.trim();
    if (!p) { pw.focus(); return; }

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Verifying...';
    btn.querySelector('.btn-loader').style.display = 'inline-flex';
    err.classList.remove('show');
    err.style.display = 'none';

    try {
      var r = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, password: p })
      });
      var d = await r.json();
      if (d.success) {
        btn.querySelector('.btn-text').textContent = 'Unlocked ✓';
        btn.style.pointerEvents = 'none';
        btn.style.background = 'linear-gradient(180deg, #10b981, #059669)';
        setTimeout(function(){ window.location.reload(); }, 350);
      } else {
        et.textContent = d.error || 'Wrong password';
        err.style.display = 'flex';
        err.classList.add('show');
        pw.value = '';
        pw.focus();
      }
    } catch(x) {
      et.textContent = 'An error occurred. Try again.';
      err.style.display = 'flex';
      err.classList.add('show');
    } finally {
      if (!btn.style.pointerEvents) {
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Unlock';
        btn.querySelector('.btn-loader').style.display = 'none';
      }
    }
  });
})();

