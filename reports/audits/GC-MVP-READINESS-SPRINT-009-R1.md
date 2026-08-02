# GC-MVP-READINESS-SPRINT-009 - R1

**Date/time:** 2026-07-26 ~16:44-17:10 BST
**Task ID:** GC-MVP-READINESS-SPRINT-009
**Title:** Next Canonical Frontend Remediation After FE-009
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 6894c202fc7c13ae98f67818ab7b2744a714ecc0
**Implementation commit:** 351ef38ca6c81793eaa9b3476cf58186733c9d73
**Evidence commit:** (this docs commit; SHA in return payload)
**Ending HEAD:** (after this docs commit)

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### FE-010 - PL shared SWR key with divergent fetchers
- **Category:** State ownership
- **Severity:** MAJOR
- **Confidence:** Medium-High
- **Location:** HomeClient / useLiveFixtures / PlHubClient
- **Evidence:** R1
- **Root cause:** Same key, different transforms
- **Impact:** Cache pollution / wrong shape by mount order
- **Exploitability:** N/A
- **False-positive disposition:** Not FP
- **Recommended correction:** One fetcher per key or distinct keys
- **Required tests:** Mount-order cache shape test
- **Remediation size:** S
- **Private-preview blocker:** No
- **Production blocker:** No

No other findings remediated. FE-011 not touched.

## 2. Selection rationale

| Finding | Severity | Eligible | Reason |
|---|---|---|---|
| FE-001..009 | various | No | Closed |
| FE-010 | MAJOR | Yes | Selected - next unresolved MAJOR FE after FE-009 |
| FE-011+ | MAJOR/MINOR | Deferred | Lower register order / out of scope |

## 3. Closure cross-check

- Sprint 002 reduced homepage PL subscription duplication but left HomeClient useSWR(fetcher) vs PlHub divergent fetcher.
- FE-004/FE-009 did not remediate FE-010.
- No prior closure pack closes FE-010.

## 4. Key and request ownership

| Consumer | Before key | Before fetcher | After |
|---|---|---|---|
| useLiveFixtures / PlFixtures / PlLive | /api/pl/fixtures | shared useLiveApi fetcher | unchanged |
| HomeClient | /api/pl/fixtures | raw fetcher via useSWR | useLiveFixtures (same key+fetcher) |
| PlHubClient | /api/pl/fixtures | custom fetch then withVisitorBroadcasters | useLiveFixtures + useMemo view transform |

Semantic note: visitor broadcaster enrichment is a view-layer transform of the same PlFixturesApiResponse contract, not a different API resource. Distinct keys were therefore not required.

Refresh cadence: hub interval LIVE_POLL_HUB_MS (75s) via useLiveApi; not shortened.

## 5. Before / after

- Before: shared SWR key with divergent PlHub fetcher could pollute cache shape by mount order.
- After: one canonical owner (useLiveFixtures); PlHub applies broadcasters after fetch.

## 6. Files changed

Implementation 351ef38ca6c81793eaa9b3476cf58186733c9d73:
1. src/app/[locale]/HomeClient.tsx
2. src/components/pl/PlHubClient.tsx
3. tests/lib/fe-010-pl-fixtures-key.test.mjs
4. tests/e2e/fe-010-pl-fixtures-key.spec.ts
5. tests/lib/home-pl-subscription.test.mjs
Evidence: reports/audits/GC-MVP-READINESS-SPRINT-009-R1.md

## 7. Acceptance matrix

| Criterion | Result |
|---|---|
| Correct PL data | PASS |
| Cache-key consistency | PASS |
| Request deduplication | PASS (single key) |
| Refresh cadence | PASS (unchanged 75s hub) |
| Loading/empty/error | PASS |
| Mobile / desktop | PASS |
| Accessibility | PASS (FE-007 regression); no dialog change |
| Hydration | PASS |
| SEO / routes | unchanged |
| API / Vercel | no new path; no fan-out; no shorter poll |

## 8. Quality gates

| Gate | Result |
|---|---|
| Focused unit FE-010 | PASS 4/4 |
| Complete unit | PASS 170/170 |
| Playwright FE-010 mobile 390 + desktop 1440 | PASS 2/2 |
| Playwright FE-004/007/009 + mobile + homepage + live + PL hub | PASS (FE-010 suite + regressions); articles-404 unknown-route flake unrelated |
| Typecheck | PASS |
| Scoped eslint | PASS 0 problems |
| Full eslint | 34 errors / 58 warnings (improved from 38/60; within ceiling) |
| Production build | PASS (Playwright webServer) |

## 9. Football-data / request / SEO

- No fixture/team/score/status/kickoff transforms changed.
- Broadcaster enrichment remains hub-only view transform.
- No new polling, endpoints, or Vercel functions.
- SEO/robots/sitemap unchanged.

## 10. Remaining limitations

- FE-011 locale-unsafe Links untouched.
- PlClubProfileClient / PlTableClient still use ad-hoc fetch (not SWR shared key); outside FE-010 Location wording.

## 11. Remaining unresolved R2 frontend findings

FE-011, FE-012, FE-013, FE-014, FE-015, A11Y-001. BE-*/ENV/INFO remain as in R2.

## 12. UTF-8 verification

Written with Node utf8 and real newlines. Zero null bytes. Strict UTF-8 decode OK. No encoding-repair commit.

## 13. Prohibited-action confirmation

No second finding. No FE-001-009 rework. No FE-011. No general data-layer refactor. No competition/AI/AEO/backend/env/Vercel/dependency/lockfile changes. No protected untracked edits. Nothing pushed, merged, or deployed.

**GC-MVP-READINESS-SPRINT-009 status:** COMPLETE
