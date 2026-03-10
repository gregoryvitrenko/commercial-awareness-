---
phase: 9
slug: podcast-archive
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test runner configured in this project |
| **Config file** | none |
| **Quick run command** | N/A — manual smoke tests only (per CLAUDE.md: API routes require live Vercel infra) |
| **Full suite command** | N/A |
| **Estimated runtime** | ~5 min manual verification on production |

---

## Sampling Rate

- **After every task commit:** TypeScript compile check — `npx tsc --noEmit`
- **After every plan wave:** Manual smoke test on production (see Per-Task Verification Map)
- **Before `/gsd:verify-work`:** All manual smoke tests must pass
- **Max feedback latency:** ~5 min (deploy + smoke test)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Manual Steps | Status |
|---------|------|------|-------------|-----------|-------------------|--------------|--------|
| 9-01-01 | 01 | 1 | (quiz backfill) | smoke | `npx tsc --noEmit` | POST `/api/admin/backfill-quiz`, verify `{ backfilled: N }` where N > 0 | ⬜ pending |
| 9-01-02 | 01 | 1 | (quiz archive) | smoke | `npx tsc --noEmit` | Visit `/quiz/archive` — verify old dates (pre-Phase-6) appear in list | ⬜ pending |
| 9-02-01 | 02 | 1 | PODCAST-01 | smoke | `npx tsc --noEmit` | Visit `/podcast/archive` — verify pre-Blob dates appear; verify play button only on cached dates | ⬜ pending |
| 9-02-02 | 02 | 1 | INFRA-01 | smoke | `npx tsc --noEmit` | Verify Blob backend active: check Vercel env vars panel for `BLOB_READ_WRITE_TOKEN` | ⬜ pending |
| 9-03-01 | 03 | 2 | (cron pre-gen) | smoke | `npx tsc --noEmit` | After 06:00 UTC cron: immediately call `GET /api/podcast-audio?date=today` — should return cached MP3 without triggering TTS | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no automated test infrastructure required for this phase. All verification is manual smoke testing on production, consistent with prior phases in this project (per CLAUDE.md: API routes require live Vercel infra — Redis, Blob, ElevenLabs — and cannot be verified locally).

*Existing infrastructure covers all phase requirements via TypeScript compile + manual smoke tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Quiz backfill populates `quiz:index` | (quiz archive fix) | Requires Redis write + Vercel deploy; no local Redis in dev | POST `/api/admin/backfill-quiz` as admin user; check response `{ backfilled: N }` |
| `/quiz/archive` shows pre-Phase-6 dates | (quiz archive fix) | Requires live Redis data | Visit `/quiz/archive` after backfill; verify old dates visible |
| `/podcast/archive` shows pre-Blob dates | PODCAST-01 | Requires live Redis + Blob; local dev has no old `podcast-script:*` keys | Visit `/podcast/archive` in production; verify episodes before Blob activation appear |
| Play button absent for script-only dates | PODCAST-01 | Requires both Redis script keys and Blob listing | Verify play button only appears on dates with confirmed MP3; no button on script-only dates |
| Cron pre-generates MP3 at 06:00 UTC | (cron pre-gen) | Requires real cron execution + ElevenLabs budget | Day after deploy: at 06:05 UTC check `/podcast/archive` — today's date should have play button before any user visits |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: TypeScript compile after every task commit
- [ ] Wave 0 covers all MISSING references (N/A — no missing references)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5 min (deploy + smoke test)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
