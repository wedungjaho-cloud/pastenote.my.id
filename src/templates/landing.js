/**
 * PasteNote — Landing v4.3 (English)
 */
import { layout } from './layout.js';
import { Router } from '../router.js';

export function renderLanding() {
  return Router.htmlResponse(layout({
    title: 'PasteNote',
    bodyClass: 'landing',
    body: `
    <div class="page-center">
      <div class="land-card fade-up">
        <div class="land-title">
          <span class="brand-name">paste<span class="brand-dot">note</span></span>
        </div>

        <div class="info-box">
          <div class="info-label">How to Access</div>
          <ol class="steps">
            <li>Use the full link from your admin:<br><code>pastenote.my.id/<span class="hl">email@outlook.com</span></code></li>
            <li>Enter the password provided by admin</li>
            <li>Your notes and inbox will appear after login</li>
          </ol>
        </div>

        <p class="land-muted">If you don't have a link and password, this page is not for you.</p>
      </div>
    </div>`,
  }));
}
