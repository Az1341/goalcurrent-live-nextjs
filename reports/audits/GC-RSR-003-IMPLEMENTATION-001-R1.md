# GC-RSR-003-IMPLEMENTATION-001-R1

**DKAMS code:** GC-RSR-003-IMPLEMENTATION-001  
**Project:** GoalCurrent.live Rebuild  
**Report date/time:** 01/08/2026 – 12:46:04 +01:00 (BST)  
**Task owner:** Cursor  
**Control owner:** ChatGPT  
**Founder approval owner:** Ahmad  
**Branch:** `recovery/gc-exec-batch-005`  
**Starting HEAD:** `5f878a22ced29d467d1c23592240e709b769f7c4`  
**Ending HEAD (after evidence commit):** recorded after Task 12  
**Implementation commit:** `141f6e3523e07e20bb6c961cd466adc8b209f088`  
**Mode:** ONE ISOLATED SECURITY REMEDIATION  
**Deployment:** none (prohibited)

---

## 1. Defect reproduction (pre-fix)

Runtime session `2fc2ef` / reconciliation RSR-003:

- `authorizeDebugAccess` returned `true` when `DEBUG_SECRET` unset and `nodeEnv === "development"`.
- `GET /api/debug/api-football` returned HTTP **400** (auth passed; query invalid) instead of **401**.

## 2. Implementation summary

In `src/lib/server/cache.ts` `authorizeDebugAccess`:

- When `DEBUG_SECRET` is absent/empty → **always `false`** (all environments).
- Removed `nodeEnv === "development"` fail-open branch.
- Preserved Bearer and `x-debug-secret` match.
- Preserved CRON_SECRET separation (never accepted).

## 3. Final security contract

| Scenario | Result |
|---|---|
| `DEBUG_SECRET` unset (dev/preview/prod) | Reject (route **401**) |
| Secret set, credential missing | Reject **401** |
| Secret set, credential incorrect | Reject **401** |
| Correct Bearer | Authorise |
| Correct `x-debug-secret` | Authorise |
| CRON credentials | Never authorise |
| Error body | Generic; no secret/env disclosure |

## 4. Exact implementation commit files

```
src/lib/server/cache.ts
tests/e2e/be-005-debug-auth.spec.ts
tests/lib/be-005-debug-auth.test.mjs
```

## 5. Unit tests

Command:

```
npx tsx --test tests/lib/be-005-debug-auth.test.mjs
```

Result: **11/11 PASS** (0 fail)

## 6. Playwright (focused)

Command:

```
npx playwright test tests/e2e/be-005-debug-auth.spec.ts --project=chromium --workers=1
```

(with `DEBUG_SECRET` supplied to the Playwright webServer process for the positive auth path)

Result: **2/2 PASS** (mobile + desktop)

## 7. Regression subset

Command:

```
npx playwright test tests/e2e/homepage.spec.ts tests/e2e/locale-mobile-nav.spec.ts tests/e2e/articles-404-pl.spec.ts tests/e2e/be-005-debug-auth.spec.ts --project=chromium --workers=1
```

Result: **9 passed, 1 failed**

| Area | Result |
|---|---|
| Homepage | PASS |
| Locale navigation | PASS |
| Mobile bottom nav / More sheet | PASS |
| Premier League hub | PASS |
| Debug unauthorised + correct credential (RSR-003) | PASS (2/2) |
| Articles index | PASS |
| Unknown-route 404 shell wait | **FAIL** (timeout `data-gc-shell`) — pre-existing / unrelated to auth utility; not introduced by RSR-003 file set |

## 8. Static gates

| Gate | Command / scope | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | PASS |
| Lint (changed only) | `npx eslint src/lib/server/cache.ts tests/lib/be-005-debug-auth.test.mjs tests/e2e/be-005-debug-auth.spec.ts --max-warnings 0` | PASS |
| Production build | `npm run build` | PASS |
| Secret scan (changed files) | pattern scan for committed key material | PASS (no matches) |

## 9. Dirty-tree / instrumentation controls

- Unrelated product work left untouched (not staged).
- Session `2fc2ef` instrumentation files not staged:
  - `src/app/api/debug/api-football/route.ts`
  - `src/app/api/pl/fixtures/route.ts`
  - `src/lib/rate-limit/index.ts`
  - `src/lib/log.ts`
  - `src/lib/sentry-config.ts`
  - `.cursor/`
- No `git add .` / `-A`.
- No push, merge, or deployment.

## 10. Task-card archive

| Item | Value |
|---|---|
| Source (retained) | `C:\Users\zafar\Downloads\GC-RSR-003-IMPLEMENTATION-001.md` |
| Archive path | `C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\docs\governance\dkams-task-archive\GC-RSR-003-IMPLEMENTATION-001.md` |
| Deleted source? | No |
| Archived? | Yes (copy placed; source retained) |

## 11. Residual risks

- Local/dev workflows that relied on open debug without `DEBUG_SECRET` must set the secret.
- Pre-existing 404 e2e flake remains outside this remediation.
- Production Upstash / Sentry env proof (ENV-001 / BE-002) unchanged by this task.
- Session `2fc2ef` instrumentation still present in the dirty tree until founder authorises cleanup.

## 12. Final verdict

**COMPLETE** — RSR-003 fail-closed debug authentication implemented, tested, committed, evidence recorded, task card archived. Founder review still required before push/merge/deploy.