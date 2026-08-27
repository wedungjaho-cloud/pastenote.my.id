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
  if (path === '/api/tools/search-inbox' && method === 'POST') {
    return handleSearchInbox(request, env);
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
  const mode = (body.mode === 'graph') ? 'graph' : 'oauth2';
  const MAX_PER_REQUEST = 20;
  if (lines.length > MAX_PER_REQUEST) {
    return Router.jsonResponse({ success: false, error: `Max ${MAX_PER_REQUEST} accounts per request. Client should chunk.` }, 400);
  }
  const results = [];

  for (const line of lines) {
    let cleanLine = line;
    if (cleanLine.includes('\t')) {
      const tabParts = cleanLine.split('\t').map(p => p.trim()).filter(Boolean);
      const foundPipe = tabParts.find(p => p.includes('|') && p.includes('@'));
      if (foundPipe) cleanLine = foundPipe;
    }
    if (cleanLine.endsWith('$')) cleanLine = cleanLine.slice(0, -1);

    const parts = cleanLine.split('|');
    const email = parts[0]?.trim();
    const password = parts[1]?.trim();
    const refreshToken = parts[2]?.trim();
    const clientId = parts[3]?.trim() || '9e5f94bc-e8a4-4e73-b8be-63364c29d753';

    if (!email) {
      results.push({ email: line, live: false, error: 'Format tidak valid' });
      continue;
    }

    try {
      if (refreshToken) {
        const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
        // Try without scope first (uses consented defaults, 1 fetch in happy path)
        const scopesToTry = [
          undefined,
          (mode === 'oauth2')
            ? 'https://outlook.office.com/Mail.Read offline_access'
            : 'https://graph.microsoft.com/Mail.Read offline_access',
        ];

        let liveFound = false;
        let lastErr = 'Token invalid';

        for (const sc of scopesToTry) {
          const params = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
          };
          if (sc) params.scope = sc;

          const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(params).toString(),
          });

          const data = await res.json();
          if (data.access_token) {
            results.push({ email, live: true, error: null });
            liveFound = true;
            break;
          } else {
            lastErr = data.error_description || data.error || lastErr;
          }
        }

        if (!liveFound) {
          results.push({ email, live: false, error: lastErr });
        }
      } else {
        // Basic check: try ROPC grant (email+password only)
        const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
        const scope = (mode === 'oauth2')
          ? 'https://outlook.office.com/Mail.Read offline_access'
          : 'https://graph.microsoft.com/Mail.Read offline_access';

        const tokenBody = new URLSearchParams({
          grant_type: 'password',
          username: email,
          password: password || '',
          client_id: clientId,
          scope: scope,
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
          results.push({ email, live: false, error: data.error_description || data.error || 'Password login failed' });
        }
      }
    } catch (err) {
      results.push({ email, live: false, error: err.message });
    }
  }

  return Router.jsonResponse({ success: true, mode, results });
}


// ─── Get OAuth2 Access Token Helper ──────────────────────────

async function handleGetToken(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.refreshToken) {
    return Router.jsonResponse({ success: false, error: 'refreshToken is required' }, 400);
  }

  const clientId = body.clientId || '9e5f94bc-e8a4-4e73-b8be-63364c29d753';
  const mode = (body.mode === 'oauth2') ? 'oauth2' : 'graph';

  try {
    const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
    const scopesToTry = [
      undefined,
      (mode === 'oauth2')
        ? 'https://outlook.office.com/Mail.Read offline_access'
        : 'https://graph.microsoft.com/Mail.Read offline_access',
    ];

    let lastError = 'Failed to get token';

    for (const sc of scopesToTry) {
      const params = {
        grant_type: 'refresh_token',
        refresh_token: body.refreshToken,
        client_id: clientId,
      };
      if (sc) params.scope = sc;

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString(),
      });

      const data = await res.json();
      if (data.access_token) {
        return Router.jsonResponse({
          success: true,
          accessToken: data.access_token,
          refreshToken: data.refresh_token || body.refreshToken,
          expiresIn: data.expires_in,
          scope: data.scope,
        });
      } else {
        lastError = data.error_description || data.error || lastError;
      }
    }

    return Router.jsonResponse({ success: false, error: lastError }, 400);
  } catch (err) {
    return Router.jsonResponse({ success: false, error: err.message }, 500);
  }
}


// ─── Search Inbox — Test read inbox & search specific messages ─

async function handleSearchInbox(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.credentials) {
    return Router.jsonResponse({ success: false, error: 'Credentials wajib diisi' }, 400);
  }

  const rawLines = body.credentials.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const mode = (body.mode === 'oauth2') ? 'oauth2' : 'graph';
  const subjectFilter = (body.subjectFilter || '').trim();
  const senderFilter = (body.senderFilter || '').trim();
  const searchLimit = Math.min(Math.max(parseInt(body.searchLimit, 10) || 15, 1), 30);

  const MAX_PER_REQUEST = 10;
  if (rawLines.length > MAX_PER_REQUEST) {
    return Router.jsonResponse({ success: false, error: `Max ${MAX_PER_REQUEST} accounts per request. Client should chunk.` }, 400);
  }

  // Process accounts sequentially to minimize concurrent subrequests
  const results = [];
  for (const line of rawLines) {
    const result = await searchSingleAccountInbox(line, subjectFilter, senderFilter, searchLimit, mode);
    results.push(result);
  }

  const summary = {
    total: results.length,
    live: results.filter(r => r.live).length,
    canRead: results.filter(r => r.canRead).length,
    matchFound: results.filter(r => r.matchFound).length,
    noMatch: results.filter(r => r.canRead && !r.matchFound).length,
    failed: results.filter(r => !r.canRead).length,
  };

  return Router.jsonResponse({ success: true, mode, summary, results });
}

async function searchSingleAccountInbox(rawLine, subjectFilter, senderFilter, searchLimit, mode = 'graph') {
  // Normalize line: support tab-separated and pipe-separated
  let line = rawLine;
  if (line.includes('\t')) {
    const tabParts = line.split('\t').map(p => p.trim()).filter(Boolean);
    const foundPipe = tabParts.find(p => p.includes('|') && p.includes('@'));
    if (foundPipe) line = foundPipe;
  }
  if (line.endsWith('$')) line = line.slice(0, -1);

  const parts = line.split('|');
  const email = parts[0]?.trim();
  const password = parts[1]?.trim();
  const refreshToken = parts[2]?.trim();
  const clientId = parts[3]?.trim() || '9e5f94bc-e8a4-4e73-b8be-63364c29d753';

  if (!email || !email.includes('@')) {
    return {
      email: email || rawLine,
      live: false,
      canRead: false,
      matchFound: false,
      matchedCount: 0,
      totalInbox: 0,
      matches: [],
      latestMessage: null,
      error: 'Format tidak valid. Gunakan: email|password|refresh_token|client_id',
      rawLine,
    };
  }

  try {
    // 1. Get access token — try without scope first (1 fetch in happy path)
    let accessToken = null;
    let newRefreshToken = null;
    let tokenScope = '';

    if (refreshToken) {
      const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
      const scopesToTry = [
        undefined,
        (mode === 'oauth2')
          ? 'https://outlook.office.com/Mail.Read offline_access'
          : 'https://graph.microsoft.com/Mail.Read offline_access',
      ];

      let lastErr = 'Refresh token invalid/expired';

      for (const sc of scopesToTry) {
        const params = {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
        };
        if (sc) params.scope = sc;

        const tokenRes = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(params).toString(),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          accessToken = tokenData.access_token;
          newRefreshToken = tokenData.refresh_token || refreshToken;
          tokenScope = tokenData.scope || '';
          break;
        } else {
          lastErr = tokenData.error_description || tokenData.error || lastErr;
        }
      }

      if (!accessToken) {
        return {
          email,
          live: false,
          canRead: false,
          matchFound: false,
          matchedCount: 0,
          totalInbox: 0,
          matches: [],
          latestMessage: null,
          error: lastErr,
          rawLine,
        };
      }
    } else if (password) {
      // Fallback: try ROPC (password grant)
      const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
      const tokenBody = new URLSearchParams({
        grant_type: 'password',
        username: email,
        password: password,
        client_id: clientId,
        scope: (mode === 'oauth2') ? 'https://outlook.office.com/Mail.Read offline_access' : 'https://graph.microsoft.com/Mail.Read offline_access',
      });

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenBody.toString(),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
        newRefreshToken = tokenData.refresh_token || null;
      } else {
        return {
          email,
          live: false,
          canRead: false,
          matchFound: false,
          matchedCount: 0,
          totalInbox: 0,
          matches: [],
          latestMessage: null,
          error: tokenData.error_description || tokenData.error || 'Password auth failed',
          rawLine,
        };
      }
    } else {
      return {
        email,
        live: false,
        canRead: false,
        matchFound: false,
        matchedCount: 0,
        totalInbox: 0,
        matches: [],
        latestMessage: null,
        error: 'Tidak ada refresh_token atau password untuk autentikasi',
        rawLine,
      };
    }

    // 2. Fetch inbox — smart-route based on token scope (avoids unnecessary subrequests)
    let rawMsgs = [];
    const endpoints = [];

    const outlookEp = {
      type: 'outlook',
      url: `https://outlook.office.com/api/v2.0/me/mailfolders/inbox/messages?$top=${searchLimit}&$orderby=ReceivedDateTime desc&$select=Id,Subject,From,ReceivedDateTime,BodyPreview,Body,IsRead`
    };
    const graphEp = {
      type: 'graph',
      url: `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=${searchLimit}&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,bodyPreview,body,isRead`
    };

    const hasOutlookScope = tokenScope.includes('outlook.office.com');
    const hasGraphScope = tokenScope.includes('graph.microsoft.com');

    if (hasOutlookScope && !hasGraphScope) {
      endpoints.push(outlookEp);  // token only works for Outlook
    } else if (hasGraphScope && !hasOutlookScope) {
      endpoints.push(graphEp);    // token only works for Graph
    } else if (mode === 'oauth2') {
      endpoints.push(outlookEp, graphEp);
    } else {
      endpoints.push(graphEp, outlookEp);
    }

    let fetchError = null;

    for (const ep of endpoints) {
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        if (ep.type === 'outlook') headers.Accept = 'application/json';

        const res = await fetch(ep.url, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.value && Array.isArray(data.value)) {
            rawMsgs = data.value;
            fetchError = null;
            break;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          fetchError = errData.error?.message || errData.error || `HTTP ${res.status}`;
        }
      } catch (err) {
        fetchError = err.message;
      }
    }

    if (fetchError && !rawMsgs.length) {
      return {
        email,
        live: true,
        canRead: false,
        matchFound: false,
        matchedCount: 0,
        totalInbox: 0,
        matches: [],
        latestMessage: null,
        error: fetchError,
        rawLine,
      };
    }
    const parsedMsgs = rawMsgs.map(msg => {
      const subj = msg.subject || msg.Subject || '(No Subject)';
      const fromName = msg.from?.emailAddress?.name || msg.From?.EmailAddress?.Name || '';
      const fromAddr = msg.from?.emailAddress?.address || msg.From?.EmailAddress?.Address || '';
      const date = msg.receivedDateTime || msg.ReceivedDateTime || msg.createdDateTime || msg.CreatedDateTime || '';
      const prev = msg.bodyPreview || msg.BodyPreview || '';
      const content = msg.body?.content || msg.Body?.Content || '';
      const otp = extractOtpCode(subj, prev, content);

      return {
        id: msg.id || msg.Id || '',
        subject: subj,
        from: fromName || fromAddr || 'Unknown',
        fromEmail: fromAddr,
        date: date,
        preview: prev,
        bodySnippet: content ? content.substring(0, 8000) : prev,
        isRead: (msg.isRead !== undefined) ? !!msg.isRead : ((msg.IsRead !== undefined) ? !!msg.IsRead : false),
        otp: otp,
      };
    });

    // 3. Filter messages
    const hasFilter = Boolean(subjectFilter || senderFilter);
    let matchedMsgs = [];

    if (hasFilter) {
      const subLow = subjectFilter.toLowerCase();
      const sndLow = senderFilter.toLowerCase();

      matchedMsgs = parsedMsgs.filter(m => {
        let matchSub = true;
        let matchSnd = true;

        if (subLow) {
          matchSub = (m.subject && m.subject.toLowerCase().includes(subLow)) ||
                     (m.preview && m.preview.toLowerCase().includes(subLow));
        }

        if (sndLow) {
          matchSnd = (m.from && m.from.toLowerCase().includes(sndLow)) ||
                     (m.fromEmail && m.fromEmail.toLowerCase().includes(sndLow));
        }

        return matchSub && matchSnd;
      });
    } else {
      // If no filter, treat all fetched messages as matches/readable
      matchedMsgs = parsedMsgs;
    }

    const latest = parsedMsgs[0] ? {
      subject: parsedMsgs[0].subject,
      from: parsedMsgs[0].from,
      fromEmail: parsedMsgs[0].fromEmail,
      date: parsedMsgs[0].date,
      otp: parsedMsgs[0].otp,
      preview: parsedMsgs[0].preview,
    } : null;

    return {
      email,
      live: true,
      canRead: true,
      matchFound: matchedMsgs.length > 0,
      matchedCount: matchedMsgs.length,
      totalInbox: parsedMsgs.length,
      matches: matchedMsgs,
      latestMessage: latest,
      newRefreshToken: (newRefreshToken && newRefreshToken !== refreshToken) ? newRefreshToken : null,
      error: null,
      rawLine,
    };
  } catch (err) {
    return {
      email,
      live: false,
      canRead: false,
      matchFound: false,
      matchedCount: 0,
      totalInbox: 0,
      matches: [],
      latestMessage: null,
      error: err.message,
      rawLine,
    };
  }
}

// ─── Extract OTP / Verification Code Helper ──────────────────

function extractOtpCode(subj, prev, body) {
  const plain = body ? body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>?/gm, ' ') : '';
  const all = (subj || '') + ' ' + (prev || '') + ' ' + plain;
  const isOtp = /(?:verify|verif|code|kode|OTP|PIN|passcode|security|token|sandi|password|auth|login)/i.test(all);
  const pats = [
    /(\d{4,8})\s*(?:is your|adalah|code|kode|for)/i,
    /(?:use|enter|masukkan|gunakan)[\s\S]{0,20}?(\d{4,8})\b/i,
    /(?:code|kode|OTP|PIN|Steam Guard|token|sandi)[\s\S]{0,40}?([A-Z0-9]{5,8})\b/i,
    /(?<!#)\b(\d{4,8})\b/i
  ];
  for (const pat of pats) {
    const re = new RegExp(pat.source, 'gi');
    let m;
    while ((m = re.exec(all)) !== null) {
      const c = m[1];
      if (!c || /^0+$/.test(c) || /^1+$/.test(c)) continue;
      if (/[a-zA-Z]/.test(c)) {
        if (c.length >= 5 && /\d/.test(c) && c === c.toUpperCase()) return c;
        continue;
      }
      if (/^\d{4,8}$/.test(c)) {
        if (pat.source.includes('\\d{4,8}')) {
          if (isOtp) return c;
        } else {
          return c;
        }
      }
    }
  }
  return '';
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

