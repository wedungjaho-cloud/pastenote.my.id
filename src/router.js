/**
 * ═══════════════════════════════════════════════════════════
 *  PasteNote — Router Utility
 *  Lightweight request context wrapper.
 * ═══════════════════════════════════════════════════════════
 */

export class Router {
  constructor(request, env, ctx) {
    this.request = request;
    this.env = env;
    this.ctx = ctx;
    this.url = new URL(request.url);
    this.path = this.url.pathname;
    this.method = request.method;
    this.query = Object.fromEntries(this.url.searchParams);
  }

  /**
   * Parse JSON body from request.
   * Returns parsed object or null on failure.
   */
  async json() {
    try {
      return await this.request.json();
    } catch {
      return null;
    }
  }

  /**
   * Get a specific cookie value from the request.
   */
  getCookie(name) {
    const cookieHeader = this.request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );
    return cookies[name] || null;
  }

  /**
   * Get client IP address (Cloudflare header).
   */
  getClientIP() {
    return this.request.headers.get('CF-Connecting-IP') || 'unknown';
  }

  /**
   * Create a JSON response.
   */
  static jsonResponse(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...extraHeaders,
      },
    });
  }

  /**
   * Create an HTML response.
   */
  static htmlResponse(html, status = 200, extraHeaders = {}) {
    return new Response(html, {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...extraHeaders,
      },
    });
  }

  /**
   * Create a redirect response.
   */
  static redirect(url, status = 302) {
    return new Response(null, {
      status,
      headers: { Location: url },
    });
  }

  /**
   * Build a Set-Cookie header string.
   */
  static buildCookie(name, value, options = {}) {
    const parts = [`${name}=${value}`];
    if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
    if (options.path) parts.push(`Path=${options.path}`);
    parts.push('HttpOnly');
    parts.push('Secure');
    parts.push('SameSite=Strict');
    return parts.join('; ');
  }

  /**
   * Build a delete-cookie header (expire immediately).
   */
  static deleteCookie(name, path = '/') {
    return `${name}=; Max-Age=0; Path=${path}; HttpOnly; Secure; SameSite=Strict`;
  }
}
