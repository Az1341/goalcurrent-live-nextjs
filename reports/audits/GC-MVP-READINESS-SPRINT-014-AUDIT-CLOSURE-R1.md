# GC-MVP-READINESS-SPRINT-014-AUDIT-CLOSURE-R1

**Date/time:** 2026-07-29 ~11:20–11:35 BST
**Task ID:** GC-MVP-READINESS-SPRINT-014-AUDIT-CLOSURE-R1
**Type:** Evidence-only audit closure (no application/test/config changes)
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD (audit start):** 90482e86a80611dfbbcaa9d83f041cf16ae1944b
**Status:** COMPLETE

---

## 1. Repository gate

| Check | Result |
|---|---|
| Branch | `recovery/gc-exec-batch-005` |
| HEAD at audit start | `90482e86a80611dfbbcaa9d83f041cf16ae1944b` |
| Sprint 014 starting HEAD | `64a1cd26016ab7ce2ad72f79d2e3c32592495a96` |
| Sprint 014 implementation | `340d9dedd0888bf3f21fef3c50a334f93accbf2c` |
| Sprint 014 evidence pack | `d48b099c323a6c39332eb724226641d35b1b668b` |
| Tracked dirty app tree | Clean (protected untracked only: `.mcp.json`, SoT drafts, helper scripts) |
| Ahead of origin | 51 commits at audit start (local only; nothing pushed) |

---

## 2. Complete first-parent commit chain

From `64a1cd26…` through `90482e86…` (Sprint 014 range exclusive of start; start shown for parent binding):

| Full SHA | Parent SHA | Subject | Author timestamp (ISO) | Sprint 014? | Classification |
|---|---|---|---|---|---|
| `64a1cd26016ab7ce2ad72f79d2e3c32592495a96` | `207ae7df…` | docs(audit): close Sprint 013 BE-005 evidence gaps | 2026-07-29T10:33:36+01:00 | No (pre-start) | Prior sprint tip / required start |
| `340d9dedd0888bf3f21fef3c50a334f93accbf2c` | `64a1cd26…` | fix(security): sanitize API-Football auth errors for clients (BE-006) | 2026-07-29T11:13:56+01:00 | **Yes** | Implementation + tests |
| `d48b099c323a6c39332eb724226641d35b1b668b` | `340d9ded…` | docs(audit): record GC-MVP-READINESS-SPRINT-014 evidence pack | 2026-07-29T11:14:18+01:00 | **Yes** | Authorised evidence pack |
| `7a939c2bca68f6d5f279b0287e6fb34fb09bdf41` | `d48b099c…` | docs(audit): fill Sprint 014 evidence ending HEAD SHA | 2026-07-29T11:14:18+01:00 | **Yes** | Documentation-only SHA fill |
| `90482e86a80611dfbbcaa9d83f041cf16ae1944b` | `7a939c2b…` | docs(audit): correct Sprint 014 ending HEAD after SHA fill | 2026-07-29T11:15:16+01:00 | **Yes** | Documentation-only correction |

No application or test files appear after `340d9ded…`.

---

## 3. Why evidence = d48b099… and ending HEAD = 90482e86…

1. **Evidence commit `d48b099…`** is the first documentation commit that **adds** `reports/audits/GC-MVP-READINESS-SPRINT-014-R1.md` (the Sprint 014 evidence pack). That is the canonical evidence artefact for the sprint.

2. Immediately after, `7a939c2…` only replaced placeholders:
   - Evidence commit → `d48b099…`
   - Ending HEAD → incorrectly also set to `d48b099…` (same as evidence)

3. **`90482e86…`** then corrected Ending HEAD from `d48b099…` → `7a939c2…` (the SHA-fill commit). It touches only the R1 markdown (1 line). Classification: **documentation-only correction** (authorised Sprint 014 evidence hygiene; not an application/test change; not unrelated work).

4. At audit start the **true tip** was already `90482e86…`, but R1 still listed Ending HEAD as `7a939c2…` (one SHA behind tip). This audit closes that gap by setting Ending HEAD to `90482e86…` and recording the full chain here.

---

## 4. Classification of `90482e86…`

**Documentation-only correction** within authorised Sprint 014 evidence hygiene.

- Diff: `reports/audits/GC-MVP-READINESS-SPRINT-014-R1.md` only (`Ending HEAD` field).
- No `src/**`, no `tests/**`, no lockfile/env/config.

---

## 5. Changed-file lists

### Implementation `340d9ded…`

| Status | Path |
|---|---|
| M | `src/lib/api-football/errors.ts` |
| M | `src/lib/api-football/route-errors.ts` |
| M | `src/lib/pl/api-core.ts` |
| M | `src/lib/pl/api.ts` |
| A | `tests/lib/be-006-client-error-sanitization.test.mjs` |
| A | `tests/e2e/be-006-client-error-sanitization.spec.ts` |

### Evidence pack `d48b099…`

| Status | Path |
|---|---|
| A | `reports/audits/GC-MVP-READINESS-SPRINT-014-R1.md` |

### Additional `7a939c2…`

| Status | Path |
|---|---|
| M | `reports/audits/GC-MVP-READINESS-SPRINT-014-R1.md` |

### Additional `90482e86…`

| Status | Path |
|---|---|
| M | `reports/audits/GC-MVP-READINESS-SPRINT-014-R1.md` |

### Aggregate Sprint 014 range `64a1cd26…` → `90482e86…`

| Status | Path |
|---|---|
| M | `src/lib/api-football/errors.ts` |
| M | `src/lib/api-football/route-errors.ts` |
| M | `src/lib/pl/api-core.ts` |
| M | `src/lib/pl/api.ts` |
| A | `tests/lib/be-006-client-error-sanitization.test.mjs` |
| A | `tests/e2e/be-006-client-error-sanitization.spec.ts` |
| A | `reports/audits/GC-MVP-READINESS-SPRINT-014-R1.md` |

---

## 6. Client-sanitisation evidence matrix

| Guarantee | Proof |
|---|---|
| AuthError never returned to clients as `error.message` | `route-errors.ts` AuthError branch uses `apiFootballClientAuthErrorMessage()` only; unit case 2 injects sensitive AuthError text and asserts body equals the generic string |
| `Check API_FOOTBALL_KEY` never returned | Absent from `api-core.ts` / `api.ts` / `route-errors.ts` sources; unit forbids fragment; Playwright forbids fragment on public JSON routes |
| Provider AuthError exception text never in client envelope | Unit case 2: AuthError constructed with provider fingerprint text; response JSON has no `API_FOOTBALL_KEY` / rejected-key phrases |
| Stack traces never in client envelope | `respondApiFootballFailure` returns `NextResponse.json(buildBody(...))` only — no stack fields |
| Exact client auth string | `apiFootballClientAuthErrorMessage()` returns exactly `Live data is temporarily unavailable.` |
| Consistency across helpers | `errors.ts` defines helper; `route-errors.ts`, `api-core.ts` (auth kind), `api.ts` (AuthError + 403 paths) all call the same helper |

Non-auth residual (documented, out of BE-006 AuthError fingerprint defect): `api-core.ts` `kind: "quota"` / `kind: "api"` still assign `error.message` into the fetch-result `message` field (may surface via `mapFetchError`). Rate-limit and unknown paths via `respondApiFootballFailure` use classified `apiFootballErrorMessage(code)` generics.

---

## 7. Server-side diagnostic retention

`respondApiFootballFailure` AuthError branch calls `captureRouteError(route, error)` **before** building the client body. `captureRouteError` (`src/lib/log.ts`) logs via `console.error` and `Sentry.captureException` with the original Error object. Unit run of AuthError case emits `[test/be-006] ApiFootballAuthError: API key rejected…` on stderr while the JSON body remains generic — proving detail stays server-side.

---

## 8. Secret-exposure assessment

| Surface | Assessment |
|---|---|
| Client AuthError envelopes | Generic string only; no env var names, no key values |
| Unit / Playwright fixtures | Use placeholder fingerprint strings as inputs/forbids; not production credentials |
| Evidence reports | Name env keys only; no secret values |
| Debug routes mentioning `API_FOOTBALL_KEY` | Still gated by BE-005 `DEBUG_SECRET`; out of public BE-006 envelope |

---

## 9. Test-to-behaviour mapping

| Case | Proves |
|---|---|
| Unit: client auth message is generic | Exact helper text; no env/key fingerprint in the string |
| Unit: AuthError envelope sanitizes provider detail | Sensitive AuthError.message → generic body; status 503; `unknown_error` code |
| Unit: non-auth failures use classified messages | Rate-limit path still uses `apiFootballErrorMessage("rate_limit")` (regression) |
| Unit: PL auth paths no longer hardcode fingerprints | `api-core.ts` / `api.ts` / `route-errors.ts` use helper; no `error.message` in AuthError client branch; no Check/rejected-key strings in those sources |
| Playwright mobile 390×844 | Homepage usable; `/api/pl/fixtures`, `/api/pl/standings`, `/api/wc26/scores` omit forbidden fingerprints |
| Playwright desktop 1440×900 | Same envelope probes at desktop viewport |

---

## 10. Gate results (authoritative; no expensive full re-run)

Spot-checked this audit: BE-006 focused unit **4/4 PASS** (minimum scope to reconfirm sanitisation after chain review).

| Gate | Result | Authority |
|---|---|---|
| BE-006 unit | **4/4 PASS** | Reconfirmed this audit |
| Full unit | **190/190 PASS** | Sprint 014 R1 |
| Playwright 390 + 1440 | **2/2 PASS** | Sprint 014 R1 |
| BE-005 regression | **4/4 PASS** | Sprint 014 R1 |
| Typecheck | **PASS** | Sprint 014 R1 |
| Scoped lint | **0 errors** | Sprint 014 R1 |
| Full lint | **33 errors / 57 warnings** | Sprint 014 R1 (baseline held) |
| Build | **PASS** | Sprint 014 R1 |

No material inconsistency requiring full suite / build / Playwright rerun.

---

## 11. Corrections applied

1. Set `GC-MVP-READINESS-SPRINT-014-R1.md` **Ending HEAD** to `90482e86a80611dfbbcaa9d83f041cf16ae1944b` (was stale at `7a939c2…`).
2. Added pointer from R1 to this audit-closure report.
3. Recorded the complete four-commit Sprint 014 chain and file lists above.

---

## 12. Prohibited actions confirmation

NO APPLICATION-CODE CHANGE. NO TEST CHANGE. NO NEW FINDING. NO LINT CLEANUP. NO ENVIRONMENT OR VERCEL CHANGE. NO DEPENDENCY OR LOCKFILE CHANGE. NO HISTORY REWRITE / RESET / REBASE / SQUASH / AMEND. NO PUSH. NO MERGE. NO DEPLOYMENT. NO PUBLIC RELEASE. NO SPRINT 015.

---

**GC-MVP-READINESS-SPRINT-014-AUDIT-CLOSURE-R1 status:** COMPLETE