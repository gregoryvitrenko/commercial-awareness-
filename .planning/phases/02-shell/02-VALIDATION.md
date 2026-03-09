---
phase: 2
slug: shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler + Next.js build |
| **Config file** | `tsconfig.json` / `next.config.ts` |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30 seconds (tsc) / ~60 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | SHELL-01 | build | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 2-01-02 | 01 | 1 | SHELL-01 | build | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 2-01-03 | 01 | 1 | SHELL-02 | build | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 2-01-04 | 01 | 1 | SHELL-02 | build | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test stubs required — the TypeScript compiler and Next.js build are the primary gates for a component-editing phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Footer pins to bottom on short pages | SHELL-02 | CSS flex layout — requires browser rendering at 375px viewport | Open `/upgrade` (short page) in dev at 375px — footer must be at viewport bottom, not floating mid-page |
| Header `bg-paper` renders correct warm white | SHELL-01 | CSS custom property — visual check only | Open `/` in dev — header background should be slightly warm, not pure white |
| LinkedIn link opens correct profile in new tab | SHELL-02 | External URL behaviour | Click LinkedIn link in footer — should open `linkedin.com/in/gregory-vitrenko-7258a0350` in new tab |
| Folio wordmark uses `text-display` (36px) | SHELL-01 | Font size change — visual regression check | Compare header logo text size before/after; should be visually the same or barely smaller than before (was 38px sm) |

---

## Validation Sign-Off

- [ ] All tasks have automated TypeScript compile check
- [ ] Sampling continuity: every task runs `npx tsc --noEmit`
- [ ] Wave 0: N/A — existing infrastructure sufficient
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
