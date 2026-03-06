import { NextRequest, NextResponse } from 'next/server';

// Proxy all Clerk Frontend API requests through our domain to avoid
// Cloudflare cross-account conflict (both folioapp.co.uk and Clerk use Cloudflare).
// /__clerk/* is rewritten to /api/clerk-proxy/* by next.config.ts,
// then this route forwards to the Clerk Frontend API.

/**
 * Decode the Clerk publishable key to extract the Frontend API URL.
 * Key format: pk_(test|live)_<base64(instance-slug.clerk.accounts.dev$)>
 */
function getClerkFrontendApi(): string {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set');

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
