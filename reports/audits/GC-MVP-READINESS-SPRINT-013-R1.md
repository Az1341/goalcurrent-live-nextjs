# GC-MVP-READINESS-SPRINT-013 - R1

**Date/time:** 2026-07-26 ~19:05-19:40 BST
**Task ID:** GC-MVP-READINESS-SPRINT-013
**Title:** Next Isolated Canonical Finding After BE-004
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 9b823c6f83f9556895f0e9dcc678bf5da4681209
**Implementation commit:** a2ca91cc7e0b65a2d2f1dff5274f20035292fd77
**Evidence commit:** 207ae7dfde41342374917799fd55d28e5e3f8494
**Ending HEAD:** 207ae7dfde41342374917799fd55d28e5e3f8494

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### BE-005 — Debug dumps authorised by DEBUG_SECRET or CRON_SECRET
- **Category:** Security (secret coupling)
- **Severity:** MAJOR
- **Confidence:** High
- **Location:** `src/lib/server/cache.ts` `isDebugAuthorized`; `src/app/api/debug/**`
- **Evidence:** R1/secrets evidence
- **Root cause:** Shared secret acceptance
- **Impact:** Cron secret becomes debug oracle if leaked/weak
- **Exploitability:** Medium (secret-dependent)
- **False-positive disposition:** Not FP
- **Recommended correction:** Separate DEBUG_SECRET; never accept CRON_SECRET for debug
- **Required tests:** Auth matrix for debug routes
- **Remediation size:** S
- **Private-preview blocker:** Conditional if preview shares weak secrets / development openness
- **Production blocker:** Conditional if mis-set

No other findings remediated. GSC Event-location work was restored before the gate and remains out of this sprint.

---

## 2. Eligibility table

| Finding ID | Severity | Exact title | Order | Status | MVP impact | Dependencies | Isolation | Selection |
|---|---|---|---|---|---|---|---|---|
| FE-001–011, FE-015, BE-004 | CRITICAL/MAJOR | (closed) | prior | CLOSED | — | — | N/A | Excluded — closed |
| BE-002 / ENV-001 | CONDITIONAL | RL / quota env proof | conditional | OPEN | Abuse if unset | Env proof | No | Excluded — environment-proof-only |
| BE-001 | MAJOR | Unauthenticated upstream fan-out on public PL/WC26 paths | first open MAJOR BE | OPEN | Cost/abuse | Cap fan-out + ENV RL | No (M) | Excluded — still requires rate-limit/env-coupled redesign; unchanged since Sprint 012 |
| BE-003 | MAJOR | HTML SSR expensive fetches bypass /api rate limit | after BE-001 | OPEN | Cost | Edge/SSR RL | No (M) | Excluded — still rate-limit architecture; unchanged |
| BE-005 | MAJOR | Debug dumps authorised by DEBUG_SECRET or CRON_SECRET | after BE-004 | OPEN | Secret coupling | DEBUG_SECRET only | Yes (S) | **SELECTED** |
| BE-006–010 | MAJOR | errors / FCM / ScoreBat / Sentry / top-scorers | after BE-005 | OPEN | Mixed | Mixed | Mixed | Deferred — lower register order |
| FE-014 | MAJOR | Lint React Compiler / setState-in-effect debt in chrome | FE MAJOR | OPEN | Compiler skips | Phased batches | No as whole | Excluded — see FE-014 decision |
| FE-012/013, A11Y-001, BE-011/012 | MINOR | various | MINOR | OPEN | Lower | Mixed | Mixed | Excluded — higher-severity BE-005 eligible |
| INFO/DEP/CFG | INFO | tooling | info | OPEN | Low | Mixed | Mixed | Excluded — informational |
| GSC Event location | N/A (non-R2 sprint item) | Missing field location | separate | OPEN | SEO | — | Yes | **Prohibited** this sprint |

---

## 3. BE-001 / BE-003 / FE-014 decisions

- **BE-001:** Reassessed. Still M-sized fan-out + distributed RL coupling (ENV-001). No code/env change since Sprint 012 that makes an isolated closure feasible. Excluded.
- **BE-003:** Reassessed. Still SSR/edge RL redesign. Excluded.
- **FE-014:** Remains open; not selected; not claimed closed. R2 phased small batches; general lint cleanup prohibited.

---

## 4. Closure cross-check

| Check | Evidence |
|---|---|
| Not closed | Sprint 012 deferred BE-005+ |
| Not superseded | `isDebugAuthorized` still OR-fallbacked CRON before this sprint |
| Not indirect FE/BE-004 | Ownership bind unrelated |
| Not GSC location | Restored `worldcup2026/page.tsx` before gate |
| No credentials required to implement | Pure auth logic + unit matrix |
| Not another finding | Single helper + routes already call it |

---

## 5. Defect proof

- **Before:** `DEBUG_SECRET || CRON_SECRET` authorised `/api/debug/**` via Bearer or `x-debug-secret`.
- **Required:** DEBUG_SECRET only; never accept cron secret.
- **Impact:** Cron credential no longer unlocks diagnostic dumps.
- **Root cause:** Shared secret acceptance in `isDebugAuthorized`.
- **Boundary:** `src/lib/server/cache.ts` only (routes already gate via helper).
- **Football-data / polling / locale / SEO:** Unchanged.

---

## 6. Acceptance matrix

| Control | Result |
|---|---|
| Primary | Unauth/cron probes to debug APIs return 401 — PASS |
| Mobile/desktop | Homepage usable at 390/1440 — PASS |
| Keyboard/a11y | N/A (API auth); FE-007 still PASS |
| Loading/empty/error | 401 unauthorized envelope — PASS |
| Routes/locale | Unchanged — N/A |
| Hydration | Unchanged — N/A |
| Football-data | Unchanged — N/A |
| SEO | Unchanged; GSC out of scope — N/A |
| Request/polling/Vercel | No new polling; debug remains gated — PASS |

---

## 7. Changed files

1. `src/lib/server/cache.ts`
2. `tests/lib/be-005-debug-auth.test.mjs`
3. `tests/e2e/be-005-debug-auth.spec.ts`

---

## 8. Focused verification

| Gate | Result |
|---|---|
| BE-005 unit | 4/4 PASS |
| BE-005 Playwright 390+1440 | 2/2 PASS |
| Typecheck | PASS |
| Scoped lint | PASS |

---

## 9. Regression gate

| Gate | Result |
|---|---|
| Unit suite | **186/186 PASS** |
| FE-004 | 2/2 PASS |
| FE-007 | 3/3 PASS |
| FE-009 | 2/2 PASS |
| FE-010 | 2/2 PASS |
| FE-011 | 5/6 then retry of failed case 2/2 PASS (flake; see infra) |
| FE-015 | 2/2 PASS |
| BE-004 | 2/2 PASS |
| Homepage / live / mobile-critical | PASS |
| Typecheck / scoped lint | PASS |
| Full lint | **33 errors / 57 warnings** |
| Production build | PASS |

---

## 10. Infrastructure record

- Prebuilt `next start` on port 4881 with temporary local `reuseExistingServer=true` (reverted; not committed).
- FE-011 mobile default-locale PL hub table link timed out once; desktop of same suite passed; immediate retry of the failing line **2/2 PASS** with unchanged BE-005 code. Classified as transient UI/data flake, not BE-005 regression. Authoritative FE-011 remains PASS after retry. Authoritative BE-005 Playwright remains the initial **2/2**.

---

## 11. Audits

- Football-data, locale, SEO, polling unchanged.
- No new endpoints, dependencies, lockfiles, env/Vercel settings.
- No GSC Event-location remediation in this sprint.
- Protected untracked files untouched.

---

## 12. UTF-8

Evidence written via Python UTF-8 LF. Null-byte scan and strict decode at evidence commit.

---

## 13. Remaining limitations / unresolved

- BE-001, BE-003, BE-006–012, FE-012–014, A11Y-001, ENV/INFO/DEP/CFG remain open as applicable.
- FE-014 still phased open.
- Separate GSC `/worldcup2026` missing Event `location` remains outside this sprint.
- Production requires a distinct `DEBUG_SECRET` for debug routes (cron secret alone no longer works by design).

---

## 14. Prohibited actions confirmation

NO SECOND FINDING. NO REWORK OF CLOSED FINDINGS. NO GENERAL LINT OR ACCESSIBILITY CLEANUP. NO BROAD REFACTOR. NO GSC EVENT-LOCATION REMEDIATION. NO COMPETITION EXPANSION. NO AI OR AEO. NO NEW OR FASTER POLLING. NO UNNECESSARY API FAN-OUT. NO DEPENDENCY OR LOCKFILE CHANGE. NO ENVIRONMENT OR VERCEL SETTING CHANGE. NO PUSH. NO MERGE. NO DEPLOYMENT. NO PUBLIC RELEASE.

---

**GC-MVP-READINESS-SPRINT-013 status:** COMPLETE

---

## 15. Audit-closure addendum

Evidence gaps for BE-005 authentication matrix, equal-secret configuration limitation, secret-exposure assessment, and fail-closed behaviour are closed in:

`reports/audits/GC-MVP-READINESS-SPRINT-013-AUDIT-CLOSURE-R1.md`

No application code or tests were changed by the audit-closure task.
