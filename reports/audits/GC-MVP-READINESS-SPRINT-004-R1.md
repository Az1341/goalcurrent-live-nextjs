# GC-MVP-READINESS-SPRINT-004-R1

**Project:** GoalCurrent  
**Report code:** GC-MVP-READINESS-SPRINT-004-R1  
**Type:** Controlled live overlay / knockout completion remediation  
**Date:** 26/07/2026 (BST)  
**Branch:** recovery/gc-exec-batch-005  
**Canonical audit baseline:** GC-FULLSTACK-STATIC-AUDIT-001-R2 (preserved)  
**Authorised findings:** FE-005, FE-006 only  
**Status:** COMPLETE  

---

## 1. Completion verdict

COMPLETE for authorised Sprint 004 scope. FE-005 and FE-006 corrected with focused unit tests. No FE-004, backend, lint cleanup, dependency, or unrelated changes. No push, merge, or deployment. R2 remains canonical.

## 2. Pre-execution gate

| Check | Result |
|-------|--------|
| Branch | recovery/gc-exec-batch-005 PASS |
| Starting HEAD | `aed804390c2542b09f3b691719c04b00977b5511` PASS |
| Tracked overlap on target files | None PASS |
| Untracked SoT drafts | Preserved (not committed) |

## 3. R2 traceability

### FE-005
- **Location:** `src/lib/wc26-fixture-overlay.ts` `replaceLiveFixtureOverlay` (+ `applyWc26ScoresToOverlay` live empty path)
- **Root cause:** Replace-all cleared live rows before merge; empty partial wiped valid live data
- **Required tests:** Empty live payload preserves prior overlay; later valid data replaces; confirmed empty possible
- **Preview/Production blocker:** Yes / Yes (R2)

### FE-006
- **Location:** `src/lib/wc26-fixture-overlay.ts` `isEffectiveFixtureCompleted`
- **Root cause:** Knockout + `apiFixtureId` + scores (and kickoff+scores fallthrough) invented completion
- **Required tests:** Live KO / ET / pens not completed; provider FT/AET/PEN completed; no elapsed-only completion
- **Preview/Production blocker:** Yes / Yes (R2)

## 4. SHAs

| Role | SHA |
|------|-----|
| Starting HEAD | `aed804390c2542b09f3b691719c04b00977b5511` |
| Audited implementation HEAD (pre-report) | `f209c653316c5187edb85a38f94ae8200566826f` |
| FE-005 commit | `54793df5c24e50120b72bac10cb95f789263fc37` |
| FE-006 commit | `f209c653316c5187edb85a38f94ae8200566826f` |
| Evidence/report commit | Reported separately in Cursor final response |
| origin/main (unchanged) | `20515a11b12026bb6e90c47b023cfb582ab8f718` |

## 5. Files changed

### Application
- `src/lib/wc26-fixture-overlay.ts`

### Tests
- `tests/wc26/overlay-empty-blip.test.mjs` (new) — FE-005
- `tests/wc26/knockout-completion.test.mjs` (new) — FE-006

No other application, config, dependency, or lockfile files.

## 6. Before / after behaviour

### FE-005
- **Before:** `replaceLiveFixtureOverlay({})` deleted all live overlay rows then merged empty → scores/status disappeared on blip
- **After:** empty partial is a no-op (retain last-known live). Non-empty live replace still authoritative. `clearLiveFixtureOverlay()` provides confirmed-empty clear without indefinite wipe-on-blip
- **applyWc26ScoresToOverlay:** live phase with `matches: []` no longer erases prior live rows; error-without-matches already preserved prior rows

### FE-006
- **Before:** knockout with `apiFixtureId` + scores ⇒ completed even while `2h`/`et`/`penalties`; group with scores + past kickoff also completed
- **After:** completion only via `isCompletedMatchStatus` (ft/aet/pen/finished/completed/full-time). Live regulation, stoppage, ET, and in-play penalties stay incomplete until provider finished status

## 7. Gate results

| Gate | Result |
|------|--------|
| Unit (full) | **PASS 152/152** |
| FE-001/002/003 regression spot-check | **PASS 23/23** |
| Typecheck | **PASS** |
| Lint scoped (touched files) | **PASS** |
| Lint full repo | **FAIL 39 errors / 60 warnings** (unchanged vs Sprint 003 post-state; no new problems) |
| Build | **PASS** |
| Playwright homepage + live-journey | **PASS 2/2** |

Deterministic overlay/knockout coverage is provided by the new unit fixtures (no dependency on a real live match). Playwright validates homepage + live journey smoke.

## 8. Request / polling impact

- No new polling intervals
- No new SWR subscriptions
- No new provider/API fan-out
- No changes to `LIVE_POLL_*` or `Wc26ResultsSync` cadence

## 9. Change-scope audit

Diff vs starting HEAD touches only:
- `src/lib/wc26-fixture-overlay.ts`
- `tests/wc26/overlay-empty-blip.test.mjs`
- `tests/wc26/knockout-completion.test.mjs`

Rejected/not present: FE-004, backend/RL, deps, navigation, AI/AEO, general lint cleanup.

## 10. Remaining R2 risks (unchanged)

FE-004, FE-007–FE-015, BE-*, ENV-001, BE-002 conditional, inherited BLK-*, lint debt 39/60.

**Suggested next smallest sprint:** FE-007 (More sheet keyboard/focus) or FE-008 (preview robots.txt) — single product concern each.

## 11. Prohibited actions confirmation

- No FE-004 remediation  
- No backend/environment work  
- No competition expansion  
- No dependency updates  
- No general lint cleanup  
- No push / merge / deploy / public release  
- R2 not rewritten  
- Unrelated untracked files preserved  

---

**GC-MVP-READINESS-SPRINT-004 status:** COMPLETE