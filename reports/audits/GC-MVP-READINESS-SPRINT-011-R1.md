# GC-MVP-READINESS-SPRINT-011 - R1

**Date/time:** 2026-07-26 ~18:00-18:40 BST
**Task ID:** GC-MVP-READINESS-SPRINT-011
**Title:** Next Canonical Frontend Finding After FE-011
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 749f3b812cedd61477cc7047687bd7031fe05792
**Implementation commit:** 1e86cce45e9403bf4fd0216316f3cc3abd963051
**Evidence commit:** (this docs commit; SHA in return payload)
**Ending HEAD:** (after this docs commit)

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### FE-015 — Match-detail and live-centre poll multiplication
- **Category:** Performance / client efficiency
- **Severity:** MAJOR
- **Confidence:** High
- **Location:** src/lib/use-match-detail.ts; LiveMatchCentre lineup polls; alongside FE-004 global scores
- **Evidence:** R1 frontend audit (former PERF-002)
- **Root cause:** Per-match pollers + global scores
- **Impact:** Inflated Vercel/upstream request rate on live surfaces
- **Exploitability:** N/A
- **False-positive disposition:** Not FP; not double-counted with FE-004
- **Recommended correction:** Share scores cache; stop finished-match polls
- **Required tests:** Finished match poll interval 0
- **Remediation size:** S–M
- **Private-preview blocker:** Partial
- **Production blocker:** Partial (rate limits)

No other findings remediated. FE-001–011 untouched.

---

## 2. Eligibility and exclusion table

| Finding ID | Severity | Exact title | Canonical order | Status | Affected area | Actionability | Selection / exclusion |
|---|---|---|---|---|---|---|---|
| FE-001–011 | CRITICAL/MAJOR | (closed) | prior | CLOSED | various | N/A | Excluded — closed; do not rework |
| FE-012 | MINOR | Unsanitised article HTML + JSON-LD script sink | after MAJORs | OPEN | ArticleBody / JsonLd | Yes | Excluded — lower severity than open MAJORs |
| FE-013 | MINOR | Hydration risks from locale/time formatting | after FE-012 | OPEN | HomeHero / PL / Live JSON-LD | Yes | Excluded — lower severity |
| FE-014 | MAJOR | Lint React Compiler / setState-in-effect debt in chrome | before FE-015 | OPEN | BottomTabBar, More sheet, headers, Auth/FCM, PlHub | Phased M | Excluded — R2 phased small batches; TASK 14 prohibits general lint cleanup; cannot close as one isolated MVP remediation |
| FE-015 | MAJOR | Match-detail and live-centre poll multiplication | after FE-014 | OPEN | use-match-detail / live centre | Yes (S–M) | **SELECTED** — highest-priority actionable MAJOR that can close with required test |
| A11Y-001 | MINOR | Colour contrast / landmark / h1 issues | after FE-013 | OPEN | homepage / live / match | Partial | Excluded — lower severity |

---

## 3. Selection rationale

FE-014 is the earlier MAJOR in register order, but it is explicitly phased maintainability debt whose recommended correction is a multi-batch lint programme. Closing it in one sprint would violate the no general lint cleanup control. FE-015 is the next MAJOR with a clear MVP user/cost benefit, an explicit required test (finished match poll interval 0), shared scores-cache ownership already aligned with FE-004, and Partial private-preview / rate-limit relevance.

---

## 4. Closure cross-check

| Check | Evidence |
|---|---|
| Not closed in FE-001–011 | Sprint 003–010 reports list FE-015 remaining open |
| Not in another impl commit | No prior matchDetailRefreshIntervalMs / finished-poll stop |
| Not obsolete | MatchPageClient still called useMatchDetail(fixtureId, true) unconditionally |
| Not founder-deferred | No deferral note for FE-015 in R2 or sprint packs |
| Not indirectly resolved by FE-009/010/011 | Those were news ownership, PL SWR key, locale Link |

Paths: reports/audits/GC-MVP-READINESS-SPRINT-010-R1.md; reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md FE-015.

---

## 5. Defect proof (before correction)

- **Current behaviour:** Match detail used refreshInterval poll && fetchReady ? POLL_MS : 0 with MatchPageClient always passing poll=true, so FT/AET/PEN matches kept a 15s /api/wc26/match/:id poller.
- **Required behaviour:** Finished matches use refreshInterval 0; live/in-progress keep match cadence; scores remain on shared useLiveScores cache.
- **User-visible impact:** Unnecessary detail refetch after FT; elevated Vercel/upstream load.
- **Root cause:** Poll flag ignored completed status; SSOT fixtures stay scheduled while live feed has FT.
- **Affected:** src/lib/use-match-detail.ts (consumers: MatchPageClient, MatchLineupPitchSection, bracket lineup bar, MatchCardFinalRound).
- **Mobile/desktop:** Same hook on both viewports.
- **A11y:** N/A to polling cadence (no semantic change).
- **Football-data:** No score/status transform change — only when to poll.
- **Locale/SEO:** Unchanged.
- **Request/polling:** Stops finished-match 15s loops; does not shorten any interval; no new poller.
- **Boundary:** Pure interval helper + status-aware wiring inside use-match-detail only.

---

## 6. Acceptance matrix

| Control | Criterion | Result |
|---|---|---|
| Primary journey | Finished match page loads header; no further match API hits after settle across 15s window | PASS (Playwright 390/1440) |
| Mobile UX | 390px match page stable | PASS |
| Desktop non-regression | 1440px match page stable | PASS |
| Keyboard/a11y | No dialog/semantic change; FE-007 still 3/3 | PASS |
| Loading | Initial detail fetch still occurs | PASS |
| Empty | Lineups/events empty payload still normalised | Unchanged (N/A delta) |
| Error | 503 detail path unchanged | Unchanged (N/A delta) |
| Routes/links | No link changes | N/A — out of finding |
| Locale | No locale routing change | N/A — out of finding |
| Hydration | No new client-only formatters | PASS (no hydration surface change) |
| Football-data | No identity/score/status mapping edits | PASS |
| SEO/canonical | Unchanged | N/A — out of finding |
| Request/polling/API/Vercel | Interval 0 when completed; live keeps LIVE_POLL_MATCH_MS; shared useLiveScores | PASS |

---

## 7. Implementation

Exported matchDetailRefreshIntervalMs(pollRequested, status) using isCompletedMatchStatus. Hook prefers liveMatch?.status over SSOT fixture status, sets SWR refreshInterval from helper, gates overlay/apiFixtureId remutate effects on activePoll. Removed setState-in-effect when persisting apiFixtureId (sessionStorage only) so scoped lint on the touched file stays clean.

Changed files:
1. src/lib/use-match-detail.ts
2. tests/lib/fe-015-match-detail-poll.test.mjs
3. tests/e2e/fe-015-finished-match-poll.spec.ts

---

## 8. Focused verification

| Gate | Command / notes | Result |
|---|---|---|
| Unit FE-015 | npx tsx --test tests/lib/fe-015-match-detail-poll.test.mjs | 2/2 PASS |
| Playwright FE-015 | npx playwright test tests/e2e/fe-015-finished-match-poll.spec.ts --project=chromium (prod webServer) | 2/2 PASS (390 + 1440) |
| Typecheck | npx tsc --noEmit | PASS |
| Scoped lint | eslint on touched code/tests | PASS (0 problems) |

---

## 9. Regression gate

| Gate | Result |
|---|---|
| Complete unit suite | **176/176 PASS** |
| FE-004 Playwright | 2/2 PASS |
| FE-007 More sheet a11y | 3/3 PASS (after infra retry) |
| FE-009 news ownership | 2/2 PASS |
| FE-010 PL fixtures key | 2/2 PASS |
| FE-011 locale Link | 6/6 PASS |
| Mobile-critical journey | 1/1 PASS |
| Homepage journey | 1/1 PASS |
| Live journey | 1/1 PASS |
| Typecheck | PASS |
| Scoped lint | PASS |
| Full lint | **33 errors / 57 warnings** (reference was 34/57; improved by removing setState-in-effect in touched file; no new debt) |
| Production build | PASS |

Authoritative FE-015 Playwright totals: **2 passed** at viewports **390x844** and **1440x900**.

---

## 10. Playwright infrastructure control

| Event | Detail | Authoritative? |
|---|---|---|
| First FE-015 run | prod webServer; 2/2 PASS | Yes — selected finding proof |
| Combined FE-004/011/015/home/live/mobile | prod webServer; 13/13 PASS | Yes for those suites |
| FE-007/009/010 first attempts | Timed out waiting 180000ms from config.webServer (build+start exceeded budget); no assertions executed | Infrastructure noise — not assertion failure |
| FE-007/009/010 retry | Prebuilt next start on port 4879 with temporary local reuseExistingServer=true (reverted; not committed); 7/7 PASS | Authoritative regression pass |

No production code changed to paper over infrastructure. No earlier FE-015 pass overwritten.

---

## 11. Football-data audit

No changes to fixture/team/competition identity, match status mapping, kick-off, scores, standings, locale/date presentation, or API response transforms. Only poll cadence for completed statuses.

---

## 12. Request, polling, API and Vercel audit

| Component | Before | After |
|---|---|---|
| Match detail ownership | useLiveApi on /api/wc26/match/:id | Unchanged owner |
| Scores ownership | useLiveScores shared SWR | Unchanged (already shared) |
| Finished refreshInterval | 15_000 when poll=true | **0** |
| Live refreshInterval | 15_000 | 15_000 (unchanged) |
| New polling | — | None |
| Shorter interval | — | None |
| Provider fan-out | Per-match 15s after FT | Stopped after FT |
| Vercel | Extra function invocations on finished match pages | Reduced |

---

## 13. UX, a11y, locale, SEO

- Mobile/desktop match header remains visible under mocked FT scores.
- No new overflow, hydration warning, locale prefix issue, redirect loop, or SEO route.
- FE-007 keyboard/dialog semantics still pass.
- Live journey axe still reports deferred contrast + moderate landmark/h1 on match detail (pre-existing A11Y-001; not introduced).

---

## 14. Final diff control

Cumulative impl diff limited to the three files above. Confirmed absent: second finding, FE-001–011 rework, general locale-link migration, data-layer refactor, competition expansion, AI/AEO, backend/env/Vercel, general lint cleanup, dependency/lockfile, protected untracked files. Temporary playwright.config reuse toggle was reverted before commit.

---

## 15. UTF-8 verification

Evidence file written with Python Path.write_text(..., encoding=utf-8, newline=LF). Strict decode and null-byte scan recorded at evidence commit time.

---

## 16. Remaining limitations

- LiveMatchCentre already passed poll=isLiveMatchStatus into lineup pitch; FE-015 closes the MatchPageClient unconditional poll path and centralises finished-status interval 0.
- FE-014 chrome lint debt remains open (phased).
- Full lint still fails overall (33/57); not introduced by this sprint.
- API 429 / YouTube key warnings remain environmental noise on webServer logs.

---

## 17. Remaining unresolved R2 frontend findings

FE-012, FE-013, FE-014, A11Y-001 (plus BE-*/ENV/INFO as in R2). FE-015 closed by this sprint.

---

## 18. Prohibited actions confirmation

NO SECOND FINDING. NO FE-001–011 REWORK. NO GENERAL REFACTOR. NO COMPETITION EXPANSION. NO AI OR AEO. NO NEW POLLING. NO SHORTER POLLING INTERVAL. NO UNNECESSARY API REQUEST. NO DEPENDENCY OR LOCKFILE CHANGE. NO ENVIRONMENT OR VERCEL SETTING CHANGE. NO PROTECTED UNTRACKED-FILE CHANGE. NO PUSH. NO MERGE. NO DEPLOYMENT. NO PUBLIC RELEASE.

---

**GC-MVP-READINESS-SPRINT-011 status:** COMPLETE
