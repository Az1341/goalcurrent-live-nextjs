# GC-MVP-READINESS-SPRINT-012 - R1

**Date/time:** 2026-07-26 ~18:40-19:20 BST
**Task ID:** GC-MVP-READINESS-SPRINT-012
**Title:** Next Canonical MVP Finding After FE-015
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 2998145ca068272552538d024541f8c011c15ff1
**Implementation commit:** 565868bba18353f0a6d16b3bcfb732ae69e9405c
**Evidence commit:** (this docs commit; SHA in return payload)
**Ending HEAD:** (after this docs commit)

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### BE-004 — WC26 apiFixtureId trusted without ownership bind
- **Category:** Data integrity / abuse
- **Severity:** MAJOR
- **Confidence:** High
- **Location:** src/app/api/wc26/match/[fixtureId]/route.ts; src/lib/server/wc26-match-detail.ts
- **Evidence:** Optional query override used for events/lineups/stats
- **Root cause:** Missing league/fixture ownership check (unlike PL)
- **Impact:** Wrong match detail; extra quota burn
- **Exploitability:** Medium
- **False-positive disposition:** Not FP
- **Recommended correction:** Bind apiFixtureId to local fixture/league/season
- **Required tests:** Reject mismatched apiFixtureId
- **Remediation size:** S
- **Private-preview blocker:** No
- **Production blocker:** No

No other findings remediated. Closed FE-001–011 and FE-015 untouched. FE-014 not claimed closed.

---

## 2. Eligibility table (unresolved register)

| Finding ID | Severity | Exact title | Order | Status | Area | User/MVP impact | Actionable | Isolated | Selection |
|---|---|---|---|---|---|---|---|---|---|
| FE-001–011, FE-015 | CRITICAL/MAJOR | (closed) | prior | CLOSED | FE | — | N/A | N/A | Excluded — closed |
| BE-002 / ENV-001 | CONDITIONAL | RL / quota env proof | conditional | OPEN | env | Abuse if unset | Env-only | No | Excluded — environment proof |
| BE-001 | MAJOR | Unauthenticated upstream fan-out on public PL/WC26 paths | first MAJOR BE | OPEN | API fan-out | Cost/abuse | Partial | No (M, couples ENV) | Excluded — unsuitable isolated sprint; needs fan-out budget + RL proof |
| BE-003 | MAJOR | HTML SSR expensive fetches bypass /api rate limit | after BE-001 | OPEN | proxy/SSR | Cost | Partial | No (M) | Excluded — architecture/RL scope |
| BE-004 | MAJOR | WC26 apiFixtureId trusted without ownership bind | after BE-003 | OPEN | match API | Wrong detail + quota | Yes | Yes (S) | **SELECTED** |
| BE-005–010 | MAJOR | debug secrets / errors / FCM / ScoreBat / Sentry / top-scorers | after BE-004 | OPEN | various | Security/perf | Mixed | Mixed | Deferred — lower register order than BE-004 |
| FE-014 | MAJOR | Lint React Compiler / setState-in-effect debt in chrome | FE MAJOR | OPEN | chrome lint | Compiler skips | Phased | No as whole | Excluded — see FE-014 decision |
| FE-012 | MINOR | Unsanitised article HTML + JSON-LD script sink | MINOR | OPEN | articles | XSS defense | Yes | Yes | Excluded — lower severity |
| FE-013 | MINOR | Hydration risks from locale/time formatting | MINOR | OPEN | time UI | Flicker | Yes | Yes | Excluded — lower severity |
| A11Y-001 | MINOR | Colour contrast / landmark / h1 | MINOR | OPEN | a11y | WCAG | Partial | No (M) | Excluded — lower severity; general a11y cleanup prohibited |
| BE-011/012 | MINOR | knockout logs / stale cache | MINOR | OPEN | API | Low | Yes | Yes | Excluded — lower severity |
| INFO/DEP/CFG | INFO | product model / audit / CI pins | info | OPEN | tooling | Low | Mixed | Mixed | Excluded — informational |

---

## 3. FE-014 decision

FE-014 remains **open** and **not selected**.

R2 recommends fixing src clusters in small batches (remediation size M, phased). TASK controls prohibit general lint cleanup and prohibit claiming FE-014 closed via a partial slice. No discrete independently closable defect is defined beyond the phased programme. Therefore FE-014 is deferred; higher-severity MAJORs BE-001/BE-003 were excluded as unsuitable for one isolated sprint, making BE-004 the next eligible MAJOR.

---

## 4. Closure cross-check

| Check | Evidence |
|---|---|
| Not closed previously | Sprint 001–011 packs list BE-* remaining |
| Not superseded | Query override still trusted before this sprint |
| Not indirect FE-009/010/011/015 | Those were news/SWR/locale/poll cadence |
| Not founder-deferred | No deferral for BE-004 |
| No unavailable credentials required | Bind works with registry + optional provider verify |
| Not in another local commit | New helpers first appear in impl commit |

---

## 5. Defect proof

- **Before:** indApiFootballFixtureId returned caller knownApiFixtureId immediately; route used query ?? registry without league/season/fixture bind.
- **Required:** Reject mismatched ids; bind to WC league 1 / season 2026 and local fixture identity.
- **Impact:** Wrong events/lineups/stats; unnecessary upstream fan-out.
- **Root cause:** Missing ownership check on optional query override.
- **Boundary:** wc26-api-fixture-id.ts classifiers/bind helpers; 
esolveTrustedWc26ApiFixtureId in match-detail; match route 400 on mismatch.
- **Football-data:** Prevents wrong-provider fixture detail; does not alter scores/standings transforms.
- **Request impact:** Adds at most one /fixtures?id= verify for unregistered overrides; prevents 4-way events/lineups/stats/players fan-out on unbound ids. No new polling. No shorter intervals.

---

## 6. Acceptance matrix

| Control | Result |
|---|---|
| Primary journey | Match page loads with mocked owned detail — PASS |
| Mobile 390 | PASS |
| Desktop 1440 | PASS |
| Keyboard/a11y | N/A semantic change; FE-007 still PASS |
| Loading/empty/error | 400 envelope on mismatch; ignore unbound when unverifiable — PASS |
| Hydration | N/A — API/server only |
| Football-data | Ownership bind only — PASS |
| Locale/SEO | Unchanged — N/A |
| Request ownership | Trusted id only before fan-out — PASS |
| Polling | Unchanged — N/A |
| API/Vercel | Reduced unsafe fan-out; optional single verify — PASS |

---

## 7. Implementation files

1. src/lib/server/wc26-api-fixture-id.ts
2. src/lib/server/wc26-match-detail.ts
3. src/app/api/wc26/match/[fixtureId]/route.ts
4. 	ests/lib/be-004-api-fixture-ownership.test.mjs
5. 	ests/e2e/be-004-api-fixture-ownership.spec.ts

---

## 8. Focused verification

| Gate | Result |
|---|---|
| 
px tsx --test tests/lib/be-004-api-fixture-ownership.test.mjs | 6/6 PASS |
| Playwright BE-004 (390 + 1440) | 2/2 PASS |
| 
px tsc --noEmit | PASS |
| Scoped eslint on touched files | PASS |

---

## 9. Regression gate

| Gate | Result |
|---|---|
| Unit suite | **182/182 PASS** |
| FE-004 | 2/2 PASS |
| FE-007 | 3/3 PASS |
| FE-009 | 2/2 PASS |
| FE-010 | 2/2 PASS |
| FE-011 | 6/6 PASS |
| FE-015 | 2/2 PASS |
| Mobile-critical / homepage / live | PASS |
| Combined Playwright batch | **22/22 PASS** |
| Typecheck | PASS |
| Scoped lint | PASS |
| Full lint | **33 errors / 57 warnings** (ceiling held) |
| Production build | PASS |

---

## 10. Infrastructure-noise record

Playwright webServer uild && start historically can exceed 180s. This sprint used a prebuilt 
ext start on port 4880 with temporary local 
euseExistingServer=true (reverted; not committed). Assertions executed and passed. Not used to hide application failures.

---

## 11. Audits

- Football-data transforms unchanged; ownership gate only.
- Locale, routes, SEO unchanged.
- No new/global/faster polling.
- No dependency/lockfile/Vercel/env changes.
- Temporary playwright.config toggle reverted before commit.

---

## 12. UTF-8 verification

Evidence written via Python UTF-8 (LF). Null-byte scan and strict decode recorded at evidence commit.

---

## 13. Remaining limitations

- Unregistered overrides without API key are ignored (not 400) because ownership cannot be proven offline — still never trusted for upstream fan-out.
- BE-001/BE-003/FE-014 and remaining BE/FE MINORs still open.
- A11Y-001 match-detail landmark/h1 moderate axe notes remain pre-existing.

---

## 14. Remaining unresolved findings (high level)

FE-012, FE-013, FE-014, A11Y-001, BE-001–003, BE-005–012, BE-002/ENV-001 conditional, INFO/DEP/CFG, inherited BLK-* as applicable.

---

## 15. Prohibited actions confirmation

NO SECOND FINDING. NO REWORK OF CLOSED FINDINGS. NO GENERAL LINT OR ACCESSIBILITY CLEANUP. NO BROAD REFACTOR. NO COMPETITION EXPANSION. NO AI OR AEO. NO NEW OR FASTER POLLING. NO UNNECESSARY REQUEST OR API FAN-OUT. NO DEPENDENCY OR LOCKFILE CHANGE. NO ENVIRONMENT OR VERCEL SETTING CHANGE. NO PROTECTED UNTRACKED-FILE CHANGE. NO PUSH. NO MERGE. NO DEPLOYMENT. NO PUBLIC RELEASE.

---

**GC-MVP-READINESS-SPRINT-012 status:** COMPLETE
