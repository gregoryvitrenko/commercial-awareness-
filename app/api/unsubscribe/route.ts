import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function useRedis(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  const { Redis } = require('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * GET /api/unsubscribe?email=...&sig=...
 *
 * HMAC-validates the unsubscribe token and sets `email-opt-out:{email}` in Redis.
 * Redirects to /unsubscribe?success=1 on success, /unsubscribe?error=invalid otherwise.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const sig = searchParams.get('sig');

  const INVALID = NextResponse.redirect(new URL('/unsubscribe?error=invalid', req.url));

  // Basic presence + format validation
  if (!email || !sig || sig.length !== 64) {
    return INVALID;
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[unsubscribe] CRON_SECRET env var not set');
    return INVALID;
  }

  // Timing-safe HMAC comparison
  let valid = false;
  try {
    const expected = crypto.createHmac('sha256', secret).update(email).digest('hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf = Buffer.from(sig, 'hex');
    // Buffers must be same length for timingSafeEqual
    if (expectedBuf.length === actualBuf.length) {
      valid = crypto.timingSafeEqual(expectedBuf, actualBuf);
    }
  } catch {
    valid = false;
  }

  if (!valid) {
    return INVALID;
  }

  // Set opt-out key in Redis (no TTL — permanent until manually removed)
  if (useRedis()) {
    try {
      const redis = getRedis();
      await redis.set(`email-opt-out:${email.toLowerCase()}`, '1');
    } catch (err) {
      console.error('[unsubscribe] Redis set failed:', err);
      // Still redirect to success — opt-out intent recorded in logs; do not block user
    }
  } else {
    console.warn('[unsubscribe] Redis not configured — opt-out not persisted');
  }

  return NextResponse.redirect(new URL('/unsubscribe?success=1', req.url));
}
