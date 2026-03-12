---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Content & Reach
status: planning
stopped_at: Completed 12-digest-compliance 12-03-PLAN.md
last_updated: "2026-03-12T03:15:22.831Z"
last_activity: 2026-03-10 — v1.1 roadmap created; phases 7-12 defined
progress:
  total_phases: 12
  completed_phases: 11
  total_plans: 30
  completed_plans: 30
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-10)

**Core value:** Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.
**Current focus:** Milestone v1.1 — Content & Reach (Phase 7: Mobile + Header Polish)

## Current Position

Phase: 7 of 12 (Mobile + Header Polish)
Plan: — (not yet planned)
Status: Ready to plan
Last activity: 2026-03-10 — v1.1 roadmap created; phases 7-12 defined

Progress: [░░░░░░░░░░] 0% (v1.1 phases)

## Performance Metrics

**Velocity (v1.0 reference):**
- Total plans completed: 17 (v1.0)
- Average duration: ~4 tasks/plan
- Total execution time: v1.0 complete

**v1.1 By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 7. Mobile + Header Polish | TBD | - | - |
| 8. Firms Expansion | TBD | - | - |
| 9. Podcast Archive | TBD | - | - |
| 10. Primer Interview Questions | TBD | - | - |
| 11. Events Section | TBD | - | - |
| 12. Digest Compliance | TBD | - | - |

*Updated after each plan completion*
| Phase 07-mobile-header-polish P03 | 1 | 1 tasks | 2 files |
| Phase 07-mobile-header-polish P01 | 1 | 1 tasks | 1 files |
| Phase 07-mobile-header-polish P02 | 1 | 2 tasks | 2 files |
| Phase 08-firms-expansion P01 | 20 | 3 tasks | 6 files |
| Phase 09-podcast-archive P01 | 8 | 2 tasks | 2 files |
| Phase 11-events-section P01 | 108s | 3 tasks | 3 files |
| Phase 11-events-section P02 | 3min | 1 tasks | 1 files |
| Phase 11-events-section P03 | 5min | 2 tasks | 5 files |
| Phase 12-digest-compliance P01 | 8min | 2 tasks | 3 files |
| Phase 12-digest-compliance P02 | 12min | 2 tasks | 2 files |
| Phase 12-digest-compliance P03 | 4min | 2 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v1.1 Roadmap: INFRA-01 (Vercel Blob) grouped with PODCAST-01 in Phase 9 — infrastructure prerequisite and the feature it enables ship together; avoids a phase that delivers only env var setup
- v1.1 Roadmap: Phase 12 (Digest) listed as depending on Phase 11 (Events) — events integration in digest is optional but digest ships after events to enable that integration if desired
- v1.1 Roadmap: DIGEST-01 and DIGEST-02 are in the same phase — unsubscribe endpoint must ship in the same deployment as the first digest send (GDPR/PECR legal requirement)
- v1.1 Roadmap: Primer interview questions must be manually authored — AI-generated questions have no edge over free resources and are explicitly out of scope in REQUIREMENTS.md
- [Phase 06-bug-fixes-content-quality]: isClosed uses ISO string comparison (deadline.closeDate < today) — YYYY-MM-DD strings compare lexicographically so no Date parsing needed
- [Phase 06-bug-fixes-content-quality]: BUG-01/02/03 confirmed fixed visually on production folioapp.co.uk; QUAL-01/02 prompt changes confirmed in source
- [Phase 07-mobile-header-polish]: Two wrappers require min-w-0: the direct grid child div in StoryGrid and the outermost card div in StoryCard — both must be present for the CSS Grid overflow fix to work at 375px
- [Phase 07-mobile-header-polish]: CSS custom property --paper stores bare HSL channels only; Tailwind hsl(var()) wrapper must not be duplicated in the variable value
- [Phase 07-mobile-header-polish]: MOBILE_NAV_LINKS defined in Header.tsx (not imported from NavDropdowns) to avoid circular dependency; pointerdown replaces mousedown in NavDropdowns for touch support
- [Phase 08-firms-expansion]: Jones Day seats:4 with non-rotational note in intakeSizeNote
- [Phase 08-firms-expansion]: TC salaries for CMS/Addleshaw/Pinsent Masons use conservative placeholder ~£40k-£46k pending The Trackr verification
- [Phase 08-firms-expansion]: DLA Piper classified as US Firms tier (amber accent) to match Folio taxonomy and £130k NQ salary
- [Phase 08-firms-expansion]: New National tier (rose accent) created for Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons — user reclassified from Silver Circle during human verification; 6 components updated (lib/types.ts, lib/firms-data.ts, FirmCard, FirmsDirectory, TrackerDashboard, firm page)
- [Phase 09-podcast-archive]: backfillQuizIndex() no-op when useRedis()=false; nx:true on zadd ensures idempotent backfill; Upstash scan cursor coerced via Number() before comparing to 0
- [Phase 11-events-section]: Past events filtered at retrieval time via YYYY-MM-DD string comparison (no Redis TTL) — consistent with Phase 06 isClosed pattern
- [Phase 11-events-section]: No TTL on events:current Redis key — events refreshed weekly by Monday cron, stale data preferred over no data
- [Phase 11-events-section]: Single GET handler branches on format=ics+id vs cron — consistent with codebase patterns, no requireSubscription (events free tier)
- [Phase 11-events-section]: Events placed in Daily nav dropdown alongside Briefing and Podcast — CalendarDays icon used to avoid clash with Calendar icon for Briefings archive
- [Phase 12-digest-compliance]: CRON_SECRET reused as HMAC signing key for unsubscribe URLs — avoids new env var, throws at build time if missing to prevent silent unsigned links
- [Phase 12-digest-compliance]: Redis opt-out key email-opt-out:{email} has no TTL — permanent opt-out is correct GDPR behaviour; checked by Plan 02 before each digest send
- [Phase Phase 12-digest-compliance]: sendWeeklyDigest subject param supplied by caller so Haiku generation stays in route layer, keeping email.ts stateless
- [Phase Phase 12-digest-compliance]: Story de-dup uses 5-word headline fingerprint — DigestStory has no firms field; fingerprint handles same-deal coverage across briefing days
- [Phase Phase 12-digest-compliance]: Referral reward at every 3rd referral (newCount % 3 === 0) — milestone-based so referrers keep sharing; fresh Stripe coupon per reward (max_redemptions: 1)
- [Phase Phase 12-digest-compliance]: ReferralTracker validates ?ref= as /^[0-9a-f]{8}$/ before setting cookie — prevents injection; subscriber list refactored to {email, customerId}[] to avoid extra Redis query per digest send

### Pending Todos

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Phase 10 primer interview questions | 2026-03-10 | 59b58ed | [1-phase-10-primer-interview-questions](./quick/1-phase-10-primer-interview-questions/) |

### Blockers/Concerns

- Phase 9 risk: Vercel Blob store must be created in Vercel dashboard and BLOB_READ_WRITE_TOKEN set before podcast archive ships — without it every archive play burns ~2,800 ElevenLabs chars; five users browsing 7 past episodes exhausts the 100k/month budget
- Phase 11 risk: ical-generator package version and Europe/London TZID API must be verified at implementation time — training knowledge cutoff is August 2025
- Phase 12 risk: Digest unsubscribe (DIGEST-02) is a legal prerequisite — must ship in same deployment as DIGEST-01; never ship digest activation without working unsubscribe
- Known issue: `app/api/generate/route.ts:16` has hardcoded fallback ADMIN_USER_ID — unrelated to v1.1 but should be cleaned up

## Session Continuity

Last session: 2026-03-12T02:51:52.596Z
Stopped at: Completed 12-digest-compliance 12-03-PLAN.md
Resume file: None
