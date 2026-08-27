/* ═══════════════════════════════════════════════════════
   PasteNote — admin-dash.js
   Admin dashboard client JS: tabs, CRUD, bulk import, tools, settings
   Reads data from window.__PN_PAGES__ and window.__PN_SETTINGS__
   ═══════════════════════════════════════════════════════ */
(function() {
  if (typeof window.showToast !== 'function') {
    window.showToast = function(icon, msg) { console.log(icon, msg); };
  }

  var pages = window.__PN_PAGES__ || [];
  var settings = window.__PN_SETTINGS__ || {};

  /* ─── Tab switching ─── */
  document.querySelectorAll('.nav-pill').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.nav-pill').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.tab').forEach(function(t) { t.style.display = 'none'; });
      document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
    });
  });

  /* ─── Logout ─── */
  document.getElementById('logoutBtn').addEventListener('click', async function() {
    await fetch('/atmin/api/logout', { method: 'POST' });
    window.location.href = '/atmin/login';
  });

  function updateStats() {
    document.getElementById('statTotalPages').textContent = pages.length;
    document.getElementById('statInboxActive').textContent = pages.filter(function(p) { return p.inbox_enabled; }).length;
    document.getElementById('statHasConfig').textContent = pages.filter(function(p) { return p.has_config; }).length;
  }
  updateStats();

  function esc(text) { var div = document.createElement('div'); div.textContent = text || ''; return div.innerHTML; }

  /* ─── Pages list with checkboxes & Search Filter ─── */
  var selectedPages = new Set();
  var pageSearchQuery = '';
  var pageSearchInput = document.getElementById('adminPageSearch');

  var editSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var delSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12"/></svg>';

  if (pageSearchInput) {
    pageSearchInput.addEventListener('input', function() {
      pageSearchQuery = pageSearchInput.value.trim().toLowerCase();
      renderPagesList();
    });
  }

  function getFilteredPages() {
    if (!pageSearchQuery) return pages.map(function(p, i){ return { page: p, originalIndex: i }; });
    return pages
      .map(function(p, i){ return { page: p, originalIndex: i }; })
      .filter(function(item){
        return item.page.email && item.page.email.toLowerCase().indexOf(pageSearchQuery) >= 0;
      });
  }

  function renderPagesList() {
    var el = document.getElementById('pagesList');
    selectedPages.clear();
    updateBulkBar();
    var filtered = getFilteredPages();

    if (!pages.length) {
      el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)"><p style="font-size:13px">No pages yet. Click <strong>Add Page</strong> to create one.</p></div>';
      return;
    }
    if (!filtered.length) {
      el.innerHTML = '<div style="padding:32px;text-align:center;color:var(--muted)"><p style="font-size:13px">No pages matching "' + esc(pageSearchQuery) + '"</p></div>';
      return;
    }

    var html = '<div class="pg-head"><span></span><span>#</span><span>Email</span><span></span></div>';
    html += '<div class="pg-list">';
    filtered.forEach(function(item, displayIdx) {
      var p = item.page;
      var i = item.originalIndex;
      html += '<div class="pg-row" data-idx="' + i + '">'
        + '<input type="checkbox" class="chk page-cb" data-idx="' + i + '">'
        + '<span class="pg-num">' + (displayIdx + 1) + '</span>'
        + '<a href="/' + esc(p.email) + '" target="_blank" class="pg-email">' + esc(p.email) + '</a>'
        + '<div class="pg-right">'
        + (p.has_password ? '<span class="badge badge-ok">PW</span>' : '')
        + (p.inbox_enabled ? '<span class="badge badge-ok">Inbox</span>' : '<span class="badge badge-mute">No Inbox</span>')
        + (p.has_config ? '<span class="badge badge-ok">Config</span>' : '<span class="badge badge-mute">No Cfg</span>')
        + '<button class="pg-act btn-edit" data-idx="' + i + '" title="Edit">' + editSvg + '</button>'
        + '<button class="pg-act danger btn-del" data-idx="' + i + '" title="Delete">' + delSvg + '</button>'
        + '</div></div>';
    });
    html += '</div>';
    el.innerHTML = html;

    document.querySelectorAll('.page-cb').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var idx = parseInt(this.dataset.idx);
        if (this.checked) selectedPages.add(idx); else selectedPages.delete(idx);
        updateBulkBar();
      });
    });
  }
  renderPagesList();

  /* ─── Select All ─── */
  document.getElementById('selectAll').addEventListener('change', function() {
    var cbs = document.querySelectorAll('.page-cb');
    var checked = this.checked;
    cbs.forEach(function(cb) { cb.checked = checked; });
    selectedPages.clear();
    if (checked) {
      var filtered = getFilteredPages();
      filtered.forEach(function(item) { selectedPages.add(item.originalIndex); });
    }
    updateBulkBar();
  });

  function updateBulkBar() {
    var bar = document.getElementById('bulkBar');
    if (pages.length > 0) {
      bar.style.display = 'flex';
      document.getElementById('bulkCount').textContent = selectedPages.size + ' selected';
      document.getElementById('btnBulkDelete').style.display = selectedPages.size > 0 ? '' : 'none';
    } else { bar.style.display = 'none'; }
  }

  /* ─── Bulk delete ─── */
  document.getElementById('btnBulkDelete').addEventListener('click', async function() {
    if (!selectedPages.size) return;
    var count = selectedPages.size;
    if (!confirm('Delete ' + count + ' pages? This cannot be undone.')) return;
    this.disabled = true; this.textContent = 'Deleting...';
    var indices = Array.from(selectedPages).sort(function(a,b){return b-a;});
    for (var k = 0; k < indices.length; k++) {
      try {
        await fetch('/atmin/api/delete-page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: pages[indices[k]].email }) });
        pages.splice(indices[k], 1);
      } catch(e) {}
    }
    renderPagesList(); updateStats();
    showToast('', count + ' pages deleted.');
    this.disabled = false; this.textContent = 'Delete Selected';
  });

  /* ─── Edit panel ─── */
  var editPanel = document.getElementById('editPanel');
  var editEmail = document.getElementById('editEmail');
  var editPassword = document.getElementById('editPassword');
  var editNote = document.getElementById('editNote');
  var editConfig = document.getElementById('editConfig');
  var editInbox = document.getElementById('editInboxEnabled');
  var editingIdx = -1;

  document.getElementById('btnAddPage').addEventListener('click', function() {
    editingIdx = -1;
    editEmail.value = ''; editEmail.disabled = false;
    editPassword.value = ''; editNote.value = ''; editConfig.value = '';
    editInbox.checked = true;
    document.getElementById('editPanelTitle').textContent = 'Add New Page';
    editPanel.style.display = 'block';
    editPanel.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('btnCloseEdit').addEventListener('click', function() { editPanel.style.display = 'none'; });

  editConfig.addEventListener('paste', function() {
    setTimeout(function() {
      var val = editConfig.value.trim();
      if (val.indexOf('\t') >= 0) {
        var parts = val.split('\t');
        if (parts.length >= 2 && parts[0].indexOf('@') >= 0) {
          editEmail.value = parts[0].trim();
          editConfig.value = parts[1].trim();
          if (!editEmail.disabled) showToast('', 'Auto-detected: email + config parsed.');
        }
      }
    }, 50);
  });

  document.getElementById('pagesList').addEventListener('click', async function(e) {
    var editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
      var idx = parseInt(editBtn.dataset.idx);
      var page = pages[idx];
      editingIdx = idx;
      editEmail.value = page.email; editEmail.disabled = true;
      editPassword.value = ''; editNote.value = page.note || '';
      editConfig.value = ''; editInbox.checked = page.inbox_enabled;
      document.getElementById('editPanelTitle').textContent = 'Edit: ' + page.email;
      editPanel.style.display = 'block';
      editPanel.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    var delBtn = e.target.closest('.btn-del');
    if (delBtn) {
      var idx2 = parseInt(delBtn.dataset.idx);
      var page2 = pages[idx2];
      if (delBtn.dataset.confirming !== 'true') {
        delBtn.dataset.confirming = 'true'; delBtn.classList.add('confirming'); delBtn.title = 'Click again to confirm';
        setTimeout(function() { delBtn.dataset.confirming = ''; delBtn.classList.remove('confirming'); delBtn.title = 'Delete'; }, 3000);
        return;
      }
      delBtn.disabled = true;
      try {
        var res = await fetch('/atmin/api/delete-page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: page2.email }) });
        var data = await res.json();
        if (data.success) {
          pages.splice(idx2, 1); renderPagesList(); updateStats();
          if (editPanel.style.display !== 'none' && editingIdx === idx2) editPanel.style.display = 'none';
          showToast('', page2.email + ' deleted.');
        } else { alert('Failed: ' + (data.error || 'Unknown error')); }
      } catch (err) { alert('Error: ' + err.message); }
    }
  });

  document.getElementById('btnSavePage').addEventListener('click', async function() {
    var email = editEmail.value.trim();
    if (!email) { editEmail.focus(); return; }
    var body = { email: email, note: editNote.value, inbox_enabled: editInbox.checked };
    if (editPassword.value.trim()) body.password = editPassword.value.trim();
    if (editConfig.value.trim()) body.config = editConfig.value.trim();
    try {
      var res = await fetch('/atmin/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      var data = await res.json();
      if (data.success) {
        showToast('', email + ' saved!');
        var listRes = await fetch('/atmin/api/pages'); var listData = await listRes.json();
        if (listData.success) { pages = listData.pages; renderPagesList(); updateStats(); }
        if (editingIdx === -1) { editEmail.disabled = true; editingIdx = pages.length - 1; document.getElementById('editPanelTitle').textContent = 'Edit: ' + email; }
        editPassword.value = ''; editConfig.value = '';
      } else { alert('Error: ' + (data.error || 'Failed to save')); }
    } catch (err) { alert('Error: ' + err.message); }
  });

  /* ─── Bulk import ─── */
  var bulkPanel = document.getElementById('bulkPanel');
  var bulkInput = document.getElementById('bulkInput');
  var parsedAccounts = [];

  document.getElementById('btnBulkImport').addEventListener('click', function() { bulkPanel.style.display = 'block'; bulkPanel.scrollIntoView({ behavior: 'smooth' }); });
  document.getElementById('btnCloseBulk').addEventListener('click', function() { bulkPanel.style.display = 'none'; });

  function parseBulkInput(text) {
    var lines = text.split('\n'); var results = []; var seen = new Set();
    lines.forEach(function(line) {
      line = line.trim(); if (!line) return;
      if (!/[@|]/.test(line)) return;
      if (/^[-=]{3,}/.test(line)) return;
      if (line.indexOf('\t') >= 0) {
        var tabs = line.split('\t');
        for (var t = 0; t < tabs.length; t++) {
          var chunk = tabs[t].trim();
          if (!chunk || !chunk.includes('|')) continue;
          var parts = chunk.split('|');
          if (parts.length >= 3 && parts[0].includes('@')) {
            var cfg = chunk; if (cfg.endsWith('$')) cfg = cfg.slice(0, -1);
            var em = parts[0].trim().toLowerCase();
            if (!seen.has(em)) { seen.add(em); results.push({ email: parts[0].trim(), config: cfg, password: parts[1] || '' }); }
            break;
          }
        }
        return;
      }
      var parts2 = line.split('|');
      if (parts2.length >= 3 && parts2[0].includes('@')) {
        var cfg2 = line; if (cfg2.endsWith('$')) cfg2 = cfg2.slice(0, -1);
        var em2 = parts2[0].trim().toLowerCase();
        if (!seen.has(em2)) { seen.add(em2); results.push({ email: parts2[0].trim(), config: cfg2, password: parts2[1] || '' }); }
      }
    });
    return results;
  }

  document.getElementById('btnBulkParse').addEventListener('click', function() {
    var text = bulkInput.value.trim(); if (!text) return;
    parsedAccounts = parseBulkInput(text);
    document.getElementById('bulkParsed').textContent = parsedAccounts.length + ' accounts detected';
    document.getElementById('btnBulkRun').disabled = parsedAccounts.length === 0;
    if (parsedAccounts.length > 0) {
      var preview = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Email</th><th>PW</th><th>Config</th></tr></thead><tbody>';
      parsedAccounts.forEach(function(a, i) {
        preview += '<tr><td>' + (i+1) + '</td><td>' + esc(a.email) + '</td><td>' + esc(a.password.substring(0,8)) + '</td><td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(a.config.substring(0,50) + '...') + '</td></tr>';
      });
      preview += '</tbody></table></div>';
      document.getElementById('bulkPreview').innerHTML = preview;
      document.getElementById('bulkPreview').style.display = 'block';
    }
  });

  document.getElementById('btnBulkRun').addEventListener('click', async function() {
    if (!parsedAccounts.length) return;
    var btn = this;
    btn.disabled = true; btn.querySelector('.btn-text').textContent = 'Checking live...';
    btn.querySelector('.btn-loader').style.display = 'inline-flex';
    var statusEl = document.getElementById('bulkStatus');
    statusEl.className = 'status status-load'; statusEl.querySelector('.status-text').textContent = 'Step 1/2: Checking live status...'; statusEl.style.display = 'flex';

    var liveAccounts = [], deadAccounts = [];
    var CHUNK = 15;
    var checked = 0;

    for (var ci = 0; ci < parsedAccounts.length; ci += CHUNK) {
      var chunkAccounts = parsedAccounts.slice(ci, ci + CHUNK);
      var chunkConfigs = chunkAccounts.map(function(a) { return a.config; }).join('\n');
      try {
        var clRes = await fetch('/api/tools/check-live', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credentials: chunkConfigs, mode: 'oauth2' }) });
        var clData = await clRes.json();
        if (clData.results) {
          clData.results.forEach(function(r) {
            var matched = chunkAccounts.find(function(a) { return a.email.toLowerCase() === (r.email || '').toLowerCase(); });
            if (matched) { if (r.live) liveAccounts.push(matched); else deadAccounts.push(matched); }
          });
        }
      } catch(e) { liveAccounts = liveAccounts.concat(chunkAccounts); }
      checked += chunkAccounts.length;
      statusEl.querySelector('.status-text').textContent = 'Checking live: ' + checked + '/' + parsedAccounts.length + ' — ' + liveAccounts.length + ' live, ' + deadAccounts.length + ' dead';
    }

    statusEl.querySelector('.status-text').textContent = liveAccounts.length + ' LIVE, ' + deadAccounts.length + ' DEAD — importing live accounts...';
    btn.querySelector('.btn-text').textContent = 'Importing...';

    var ok = 0, fail = 0;
    for (var i = 0; i < liveAccounts.length; i++) {
      var a = liveAccounts[i];
      try {
        var res = await fetch('/atmin/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: a.email, config: a.config, inbox_enabled: true, note: '' }) });
        var data = await res.json();
        if (data.success) ok++; else fail++;
      } catch(e) { fail++; }
      statusEl.querySelector('.status-text').textContent = 'Importing... ' + (i+1) + '/' + liveAccounts.length;
    }

    statusEl.className = 'status status-ok';
    statusEl.querySelector('.status-text').textContent = ok + ' imported, ' + fail + ' failed, ' + deadAccounts.length + ' dead (skipped).';
    btn.disabled = false; btn.querySelector('.btn-text').textContent = 'Import All'; btn.querySelector('.btn-loader').style.display = 'none';

    var listRes = await fetch('/atmin/api/pages'); var listData = await listRes.json();
    if (listData.success) { pages = listData.pages; renderPagesList(); updateStats(); }
    showToast('', ok + ' live pages imported!');
  });

  /* ─── Export ─── */
  document.getElementById('btnExportEmail').addEventListener('click', function() {
    var emails = pages.map(function(p) { return p.email; }).join('\n');
    navigator.clipboard.writeText(emails).then(function() { showToast('', pages.length + ' emails copied!'); });
  });
  document.getElementById('btnExportEmailPw').addEventListener('click', function() {
    var lines = pages.map(function(p) { return p.email; }).join('\n');
    var blob = new Blob([lines], { type: 'text/plain' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a');
    a.href = url; a.download = 'pastenote_emails.txt'; a.click(); URL.revokeObjectURL(url);
    showToast('', 'Download started');
  });

  /* ─── Settings ─── */
  document.getElementById('settingsDefaultNote').value = settings.default_note || '';
  document.getElementById('settingsRecoveryEmail').value = settings.recovery_email || '';
  document.getElementById('settingsGeneralPw').value = settings.general_password || '';

  document.getElementById('btnSaveSettings').addEventListener('click', async function() {
    try {
      var res = await fetch('/atmin/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ default_note: document.getElementById('settingsDefaultNote').value, recovery_email: document.getElementById('settingsRecoveryEmail').value.trim(), general_password: document.getElementById('settingsGeneralPw').value.trim() }) });
      var data = await res.json();
      if (data.success) showToast('', 'Settings saved!');
      else alert(data.error || 'Failed');
    } catch (err) { alert('Error: ' + err.message); }
  });

  document.getElementById('btnChangePw').addEventListener('click', async function() {
    var oldPw = document.getElementById('settingsOldPw').value;
    var newPw = document.getElementById('settingsNewPw').value;
    var confirmPw = document.getElementById('settingsConfirmPw').value;
    if (!oldPw) { alert('Current password is required'); return; }
    if (newPw.length < 4) { alert('New password must be at least 4 characters'); return; }
    if (newPw !== confirmPw) { alert('Passwords do not match'); return; }
    try {
      var res = await fetch('/atmin/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current_admin_password: oldPw, new_admin_password: newPw }) });
      var data = await res.json();
      if (data.success) { showToast('', 'Admin password changed!'); document.getElementById('settingsOldPw').value = ''; document.getElementById('settingsNewPw').value = ''; document.getElementById('settingsConfirmPw').value = ''; }
      else { alert(data.error || 'Failed to change password'); }
    } catch (err) { alert('Error: ' + err.message); }
  });

  /* ─── Tools: Check Live ─── */
  var clInput = document.getElementById('checkLiveInput');
  var clMode = 'oauth2';
  var clModeBtns = document.querySelectorAll('#adminCheckLiveModePills .api-mode-btn');

  clModeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      clModeBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      clMode = btn.dataset.mode || 'oauth2';
    });
  });

  clInput.addEventListener('input', function() {
    document.getElementById('checkLiveCount').textContent = clInput.value.split('\n').filter(function(l) { return l.trim(); }).length + ' accounts';
  });

  document.getElementById('btnCheckLive').addEventListener('click', async function() {
    var btn = this; var credentials = clInput.value.trim(); if (!credentials) return;
    btn.disabled = true; btn.querySelector('.btn-text').textContent = 'Checking...'; btn.querySelector('.btn-loader').style.display = 'inline-flex';
    var statusEl = document.getElementById('checkLiveStatus');
    statusEl.className = 'status status-load'; statusEl.style.display = 'flex';
    var cLive = 0, cDie = 0, cErr = 0;
    document.getElementById('clTextLive').value = ''; document.getElementById('clTextDie').value = ''; document.getElementById('clTextErr').value = '';
    document.getElementById('checkLiveResults').style.display = 'grid';

    var lines = credentials.split('\n').filter(function(l) { return l.trim(); });
    var CHUNK = 15;
    var done = 0;

    statusEl.querySelector('.status-text').textContent = '0/' + lines.length + ' checked (' + (clMode === 'graph' ? 'Graph API' : 'OAuth2') + ')...';

    for (var ci = 0; ci < lines.length; ci += CHUNK) {
      var chunkLines = lines.slice(ci, ci + CHUNK);
      try {
        var res = await fetch('/api/tools/check-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credentials: chunkLines.join('\n'), mode: clMode })
        });
        var data = await res.json();
        (data.results || []).forEach(function(r) {
          var orig = chunkLines.find(function(l) { return l.split('|')[0].toLowerCase() === (r.email || '').toLowerCase(); }) || r.email;
          var liveLine = r.newFullLine || orig;
          if (r.live) { document.getElementById('clTextLive').value += (cLive ? '\n' : '') + liveLine; cLive++; }
          else if (r.error && (r.error.indexOf('timeout') >= 0 || r.error.indexOf('fetch') >= 0 || r.error.indexOf('subrequest') >= 0)) { document.getElementById('clTextErr').value += (cErr ? '\n' : '') + orig; cErr++; }
          else { document.getElementById('clTextDie').value += (cDie ? '\n' : '') + orig; cDie++; }
        });
      } catch (err) {
        chunkLines.forEach(function(l) { document.getElementById('clTextErr').value += (cErr ? '\n' : '') + l; cErr++; });
      }
      done += chunkLines.length;
      document.getElementById('clCountLive').textContent = cLive;
      document.getElementById('clCountDie').textContent = cDie;
      document.getElementById('clCountErr').textContent = cErr;
      statusEl.querySelector('.status-text').textContent = done + '/' + lines.length + ' checked — ' + cLive + ' LIVE, ' + cDie + ' DIE, ' + cErr + ' ERR';
    }

    statusEl.className = 'status status-ok';
    statusEl.querySelector('.status-text').textContent = cLive + ' LIVE, ' + cDie + ' DIE, ' + cErr + ' ERROR (' + (clMode === 'graph' ? 'Graph API' : 'OAuth2') + ')';
    btn.disabled = false; btn.querySelector('.btn-text').textContent = 'Check Live'; btn.querySelector('.btn-loader').style.display = 'none';
  });

  function setCopiedBtn(btn, msg) {
    if (!btn) return;
    btn.classList.add('copied');
    var orig = btn.textContent;
    btn.textContent = 'Copied!';
    showToast('', msg || 'Copied!');
    setTimeout(function() {
      btn.classList.remove('copied');
      btn.textContent = orig;
    }, 1800);
  }

  document.getElementById('clCopyLive').addEventListener('click', function() {
    var text = document.getElementById('clTextLive').value;
    if (!text) { showToast('', 'No live accounts to copy'); return; }
    var btn = this;
    navigator.clipboard.writeText(text).then(function() { setCopiedBtn(btn, 'Live accounts copied'); });
  });
  document.getElementById('clCopyDie').addEventListener('click', function() {
    var text = document.getElementById('clTextDie').value;
    if (!text) { showToast('', 'No dead accounts to copy'); return; }
    var btn = this;
    navigator.clipboard.writeText(text).then(function() { setCopiedBtn(btn, 'Dead accounts copied'); });
  });
  document.getElementById('clCopyErr').addEventListener('click', function() {
    var text = document.getElementById('clTextErr').value;
    if (!text) { showToast('', 'No error accounts to copy'); return; }
    var btn = this;
    navigator.clipboard.writeText(text).then(function() { setCopiedBtn(btn, 'Error accounts copied'); });
  });

  /* ─── Tools: Multi-Format Parser & Converter ─── */
  var formatTargetType = document.getElementById('formatTargetType');
  var formatCustomWrap = document.getElementById('formatCustomWrap');
  var formatCustomTpl = document.getElementById('formatCustomTpl');
  var formatInput = document.getElementById('formatInput');

  if (formatTargetType) {
    formatTargetType.addEventListener('change', function() {
      if (formatCustomWrap) {
        formatCustomWrap.style.display = (formatTargetType.value === 'custom') ? 'block' : 'none';
      }
    });
  }

  function parseLineIntoAccount(line) {
    line = line.trim();
    if (!line || !line.includes('@')) return null;
    if (/^[-=]{3,}/.test(line)) return null;

    var email = '', pass = '', refreshToken = '', clientId = '9e5f94bc-e8a4-4e73-b8be-63364c29d753';

    // Check tab-separated receipts
    if (line.indexOf('\t') >= 0) {
      var tabs = line.split('\t').map(function(t){ return t.trim(); }).filter(Boolean);
      for (var t = 0; t < tabs.length; t++) {
        var chunk = tabs[t];
        if (chunk.includes('|') && chunk.includes('@')) {
          var cp = chunk.split('|');
          email = cp[0] ? cp[0].trim() : '';
          pass = cp[1] ? cp[1].trim() : '';
          refreshToken = cp[2] ? cp[2].trim() : '';
          if (cp[3]) clientId = cp[3].trim();
          break;
        }
      }
      if (!email && tabs[0] && tabs[0].includes('@')) {
        email = tabs[0];
        if (tabs[1]) pass = tabs[1];
        if (tabs[2]) refreshToken = tabs[2];
      }
    } else if (line.includes('|')) {
      var p = line.split('|');
      email = p[0] ? p[0].trim() : '';
      pass = p[1] ? p[1].trim() : '';
      refreshToken = p[2] ? p[2].trim() : '';
      if (p[3]) clientId = p[3].trim();
    } else if (line.includes(':')) {
      var c = line.split(':');
      email = c[0] ? c[0].trim() : '';
      pass = c[1] ? c[1].trim() : '';
      if (c[2]) refreshToken = c[2].trim();
    } else if (line.includes(';') || line.includes(',')) {
      var sc = line.split(/[;,]/);
      email = sc[0] ? sc[0].trim() : '';
      pass = sc[1] ? sc[1].trim() : '';
    } else {
      // Single email on line
      if (line.includes('@') && !line.includes(' ')) {
        email = line;
      }
    }

    if (!email || !email.includes('@')) return null;
    if (refreshToken && refreshToken.endsWith('$')) refreshToken = refreshToken.slice(0, -1);

    return {
      email: email,
      password: pass,
      refreshToken: refreshToken,
      clientId: clientId,
      original: line
    };
  }

  document.getElementById('btnFormat').addEventListener('click', function() {
    var input = formatInput.value.trim();
    if (!input) return;
    var lines = input.split(/\r?\n/);
    var accountsMap = new Map();
    var dups = 0;
    var target = formatTargetType ? formatTargetType.value : 'email_pipe_pw';
    var customTpl = formatCustomTpl ? formatCustomTpl.value : '{email}:{password}';

    lines.forEach(function(line) {
      var parsed = parseLineIntoAccount(line);
      if (!parsed) return;
      var emKey = parsed.email.toLowerCase();
      if (accountsMap.has(emKey)) {
        dups++;
      } else {
        var formattedLine = '';
        if (target === 'email_only') {
          formattedLine = parsed.email;
        } else if (target === 'email_pipe_pw') {
          formattedLine = parsed.email + '|' + (parsed.password || '');
        } else if (target === 'email_colon_pw') {
          formattedLine = parsed.email + ':' + (parsed.password || '');
        } else if (target === 'full_config') {
          formattedLine = parsed.email + '|' + (parsed.password || '') + '|' + (parsed.refreshToken || '') + '|' + (parsed.clientId || '9e5f94bc-e8a4-4e73-b8be-63364c29d753');
        } else if (target === 'email_token_client') {
          formattedLine = parsed.email + '|' + (parsed.refreshToken || '') + '|' + (parsed.clientId || '9e5f94bc-e8a4-4e73-b8be-63364c29d753');
        } else if (target === 'custom') {
          formattedLine = customTpl
            .replace(/\{email\}/gi, parsed.email)
            .replace(/\{password\}/gi, parsed.password || '')
            .replace(/\{refresh_token\}/gi, parsed.refreshToken || '')
            .replace(/\{client_id\}/gi, parsed.clientId || '');
        } else {
          formattedLine = parsed.email + '|' + (parsed.password || '');
        }
        accountsMap.set(emKey, formattedLine);
      }
    });

    document.getElementById('fmtTotal').textContent = accountsMap.size;
    document.getElementById('fmtDups').textContent = dups;
    document.getElementById('formatStats').style.display = 'flex';

    if (accountsMap.size > 0) {
      document.getElementById('formatResult').value = Array.from(accountsMap.values()).join('\n');
      document.getElementById('formatOutput').style.display = 'block';
    }
    showToast('', accountsMap.size + ' accounts formatted (' + dups + ' dups removed).');
  });

  document.getElementById('fmtCopy').addEventListener('click', function() {
    var val = document.getElementById('formatResult').value;
    if (!val) { showToast('', 'No formatted accounts to copy'); return; }
    var btn = this;
    navigator.clipboard.writeText(val).then(function() {
      setCopiedBtn(btn, 'Formatted accounts copied!');
    });
  });

  document.getElementById('fmtDownload').addEventListener('click', function() {
    var text = document.getElementById('formatResult').value;
    if (!text) return;
    var blob = new Blob([text], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'formatted_accounts.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('', 'Download started');
  });


  /* ─── Tools: Test Read Inbox & Message Searcher ─── */
  var inboxSearchInput = document.getElementById('inboxSearchInput');
  var inboxSearchCount = document.getElementById('inboxSearchCount');
  var btnRunSearchInbox = document.getElementById('btnRunSearchInbox');
  var inboxSearchStatus = document.getElementById('inboxSearchStatus');
  var inboxSearchResultsWrap = document.getElementById('inboxSearchResultsWrap');
  var inboxSearchTbody = document.getElementById('inboxSearchTbody');

  var searchMode = 'graph';
  var searchModeBtns = document.querySelectorAll('#adminSearchModePills .api-mode-btn');

  searchModeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      searchModeBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      searchMode = btn.dataset.mode || 'graph';
    });
  });

  var searchResultsData = [];
  var currentSearchFilterView = 'all';

  if (inboxSearchInput && inboxSearchCount) {
    inboxSearchInput.addEventListener('input', function() {
      var lines = inboxSearchInput.value.split(/\r?\n/).filter(function(l) { return l.trim(); });
      inboxSearchCount.textContent = lines.length + ' account' + (lines.length !== 1 ? 's' : '');
    });
  }

  function fmtSearchDate(iso) {
    if (!iso) return '-';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch(e) { return iso; }
  }

  function renderSearchResults() {
    if (!inboxSearchTbody) return;

    var filtered = searchResultsData.filter(function(item) {
      if (currentSearchFilterView === 'match') return item.matchFound;
      if (currentSearchFilterView === 'nomatch') return item.canRead && !item.matchFound;
      if (currentSearchFilterView === 'fail') return !item.canRead;
      return true;
    });

    if (!filtered.length) {
      inboxSearchTbody.innerHTML = '<tr><td colspan="6" style="padding:28px;text-align:center;color:var(--muted)">No accounts match this filter.</td></tr>';
      return;
    }

    var html = '';
    filtered.forEach(function(r, displayIdx) {
      var statusBadge = '';
      if (r.matchFound) {
        statusBadge = '<span class="badge badge-ok" style="font-size:10.5px">MATCH (' + r.matchedCount + ')</span>';
      } else if (r.canRead) {
        statusBadge = '<span class="badge" style="background:var(--amber-dim);color:var(--amber);border:1px solid rgba(245,158,11,0.25);font-size:10.5px">NO MATCH</span>';
      } else {
        statusBadge = '<span class="badge badge-danger" style="font-size:10.5px">AUTH ERR</span>';
      }

      var msgPreview = '';
      var otpCode = '';
      var dateStr = '';
      var hasDetail = false;

      if (r.matchFound && r.matches && r.matches.length > 0) {
        var topMatch = r.matches[0];
        msgPreview = '<div><strong style="color:var(--ink)">' + esc(topMatch.subject) + '</strong></div><div style="color:var(--muted);font-size:11px">' + esc(topMatch.from) + ' &bull; ' + fmtSearchDate(topMatch.date) + '</div>';
        if (topMatch.otp) {
          otpCode = '<span class="otp-code otp-search-chip" data-otp="' + esc(topMatch.otp) + '" style="font-size:11px;padding:2px 6px"><span>' + esc(topMatch.otp) + '</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg></span>';
        }
        hasDetail = true;
      } else if (r.canRead && r.latestMessage) {
        msgPreview = '<div style="color:var(--ink-dim)">' + esc(r.latestMessage.subject) + '</div><div style="color:var(--muted-2);font-size:11px">Latest from: ' + esc(r.latestMessage.from) + ' &bull; ' + fmtSearchDate(r.latestMessage.date) + '</div>';
        if (r.latestMessage.otp) {
          otpCode = '<span class="otp-code otp-search-chip" data-otp="' + esc(r.latestMessage.otp) + '" style="font-size:11px;padding:2px 6px"><span>' + esc(r.latestMessage.otp) + '</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg></span>';
        }
      } else if (!r.canRead) {
        msgPreview = '<div style="color:var(--red);font-size:11.5px">' + esc(r.error || 'Failed to authenticate or fetch inbox') + '</div>';
      } else {
        msgPreview = '<div style="color:var(--muted);font-size:11.5px">Inbox is empty (0 messages)</div>';
      }

      var origIdx = searchResultsData.indexOf(r);
      var detailBtn = hasDetail ? '<button class="btn btn-g btn-sm btn-view-match" data-idx="' + origIdx + '" style="height:22px;font-size:10.5px;padding:1px 6px">View</button>' : '<span style="color:var(--muted-2);font-size:11px">-</span>';

      html += '<tr style="border-bottom:1px solid var(--border)">'
        + '<td style="color:var(--muted)">' + (displayIdx + 1) + '</td>'
        + '<td>' + statusBadge + '</td>'
        + '<td><a href="/' + esc(r.email) + '" target="_blank" style="color:var(--ink);font-weight:500">' + esc(r.email) + '</a></td>'
        + '<td>' + msgPreview + '</td>'
        + '<td>' + otpCode + '</td>'
        + '<td style="text-align:right">' + detailBtn + '</td>'
        + '</tr>';
    });

    inboxSearchTbody.innerHTML = html;
  }

  if (btnRunSearchInbox) {
    btnRunSearchInbox.addEventListener('click', async function() {
      var creds = inboxSearchInput.value.trim();
      if (!creds) {
        inboxSearchInput.focus();
        showToast('', 'Please paste account credentials first');
        return;
      }

      var sub = (document.getElementById('inboxSearchSub')?.value || '').trim();
      var snd = (document.getElementById('inboxSearchSender')?.value || '').trim();
      var limit = parseInt(document.getElementById('inboxSearchLimit')?.value || '15', 10);

      btnRunSearchInbox.disabled = true;
      btnRunSearchInbox.querySelector('.btn-text').textContent = 'Searching Inboxes...';
      btnRunSearchInbox.querySelector('.btn-loader').style.display = 'inline-flex';

      inboxSearchStatus.className = 'status status-load';
      inboxSearchStatus.style.display = 'flex';

      var allLines = creds.split(/\r?\n/).filter(function(l) { return l.trim(); });
      var CHUNK = 5; // 5 accounts per Worker invocation (~10 subrequests)
      var done = 0;
      searchResultsData = [];

      inboxSearchStatus.querySelector('.status-text').textContent = '0/' + allLines.length + ' inboxes checked (' + (searchMode === 'oauth2' ? 'OAuth2' : 'Graph API') + ')...';
      inboxSearchResultsWrap.style.display = 'block';
      currentSearchFilterView = 'all';
      document.querySelectorAll('.is-filter-btn').forEach(function(b){ b.classList.remove('active'); });
      var allBtn = document.querySelector('.is-filter-btn[data-v="all"]');
      if (allBtn) allBtn.classList.add('active');

      for (var ci = 0; ci < allLines.length; ci += CHUNK) {
        var chunkLines = allLines.slice(ci, ci + CHUNK);
        try {
          var res = await fetch('/api/tools/search-inbox', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              credentials: chunkLines.join('\n'),
              mode: searchMode,
              subjectFilter: sub,
              senderFilter: snd,
              searchLimit: limit
            })
          });
          var data = await res.json();
          if (data.success && data.results) {
            searchResultsData = searchResultsData.concat(data.results);
          } else {
            // If entire chunk failed, add placeholder errors
            chunkLines.forEach(function(line) {
              var email = line.split('|')[0] || line;
              searchResultsData.push({ email: email.trim(), live: false, canRead: false, matchFound: false, matchedCount: 0, totalInbox: 0, matches: [], latestMessage: null, error: data.error || 'Chunk failed', rawLine: line });
            });
          }
        } catch(err) {
          chunkLines.forEach(function(line) {
            var email = line.split('|')[0] || line;
            searchResultsData.push({ email: email.trim(), live: false, canRead: false, matchFound: false, matchedCount: 0, totalInbox: 0, matches: [], latestMessage: null, error: err.message, rawLine: line });
          });
        }

        done += chunkLines.length;

        // Live-update summary & table
        var s = {
          total: searchResultsData.length,
          matchFound: searchResultsData.filter(function(r){ return r.matchFound; }).length,
          noMatch: searchResultsData.filter(function(r){ return r.canRead && !r.matchFound; }).length,
          failed: searchResultsData.filter(function(r){ return !r.canRead; }).length
        };
        document.getElementById('sumTotal').textContent = s.total;
        document.getElementById('sumMatch').textContent = s.matchFound;
        document.getElementById('sumNoMatch').textContent = s.noMatch;
        document.getElementById('sumFailed').textContent = s.failed;
        document.getElementById('cntViewAll').textContent = s.total;
        document.getElementById('cntViewMatch').textContent = s.matchFound;
        document.getElementById('cntViewNoMatch').textContent = s.noMatch;
        document.getElementById('cntViewFail').textContent = s.failed;

        renderSearchResults();
        inboxSearchStatus.querySelector('.status-text').textContent = done + '/' + allLines.length + ' checked — ' + s.matchFound + ' matches, ' + s.noMatch + ' no match, ' + s.failed + ' failed';
      }

      var finalS = {
        total: searchResultsData.length,
        matchFound: searchResultsData.filter(function(r){ return r.matchFound; }).length,
        noMatch: searchResultsData.filter(function(r){ return r.canRead && !r.matchFound; }).length,
        failed: searchResultsData.filter(function(r){ return !r.canRead; }).length
      };
      inboxSearchStatus.className = 'status status-ok';
      inboxSearchStatus.querySelector('.status-text').textContent = 'Checked ' + finalS.total + ' inboxes (' + (searchMode === 'oauth2' ? 'OAuth2' : 'Graph API') + '): ' + finalS.matchFound + ' MATCHES FOUND, ' + finalS.noMatch + ' no match, ' + finalS.failed + ' auth failed.';
      showToast('', finalS.matchFound + ' matching inboxes found!');

      btnRunSearchInbox.disabled = false;
      btnRunSearchInbox.querySelector('.btn-text').textContent = 'Test & Search Inbox';
      btnRunSearchInbox.querySelector('.btn-loader').style.display = 'none';
    });
  }

  // Filter View Switcher
  document.querySelectorAll('.is-filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.is-filter-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      currentSearchFilterView = btn.dataset.v;
      renderSearchResults();
    });
  });

  // Table click delegation (Copy OTP & View Message Modal)
  if (inboxSearchResultsWrap) {
    inboxSearchResultsWrap.addEventListener('click', function(e) {
      var otpChip = e.target.closest('.otp-search-chip');
      if (otpChip) {
        e.stopPropagation();
        var code = otpChip.dataset.otp;
        if (code) {
          navigator.clipboard.writeText(code).then(function() {
            var sp = otpChip.querySelector('span');
            var orig = sp ? sp.textContent : code;
            if (sp) sp.textContent = 'Copied';
            otpChip.classList.add('copied');
            showToast('', 'OTP ' + code + ' copied!');
            setTimeout(function() {
              if (sp) sp.textContent = orig;
              otpChip.classList.remove('copied');
            }, 1400);
          });
        }
        return;
      }

      var viewBtn = e.target.closest('.btn-view-match');
      if (viewBtn) {
        var idx = parseInt(viewBtn.dataset.idx, 10);
        var r = searchResultsData[idx];
        if (r && r.matches && r.matches.length > 0) {
          var m = r.matches[0];
          openMsgModal(r.email, m);
        }
      }
    });
  }

    // Handle Custom Pattern Token Chips
    document.querySelectorAll('.btn-tpl-token').forEach(function(chip) {
      chip.addEventListener('click', function() {
        if (!formatCustomTpl) return;
        var tok = chip.dataset.token;
        var start = formatCustomTpl.selectionStart || formatCustomTpl.value.length;
        var end = formatCustomTpl.selectionEnd || formatCustomTpl.value.length;
        var val = formatCustomTpl.value;
        formatCustomTpl.value = val.substring(0, start) + tok + val.substring(end);
        formatCustomTpl.focus();
        formatCustomTpl.selectionStart = formatCustomTpl.selectionEnd = start + tok.length;
      });
    });

  // Modal handlers
  var msgPreviewModal = document.getElementById('msgPreviewModal');
  var btnCloseMsgModal = document.getElementById('btnCloseMsgModal');
  var btnCopyMsgBody = document.getElementById('btnCopyMsgBody');
  var curModalBodyText = '';

  function openMsgModal(accountEmail, m) {
    if (!msgPreviewModal) return;
    document.getElementById('modalSubject').textContent = m.subject || '(No Subject)';
    document.getElementById('modalSender').textContent = 'Account: ' + accountEmail + ' | From: ' + (m.from || m.fromEmail);
    document.getElementById('modalDate').textContent = fmtSearchDate(m.date);
    curModalBodyText = m.bodySnippet || m.preview || '';

    var otpWrap = document.getElementById('modalOtpWrap');
    var otpVal = document.getElementById('modalOtpVal');
    if (m.otp) {
      otpVal.textContent = m.otp;
      otpWrap.style.display = 'block';
      var otpChipModal = document.getElementById('modalOtpCode');
      otpChipModal.onclick = function() {
        navigator.clipboard.writeText(m.otp).then(function(){
          otpChipModal.classList.add('copied');
          showToast('', 'OTP ' + m.otp + ' copied!');
          setTimeout(function(){ otpChipModal.classList.remove('copied'); }, 1400);
        });
      };
    } else {
      otpWrap.style.display = 'none';
    }

    var bodyContainer = document.getElementById('modalBodyContent');
    if (m.bodySnippet && m.bodySnippet.includes('<')) {
      bodyContainer.innerHTML = '<iframe style="width:100%;height:320px;border:none;background:#fff;border-radius:4px" sandbox="allow-same-origin" srcdoc="' + esc(m.bodySnippet).replace(/"/g, '&quot;') + '"></iframe>';
      var iframe = bodyContainer.querySelector('iframe');
      if (iframe) iframe.srcdoc = m.bodySnippet;
    } else {
      bodyContainer.textContent = m.bodySnippet || m.preview || '(No content)';
    }

    msgPreviewModal.style.display = 'flex';
  }

  function closeMsgModal() {
    if (msgPreviewModal) msgPreviewModal.style.display = 'none';
  }

  if (btnCloseMsgModal && msgPreviewModal) {
    btnCloseMsgModal.addEventListener('click', closeMsgModal);
    msgPreviewModal.addEventListener('click', function(e) {
      if (e.target === msgPreviewModal) closeMsgModal();
    });
  }

  if (btnCopyMsgBody) {
    btnCopyMsgBody.addEventListener('click', function() {
      if (!curModalBodyText) { showToast('', 'No message body to copy'); return; }
      navigator.clipboard.writeText(curModalBodyText).then(function() {
        btnCopyMsgBody.classList.add('copied');
        var orig = btnCopyMsgBody.textContent;
        btnCopyMsgBody.textContent = 'Copied!';
        showToast('', 'Message body copied to clipboard');
        setTimeout(function() {
          btnCopyMsgBody.classList.remove('copied');
          btnCopyMsgBody.textContent = orig;
        }, 1800);
      });
    });
  }

  // Global Escape key listener to close modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMsgModal();
      var editP = document.getElementById('editPanel');
      var bulkP = document.getElementById('bulkPanel');
      // If modal is open, modal is prioritized
    }
  });

  // Export Matched Emails
  document.getElementById('btnCopyMatchedEmails')?.addEventListener('click', function() {
    var btn = this;
    var matched = searchResultsData.filter(function(r){ return r.matchFound; });
    if (!matched.length) { showToast('', 'No matched emails to copy'); return; }
    var emails = matched.map(function(r){ return r.email; }).join('\n');
    navigator.clipboard.writeText(emails).then(function() {
      btn.classList.add('copied');
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      showToast('', matched.length + ' matched emails copied!');
      setTimeout(function(){ btn.classList.remove('copied'); btn.textContent = orig; }, 1800);
    });
  });

  // Export Full Matched Configs
  document.getElementById('btnCopyMatchedConfigs')?.addEventListener('click', function() {
    var btn = this;
    var matched = searchResultsData.filter(function(r){ return r.matchFound; });
    if (!matched.length) { showToast('', 'No matched accounts to copy'); return; }
    var configs = matched.map(function(r){ return r.rawLine || r.email; }).join('\n');
    navigator.clipboard.writeText(configs).then(function() {
      btn.classList.add('copied');
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      showToast('', matched.length + ' matched configs copied!');
      setTimeout(function(){ btn.classList.remove('copied'); btn.textContent = orig; }, 1800);
    });
  });

  // Download Log Report
  document.getElementById('btnDownloadSearchReport')?.addEventListener('click', function() {
    if (!searchResultsData.length) { showToast('', 'No search data available'); return; }
    var lines = ['=== PASTNOTE INBOX SEARCH REPORT ===', 'Date: ' + new Date().toISOString(), ''];
    searchResultsData.forEach(function(r, i) {
      lines.push('[' + (i+1) + '] ' + r.email + ' -> Status: ' + (r.matchFound ? 'MATCH' : (r.canRead ? 'NO_MATCH' : 'AUTH_FAIL')));
      if (r.matchFound && r.matches[0]) {
        lines.push('    Subject: ' + r.matches[0].subject);
        lines.push('    From: ' + r.matches[0].from);
        if (r.matches[0].otp) lines.push('    OTP: ' + r.matches[0].otp);
      }
      if (r.error) lines.push('    Error: ' + r.error);
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'inbox_search_report.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('', 'Report downloaded');
  });
})();
