---
phase: 11-events-section
plan: "01"
subsystem: events
tags: [events, types, storage, tavily, claude-haiku, cron]
dependency_graph:
  requires: []
  provides: [LegalEvent interface, EventsStore interface, getEvents, saveEvents, generateEvents, events-cron]
  affects: [plan-02-api-route, plan-03-ui-pages]
tech_stack:
  added: []
  patterns: [dual-backend-storage, tavily-parallel-search, claude-haiku-synthesis, jsonrepair-extraction]
key_files:
  created:
    - lib/events.ts
  modified:
    - lib/types.ts
    - vercel.json
decisions:
  - "Past events filtered at retrieval time via YYYY-MM-DD string comparison (no Redis TTL) — same pattern as isClosed in Phase 06"
  - "No TTL on events:current Redis key — events are refreshed weekly by cron, not expired; stale data is better than no data"
  - "EventCity union limited to London/Manchester/Edinburgh/Bristol/Other — matches research scope (UK cities with Magic Circle/Silver Circle presence)"
metrics:
  duration: "108s"
  completed: "2026-03-11"
  tasks_completed: 3
  files_modified: 3
---

# Phase 11 Plan 01: Events Data Contract and Storage Layer Summary

LegalEvent/EventsStore interfaces plus a full Tavily + claude-haiku generation pipeline saved to Redis under `events:current`, with Monday 07:00 UTC cron wired in vercel.json.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add LegalEvent types to lib/types.ts | 8b96660 | lib/types.ts |
| 2 | Build lib/events.ts — generation + storage | f792271 | lib/events.ts |
| 3 | Add Monday 07:00 UTC cron to vercel.json | 74cdf2f | vercel.json |

## What Was Built

### lib/types.ts — new exports appended before TOPIC_STYLES
- `EventType` union: `'Networking' | 'Panel' | 'Workshop' | 'Social' | 'Career Fair'`
- `EventCity` union: `'London' | 'Manchester' | 'Edinburgh' | 'Bristol' | 'Other'`
- `LegalEvent` interface: id, title, date (YYYY-MM-DD), optional time/venue, city, organiser, eventType, eligibility, description, whyAttend, sourceUrl
- `EventsStore` interface: events array + generatedAt ISO timestamp

### lib/events.ts — full generation and storage layer
- Dual-backend pattern (useRedis/getRedis) copied verbatim from lib/storage.ts
- Redis key: `events:current` (no TTL — weekly cron refreshes it)
- Filesystem fallback: `data/briefings/events-current.json`
- `buildEventId()`: organiser-title-date slug, lowercased, max 80 chars
- `searchForEvents()`: 6 parallel Tavily queries with AbortController (12s timeout, fail-open)
- `synthesiseEvents()`: claude-haiku-4-5-20251001, JSON extraction via extractJSON() + jsonrepair, past-event filter at `date >= today`
- `generateEvents()`: top-level export — search + synthesise + save + return EventsStore

### vercel.json — third cron entry
- `/api/events` at `0 7 * * 1` (07:00 UTC every Monday)
- Fires after daily briefing cron (06:00) — no resource contention

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- lib/types.ts: FOUND
- lib/events.ts: FOUND
- vercel.json: FOUND
- Commit 8b96660 (types): FOUND
- Commit f792271 (events.ts): FOUND
- Commit 74cdf2f (vercel.json): FOUND
