---
phase: 12
slug: digest-compliance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — no test framework installed; all verification via production smoke tests |
| **Config file** | none |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | DIGEST-02 | typecheck | `npx tsc --noEmit` | N/A | ⬜ pending |
| 12-01-02 | 01 | 1 | DIGEST-02 | typecheck | `npx tsc --noEmit` | N/A | ⬜ pending |
| 12-02-01 | 02 | 1 | DIGEST-03 | typecheck | `npx tsc --noEmit` | N/A | ⬜ pending |
| 12-03-01 | 03 | 2 | DIGEST-03 | typecheck | `npx tsc --noEmit` | N/A | ⬜ pending |
| 12-04-01 | 04 | 2 | DIGEST-01 | typecheck | `npx tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework install needed — this phase is backend API routes and email templates verified via production smoke tests.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Digest email received in subscriber inbox | DIGEST-01 | Requires Resend + Stripe + cron in production | Trigger `curl -H "Authorization: Bearer $CRON_SECRET" https://www.folioapp.co.uk/api/digest`, check inbox |
| Unsubscribe link works end-to-end | DIGEST-02 | Requires real Redis + signed URL | Click unsubscribe link in received email, verify confirmation page, verify no further digests |
| List-Unsubscribe header shows in email client | DIGEST-02 | Email client rendering | Open digest in Gmail/Outlook, verify "Unsubscribe" button appears in client UI |
| Subject line is editorial (Claude-generated) | DIGEST-03 | Requires live Anthropic API | Check received email subject line — should reference a specific story, not just a date range |
| Referral link in email works | DIGEST-03 | Requires live site + cookie + Stripe | Click referral link, sign up, subscribe, verify referrer's count increments in Redis |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
