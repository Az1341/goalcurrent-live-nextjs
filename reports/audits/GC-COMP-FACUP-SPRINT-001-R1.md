# GC-COMP-FACUP-SPRINT-001-R1

**Project:** GoalCurrent  
**Report code:** GC-COMP-FACUP-SPRINT-001-R1  
**DKAMS code:** GC-COMP-FACUP-SPRINT-001  
**Workstream:** FA Cup Expansion  
**Owner:** Cursor  
**Branch:** `recovery/gc-exec-batch-005`  
**Date:** 31/07/2026 (BST)  
**Status:** COMPLETE — PRIVATE PREVIEW ONLY — PENDING FOUNDER REVIEW  
**Independent approval:** **NOT claimed.**

---

## 1. Starting / ending SHAs and timestamps

| Item | Value |
|------|--------|
| Exact BST start | `2026-07-31 15:09:13 BST` |
| Exact BST completion (pre-evidence commit) | `2026-07-31 15:33:49 BST` |
| Authorised starting HEAD | `2a90d5d2ce7fff372431226b2c8a1973c8feb501` |
| Ending HEAD before evidence commit | `e3fef36022e7fd799954704c7851c3c6a8c8f2c6` |
| Evidence commit | Created after this file; SHA in completion response |
| UCL approved tip | Remains ancestor; UCL commits not amended/rewritten |
| Tracked tree at start | Clean (protected untracked left alone) |

---

## 2. Commit chain and roles

| Full SHA | Parent | Role | Subject |
|----------|--------|------|---------|
| `23c418ddb4699659c42aa3e6ce1f2226ae169f93` | `2a90d5d2ce7fff372431226b2c8a1973c8feb501` | Registry + cup-data contract | feat(facup): add FA Cup competition registry and knockout data contract |
| `89ef685ad5bfcd737727e7ab9056b04f0c9380e0` | `23c418ddb4699659c42aa3e6ce1f2226ae169f93` | API + private-preview hub | feat(facup): ship private-preview FA Cup hub and fixtures API |
| `e3fef36022e7fd799954704c7851c3c6a8c8f2c6` | `89ef685ad5bfcd737727e7ab9056b04f0c9380e0` | Unit + Playwright tests | test(facup): cover FA Cup config ownership and hub journeys |
| *(evidence tip)* | `e3fef36022e7fd799954704c7851c3c6a8c8f2c6` | Evidence report | docs(audit): record GC-COMP-FACUP-SPRINT-001-R1 evidence |

History is linear from the authorised starting HEAD. No amend/squash/rewrite of UCL or Sprint 021 history.

---

## 3. Exact changed files (by commit)

### Registry / contract (`23c418d…`)
- `src/lib/competitions/registry.ts`
- `src/lib/competitions/cache-keys.ts` *(new competition-neutral helper)*
- `src/lib/ucl/cache-keys.ts` *(thin wrapper; keys remain `ucl:fixtures:2:2026` / `ucl:standings:2:2026`)*
- `src/lib/facup/constants.ts`
- `src/lib/facup/types.ts`
- `src/lib/facup/contract.ts`
- `src/lib/facup/cache-keys.ts`
- `src/lib/facup/canonical.ts`
- `src/lib/facup/api.ts`

### Hub / API (`89ef685…`)
- `src/app/[locale]/fa-cup/page.tsx`
- `src/app/api/facup/fixtures/route.ts`
- `src/components/facup/FacupHubClient.tsx`
- `src/components/facup/FacupHub.module.css`
- `src/lib/client/useLiveFacupFixtures.ts`
- `src/lib/client/live-data.ts`
- `src/lib/rate-limit/index.ts`
- `src/lib/nav.ts` (More-sheet link only; bottom tabs unchanged)
- `messages/{ar,de,en,es,fa,fr,it,nl,pt}.json` (`nav.faCup`)

### Tests (`e3fef36…`)
- `tests/lib/facup-competition-config.test.mjs`
- `tests/e2e/facup-hub.spec.ts`

### Untouched control surfaces
FE-012, FE-014, BE-001, BE-003 not modified.  
`SITEMAP_STATIC_PATHS` unchanged (no `/fa-cup`).  
No Europa / La Liga / Scottish Premiership work.

---

## 4. Architecture reuse decisions

- Extended existing `src/lib/competitions/registry.ts` rather than creating a parallel FA Cup platform.
- Extracted competition-neutral `competitionResourceCacheKey` into `src/lib/competitions/cache-keys.ts`; UCL wrappers preserve identical key strings.
- Reused API-Football client, stale-cache helpers, upstream rate-limit prefix pattern, SWR visibility-aware polling pattern, noindex page metadata pattern, and More-sheet secondary discovery.
- Round grouping lives in client-safe `contract.ts` (not server `api.ts`) to avoid client bundling of provider code.
- No standings route/UI for FA Cup. No two-leg aggregate assumptions. No thin round/team/match pages.

---

## 5. Provider verification

| Item | Result |
|------|--------|
| Live API-Football requests this sprint | **0** |
| Reason | `API_FOOTBALL_KEY` absent from process env (`KEY_ABSENT`) |
| League ID (repository-authorised / api-sports v3) | **45** (England FA Cup) |
| Active season configured | **2026** (2026/27 starting year; aligned with PL/UCL season convention) |
| Credentials | Never printed or committed |
| Live verification before public release | **Mandatory** (founder blocker) |

### Supported / unsupported datasets

| Dataset | Supported |
|---------|-----------|
| Fixtures | Yes (`/api/facup/fixtures`) |
| Results | Yes (derived from fixtures statuses) |
| Standings | **No** (`standingsSupported: false`; no standings UI) |
| Events / lineups / statistics | **No** (deferred) |
| Thin round / team / match pages | **No** |

### Cup-round contract
Qualifying → 1st–5th rounds → QF → SF → Final; replay flag when provider round text includes replay; unknown rounds → `other`; statuses include LIVE/ET, FT, AET, PEN, PST, CANC, ABD.

---

## 6. Cache / polling / API ownership

| Control | Evidence |
|---------|----------|
| Cache key | `facup:fixtures:45:2026` |
| Isolation | Distinct from `ucl:fixtures:2:2026`, PL `39`, WC26 `1` |
| Client path | Single `useLiveFacupFixtures` owner of `/api/facup/fixtures` |
| Polling | Polls only while a LIVE FA Cup fixture is present; otherwise `refreshInterval = 0` |
| Global polling | None added; bottom-nav / layout unchanged |
| Ownership | Response requires `competitionKey=facup`, league `45`, season `2026`, `standingsSupported=false` |
| Stale-on-failure | Route uses `getStaleApiCache` + sanitised error envelope |
| Rate limit | `/api/facup/` treated as upstream path |

---

## 7. SEO / private-preview controls

- Canonical path `/fa-cup` via `buildPageMetadata`
- Unique title/description/OG identity from registry metadata
- `robots: { index: false, follow: false }` on hub page
- Not added to production sitemap
- Production robots behaviour not weakened
- No public deployment performed

---

## 8. Test and gate results

| Gate | Result |
|------|--------|
| Focused FA Cup + UCL unit | **16/16 pass** |
| Full unit suite | **309/309 pass** |
| Typecheck (`tsc --noEmit`) | **PASS** |
| Scoped lint (changed TS/JS) | **PASS** (0 errors; CSS file ignored warning only) |
| Full lint | **33 errors / 56 warnings** — equals ceiling; no regression |
| Production build | **PASS** (includes `/[locale]/fa-cup` and `/api/facup/fixtures`) |
| FA Cup Playwright 390×844 | **PASS** (5/5) |
| FA Cup Playwright 1440×900 | **PASS** (5/5) |
| UCL hub regression both viewports | **PASS** (8/8 in combined run after browser install) |
| FE-010 both viewports | **PASS** (2/2) |
| FE-015 both viewports | **PASS** (2/2) |
| i18n message parity | **PASS** |

Evidence dumps: `reports/audits/evidence/_facup-*.txt`.

---

## 9. Residual risks

1. Live `/leagues?id=45` + season `2026` verification still required with production-authorised credential before public release.
2. Qualifying/replay round label wording depends on provider round strings; unknown rounds fall back to `other`.
3. Founder must review private-preview hub locally before any next release move.

---

## 10. Release / control confirmation

- Private-preview only; noindex active
- Production sitemap unchanged
- Nothing pushed, merged, deployed, or publicly released
- Founder review mandatory
- Live provider verification mandatory before public release
- Independent approval **not** claimed