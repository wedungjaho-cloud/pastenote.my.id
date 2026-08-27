/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — Visitor Page Handlers
 *  Handles: /{email}, /api/verify-password, /api/read-inbox, /api/delete-message
 * ═══════════════════════════════════════════════════════════
 */

import { Router } from '../router.js';
import { getPage, getConfig, updateRefreshToken, validateSession, createSession, verifyPagePassword, isRateLimited, checkBruteForce, recordFailedAttempt, clearFailedAttempts, getGlobalSettings, hasConfig } from '../utils/kv.js';
import { renderLocked, renderUnlocked, renderNotFound } from '../lib/render.js';

// ─── GET /{email} — Render visitor page ──────────────────────

export async function handleVisitorPage(request, env, email) {
  const page = await getPage(env.KV, email);

  // Page doesn't exist → 404
  if (!page) {
    return renderNotFound(email);
  }

  // Check session cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies['pn_session'];

  const session = await validateSession(env.KV, sessionToken, email);

  if (session) {
    // Session valid → show unlocked page
    const globalSettings = await getGlobalSettings(env.KV);
    const configExists = await hasConfig(env.KV, email);
    return renderUnlocked(page, globalSettings, configExists);
  }

  // No valid session → show locked page
  return renderLocked(email);
}


// ─── POST /api/verify-password — Verify visitor password ─────

export async function handleVerifyPassword(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email || !body.password) {
    return Router.jsonResponse({ success: false, error: 'Email and password are required' }, 400);
  }

  const { email, password } = body;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Check brute force
  const blocked = await checkBruteForce(env.KV, ip, 'password');
  if (blocked) {
    return Router.jsonResponse({ success: false, error: 'Too many failed attempts. Try again in 15 minutes.' }, 429);
  }

  // Check page exists
  const page = await getPage(env.KV, email);
  if (!page) {
    return Router.jsonResponse({ success: false, error: 'Page not found' }, 404);
  }

  // Check page-specific password first
  let valid = false;
  if (page.password_hash) {
    valid = await verifyPagePassword(env.KV, email, password);
  }

  // Fallback to general password from global settings
  if (!valid) {
    const globalSettings = await getGlobalSettings(env.KV);
    if (globalSettings.general_password_hash) {
      const { sha256 } = await import('../utils/crypto.js');
      const inputHash = await sha256(password);
      if (inputHash === globalSettings.general_password_hash) {
        valid = true;
      }
    }
  }

  // No password set at all (neither page nor general)
  if (!valid && !page.password_hash) {
    const globalSettings = await getGlobalSettings(env.KV);
    if (!globalSettings.general_password_hash) {
      return Router.jsonResponse({ success: false, error: 'Password has not been set by admin' }, 403);
    }
  }

  if (!valid) {
    await recordFailedAttempt(env.KV, ip, 'password');
    return Router.jsonResponse({ success: false, error: 'Wrong password' }, 401);
  }

  // Success → create session
  await clearFailedAttempts(env.KV, ip, 'password');
  const sessionToken = await createSession(env.KV, email);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': Router.buildCookie('pn_session', sessionToken, { maxAge: 86400, path: '/' }),
    },
  });
}


// ─── POST /api/read-inbox — Fetch inbox from Graph API ──────

export async function handleReadInbox(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email) {
    return Router.jsonResponse({ success: false, error: 'Email wajib diisi' }, 400);
  }

  const { email } = body;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Validate session
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies['pn_session'];
  const session = await validateSession(env.KV, sessionToken, email);

  if (!session) {
    return Router.jsonResponse({ success: false, error: 'Session tidak valid. Silakan login ulang.' }, 401);
  }

  // Check page exists and inbox is enabled
  const page = await getPage(env.KV, email);
  if (!page) {
    return Router.jsonResponse({ success: false, error: 'Halaman tidak ditemukan' }, 404);
  }
  if (!page.inbox_enabled) {
    return Router.jsonResponse({ success: false, error: 'Fitur inbox dinonaktifkan untuk halaman ini' }, 403);
  }

  // Rate limit
  const limited = await isRateLimited(env.KV, email, ip, 5000);
  if (limited) {
    return Router.jsonResponse({ success: false, error: 'Terlalu cepat. Tunggu 5 detik.' }, 429);
  }

  // Get encrypted config
  const config = await getConfig(env.KV, email, env.ENCRYPTION_KEY);
  if (!config) {
    return Router.jsonResponse({ success: false, error: 'Konfigurasi email belum diatur oleh admin' }, 404);
  }

  // Refresh OAuth2 token
  let accessToken;
  try {
    const tokenResult = await refreshOAuth2Token(config.refresh_token, config.client_id);
    accessToken = tokenResult.access_token;

    // Save new refresh token (Microsoft rotates them)
    if (tokenResult.refresh_token && tokenResult.refresh_token !== config.refresh_token) {
      await updateRefreshToken(env.KV, email, tokenResult.refresh_token, env.ENCRYPTION_KEY);
    }
  } catch (err) {
    return Router.jsonResponse({ success: false, error: `Token refresh gagal: ${err.message}` }, 502);
  }

  // Fetch inbox from Graph API
  try {
    const messages = await fetchInbox(accessToken);
    return Router.jsonResponse({
      success: true,
      messageCount: messages.length,
      messages,
    });
  } catch (err) {
    return Router.jsonResponse({ success: false, error: `Gagal ambil inbox: ${err.message}` }, 502);
  }
}


// ─── OAuth2 Token Refresh ────────────────────────────────────

async function refreshOAuth2Token(refreshToken, clientId) {
  const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    scope: 'https://graph.microsoft.com/Mail.ReadWrite offline_access',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Token refresh failed');
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_in: data.expires_in,
  };
}


// ─── Fetch Inbox from Graph API ──────────────────────────────

async function fetchInbox(accessToken) {
  const graphUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages'
    + '?$top=15'
    + '&$orderby=receivedDateTime desc'
    + '&$select=id,subject,from,receivedDateTime,bodyPreview,body,isRead';

  const response = await fetch(graphUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `Graph API error: ${response.status}`);
  }

  return (data.value || []).map(msg => ({
    id: msg.id || '',
    subject: msg.subject || '(No Subject)',
    from: msg.from?.emailAddress?.name || '',
    fromEmail: msg.from?.emailAddress?.address || '',
    date: msg.receivedDateTime || '',
    preview: msg.bodyPreview || '',
    body: msg.body?.content || '',
    isRead: msg.isRead || false,
  }));
}


// ─── Cookie Parser ───────────────────────────────────────────

function parseCookies(cookieHeader) {
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );
}


// ─── POST /api/delete-message — Hard delete email via Graph API ──

export async function handleDeleteMessage(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email || !body.messageId) {
    return Router.jsonResponse({ success: false, error: 'Email and messageId are required' }, 400);
  }

  const { email, messageId } = body;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Validate session
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies['pn_session'];
  const session = await validateSession(env.KV, sessionToken, email);

  if (!session) {
    return Router.jsonResponse({ success: false, error: 'Session not valid. Please login again.' }, 401);
  }

  // Check page exists and inbox is enabled
  const page = await getPage(env.KV, email);
  if (!page) {
    return Router.jsonResponse({ success: false, error: 'Page not found' }, 404);
  }
  if (!page.inbox_enabled) {
    return Router.jsonResponse({ success: false, error: 'Inbox is disabled for this page' }, 403);
  }

  // Rate limit — 1 delete per 2 seconds
  const limited = await isRateLimited(env.KV, email + ':del', ip, 2000);
  if (limited) {
    return Router.jsonResponse({ success: false, error: 'Too fast. Wait 2 seconds between deletes.' }, 429);
  }

  // Get config & refresh token
  const config = await getConfig(env.KV, email, env.ENCRYPTION_KEY);
  if (!config) {
    return Router.jsonResponse({ success: false, error: 'Email config not set by admin' }, 404);
  }

  let accessToken;
  try {
    const tokenResult = await refreshOAuth2Token(config.refresh_token, config.client_id);
    accessToken = tokenResult.access_token;
    if (tokenResult.refresh_token && tokenResult.refresh_token !== config.refresh_token) {
      await updateRefreshToken(env.KV, email, tokenResult.refresh_token, env.ENCRYPTION_KEY);
    }
  } catch (err) {
    return Router.jsonResponse({ success: false, error: `Token refresh failed: ${err.message}` }, 502);
  }

  // Delete message via Graph API
  try {
    const delRes = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (delRes.status === 204 || delRes.status === 200) {
      return Router.jsonResponse({ success: true });
    }

    const errData = await delRes.json().catch(() => ({}));
    const errMsg = errData.error?.message || `Graph API error: ${delRes.status}`;
    return Router.jsonResponse({ success: false, error: errMsg }, delRes.status >= 400 ? delRes.status : 502);
  } catch (err) {
    return Router.jsonResponse({ success: false, error: `Delete failed: ${err.message}` }, 502);
  }
}
