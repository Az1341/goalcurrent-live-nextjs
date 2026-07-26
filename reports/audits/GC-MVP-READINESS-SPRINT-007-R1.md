# GC-MVP-READINESS-SPRINT-007 - R1

**Date/time:** 2026-07-26 ~15:36-16:45 BST
**Task ID:** GC-MVP-READINESS-SPRINT-007
**Title:** Next Canonical Frontend Remediation
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 32794b9cc92618374c08c7f6117198f01fe4d073
**Implementation commit:** 7867367310e691ca17af27b7fbd0face5854a6f0
**Evidence commit:** (this docs commit; SHA in return payload)
**Ending HEAD:** (after this docs commit)

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### FE-004 - Site-wide WC26 live/results polling from Layout
- **Category:** Performance / client efficiency
- **Severity:** MAJOR
- **Confidence:** High
- **Location:** src/components/layout/Layout.tsx -> Wc26ResultsSync; LIVE_POLL_MATCH_MS 15000 via fresh path
- **Evidence:** Source + R1; archiveComplete stops polls
- **Root cause:** Global mount of live sync
- **Impact:** Background traffic on all pages (former PERF-001)
- **Exploitability:** N/A
- **False-positive disposition:** Not FP
- **Recommended correction:** Scope polling to live/match/bracket surfaces; demote cadence
- **Required tests:** Non-live routes do not start 15s live polls
- **Remediation size:** S-M
- **Private-preview blocker:** Yes (noisy/budget)
- **Production blocker:** Yes (cost/reliability under load)

No other findings remediated.

---

## 2. Selection rationale

FE-004 selected as the next unresolved MAJOR frontend private-preview blocker after closed FE-001..003, FE-005..008. FE-007 must not be reworked. FE-009+ deferred.

## 3. Closure cross-check

Sprint 001-006 packs do not close FE-004. Archive mode nulls poll paths today, but R2 still requires Layout mount scoping. No duplicate unmerged FE-004 work.

## 4. Component contract

- Before: Layout globally mounted Wc26ResultsSync with fresh 15s for live and results.
- After: Layout does not mount sync; LivePageClient and MatchPageClient mount it; results cadence demoted to LIVE_POLL_HUB_MS (75s); live remains fresh 15s on scoped surfaces.
- Bracket remains covered by BracketLivePolling (unchanged).
- Root cause: global Layout mount of live sync bootstrap.

## 5. Acceptance matrix

| Criterion | Result |
|---|---|
| Correct behaviour | PASS |
| Mobile UX | PASS |
| Desktop non-regression | PASS |
| Keyboard/a11y for FE-004 | N/A (polling scope); FE-007 regression PASS |
| Hydration | PASS |
| Request/polling/API | PASS (reduced) |
| SEO | N/A |

## 6. Files changed

Implementation commit 7867367310e691ca17af27b7fbd0face5854a6f0:
1. src/components/layout/Layout.tsx
2. src/components/wc26/Wc26ResultsSync.tsx
3. src/app/[locale]/live/LivePageClient.tsx
4. src/app/[locale]/match/[fixtureId]/MatchPageClient.tsx
5. tests/wc26/fe-004-layout-polling.test.mjs
6. tests/e2e/fe-004-layout-polling.spec.ts
Evidence: reports/audits/GC-MVP-READINESS-SPRINT-007-R1.md

## 7. Quality gates

| Gate | Result |
|---|---|
| Focused unit FE-004 | PASS 3/3 |
| Complete unit | PASS 163/163 |
| Playwright FE-004 mobile 390 + desktop 1440 | PASS 2/2 |
| Playwright FE-007 + mobile-critical + homepage + live-journey | PASS 7/7 |
| Typecheck npx tsc --noEmit | PASS |
| Scoped eslint | PASS 0 problems |
| Full eslint | 38 errors / 60 warnings (baseline; no increase) |
| Production build via Playwright webServer | PASS |

## 8. Accessibility

FE-004 is polling-scope only. FE-007 More sheet a11y regressions PASS. No new a11y dependency.

## 9. Request / polling / API / Vercel

Removed site-wide Layout sync. Demoted results cadence 15s -> 75s on scoped mounts. No new API routes, polling loops, provider fan-out, dependencies, or Vercel function paths.

## 10. Remaining limitations

- FinalWinnerCelebration still mounted from locale layout with archive-gated pollers; outside FE-004 Location wording; untouched.
- Home overlay refresh no longer driven by global Layout sync when archive incomplete (intentional R2 live/match/bracket scope).

## 11. Remaining unresolved R2 frontend findings

FE-009, FE-010, FE-011, FE-012, FE-013, FE-014, FE-015, A11Y-001. BE-*/ENV/INFO remain as in R2.

## 12. UTF-8 verification

Written with Node fs.writeFileSync utf8. Zero null bytes. Strict UTF-8 decode OK. No encoding-repair commit.

## 13. Prohibited-action confirmation

No second finding. No FE-007 rework. No competition/AI/AEO. No Vercel/env/dependency/lockfile changes. No protected untracked edits. Nothing pushed, merged, or deployed.

**GC-MVP-READINESS-SPRINT-007 status:** COMPLETE
