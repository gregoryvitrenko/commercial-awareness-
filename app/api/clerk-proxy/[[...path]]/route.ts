import { NextRequest, NextResponse } from 'next/server';

// Proxy all Clerk Frontend API requests through our domain to avoid
// Cloudflare cross-account conflict (both folioapp.co.uk and Clerk use Cloudflare).
// /__clerk/* is rewritten to /api/clerk-proxy/* by next.config.ts,
// then this route forwards to the Clerk Frontend API.
//
// Target: decoded from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY → clerk.folioapp.co.uk
// This is the correct target — TLS SNI = clerk.folioapp.co.uk routes to the
// correct Clerk instance. Do NOT override with frontend-api.clerk.services:
// that generic endpoint blocks server-to-server requests from Vercel (Cloudflare
// firewall on their shared infrastructure). The custom domain CNAME is the
// correct egress path from Vercel's AWS-backed servers.

/**
 * Decode the Clerk Frontend API URL from the publishable key.
 * Returns e.g. https://clerk.folioapp.co.uk
 */
function getClerkFrontendApi(): string {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be set');

  const encoded = key.replace(/^pk_(test|live)_/, '');
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8').replace(/\$$/, '');
  return `https://${decoded}`;
}

async function handler(request: NextRequest) {
  try {
    const clerkApi = getClerkFrontendApi();
    const url = new URL(request.url);
    console.log('[clerk-proxy] target:', clerkApi, '| path:', url.pathname);
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

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const res = await fetch(target, {
      method: request.method,
      headers,
      body: body ? Buffer.from(body) : undefined,
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
    const cause = (err as { cause?: { message?: string; code?: string } })?.cause;
    console.error('[clerk-proxy] error:', err, '| cause:', cause?.message, cause?.code);
    return NextResponse.json(
      { error: 'Clerk proxy error', detail: String(err), cause: cause?.message, code: cause?.code },
      { status: 502 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
