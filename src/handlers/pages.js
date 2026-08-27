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


// ─── POST /api/read-inbox — Fetch inbox from Graph API or OAuth2 ──────

export async function handleReadInbox(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email) {
    return Router.jsonResponse({ success: false, error: 'Email wajib diisi' }, 400);
  }

  const { email } = body;
  const mode = (body.mode === 'oauth2') ? 'oauth2' : 'graph';
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

  // Refresh token according to selected mode
  let accessToken;
  let tokenScope = '';
  try {
    const tokenResult = await refreshOAuth2Token(config.refresh_token, config.client_id, mode);
    accessToken = tokenResult.access_token;
    tokenScope = tokenResult.scope || '';

    // Save new refresh token (Microsoft rotates them)
    if (tokenResult.refresh_token && tokenResult.refresh_token !== config.refresh_token) {
      await updateRefreshToken(env.KV, email, tokenResult.refresh_token, env.ENCRYPTION_KEY);
    }
  } catch (err) {
    return Router.jsonResponse({ success: false, error: `Token refresh gagal: ${err.message}` }, 502);
  }

  // Fetch inbox according to selected mode
  try {
    const messages = await fetchInbox(accessToken, mode, tokenScope, email);
    return Router.jsonResponse({
      success: true,
      mode,
      messageCount: messages.length,
      messages,
    });
  } catch (err) {
    return Router.jsonResponse({ success: false, error: `Gagal ambil inbox: ${err.message}` }, 502);
  }
}


// ─── OAuth2 Token Refresh ────────────────────────────────────
// Strategy: try without scope first (uses consented defaults, usually works
// for MSA/consumer tokens). Only fallback to explicit scopes if needed.
// This minimizes subrequests (1 fetch in the happy path).

async function refreshOAuth2Token(refreshToken, clientId, mode = 'graph') {
  const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';

  // Always try without scope first — MSA consumer tokens return their
  // originally-consented scopes, avoiding invalid_grant errors.
  const scopesToTry = [
    undefined, // consented default — usually succeeds
    (mode === 'oauth2')
      ? 'https://outlook.office.com/Mail.Read offline_access'
      : 'https://graph.microsoft.com/Mail.Read offline_access',
  ];

  let lastError = 'Token refresh failed';

  for (const sc of scopesToTry) {
    const params = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    };
    if (sc) params.scope = sc;

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        body: new URLSearchParams(params).toString(),
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token || refreshToken,
          expires_in: data.expires_in,
          scope: data.scope || '',
        };
      } else {
        lastError = data.error_description || data.error || lastError;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  throw new Error(lastError);
}


// ─── Universal Message Normalizer ────────────────────────────

function normalizeInboxMessage(msg) {
  return {
    id: msg.id || msg.Id || '',
    subject: msg.subject || msg.Subject || '(No Subject)',
    from: msg.from?.emailAddress?.name || msg.From?.EmailAddress?.Name || '',
    fromEmail: msg.from?.emailAddress?.address || msg.From?.EmailAddress?.Address || '',
    date: msg.receivedDateTime || msg.ReceivedDateTime || msg.createdDateTime || msg.CreatedDateTime || '',
    preview: msg.bodyPreview || msg.BodyPreview || '',
    body: msg.body?.content || msg.Body?.Content || '',
    isRead: (msg.isRead !== undefined) ? msg.isRead : ((msg.IsRead !== undefined) ? msg.IsRead : false),
  };
}


// ─── Fetch Inbox (Graph API or Outlook REST API) ─────────────
// Uses tokenScope to pick the preferred endpoint with automatic fallback.

async function fetchInbox(accessToken, mode = 'graph', tokenScope = '', email = '') {
  const outlookEp = {
    type: 'outlook',
    url: `https://outlook.office.com/api/v2.0/me/mailfolders/inbox/messages?$top=15&$orderby=${encodeURIComponent('ReceivedDateTime desc')}&$select=Id,Subject,From,ReceivedDateTime,BodyPreview,Body,IsRead`
  };
  const graphEp = {
    type: 'graph',
    url: `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=15&$orderby=${encodeURIComponent('receivedDateTime desc')}&$select=id,subject,from,receivedDateTime,bodyPreview,body,isRead`
  };

  const endpoints = [];
  const hasOutlookScope = tokenScope.includes('outlook.office.com');
  const hasGraphScope = tokenScope.includes('graph.microsoft.com');

  if (hasOutlookScope && !hasGraphScope) {
    endpoints.push(outlookEp, graphEp);
  } else if (hasGraphScope && !hasOutlookScope) {
    endpoints.push(graphEp, outlookEp);
  } else if (mode === 'oauth2') {
    endpoints.push(outlookEp, graphEp);
  } else {
    endpoints.push(graphEp, outlookEp);
  }

  let lastError = 'Inbox fetch failed';
  const debugInfo = [];

  for (const ep of endpoints) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      };
      if (email && email.includes('@')) {
        headers['X-AnchorMailbox'] = email;
      }

      const response = await fetch(ep.url, { headers });
      console.log(`[fetchInbox] ${ep.type}: HTTP ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        if (data.value && Array.isArray(data.value)) {
          return data.value.map(normalizeInboxMessage);
        }
        // response.ok but no value array — unexpected format
        lastError = `${ep.type}: response OK but no messages array`;
        debugInfo.push(`${ep.type}:ok_no_value`);
      } else {
        const errText = await response.text();
        let errMsg = `HTTP ${response.status}`;
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.error?.message || errData.error || errMsg;
        } catch (_) {
          errMsg = errText.substring(0, 200) || errMsg;
        }
        lastError = `${ep.type}: ${errMsg}`;
        debugInfo.push(`${ep.type}:${response.status}`);
        console.log(`[fetchInbox] ${ep.type} error: ${errMsg.substring(0, 150)}`);
      }
    } catch (err) {
      lastError = `${ep.type}: ${err.message}`;
      debugInfo.push(`${ep.type}:catch:${err.message.substring(0, 50)}`);
      console.log(`[fetchInbox] ${ep.type} exception: ${err.message}`);
    }
  }

  throw new Error(`${lastError} [tried: ${debugInfo.join(', ')}]`);
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
