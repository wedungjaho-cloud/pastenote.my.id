/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — Cloudflare Worker Entry Point
 *  Routes all requests to the appropriate handler.
 * ═══════════════════════════════════════════════════════════
 */

import { Router } from './router.js';
import { handleVisitorPage, handleVerifyPassword, handleReadInbox, handleDeleteMessage } from './handlers/pages.js';
import { handleAdminPage, handleAdminApi } from './handlers/admin.js';
import { handleToolsApi } from './handlers/tools.js';
import { renderLanding, renderNotFound } from './lib/render.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      if (path === '/favicon.svg') {
        return new Response(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="4" y="2" width="24" height="28" rx="4" fill="#6F8F72"/><line x1="10" y1="10" x2="22" y2="10" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="16" x2="22" y2="16" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><line x1="10" y1="22" x2="17" y2="22" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".4"/></svg>`, {
          headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
        });
      }

      if (path === '/' || path === '') return renderLanding();

      if (path === '/api/verify-password' && method === 'POST') return handleVerifyPassword(request, env);
      if (path === '/api/read-inbox' && method === 'POST') return handleReadInbox(request, env);
      if (path === '/api/delete-message' && method === 'POST') return handleDeleteMessage(request, env);

      if (path === '/atmin' || path === '/atmin/') return handleAdminPage(request, env, 'dashboard');
      if (path === '/atmin/login') return handleAdminPage(request, env, 'login');
      if (path.startsWith('/atmin/api/')) return handleAdminApi(request, env, path, method);
      if (path.startsWith('/api/tools/')) return handleToolsApi(request, env, path, method);

      const emailPath = path.slice(1);
      if (emailPath && emailPath.includes('@') && !emailPath.includes('/')) {
        return handleVisitorPage(request, env, decodeURIComponent(emailPath));
      }

      return renderNotFound(path);
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
