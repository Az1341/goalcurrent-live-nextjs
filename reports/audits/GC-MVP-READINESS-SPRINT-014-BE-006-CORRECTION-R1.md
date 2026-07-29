# GC-MVP-READINESS-SPRINT-014-BE-006-CORRECTION-R1

**Date/time:** 2026-07-29 ~11:30–12:10 BST
**Task ID:** GC-MVP-READINESS-SPRINT-014-BE-006-CORRECTION-R1
**Title:** Complete BE-006 — sanitize all client-facing provider-derived errors
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** b099eb31f345b4a074f5b79cede18d45333e7c9d
**Implementation commit:** ed38cc3bbf8bae5bce2fa35b4028d744abde3237
**Evidence commit:** b2d01ee5b705297fa1c6765a4ccfcceefd52abd9
**Ending HEAD:** b2d01ee5b705297fa1c6765a4ccfcceefd52abd9

---

## 1. Problem

Sprint 014 closed AuthError / `Check API_FOOTBALL_KEY` fingerprints, but audit closure noted residual `quota` / `api` paths where `mapFetchError` could still surface `error.message` to clients.

## 2. mapFetchError caller inventory

`mapFetchError` is private to `src/lib/pl/endpoints.ts`. Call sites:

| Caller | Path |
|---|---|
| `fetchPlayerLeaderboard` | leaderboard soft-fail |
| `fetchPlTeams` | teams soft-fail |
| `fetchPlLive` | live soft-fail |
| `fetchPlPlayers` | players soft-fail (leagueResult) |

All previously assigned `error: result.message`. Now assign `apiFootballClientSafeFetchFailureMessage(result.kind)`.

## 3. Before/after error-flow matrix

| Path | Before | After |
|---|---|---|
| AuthError via `route-errors` | Generic auth string | Unchanged: `Live data is temporarily unavailable.` + `captureRouteError` |
| AuthError via `api-core` | Generic auth string | Same via `toClientSafeApiFootballFetchFailure` + `logError` |
| RateLimit via `api-core` | **Raw `error.message`** | Static `apiFootballErrorMessage("rate_limit")` + `logError` |
| NetworkError via `api-core` | Fell through as raw `api` message | Kind `network` + static network message + `logError` |
| Unknown/API via `api-core` | **Raw `error.message`** | Static unknown message + `logError` |
| `mapFetchError` | Passed `result.message` | Kind-keyed static message only |
| Soft quota catches in `endpoints` / `api.ts` | Local static string | Unified to `apiFootballErrorMessage("rate_limit")` |

## 4. Static client-message inventory

| Kind / code | Exact client string |
|---|---|
| auth | `Live data is temporarily unavailable.` |
| quota / rate_limit | `Live data is temporarily unavailable due to provider rate limits.` |
| network | `Unable to reach the live data provider. Please try again shortly.` |
| api / unknown | `Unexpected error fetching live data.` |

## 5. Proof raw `error.message` cannot reach clients (scope)

- `toClientSafeApiFootballFetchFailure` never returns `error.message`.
- `mapFetchError` never reads `result.message` for client output.
- `respondApiFootballFailure` AuthError branch uses auth helper; other codes use `apiFootballErrorMessage(code)`.
- Unit suite injects provider bodies, stack-like strings, credential-like tokens, and `Check API_FOOTBALL_KEY` — client JSON never contains them.

## 6. Server-side diagnostics

- Route envelopes: `captureRouteError` (unchanged).
- PL fetch failures: `logError(context, error)` inside `toClientSafeApiFootballFetchFailure` before mapping.
- Unit proves console.error retains context + original `Check API_FOOTBALL_KEY` text while client message stays generic.

## 7. HTTP status / retry semantics

| Envelope | Status | Notes |
|---|---|---|
| AuthError (route-errors) | 503 | Preserved |
| rate_limit / network (route-errors) | 503 | Preserved |
| unknown_error (route-errors) | 500 | Preserved |
| PL soft envelopes via mapFetchError | typically 200 with `error` field | Structure unchanged; only message text sanitised |

No Cache-Control / retry-header changes.

## 8. Gates

| Gate | Result |
|---|---|
| BE-006 focused unit | **8/8 PASS** |
| Full unit | **194/194 PASS** |
| BE-005 unit regression | **4/4 PASS** |
| BE-006 Playwright 390+1440 | **2/2 PASS** |
| BE-005 Playwright 390+1440 | **2/2 PASS** |
| Typecheck | **PASS** |
| Scoped lint | **0 errors** (3 pre-existing unused-var warnings) |
| Full lint | **33 errors / 57 warnings** (baseline held) |
| Build | **PASS** |

## 9. Impacts

Football-data, locale, SEO, a11y, polling, API fan-out, Vercel: unchanged (string mapping + logging only).

## 10. Commit file lists

### Implementation `ed38cc3bbf8bae5bce2fa35b4028d744abde3237`

| Status | Path |
|---|---|
| M | `src/lib/api-football/errors.ts` |
| M | `src/lib/pl/api-core.ts` |
| M | `src/lib/pl/endpoints.ts` |
| M | `src/lib/pl/api.ts` |
| M | `tests/lib/be-006-client-error-sanitization.test.mjs` |

### Evidence (this commit)

| Status | Path |
|---|---|
| A | `reports/audits/GC-MVP-READINESS-SPRINT-014-BE-006-CORRECTION-R1.md` |
| M | `reports/audits/GC-MVP-READINESS-SPRINT-014-R1.md` (cross-reference pointer only) |

## 11. Remaining limitations

- Client UI components that surface browser `fetch`/JS exceptions (e.g. some PL client `error.message` for local fetch failures) are outside the Sprint 014 server provider-envelope scope.
- Debug routes behind BE-005 may still name configuration keys intentionally.
- Soft PL envelopes remain HTTP 200 with `error` string (pre-existing contract).

## 12. Prohibitions confirmation

NO SECOND FINDING. NO BE-001/BE-003. NO LINT CLEANUP. NO BROAD REFACTOR. NO HISTORY REWRITE. NO PUSH. NO MERGE. NO DEPLOY. NO SPRINT 015.

---

**GC-MVP-READINESS-SPRINT-014-BE-006-CORRECTION-R1 status:** COMPLETE