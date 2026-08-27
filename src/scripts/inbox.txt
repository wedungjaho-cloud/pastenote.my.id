/* ═══════════════════════════════════════════════════════
   PasteNote — inbox.js
   Client-side inbox logic: search/filter, read, expand, delete,
   auto-refresh, note copy, split-pane resize & local cache
   Reads email from window.__PN_EMAIL__
   ═══════════════════════════════════════════════════════ */
(function(){
  var em = window.__PN_EMAIL__;
  var readBtn = document.getElementById('readBtn');
  var area = document.getElementById('inboxArea');
  var sBar = document.getElementById('statusBar');
  var arT = document.getElementById('arToggle');
  var arI = document.getElementById('arInterval');
  var arCd = document.getElementById('arCd');
  var detailPane = document.getElementById('detailPane');
  var detailInner = document.getElementById('detailInner');
  var detailEmpty = document.getElementById('detailEmpty');
  var mailSearch = document.getElementById('mailSearch');
  var btnClearSearch = document.getElementById('btnClearSearch');
  var btnCopyNote = document.getElementById('btnCopyNote');
  var noteContentText = document.getElementById('noteContentText');

  var loading = false, msgs = [], searchQuery = '', timer = null, cdTimer = null, cdVal = 0;
  var openIdx = -1, metaOpen = {}, deleting = {};

  function isDesktop(){ return window.innerWidth > 880 && detailPane; }

  var CACHE_KEY = 'pn_inbox_' + em;

  function saveCache(){
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), msgs: msgs })); } catch(e){}
  }
  function loadCache(){
    try {
      var d = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (d && d.msgs && Array.isArray(d.msgs)) { msgs = d.msgs; return true; }
    } catch(e){}
    return false;
  }

  function showSt(t, m){
    if (!sBar) return;
    sBar.className = 'status status-' + t;
    sBar.querySelector('.status-text').textContent = m;
    sBar.style.display = 'flex';
  }
  function h(t){
    var d = document.createElement('div');
    d.textContent = t || '';
    return d.innerHTML;
  }

  function timeAgo(iso){
    if (!iso) return '';
    var d = new Date(iso), now = new Date(), diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function fmtDate(iso){
    if (!iso) return '';
    try {
      var d = new Date(iso);
      var now = new Date();
      var diff = Math.floor((now - d) / 1000);
      var dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      var timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      var agoStr = '';
      if (diff < 3600) agoStr = ' (' + Math.floor(diff / 60) + ' minutes ago)';
      else if (diff < 86400) agoStr = ' (' + Math.floor(diff / 3600) + ' hours ago)';
      else if (diff < 604800) agoStr = ' (' + Math.floor(diff / 86400) + ' days ago)';
      return dateStr + ', ' + timeStr + agoStr;
    } catch(e){ return iso; }
  }

  function avatarClass(i){ return 'a' + (i % 5 + 1); }

  function extractCode(subj, prev, body){
    var plain = body ? body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>?/gm, ' ') : '';
    var all = (subj || '') + ' ' + (prev || '') + ' ' + plain;
    var isOtp = /(?:verify|verif|code|kode|OTP|PIN|passcode|security|token|sandi|password|auth|login)/i.test(all);
    var pats = [
      /(\d{4,8})\s*(?:is your|adalah|code|kode|for)/i,
      /(?:use|enter|masukkan|gunakan)[\s\S]{0,20}?(\d{4,8})\b/i,
      /(?:code|kode|OTP|PIN|Steam Guard|token|sandi)[\s\S]{0,40}?([A-Z0-9]{5,8})\b/i,
      /(?<!#)\b(\d{4,8})\b/i
    ];
    for (var p = 0; p < pats.length; p++){
      var re = new RegExp(pats[p].source, 'gi');
      var m;
      while ((m = re.exec(all)) !== null){
        var c = m[1];
        if (!c || /^0+$/.test(c) || /^1+$/.test(c)) continue;
        if (/[a-zA-Z]/.test(c)){
          if (c.length >= 5 && /\d/.test(c) && c === c.toUpperCase()) return c;
          continue;
        }
        if (/^\d{4,8}$/.test(c)){
          if (pats[p].source.indexOf('\\d{4,8}') >= 0){
            if (isOtp) return c;
          } else { return c; }
        }
      }
    }
    return '';
  }

  var copyIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>';
  var delIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"/></svg>';

  /* Get list after applying search filter */
  function getFilteredMsgs(){
    if (!searchQuery) return msgs;
    var q = searchQuery.toLowerCase();
    return msgs.filter(function(m){
      var code = extractCode(m.subject, m.preview, m.body);
      return (m.from && m.from.toLowerCase().indexOf(q) >= 0)
        || (m.fromEmail && m.fromEmail.toLowerCase().indexOf(q) >= 0)
        || (m.subject && m.subject.toLowerCase().indexOf(q) >= 0)
        || (m.preview && m.preview.toLowerCase().indexOf(q) >= 0)
        || (code && code.toLowerCase().indexOf(q) >= 0);
    });
  }

  function render(){
    var list = getFilteredMsgs();
    if (!list.length){
      area.innerHTML = searchQuery
        ? '<div class="inbox-empty">No messages matching "' + h(searchQuery) + '".</div>'
        : '<div class="inbox-empty">Inbox is empty.</div>';
      if (isDesktop()) renderDetailEmpty();
      return;
    }
    var desktop = isDesktop();
    var html = '<div class="mail-list">';
    list.forEach(function(m, i){
      var code = extractCode(m.subject, m.preview, m.body);
      var sender = m.from || m.fromEmail || 'Unknown';
      var initial = (sender[0] || '?').toUpperCase();
      var isOpen = (openIdx === i);
      var codeH = code ? '<span class="otp-code" data-c="' + h(code) + '"><span>' + h(code) + '</span>' + copyIcon + '</span>' : '';
      var miniCode = code ? '<span class="mini-code" data-c="' + h(code) + '">' + h(code) + '</span>' : '';

      /* Mail Row */
      html += '<div class="mail-item' + (isOpen && !desktop ? ' expanded' : '') + '" data-i="' + i + '">'
        + '<div class="mail-row' + (isOpen && desktop ? ' active' : '') + '" data-i="' + i + '">'
        + '<div class="mail-avatar ' + avatarClass(i) + '">' + initial + '</div>'
        + '<div class="mail-body">'
        + '<div class="mail-top"><span class="mail-sender">' + h(sender) + '</span><span class="mail-time">' + timeAgo(m.date) + '</span></div>'
        + '<div class="mail-subj">' + h(m.subject || '(No Subject)') + '</div>'
        + '<div class="mail-preview">' + h(m.preview || '') + '</div>'
        + '</div>'
        + '<div class="mail-right">' + (miniCode || '') + '</div>'
        + '</div>';

      /* Mobile Inline Detail (matching desktop layout) */
      if (isOpen && !desktop){
        html += '<div class="mail-detail">'
          + '<div class="dh">'
          + '<div class="dh-left">'
          + '<div class="dh-avatar ' + avatarClass(i) + '">' + initial + '</div>'
          + '<div><div class="dh-sender">' + h(sender) + '</div><div class="dh-subject">' + h(m.subject || '(No Subject)') + '</div></div>'
          + '</div>'
          + '<div class="dh-actions">'
          + '<span class="time-tag">' + timeAgo(m.date) + '</span>'
          + (code ? codeH : '')
          + '<button class="mail-del-btn" data-del="' + i + '" title="Delete email">' + delIcon + '</button>'
          + '</div>'
          + '</div>';

        if (deleting[i]){
          html += '<div class="mail-del-confirm">'
            + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
            + '<span>Delete permanently?</span>'
            + '<div class="mail-del-actions">'
            + '<button class="btn btn-sm btn-s mail-del-cancel" data-dcancel="' + i + '">Cancel</button>'
            + '<button class="btn btn-sm mail-del-go" data-dgo="' + i + '">Delete</button>'
            + '</div></div>';
        }

        html += '<div class="mail-detail-meta">'
          + '<div class="meta-row"><span class="meta-k">FROM</span><span class="meta-v">' + h(sender) + (m.fromEmail ? ' &lt;' + h(m.fromEmail) + '&gt;' : '') + '</span></div>'
          + '<div class="meta-row"><span class="meta-k">TO</span><span class="meta-v">' + h(em) + '</span></div>'
          + '<div class="meta-row"><span class="meta-k">DATE</span><span class="meta-v">' + fmtDate(m.date) + '</span></div>'
          + '</div>';

        html += '<div class="content-frame">'
          + '<div class="frame-topbar"><span class="frame-dot" style="background:#e5625e"></span><span class="frame-dot" style="background:#e8a94b"></span><span class="frame-dot" style="background:#3ecf8e"></span><span>rendered email</span></div>'
          + '<div class="mail-detail-body" id="mBody' + i + '"></div>'
          + '</div>';

        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    area.innerHTML = html;

    /* Render email body */
    if (openIdx >= 0 && openIdx < list.length){
      var currentMsg = list[openIdx];
      if (desktop){
        renderDesktopDetail(currentMsg, openIdx);
      } else {
        renderEmailBody(document.getElementById('mBody' + openIdx), currentMsg);
      }
    } else if (desktop) {
      renderDetailEmpty();
    }
  }

  /* Render email body inside sandboxed iframe */
  function renderEmailBody(target, m){
    if (!target) return;
    if (m.body && m.body.indexOf('<') >= 0){
      var ifr = document.createElement('iframe');
      ifr.sandbox = 'allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';
      ifr.style.cssText = 'width:100%;border:none;min-height:200px;background:#fff';
      var bodyHtml = m.body
        .replace(/<a /gi, '<a target="_blank" rel="noopener noreferrer" ')
        .replace(/<form /gi, '<form target="_blank" ');
      ifr.srcdoc = '<!DOCTYPE html><html><head><meta charset=UTF-8><base target="_blank"><style>body{font-family:Inter,system-ui,sans-serif;font-size:13.5px;color:#222;padding:16px;margin:0;line-height:1.6;background:#fff}img{max-width:100%;height:auto}a{color:#1a8f5c}table{max-width:100%}*{max-width:100%;word-wrap:break-word;box-sizing:border-box}</style></head><body>' + bodyHtml + '</body></html>';
      ifr.onload = function(){
        try { ifr.style.height = Math.max(ifr.contentDocument.body.scrollHeight + 30, 200) + 'px'; }
        catch(e){ ifr.style.height = '420px'; }
      };
      target.appendChild(ifr);
    } else {
      var p = document.createElement('div');
      p.style.cssText = 'white-space:pre-wrap;line-height:1.65;font-size:13px;color:var(--ink-dim);padding:16px';
      p.textContent = m.preview || m.body || '(No content)';
      target.appendChild(p);
    }
  }

  /* Render detail pane for desktop */
  function renderDesktopDetail(m, idx){
    if (!detailInner || !detailEmpty) return;
    detailEmpty.style.display = 'none';
    detailInner.style.display = 'block';

    var sender = m.from || m.fromEmail || 'Unknown';
    var initial = (sender[0] || '?').toUpperCase();
    var code = extractCode(m.subject, m.preview, m.body);
    var codeH = code ? '<span class="otp-code" data-c="' + h(code) + '"><span>' + h(code) + '</span>' + copyIcon + '</span>' : '';

    var dhtml = '<div class="dh">'
      + '<div class="dh-left">'
      + '<div class="dh-avatar ' + avatarClass(idx) + '">' + initial + '</div>'
      + '<div><div class="dh-sender">' + h(sender) + '</div><div class="dh-subject">' + h(m.subject || '(No Subject)') + '</div></div>'
      + '</div>'
      + '<div class="dh-actions">'
      + '<span class="time-tag">' + timeAgo(m.date) + '</span>'
      + (code ? codeH : '')
      + '<button class="mail-del-btn" data-del="' + idx + '" title="Delete email">' + delIcon + '</button>'
      + '</div>'
      + '</div>';

    /* Delete confirm */
    if (deleting[idx]){
      dhtml += '<div class="mail-del-confirm">'
        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        + '<span>Delete permanently?</span>'
        + '<div class="mail-del-actions">'
        + '<button class="btn btn-sm btn-s mail-del-cancel" data-dcancel="' + idx + '">Cancel</button>'
        + '<button class="btn btn-sm mail-del-go" data-dgo="' + idx + '">Delete</button>'
        + '</div></div>';
    }

    /* Meta table */
    dhtml += '<div class="mail-detail-meta">'
      + '<div class="meta-row"><span class="meta-k">FROM</span><span class="meta-v">' + h(sender) + (m.fromEmail ? ' &lt;' + h(m.fromEmail) + '&gt;' : '') + '</span></div>'
      + '<div class="meta-row"><span class="meta-k">TO</span><span class="meta-v">' + h(em) + '</span></div>'
      + '<div class="meta-row"><span class="meta-k">DATE</span><span class="meta-v">' + fmtDate(m.date) + '</span></div>'
      + '</div>';

    /* Content frame */
    dhtml += '<div class="content-frame">'
      + '<div class="frame-topbar"><span class="frame-dot" style="background:#e5625e"></span><span class="frame-dot" style="background:#e8a94b"></span><span class="frame-dot" style="background:#3ecf8e"></span><span>rendered email</span></div>'
      + '<div id="dBodyFrame"></div>'
      + '</div>';

    detailInner.innerHTML = dhtml;
    renderEmailBody(document.getElementById('dBodyFrame'), m);
  }

  function renderDetailEmpty(){
    if (!detailEmpty || !detailInner) return;
    detailEmpty.style.display = 'flex';
    detailInner.style.display = 'none';
  }

  /* Copy OTP Handler */
  function copyOtpHandler(cb){
    var code = cb.dataset.c;
    if (!code) return;
    navigator.clipboard.writeText(code).then(function(){
      var sp = cb.querySelector('span');
      var orig = sp ? sp.textContent : code;
      if (sp) sp.textContent = 'Copied';
      cb.classList.add('copied');
      if (window.showToast) window.showToast('', 'Code "' + code + '" copied to clipboard');
      setTimeout(function(){
        if (sp) sp.textContent = orig;
        cb.classList.remove('copied');
      }, 1400);
    });
  }

  /* Mail List Click Delegation */
  area.addEventListener('click', function(e){
    var cb = e.target.closest('.otp-code') || e.target.closest('.mini-code');
    if (cb){
      e.stopPropagation();
      copyOtpHandler(cb);
      return;
    }
    var delBtn = e.target.closest('.mail-del-btn');
    if (delBtn){ e.stopPropagation(); var di = parseInt(delBtn.dataset.del, 10); deleting[di] = true; render(); return; }
    var dcancel = e.target.closest('.mail-del-cancel');
    if (dcancel){ e.stopPropagation(); var ci = parseInt(dcancel.dataset.dcancel, 10); delete deleting[ci]; render(); return; }
    var dgo = e.target.closest('.mail-del-go');
    if (dgo){ e.stopPropagation(); var gi = parseInt(dgo.dataset.dgo, 10); doDelete(gi); return; }

    var row = e.target.closest('.mail-row');
    if (row){
      var idx = parseInt(row.dataset.i, 10);
      if (openIdx === idx){ openIdx = -1; } else { openIdx = idx; }
      render();
      if (openIdx >= 0 && !isDesktop()){
        var expanded = document.querySelector('.mail-item.expanded');
        if (expanded) expanded.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });

  /* Desktop Detail Click Delegation */
  if (detailPane) {
    detailPane.addEventListener('click', function(e){
      var cb = e.target.closest('.otp-code');
      if (cb){
        e.stopPropagation();
        copyOtpHandler(cb);
        return;
      }
      var delBtn = e.target.closest('.mail-del-btn');
      if (delBtn){ e.stopPropagation(); var di = parseInt(delBtn.dataset.del, 10); deleting[di] = true; render(); return; }
      var dcancel = e.target.closest('.mail-del-cancel');
      if (dcancel){ e.stopPropagation(); var ci = parseInt(dcancel.dataset.dcancel, 10); delete deleting[ci]; render(); return; }
      var dgo = e.target.closest('.mail-del-go');
      if (dgo){ e.stopPropagation(); var gi = parseInt(dgo.dataset.dgo, 10); doDelete(gi); return; }
    });
  }

  /* Copy Note Button */
  if (btnCopyNote && noteContentText) {
    btnCopyNote.addEventListener('click', function(){
      var text = noteContentText.textContent || '';
      navigator.clipboard.writeText(text).then(function(){
        btnCopyNote.querySelector('span').textContent = 'Copied';
        if (window.showToast) window.showToast('', 'Note copied to clipboard');
        setTimeout(function(){ btnCopyNote.querySelector('span').textContent = 'Copy'; }, 1400);
      });
    });
  }

  /* Mail Search Filter */
  if (mailSearch) {
    mailSearch.addEventListener('input', function(){
      searchQuery = mailSearch.value.trim();
      if (btnClearSearch) btnClearSearch.style.display = searchQuery ? 'inline-flex' : 'none';
      openIdx = -1;
      render();
    });
  }
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', function(){
      mailSearch.value = '';
      searchQuery = '';
      btnClearSearch.style.display = 'none';
      mailSearch.focus();
      render();
    });
  }

  function mergeMessages(newMsgs){
    if (!msgs.length){ msgs = newMsgs; return newMsgs.length; }
    var existingMap = {};
    msgs.forEach(function(m, i){
      existingMap[(m.subject || '') + '|' + (m.date || '') + '|' + (m.fromEmail || '')] = i;
    });
    var added = 0;
    newMsgs.forEach(function(m){
      var key = (m.subject || '') + '|' + (m.date || '') + '|' + (m.fromEmail || '');
      if (key in existingMap){
        var idx = existingMap[key];
        if (m.id && !msgs[idx].id) msgs[idx].id = m.id;
        if (m.id && msgs[idx].id !== m.id) msgs[idx].id = m.id;
      } else { msgs.unshift(m); added++; }
    });
    msgs.sort(function(a, b){ return new Date(b.date || 0) - new Date(a.date || 0); });
    return added;
  }

  async function doRead(){
    if (loading || !readBtn) return;
    loading = true;
    readBtn.disabled = true;
    readBtn.querySelector('.btn-text').textContent = 'Loading...';
    readBtn.querySelector('.btn-loader').style.display = 'inline-flex';
    showSt('load', 'Fetching inbox...');
    try {
      var r = await fetch('/api/read-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em })
      });
      var d = await r.json();
      if (d.success){
        var added = mergeMessages(d.messages || []);
        saveCache();
        render();
        if (added > 0 && msgs.length > (d.messageCount || 0)){
          showSt('ok', msgs.length + ' total (' + added + ' new)');
        } else {
          showSt('ok', (d.messageCount || 0) + ' messages found.');
        }
      } else {
        showSt('err', d.error || 'Failed to read inbox.');
      }
    } catch(x){
      showSt('err', 'Error: ' + x.message);
    } finally {
      loading = false;
      readBtn.disabled = false;
      readBtn.querySelector('.btn-text').textContent = 'Read Inbox';
      readBtn.querySelector('.btn-loader').style.display = 'none';
    }
  }

  async function doDelete(idx){
    var list = getFilteredMsgs();
    var m = list[idx];
    if (!m) return;

    /* If cached message has no ID, fetch fresh inbox first */
    if (!m.id){
      if (window.showToast) window.showToast('', 'Fetching fresh data...');
      try {
        var fr = await fetch('/api/read-inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: em })
        });
        var fd = await fr.json();
        if (fd.success){
          mergeMessages(fd.messages || []);
          saveCache();
          var found = -1;
          for (var fi = 0; fi < msgs.length; fi++){
            if (msgs[fi].subject === m.subject && msgs[fi].date === m.date && msgs[fi].fromEmail === m.fromEmail){
              found = fi; break;
            }
          }
          if (found >= 0 && msgs[found].id){
            m = msgs[found];
          } else {
            var origIdx = msgs.indexOf(m);
            if (origIdx >= 0) msgs.splice(origIdx, 1);
            delete deleting[idx];
            saveCache();
            render();
            if (window.showToast) window.showToast('', 'Message already deleted on server');
            return;
          }
        }
      } catch(fe){
        if (window.showToast) window.showToast('', 'Network error. Try again.');
        delete deleting[idx]; render(); return;
      }
    }

    var item = document.querySelector('.mail-item[data-i="' + idx + '"]');
    if (item) item.classList.add('deleting');
    try {
      var r = await fetch('/api/delete-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, messageId: m.id })
      });
      var d = await r.json();
      if (d.success){
        var origIdx = msgs.indexOf(m);
        if (origIdx >= 0) msgs.splice(origIdx, 1);
        delete deleting[idx];
        if (openIdx === idx) openIdx = -1;
        else if (openIdx > idx) openIdx--;
        saveCache();
        setTimeout(function(){ render(); }, 280);
        if (window.showToast) window.showToast('', 'Email deleted');
      } else {
        if (item) item.classList.remove('deleting');
        delete deleting[idx];
        render();
        if (window.showToast) window.showToast('', d.error || 'Delete failed');
      }
    } catch(x){
      if (item) item.classList.remove('deleting');
      delete deleting[idx];
      render();
      if (window.showToast) window.showToast('', 'Error: ' + x.message);
    }
  }

  if (readBtn) readBtn.addEventListener('click', doRead);

  /* Load cache on init */
  if (loadCache()){
    render();
    showSt('ok', msgs.length + ' cached messages. Click Read Inbox for latest.');
  }

  /* Auto-refresh */
  function startAR(){
    stopAR();
    var s = parseInt(arI.value, 10);
    cdVal = s;
    arCd.style.display = 'inline';
    arCd.textContent = cdVal + 's';
    cdTimer = setInterval(function(){
      cdVal--;
      if (cdVal <= 0) cdVal = parseInt(arI.value, 10);
      arCd.textContent = cdVal + 's';
    }, 1000);
    timer = setInterval(function(){
      cdVal = parseInt(arI.value, 10);
      if (!loading) doRead();
    }, s * 1000);
  }
  function stopAR(){
    if (timer){ clearInterval(timer); timer = null; }
    if (cdTimer){ clearInterval(cdTimer); cdTimer = null; }
    if (arCd) arCd.style.display = 'none';
  }
  if (arT) {
    arT.addEventListener('change', function(){
      if (arT.checked){ if (!loading) doRead(); startAR(); if (window.showToast) window.showToast('', 'Auto refresh on'); }
      else { stopAR(); if (window.showToast) window.showToast('', 'Auto refresh off'); }
    });
  }
  if (arI) {
    arI.addEventListener('change', function(){ if (arT && arT.checked) startAR(); });
  }

  /* ─── Resizable Split Pane ─── */
  (function initResize(){
    var handle = document.getElementById('resizeHandle');
    var layout = document.getElementById('pageLayout');
    if (!handle || !layout) return;

    var RAIL_KEY = 'pn_rail_w';
    var MIN_PX = 280;

    /* Restore saved width */
    try {
      var saved = localStorage.getItem(RAIL_KEY);
      if (saved) {
        var pct = parseFloat(saved);
        if (pct >= 15 && pct <= 55) {
          layout.style.setProperty('--rail-w', pct + '%');
        }
      }
    } catch(e){}

    var dragging = false;

    function onDown(e){
      if (window.innerWidth <= 880) return;
      e.preventDefault();
      dragging = true;
      handle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }

    function onMove(e){
      if (!dragging) return;
      e.preventDefault();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var totalW = layout.offsetWidth;
      var newW = Math.max(MIN_PX, Math.min(clientX, totalW * 0.55));
      var pct = (newW / totalW) * 100;
      layout.style.setProperty('--rail-w', pct + '%');
    }

    function onUp(){
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      try {
        var cs = getComputedStyle(layout);
        var railPx = parseFloat(cs.gridTemplateColumns);
        var pct = (railPx / layout.offsetWidth) * 100;
        localStorage.setItem(RAIL_KEY, pct.toFixed(1));
      } catch(e){}
    }

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: false });

    handle.addEventListener('dblclick', function(){
      layout.style.removeProperty('--rail-w');
      try { localStorage.removeItem(RAIL_KEY); } catch(e){}
    });
  })();
})();

