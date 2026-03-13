---
phase: 32-header-footer
verified: 2026-03-13T00:00:00Z
status: gaps_found
score: 8/9 must-haves verified
re_verification: false
gaps:
  - truth: "The footer center shows a copyright + brand line"
    status: partial
    reason: "Implementation renders '© {year} Folio' but ROADMAP success criterion 4 and plan task spec both require '© 2026 BRAND GUIDELINES'"
    artifacts:
      - path: "components/SiteFooter.tsx"
        issue: "Line 22 renders '© {year} Folio' — plan spec (line 91) and ROADMAP SC#4 explicitly require the text '© 2026 BRAND GUIDELINES'"
    missing:
      - "Change center copyright text from '© {year} Folio' to '© 2026 BRAND GUIDELINES' (or dynamic year with BRAND GUIDELINES suffix)"
human_verification:
  - test: "Visually inspect header on desktop and mobile"
    expected: "Wordmark left, flat nav centre with active underline, bookmark+theme+auth right; mobile hamburger opens flat list of all 11 links"
    why_human: "Active underline position and mobile drawer tap targets cannot be verified programmatically"
  - test: "Visually inspect footer on desktop and mobile"
    expected: "Three zones spread horizontally on desktop (wordmark | copyright | links), stacked vertically on mobile"
    why_human: "Responsive layout correctness requires browser rendering"
---

# Phase 32: Header + Footer Verification Report

**Phase Goal:** Every page uses the new header shell (wordmark-left, flat nav links, no dropdowns) and has a site footer — the two structural changes that affect every page and establish the visual framework for all subsequent redesign work
**Verified:** 2026-03-13
**Status:** gaps_found (1 gap — footer center text)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The header is a single row: Folio wordmark left, flat nav links center, auth+bookmark right | VERIFIED | `Header.tsx` lines 41–97: single `h-12` flex row, `FolioMark` + "olio" wordmark, `NAV_LINKS` nav centre, `Bookmark`+`ThemeToggle`+`AuthButtons` right |
| 2 | All 11 nav links are directly visible — no dropdowns, no chevrons | VERIFIED | `NAV_LINKS` array defined lines 17–29 with all 11 destinations. `NavDropdowns` is NOT imported anywhere in `Header.tsx` |
| 3 | The active page link shows a bottom-border underline indicator | VERIFIED | `isActive()` function at line 35 uses `usePathname()`; active link gets `border-b-2 border-stone-900 dark:border-stone-100` (line 68) |
| 4 | The mobile hamburger drawer lists all individual links as a flat list (no section groupings) | VERIFIED | Lines 122–146: mobile drawer iterates `NAV_LINKS` directly — no `MOBILE_NAV_LINKS`, no `MobileNavSection`, no section headers |
| 5 | The date row and dateline row are removed — header is visually compact | VERIFIED | No `formatShortDate`, `formatDateline`, or date/dateline JSX present anywhere in `Header.tsx` |
| 6 | The footer shows the Folio wordmark at the left | VERIFIED | `SiteFooter.tsx` lines 12–18: `FolioMark size={18}` + "olio" in `font-serif` wrapped in a `/` link |
| 7 | The footer center shows a copyright + brand line | FAILED | Line 22 renders `© {year} Folio` — ROADMAP success criterion 4 and plan task spec (32-02-PLAN.md line 91) both explicitly require `© 2026 BRAND GUIDELINES` |
| 8 | The footer right shows Legal / Privacy / Contact links | VERIFIED | Lines 26–45: `Legal` → `/terms`, `Privacy` → `/privacy`, `Contact` → `mailto:hello@folioapp.co.uk`; LinkedIn and Feedback removed |
| 9 | The footer appears on every page automatically (wired in app/layout.tsx) | VERIFIED | `app/layout.tsx` line 6: `import { SiteFooter }`, line 117: `<SiteFooter />` inside `<Providers>` after `<main>` |

**Score:** 8/9 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/Header.tsx` | Single-row header with flat nav + active state + mobile drawer | VERIFIED | 149 lines, substantive implementation — `NAV_LINKS`, `isActive()`, archive sub-row, mobile drawer all present |
| `components/SiteFooter.tsx` | Three-zone footer: wordmark left, copyright center, nav links right | PARTIAL | Exists and is substantive (50 lines, three zones present) but center text content does not match spec |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `components/Header.tsx` | `next/navigation` | `usePathname()` for active link detection | WIRED | Line 4: `import { usePathname } from 'next/navigation'`; line 33: `const pathname = usePathname()` |
| `components/Header.tsx` | `NavDropdowns.tsx` | NavDropdowns import is removed | VERIFIED ABSENT | `grep -n "NavDropdowns" components/Header.tsx` returns no output — correctly removed |
| `app/layout.tsx` | `components/SiteFooter.tsx` | `<SiteFooter />` rendered after main | WIRED | Line 6 import + line 117 usage confirmed |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SHELL-01 | 32-01-PLAN.md | Single-row header shell: wordmark-left, flat nav, no dropdowns, mobile drawer flattened | SATISFIED | All 5 SHELL-01 truths verified — header fully restructured |
| SHELL-02 | 32-02-PLAN.md | Three-zone footer: FolioMark left, copyright+brand center, Legal/Privacy/Contact right | PARTIALLY SATISFIED | Footer wired sitewide, FolioMark present, three links correct, but center text renders "© {year} Folio" not "© 2026 BRAND GUIDELINES" as specified |

**Note on requirement ID reuse:** SHELL-01 and SHELL-02 were previously used in Phase 2 (v1.1 milestone) for a different scope (token migration). Phase 32 reuses these IDs with a new definition in the v3.x redesign context. No REQUIREMENTS.md file exists for the current milestone — the requirements are defined only within the phase PLAN.md frontmatter and ROADMAP.md success criteria.

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| None found | — | — | — |

No TODO/FIXME comments, no placeholder returns, no stub implementations found in either `Header.tsx` or `SiteFooter.tsx`.

---

### Human Verification Required

#### 1. Header active underline — desktop

**Test:** Navigate to each major route (`/podcast`, `/tests`, `/firms`, etc.) and observe the nav
**Expected:** The current page's nav link shows a visible bottom-border underline; all other links are muted stone-400
**Why human:** CSS border-bottom rendering and correct `usePathname` firing requires a live browser

#### 2. Mobile hamburger drawer

**Test:** At mobile viewport, tap the hamburger icon; tap through 2–3 nav links
**Expected:** Drawer opens showing all 11 flat links; tapping a link closes the drawer and navigates
**Why human:** Touch interaction, drawer animation, and close-on-navigate behaviour require a live browser

#### 3. Footer responsive layout

**Test:** View footer at desktop (1280px) and mobile (375px)
**Expected:** Desktop — three zones spread horizontally. Mobile — stacked vertically (wordmark, copyright, links)
**Why human:** Flexbox responsive stacking requires browser rendering

#### 4. Footer dark mode

**Test:** Toggle dark mode; inspect footer
**Expected:** Footer background remains `bg-paper` (dark variant `bg-stone-950`), text in muted stone-400/500 range, links readable on hover
**Why human:** Dark-mode CSS custom properties require browser rendering with `prefers-color-scheme`

---

### Gaps Summary

One gap is blocking full SHELL-02 satisfaction:

**Footer center text mismatch.** The ROADMAP success criterion 4 states the footer must show `"© 2026 BRAND GUIDELINES"`. The plan task spec (32-02-PLAN.md line 91) explicitly specifies this text. The implementation renders `© {year} Folio` — matching the old footer text. The SUMMARY acknowledged the dynamic year as a decision but did not address the "BRAND GUIDELINES" suffix.

The fix is a one-line change: replace `© {year} Folio` with `© {year} BRAND GUIDELINES` (or `© 2026 BRAND GUIDELINES` if hardcoded is preferred). The structural three-zone layout is correctly implemented and all other footer requirements are met.

All SHELL-01 header requirements are fully satisfied. The header restructure is complete and clean.

---

_Verified: 2026-03-13_
_Verifier: Claude (gsd-verifier)_
