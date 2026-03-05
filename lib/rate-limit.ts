/**
 * lib/rate-limit.ts
 *
 * Simple fixed-window rate limiter built on the existing @upstash/redis package.
 * No extra dependencies required.
 *
 * In dev (no UPSTASH_ env vars): always allows — no Redis = no rate limiting.
 * In prod: uses Redis INCR + EXPIRE for atomic, distributed counting.
 *
 * Usage:
 *   const result = await rateLimit(userId, 'quiz', 20, 3600);
 *   if (!result.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 */

function useRedis(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp ms
}

/**
 * Fixed-window rate limiter.
 *
 * @param identifier  User ID, IP address, or any stable per-requester key.
 * @param route       Short route label for the Redis key namespace (e.g. 'quiz').
 * @param limit       Maximum requests allowed in the window.
 * @param windowSecs  Window size in seconds (default: 3600 = 1 hour).
 */
export async function rateLimit(
  identifier: string,
  route: string,
  limit: number,
  windowSecs = 3600,
): Promise<RateLimitResult> {
  // Fail-open in dev / no-Redis environments — never block local development
  if (!useRedis()) {
    return { success: true, remaining: limit, resetAt: 0 };
  }

  const redis = getRedis();

  // One window bucket per (route, identifier, clock-window)
  const window = Math.floor(Date.now() / (windowSecs * 1000));
  const key = `rl:${route}:${identifier}:${window}`;

  // INCR is atomic; returns the new count
  const count: number = await redis.incr(key);

  // Set TTL on first request in the window (subsequent calls are no-ops for TTL)
  if (count === 1) {
    await redis.expire(key, windowSecs + 5); // +5s safety margin
  }

  const remaining = Math.max(0, limit - count);
  const resetAt = (window + 1) * windowSecs * 1000;

  return { success: count <= limit, remaining, resetAt };
}

/**
 * Convenience wrapper that returns a 429 NextResponse if the limit is exceeded.
 * Returns null when the request is allowed (caller should proceed normally).
 *
 * Example:
 *   const limited = await checkRateLimit(userId, 'quiz', 20);
 *   if (limited) return limited;
 */
import { NextResponse } from 'next/server';

export async function checkRateLimit(
  identifier: string,
  route: string,
  limit: number,
  windowSecs = 3600,
): Promise<NextResponse | null> {
  const result = await rateLimit(identifier, route, limit, windowSecs);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      },
    );
  }
  return null;
}
