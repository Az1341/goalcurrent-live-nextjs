# GC-MVP-READINESS-001 - Football Data Flow Trace

**Report code:** GC-MVP-READINESS-001-DATA-FLOW
**Task:** TASK 04
**Date:** 26/07/2026
**Baseline:** bbaa282c5750c3babd8e648754edfa683ab006b0

## Lifecycle

provider request -> server/API -> validation/transform -> cache/overlay -> page/component -> empty/error

## Provider request

| Provider | Client | Notes |
|----------|--------|-------|
| API-Football | src/lib/api-football/client.ts `apiFootballFetch` | Key from API_FOOTBALL_KEY (never printed). Timeout 12s. Simulation modes for non-prod. |
| WC26 wrapper | src/lib/server/wc26-api-football.ts | League 1 / season 2026. Maps fixtures/scores via mapApiStatusShort. |
| PL API | src/lib/pl/api.ts | Standings/fixtures/live via API-Football + club fallbacks. |
| ScoreBat | video/highlights helpers (tests/wc26/scorebat.test.mjs) | Embed URL parsing only. |

## Server / API routes

- WC26: src/app/api/wc26/scores|fixtures|match/[fixtureId]|knockout-fixtures|top-scorers
- PL: src/app/api/pl/fixtures|live|standings|match/[fixtureId]|teams|...
- Cron: src/app/api/cron/refresh-content (daily 06:00 UTC via vercel.json)

## Validation / transformation

- Status map: src/lib/wc26-fixture-match.ts `mapApiStatusShort`
- Status normalise: src/lib/wc26-match-status.ts `normalizeWc26MatchStatus`
- Overlay merge: src/lib/wc26-results-sync.ts / fixture overlay modules
- Live bucketing/labels: src/lib/wc26-live.ts
- Standings: src/lib/wc26-standings.ts `computeGroupStandings` (PTS, H2H, GD, GF)
- Confirmed SSOT: src/lib/wc26/confirmed-results-ssot + group/knockout confirmed results

## Cache

- API Cache-Control / in-memory TTLs on WC26 score routes (live ~10-15s)
- content unstable_cache TTL in src/utils/cache/store.ts
- Client SWR via src/lib/client/live-data.ts / fetcher.ts

## Rendering entry points

| Surface | Files |
|---------|-------|
| Fixtures / results / live | src/app/[locale]/live/*, LiveMatchCentre, LiveRibbon, HomeLiveMatchCards |
| Match details | src/app/[locale]/match/[fixtureId]/*, MatchDetailContent |
| Standings | src/app/[locale]/worldcup2026/standings/*, premier-league standings |
| Competition filter | WC26 static schedule + PL league constants |

## SoT boundary

Production path SoT is heterogeneous: git static WC26 schedule/confirmed results + API-Football overlay when configured. Supabase/PostgreSQL NOT_FOUND on production path (R2).

## Mock / fallback / production distinction

- Production: API_FOOTBALL_KEY present -> live overlay + confirmed SSOT merge
- Fallback: missing key / rate limit / auth errors -> baseResponse("fallback") or static/confirmed scores only
- Simulation: API_FOOTBALL_SIMULATE non-prod only
- Tests: fixture objects and SSOT JSON; no live credentials

## Duplicate transformation paths

- Homepage classify vs Live Centre partition both use wc26-live helpers (now aligned: kickoff alone is not LIVE)
- BracketLivePolling vs Wc26ResultsSync both applied overlays; archive short-circuit added for global sync

## Highest-risk confirmed defect (Task 06)

Kickoff-passed scheduled fixtures treated as LIVE (HEAD shouldShowLiveMatchCard / partition / classify). Corrected in commit 8ba5c98.

**GC-MVP-READINESS-001-DATA-FLOW status:** COMPLETE