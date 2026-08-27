/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — Page Renderers (New Architecture)
 *  Import HTML/CSS files as text modules and build pages.
 * ═══════════════════════════════════════════════════════════
 */

import { renderPage, esc, visitorHeader, minimalHeader, adminHeader } from '../lib/html.js';
import { getAllCSS } from '../lib/css.js';
import { Router } from '../router.js';

// HTML templates (imported as text via wrangler rules)
import layoutHTML from '../pages/layout.html';
import landingHTML from '../pages/landing.html';
import lockedHTML from '../pages/locked.html';
import notfoundHTML from '../pages/notfound.html';
import unlockedHTML from '../pages/unlocked.html';
import adminLoginHTML from '../pages/admin-login.html';
import adminDashHTML from '../pages/admin-dash.html';

// Client-side JS (imported as text via .txt extension)
import lockedJS from '../scripts/locked.txt';
import inboxJS from '../scripts/inbox.txt';
import adminLoginJS from '../scripts/admin-login.txt';
import adminDashJS from '../scripts/admin-dash.txt';

const CSS = getAllCSS();

// ─── Landing ──────────────────────────────────────────────

export function renderLanding() {
  const html = renderPage(layoutHTML, CSS, {
    title: 'PasteNote',
    bodyClass: '',
    headerHTML: minimalHeader(),
    body: landingHTML,
    scripts: '',
  });
  return Router.htmlResponse(html);
}

// ─── Locked ───────────────────────────────────────────────

export function renderLocked(email) {
  const safe = (s, token, val) => s.replace(token, () => val);
  let body = lockedHTML;
  body = safe(body, '{{EMAIL_DISPLAY}}', esc(email));
  body = safe(body, '{{EMAIL_JSON}}', JSON.stringify(email));

  const html = renderPage(layoutHTML, CSS, {
    title: esc(email),
    bodyClass: 'locked',
    headerHTML: minimalHeader(),
    body: body,
    scripts: '<script>' + lockedJS + '</script>',
  });
  return Router.htmlResponse(html);
}

// ─── Not Found ────────────────────────────────────────────

export function renderNotFound(path) {
  const body = notfoundHTML.replace('{{PATH}}', () => esc(path));

  const html = renderPage(layoutHTML, CSS, {
    title: '404',
    bodyClass: '',
    headerHTML: minimalHeader(),
    body: body,
    scripts: '',
  });
  return Router.htmlResponse(html, 404);
}

// ─── Unlocked (visitor page) ──────────────────────────────

export function renderUnlocked(page, globalSettings, configExists) {
  const note = page.note || globalSettings.default_note || '';
  const inboxOn = page.inbox_enabled && configExists;

  const noteContent = esc(note).replace(/\n/g, '<br>');

  const inboxSection = inboxOn ? buildInboxSection() : buildInboxOff();

  // Use function-form to avoid $' $& special patterns in replacement strings
  const safe = (s, token, val) => s.replace(token, () => val);
  let body = unlockedHTML;
  body = safe(body, '{{NOTE_CONTENT}}', noteContent);
  body = safe(body, '{{INBOX_SECTION}}', inboxSection);
  body = safe(body, '{{EMAIL_JSON}}', JSON.stringify(page.email));

  const html = renderPage(layoutHTML, CSS, {
    title: esc(page.email),
    bodyClass: 'unlocked',
    headerHTML: visitorHeader(page.email),
    body: body,
    scripts: inboxOn ? '<script>' + inboxJS + '</script>' : '',
  });
  return Router.htmlResponse(html);
}

function buildInboxSection() {
  return `
  <div class="card fade-up fade-up-d1" style="margin-top:16px">
    <div class="card-header">
      <div class="card-header-l">
        <div class="card-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5 12 14l9-5.5"/><rect x="3" y="5" width="18" height="14" rx="2.2"/>
          </svg>
        </div>
        <h2>Inbox</h2>
      </div>
      <div class="card-header-r">
        <div class="api-mode-pills" id="apiModeSelector" title="Pilih Mode API Inbox">
          <button type="button" class="api-mode-btn active" data-mode="graph">Graph API</button>
          <button type="button" class="api-mode-btn" data-mode="oauth2">OAuth2</button>
        </div>
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
    <div class="inbox-search-bar" style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;gap:8px;align-items:center;background:var(--surface-2)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted-2);flex-shrink:0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="mailSearch" placeholder="Search emails, sender, OTP..." style="width:100%;background:transparent;border:none;outline:none;font-size:12px;color:var(--ink);font-family:var(--font-ui)">
      <button id="btnClearSearch" style="display:none;color:var(--muted);cursor:pointer;font-size:11px;padding:2px 4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div class="card-body" style="padding:0">
      <div id="statusBar" class="status" style="display:none;margin:12px 12px 0"><span class="status-text"></span></div>
      <div id="inboxArea"></div>
    </div>
  </div>`;
}

function buildInboxOff() {
  return `
  <div class="card fade-up fade-up-d1">
    <div class="card-header">
      <div class="card-header-l">
        <div class="card-icon sage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5 12 14l9-5.5"/><rect x="3" y="5" width="18" height="14" rx="2.2"/>
          </svg>
        </div>
        <h2>Inbox</h2>
      </div>
    </div>
    <div class="inbox-off">Inbox is not enabled for this page.</div>
  </div>`;
}

// ─── Admin Login ──────────────────────────────────────────

export function renderAdminLogin() {
  const html = renderPage(layoutHTML, CSS, {
    title: 'Admin Login',
    bodyClass: 'admin-login',
    headerHTML: minimalHeader(),
    body: adminLoginHTML,
    scripts: '<script>' + adminLoginJS + '</script>',
  });
  return Router.htmlResponse(html);
}

// ─── Admin Dashboard ──────────────────────────────────────

export function renderAdminDashboard(pages, settings) {
  const pagesJson = JSON.stringify(pages);
  const settingsJson = JSON.stringify(settings);

  // Use function-form to avoid $' $& special patterns in replacement strings
  const safe = (s, token, val) => s.replace(token, () => val);
  let body = adminDashHTML;
  body = safe(body, '{{PAGES_JSON}}', pagesJson);
  body = safe(body, '{{SETTINGS_JSON}}', settingsJson);

  const html = renderPage(layoutHTML, CSS, {
    title: 'Admin',
    bodyClass: 'admin',
    headerHTML: adminHeader(),
    body: body,
    scripts: '<script>' + adminDashJS + '</script>',
  });
  return Router.htmlResponse(html);
}
