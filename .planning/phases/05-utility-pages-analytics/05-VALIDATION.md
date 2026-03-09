---
phase: 5
slug: utility-pages-analytics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no jest/vitest config in codebase |
| **Config file** | None — Wave 0 not required (lint + build gate established) |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30–60 seconds (lint) / ~90–120 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full build must be green + visual check of all 5 pages
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | UTIL-01 | lint | `npm run lint` | ✅ existing | ⬜ pending |
| 5-01-02 | 01 | 1 | UTIL-03 | lint | `npm run lint` | ✅ existing | ⬜ pending |
| 5-02-01 | 02 | 1 | UTIL-02 | lint | `npm run lint` | ✅ existing | ⬜ pending |
| 5-02-02 | 02 | 1 | UTIL-04 | lint | `npm run lint` | ✅ existing | ⬜ pending |
| 5-02-03 | 02 | 1 | UTIL-05 | lint | `npm run lint` | ✅ existing | ⬜ pending |
| 5-03-01 | 03 | 1 | ANLYT-01 | manual | n/a — Vercel dashboard | ❌ no test | ⬜ pending |
| 5-03-02 | 03 | 1 | ANLYT-02 | manual | n/a — Vercel dashboard | ❌ no test | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test files needed — lint + build gate is established across all prior phases.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel Analytics page views recorded | ANLYT-01 | Production-only, no local emulation | Deploy → Vercel dashboard → Analytics tab → confirm page view data |
| Conversion events in dashboard | ANLYT-02 | Production-only, no local emulation | Deploy → visit upgrade page, click checkout → Vercel dashboard → Events tab → confirm 4 event types |
| Stone palette correct on all 5 pages | UTIL-01–05 | Class names not caught by lint | Local preview → check each page at 375px and 1280px |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
