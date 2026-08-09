# GC-HOME-SSR-001-R4 — Evidence Report

**DKAMS code:** DKAMS-GC-HOME-SSR-001-R4
**Date:** 2026-08-09
**Project:** GoalCurrent.live
**Branch:** `fix/gc-home-ssr-001-r4`
**Starting HEAD:** `eecb977e921f6ce88f8a6395ca55792c2c6d5c01`
**Ending HEAD:** `8978ecfc3303c0006d2773694419f17d6d08e8ac`
**Verdict:** PASS
**Deploy:** NOT performed (FORBIDDEN)
**Push:** NOT performed (FORBIDDEN unless Ahmad authorises)

---

## Baseline (TASK 01)

- Started from clean branch off `origin/main` (`eecb977`).
- Unrelated untracked path present and left untouched: `reports/evidence/GC-PL-CALENDAR-ALIGN-20260807/`.
- Relevant existing tests: `tests/lib/use-live-api-hooks.test.mjs`, `tests/lib/home-pl-subscription.test.mjs`.

## Source verification (TASK 02)

Confirmed before edit:
- `HomeClient` → `useLiveFixtures()` → `useLiveApi(LIVE_API_PATHS.plFixtures)`
- `ssotFixturesResponse()` existed (private) in `src/lib/pl/api.ts`
- `live-data.ts` had `useSWR`, `dedupingInterval`, SWR options builder
- `page.tsx` rendered `<HomeClient />` with no PL seed

## Root cause confirmed

Homepage Premier League widgets depended on client SWR with no server-provided `fallbackData`. First paint waited on `/api/pl/fixtures`. Isolated to homepage PL path (not WC26, not PL hub SSR).

## Before / after data flow

**Before:** HomePage → HomeClient → useLiveFixtures() → useLiveApi(plFixtures) → SWR empty → client fetch → PL appears

**After:** HomePage → `ssotFixturesResponse()` → `initialPlData` → HomeClient → `useLiveFixtures(initialPlData)` → `useLiveApi(..., { fallbackData })` → SWR fallback → PL on first paint → existing background revalidation preserved

## Proof checklist

| Requirement | Evidence |
|---|---|
| `ssotFixturesResponse()` exported | `src/lib/pl/api.ts` export + default locale `"en-GB"` |
| No second mapper in page.tsx | page imports helper only; no `baseFixturesResponse` / `getPlSsotFixtures` reconstruction |
| No external/provider call added on homepage | page does not call `fetchPlFixtures()` |
| SWR `fallbackData` used | `useLiveFixtures` → `fallbackData: initialData`; `buildUseLiveApiSwrOptions` passes it in hub + fresh |
| Deduping/revalidation preserved | hub: `dedupingInterval=LIVE_POLL_HUB_MS`, `revalidateOnFocus=false`, `revalidateOnReconnect=true`; fresh unchanged; no `revalidateOnMount:false` added |
| WC26 untouched | `git diff` empty for `use-effective-fixtures.ts`, `wc26-fixture-overlay.ts` |
| Broadcaster/localisation untouched | `ssotFixturesResponse()` still defaults `"en-GB"`; homepage does not pass locale; PL hub not modified |
| Empty-data safety retained | `plFixtures = plData?.fixtures ?? []`; `loading={plLoading && !plData}` |

## Files changed (authorised only)

- `src/lib/pl/api.ts`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/HomeClient.tsx`
- `src/lib/client/useLiveFixtures.ts`
- `src/lib/client/live-data.ts`
- `tests/lib/use-live-api-hooks.test.mjs`
- `tests/lib/home-pl-subscription.test.mjs`
- `tests/lib/home-pl-ssr-response.test.mjs` (new)
- `reports/audits/GC-HOME-SSR-001-R4.md` (this report)
- `docs/tasks/archive/DKAMS-GC-HOME-SSR-001-R4.md` (task archive)

## Regression gate results

### `npm run test`
- Exit code: **1**
- Reason: repository has **no** `test` script (`Missing script: "test"`).
- Canonical suite run instead: `npm run test:unit`

### `npm run test:unit`
- Exit code: **0**
- Pass: **353** / Fail: **0**

### `npm run lint`
- Exit code: **1** (repo baseline behaviour)
- Result: **29 errors, 52 warnings** — delta **0** vs established baseline
- Scoped eslint on changed TS files: **0** findings (exit 0)

### `npm run build`
- First attempt failed due to stale `.next` validators referencing deleted `/statistics/{assists,disciplinary,top-scorers}` pages (pre-existing local cache from GC-STATS-REDIRECT; unrelated to this patch).
- After clearing `.next`: exit code **0** (compile + typecheck + emit succeeded).

### TypeScript (`npx tsc --noEmit`)
- Failed only against stale `.next/dev/types` before clean; clean production build typecheck passed.

### Local responsive regression (TASK 15)
- Local server: `npm run start -- -p 4877` (not production).
- SSR HTML (`GET /`): status 200; `data-gc-home-v5` present; PL team/fixture signals present (`fixtureId` hits; Arsenal countdown text in HTML).
- Browser CDP viewports:
  - 390×844: home visible, PL present, countdown present, no horizontal overflow, nav intact
  - 834×1112: same
  - 1440×900: same
- Playwright CLI browser binaries were not installed in this environment; used local Next server + IDE browser/CDP instead (still local-only).
- Did not claim unit tests prove browser request counts.

## Known limitations

1. Homepage still calls `ssotFixturesResponse()` without locale (GC-P1-02 systemic localisation — intentionally out of scope).
2. Background SWR revalidation to `/api/pl/fixtures` still occurs by design (fallback + refresh, not static-only).
3. `npm run test` script missing in package.json; gate satisfied via `npm run test:unit`.
4. Full Playwright project not executed (browser binaries missing); local SSR + viewport CDP checks performed instead.

## STOP conditions

None triggered. Source matched approved evidence; no WC26/hub/provider expansion required.

---

**NO DEPLOY confirmation:** no deploy performed.
**NO PUSH confirmation:** no push performed.