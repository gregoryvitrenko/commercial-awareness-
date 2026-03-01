# Commercial Awareness Daily

A personal morning briefing site for LLB students targeting Magic Circle, Silver Circle, and elite US law firms. Runs as a Next.js app with a daily Claude-powered news digest.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 3. Run locally
npm run dev
# → Open http://localhost:3000
```

The sample briefing for 2026-03-01 is pre-seeded so the site loads immediately.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `ANTHROPIC_MODEL` | No | Model override (default: `claude-opus-4-6`) |
| `USE_WEB_SEARCH` | No | Set to `false` to disable web search (default: `true`) |
| `CRON_SECRET` | No | Secret for securing the cron endpoint |

## Generating Briefings

**Manually (via UI):** The homepage shows a "Generate briefing" button when today's briefing hasn't been created yet.

**Via API:**
```bash
# Generate today's briefing
curl -X POST http://localhost:3000/api/generate

# Force regenerate (even if one exists)
curl -X POST "http://localhost:3000/api/generate?force=true"
```

**Automatically at 08:30 GMT:** Deploy to Vercel and the `vercel.json` cron job handles this.

## Deployment

### Local / Self-Hosted (Recommended)

The simplest option — run on a VPS (Hetzner, DigitalOcean, etc.) with a system cron job:

```bash
npm run build
npm run start
```

Add to crontab (`crontab -e`):
```
30 8 * * * curl -X POST http://localhost:3000/api/generate >> /var/log/briefing.log 2>&1
```

### Vercel

1. Push to GitHub and connect to Vercel
2. Add `ANTHROPIC_API_KEY` and `CRON_SECRET` in Vercel environment variables
3. The `vercel.json` cron runs at 08:30 GMT automatically

> **Note:** Vercel's serverless filesystem is ephemeral — briefing JSON files won't persist across deployments. For persistent storage on Vercel, replace `lib/storage.ts` with a Vercel Blob or KV implementation. See the storage section below.

### Persistent Storage on Vercel

Replace `lib/storage.ts` with a Vercel Blob implementation:

```bash
npm install @vercel/blob
```

The storage interface (`saveBriefing`, `getBriefing`, `listBriefings`, `getLatestBriefing`) is isolated in `lib/storage.ts` — swap the implementation without touching anything else.

## Architecture

```
app/
  page.tsx                 ← Homepage (today's briefing or latest)
  archive/page.tsx         ← Date list
  archive/[date]/page.tsx  ← Past briefing
  api/generate/route.ts    ← POST/GET endpoint for generation

components/
  Header.tsx               ← Sticky header with date + nav
  BriefingView.tsx         ← Full briefing layout
  StoryCard.tsx            ← Individual story card
  SectorWatch.tsx          ← Sector Watch + One to Follow
  CopyButton.tsx           ← Clipboard copy (client)
  ThemeToggle.tsx          ← Dark/light toggle (client)
  GenerateButton.tsx       ← Manual generation trigger (client)

lib/
  types.ts                 ← Shared types + topic colour config
  storage.ts               ← Filesystem read/write for briefings
  generate.ts              ← Anthropic API + web search

data/briefings/
  YYYY-MM-DD.json          ← One file per day
```
