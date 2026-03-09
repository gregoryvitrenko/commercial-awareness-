import { NextRequest, NextResponse } from 'next/server';

// Proxy all Clerk Frontend API requests through our domain to avoid
// Cloudflare cross-account conflict (both folioapp.co.uk and Clerk use Cloudflare).
// /__clerk/* is rewritten to /api/clerk-proxy/* by next.config.ts,
// then this route forwards to the Clerk Frontend API.

/**
 * Get the Clerk Frontend API URL to proxy to.
 *
 * Priority:
 * 1. CLERK_PROXY_TARGET env var (the .clerk.accounts.dev URL for the new
 *    Clerk app that bypasses the Cloudflare cross-account conflict)
 * 2. Decoded from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (fallback)
 *
 * NOTE: We intentionally use CLERK_PROXY_TARGET (not CLERK_API_URL) because
 * the Clerk SDK reads CLERK_API_URL internally for server-side Backend API
 * calls (auth(), currentUser(), etc). Setting that to a Frontend API URL
 * would break all server-side auth. These are different Clerk services.
 */
function getClerkFrontendApi(): string {
  if (process.env.CLERK_PROXY_TARGET) {
    return process.env.CLERK_PROXY_TARGET.replace(/\/$/, '');
  }

  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) throw new Error('CLERK_PROXY_TARGET or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be set');

  const encoded = key.replace(/^pk_(test|live)_/, '');
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8').replace(/\$$/, '');
  return `https://${decoded}`;
}

async function handler(request: NextRequest) {
  try {
    const clerkApi = getClerkFrontendApi();
    const url = new URL(request.url);
    const clerkPath = url.pathname.replace(/^\/api\/clerk-proxy/, '') || '/';
    const target = `${clerkApi}${clerkPath}${url.search}`;

    // Build minimal set of safe headers to forward
    const headers = new Headers();
    const forwardHeaders = [
      'accept', 'accept-language', 'content-type', 'authorization',
      'cookie', 'origin', 'referer', 'user-agent',
    ];
    for (const name of forwardHeaders) {
      const val = request.headers.get(name);
      if (val) headers.set(name, val);
    }
    headers.set('Clerk-Proxy-Url', `${url.origin}/__clerk`);
    headers.set('X-Forwarded-Host', url.host);
    // Clerk requires the secret key when requests come through a proxy
    if (process.env.CLERK_SECRET_KEY) {
      headers.set('Clerk-Secret-Key', process.env.CLERK_SECRET_KEY);
    }

    const res = await fetch(target, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? request.body
        : undefined,
      // @ts-expect-error -- duplex is required for streaming request bodies
      duplex: 'half',
      redirect: 'manual',
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('transfer-encoding');

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[clerk-proxy] error:', err);
    return NextResponse.json(
      { error: 'Clerk proxy error', detail: String(err) },
      { status: 502 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
