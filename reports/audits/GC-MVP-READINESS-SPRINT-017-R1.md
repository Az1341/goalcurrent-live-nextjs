# GC-MVP-READINESS-SPRINT-017 - R1

**Date/time:** 2026-07-29 ~12:39-14:00 BST
**Task ID:** GC-MVP-READINESS-SPRINT-017
**Title:** Sprint 016 reconciliation + BE-009 Sentry secret-header redaction
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** b5d80aa9b671ebaa683d6a8eeec42c2d5fe1946b
**Phase-1 reconciliation commit:** 373372123209fec00f06269ac48ae46c3efaf2b1
**Implementation commit:** b53adad5b3723ce3a55ba87a12fe147d39a00fe4
**Evidence commit:** e99bd06d82a384c37c3b338fc259994aae99a3e8
**Ending HEAD:** e99bd06d82a384c37c3b338fc259994aae99a3e8
**SHA-fill tip (docs only):** PENDING_TIP

---

## 1. Sprint 016 reconciliation (Phase 1)

| Check | Result |
|---|---|
| Branch | `recovery/gc-exec-batch-005` — matched |
| Required start | `b5d80aa9b671ebaa683d6a8eeec42c2d5fe1946b` — matched |
| Tracked dirty at start | Clean (protected untracked only) |
| Ahead of origin (at start) | 62 |
| Protected untracked | `.mcp.json`, SoT drafts/audits, `scripts/_fix_closure.py`, `scripts/_mvp_route_discover.py` — untouched |

### Full evidence SHA for `e495ab3…`

`e495ab3b174c8f77532ff2c7df2b310419587e56`

### First-parent chain `3b772cad237cc522174496031b302bc8c32dda0d` → `b5d80aa9b671ebaa683d6a8eeec42c2d5fe1946b`

| Full SHA | Parent | Subject | Files | Role |
|---|---|---|---|---|
| `3b772cad237cc522174496031b302bc8c32dda0d` | `c2d6ff06…` | docs(audit): fill Sprint 015 evidence ending HEAD | Sprint 015 R1 | SHA-fill (pre-016 tip / required 016 start) |
| `1b3e3dda8ca2252d6a516aed50eb27bd624139e4` | `3b772cad237cc522174496031b302bc8c32dda0d` | docs(audit): reconcile Sprint 015 ending HEAD to tip 3b772ca | GC-MVP-READINESS-SPRINT-015-R1.md | Reconciliation docs |
| `f735a7c06bc53f11ebc6f5d2f3dc988806eff4bf` | `1b3e3dda8ca2252d6a516aed50eb27bd624139e4` | fix(security): centralize ScoreBat feed fetch and redact token URLs (BE-008) | request.ts (+), getScoreBatEmbed.ts, scorebat.ts, videos.ts, be-008 unit+e2e | Implementation + tests |
| `e495ab3b174c8f77532ff2c7df2b310419587e56` | `f735a7c06bc53f11ebc6f5d2f3dc988806eff4bf` | docs(audit): record GC-MVP-READINESS-SPRINT-016 evidence pack | GC-MVP-READINESS-SPRINT-016-R1.md | Evidence |
| `b5d80aa9b671ebaa683d6a8eeec42c2d5fe1946b` | `e495ab3b174c8f77532ff2c7df2b310419587e56` | docs(audit): fill Sprint 016 evidence ending HEAD | GC-MVP-READINESS-SPRINT-016-R1.md | SHA-fill docs |

**Confirmations:**
- Sprint 015 reconciliation (`1b3e3dda…`) changed documentation only.
- BE-008 implementation SHA is `f735a7c06bc53f11ebc6f5d2f3dc988806eff4bf`.
- `git diff --name-status f735a7c..b5d80aa -- src tests` empty — no application/test changes after BE-008 impl.
- Sprint 016 R1 accurately lists SHAs, files, and gate totals (unit 201/201; lint 33/56; build PASS). Stale Ending HEAD (`e495ab3…`) corrected in Phase-1 docs commit `373372123209fec00f06269ac48ae46c3efaf2b1`.

**Why evidence ≠ tip `b5d80aa…`:** Evidence pack add is `e495ab3…`; tip `b5d80aa…` is documentation-only SHA fill writing Ending HEAD into the pack — same pattern as Sprint 015.

**Phase-1 correction:** `373372123209fec00f06269ac48ae46c3efaf2b1` — docs only (`GC-MVP-READINESS-SPRINT-016-R1.md` Ending HEAD → `b5d80aa…`).

---

## 2. Finding selection (Phase 2)

### Explicit named statuses

| ID | Status | Notes |
|---|---|---|
| BE-001 | OPEN | MAJOR RL/fan-out; M-sized — not isolated this sprint |
| BE-003 | OPEN | MAJOR SSR/API fan-out; M-sized — not isolated |
| BE-009 | CLOSED this sprint | Selected |
| BE-010 | OPEN | MAJOR top-scorers LiveScore fan-out; M |
| BE-011 | OPEN | MINOR |
| BE-012 | OPEN | MINOR |
| FE-012 | OPEN | MINOR |
| FE-013 | OPEN | MINOR |
| FE-014 | OPEN | MAJOR phased lint — not general cleanup |
| A11Y-001 | OPEN | MINOR |
| ENV-001 | OPEN | Conditional env proof — needs external evidence |
| WC Event-location structured data | OPEN (non-R2 / deferred) | Not selected |

### Unresolved register (post-selection, after BE-009 closure)

| ID | Severity | Title | Release relevance | Scope | Safely isolated |
|---|---|---|---|---|---|
| BE-001 | MAJOR | Rate-limit / request fan-out on live paths | High | M | No (broad) |
| BE-003 | MAJOR | SSR/API football-data fan-out | High | M | No (broad) |
| BE-010 | MAJOR | Top-scorers Tier-2 LiveScore day fan-out | High | M | Partial |
| BE-011 | MINOR | (register MINOR) | Low–med | S | Yes |
| BE-012 | MINOR | (register MINOR) | Low–med | S | Yes |
| FE-012 | MINOR | (register MINOR) | Med | S | Yes |
| FE-013 | MINOR | (register MINOR) | Med | S | Yes |
| FE-014 | MAJOR | Lint debt / phased cleanup | Med | L | No as general cleanup |
| A11Y-001 | MINOR | Accessibility residual | Med | S | Yes |
| ENV-001 | CONDITIONAL | Environment proof gaps | Conditional | — | Needs external env |
| BE-002 | CONDITIONAL | Env-coupled | Conditional | — | Needs env proof |

Closed earlier (not reopened): FE-001–011, FE-015, BE-004, BE-005, BE-006 (+correction), BE-007, BE-008.

### Selected finding

**BE-009 — Sentry beforeSend omits custom secret headers** (MAJOR, XS)

**Why next:** After BE-008, next register-ordered safely isolated release-relevant MAJOR; single file; unit-testable; no competition expansion.

**Higher-priority exclusions:**
- No unresolved BLOCKER/CRITICAL in R2 register for this sprint path.
- BE-001 / BE-003 — excluded (not complete isolated closure).
- BE-010 — larger fan-out scope; not XS.
- ENV-001 — needs external environment evidence.
- FE-014 — prohibited as uncontrolled lint cleanup.
- Competition / AI / AEO — prohibited.

No unselected finding claimed closed.

---

## 3. Problem / root cause / behaviour

1. **Defective behaviour:** `beforeSend` deleted only `authorization` and `cookie`; `x-cron-secret` / `x-debug-secret` could enter Sentry request headers when Sentry is enabled.
2. **Root cause:** Incomplete header redaction allowlist in `src/lib/sentry-config.ts`.
3. **Affected:** Operators / telemetry (secrets in third-party error events); cron/debug-authenticated routes if those headers are attached to captured requests.
4. **Before:** Custom secret headers retained on outbound Sentry events.
5. **After:** Case-insensitive deletion of `authorization`, `cookie`, `x-cron-secret`, `x-debug-secret` via `redactSentryRequestHeaders` used by `beforeSend`.
6. **Release risk:** Conditional production secret exposure via telemetry when Sentry enabled — reduced.
7. **User benefit:** Cron/debug credentials are not leaked into error telemetry.
8. **MVP readiness:** Closes a MAJOR secret-handling gap without expanding product surface.

---

## 4. Commits and files

| Commit | Role | Files |
|---|---|---|
| `373372123209fec00f06269ac48ae46c3efaf2b1` | Phase-1 docs | `reports/audits/GC-MVP-READINESS-SPRINT-016-R1.md` |
| `b53adad5b3723ce3a55ba87a12fe147d39a00fe4` | Implementation + tests | `src/lib/sentry-config.ts`, `tests/lib/be-009-sentry-secret-headers.test.mjs` |
| e99bd06d82a384c37c3b338fc259994aae99a3e8 | Evidence | `reports/audits/GC-MVP-READINESS-SPRINT-017-R1.md` |

Optional SHA-fill only if Ending HEAD placeholder requires it after evidence commit.

---

## 5. Test-to-behaviour matrix

| Test | Behaviour covered |
|---|---|
| Unit: redact cron/debug + auth/cookie | Secret headers removed; non-secret retained |
| Unit: case-insensitive keys | `X-Cron-Secret` / `Authorization` etc. removed |
| Unit: beforeSend on ErrorEvent | Init hook applies redaction |
| Unit: missing request/headers | No throw; passthrough |
| Unit: source contract | Config lists custom secret header names |
| E2E BE-008 mobile+desktop | ScoreBat token hygiene regression |
| E2E BE-007 mobile+desktop | FCM idToken gate regression |
| E2E BE-006 mobile+desktop | Client error sanitisation regression |
| Full unit suite | Adjacent regressions |
| Typecheck / lint / build | Quality gates |

BE-009 is not browser-observable; no dedicated Playwright. BE-005 not required (auth/server routing untouched).

---

## 6. Gate results

| Gate | Result |
|---|---|
| Focused BE-009 unit | **5/5 PASS** |
| Full unit suite | **206/206 PASS** |
| Playwright BE-008 | **2/2** (390×844, 1440×900) |
| Playwright BE-007 | **2/2** (same viewports) |
| Playwright BE-006 | **2/2** (same viewports) |
| Playwright total this sprint | **6/6 PASS** |
| Typecheck (`tsc --noEmit`) | **PASS** |
| Scoped lint (changed impl/test) | **0 errors** |
| Full lint | **33 errors / 56 warnings** (within ≤33/56) |
| Production build | **PASS** (Playwright webServer `npm run build && npm run start`) |

---

## 7. Impact assessment

| Area | Effect |
|---|---|
| Football-data accuracy | None |
| Fixtures / results / match states | None |
| ScoreBat video | Unchanged (BE-008 regression PASS) |
| Mobile / desktop UX | Unchanged (homepage e2e PASS) |
| Accessibility | None |
| Locale routing | None |
| Metadata / canonicals | None |
| Structured data | None |
| Sitemap / indexing | None |
| Auth / secret handling | Improved — Sentry redaction complete for cron/debug headers |
| Token exposure | Reduced for telemetry path |
| Polling / API fan-out / caching / Vercel compute | None — no new fetches |
| Private-preview behaviour | Unchanged |

---

## 8. Infrastructure warnings

- npm `Unknown env config "devdir"` noise — non-authoritative.
- Playwright webServer `[YouTube] YOUTUBE_API_KEY missing` — local env; does not undermine BE-009 evidence.

---

## 9. Remaining limitations

- BE-001, BE-003, BE-010 and other open findings remain.
- Sentry must still be configured with DSN for telemetry to fire; redaction is defensive when enabled.
- Header names beyond the documented set are not redacted (by design — finding scope).

---

## 10. Confirmations

- Exactly one finding changed: **BE-009**.
- No second finding, competition expansion, dependency/lockfile, env/Vercel config, or history rewrite.
- Nothing pushed, merged, deployed, or publicly released.

---

**GC-MVP-READINESS-SPRINT-017 status:** COMPLETE
