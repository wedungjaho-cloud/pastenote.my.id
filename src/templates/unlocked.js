/**
 * PasteNote — Unlocked v4.4 (Gmail-style inline expand inbox)
 */
import { layout, esc, icon } from './layout.js';
import { Router } from '../router.js';

export function renderUnlocked(page, globalSettings, configExists) {
  const note = page.note || globalSettings.default_note || '';
  const inboxOn = page.inbox_enabled && configExists;

  return Router.htmlResponse(layout({
    title: page.email,
    headerEmail: page.email,
    bodyClass: 'unlocked',
    body: `
    <div class="page">

    <div class="card fade-up" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-header-l">
          <div class="card-icon forest">${icon('note','i-20')}</div>
          <h2 class="h2">Notes</h2>
        </div>
      </div>
      <div class="card-body">
        <div class="note-text">${esc(note).replace(/\n/g,'<br>')}</div>
      </div>
    </div>

    ${inboxOn ? inboxSection() : inboxOff()}

    </div>`,
    scripts: inboxOn ? inboxScript(page.email) : '',
  }));
}

function inboxSection() {
  return `
    <div class="card fade-up fade-up-d1">
      <div class="card-header">
        <div class="card-header-l">
          <div class="card-icon amber">${icon('inbox','i-20')}</div>
          <h2 class="h2">Inbox</h2>
        </div>
        <div class="card-header-r">
          <div class="ar-wrap">
            <label class="toggle" title="Auto refresh">
              <input type="checkbox" id="arToggle">
              <span class="toggle-track"></span>
            </label>
            <select id="arInterval" class="sel-sm">
              <option value="5">5s</option>
              <option value="10" selected>10s</option>
              <option value="30">30s</option>
              <option value="60">60s</option>
            </select>
            <span id="arCd" class="cd-badge" style="display:none">10s</span>
          </div>
          <button id="readBtn" class="btn btn-p btn-sm">
            <span class="btn-text">Read Inbox</span>
            <span class="btn-loader" style="display:none"><span class="spinner"></span></span>
          </button>
        </div>
      </div>
      <div id="statusBar" class="status" style="display:none;margin:8px 16px 0;border-radius:8px"><span class="status-text"></span></div>
      <div class="card-body" style="padding:0">
        <div id="inboxArea"><div class="inbox-empty">Click <strong>Read Inbox</strong> to load your emails.</div></div>
      </div>
    </div>`;
}

function inboxOff() {
  return `
    <div class="card fade-up fade-up-d1">
      <div class="card-header">
        <div class="card-header-l">
          <div class="card-icon sage">${icon('inbox','i-20')}</div>
          <h2 class="h2">Inbox</h2>
        </div>
      </div>
      <div class="card-body">
        <div class="inbox-off">Inbox is disabled for this page.</div>
      </div>
    </div>`;
}

function inboxScript(email) {
  return `
  (function(){
    var em=${JSON.stringify(email)},readBtn=document.getElementById('readBtn'),
        area=document.getElementById('inboxArea'),sBar=document.getElementById('statusBar'),
        arT=document.getElementById('arToggle'),arI=document.getElementById('arInterval'),
        arCd=document.getElementById('arCd'),
        loading=false,msgs=[],timer=null,cdTimer=null,cdVal=0,openIdx=-1,metaOpen={},deleting={};

    var CACHE_KEY='pn_inbox_'+em;

    function saveCache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify({ts:Date.now(),msgs:msgs}))}catch(e){}}
    function loadCache(){try{var d=JSON.parse(localStorage.getItem(CACHE_KEY));if(d&&d.msgs){msgs=d.msgs;return true}}catch(e){}return false}

    function showSt(t,m){sBar.className='status status-'+t;sBar.querySelector('.status-text').textContent=m;sBar.style.display='flex'}
    function h(t){var d=document.createElement('div');d.textContent=t||'';return d.innerHTML}
    function trunc(t,m){m=m||100;if(!t)return'';return t.length>m?t.substring(0,m)+'...':t}

    function timeAgo(iso){
      if(!iso)return'';
      var d=new Date(iso),now=new Date(),diff=Math.floor((now-d)/1000);
      if(diff<60)return'now';
      if(diff<3600)return Math.floor(diff/60)+'m';
      if(diff<86400)return Math.floor(diff/3600)+'h';
      if(diff<604800)return Math.floor(diff/86400)+'d';
      return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    }
    function fmtDate(iso){
      if(!iso)return'';
      try{
        var d=new Date(iso);
        var now=new Date();
        var diff=Math.floor((now-d)/1000);
        var dateStr=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
        var timeStr=d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
        var agoStr='';
        if(diff<3600)agoStr=' ('+Math.floor(diff/60)+' minutes ago)';
        else if(diff<86400)agoStr=' ('+Math.floor(diff/3600)+' hours ago)';
        else if(diff<604800)agoStr=' ('+Math.floor(diff/86400)+' days ago)';
        return dateStr+', '+timeStr+agoStr;
      }catch(e){return iso}
    }

    function avatarClass(i){return 'a'+(i%5+1)}

    function extractCode(subj,prev,body){
      var plain=body?body.replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi,' ').replace(/<[^>]*>?/gm,' '):'';
      var all=(subj||'')+' '+(prev||'')+' '+plain;
      var isOtp=/(?:verify|verif|code|kode|OTP|PIN|passcode|security|token|sandi|password|auth|login)/i.test(all);
      var pats=[/(\\d{4,8})\\s*(?:is your|adalah|code|kode|for)/i,/(?:use|enter|masukkan|gunakan)[\\s\\S]{0,20}?(\\d{4,8})\\b/i,/(?:code|kode|OTP|PIN|Steam Guard|token|sandi)[\\s\\S]{0,40}?([A-Z0-9]{5,8})\\b/i,/(?<!#)\\b(\\d{4,8})\\b/i];
      for(var p=0;p<pats.length;p++){var re=new RegExp(pats[p].source,'gi');var m;while((m=re.exec(all))!==null){var c=m[1];if(!c||/^0+$/.test(c)||/^1+$/.test(c))continue;if(/[a-zA-Z]/.test(c)){if(c.length>=5&&/\\d/.test(c)&&c===c.toUpperCase())return c;continue}if(/^\\d{4,8}$/.test(c)){if(pats[p].source.indexOf('\\\\d{4,8}')>=0){if(isOtp)return c}else{return c}}}}
      return'';
    }

    function render(list){
      if(!list.length){area.innerHTML='<div class="inbox-empty">Inbox is empty.</div>';return}
      var html='<div class="mail-list">';
      list.forEach(function(m,i){
        var code=extractCode(m.subject,m.preview,m.body);
        var sender=m.from||m.fromEmail||'Unknown';
        var initial=(sender[0]||'?').toUpperCase();
        var isOpen=(openIdx===i);
        var isMeta=!!metaOpen[i];
        var copyIcon='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>';
        var codeH=code?'<span class="otp-code" data-c="'+h(code)+'"><span>'+h(code)+'</span>'+copyIcon+'</span>':'';

        html+='<div class="mail-item'+(isOpen?' expanded':'')+(m.isRead?' read':' unread')+'" data-i="'+i+'">'
          +'<div class="mail-row" data-i="'+i+'">'
          +'<div class="mail-avatar '+avatarClass(i)+'">'+initial+'</div>'
          +'<div class="mail-body">'
          +'<div class="mail-top"><span class="mail-sender">'+h(sender)+'</span><span class="mail-time">'+timeAgo(m.date)+'</span></div>'
          +'<div class="mail-subj">'+h(m.subject||'(No Subject)')+'</div>'
          +(isOpen?'':'<div class="mail-preview">'+h(trunc(m.preview,120))+'</div>')
          +'</div>'
          +(codeH&&!isOpen?'<div class="mail-right">'+codeH+'</div>':'')
          +'</div>';

        if(isOpen){
          html+='<div class="mail-detail">'

            +'<div class="mail-detail-row">'
            +'<div class="mail-detail-left">'
            +'<span class="mail-detail-sender">'+h(sender)+(m.fromEmail?' <span class="mail-detail-addr">&lt;'+h(m.fromEmail)+'&gt;</span>':'')+'</span>'
            +'<button class="mail-toggle-btn" data-meta="'+i+'">'
            +'to '+h(em)+' <span class="mail-toggle-ico'+(isMeta?' open':'')+'"></span>'
            +'</button>'
            +'</div>'
            +'<div class="mail-detail-right">'
            +'<span class="mail-detail-date">'+fmtDate(m.date)+'</span>'
            +(code?codeH:'')
            +'<button class="mail-del-btn" data-del="'+i+'" title="Delete email"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>'
            +'</div>'
            +'</div>'

            +(deleting[i]?'<div class="mail-del-confirm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:.7"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>Delete permanently?</span><div class="mail-del-actions"><button class="btn btn-sm btn-s mail-del-cancel" data-dcancel="'+i+'">Cancel</button><button class="btn btn-sm mail-del-go" data-dgo="'+i+'">Delete</button></div></div>':'')

            +(isMeta?'<div class="mail-detail-meta"><table class="mail-meta-tbl">'
            +'<tr><td class="meta-k">from:</td><td class="meta-v">'+h(sender)+(m.fromEmail?' &lt;'+h(m.fromEmail)+'&gt;':'')+'</td></tr>'
            +'<tr><td class="meta-k">to:</td><td class="meta-v">'+h(em)+'</td></tr>'
            +'<tr><td class="meta-k">date:</td><td class="meta-v">'+fmtDate(m.date)+'</td></tr>'
            +'<tr><td class="meta-k">subject:</td><td class="meta-v">'+h(m.subject||'(No Subject)')+'</td></tr>'
            +'</table></div>':'')

            +'<div class="mail-detail-body" id="mBody'+i+'"></div>'
            +'</div>';
        }
        html+='</div>';
      });
      html+='</div>';area.innerHTML=html;

      if(openIdx>=0&&openIdx<list.length){
        var m=list[openIdx];
        var bodyEl=document.getElementById('mBody'+openIdx);
        if(bodyEl){
          if(m.body&&m.body.indexOf('<')>=0){
            var ifr=document.createElement('iframe');
            ifr.sandbox='allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';
            ifr.style.cssText='width:100%;border:none;min-height:200px;border-radius:8px;background:#fff';
            var bodyHtml=m.body
              .replace(/<a /gi,'<a target="_blank" rel="noopener noreferrer" ')
              .replace(/<form /gi,'<form target="_blank" ');
            ifr.srcdoc='<!DOCTYPE html><html><head><meta charset=UTF-8><base target="_blank"><style>body{font-family:Inter,system-ui,sans-serif;font-size:14px;color:#333;padding:16px;margin:0;line-height:1.6;background:#fff}img{max-width:100%;height:auto}a{color:#4A7A4E}table{max-width:100%}*{max-width:100%;word-wrap:break-word;box-sizing:border-box}</style></head><body>'+bodyHtml+'</body></html>';
            ifr.onload=function(){try{ifr.style.height=Math.max(ifr.contentDocument.body.scrollHeight+30,200)+'px'}catch(e){ifr.style.height='400px'}};
            bodyEl.appendChild(ifr);
          }else{
            var p=document.createElement('div');p.style.cssText='white-space:pre-wrap;line-height:1.7;font-size:.875rem;color:var(--t2)';
            p.textContent=m.preview||m.body||'(No content)';bodyEl.appendChild(p);
          }
        }
      }
    }

    area.addEventListener('click',function(e){
      var cb=e.target.closest('.otp-code');
      if(cb){e.stopPropagation();
        var code=cb.dataset.c;
        navigator.clipboard.writeText(code).then(function(){
          var sp=cb.querySelector('span');
          var orig=sp.textContent;
          sp.textContent='Copied';cb.classList.add('copied');
          showToast('','Code "'+code+'" copied');
          setTimeout(function(){sp.textContent=orig;cb.classList.remove('copied')},1400);
        });
        return;
      }
      var metaBtn=e.target.closest('.mail-toggle-btn');
      if(metaBtn){
        e.stopPropagation();
        var mi=parseInt(metaBtn.dataset.meta,10);
        metaOpen[mi]=!metaOpen[mi];
        render(msgs);
        return;
      }
      var delBtn=e.target.closest('.mail-del-btn');
      if(delBtn){e.stopPropagation();var di=parseInt(delBtn.dataset.del,10);deleting[di]=true;render(msgs);return}
      var dcancel=e.target.closest('.mail-del-cancel');
      if(dcancel){e.stopPropagation();var ci=parseInt(dcancel.dataset.dcancel,10);delete deleting[ci];render(msgs);return}
      var dgo=e.target.closest('.mail-del-go');
      if(dgo){e.stopPropagation();var gi=parseInt(dgo.dataset.dgo,10);doDelete(gi);return}
      var row=e.target.closest('.mail-row');
      if(row){
        var idx=parseInt(row.dataset.i,10);
        if(openIdx===idx){openIdx=-1}else{openIdx=idx}
        render(msgs);
        if(openIdx>=0){
          var expanded=document.querySelector('.mail-item.expanded');
          if(expanded)expanded.scrollIntoView({behavior:'smooth',block:'nearest'});
        }
      }
    });

    function mergeMessages(newMsgs){
      if(!msgs.length){msgs=newMsgs;return}
      var existingMap={};
      msgs.forEach(function(m,i){existingMap[(m.subject||'')+'|'+(m.date||'')+'|'+(m.fromEmail||'')]=i});
      var added=0;
      newMsgs.forEach(function(m){
        var key=(m.subject||'')+'|'+(m.date||'')+'|'+(m.fromEmail||'');
        if(key in existingMap){
          var idx=existingMap[key];
          if(m.id&&!msgs[idx].id)msgs[idx].id=m.id;
          if(m.id&&msgs[idx].id!==m.id)msgs[idx].id=m.id;
        }else{msgs.unshift(m);added++}
      });
      msgs.sort(function(a,b){return new Date(b.date||0)-new Date(a.date||0)});
      return added;
    }

    async function doRead(){
      if(loading)return;loading=true;
      readBtn.disabled=true;readBtn.querySelector('.btn-text').textContent='Loading...';
      readBtn.querySelector('.btn-loader').style.display='inline-flex';
      showSt('load','Fetching inbox...');
      try{
        var r=await fetch('/api/read-inbox',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em})});
        var d=await r.json();
        if(d.success){
          var added=mergeMessages(d.messages);
          saveCache();
          render(msgs);
          if(added>0&&msgs.length>d.messageCount){showSt('ok',msgs.length+' total ('+added+' new)')}
          else{showSt('ok',d.messageCount+' messages found.')}
        }
        else{showSt('err',d.error||'Failed to read inbox.')}
      }catch(x){showSt('err','Error: '+x.message)}
      finally{loading=false;readBtn.disabled=false;readBtn.querySelector('.btn-text').textContent='Read Inbox';readBtn.querySelector('.btn-loader').style.display='none'}
    }

    async function doDelete(idx){
      var m=msgs[idx];
      if(!m||!m.id){showToast('','Click Read Inbox first to enable delete');return}
      var item=document.querySelector('.mail-item[data-i="'+idx+'"]');
      if(item)item.classList.add('deleting');
      try{
        var r=await fetch('/api/delete-message',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,messageId:m.id})});
        var d=await r.json();
        if(d.success){
          msgs.splice(idx,1);
          delete deleting[idx];
          if(openIdx===idx)openIdx=-1;
          else if(openIdx>idx)openIdx--;
          saveCache();
          setTimeout(function(){render(msgs)},280);
          showToast('','Email deleted');
        }else{
          if(item)item.classList.remove('deleting');
          delete deleting[idx];
          render(msgs);
          showToast('',d.error||'Delete failed');
        }
      }catch(x){
        if(item)item.classList.remove('deleting');
        delete deleting[idx];
        render(msgs);
        showToast('','Error: '+x.message);
      }
    }
    readBtn.addEventListener('click',doRead);

    if(loadCache()){render(msgs);showSt('ok',msgs.length+' cached messages. Click Read Inbox for latest.')}

    function startAR(){stopAR();var s=parseInt(arI.value,10);cdVal=s;arCd.style.display='inline';arCd.textContent=cdVal+'s';
      cdTimer=setInterval(function(){cdVal--;if(cdVal<=0)cdVal=parseInt(arI.value,10);arCd.textContent=cdVal+'s'},1000);
      timer=setInterval(function(){cdVal=parseInt(arI.value,10);if(!loading)doRead()},s*1000);
    }
    function stopAR(){if(timer){clearInterval(timer);timer=null}if(cdTimer){clearInterval(cdTimer);cdTimer=null}arCd.style.display='none'}
    arT.addEventListener('change',function(){if(arT.checked){if(!loading)doRead();startAR();showToast('','Auto refresh on')}else{stopAR();showToast('','Auto refresh off')}});
    arI.addEventListener('change',function(){if(arT.checked)startAR()});
  })();`;
}
