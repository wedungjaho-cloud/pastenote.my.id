/* Admin login — form handler + forgot-password flow */
(function(){
  var loginForm = document.getElementById('loginForm'), pw = document.getElementById('adminPw'),
      loginBtn = document.getElementById('loginBtn'),
      toggleAdminPwBtn = document.getElementById('toggleAdminPwBtn'),
      adminEyeIcon = document.getElementById('adminEyeIcon'),
      forgotBtn = document.getElementById('forgotBtn'),
      forgotPanel = document.getElementById('forgotPanel'),
      sendCodeBtn = document.getElementById('sendCodeBtn'),
      codePanel = document.getElementById('codePanel'),
      codeInput = document.getElementById('recoveryCode'),
      verifyCodeBtn = document.getElementById('verifyCodeBtn'),
      resetPanel = document.getElementById('resetPanel'),
      resetPwBtn = document.getElementById('resetPwBtn'),
      newPw = document.getElementById('newPw'), confirmPw = document.getElementById('confirmPw'),
      msgEl = document.getElementById('loginMsg'),
      msgText = msgEl.querySelector('.msg-text'),
      resetToken = '';

  /* Toggle Password */
  if (toggleAdminPwBtn && pw) {
    toggleAdminPwBtn.addEventListener('click', function(){
      var isPw = pw.type === 'password';
      pw.type = isPw ? 'text' : 'password';
      if (adminEyeIcon) {
        adminEyeIcon.innerHTML = isPw
          ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
          : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
      }
      pw.focus();
    });
  }

  function showMsg(t, isErr){
    msgText.textContent = t;
    msgEl.className = isErr ? 'err-msg' : 'ok-msg';
    msgEl.style.display = 'flex';
    msgEl.style.color = isErr ? 'var(--red)' : 'var(--green)';
  }
  function hideMsg(){ msgEl.style.display = 'none'; }
  function setBtn(btn, loading, text){
    btn.disabled = loading;
    btn.querySelector('.btn-text').textContent = text;
    btn.querySelector('.btn-loader').style.display = loading ? 'inline-flex' : 'none';
  }
  function showStep(step){
    loginForm.style.display = step === 'login' ? '' : 'none';
    var fl = document.querySelector('.forgot-link');
    if (fl) fl.style.display = step === 'login' ? '' : 'none';
    forgotPanel.style.display = step === 'forgot' ? '' : 'none';
    codePanel.style.display = step === 'code' ? '' : 'none';
    resetPanel.style.display = step === 'reset' ? '' : 'none';
    hideMsg();
  }

  loginForm.addEventListener('submit', async function(e){
    e.preventDefault();
    var p = pw.value.trim(); if (!p){ pw.focus(); return; }
    setBtn(loginBtn, true, 'Logging in...'); hideMsg();
    try {
      var r = await fetch('/atmin/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: p }) });
      var d = await r.json();
      if (d.success){ window.location.href = '/atmin'; }
      else { showMsg(d.error || 'Login failed', true); pw.value = ''; pw.focus(); }
    } catch(x){ showMsg('An error occurred.', true); }
    finally { setBtn(loginBtn, false, 'Login'); }
  });

  if (forgotBtn) forgotBtn.addEventListener('click', function(e){ e.preventDefault(); showStep('forgot'); });
  var b1 = document.getElementById('backToLogin'); if (b1) b1.addEventListener('click', function(e){ e.preventDefault(); showStep('login'); });
  var b2 = document.getElementById('backToLogin2'); if (b2) b2.addEventListener('click', function(e){ e.preventDefault(); showStep('login'); });

  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', async function(){
      setBtn(sendCodeBtn, true, 'Sending...'); hideMsg();
      try {
        var r = await fetch('/atmin/api/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        var d = await r.json();
        if (d.success){ showStep('code'); showMsg('Code sent to ' + d.email_hint, false); }
        else { showMsg(d.error || 'Failed to send code.', true); }
      } catch(x){ showMsg('An error occurred.', true); }
      finally { setBtn(sendCodeBtn, false, 'Send Code'); }
    });
  }

  if (verifyCodeBtn) {
    verifyCodeBtn.addEventListener('click', async function(){
      var code = codeInput.value.trim();
      if (code.length !== 6){ showMsg('Code must be 6 digits.', true); return; }
      setBtn(verifyCodeBtn, true, 'Verifying...'); hideMsg();
      try {
        var r = await fetch('/atmin/api/verify-recovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code }) });
        var d = await r.json();
        if (d.success){ resetToken = d.reset_token; showStep('reset'); showMsg('Code valid. Create new password.', false); }
        else { showMsg(d.error || 'Wrong code.', true); }
      } catch(x){ showMsg('An error occurred.', true); }
      finally { setBtn(verifyCodeBtn, false, 'Verify Code'); }
    });
  }

  if (resetPwBtn) {
    resetPwBtn.addEventListener('click', async function(){
      var p1 = newPw.value, p2 = confirmPw.value;
      if (p1.length < 4){ showMsg('Password must be at least 4 characters.', true); return; }
      if (p1 !== p2){ showMsg('Passwords do not match.', true); return; }
      setBtn(resetPwBtn, true, 'Saving...'); hideMsg();
      try {
        var r = await fetch('/atmin/api/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reset_token: resetToken, new_password: p1 }) });
        var d = await r.json();
        if (d.success){ showMsg('Password changed! Redirecting...', false); setTimeout(function(){ window.location.href = '/atmin/login'; }, 1500); }
        else { showMsg(d.error || 'Failed.', true); }
      } catch(x){ showMsg('An error occurred.', true); }
      finally { setBtn(resetPwBtn, false, 'Change Password'); }
    });
  }
})();

