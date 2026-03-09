# Technology Stack

**Analysis Date:** 2026-03-09

## Languages

**Primary:**
- TypeScript 5 — all application code (`app/`, `lib/`, `components/`)

**Secondary:**
- CSS (Tailwind utility classes) — all styling via `app/globals.css` + Tailwind config

## Runtime

**Environment:**
- Node.js (runtime target: ES2017, Next.js server-side)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 15.5.12 (App Router) — full-stack framework, server components, API routes
- React 19.0.0 — UI rendering
- Tailwind CSS 3.4.17 — utility-first styling, stone/zinc palette, dark mode via `class`

**Auth:**
- `@clerk/nextjs` 6.39.0 — `ClerkProvider` wraps `app/layout.tsx`, `clerkMiddleware` in `middleware.ts`

**Payments:**
- `stripe` 20.4.0 — server-side SDK for checkout session creation, webhook handling, subscription listing

**Theme:**
- `next-themes` 0.4.4 — light/dark mode, `defaultTheme="light"` via `app/providers.tsx`

**UI Components:**
- shadcn/ui (new-york style, stone base colour) — component primitives in `components/ui/`
- `class-variance-authority` 0.7.1 — component variant management
- `tailwind-merge` 3.5.0 — Tailwind class merging utility in `lib/utils.ts`
- `tailwindcss-animate` 1.0.7 — animation utilities, `fade-in` keyframe defined in `tailwind.config.ts`
- `lucide-react` 0.469.0 — icon library (size 16, `text-zinc-400` style convention)

**Email:**
- `resend` 6.9.3 — transactional email (welcome email + weekly digest)

**Storage:**
- `@upstash/redis` 1.34.3 — Redis HTTP client for production data storage
- `@vercel/blob` 2.3.1 — MP3 audio file storage in production

**Build/Dev:**
- TypeScript compiler `tsc` with strict mode, `noEmit`, `moduleResolution: bundler`
- ESLint 9 with `eslint-config-next` 15.1.3 — config in `.eslintrc.json`
- PostCSS 8 with autoprefixer — `postcss.config.mjs`

## Key Dependencies

**Critical:**
- `@anthropic-ai/sdk` 0.78.0 — AI text generation. Two models used:
  - `claude-sonnet-4-6` — briefing synthesis (`lib/generate.ts`), podcast script (`lib/podcast.ts`)
  - `claude-haiku-4-5-20251001` — quiz generation (`lib/quiz.ts`), aptitude banks (`lib/aptitude.ts`), firm packs (`lib/firm-pack.ts`)
- `@clerk/nextjs` 6.39.0 — authentication and session management across all routes
- `stripe` 20.4.0 — subscription payments at `price_1T6rKa3l9MshmbvXJQ5qATOU` (£4/month)
- `@upstash/redis` 1.34.3 — primary production data store (briefings, quizzes, subscriptions, rate limits, ElevenLabs usage tracking)
- `@vercel/blob` 2.3.1 — MP3 podcast audio storage in production

**Infrastructure:**
- `resend` 6.9.3 — welcome email on subscription activation, weekly digest every Sunday
- `clsx` 2.1.1 — className construction utility

## Fonts

Loaded via `next/font/google` in `app/layout.tsx`:
- **Playfair Display** — serif headings (`--font-serif`)
- **Inter** — body sans-serif (`--font-sans`)
- **JetBrains Mono** — monospace labels/UI elements (`--font-mono`)

## Configuration

**TypeScript:**
- `tsconfig.json` — strict mode on, path alias `@/*` maps to project root
- Target ES2017, `moduleResolution: bundler`, `isolatedModules: true`

**Tailwind:**
- `tailwind.config.ts` — darkMode class, custom font families, custom animation `fade-in`, shadcn CSS variable colours, topic colour safelist (8 topics × light + dark variants)

**Next.js:**
- `next.config.ts` — CSP headers scoped to all routes, `/__clerk` rewrite to `/api/clerk-proxy`, no `ignoreBuildErrors`

**ESLint:**
- `.eslintrc.json` — `next/core-web-vitals` ruleset, `react-hooks/rules-of-hooks` disabled for `lib/` directory

**shadcn:**
- `components.json` — new-york style, stone base colour, `@/components` alias, lucide icon library

**Cron:**
- `vercel.json` — two cron schedules:
  - `GET /api/generate` at `0 6 * * *` (daily 06:00 UTC)
  - `GET /api/digest` at `0 8 * * 0` (weekly Sunday 08:00 UTC)

**Environment:**
- `PREVIEW_MODE=true` in `.env.local` — bypasses all auth and subscription checks in dev. Guard in `lib/paywall.ts` throws fatal error if set in production.
- `USE_WEB_SEARCH=false` — disables Tavily search (uses Claude training data only)

## Platform Requirements

**Development:**
- Node.js with npm
- Dev server: `npm run dev` on port 3001 (ANTHROPIC_API_KEY is explicitly unset via `env -u`)
- No Redis required — all storage falls back to local filesystem under `data/`
- `PREVIEW_MODE=true` in `.env.local` bypasses Clerk auth and Stripe paywall

**Production:**
- Vercel Pro (required for 120s+ function timeout on ElevenLabs and 300s on generation/digest)
- Upstash Redis REST — detected via `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- Vercel Blob — detected via `BLOB_READ_WRITE_TOKEN` (note: not yet configured as of 2026-03-09)
- Domain: `www.folioapp.co.uk` (canonical), `folioapp.co.uk` 307-redirects to www

---

*Stack analysis: 2026-03-09*
