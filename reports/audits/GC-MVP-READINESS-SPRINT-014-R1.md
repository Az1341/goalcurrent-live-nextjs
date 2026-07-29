# GC-MVP-READINESS-SPRINT-014 - R1

**Date/time:** 2026-07-29 ~10:50-12:15 BST
**Task ID:** GC-MVP-READINESS-SPRINT-014
**Title:** Next Isolated Canonical Finding After BE-005
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 64a1cd26016ab7ce2ad72f79d2e3c32592495a96
**Implementation commit:** 340d9dedd0888bf3f21fef3c50a334f93accbf2c
**Evidence commit:** d48b099c323a6c39332eb724226641d35b1b668b
**Ending HEAD:** 90482e86a80611dfbbcaa9d83f041cf16ae1944b

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### BE-006 — Auth/provider error messages returned to clients
- **Category:** Information disclosure
- **Severity:** MAJOR
- **Confidence:** High
- **Location:** `src/lib/api-football/route-errors.ts`; `src/lib/pl/api-core.ts`
- **Evidence:** AuthError / `Check API_FOOTBALL_KEY` style messages
- **Root cause:** Unsanitised error mapping
- **Impact:** Config/provider fingerprinting (not raw key values observed)
- **Exploitability:** Low–Medium
- **False-positive disposition:** Not FP
- **Recommended correction:** Generic client errors; detail server-side only
- **Required tests:** Public error envelope contract
- **Remediation size:** S
- **Private-preview blocker:** No
- **Production blocker:** No

No other findings remediated. Closed FE-001–011, FE-015, BE-004, BE-005 untouched.

---

## 2. Eligibility table

| Finding ID | Severity | Exact title | Order | Status | MVP impact | Dependencies | Isolation | Selection |
|---|---|---|---|---|---|---|---|---|
| FE-001–011, FE-015, BE-004, BE-005 | CRITICAL/MAJOR | (closed) | prior | CLOSED | — | — | N/A | Excluded — closed |
| BE-002 / ENV-001 | CONDITIONAL | RL / quota env proof | conditional | OPEN | Abuse if unset | Env proof | No | Excluded — environment-proof-only |
| BE-001 | MAJOR | Unauthenticated upstream fan-out on public PL/WC26 paths | first open MAJOR BE | OPEN | Cost/abuse | Cap fan-out + ENV RL | No (M) | Excluded — still requires rate-limit/env-coupled redesign |
| BE-003 | MAJOR | HTML SSR expensive fetches bypass /api rate limit | after BE-001 | OPEN | Cost | Edge/SSR RL | No (M) | Excluded — still rate-limit architecture |
| BE-006 | MAJOR | Auth/provider error messages returned to clients | after BE-005 | OPEN | Info disclosure | Generic envelope | Yes (S) | **SELECTED** |
| BE-007–010 | MAJOR | FCM / ScoreBat / Sentry / top-scorers | after BE-006 | OPEN | Mixed | Mixed | Mixed | Deferred — lower register order |
| FE-014 | MAJOR | Lint React Compiler / setState-in-effect debt in chrome | FE MAJOR | OPEN | Compiler skips | Phased batches | No as whole | Excluded — see FE-014 decision |
| FE-012/013, A11Y-001, BE-011/012 | MINOR | various | MINOR | OPEN | Lower | Mixed | Mixed | Excluded — higher-severity BE-006 eligible |
| INFO/DEP/CFG | INFO | tooling | info | OPEN | Low | Mixed | Mixed | Excluded — informational |

---

## 3. BE-001 / BE-003 / FE-014 decisions

- **BE-001:** Still M-sized fan-out + distributed RL coupling (ENV-001). Unchanged since Sprint 013. Excluded.
- **BE-003:** Still SSR/edge RL redesign. Excluded.
- **FE-014:** Remains open; not selected; not claimed closed. General lint cleanup prohibited.

---

## 4. Named remaining findings status

| ID | Status |
|---|---|
| BE-001 | OPEN (excluded this sprint — not isolated) |
| BE-003 | OPEN (excluded — SSR/RL architecture) |
| BE-006 | **CLOSED this sprint** |
| BE-007 | OPEN |
| BE-008 | OPEN |
| BE-009 | OPEN |
| BE-010 | OPEN |
| BE-011 | OPEN |
| BE-012 | OPEN |
| FE-012 | OPEN |
| FE-013 | OPEN |
| FE-014 | OPEN (not claimed closed) |
| A11Y-001 | OPEN |

---

## 5. Defect proof

- **Before:** `respondApiFootballFailure` passed `ApiFootballAuthError.message` to clients; `api-core` / `pl/api` returned `API key rejected. Check API_FOOTBALL_KEY.` (and similar auth fingerprints).
- **Required:** Generic client errors; detail server-side only.
- **After:** Shared `apiFootballClientAuthErrorMessage()` ("Live data is temporarily unavailable."); AuthError branch uses captureRouteError then the generic string; PL auth/403 paths use the same helper.
- **Boundary:** `errors.ts`, `route-errors.ts`, `pl/api-core.ts`, `pl/api.ts` (+ focused tests). Debug routes that intentionally mention API_FOOTBALL_KEY remain behind DEBUG_SECRET (BE-005).
- **Football-data / polling / locale / SEO:** Unchanged.

---

## 6. Acceptance matrix

| Control | Result |
|---|---|
| Primary | AuthError envelope omits key fingerprints — PASS |
| Mobile 390 | Homepage + public API probe — PASS |
| Desktop 1440 | Homepage + public API probe — PASS |
| Keyboard/a11y | N/A (API envelope); FE-007 untouched |
| Loading/empty/error | Generic 503 auth envelope; rate_limit path unchanged — PASS |
| Routes/locale | Unchanged — N/A |
| Hydration | Unchanged — N/A |
| Football-data | Unchanged — N/A |
| SEO | Unchanged — N/A |
| Request/polling/Vercel | No new polling or API fan-out — PASS |
| Secrets | No secret values in client envelopes; AuthError detail logged server-side only — PASS |

---

## 7. Commit file lists

### Implementation `340d9dedd0888bf3f21fef3c50a334f93accbf2c`

| Status | Path |
|---|---|
| M | `src/lib/api-football/errors.ts` |
| M | `src/lib/api-football/route-errors.ts` |
| M | `src/lib/pl/api-core.ts` |
| M | `src/lib/pl/api.ts` |
| A | `tests/lib/be-006-client-error-sanitization.test.mjs` |
| A | `tests/e2e/be-006-client-error-sanitization.spec.ts` |

### Evidence (this commit)

| Status | Path |
|---|---|
| A | `reports/audits/GC-MVP-READINESS-SPRINT-014-R1.md` |

---

## 8. Gate results

| Gate | Result |
|---|---|
| BE-006 unit | **4/4 PASS** |
| Full unit | **190/190 PASS** |
| BE-005 adjacent unit regression | **4/4 PASS** |
| BE-006 Playwright (390 + 1440) | **2/2 PASS** |
| Typecheck (`tsc --noEmit`) | **PASS** |
| Scoped lint (changed files) | **0 errors** (3 pre-existing unused-var warnings in api.ts / api-core.ts) |
| Full lint | **33 errors / 57 warnings** (baseline held vs Sprint 013) |
| Production build | **PASS** |
| Tests weakened/skipped/deleted | **No** |

---

## 9. Impact checks

| Area | Assessment |
|---|---|
| Football-data accuracy | Unaffected |
| Fixture/result/match-state | Unaffected |
| Mobile / desktop UX | Homepage remains usable at 390×844 and 1440×900 |
| Accessibility | No UI dialog/landmark change |
| Locale routing | Unaffected |
| Metadata / canonical / SEO | Unaffected |
| Polling frequency | No change |
| API fan-out | No new upstream calls |
| Vercel compute | Negligible (string mapping only) |
| Auth / secrets | Client envelopes sanitized; server logging retains AuthError detail |
| Private-preview | Improved disclosure posture; no deploy |

---

## 10. Infrastructure instability

Transient YouTube API key warnings during Playwright webServer (pre-existing). Did not affect BE-006 authority. One initial Playwright hang was due to a stuck prior webServer on port 4877; cleaned and re-run to **2/2 PASS**.

---

## 11. Remaining limitations

- BE-001, BE-003 still require broader RL/fan-out work.
- BE-007–010 remain open MAJORs.
- FE-014 remains open phased lint debt.
- MINOR FE-012/013, A11Y-001, BE-011/012 remain open.
- Debug authenticated dumps may still mention configuration keys by design (gated by BE-005).
- `configured: Boolean(process.env.API_FOOTBALL_KEY…)` boolean in some envelopes unchanged (not BE-006 AuthError message leak).

---

## 12. Prohibited actions confirmation

NO SECOND FINDING. NO REWORK OF CLOSED FINDINGS. NO GENERAL LINT OR ACCESSIBILITY CLEANUP. NO BROAD REFACTOR. NO GSC EVENT-LOCATION REMEDIATION. NO COMPETITION EXPANSION. NO AI OR AEO. NO NEW OR FASTER POLLING. NO UNNECESSARY API FAN-OUT. NO DEPENDENCY OR LOCKFILE CHANGE. NO ENVIRONMENT OR VERCEL SETTING CHANGE. NO PUSH. NO MERGE. NO DEPLOYMENT. NO PUBLIC RELEASE.

---

Evidence gaps for Sprint 014 commit-chain / ending-HEAD reconciliation are closed in:

`reports/audits/GC-MVP-READINESS-SPRINT-014-AUDIT-CLOSURE-R1.md`

---

**GC-MVP-READINESS-SPRINT-014 status:** COMPLETE