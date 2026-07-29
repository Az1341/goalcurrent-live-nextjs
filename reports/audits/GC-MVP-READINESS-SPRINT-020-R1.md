# GC-MVP-READINESS-SPRINT-020 - R1

**Date/time:** 2026-07-29 ~15:10-16:30 BST
**Task ID:** GC-MVP-READINESS-SPRINT-020
**Title:** Sprint 019 reconciliation + BE-012 stale success-cache flag surfacing
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** f3623e10e43b86b5bfdcb1dcfe56c0c411ddc991
**Phase-1 reconciliation commit:** bb487fbdd48abbf4160492139464948c9054833f
**Implementation commit:** f1139ebf9361db895835641e5b97c8d7701666f6
**Evidence commit:** PENDING_EVIDENCE_SHA
**Ending HEAD:** PENDING_ENDING_HEAD

---

## 1. Sprint 019 reconciliation (Phase 1)

| Check | Result |
|---|---|
| Branch | `recovery/gc-exec-batch-005` — matched |
| Required start | `f3623e10e43b86b5bfdcb1dcfe56c0c411ddc991` — matched |
| Tracked dirty at start | Clean (protected untracked only) |
| Ahead of origin (at start) | 81 |
| Protected untracked | `.mcp.json`, SoT drafts/audits, fix/discover scripts — untouched |

### Sprint 019 first-parent chain (full SHAs)

| Full SHA | Parent | Subject | Files | Classification |
|---|---|---|---|---|
| `c77ac0c1fe33bbf678fe3d59e5b23e14cd3323b0` | (prior) | docs(audit): reconcile Sprint 018 ending HEAD to tip b9aa8d8 | S018 R1 | Docs (S018 tip) |
| `58443a749cd78aec90c885b824d77d97d1203c4f` | `c77ac0c…` | docs(audit): reconcile Sprint 018 ending HEAD to tip c77ac0c | S018 R1 | Documentation |
| `76a4c60381d4f9f981aa9fb6db03a9f10fd48077` | `58443a7…` | fix(security): strip diagnostic fetch logs from knockout API (BE-011) | knockout route, `wc26-knockout-fixtures.ts`, `be-011-*.test.mjs` | Implementation + tests |
| `cb903bc4d3f2781d763a5031cc86c64c98b58c8b` | `76a4c60…` | docs(audit): record GC-MVP-READINESS-SPRINT-019 evidence pack | S019 R1 | Evidence |
| `24f4d7b60961f39e2d8364ebbc0de5a942a1350c` | `cb903bc…` | docs(audit): fill Sprint 019 evidence ending HEAD | S019 R1 | Documentation |
| `f3623e10e43b86b5bfdcb1dcfe56c0c411ddc991` | `24f4d7b…` | docs(audit): reconcile Sprint 019 ending HEAD to tip 24f4d7b | S019 R1 | Documentation |

### Post-BE-011 implementation file check

`git diff --name-only 76a4c60…f3623e1 -- src tests` → **empty**.

### Sprint 019 evidence accuracy

S019 R1 correctly records impl `76a4c60…`, evidence `cb903bc…`, unit **235/235**, lint **33/56**, Playwright **6/6**. Ending HEAD field was stale at `24f4d7b…` vs tip `f3623e1…`.

### Phase-1 correction this sprint

`bb487fbdd48abbf4160492139464948c9054833f` — docs only: Ending HEAD → `f3623e1…`.

---

## 2. Exact canonical BE-012 entry

Quoted from `reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md`:

> #### BE-012 — Stale success cache masks upstream failures
> - **Category:** Data freshness
> - **Severity:** MINOR
> - **Confidence:** High
> - **Location:** `src/lib/api-football/cache.ts`
> - **Evidence:** R1
> - **Root cause:** Serve stale on failure
> - **Impact:** Stale scores possible
> - **Exploitability:** N/A
> - **False-positive disposition:** Not FP
> - **Recommended correction:** Surface stale flag in UI contracts
> - **Required tests:** Stale header/body asserted
> - **Remediation size:** S
> - **Private-preview blocker:** No
> - **Production blocker:** No

**Status:** OPEN (register MINOR) prior to this sprint.

---

## 3. Current-code verification (before change)

| Claim | Code reality |
|---|---|
| Stale success retained on failure | Confirmed: `setSuccessApiCache` writes `stale:${key}` (900s); routes call `getStaleApiCache` on failure |
| Consumers | `/api/wc26/scores`, `/api/wc26/match/[fixtureId]`, `/api/pl/standings` via `respondApiFootballFailure` |
| Body `stale` boolean | Already set in route `buildBody` helpers |
| UI contracts | `LivePageClient` / `MatchPageClient` already read `.stale` for banners |
| HTTP stale header | **Missing** before this sprint |
| Focused tests for header/body | **Missing** before this sprint |

Defect still reproducible as incomplete surfacing (no header + no required tests). Not ALREADY CORRECT.

---

## 4. Isolation verdict

**PROCEED — safely isolated.**

Bounded correction in `cache.ts` + `route-errors.ts` (+ tests). Preserves stale resilience. Does not touch BE-001 fan-out architecture, BE-003 SSR RL, polling, provider selection, or global cache redesign.

---

## 5. Root cause and authorised contract

**Root cause:** On upstream failure, retained success payloads were returned (by design) with body `stale: true` in most builders, but without a stable HTTP marker and without required automated header/body assertions — allowing clients to under-detect stale fallback.

**Authorised cache contract after correction:**

| State | Fresh key | Stale key | Upstream | Public markers |
|---|---|---|---|---|
| Fresh success | set (≤300s default) | set (900s) | 1 on miss | no `stale`, no `X-GC-Stale` |
| Fresh cache hit | read | untouched | **0** | unmarked success body |
| Upstream failure + stale retained | untouched | read | 1 failed attempt | body `stale: true` + header `X-GC-Stale: 1` + non-2xx |
| Upstream failure + no stale | untouched | miss | 1 failed attempt | body `stale: false`, no header |
| Auth failure | untouched | ignored | 1 | `stale: false`, no header, no retained matches |
| Recovery success | overwrite fresh+stale | overwrite | 1 | unmarked success |

**Maximum upstream requests per logical failure response:** 1 (the failed fetch). Failure path performs **0** cache writes.

**Concurrency:** Existing in-memory LRU only; no new single-flight required for this finding (failure path does not multiply upstream).

---

## 6. Before / after measurement matrix

| Scenario | Cache state | Upstream calls | Concurrent duplication | Returned state | Public behaviour |
|---|---|---:|---:|---|---|
| Upstream success | fresh+stale written | 1 | N/A | unmarked success | 200, no `X-GC-Stale` |
| Fresh cache | fresh hit | 0 | N/A | prior success | 200, unmarked |
| Expired fresh + success | rewrite | 1 | N/A | new success | 200, unmarked |
| Partial/rate-limit with stale | stale read | 1 fail | N/A | retained matches + `stale:true` | 503 + `X-GC-Stale: 1` |
| Total failure no stale | miss | 1 fail | N/A | empty + `stale:false` | 5xx, no header |
| Auth failure | stale ignored | 1 fail | N/A | empty + `stale:false` | 503, no header |
| Concurrent identical (success path) | shared LRU | per miss | process-local | success | unchanged |
| Recovery | fresh+stale rewritten | 1 | N/A | unmarked success | 200 |

Values from `cache.ts` / `route-errors.ts` + BE-012 unit tests.

---

## 7. Caller / cache inventory

| Component | Role |
|---|---|
| `src/lib/api-football/cache.ts` | `setSuccessApiCache` / `getStaleApiCache` / TTLs / `X-GC-Stale` constant |
| `src/lib/api-football/route-errors.ts` | Failure responder; attaches stale header when serving retained body |
| `src/app/api/wc26/scores/route.ts` | Fresh LRU + stale fallback + body `stale` |
| `src/app/api/wc26/match/[fixtureId]/route.ts` | Same pattern |
| `src/app/api/pl/standings/route.ts` | Stale fallback + body `stale` |
| `LivePageClient` / `MatchPageClient` | UI consume `.stale` for banner `fetchedAt` |
| Browser fetcher | Parses JSON even on 503 (pre-existing); relies on `stale`/`error` fields |

---

## 8. Exact changed files

### Phase-1 docs
- `reports/audits/GC-MVP-READINESS-SPRINT-019-R1.md`

### Implementation + tests (`f1139eb…`)
- `src/lib/api-football/cache.ts`
- `src/lib/api-football/route-errors.ts`
- `tests/lib/be-012-stale-success-cache.test.mjs`

### Evidence
- `reports/audits/GC-MVP-READINESS-SPRINT-020-R1.md`

---

## 9. Test-to-behaviour matrix

| Test | Behaviour |
|---|---|
| Fresh success cached / TTLs | Fresh+stale write |
| Fresh hit unmarked | No stale marker |
| Failure + stale → header+body | `X-GC-Stale: 1`, `stale:true` |
| Total failure | `stale:false`, no header, no raw leak |
| Auth failure | Never serves stale success |
| Key isolation | `stale:` prefix + distinct keys |
| Recovery | Unmarked fresh restore |
| Route/UI contracts | Source assertions |
| Failure path budget | Zero cache writes |
| BE-010…BE-006 regressions | Adjacent |
| Full unit | 251/251 |
| Playwright BE-006/007/008 | 6/6 |

Dedicated BE-012 Playwright: **N/A for header** (HTTP marker is API-contract); live/match UI already consume body `stale`. Adjacent homepage security regressions run at both viewports.

---

## 10. Gate results

| Gate | Result |
|---|---|
| Focused BE-012 unit | **16/16 PASS** |
| Full unit suite | **251/251 PASS** (235 → 251 = +16) |
| Playwright BE-006/007/008 | **6/6 PASS** (390×844, 1440×900) |
| Typecheck | **PASS** |
| Scoped lint | **0 errors** |
| Full lint | **33 errors / 56 warnings** |
| Production build | **PASS** (Playwright webServer) |

---

## 11. Impact audit

| Area | Effect |
|---|---|
| Live freshness | Honest: stale fallback marked header+body |
| Fixture/result accuracy | Retained stale data still available under failure |
| Identity / match states | Untouched |
| Cache correctness | Explicit fresh vs stale keys; failure does not overwrite |
| Polling / fan-out / compute | No increase; failure path 0 cache writes |
| Auth / sanitisation | Auth path still suppresses stale; messages remain client-safe |
| UX / a11y / locale / SEO | Untouched; banners already use `.stale` |
| Private-preview | Untouched |
| BE-001 / BE-003 | **Not changed; remain OPEN** |

---

## 12. Remaining limitations

- Stale fallback resilience intentionally retained (not removed).
- Process-local LRU only (multi-instance duplicate upstream still possible — out of BE-012 scope).
- BE-001, BE-003 and other open findings remain.

---

## 13. Confirmations

- Exactly one finding changed: **BE-012**.
- Nothing pushed, merged, deployed, or publicly released.
- No history rewrite, dependency/lockfile, env/Vercel, or competition expansion.

---

**GC-MVP-READINESS-SPRINT-020 status:** COMPLETE
