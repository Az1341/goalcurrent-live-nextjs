# GC-HARDEN-BATCHD-R1 — Evidence Report

**DKAMS code:** GC-HARDENING-20260809-BATCHPLAN / Batch D  
**UK date/time:** 2026-08-10 ~16:40 BST  
**Project:** GoalCurrent.live  
**Branch:** `chore/gc-harden-batch-d-20260810`  
**Base:** `origin/main` @ `a7bfbd4` (Batch A)  
**Status:** IMPLEMENTED locally — **no push / merge / deploy** (awaiting Founder Approval)  

---

## Scope (items 8, 9)

| Item | Change | Result |
|------|--------|--------|
| 8 | `src/app/[locale]/error.tsx` reports via `Sentry.captureException(error)` like `global-error.tsx` | Done — replaced `console.error` |
| 9 | `captureRouteError` on domestic fixture/standings error paths in `src/lib/domestic-league/routes.ts` | Done — before stale fallback, matching PL/UCL `respondApiFootballFailure` order |

---

## Files touched

- `src/app/[locale]/error.tsx`
- `src/lib/domestic-league/routes.ts`
- `tests/lib/harden-batch-d-observability.test.mjs`
- `reports/audits/GC-HARDEN-BATCHD-R1.md` (this file)

---

## Behaviour notes

- Locale error boundary now imports `@sentry/nextjs` and calls `Sentry.captureException(error)` in `useEffect`, same as `global-error.tsx`.
- Domestic `respondDomesticFixtures` / `respondDomesticStandings` call `captureRouteError(routeTagFromCacheKey(cacheKey), body.error)` when `body.error` is set, **before** stale-cache fallback / 503 response.
- `routeTagFromCacheKey` prefixes `api/` when the cache key does not already (e.g. `serie-a-fixtures` → `api/serie-a-fixtures`), so Sentry tags align with PL/UCL `api/...` style.
- Covers all domestic leagues that use these helpers (Serie A, La Liga, Bundesliga fixtures + standings) without per-route duplication.

---

## Verification (local)

| Check | Result |
|-------|--------|
| `npm run test:unit` | **355/355** pass (includes 2 new BATCHD assertions) |
| Push | **NOT performed** |
| Merge | **NOT performed** |
| Deploy | **NOT performed** |

---

**NOT MERGED AND NOT PUBLICLY DEPLOYED.**

**GC-HARDEN-BATCHD-R1 status:** READY FOR FOUNDER APPROVAL TO PUSH / PREVIEW