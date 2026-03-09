---
phase: 4
slug: conversion-surfaces
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler + Next.js build + grep checks |
| **Config file** | `tsconfig.json` / `next.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds (build) / ~45 seconds (build + lint) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green + grep checks clean
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | CONV-01 | build + grep | `npm run build && grep -r 'zinc-' app/upgrade/page.tsx` | ✅ | ⬜ pending |
| 4-01-02 | 01 | 1 | CONV-02 | build + grep | `npm run build && grep -c 'Walk into\|Lock in\|Know your\|Speak the\|Stay informed\|Build your' app/upgrade/page.tsx` | ✅ | ⬜ pending |
| 4-01-03 | 01 | 1 | CONV-03 | build + grep | `npm run build && grep -r 'social-proof\|TODO.*testimonial\|Join.*students' app/upgrade/page.tsx` | ✅ | ⬜ pending |
| 4-02-01 | 02 | 1 | CONV-04 | build + grep | `npm run build && grep -r 'rounded-chrome' components/LandingHero.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test stubs required — the TypeScript compiler, Next.js build, and grep-based pattern checks are sufficient for a component token-migration phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Upgrade page reads as same product as briefing | CONV-01 | Visual design — requires browser rendering | Open `/upgrade` in dev — page should feel stone-palette editorial, not SaaS marketing. Check at 375px and 1280px |
| Feature copy is outcome-framed | CONV-02 | Copy tone — requires human reading | Read the 6 feature bullets — each should lead with the benefit ("Walk into interviews…"), not the capability ("In-depth articles…") |
| Social proof slots visible and clearly placeholder | CONV-03 | Visual check | Open `/upgrade` — student count badge and testimonial slot should be visible between features card and free-tier note. TODO comment should be in source. |
| LandingHero CTA radius fixed | CONV-04 | Subtle visual change | Open `/` in dev — CTA button should have 4px radius (square-ish), not the previous pill-like `rounded-xl` |
| Stripe checkout still works after palette changes | CONV-01 | End-to-end functional | Open `/upgrade` in incognito → click CTA → confirm Stripe checkout loads without errors (STATE.md requirement for any deploy touching /upgrade) |
| No zinc-* remains in scope files | CONV-01 | Final sweep | Run: `grep -r 'zinc-' app/upgrade/page.tsx components/LandingHero.tsx` — must return empty |

---

## Validation Sign-Off

- [ ] All tasks have automated TypeScript compile check
- [ ] Sampling continuity: every task runs `npm run build`
- [ ] Wave 0: N/A — existing infrastructure sufficient
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
