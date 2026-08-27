/**
 * PasteNote — Admin Panel Handlers
 * Routes: /atmin, /atmin/login, /atmin/api/*
 * Includes: forgot-password, verify-recovery, reset-password flows
 */

import { Router } from '../router.js';
import { sha256, verifyJWT, signJWT } from '../utils/crypto.js';
import {
  getPage, savePage, deletePage, listPages,
  saveConfig, setPagePassword,
  getGlobalSettings, saveGlobalSettings,
  checkBruteForce, recordFailedAttempt, clearFailedAttempts,
  invalidateSessionsForEmail, getConfig,
} from '../utils/kv.js';
import { renderAdminLogin, renderAdminDashboard } from '../lib/render.js';

// ─── Admin Page Rendering ────────────────────────────────────

export async function handleAdminPage(request, env, view) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const adminToken = cookies['pn_admin'];

  const admin = adminToken ? await verifyJWT(adminToken, env.JWT_SECRET) : null;

  if (view === 'login' || !admin) {
    return renderAdminLogin();
  }

  // Authenticated → render dashboard
  const pages = await listPages(env.KV);
  const globalSettings = await getGlobalSettings(env.KV);
  return renderAdminDashboard(pages, globalSettings);
}


// ─── Admin API Router ────────────────────────────────────────

export async function handleAdminApi(request, env, path, method) {
  // Unauthenticated routes
  if (path === '/atmin/api/login' && method === 'POST') {
    return handleAdminLogin(request, env);
  }
  if (path === '/atmin/api/forgot-password' && method === 'POST') {
    return handleForgotPassword(request, env);
  }
  if (path === '/atmin/api/verify-recovery' && method === 'POST') {
    return handleVerifyRecovery(request, env);
  }
  if (path === '/atmin/api/reset-password' && method === 'POST') {
    return handleResetPassword(request, env);
  }

  if (path === '/atmin/api/logout' && method === 'POST') {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': Router.deleteCookie('pn_admin'),
      },
    });
  }

  // All other admin APIs need auth
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const adminToken = cookies['pn_admin'];
  const admin = adminToken ? await verifyJWT(adminToken, env.JWT_SECRET) : null;

  if (!admin) {
    return Router.jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  // Route to specific handler
  if (path === '/atmin/api/pages' && method === 'GET') {
    return handleListPages(env);
  }
  if (path === '/atmin/api/pages' && method === 'POST') {
    return handleSavePage(request, env);
  }
  if (path === '/atmin/api/pages' && method === 'DELETE') {
    return handleDeletePage(request, env);
  }
  if (path === '/atmin/api/delete-page' && method === 'POST') {
    return handleDeletePage(request, env);
  }
  if (path.startsWith('/atmin/api/page/') && method === 'GET') {
    const email = decodeURIComponent(path.replace('/atmin/api/page/', ''));
    return handleGetPage(env, email);
  }
  if (path === '/atmin/api/set-password' && method === 'POST') {
    return handleSetPassword(request, env);
  }
  if (path === '/atmin/api/settings' && method === 'POST') {
    return handleSaveSettings(request, env);
  }
  if (path === '/atmin/api/settings' && method === 'GET') {
    return handleGetSettings(env);
  }

  return Router.jsonResponse({ error: 'Not found' }, 404);
}


// ─── Admin Login ─────────────────────────────────────────────

async function handleAdminLogin(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.password) {
    return Router.jsonResponse({ success: false, error: 'Password wajib diisi' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Brute force check
  const blocked = await checkBruteForce(env.KV, ip, 'admin');
  if (blocked) {
    return Router.jsonResponse({ success: false, error: 'Terlalu banyak percobaan gagal. Coba lagi dalam 30 menit.' }, 429);
  }

  // Check KV-stored admin password first, then fallback to env
  const inputHash = await sha256(body.password);
  const settings = await getGlobalSettings(env.KV);
  const storedHash = settings.admin_password_hash || null;
  const envHash = await sha256(env.ADMIN_PASSWORD || '');

  const validPassword = storedHash
    ? (inputHash === storedHash)
    : (inputHash === envHash);

  if (!validPassword) {
    await recordFailedAttempt(env.KV, ip, 'admin');
    return Router.jsonResponse({ success: false, error: 'Password salah' }, 401);
  }

  // Success → issue JWT
  await clearFailedAttempts(env.KV, ip, 'admin');
  const token = await signJWT({ role: 'admin' }, env.JWT_SECRET, 28800); // 8 hours

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': Router.buildCookie('pn_admin', token, { maxAge: 28800, path: '/' }),
    },
  });
}


// ─── Forgot Password ─────────────────────────────────────────

async function handleForgotPassword(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Rate limit: max 3 recovery attempts per 10 minutes
  const rlKey = `recovery_rl:${ip}`;
  const rlRaw = await env.KV.get(rlKey);
  if (rlRaw) {
    const rlData = JSON.parse(rlRaw);
    if (rlData.count >= 3) {
      return Router.jsonResponse({ success: false, error: 'Terlalu banyak permintaan. Coba lagi dalam 10 menit.' }, 429);
    }
    rlData.count++;
    await env.KV.put(rlKey, JSON.stringify(rlData), { expirationTtl: 600 });
  } else {
    await env.KV.put(rlKey, JSON.stringify({ count: 1 }), { expirationTtl: 600 });
  }

  // Get recovery email from settings
  const settings = await getGlobalSettings(env.KV);
  const recoveryEmail = settings.recovery_email;

  if (!recoveryEmail) {
    return Router.jsonResponse({ success: false, error: 'Recovery email belum dikonfigurasi di Settings admin.' }, 400);
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await sha256(code);

  // Store code in KV with 10-minute TTL
  await env.KV.put('recovery:code', JSON.stringify({
    hash: codeHash,
    created_at: Date.now(),
    attempts: 0,
  }), { expirationTtl: 600 });

  // Send email via the first available configured account (Graph API)
  const emailSent = await sendRecoveryEmail(env, recoveryEmail, code);

  if (!emailSent) {
    return Router.jsonResponse({ success: false, error: 'Gagal mengirim email. Pastikan ada akun email yang dikonfigurasi.' }, 500);
  }

  // Mask email for frontend hint
  const parts = recoveryEmail.split('@');
  const masked = parts[0].substring(0, 2) + '***@' + parts[1];

  return Router.jsonResponse({ success: true, email_hint: masked });
}


async function handleVerifyRecovery(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.code) {
    return Router.jsonResponse({ success: false, error: 'Kode wajib diisi' }, 400);
  }

  const codeRaw = await env.KV.get('recovery:code');
  if (!codeRaw) {
    return Router.jsonResponse({ success: false, error: 'Kode expired. Kirim ulang.' }, 400);
  }

  const codeData = JSON.parse(codeRaw);

  // Max 5 verify attempts
  if (codeData.attempts >= 5) {
    await env.KV.delete('recovery:code');
    return Router.jsonResponse({ success: false, error: 'Terlalu banyak percobaan salah. Kirim kode baru.' }, 429);
  }

  const inputHash = await sha256(body.code.trim());

  if (inputHash !== codeData.hash) {
    codeData.attempts++;
    await env.KV.put('recovery:code', JSON.stringify(codeData), { expirationTtl: 600 });
    return Router.jsonResponse({ success: false, error: 'Kode salah. Sisa percobaan: ' + (5 - codeData.attempts) }, 401);
  }

  // Code valid → generate reset token
  const resetToken = crypto.randomUUID();
  await env.KV.put('recovery:reset_token', JSON.stringify({
    token: resetToken,
    created_at: Date.now(),
  }), { expirationTtl: 300 }); // 5-minute TTL

  // Delete the code
  await env.KV.delete('recovery:code');

  return Router.jsonResponse({ success: true, reset_token: resetToken });
}


async function handleResetPassword(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.reset_token || !body.new_password) {
    return Router.jsonResponse({ success: false, error: 'Data tidak lengkap' }, 400);
  }

  if (body.new_password.length < 4) {
    return Router.jsonResponse({ success: false, error: 'Password minimal 4 karakter' }, 400);
  }

  // Verify reset token
  const tokenRaw = await env.KV.get('recovery:reset_token');
  if (!tokenRaw) {
    return Router.jsonResponse({ success: false, error: 'Reset token expired. Ulangi proses recovery.' }, 400);
  }

  const tokenData = JSON.parse(tokenRaw);
  if (tokenData.token !== body.reset_token) {
    return Router.jsonResponse({ success: false, error: 'Reset token tidak valid.' }, 400);
  }

  // Set new password in KV (overrides env.ADMIN_PASSWORD)
  const newHash = await sha256(body.new_password);
  const settings = await getGlobalSettings(env.KV);
  await saveGlobalSettings(env.KV, {
    ...settings,
    admin_password_hash: newHash,
  });

  // Cleanup
  await env.KV.delete('recovery:reset_token');

  return Router.jsonResponse({ success: true });
}


// ─── Send Recovery Email via Graph API ───────────────────────

async function sendRecoveryEmail(env, toEmail, code) {
  try {
    // Get first available configured email account to use as sender
    const pages = await listPages(env.KV);
    let senderConfig = null;

    for (const page of pages) {
      if (page.has_config) {
        const config = await getConfig(env.KV, page.email, env.ENCRYPTION_KEY);
        if (config && config.refresh_token && config.client_id) {
          senderConfig = config;
          break;
        }
      }
    }

    if (!senderConfig) return false;

    // Refresh OAuth2 token
    const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
    const tokenBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: senderConfig.refresh_token,
      client_id: senderConfig.client_id,
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) return false;

    // Send email via Graph API
    const sendRes = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `PasteNote Recovery Code: ${code}`,
          body: {
            contentType: 'HTML',
            content: `
              <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8f7f4;border-radius:12px">
                <h2 style="color:#1a1a18;margin:0 0 8px">PasteNote Admin Recovery</h2>
                <p style="color:#666;margin:0 0 24px;font-size:14px">Kode recovery admin panel kamu:</p>
                <div style="background:#1a1a18;color:#E8E2D8;padding:20px;border-radius:8px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;font-family:monospace">${code}</div>
                <p style="color:#999;margin:16px 0 0;font-size:12px">Kode berlaku 10 menit. Jika bukan kamu yang meminta, abaikan email ini.</p>
              </div>
            `,
          },
          toRecipients: [{
            emailAddress: { address: toEmail },
          }],
        },
        saveToSentItems: false,
      }),
    });

    return sendRes.ok || sendRes.status === 202;
  } catch (err) {
    console.error('Send recovery email error:', err);
    return false;
  }
}


// ─── CRUD Pages ──────────────────────────────────────────────

async function handleListPages(env) {
  const pages = await listPages(env.KV);
  return Router.jsonResponse({ success: true, pages });
}

async function handleGetPage(env, email) {
  const page = await getPage(env.KV, email);
  if (!page) {
    return Router.jsonResponse({ success: false, error: 'Halaman tidak ditemukan' }, 404);
  }
  return Router.jsonResponse({ success: true, page });
}

async function handleSavePage(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email) {
    return Router.jsonResponse({ success: false, error: 'Email wajib diisi' }, 400);
  }

  if (!body.email.includes('@')) {
    return Router.jsonResponse({ success: false, error: 'Format email tidak valid' }, 400);
  }

  const pageData = {
    note: body.note,
    inbox_enabled: body.inbox_enabled,
  };

  const page = await savePage(env.KV, body.email, pageData);

  if (body.password && body.password.trim()) {
    await setPagePassword(env.KV, body.email, body.password.trim());
  }

  if (body.config && body.config.trim()) {
    try {
      await saveConfig(env.KV, body.email, body.config, env.ENCRYPTION_KEY);
    } catch (err) {
      return Router.jsonResponse({ success: false, error: `Config error: ${err.message}` }, 400);
    }
  }

  return Router.jsonResponse({ success: true, page });
}

async function handleDeletePage(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email) {
    return Router.jsonResponse({ success: false, error: 'Email wajib diisi' }, 400);
  }

  await deletePage(env.KV, body.email);
  return Router.jsonResponse({ success: true });
}


// ─── Set Visitor Password ────────────────────────────────────

async function handleSetPassword(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email || !body.password) {
    return Router.jsonResponse({ success: false, error: 'Email dan password wajib diisi' }, 400);
  }

  const page = await getPage(env.KV, body.email);
  if (!page) {
    return Router.jsonResponse({ success: false, error: 'Halaman tidak ditemukan' }, 404);
  }

  await setPagePassword(env.KV, body.email, body.password);
  await invalidateSessionsForEmail(env.KV, body.email);

  return Router.jsonResponse({ success: true, message: 'Password berhasil diubah' });
}


// ─── Global Settings ─────────────────────────────────────────

async function handleGetSettings(env) {
  const settings = await getGlobalSettings(env.KV);
  return Router.jsonResponse({ success: true, settings });
}

async function handleSaveSettings(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return Router.jsonResponse({ success: false, error: 'Data tidak valid' }, 400);
  }

  const current = await getGlobalSettings(env.KV);

  // Build updated settings
  const updated = { ...current };

  // Default note
  if (body.default_note !== undefined) {
    updated.default_note = body.default_note;
  }

  // Recovery email
  if (body.recovery_email !== undefined) {
    updated.recovery_email = body.recovery_email;
  }

  // General visitor password
  if (body.general_password !== undefined) {
    updated.general_password = body.general_password; // plaintext for display
    if (body.general_password) {
      updated.general_password_hash = await sha256(body.general_password);
    } else {
      updated.general_password_hash = null;
    }
  }

  // Admin password change (from Settings tab, requires current password verification)
  if (body.new_admin_password && body.current_admin_password) {
    const currentInputHash = await sha256(body.current_admin_password);
    const storedHash = current.admin_password_hash || null;
    const envHash = await sha256(env.ADMIN_PASSWORD || '');

    const validCurrent = storedHash
      ? (currentInputHash === storedHash)
      : (currentInputHash === envHash);

    if (!validCurrent) {
      return Router.jsonResponse({ success: false, error: 'Password lama salah' }, 401);
    }

    updated.admin_password_hash = await sha256(body.new_admin_password);
  }

  await saveGlobalSettings(env.KV, updated);
  return Router.jsonResponse({ success: true });
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
