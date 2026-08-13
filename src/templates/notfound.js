/**
 * PasteNote — 404 v4.3 (English)
 */
import { layout, esc, icon } from './layout.js';
import { Router } from '../router.js';

export function renderNotFound(identifier) {
  return Router.htmlResponse(layout({
    title: 'Not Found',
    bodyClass: 'nf',
    body: `
    <div class="page-center">
      <div class="nf-card fade-up">
        <p class="nf-code">404</p>
        <h1 class="nf-title">Not Found</h1>
        <p class="nf-desc">
          ${identifier && identifier.includes('@')
            ? 'Email <strong>'+esc(identifier)+'</strong> is not registered.'
            : 'The page you are looking for does not exist.'}
        </p>
        <a href="/" class="btn btn-s">
          ${icon('back','i-16')}
          <span>Go Back</span>
        </a>
      </div>
    </div>`,
  }), 404);
}
