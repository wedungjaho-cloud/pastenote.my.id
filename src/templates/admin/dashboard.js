/**
 * PasteNote — Admin Dashboard v4.3
 * English UI, General Password, Smart Parse, Bulk Import/Delete
 */
import { layout, esc, icon } from '../layout.js';
import { Router } from '../../router.js';

export function renderAdminDashboard(pages, globalSettings) {
  const pagesJson = JSON.stringify(pages || []);
  const settingsJson = JSON.stringify(globalSettings || {});

  const html = layout({
    title: 'Admin Dashboard',
    adminHeader: true,
    bodyClass: 'admin-dash',
    body: `
    <div class="page">

      <!-- TAB: PAGES -->
      <section id="tab-pages" class="tab active">
        <div class="stats fade-up">
          <div class="stat"><span class="stat-num" id="statTotalPages">0</span><span class="stat-name">Pages</span></div>
          <div class="stat"><span class="stat-num" id="statInboxActive">0</span><span class="stat-name">Inbox Active</span></div>
          <div class="stat"><span class="stat-num" id="statHasConfig">0</span><span class="stat-name">Config Set</span></div>
        </div>

        <div class="card fade-up fade-up-d1">
          <div class="card-header">
            <div class="card-header-l">
              <div class="card-icon forest">${icon('note','i-20')}</div>
              <h2 class="h2">Pages</h2>
            </div>
            <div style="display:flex;gap:6px">
              <button id="btnBulkImport" class="btn btn-s btn-sm">
                ${icon('inbox','i-16')}
                Bulk Import
              </button>
              <button id="btnAddPage" class="btn btn-p btn-sm">
                ${icon('plus','i-16')}
                Add
              </button>
            </div>
          </div>
          <div class="card-body">
            <div id="bulkBar" style="display:none;margin-bottom:12px">
              <span id="bulkCount" class="stat-inline">0 selected</span>
              <button id="btnBulkDelete" class="btn btn-g btn-sm btn-danger">Delete Selected</button>
              <button id="btnExportEmail" class="btn btn-g btn-sm" style="margin-left:auto">Export Email</button>
              <button id="btnExportEmailPw" class="btn btn-g btn-sm">Export Email|PW</button>
            </div>
            <div id="pagesList"></div>
          </div>
        </div>

        <!-- BULK IMPORT PANEL -->
        <div id="bulkPanel" class="card fade-up" style="display:none;margin-top:16px">
          <div class="card-header">
            <div class="card-header-l">
              <h2 class="h2">Bulk Import</h2>
            </div>
            <button id="btnCloseBulk" class="btn btn-g btn-sm">
              ${icon('x','i-16')}
              Close
            </button>
          </div>
          <div class="card-body">
            <p class="text-sm text-t3" style="margin-bottom:12px">Paste raw account data — receipts, mixed text, anything. Parser auto-extracts <code>email|password|refresh_token|client_id</code> lines. Live check runs before import.</p>
            <textarea id="bulkInput" class="inp inp-ta inp-mono" placeholder="Paste accounts here..." rows="8"></textarea>
            <div class="field-row" style="margin-top:12px;justify-content:space-between">
              <span class="stat-inline" id="bulkParsed">0 accounts detected</span>
              <div style="display:flex;gap:6px">
                <button id="btnBulkParse" class="btn btn-s btn-sm">Parse</button>
                <button id="btnBulkRun" class="btn btn-p btn-sm" disabled>
                  <span class="btn-text">Import All</span>
                  <span class="btn-loader" style="display:none"><span class="spinner"></span></span>
                </button>
              </div>
            </div>
            <div id="bulkPreview" style="display:none;margin-top:12px"></div>
            <div id="bulkStatus" class="status" style="display:none"><span class="status-text"></span></div>
          </div>
        </div>

        <!-- EDIT PANEL -->
        <div id="editPanel" class="card fade-up" style="display:none;margin-top:16px">
          <div class="card-header">
            <div class="card-header-l">
              <h2 class="h2" id="editPanelTitle">Add New Page</h2>
            </div>
            <button id="btnCloseEdit" class="btn btn-g btn-sm">
              ${icon('x','i-16')}
              Close
            </button>
          </div>
          <div class="card-body">
            <div class="field">
              <label class="field-label">Email</label>
              <input type="email" id="editEmail" class="inp" placeholder="user@outlook.com">
              <span class="field-hint">URL: pastenote.my.id/{email}</span>
            </div>
            <div class="field">
              <label class="field-label">Visitor Password</label>
              <input type="text" id="editPassword" class="inp" placeholder="Leave empty to use general password">
              <span class="field-hint">Specific password for this page. Falls back to general password if empty.</span>
            </div>
            <div class="field">
              <label class="field-label">Notes</label>
              <textarea id="editNote" class="inp inp-ta" placeholder="Write notes..." rows="4"></textarea>
            </div>
            <div class="field">
              <label class="field-label">Email Config</label>
              <input type="text" id="editConfig" class="inp inp-mono" placeholder="email|password|refresh_token|client_id">
              <span class="field-hint">Encrypted. Supports raw paste: auto-parses TAB-separated format.</span>
            </div>
            <div class="field field-row">
              <label class="field-label" style="margin-bottom:0">Inbox</label>
              <label class="toggle">
                <input type="checkbox" id="editInboxEnabled" checked>
                <span class="toggle-track"></span>
              </label>
            </div>
            <div class="field-actions">
              <button id="btnSavePage" class="btn btn-p">Save</button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB: TOOLS -->
      <section id="tab-tools" class="tab" style="display:none">
        <div class="card fade-up" style="margin-bottom:16px">
          <div class="card-header">
            <div class="card-header-l">
              <div class="card-icon forest">${icon('search','i-20')}</div>
              <h2 class="h2">Check Live</h2>
            </div>
          </div>
          <div class="card-body">
            <p class="text-sm text-t3" style="margin-bottom:12px">Format: <code>email|password|refresh_token|client_id</code></p>
            <textarea id="checkLiveInput" class="inp inp-ta inp-mono" placeholder="email|password|refresh_token|client_id" rows="5"></textarea>
            <div class="field-row" style="margin-top:12px;justify-content:space-between">
              <span class="stat-inline" id="checkLiveCount">0 accounts</span>
              <button id="btnCheckLive" class="btn btn-p btn-sm"><span class="btn-text">Check Live</span><span class="btn-loader" style="display:none"><span class="spinner"></span></span></button>
            </div>
            <div id="checkLiveStatus" class="status" style="display:none"><span class="status-text"></span></div>
            <div id="checkLiveResults" class="results-grid" style="display:none">
              <div class="result-box box-ok"><div class="result-hdr"><span class="result-tag">LIVE <span class="result-cnt" id="clCountLive">0</span></span><button class="btn btn-g btn-sm" id="clCopyLive">Copy</button></div><textarea id="clTextLive" class="result-ta" readonly></textarea></div>
              <div class="result-box box-die"><div class="result-hdr"><span class="result-tag">DIE <span class="result-cnt" id="clCountDie">0</span></span><button class="btn btn-g btn-sm" id="clCopyDie">Copy</button></div><textarea id="clTextDie" class="result-ta" readonly></textarea></div>
              <div class="result-box box-err"><div class="result-hdr"><span class="result-tag">ERROR <span class="result-cnt" id="clCountErr">0</span></span><button class="btn btn-g btn-sm" id="clCopyErr">Copy</button></div><textarea id="clTextErr" class="result-ta" readonly></textarea></div>
            </div>
          </div>
        </div>


        <div class="card fade-up fade-up-d1">
          <div class="card-header">
            <div class="card-header-l">
              <div class="card-icon sage">${icon('copy','i-20')}</div>
              <h2 class="h2">Auto Format</h2>
            </div>
          </div>
          <div class="card-body">
            <p class="text-sm text-t3" style="margin-bottom:12px">Format mixed accounts to <code>email|password</code>. Remove duplicates. Client-side.</p>
            <textarea id="formatInput" class="inp inp-ta inp-mono" placeholder="Paste mixed accounts..." rows="5"></textarea>
            <div class="field-row" style="margin-top:12px;justify-content:flex-end">
              <button id="btnFormat" class="btn btn-s btn-sm">Format</button>
            </div>
            <div class="fmt-stats" id="formatStats" style="display:none">
              <span class="stat-inline">Total: <strong id="fmtTotal">0</strong></span>
              <span class="stat-inline">Duplicates: <strong id="fmtDups">0</strong></span>
            </div>
            <div id="formatOutput" class="fmt-out" style="display:none">
              <div class="fmt-out-hdr"><span>Result:</span><div><button class="btn btn-g btn-sm" id="fmtCopy">Copy</button> <button class="btn btn-g btn-sm" id="fmtDownload">Download</button></div></div>
              <textarea id="formatResult" class="result-ta" readonly></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB: SETTINGS -->
      <section id="tab-settings" class="tab" style="display:none">
        <div class="card fade-up" style="margin-bottom:16px">
          <div class="card-header">
            <div class="card-header-l">
              <div class="card-icon forest">${icon('note','i-20')}</div>
              <h2 class="h2">General Settings</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="field">
              <label class="field-label">Default Note</label>
              <textarea id="settingsDefaultNote" class="inp inp-ta" placeholder="Default note for pages without custom notes..." rows="4"></textarea>
            </div>
            <div class="field">
              <label class="field-label">General Visitor Password</label>
              <input type="text" id="settingsGeneralPw" class="inp" placeholder="Global fallback password for all pages">
              <span class="field-hint">Applied to all pages that don't have a specific password set. Leave empty to disable.</span>
            </div>
            <div class="field">
              <label class="field-label">Recovery Email</label>
              <input type="email" id="settingsRecoveryEmail" class="inp" placeholder="email@gmail.com">
              <span class="field-hint">Used for admin password recovery. Reset code will be sent here.</span>
            </div>
            <div class="field-actions">
              <button id="btnSaveSettings" class="btn btn-p">Save Settings</button>
            </div>
          </div>
        </div>

        <div class="card fade-up fade-up-d1">
          <div class="card-header">
            <div class="card-header-l">
              <div class="card-icon amber">${icon('shield','i-20')}</div>
              <h2 class="h2">Change Admin Password</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="field">
              <label class="field-label">Current Password</label>
              <input type="password" id="settingsOldPw" class="inp" placeholder="Current password">
            </div>
            <div class="field">
              <label class="field-label">New Password</label>
              <input type="password" id="settingsNewPw" class="inp" placeholder="New password (min. 4 characters)">
            </div>
            <div class="field">
              <label class="field-label">Confirm Password</label>
              <input type="password" id="settingsConfirmPw" class="inp" placeholder="Re-enter new password">
            </div>
            <div class="field-actions">
              <button id="btnChangePw" class="btn btn-a">Change Password</button>
            </div>
          </div>
        </div>
      </section>

    </div>`,
    scripts: getDashboardScript(pagesJson, settingsJson),
  });

  return Router.htmlResponse(html);
}

function getDashboardScript(pagesJson, settingsJson) {
  return `
  (function() {
    if (typeof window.showToast !== 'function' && typeof showToast !== 'function') {
      window.showToast = function(icon, msg) { console.log(icon, msg); };
    }

    var pages = ${pagesJson};
    var settings = ${settingsJson};

    document.querySelectorAll('.nav-pill').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-pill').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.tab').forEach(function(t) { t.style.display = 'none'; });
        document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
      });
    });

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

    function esc(text) {
      var div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    }

    // ─── PAGES LIST WITH CHECKBOXES ────────────────────────
    var selectedPages = new Set();

    function renderPagesList() {
      var el = document.getElementById('pagesList');
      selectedPages.clear();
      updateBulkBar();
      if (!pages.length) {
        el.innerHTML = '<div class="empty"><p>No pages yet. Click <strong>Add</strong> to create one.</p></div>';
        return;
      }
      var html = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:30px"><input type="checkbox" id="selectAll"></th><th>#</th><th>Email</th><th>PW</th><th>Inbox</th><th>Config</th><th>Actions</th></tr></thead><tbody>';
      pages.forEach(function(p, i) {
        html += '<tr>'
          + '<td><input type="checkbox" class="page-cb" data-idx="' + i + '"></td>'
          + '<td>' + (i+1) + '</td>'
          + '<td><a href="/' + esc(p.email) + '" target="_blank" class="tbl-link">' + esc(p.email) + '</a></td>'
          + '<td>' + (p.has_password ? '<span class="badge badge-g">Set</span>' : '<span class="badge badge-r">—</span>') + '</td>'
          + '<td>' + (p.inbox_enabled ? '<span class="badge badge-g">On</span>' : '<span class="badge badge-r">Off</span>') + '</td>'
          + '<td>' + (p.has_config ? '<span class="badge badge-g">OK</span>' : '<span class="badge badge-r">—</span>') + '</td>'
          + '<td><button class="btn btn-g btn-sm btn-edit" data-idx="' + i + '">Edit</button> <button class="btn btn-g btn-sm btn-danger btn-del" data-idx="' + i + '">Delete</button></td>'
          + '</tr>';
      });
      html += '</tbody></table></div>';
      el.innerHTML = html;

      // Select all
      document.getElementById('selectAll').addEventListener('change', function() {
        var cbs = document.querySelectorAll('.page-cb');
        var checked = this.checked;
        cbs.forEach(function(cb) { cb.checked = checked; });
        selectedPages.clear();
        if (checked) pages.forEach(function(p, i) { selectedPages.add(i); });
        updateBulkBar();
      });
      // Individual checkboxes
      document.querySelectorAll('.page-cb').forEach(function(cb) {
        cb.addEventListener('change', function() {
          var idx = parseInt(this.dataset.idx);
          if (this.checked) selectedPages.add(idx); else selectedPages.delete(idx);
          updateBulkBar();
        });
      });
    }
    renderPagesList();

    function updateBulkBar() {
      var bar = document.getElementById('bulkBar');
      if (selectedPages.size > 0 || pages.length > 0) {
        bar.style.display = 'flex';
        bar.style.alignItems = 'center';
        bar.style.gap = '8px';
        bar.style.flexWrap = 'wrap';
        document.getElementById('bulkCount').textContent = selectedPages.size + ' selected';
        document.getElementById('btnBulkDelete').style.display = selectedPages.size > 0 ? '' : 'none';
      } else {
        bar.style.display = 'none';
      }
    }

    // Bulk delete
    document.getElementById('btnBulkDelete').addEventListener('click', async function() {
      if (!selectedPages.size) return;
      var count = selectedPages.size;
      if (!confirm('Delete ' + count + ' pages? This cannot be undone.')) return;
      this.disabled = true; this.textContent = 'Deleting...';
      var indices = Array.from(selectedPages).sort(function(a,b){return b-a});
      for (var k = 0; k < indices.length; k++) {
        var idx = indices[k];
        try {
          await fetch('/atmin/api/delete-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: pages[idx].email }),
          });
          pages.splice(idx, 1);
        } catch(e) {}
      }
      renderPagesList(); updateStats();
      showToast('', count + ' pages deleted.');
      this.disabled = false; this.textContent = 'Delete Selected';
    });

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

    document.getElementById('btnCloseEdit').addEventListener('click', function() {
      editPanel.style.display = 'none';
    });

    // Smart config parse: auto-detect TAB-separated raw format
    editConfig.addEventListener('paste', function(e) {
      setTimeout(function() {
        var val = editConfig.value.trim();
        if (val.indexOf('\\t') >= 0) {
          var parts = val.split('\\t');
          if (parts.length >= 2 && parts[0].indexOf('@') >= 0) {
            editEmail.value = parts[0].trim();
            editConfig.value = parts[1].trim();
            if (!editEmail.disabled) {
              showToast('', 'Auto-detected: email + config parsed.');
            }
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
          delBtn.dataset.confirming = 'true';
          delBtn.textContent = 'Sure?';
          delBtn.classList.add('btn-confirming');
          setTimeout(function() {
            delBtn.dataset.confirming = '';
            delBtn.textContent = 'Delete';
            delBtn.classList.remove('btn-confirming');
          }, 3000);
          return;
        }

        delBtn.textContent = '...';
        delBtn.disabled = true;
        try {
          var res = await fetch('/atmin/api/delete-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: page2.email }),
          });
          var data = await res.json();
          if (data.success) {
            pages.splice(idx2, 1);
            renderPagesList();
            updateStats();
            if (editPanel.style.display !== 'none' && editingIdx === idx2) {
              editPanel.style.display = 'none';
            }
            showToast('', page2.email + ' deleted.');
          } else {
            alert('Failed: ' + (data.error || 'Unknown error'));
          }
        } catch (err) {
          alert('Error: ' + err.message);
        }
      }
    });

    document.getElementById('btnSavePage').addEventListener('click', async function() {
      var email = editEmail.value.trim();
      if (!email) { editEmail.focus(); return; }

      var body = {
        email: email,
        note: editNote.value,
        inbox_enabled: editInbox.checked,
      };
      if (editPassword.value.trim()) body.password = editPassword.value.trim();
      if (editConfig.value.trim()) body.config = editConfig.value.trim();

      try {
        var res = await fetch('/atmin/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        var data = await res.json();
        if (data.success) {
          showToast('', email + ' saved!');
          var listRes = await fetch('/atmin/api/pages');
          var listData = await listRes.json();
          if (listData.success) { pages = listData.pages; renderPagesList(); updateStats(); }
          if (editingIdx === -1) {
            editEmail.disabled = true;
            editingIdx = pages.length - 1;
            document.getElementById('editPanelTitle').textContent = 'Edit: ' + email;
          }
          editPassword.value = ''; editConfig.value = '';
        } else {
          alert('Error: ' + (data.error || 'Failed to save'));
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });

    // ─── BULK IMPORT ────────────────────────────────────────
    var bulkPanel = document.getElementById('bulkPanel');
    var bulkInput = document.getElementById('bulkInput');
    var parsedAccounts = [];

    document.getElementById('btnBulkImport').addEventListener('click', function() {
      bulkPanel.style.display = 'block';
      bulkPanel.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('btnCloseBulk').addEventListener('click', function() {
      bulkPanel.style.display = 'none';
    });

    function parseBulkInput(text) {
      var lines = text.split('\\n');
      var results = [];
      var seen = new Set();
      lines.forEach(function(line) {
        line = line.trim();
        if (!line) return;
        // Skip noise lines: labels, dashes, numbers-only, headers
        if (!/[@|]/.test(line)) return;
        if (/^[-=]{3,}/.test(line)) return;
        if (/^\\[\\d+\\]/.test(line)) return;

        // Strategy 1: TAB-separated (email\temail|pw|token|client_id)
        if (line.indexOf('\t') >= 0) {
          var tabs = line.split('\t');
          for (var t = 0; t < tabs.length; t++) {
            var chunk = tabs[t].trim();
            if (!chunk || !chunk.includes('|')) continue;
            var parts = chunk.split('|');
            if (parts.length >= 3 && parts[0].includes('@')) {
              var cfg = chunk;
              if (cfg.endsWith('$')) cfg = cfg.slice(0, -1);
              var em = parts[0].trim().toLowerCase();
              if (!seen.has(em)) {
                seen.add(em);
                results.push({ email: parts[0].trim(), config: cfg, password: parts[1] || '' });
              }
              break;
            }
          }
          return;
        }

        // Strategy 2: pipe-separated on a single line
        var parts2 = line.split('|');
        if (parts2.length >= 3 && parts2[0].includes('@')) {
          var cfg2 = line;
          if (cfg2.endsWith('$')) cfg2 = cfg2.slice(0, -1);
          var em2 = parts2[0].trim().toLowerCase();
          if (!seen.has(em2)) {
            seen.add(em2);
            results.push({ email: parts2[0].trim(), config: cfg2, password: parts2[1] || '' });
          }
        }
      });
      return results;
    }

    document.getElementById('btnBulkParse').addEventListener('click', function() {
      var text = bulkInput.value.trim();
      if (!text) return;
      parsedAccounts = parseBulkInput(text);
      document.getElementById('bulkParsed').textContent = parsedAccounts.length + ' accounts detected';
      var btn = document.getElementById('btnBulkRun');
      btn.disabled = parsedAccounts.length === 0;
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
      btn.disabled = true;
      btn.querySelector('.btn-text').textContent = 'Checking live...';
      btn.querySelector('.btn-loader').style.display = 'inline-flex';
      var statusEl = document.getElementById('bulkStatus');
      statusEl.className = 'status status-load';
      statusEl.querySelector('.status-text').textContent = 'Step 1/2: Checking live status...';
      statusEl.style.display = 'flex';

      // Step 1: Check live for all accounts
      var liveAccounts = [];
      var deadAccounts = [];
      try {
        var allConfigs = parsedAccounts.map(function(a) { return a.config; }).join(String.fromCharCode(10));
        var clRes = await fetch('/api/tools/check-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credentials: allConfigs, mode: 'oauth2' }),
        });
        var clData = await clRes.json();
        if (clData.results) {
          clData.results.forEach(function(r) {
            var matched = parsedAccounts.find(function(a) {
              return a.email.toLowerCase() === (r.email || '').toLowerCase();
            });
            if (matched) {
              if (r.live) liveAccounts.push(matched);
              else deadAccounts.push(matched);
            }
          });
        }
      } catch(e) {
        // If live check fails, import all anyway
        liveAccounts = parsedAccounts.slice();
      }

      statusEl.querySelector('.status-text').textContent = liveAccounts.length + ' LIVE, ' + deadAccounts.length + ' DEAD — importing live accounts...';
      btn.querySelector('.btn-text').textContent = 'Importing...';

      // Step 2: Import only live accounts
      var ok = 0, fail = 0;
      for (var i = 0; i < liveAccounts.length; i++) {
        var a = liveAccounts[i];
        try {
          var res = await fetch('/atmin/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: a.email,
              config: a.config,
              inbox_enabled: true,
              note: '',
            }),
          });
          var data = await res.json();
          if (data.success) ok++; else fail++;
        } catch(e) { fail++; }
        statusEl.querySelector('.status-text').textContent = 'Importing... ' + (i+1) + '/' + liveAccounts.length;
      }

      statusEl.className = 'status status-ok';
      statusEl.querySelector('.status-text').textContent = ok + ' imported, ' + fail + ' failed, ' + deadAccounts.length + ' dead (skipped).';
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Import All';
      btn.querySelector('.btn-loader').style.display = 'none';

      // Refresh pages list
      var listRes = await fetch('/atmin/api/pages');
      var listData = await listRes.json();
      if (listData.success) { pages = listData.pages; renderPagesList(); updateStats(); }
      showToast('', ok + ' live pages imported!');
    });

    // ─── EXPORT BUTTONS ─────────────────────────────────────
    document.getElementById('btnExportEmail').addEventListener('click', function() {
      var emails = pages.map(function(p) { return p.email; }).join(String.fromCharCode(10));
      navigator.clipboard.writeText(emails).then(function() {
        showToast('', pages.length + ' emails copied!');
      });
    });
    document.getElementById('btnExportEmailPw').addEventListener('click', function() {
      // Build email|password list (password is unknown on client, so trigger download)
      var lines = pages.map(function(p) { return p.email; }).join(String.fromCharCode(10));
      var blob = new Blob([lines], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'pastenote_emails.txt'; a.click();
      URL.revokeObjectURL(url);
      showToast('', 'Download started');
    });

    // ─── SETTINGS ───────────────────────────────────────────
    document.getElementById('settingsDefaultNote').value = settings.default_note || '';
    document.getElementById('settingsRecoveryEmail').value = settings.recovery_email || '';
    document.getElementById('settingsGeneralPw').value = settings.general_password || '';
    document.getElementById('btnSaveSettings').addEventListener('click', async function() {
      try {
        var res = await fetch('/atmin/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            default_note: document.getElementById('settingsDefaultNote').value,
            recovery_email: document.getElementById('settingsRecoveryEmail').value.trim(),
            general_password: document.getElementById('settingsGeneralPw').value.trim(),
          }),
        });
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
        var res = await fetch('/atmin/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_admin_password: oldPw,
            new_admin_password: newPw,
          }),
        });
        var data = await res.json();
        if (data.success) {
          showToast('', 'Admin password changed!');
          document.getElementById('settingsOldPw').value = '';
          document.getElementById('settingsNewPw').value = '';
          document.getElementById('settingsConfirmPw').value = '';
        } else {
          alert(data.error || 'Failed to change password');
        }
      } catch (err) { alert('Error: ' + err.message); }
    });

    // ─── TOOLS: CHECK LIVE ──────────────────────────────────
    var clInput = document.getElementById('checkLiveInput');
    clInput.addEventListener('input', function() {
      document.getElementById('checkLiveCount').textContent = clInput.value.split('\\n').filter(function(l) { return l.trim(); }).length + ' accounts';
    });

    document.getElementById('btnCheckLive').addEventListener('click', async function() {
      var btn = this;
      var credentials = clInput.value.trim();
      if (!credentials) return;

      btn.disabled = true;
      btn.querySelector('.btn-text').textContent = 'Checking...';
      btn.querySelector('.btn-loader').style.display = 'inline-flex';

      var statusEl = document.getElementById('checkLiveStatus');
      statusEl.className = 'status status-load';
      statusEl.querySelector('.status-text').textContent = 'Checking accounts...';
      statusEl.style.display = 'flex';

      var cLive = 0, cDie = 0, cErr = 0;
      document.getElementById('clTextLive').value = '';
      document.getElementById('clTextDie').value = '';
      document.getElementById('clTextErr').value = '';

      try {
        var lines = credentials.split('\\n').filter(function(l) { return l.trim(); });
        var res = await fetch('/api/tools/check-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credentials: credentials, mode: 'oauth2' }),
        });
        var data = await res.json();
        document.getElementById('checkLiveResults').style.display = 'grid';

        data.results.forEach(function(r) {
          var orig = lines.find(function(l) { return l.split('|')[0].toLowerCase() === (r.email || '').toLowerCase(); }) || r.email;
          if (r.live) {
            document.getElementById('clTextLive').value += (cLive ? '\\n' : '') + orig;
            cLive++;
          } else if (r.error && (r.error.indexOf('timeout') >= 0 || r.error.indexOf('fetch') >= 0)) {
            document.getElementById('clTextErr').value += (cErr ? '\\n' : '') + orig;
            cErr++;
          } else {
            document.getElementById('clTextDie').value += (cDie ? '\\n' : '') + orig;
            cDie++;
          }
        });

        document.getElementById('clCountLive').textContent = cLive;
        document.getElementById('clCountDie').textContent = cDie;
        document.getElementById('clCountErr').textContent = cErr;
        statusEl.className = 'status status-ok';
        statusEl.querySelector('.status-text').textContent = cLive + ' LIVE, ' + cDie + ' DIE, ' + cErr + ' ERROR';
      } catch (err) {
        statusEl.className = 'status status-err';
        statusEl.querySelector('.status-text').textContent = 'Error: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Check Live';
        btn.querySelector('.btn-loader').style.display = 'none';
      }
    });

    document.getElementById('clCopyLive').addEventListener('click', function() { navigator.clipboard.writeText(document.getElementById('clTextLive').value); showToast('', 'Copied'); });
    document.getElementById('clCopyDie').addEventListener('click', function() { navigator.clipboard.writeText(document.getElementById('clTextDie').value); showToast('', 'Copied'); });
    document.getElementById('clCopyErr').addEventListener('click', function() { navigator.clipboard.writeText(document.getElementById('clTextErr').value); showToast('', 'Copied'); });


    // ─── TOOLS: FORMAT ──────────────────────────────────────
    document.getElementById('btnFormat').addEventListener('click', function() {
      var input = document.getElementById('formatInput').value.trim();
      if (!input) return;

      var lines = input.split(/\\r?\\n/);
      var accounts = new Map();
      var dups = 0;

      lines.forEach(function(line) {
        line = line.trim();
        if (!line) return;
        var parts = line.split(/[:;|,\\t]/).map(function(p) { return p.trim(); }).filter(Boolean);
        if (parts.length >= 2 && parts[0].indexOf('@') >= 0) {
          var email = parts[0].toLowerCase();
          if (accounts.has(email)) { dups++; }
          else { accounts.set(email, parts[0] + '|' + parts[1]); }
        }
      });

      document.getElementById('fmtTotal').textContent = accounts.size;
      document.getElementById('fmtDups').textContent = dups;
      document.getElementById('formatStats').style.display = 'flex';

      if (accounts.size > 0) {
        document.getElementById('formatResult').value = Array.from(accounts.values()).join('\\n');
        document.getElementById('formatOutput').style.display = 'block';
      }
      showToast('', accounts.size + ' accounts formatted, ' + dups + ' duplicates removed.');
    });

    document.getElementById('fmtCopy').addEventListener('click', function() {
      navigator.clipboard.writeText(document.getElementById('formatResult').value);
      showToast('', 'Copied');
    });

    document.getElementById('fmtDownload').addEventListener('click', function() {
      var text = document.getElementById('formatResult').value;
      if (!text) return;
      var blob = new Blob([text], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'formatted_accounts.txt'; a.click();
      URL.revokeObjectURL(url);
    });
  })();
  `;
}
