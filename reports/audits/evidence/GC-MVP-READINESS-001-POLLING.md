# GC-MVP-READINESS-001 - Request and Polling Audit

**Report code:** GC-MVP-READINESS-001-POLLING
**Task:** TASK 08
**Date:** 26/07/2026

## Intervals

| Source | Interval | Path |
|--------|----------|------|
| LIVE_POLL_MATCH_MS | 15000 | src/lib/client/fetcher.ts |
| LIVE_POLL_HUB_MS | 75000 | src/lib/client/fetcher.ts |
| News refresh | 3600000 | NewsHub / use-news-feed |
| Cron refresh-content | daily 06:00 UTC | vercel.json |

Visibility gate: visibilityAwareRefreshInterval returns 0 when document.hidden.

## Estimated calls (archive-complete production path, one active tab)

Before fix: Wc26ResultsSync + FinalWinnerCelebration each polled live+results at 15s => up to ~8 WC26 score requests/minute globally, on every locale page.
After fix (9c05aeb): both pass null paths when isWc26TournamentComplete() => 0 WC26 score polls from those components.
Remaining: PL hub/home SWR at 75s when PL surfaces mount; match detail 15s only on match pages while not archived.

## Duplicate / waste

1. CONFIRMED FIXED: global WC26 live+results polls after archive complete.
2. REMAINING: homepage multiple SWR subscribers to /api/pl/fixtures (deduped network).
3. REMAINING: dual news poll systems (SWR + module store) at 1h.

## Correction

One waste defect corrected: archive short-circuit in Wc26ResultsSync + FinalWinnerCelebration with tests/wc26/archive-polling.test.mjs. Commit 9c05aeb. Not pushed.

**GC-MVP-READINESS-001-POLLING status:** COMPLETE