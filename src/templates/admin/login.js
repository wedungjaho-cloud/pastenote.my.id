/**
 * PasteNote — Admin Login v4.3 (English)
 * Includes forgot password + recovery code flow
 */
import { layout, icon } from '../layout.js';
import { Router } from '../../router.js';

export function renderAdminLogin() {
  return Router.htmlResponse(layout({
    title: 'Admin Login',
    bodyClass: 'admin-login',
    body: `
    <div class="page-center">
      <div class="alogin-card fade-up">
        <div class="alogin-icon">${icon('shield','i-24')}</div>
        <h1 class="alogin-title">Admin</h1>
        <p class="alogin-sub">PasteNote Panel</p>

        <!-- LOGIN FORM -->
        <form id="loginForm" onsubmit="return false">
          <div class="inp-group">
            <input type="password" id="adminPw" class="inp" placeholder="Password" autocomplete="current-password" autofocus required>
          </div>
          <button type="submit" id="loginBtn" class="btn btn-p btn-full">
            <span class="btn-text">Login</span>
            <span class="btn-loader" style="display:none"><span class="spinner"></span></span>
          </button>
        </form>
        <div class="forgot-link"><a href="#" id="forgotBtn">Forgot password?</a></div>

        <!-- FORGOT STEP 1: REQUEST CODE -->
        <div id="forgotPanel" style="display:none">
          <p class="alogin-desc">A recovery code will be sent to the admin's configured email.</p>
          <button id="sendCodeBtn" class="btn btn-s btn-full">
            <span class="btn-text">Send Code</span>
            <span class="btn-loader" style="display:none"><span class="spinner"></span></span>
          </button>
          <div class="forgot-link" style="margin-top:12px"><a href="#" id="backToLogin">Back to login</a></div>
        </div>

        <!-- FORGOT STEP 2: ENTER CODE -->
        <div id="codePanel" style="display:none">
          <p class="alogin-desc">Enter the 6-digit code sent to your recovery email.</p>
          <div class="inp-group">
            <input type="text" id="recoveryCode" class="inp inp-mono" placeholder="______" maxlength="6" style="text-align:center;font-size:1.25rem;letter-spacing:0.5rem">
          </div>
          <button id="verifyCodeBtn" class="btn btn-p btn-full">
            <span class="btn-text">Verify</span>
            <span class="btn-loader" style="display:none"><span class="spinner"></span></span>
          </button>
          <div class="forgot-link" style="margin-top:12px"><a href="#" id="backToLogin2">Back to login</a></div>
        </div>

        <!-- FORGOT STEP 3: SET NEW PASSWORD -->
        <div id="resetPanel" style="display:none">
          <p class="alogin-desc">Create a new password.</p>
          <div class="inp-group">
            <input type="password" id="newPw" class="inp" placeholder="New password">
          </div>
          <div class="inp-group">
            <input type="password" id="confirmPw" class="inp" placeholder="Confirm password">
          </div>
          <button id="resetPwBtn" class="btn btn-p btn-full">
            <span class="btn-text">Change Password</span>
            <span class="btn-loader" style="display:none"><span class="spinner"></span></span>
          </button>
        </div>

        <!-- ERROR/SUCCESS -->
        <div id="loginMsg" class="err-msg" style="display:none">
          ${icon('alertTri','i-16')}
          <span class="msg-text"></span>
        </div>
      </div>
    </div>`,
    scripts: `
    (function(){
      var loginForm=document.getElementById('loginForm'),pw=document.getElementById('adminPw'),
          loginBtn=document.getElementById('loginBtn'),
          forgotBtn=document.getElementById('forgotBtn'),
          forgotPanel=document.getElementById('forgotPanel'),
          sendCodeBtn=document.getElementById('sendCodeBtn'),
          codePanel=document.getElementById('codePanel'),
          codeInput=document.getElementById('recoveryCode'),
          verifyCodeBtn=document.getElementById('verifyCodeBtn'),
          resetPanel=document.getElementById('resetPanel'),
          resetPwBtn=document.getElementById('resetPwBtn'),
          newPw=document.getElementById('newPw'),confirmPw=document.getElementById('confirmPw'),
          msgEl=document.getElementById('loginMsg'),
          msgText=msgEl.querySelector('.msg-text'),
          resetToken='';

      function showMsg(t,isErr){msgText.textContent=t;msgEl.className=isErr?'err-msg':'ok-msg';msgEl.style.display='flex'}
      function hideMsg(){msgEl.style.display='none'}
      function setBtn(btn,loading,text){
        btn.disabled=loading;
        btn.querySelector('.btn-text').textContent=text;
        btn.querySelector('.btn-loader').style.display=loading?'inline-flex':'none';
      }
      function showStep(step){
        loginForm.style.display=step==='login'?'':'none';
        document.querySelector('.forgot-link').style.display=step==='login'?'':'none';
        forgotPanel.style.display=step==='forgot'?'':'none';
        codePanel.style.display=step==='code'?'':'none';
        resetPanel.style.display=step==='reset'?'':'none';
        hideMsg();
      }

      loginForm.addEventListener('submit',async function(e){
        e.preventDefault();var p=pw.value.trim();if(!p){pw.focus();return}
        setBtn(loginBtn,true,'Logging in...');hideMsg();
        try{
          var r=await fetch('/atmin/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:p})});
          var d=await r.json();
          if(d.success){window.location.href='/atmin'}
          else{showMsg(d.error||'Login failed',true);pw.value='';pw.focus()}
        }catch(x){showMsg('An error occurred.',true)}
        finally{setBtn(loginBtn,false,'Login')}
      });

      forgotBtn.addEventListener('click',function(e){e.preventDefault();showStep('forgot')});
      document.getElementById('backToLogin').addEventListener('click',function(e){e.preventDefault();showStep('login')});
      document.getElementById('backToLogin2').addEventListener('click',function(e){e.preventDefault();showStep('login')});

      sendCodeBtn.addEventListener('click',async function(){
        setBtn(sendCodeBtn,true,'Sending...');hideMsg();
        try{
          var r=await fetch('/atmin/api/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
          var d=await r.json();
          if(d.success){showStep('code');showMsg('Code sent to '+d.email_hint,false)}
          else{showMsg(d.error||'Failed to send code.',true)}
        }catch(x){showMsg('An error occurred.',true)}
        finally{setBtn(sendCodeBtn,false,'Send Code')}
      });

      verifyCodeBtn.addEventListener('click',async function(){
        var code=codeInput.value.trim();if(code.length!==6){showMsg('Code must be 6 digits.',true);return}
        setBtn(verifyCodeBtn,true,'Verifying...');hideMsg();
        try{
          var r=await fetch('/atmin/api/verify-recovery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code})});
          var d=await r.json();
          if(d.success){resetToken=d.reset_token;showStep('reset');showMsg('Code valid. Create new password.',false)}
          else{showMsg(d.error||'Wrong code.',true)}
        }catch(x){showMsg('An error occurred.',true)}
        finally{setBtn(verifyCodeBtn,false,'Verify')}
      });

      resetPwBtn.addEventListener('click',async function(){
        var p1=newPw.value,p2=confirmPw.value;
        if(p1.length<4){showMsg('Password must be at least 4 characters.',true);return}
        if(p1!==p2){showMsg('Passwords do not match.',true);return}
        setBtn(resetPwBtn,true,'Saving...');hideMsg();
        try{
          var r=await fetch('/atmin/api/reset-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reset_token:resetToken,new_password:p1})});
          var d=await r.json();
          if(d.success){showMsg('Password changed! Redirecting...',false);setTimeout(function(){window.location.href='/atmin/login'},1500)}
          else{showMsg(d.error||'Failed.',true)}
        }catch(x){showMsg('An error occurred.',true)}
        finally{setBtn(resetPwBtn,false,'Change Password')}
      });
    })();`,
  }));
}
