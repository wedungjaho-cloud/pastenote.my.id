/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — Tools Handlers (Admin utility features)
 *  Routes: /api/tools/check-live, /api/tools/get-token
 *  These run server-side in the Worker.
 * ═══════════════════════════════════════════════════════════
 */

import { Router } from '../router.js';
import { verifyJWT } from '../utils/crypto.js';

// ─── Tools API Router ────────────────────────────────────────

export async function handleToolsApi(request, env, path, method) {
  // Tools require admin auth
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const adminToken = cookies['pn_admin'];
  const admin = adminToken ? await verifyJWT(adminToken, env.JWT_SECRET) : null;

  if (!admin) {
    return Router.jsonResponse({ success: false, error: 'Unauthorized — admin login required' }, 401);
  }

  if (path === '/api/tools/check-live' && method === 'POST') {
    return handleCheckLive(request, env);
  }
  if (path === '/api/tools/get-token' && method === 'POST') {
    return handleGetToken(request, env);
  }

  return Router.jsonResponse({ error: 'Tool not found' }, 404);
}


// ─── Check Live — cek apakah akun masih aktif ────────────────

async function handleCheckLive(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.credentials) {
    return Router.jsonResponse({ success: false, error: 'Credentials wajib diisi' }, 400);
  }

  const lines = body.credentials.split('\n').filter(l => l.trim());
  const mode = body.mode || 'oauth2';
  const results = [];

  for (const line of lines) {
    const parts = line.split('|');
    const email = parts[0]?.trim();
    const password = parts[1]?.trim();
    const refreshToken = parts[2]?.trim();
    const clientId = parts[3]?.trim() || '9e5f94bc-e8a4-4e73-b8be-63364c29d753';

    if (!email) {
      results.push({ email: line, live: false, error: 'Format tidak valid' });
      continue;
    }

    try {
      if (mode === 'oauth2' && refreshToken) {
        // Try token refresh — if it works, account is live
        const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
        const tokenBody = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          scope: 'https://graph.microsoft.com/Mail.Read offline_access',
        });

        const res = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenBody.toString(),
        });

        const data = await res.json();
        if (data.access_token) {
          results.push({ email, live: true, error: null });
        } else {
          results.push({ email, live: false, error: data.error_description || data.error || 'Token invalid' });
        }
      } else {
        // Basic check: try ROPC grant (email+password only)
        const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
        const tokenBody = new URLSearchParams({
          grant_type: 'password',
          username: email,
          password: password || '',
          client_id: clientId,
          scope: 'https://graph.microsoft.com/Mail.Read offline_access',
        });

        const res = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenBody.toString(),
        });

        const data = await res.json();
        if (data.access_token) {
          results.push({ email, live: true, error: null });
        } else {
          results.push({ email, live: false, error: data.error_description || data.error || 'Auth failed' });
        }
      }
    } catch (err) {
      results.push({ email, live: false, error: err.message });
    }
  }

  return Router.jsonResponse({ success: true, results });
}


// ─── Get Token — dapatkan refresh_token dari ROPC ────────────

async function handleGetToken(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.credentials) {
    return Router.jsonResponse({ success: false, error: 'Credentials wajib diisi' }, 400);
  }

  const lines = body.credentials.split('\n').filter(l => l.trim());
  const results = [];

  for (const line of lines) {
    const parts = line.split('|');
    const email = parts[0]?.trim();
    const password = parts[1]?.trim();
    const clientId = parts[2]?.trim() || '9e5f94bc-e8a4-4e73-b8be-63364c29d753';

    if (!email || !password) {
      results.push({ email: email || line, success: false, error: 'Format: email|password atau email|password|client_id' });
      continue;
    }

    try {
      const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
      const tokenBody = new URLSearchParams({
        grant_type: 'password',
        username: email,
        password: password,
        client_id: clientId,
        scope: 'https://graph.microsoft.com/Mail.Read offline_access',
      });

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenBody.toString(),
      });

      const data = await res.json();

      if (data.access_token && data.refresh_token) {
        // Format output: email|password|refresh_token|client_id
        const formatted = `${email}|${password}|${data.refresh_token}|${clientId}`;
        results.push({ email, success: true, formatted, error: null });
      } else {
        results.push({ email, success: false, formatted: null, error: data.error_description || data.error || 'Failed' });
      }
    } catch (err) {
      results.push({ email, success: false, formatted: null, error: err.message });
    }
  }

  return Router.jsonResponse({ success: true, results });
}


// ─── Helpers ─────────────────────────────────────────────────

function parseCookies(cookieHeader) {
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );
}
