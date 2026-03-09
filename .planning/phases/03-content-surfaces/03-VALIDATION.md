---
phase: 3
slug: content-surfaces
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 3 — Validation Strategy

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
| 3-01-01 | 01 | 1 | CONT-01, CONT-05 | build + grep | `npm run build && grep -r 'text-\[' components/StoryCard.tsx` | ✅ | ⬜ pending |
| 3-01-02 | 01 | 1 | CONT-04 | build + grep | `npm run build && grep -r 'hover:opacity' components/StoryCard.tsx` | ✅ | ⬜ pending |
| 3-02-01 | 02 | 1 | CONT-02, CONT-05 | build + grep | `npm run build && grep -r 'text-\[' components/ArticleStory.tsx` | ✅ | ⬜ pending |
| 3-03-01 | 03 | 1 | CONT-03, CONT-05 | build + grep | `npm run build && grep -r 'text-\[' components/BriefingView.tsx` | ✅ | ⬜ pending |
| 3-03-02 | 03 | 1 | CONT-04 | build + grep | `npm run build && grep -r 'hover:opacity' components/BriefingView.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test stubs required — the TypeScript compiler, Next.js build, and grep-based pattern checks are sufficient for a component token-migration phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| StoryCard headline renders at correct size | CONT-01 | Font size changes require browser rendering | Open `/` in dev — card headlines should feel compact and editorial; check at 375px and 1280px |
| ArticleStory typography hierarchy legible | CONT-02 | Visual hierarchy — reader must distinguish heading levels | Open any `/story/[id]` page — headline > summary > section headers must be visually distinct |
| BriefingView 375px layout intact | CONT-03 | CSS layout — requires browser at 375px viewport | Open `/` in dev at 375px — no card overflow, topic tabs must not wrap to two lines |
| Card hover border shift visible | CONT-04 | Subtle visual change — requires browser interaction | Hover over any StoryCard — border should subtly shift colour; not jarring |
| No arbitrary text-[Npx] remains in scope | CONT-05 | Final sweep | Run: `grep -r 'text-\[' components/StoryCard.tsx components/ArticleStory.tsx components/BriefingView.tsx` — must return empty |

---

## Validation Sign-Off

- [ ] All tasks have automated TypeScript compile check
- [ ] Sampling continuity: every task runs `npm run build`
- [ ] Wave 0: N/A — existing infrastructure sufficient
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
