import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

// ─── Content Security Policy ───────────────────────────────────────────────────
// Tightly scoped to the third-party domains this app actually uses.
// 'unsafe-inline' for styles is required by Tailwind CSS and Clerk's widget.
// 'unsafe-inline' for scripts is required by Next.js inline hydration chunks.
// TODO: migrate to nonces for scripts (https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
const CSP = [
  "default-src 'self'",
  // Next.js hydration + Clerk widget + Stripe.js
  // 'unsafe-eval' is required in dev for Next.js Fast Refresh / HMR — omitted in production.
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"} https://js.stripe.com https://checkout.stripe.com https://clerk.com https://*.clerk.com https://*.clerk.accounts.dev`,
  // Tailwind / Clerk widget inline styles
  "style-src 'self' 'unsafe-inline'",
  // User avatars from Clerk, Stripe images
  "img-src 'self' data: blob: https://img.clerk.com https://*.stripe.com https://images.clerk.dev",
  // Self-hosted fonts
  "font-src 'self' data:",
  // Stripe checkout/billing iframes
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://billing.stripe.com https://hooks.stripe.com",
  // API calls from browser: Clerk, Stripe
  "connect-src 'self' https://*.clerk.com https://clerk.com wss://*.clerk.com https://clerk.accounts.dev https://*.clerk.accounts.dev https://api.stripe.com https://checkout.stripe.com https://errors.stripe.com",
  // Audio/video blobs (podcast player uses URL.createObjectURL on ElevenLabs response)
  "media-src 'self' blob:",
  // Web workers used by Next.js
  "worker-src 'self' blob:",
  // Block <object> / <embed>
  "object-src 'none'",
  // Prevent base-tag injection attacks
  "base-uri 'self'",
  // Only allow form submissions to own origin and Stripe checkout
  "form-action 'self' https://checkout.stripe.com",
  // Prevent this page from being framed (supersedes X-Frame-Options for modern browsers)
  "frame-ancestors 'none'",
  // upgrade-insecure-requests: production only — on localhost (HTTP) this causes Safari
  // to upgrade all CSS/JS/font requests to HTTPS, breaking the dev server entirely.
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join('; ');

// ─── Security Headers ──────────────────────────────────────────────────────────
const securityHeaders = [
  { key: 'Content-Security-Policy',   value: CSP },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Kept for older UAs; CSP frame-ancestors 'none' above covers modern browsers.
  { key: 'X-Frame-Options',           value: 'DENY' },
  // X-XSS-Protection is deprecated and can introduce vulns — explicitly disabled.
  { key: 'X-XSS-Protection',         value: '0' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // HSTS: production only — sending this on localhost causes Safari to permanently
  // force HTTPS for localhost, breaking the HTTP dev server for up to 1 year.
  // Chrome exempts localhost from HSTS; Safari does not.
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

// ─── Next.js Config ────────────────────────────────────────────────────────────
const nextConfig: NextConfig = {
  // SECURITY NOTE: ignoreBuildErrors and ignoreDuringBuilds have been intentionally
  // removed. Type errors and lint errors can mask security-critical bugs.
  // The project compiled cleanly with tsc --noEmit before this change.
  // Fix any new type/lint errors before deploying.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
