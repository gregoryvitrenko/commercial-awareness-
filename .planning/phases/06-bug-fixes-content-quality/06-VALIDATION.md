---
phase: 6
slug: bug-fixes-content-quality
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework installed |
| **Config file** | none |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run build` (type-check + lint) |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint && npm run build`
- **After every plan wave:** Same + manual production smoke test
- **Before `/gsd:verify-work`:** Full build must be green + all 5 requirements verified on https://www.folioapp.co.uk
- **Max feedback latency:** ~30 seconds (build-time)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Manual Check | Status |
|---------|------|------|-------------|-----------|-------------------|--------------|--------|
| 06-01-01 | 01 | 1 | BUG-01 | manual | `npm run build` | /upgrade has exactly one footer | ⬜ pending |
| 06-02-01 | 02 | 1 | BUG-02 | manual | `npm run build` | Firm profile shows CLOSED badge for past deadlines | ⬜ pending |
| 06-03-01 | 03 | 1 | BUG-03 | manual | `npm run build` | /quiz date links show actual questions, badge count is real | ⬜ pending |
| 06-04-01 | 04 | 2 | QUAL-01 | manual | `npm run build` | Talking points are sharp/specific (requires new generation) | ⬜ pending |
| 06-05-01 | 05 | 2 | QUAL-02 | manual | `npm run build` | Quiz questions test reasoning not recall (requires new generation) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No new test infrastructure needed. Existing lint + build covers type safety.

*Existing infrastructure covers all phase requirements (build-time type checking as proxy).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| /upgrade has exactly one footer | BUG-01 | Visual rendering — not type-checkable | Navigate to https://www.folioapp.co.uk/upgrade, count footer instances |
| Firm profile CLOSED badge for past deadlines | BUG-02 | UI state depends on date comparison at render time | Navigate to a firm with closeDate < today (e.g. Freshfields), verify CLOSED badge, no Apply button |
| /quiz date links show real questions | BUG-03 | Depends on Redis production state | Navigate to /quiz, click a dated link, verify questions render (not empty practice screen) |
| Talking points are interview-quality | QUAL-01 | AI output quality — subjective | Trigger new generation via cron or admin endpoint; read talking points in next briefing |
| Quiz questions test commercial reasoning | QUAL-02 | AI output quality — subjective | Read quiz questions generated after prompt update; confirm none are pure fact-recall |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or manual verify instructions
- [ ] Sampling continuity: lint + build after every commit
- [ ] Wave 0 covers all MISSING references (none needed)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (build-time check)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
