# GC-COMP-UCL-SPRINT-001-R1

**Project:** GoalCurrent  
**Report code:** GC-COMP-UCL-SPRINT-001-R1  
**DKAMS code:** GC-COMP-UCL-SPRINT-001  
**Workstream:** UEFA Champions League Expansion  
**Owner:** Cursor  
**Branch:** `recovery/gc-exec-batch-005`  
**Date:** 31/07/2026 (BST)  
**Status:** COMPLETE — PRIVATE PREVIEW ONLY — PENDING FOUNDER REVIEW  
**Independent approval:** **NOT claimed.**

---

## 1. Starting / ending SHAs

| Item | Full SHA |
|------|----------|
| Authorised starting HEAD | `7e2901a12b7db9aedfb084e2c5bbc9ee3b06dd0e` |
| Ending HEAD (before this evidence commit) | `905e06eb559322b57ab1a4a194fb7015aff53f57` |
| Evidence commit | Created after this file; SHA in completion response |
| Sprint 021 history | Untouched (linear tip continuation only) |

Tracked tree at start: clean (protected untracked left alone).

---

## 2. Commit chain and roles

| Full SHA | Role | Subject |
|----------|------|---------|
| `b9dbd4ae0755fd192ed0aadb33334b719b333a5f` | Competition configuration + data contract | feat(ucl): add Champions League competition config and data contract |
| `9e8380b83340b14b4f4a6b737116153957aa89c0` | Private-preview hub | feat(ucl): ship private-preview Champions League hub |
| `905e06eb559322b57ab1a4a194fb7015aff53f57` | Unit + Playwright tests | test(ucl): cover Champions League config ownership and hub journeys |
| *(evidence tip)* | Evidence report | docs(audit): record GC-COMP-UCL-SPRINT-001-R1 evidence |

History is linear from the authorised starting HEAD. No amend/rewrite of Sprint 021 commits.

---

## 3. Exact changed files (by commit)

### Config / contract (`b9dbd4a…`)
- `src/lib/competitions/registry.ts`
- `src/lib/ucl/constants.ts`
- `src/lib/ucl/types.ts`
- `src/lib/ucl/contract.ts`
- `src/lib/ucl/cache-keys.ts`
- `src/lib/ucl/canonical.ts`
- `src/lib/ucl/api.ts`

### Hub (`9e8380b…`)
- `src/app/[locale]/champions-league/page.tsx`
- `src/app/api/ucl/fixtures/route.ts`
- `src/app/api/ucl/standings/route.ts`
- `src/components/ucl/UclHubClient.tsx`
- `src/components/ucl/UclHub.module.css`
- `src/lib/client/useLiveUclFixtures.ts`
- `src/lib/client/live-data.ts`
- `src/lib/rate-limit/index.ts`
- `src/lib/nav.ts` (More-sheet link only; bottom tabs unchanged)
- `messages/{ar,de,en,es,fa,fr,it,nl,pt}.json` (`nav.championsLeague`)

### Tests (`905e06e…`)
- `tests/lib/ucl-competition-config.test.mjs`
- `tests/e2e/ucl-hub.spec.ts`

### Untouched findings
FE-012, FE-014, BE-001, BE-003 not modified.

---

## 4. Provider verification

| Item | Result |
|------|--------|
| Live API-Football requests this sprint | **0** |
| Reason | `API_FOOTBALL_KEY` not present in local process env or `.env` / `.env.local` |
| League ID (documented) | **2** (API-Football / api-sports official docs — Champions League id is stable) |
| Active season configured | **2026** (2026/27 starting year; aligned with GoalCurrent PL season convention) |
| Concurrency / spacing policy prepared | ≤2 concurrent, ≥750 ms between starts (verification script was local-only and deleted to avoid lint noise) |
| Credentials | Never printed or committed |

### Supported / unsupported datasets (configured contract)

| Dataset | Hub behaviour |
|---------|---------------|
| Fixtures | Supported via `/api/ucl/fixtures` |
| Results (finished / AET / PEN) | Supported from fixtures feed |
| League-phase standings | Shown **only** when provider returns non-empty `api-football` standings (`standingsAvailable`) |
| Qualification / knockout thin pages | **Not implemented** |
| Match-centre deep links | **Deferred** (`matchPathPrefix: null`) to avoid wrong ownership |
| Live global polling | **None** — hub uses existing visibility-aware SWR poll (75s), UCL-specific key only |

**Residual risk:** Founder/private-preview review should confirm season `2026` against a live `/leagues?id=2` response when the server key is available before any public release.

---

## 5. Architecture decisions

- Reused PL-style API-Football stack (`apiFootballFetch`, stale cache helpers, route error sanitisation).
- Added a **single** central `COMPETITIONS` registry (PL / WC26 / UCL) without forking PL/WC26 internals.
- UCL cache keys: `ucl:fixtures:2:2026`, `ucl:standings:2:2026` — no PL/WC26 leakage.
- Rate-limit upstream prefix extended to `/api/ucl/`.
- SWR path `LIVE_API_PATHS.uclFixtures` + dedicated `useLiveUclFixtures` owner (isolated from FE-010 PL key).
- SEO: canonical `/champions-league`, unique title/description via `buildPageMetadata`, page-level `robots: noindex`, **not** added to `SITEMAP_STATIC_PATHS`.
- Navigation: More-sheet link only; mobile bottom tabs unchanged.

---

## 6. Verification gates

| Gate | Command / notes | Result |
|------|-----------------|--------|
| Focused UCL unit | `npx tsx --test tests/lib/ucl-competition-config.test.mjs` | **8/8 PASS** |
| Full unit | `npm run test:unit` | **301/301 PASS** |
| Typecheck | `npx tsc --noEmit` | **PASS** |
| Scoped lint | eslint on all changed source/test files | **PASS** (0 errors) |
| Full lint | `npm run lint` | **33 errors / 56 warnings** (ceiling held) |
| Production build | `npm run build` | **PASS** (`/api/ucl/fixtures`, `/api/ucl/standings` present) |
| UCL Playwright | `tests/e2e/ucl-hub.spec.ts` @ 390×844 & 1440×900 | **8/8 PASS** (mocked provider) |
| FE-010 | both viewports | **2/2 PASS** |
| FE-015 | both viewports | **2/2 PASS** |

---

## 7. Private-preview control

- No production deployment performed.
- No production sitemap / robots weakening.
- Page forced `noindex`.
- Founder private review remains mandatory.
- Nothing pushed, merged, deployed, or released.

---

## 8. Residual risks

1. Live provider season confirmation still required when `API_FOOTBALL_KEY` is available (0 live requests this sprint).  
2. Aggregate two-leg scores are typed but not yet populated from multi-leg pairing logic.  
3. Match-detail ownership routes intentionally deferred.  
4. Standings UI shows top rows only when provider table is reliable; Swiss/league-phase nuance may need UX refinement later.

---

**GC-COMP-UCL-SPRINT-001-R1 status:** COMPLETE (private preview; pending founder review)