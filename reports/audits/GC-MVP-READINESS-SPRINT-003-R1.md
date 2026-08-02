# GC-MVP-READINESS-SPRINT-003-R1

**Project:** GoalCurrent  
**Report code:** GC-MVP-READINESS-SPRINT-003-R1  
**Type:** Smallest authorised live-integrity remediation  
**Date:** 26/07/2026 (BST)  
**Branch:** recovery/gc-exec-batch-005  
**Canonical audit baseline:** GC-FULLSTACK-STATIC-AUDIT-001-R2 (preserved; not rewritten)  
**Status:** COMPLETE  

---

## 1. Completion verdict

COMPLETE for authorised Sprint 003 scope. FE-001, FE-002 and FE-003 fixed with tests. No unrelated findings remediated. No deploy, merge to main, or production change. R2 remains the canonical static audit register.

## 2. Starting and ending SHAs

| Role | SHA |
|------|-----|
| Starting HEAD (R2 docs) | `554722aca9876628da637673994c2b42a42b9589` |
| Audited implementation HEAD (pre-report) | `999f9f93f1dfd52a3b11f033678ce2dc017213c3` |
| Evidence/report commit | Reported separately in Cursor final response |
| origin/main (unchanged) | `20515a11b12026bb6e90c47b023cfb582ab8f718` |

### Fix commits

| Finding | Commit | Message |
|---------|--------|---------|
| FE-001 | `edbbb109bbed665c543ad89cfaf71f00ebf312a7` | fix(wc26): keep stoppage 1H/2H live instead of inventing FT |
| FE-002 | `7365f6129b641811d4f5e3cda7812499a500c411` | fix(live): revalidate SWR on visible without wiping cache |
| FE-003 | `999f9f93f1dfd52a3b11f033678ce2dc017213c3` | fix(live): call useSWR once in useLiveApi for hook stability |

## 3. Files changed

### Application
- `src/lib/wc26-match-status.ts` — stop inventing FT from elapsed>=90 on 1H/2H
- `src/lib/client/fetcher.ts` — visibility: revalidate on visible; never wipe with `undefined` + `revalidate:false`
- `src/lib/client/live-data.ts` — single unconditional `useSWR`; options via `buildUseLiveApiSwrOptions`

### Tests
- `tests/wc26/data-contract.test.mjs` — stoppage remains 2H/1H; FT only when provider says FT
- `tests/wc26/status-contract.test.mjs` — live card true at 2h@90/95
- `tests/lib/fetcher-visibility.test.mjs` — new visibility policy tests
- `tests/lib/use-live-api-hooks.test.mjs` — new hook-stability + options tests

## 4. Defect fixes

### FE-001 — Stoppage forced to FT
- **Before:** `normalizeWc26MatchStatus("2H", 90)` returned `"ft"`
- **After:** returns provider status unchanged; elapsed retained for call-site compatibility only (`void elapsed`)
- **Evidence:** unit contracts updated; false FT invention removed

### FE-002 — SWR cache wipe on visibility
- **Before:** `mutate(() => true, undefined, { revalidate: false })` on every visibilitychange
- **After:** hidden → no-op; visible → `mutate(filter)` revalidate without data wipe (`onLivePollingVisibilityChange`)
- **Evidence:** `tests/lib/fetcher-visibility.test.mjs`

### FE-003 — Conditional Hooks in useLiveApi
- **Before:** early `if (options?.fresh) return useSWR(...)` then second `useSWR`
- **After:** one `return useSWR(..., buildUseLiveApiSwrOptions(options))`
- **Evidence:** source invocation count test + options builder tests; scoped eslint clean on touched files
- **Side effect:** full-repo lint errors 41 → 39 (rules-of-hooks pair removed); remaining lint debt out of scope

## 5. Gate results

| Gate | Command | Result |
|------|---------|--------|
| Unit | `npm run test:unit` | **PASS 141/141** (was 134; +7 new/updated) |
| Typecheck | `npx tsc --noEmit` | **PASS** |
| Lint (scoped sprint files) | `npx eslint` on touched src/tests | **PASS** (exit 0) |
| Lint (full repo) | `npx eslint .` | **FAIL** 39 errors / 60 warnings (pre-existing; improved from 41/60) |
| Build | `npm run build` | **PASS** |
| Playwright smoke | `homepage` + `live-journey` chromium | **PASS 2/2** |

## 6. Acceptance criteria

| Criterion | Status |
|-----------|--------|
| FE-001 fixed with evidence | PASS |
| FE-002 fixed with evidence | PASS |
| FE-003 fixed with evidence | PASS |
| No new audit finding introduced | PASS (scope limited; R2 not expanded) |
| Existing tests still pass | PASS 141/141 |
| No deploy / merge / production change | PASS |
| R2 preserved as canonical baseline | PASS |

## 7. Remaining risks (from R2; not fixed)

Still open after this sprint (unchanged R2 items): FE-004..FE-015, BE-001..BE-012, A11Y-001, ENV-001, BE-002 conditional, inherited BLK-*. Highest next candidates remain overlay empty-blip (FE-005), knockout completion heuristic (FE-006), and global polling scope (FE-004) — separate sprints only.

## 8. Recommended next smallest sprint

**GC-MVP-READINESS-SPRINT-004** (suggested): FE-005 + FE-006 only — live overlay integrity (empty-blip wipe + knockout false completion). Do not mix RL/env proof or lint-script cleanup.

## 9. Prohibited actions confirmation

- No unrelated finding fixes  
- No whole live-system refactor  
- No deploy / merge to main / production change  
- No AI/AEO work  
- R2 not rewritten  
- Unrelated untracked SoT drafts preserved  

---

**GC-MVP-READINESS-SPRINT-003 status:** COMPLETE