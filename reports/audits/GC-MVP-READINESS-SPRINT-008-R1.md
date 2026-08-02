# GC-MVP-READINESS-SPRINT-008 - R1

**Date/time:** 2026-07-26 ~15:54-16:15 BST
**Task ID:** GC-MVP-READINESS-SPRINT-008
**Title:** Next Canonical Frontend Finding After FE-004
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** b5b51fcafca70a23707c37fdc88f0ede2646fd4a
**Implementation commit:** f1a34575e504d6b4c59473952048cdeec8241474
**Evidence commit:** (this docs commit; SHA in return payload)
**Ending HEAD:** (after this docs commit)

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### FE-009 - Dual news fetch stacks
- **Category:** State ownership / performance
- **Severity:** MAJOR
- **Confidence:** High
- **Location:** src/lib/use-news-feed.ts vs NewsHub SWR /api/news
- **Evidence:** R1 news audit + architecture
- **Root cause:** Separate owners/caches
- **Impact:** Divergent freshness; possible duplicate traffic across surfaces
- **Exploitability:** N/A
- **False-positive disposition:** Not FP
- **Recommended correction:** Single ownership model per product decision
- **Required tests:** One owner per route surface
- **Remediation size:** M
- **Private-preview blocker:** No
- **Production blocker:** No

No other findings remediated.

## 2. Selection and exclusion

| Finding | Severity | Eligible | Reason |
|---|---|---|---|
| FE-001..008 | various | No | Closed; must not rework |
| FE-009 | MAJOR | Yes | Selected - next unresolved MAJOR FE after closed set |
| FE-010+ | MAJOR/MINOR | Deferred | Lower in FE register order than FE-009 |

Sprint 002 audited dual news pollers with NO consolidation. FE-009 remained open.

## 3. Closure cross-check

- Not closed/superseded by FE-004 or FE-007.
- Sprint 002 NEWS evidence: AUDITED - NO CODE CHANGE.
- No local unmerged FE-009 remediation before this sprint.

## 4. Component contract

- Before: useNewsFeed used a custom useSyncExternalStore + setInterval module store; NewsHub owned a separate useSWR(/api/news) stack.
- After: useNewsFeed is the sole SWR owner of /api/news; NewsHub and home/profile/group consume that hook.
- Root cause: separate owners/caches for the same endpoint.
- Boundary: only use-news-feed.ts + NewsHub.tsx + focused tests. No FE-011 Link locale fix.

## 5. Acceptance matrix

| Criterion | Result |
|---|---|
| Primary behaviour | PASS - single owner |
| Football-data | N/A (news RSS, not fixtures) |
| Mobile UX | PASS |
| Desktop non-regression | PASS |
| Accessibility | PASS (no dialog change; FE-007 regression PASS) |
| Loading/empty/error | PASS - preserved via hook flags |
| Routes/links | PASS - routes unchanged; FE-011 left as-is |
| Hydration | PASS - NewsHub keeps SSR fallbackData |
| SEO | unchanged |
| Requests/polling | PASS - same 3600000ms cadence; shared SWR key |

## 6. Files changed

Implementation f1a34575e504d6b4c59473952048cdeec8241474:
1. src/lib/use-news-feed.ts
2. src/components/news/NewsHub.tsx
3. tests/lib/fe-009-news-ownership.test.mjs
4. tests/e2e/fe-009-news-ownership.spec.ts
Evidence: reports/audits/GC-MVP-READINESS-SPRINT-008-R1.md

## 7. Quality gates

| Gate | Result |
|---|---|
| Focused unit FE-009 | PASS 3/3 |
| Complete unit | PASS 166/166 |
| Playwright FE-009 mobile 390 + desktop 1440 | PASS 2/2 |
| Playwright FE-004 + FE-007 + mobile-critical + homepage + live | PASS (10/10 combined run) |
| Typecheck | PASS |
| Scoped eslint | PASS 0 problems |
| Full eslint | 38 errors / 60 warnings (baseline; no increase) |
| Production build | PASS |

## 8. Accessibility / UX

No chrome/dialog changes. News hub heading remains accessible. FE-007 More sheet regressions PASS. Homepage axe deferred color-contrast only (pre-existing).

## 9. Football-data / request / SEO / Vercel

- No fixture/result transform changes.
- Removed duplicate ownership stack; refresh remains 3_600_000 ms visibility-aware; no reduced interval; no new global polling; no new API route or Vercel function path.
- Shared SWR key improves cache coherence across surfaces.
- SEO/robots/sitemap/locale routes unchanged.

## 10. Remaining limitations

- FE-011 locale-unsafe next/link on NewsHub/HomeLatestNews left untouched (separate finding).
- FE-010 PL shared key divergence untouched.

## 11. Remaining unresolved R2 frontend findings

FE-010, FE-011, FE-012, FE-013, FE-014, FE-015, A11Y-001. BE-*/ENV/INFO remain as in R2.

## 12. UTF-8 verification

Evidence written with Node fs.writeFileSync utf8 and real newlines. Zero null bytes. Strict UTF-8 decode OK. No encoding-repair commit.

## 13. Prohibited-action confirmation

No second finding. No FE-001-008 rework. No FinalWinnerCelebration change. No competition/AI/AEO/backend/env/Vercel/dependency/lockfile changes. No protected untracked edits. Nothing pushed, merged, or deployed.

**GC-MVP-READINESS-SPRINT-008 status:** COMPLETE
