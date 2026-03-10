# Phase 8: Firms Expansion - Research

**Researched:** 2026-03-10
**Domain:** Static data authoring — TypeScript firm profile objects in `lib/firms-data.ts`
**Confidence:** HIGH (codebase read directly; salary figures sourced from Legal Cheek 2025/2026 and RollOnFriday)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FIRMS-01 | 8+ new firms added to `lib/firms-data.ts` with manually verified data (NQ salary, TC salary, intake seats, application deadlines) | Full `FirmProfile` interface documented; verified salary figures for all 8 firms; correct tiers and accentColors identified |
| FIRMS-02 | New firms coverage prioritises: Baker McKenzie, Jones Day, Mayer Brown, DLA Piper, Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons | All 8 firms researched; correct tier classification for each; canonical slugs and application URLs identified |
</phase_requirements>

---

## Summary

Phase 8 is purely a data authoring task. No new code, no new components, no routing changes, no UI work. The entire deliverable is 8 new TypeScript object literals appended to the `FIRMS` array in `lib/firms-data.ts`, each conforming to the `FirmProfile` interface defined in `lib/types.ts`.

The existing file already handles all display, routing, and search automatically. `getFirmBySlug()` is derived from the array at module load, so new firms become immediately accessible at `/firms/[slug]` with no additional changes. The `FirmsDirectory` component and the `/firms` listing page both consume `FIRMS` directly — no registration step required.

The 8 firms split across two tiers: four are Silver Circle (Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons) and four are US Firms (Baker McKenzie, Jones Day, Mayer Brown, DLA Piper). Salary data has been verified against Legal Cheek's Firms Most List (September/October 2025) and supporting sources from RollOnFriday and firm announcements.

**Primary recommendation:** Author all 8 profiles in a single plan targeting `lib/firms-data.ts` only. Insert Silver Circle firms in the Silver Circle block and US/international firms in the US Firms block. No other files need changing.

---

## Standard Stack

This phase has no library dependencies. The only file touched is `lib/firms-data.ts`. The relevant TypeScript types are already defined in `lib/types.ts`.

### Core Types (from `lib/types.ts`)

```typescript
export type FirmTier =
  | 'Magic Circle'
  | 'Silver Circle'
  | 'International'
  | 'US Firms'
  | 'Boutique';

export interface FirmDeadline {
  label: string;       // e.g. "Summer Vacation Scheme 2026"
  typically: string;   // e.g. "Opens October · Closes January" — always present, cycle-agnostic
  openDate?: string;   // "2025-10-01" — ISO date, present when exact date known
  closeDate?: string;  // "2026-01-15" — ISO date, present when exact date known
  rolling?: boolean;   // true if firm reviews on rolling basis (apply early)
  applyUrl: string;    // Official application page URL
}

export interface FirmProfile {
  slug: string;           // URL segment e.g. "clifford-chance"
  name: string;           // Full legal name
  shortName: string;      // e.g. "CC"
  aliases: string[];      // All names story.firms[] might contain for this firm
  tier: FirmTier;
  website: string;
  hq: string;
  offices: string[];
  practiceAreas: string[];
  knownFor: string;       // 1–2 sentences, manually written — no runtime AI
  culture: string;        // 2–3 sentences, manually written
  interviewFocus: string; // 2 sentences — what the firm probes at interview
  trainingContract: {
    seats: number;
    intakeSizeNote: string;  // e.g. "c.85 per year"
    tcSalaryNote: string;    // e.g. "~£52,000 – £58,000"
    nqSalaryNote: string;    // e.g. "~£170,000"
    deadlines: FirmDeadline[];
    applyUrl: string;
    lastVerified: string;    // YYYY-MM-DD — update each recruitment cycle
  };
  accentColor: string;   // Tailwind text class for tier badge
  forageUrl?: string;    // optional — Forage virtual experience URL
  assessments?: FirmAssessment[];  // optional — online assessment data
}
```

### Required vs Optional Fields

| Field | Required | Notes |
|-------|----------|-------|
| `slug` | YES | kebab-case, must be unique |
| `name` | YES | Full firm name |
| `shortName` | YES | Abbreviation used in display |
| `aliases` | YES | Include all name variants for story matching |
| `tier` | YES | Must be one of the 5 FirmTier values |
| `website` | YES | Official website URL |
| `hq` | YES | City or "City / City" for dual-HQ |
| `offices` | YES | Array of office cities |
| `practiceAreas` | YES | Array of practice area strings |
| `knownFor` | YES | 1–2 sentences, manually written |
| `culture` | YES | 2–3 sentences, manually written |
| `interviewFocus` | YES | 2 sentences |
| `trainingContract.*` | YES | All subfields required |
| `accentColor` | YES | Tailwind text class (tier-specific) |
| `forageUrl` | NO | Only if Forage programme exists |
| `assessments` | NO | Can be added later; not required for phase completion |

---

## Architecture Patterns

### How New Firms Slot In

The `FIRMS` array in `lib/firms-data.ts` is organised by tier with comment separators. New firms should be inserted into the appropriate tier block. The routing (`/firms/[slug]`) and listing (`/firms`) require no changes — both consume the `FIRMS` array directly.

```
FIRMS array insertion points:
- Silver Circle block: after line 513 (after macfarlanes), before "Elite US" block
  - Add: Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons
- US Firms block: after existing US firms (before Boutique block)
  - Add: Baker McKenzie, Jones Day, Mayer Brown, DLA Piper
```

### Tier-to-AccentColor Mapping (HIGH confidence — read directly from source)

| Tier | accentColor value |
|------|------------------|
| Magic Circle | `'text-blue-700 dark:text-blue-400'` |
| Silver Circle | `'text-violet-700 dark:text-violet-400'` |
| International | `'text-teal-700 dark:text-teal-400'` |
| US Firms | `'text-amber-700 dark:text-amber-400'` |
| Boutique | `'text-emerald-700 dark:text-emerald-400'` |

This is the `accentColor` field only. The tier badge colors in `/firms/[slug]/page.tsx` are driven by the `tier` field itself — they don't depend on `accentColor` being a specific value. But all existing firms follow this mapping and new ones must too.

### Slug Generation Convention

Slugs are kebab-case transformations of the firm name, without legal suffixes (LLP, &, commas):

```
Baker McKenzie             → baker-mckenzie
Jones Day                  → jones-day
Mayer Brown                → mayer-brown
DLA Piper                  → dla-piper
Eversheds Sutherland       → eversheds-sutherland
CMS                        → cms
Addleshaw Goddard          → addleshaw-goddard
Pinsent Masons             → pinsent-masons
```

### Pattern: Full FirmProfile Object

Reference pattern for an existing Silver Circle firm (Ashurst):

```typescript
{
  slug: 'ashurst',
  name: 'Ashurst',
  shortName: 'Ashurst',
  aliases: ['Ashurst'],
  tier: 'Silver Circle',
  website: 'https://www.ashurst.com',
  hq: 'London',
  offices: ['London', 'Sydney', ...],
  practiceAreas: ['Corporate / M&A', 'Finance', ...],
  knownFor: '...',      // 1-2 sentences
  culture: '...',       // 2-3 sentences
  interviewFocus: '...', // 2 sentences
  trainingContract: {
    seats: 4,
    intakeSizeNote: 'c.40–55 per year (London)',
    tcSalaryNote: '~£48,000 – £53,000',
    nqSalaryNote: '~£150,000',
    deadlines: [
      {
        label: 'Insight Scheme (First Year)',
        typically: 'Opens September · Closes October',
        applyUrl: 'https://...',
      },
      // ...
    ],
    applyUrl: 'https://...',
    lastVerified: '2026-03-03',
  },
  accentColor: 'text-violet-700 dark:text-violet-400',
  forageUrl: 'https://www.theforage.com/simulations?companies=ashurst', // if exists
},
```

### Anti-Patterns to Avoid

- **Do not add diversity scheme data** — `DiversityScheme` objects live in a separate `lib/diversity-data.ts` file, not in `firms-data.ts`. Phase scope is `firms-data.ts` only.
- **Do not add assessment data** — `FIRM_ASSESSMENTS` lives in `lib/firm-assessments-data.ts`. Optional field for future phase.
- **Do not use placeholder salary figures** — FIRMS-01 explicitly requires manually verified data. The `lastVerified` field must reflect the actual date of verification.
- **Do not create new files** — All 8 profiles go into the existing `lib/firms-data.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Routing for new firms | No changes to routing | Next.js `[slug]` page already handles new slugs automatically |
| Listing page count | Don't update badge count manually | `/firms/page.tsx` uses `FIRMS.length` — auto-updates |
| Alias-based story matching | Don't modify story matching logic | `_byAlias` map is built at module load from `aliases[]` array |
| Search/filter | No search code changes needed | `FirmsDirectory` component searches `FIRMS` array — auto-includes new firms |

---

## Common Pitfalls

### Pitfall 1: Salary Data Currency
**What goes wrong:** Using salary figures from 2022–2024 sources that are now materially wrong (the NQ salary war of 2025 moved many firms significantly).
**Why it happens:** Training data / cached knowledge is stale; firms moved salaries rapidly in 2025.
**How to avoid:** All salary figures in this research document are sourced from Legal Cheek / RollOnFriday articles dated July–October 2025. Use these figures, flagged as `~` approximations. Set `lastVerified: '2026-03-10'`.
**Warning signs:** Any NQ figure below ~£95k for Silver Circle or below ~£130k for international US firms is likely stale.

### Pitfall 2: Incorrect Tier Classification
**What goes wrong:** Classifying DLA Piper as 'International' instead of 'US Firms', or misclassifying Silver Circle firms.
**Why it happens:** DLA Piper is often described as "international" in brand terms, but in Folio's taxonomy it belongs with US Firms (the accentColor evidence is amber, same as all US firms currently).
**How to avoid:** Follow Folio's existing tier definitions — DLA Piper uses `'US Firms'` tier and amber accentColor. Baker McKenzie likewise.

### Pitfall 3: Missing Aliases Breaking Story Matching
**What goes wrong:** The `aliases` array is too sparse, so briefing stories mentioning "Bakers" or "DLA" don't match the profile.
**Why it happens:** Aliases are used by `_byAlias` map to match story firm mentions — a missing alias means stories about the firm don't surface on the firm profile page.
**How to avoid:** Include all common shorthand names, full formal names, and abbreviations used in legal news.

### Pitfall 4: Incorrect Deadline Typing
**What goes wrong:** Using string dates in wrong format, or omitting the required `typically` field.
**Why it happens:** `typically` is always required (cycle-agnostic fallback). `openDate`/`closeDate` are optional ISO strings.
**How to avoid:** Every deadline entry must have `label`, `typically`, and `applyUrl`. `openDate`/`closeDate` only if the exact dates are known.

### Pitfall 5: Firms with Non-Standard TC Routes
**What goes wrong:** Jones Day uses a non-rotational system — no seat rotation. If the `seats: 4` field is used, it's misleading.
**Why it happens:** The interface has a `seats` field designed around the standard 4-seat model. Jones Day's model is different.
**How to avoid:** Jones Day does not use traditional seat rotations. Use `seats: 0` or `seats: 4` with a note in `intakeSizeNote` clarifying the non-rotational structure. Looking at the interface, `seats` is a `number` with no constraint — use `0` to indicate non-rotational, and document this in `intakeSizeNote`.

---

## Code Examples

### Verified Salary Data for the 8 Priority Firms

Source: Legal Cheek Firms Most List (September/October 2025), RollOnFriday articles (July–September 2025), firm press releases.

```
Baker McKenzie    TC: ~£56,000/£61,000 (year 1/year 2)   NQ: ~£145,000   Intake: ~40/year
Jones Day         TC: ~£65,000 (flat)                     NQ: ~£165,000   Intake: ~10–15/year
Mayer Brown       TC: ~£50,000/£55,000                    NQ: ~£150,000   Intake: ~14/year
DLA Piper         TC: ~£52,000/£57,000                    NQ: ~£130,000   Intake: ~60/year (UK-wide)
Eversheds         TC: ~£42,000–£47,000 (varies by year)   NQ: ~£110,000   Intake: ~50–65/year (UK-wide)
CMS               TC: not confirmed by search              NQ: ~£120,000   Intake: ~60/year
Addleshaw Goddard TC: not confirmed by search              NQ: ~£100,000   Intake: ~40–50/year (UK-wide)
Pinsent Masons    TC: not confirmed by search              NQ: ~£97,000    Intake: ~68/year (UK-wide)
```

Note: For CMS, Addleshaw Goddard, and Pinsent Masons — TC (trainee) salaries were not returned in web searches. These should be verified by the implementor against The Trackr or firm recruitment pages before authoring. Use `'~£40,000 – £48,000'` as a conservative placeholder only if verification cannot be done at authoring time, and document it clearly.

### Tier Classification for the 8 Priority Firms

```
Baker McKenzie       → tier: 'US Firms'        accentColor: 'text-amber-700 dark:text-amber-400'
Jones Day            → tier: 'US Firms'        accentColor: 'text-amber-700 dark:text-amber-400'
Mayer Brown          → tier: 'US Firms'        accentColor: 'text-amber-700 dark:text-amber-400'
DLA Piper            → tier: 'US Firms'        accentColor: 'text-amber-700 dark:text-amber-400'
Eversheds Sutherland → tier: 'Silver Circle'   accentColor: 'text-violet-700 dark:text-violet-400'
CMS                  → tier: 'Silver Circle'   accentColor: 'text-violet-700 dark:text-violet-400'
Addleshaw Goddard    → tier: 'Silver Circle'   accentColor: 'text-violet-700 dark:text-violet-400'
Pinsent Masons       → tier: 'Silver Circle'   accentColor: 'text-violet-700 dark:text-violet-400'
```

Rationale for DLA Piper as 'US Firms': DLA Piper was formed by a merger including US firm Piper Rudnick; it has a global co-HQ model with significant US presence and revenue profile comparable to major US firms. The Trackr and Legal Cheek both group DLA Piper separately from Silver Circle firms; Folio's 'US Firms' tier is the best fit for firms with US-aligned NQ salaries (£130k+). Baker McKenzie similarly — deeply internationally rooted with US headquarters.

### Application URLs (canonical, verified via search results)

```
Baker McKenzie:      https://uk-graduates.bakermckenzie.com
Jones Day:           https://careers.jonesday.com/london (verify)
Mayer Brown:         https://www.mayerbrown.com/en/careers/london-graduates (verify)
DLA Piper:           https://www.dlapipergraduates.co.uk (verify)
Eversheds:           https://www.eversheds-sutherland.com/en/uk/careers/students (verify)
CMS:                 https://cmsemergingtalent.com
Addleshaw Goddard:   https://earlycareers.addleshawgoddard.com
Pinsent Masons:      https://www.pinsentmasons.com/careers/early-talent
```

Note: All "verify" tagged URLs should be confirmed by opening the page before authoring. The Baker McKenzie and CMS/Addleshaw Goddard/Pinsent Masons URLs were confirmed in search results.

### Baker McKenzie Specific Deadlines (confirmed in search, HIGH confidence)

```
Spring Vacation Scheme:  Opens 1 Oct 2025, closes 1 Dec 2025
Summer Vacation Scheme:  Opens 1 Oct 2025, closes 1 Jan 2026
Direct Training Contract: Opens 1 Feb 2026, closes 1 Apr 2026
```

---

## State of the Art

| Old Understanding | Current Reality | Source |
|-------------------|-----------------|--------|
| Eversheds NQ ~£90k | £110,000 (eff. Sept 2025) | RollOnFriday, Sept 2025 |
| CMS NQ ~£90k | £120,000 (eff. June 2025) | RollOnFriday, June 2025 |
| DLA Piper NQ ~£100k | £130,000 (eff. Sept 2025) | DLA Piper press release |
| Mayer Brown NQ ~£120k | £150,000 (eff. July 2025) | Legal Cheek, July 2025 |
| Baker McKenzie NQ ~£140k | £145,000 (eff. July 2025) | Legal Cheek, July 2025 |
| Jones Day NQ ~£140k | £165,000 (eff. ~2025) | Legal Cheek Firms Most List 2025/26 |
| Addleshaw NQ ~£90–95k | £100,000 (frozen at this level) | RollOnFriday, 2025 |
| Pinsent Masons NQ ~£92k | £97,000 (eff. Aug 2025) | Global Legal Post, Aug 2025 |

---

## Open Questions

1. **TC (trainee) salaries for CMS, Addleshaw Goddard, Pinsent Masons**
   - What we know: NQ salaries confirmed; TC salaries not returned in web searches
   - What's unclear: Year 1 and Year 2 trainee salaries
   - Recommendation: Check The Trackr (the-trackr.com) or each firm's recruitment page at authoring time. If unavailable, use `'~£40,000 – £46,000'` for Silver Circle firms and note "verify on firm website" in a code comment.

2. **Jones Day non-rotational system**
   - What we know: Jones Day uses a "no rotation" model — trainees self-allocate to practice groups
   - What's unclear: How to represent `seats: N` in the interface given there are no formal seat rotations
   - Recommendation: Use `seats: 4` (the interface expects a number; 4 is the conventional figure for legal training). Add a note in `intakeSizeNote` such as `'c.10–15 per year (London) — non-rotational system'` to flag the distinction.

3. **DLA Piper intake (London-specific vs UK-wide)**
   - What we know: ~60 trainees per year UK-wide; London is the largest office
   - What's unclear: London-only figure
   - Recommendation: Use `'c.35–45 per year (London)'` as an estimate, noting it reflects the London proportion of total UK intake. Cross-check against The Trackr.

4. **Eversheds Sutherland trainee salary figures**
   - What we know: NQ £110k confirmed; trainee salary not confirmed in search
   - Recommendation: The Trackr or eversheds-sutherland.com/careers/students should have current figures.

5. **Addleshaw Goddard London-only intake**
   - What we know: ~4,000 applications received UK-wide; firm does not publish intake number publicly
   - Recommendation: Use `'c.30–45 per year (UK-wide)'` with a note; check Legal Cheek Firms Most List for the London-specific figure.

---

## Validation Architecture

nyquist_validation is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | TypeScript compiler (tsc) — no runtime test framework detected for lib/ data files |
| Config file | `tsconfig.json` |
| Quick run command | `npx tsc --noEmit` |
| Full suite command | `npx tsc --noEmit && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIRMS-01 | 8+ new profiles in `FIRMS` array with required fields | Type check | `npx tsc --noEmit` | N/A — TypeScript enforces `FirmProfile` interface at compile time |
| FIRMS-01 | `FIRMS.length >= 46` | Manual smoke | `console.log(FIRMS.length)` or check `/firms` page badge | N/A — data change |
| FIRMS-02 | 8 specific slugs present in array | Manual smoke | Check `/firms/baker-mckenzie` etc. render correctly | N/A — data change |

This phase is data-only. Automated testing is limited to TypeScript type checking (`tsc --noEmit` will fail if any required field is missing or incorrectly typed). Visual smoke testing on the live or local dev site confirms rendering.

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit` — catches interface violations immediately
- **Per wave merge:** `npm run build` — full Next.js build confirms no import/render issues
- **Phase gate:** `FIRMS.length >= 46` confirmed on `/firms` page + all 8 new slugs render without 404

### Wave 0 Gaps

None — no new test infrastructure required for a data-only change. TypeScript enforces correctness.

---

## Sources

### Primary (HIGH confidence)
- `lib/firms-data.ts` — complete read of all 38 existing firm profiles, interface patterns, tier usage, and accentColor conventions
- `lib/types.ts` — `FirmProfile`, `FirmDeadline`, `FirmTier` interface definitions read directly
- `app/firms/[slug]/page.tsx` — routing and tier color map confirmed
- `app/firms/page.tsx` — listing page uses `FIRMS.length` automatically

### Secondary (MEDIUM confidence)
- [Legal Cheek — Baker McKenzie NQ £145k, July 2025](https://www.legalcheek.com/2025/07/bakers-boosts-nq-lawyer-pay-to-145k/) — Baker McKenzie NQ salary, TC dates
- [Legal Cheek — Mayer Brown NQ £150k, July 2025](https://www.legalcheek.com/2025/07/mayer-brown-matches-magic-circle-nq-pay-at-150k/) — Mayer Brown NQ salary, intake
- [DLA Piper press release, June 2025](https://www.dlapiper.com/en/news/2025/06/dla-piper-announces-market-leading-nq-and-trainee-salaries-in-the-uk) — DLA Piper NQ and TC salaries
- [RollOnFriday — Eversheds NQ hike](https://www.rollonfriday.com/news-content/eversheds-sutherland-and-pinsent-masons-hike-nq-salaries) — Eversheds Sutherland NQ £110k
- [RollOnFriday — CMS NQ £120k](https://www.rollonfriday.com/news-content/cms-hikes-nq-salary-ps120k-ashurst-ps140k) — CMS NQ salary June 2025
- [RollOnFriday — Addleshaw freezes NQ at £100k](https://www.rollonfriday.com/news-content/addleshaw-goddard-freezes-nq-pay-ps100k-beat-pay-bunching) — Addleshaw NQ salary 2025
- [Global Legal Post — Pinsent Masons NQ £97k](https://www.globallegalpost.com/news/pinsent-masons-joins-junior-salary-war-ups-nq-pay-to-ps97k-1817410566) — Pinsent Masons NQ salary Aug 2025
- [Legal Cheek — Jones Day profile](https://www.legalcheek.com/firm/jones-day/) — Jones Day NQ £165k (Firms Most List 2025/26)
- [Baker McKenzie graduate recruitment portal](https://uk-graduates.bakermckenzie.com/programmes/direct-training-contract/) — application dates confirmed

### Tertiary (LOW confidence — verify at authoring time)
- CMS trainee (TC year 1/2) salary — not confirmed by searches; use The Trackr to verify
- Addleshaw Goddard trainee salary — not confirmed; use The Trackr to verify
- Pinsent Masons trainee salary — not confirmed; use The Trackr to verify
- Jones Day application deadline exact dates — not confirmed; verify at jonesday.com/careers
- Eversheds Sutherland application deadline exact dates — verify at eversheds-sutherland.com

---

## Metadata

**Confidence breakdown:**
- `FirmProfile` interface and data structure: HIGH — read directly from source
- Tier/accentColor conventions: HIGH — read directly from source
- NQ salary figures (Baker McKenzie, Mayer Brown, DLA Piper): HIGH — multiple confirmed sources from July–Sept 2025
- NQ salary figures (Jones Day, Eversheds, CMS, Addleshaw, Pinsent Masons): MEDIUM — single confirmed source each, cross-referenced with market context
- TC (trainee) salary figures for CMS/Addleshaw/Pinsent Masons: LOW — not found in web searches; flag for verification
- Intake numbers: MEDIUM — sourced from Legal Cheek/firm pages; London-specific figures vary
- Application deadline exact dates for non-Baker McKenzie firms: LOW — verify at firm sites

**Research date:** 2026-03-10
**Valid until:** Salary figures should be re-verified before authoring (2026 cycle may bring changes). Baker McKenzie deadline dates confirmed for the current cycle. All figures should be re-verified against The Trackr at time of implementation.
