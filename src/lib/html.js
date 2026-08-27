/**
 * PasteNote — HTML Template Renderer
 * Reads .html files imported as text, replaces {{placeholders}}.
 */

/**
 * Escape HTML entities to prevent XSS.
 */
export function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render a page by injecting layout + page-specific content.
 *
 * @param {string} layoutHTML  - The layout.html template string
 * @param {string} allCSS     - Concatenated CSS string
 * @param {object} opts       - Rendering options
 * @param {string} opts.title
 * @param {string} opts.bodyClass
 * @param {string} opts.headerHTML  - Pre-rendered header HTML
 * @param {string} opts.body        - Page body HTML
 * @param {string} opts.scripts     - Client-side JS to inject
 * @returns {string} Complete HTML document
 */
export function renderPage(layoutHTML, allCSS, opts = {}) {
  // Use function-form replace to avoid $' $& $` special patterns in replacement strings
  const safe = (str, token, val) => str.replace(token, () => val);
  let html = layoutHTML;
  html = safe(html, '{{CSS}}', allCSS);
  html = safe(html, '{{TITLE}}', esc(opts.title || 'PasteNote'));
  html = safe(html, '{{BODY_CLASS}}', opts.bodyClass || '');
  html = safe(html, '{{HEADER}}', opts.headerHTML || '');
  html = safe(html, '{{BODY}}', opts.body || '');
  html = safe(html, '{{SCRIPTS}}', opts.scripts || '');
  return html;
}

/**
 * Create a standard visitor header.
 */
export function visitorHeader(email) {
  return `
  <header class="hdr">
    <div class="hdr-in">
      <a href="/" class="brand">
        <span class="brand-name">paste<span class="brand-dot">note</span></span>
      </a>
      <div class="hdr-r">
        ${email ? '<span class="hdr-email">' + esc(email) + '</span>' : ''}
        <button id="themeBtn" class="icon-btn" onclick="toggleTheme()" title="Toggle theme"></button>
      </div>
    </div>
    ${email ? '<div class="hdr-sub"><span class="hdr-sub-email">' + esc(email) + '</span></div>' : ''}
  </header>`;
}

/**
 * Create a minimal header (no email, just brand + theme toggle).
 */
export function minimalHeader() {
  return `
  <header class="hdr">
    <div class="hdr-in">
      <a href="/" class="brand">
        <span class="brand-name">paste<span class="brand-dot">note</span></span>
      </a>
      <div class="hdr-r">
        <button id="themeBtn" class="icon-btn" onclick="toggleTheme()" title="Toggle theme"></button>
      </div>
    </div>
  </header>`;
}

/**
 * Create admin header with nav pills.
 */
export function adminHeader() {
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
        <button id="themeBtn" class="icon-btn" onclick="toggleTheme()" title="Toggle theme"></button>
        <button id="logoutBtn" class="btn btn-g btn-sm">
          <span class="i i-16"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>`;
}
