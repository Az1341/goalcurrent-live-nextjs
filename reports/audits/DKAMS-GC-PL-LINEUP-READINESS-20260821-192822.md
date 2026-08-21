# DKAMS-GC-PL-LINEUP-READINESS-20260821-192822

**Final verdict:** PASS
**DKAMS code:** DKAMS-GC-PL-LINEUP-READINESS-20260821-192822
**Date:** 2026-08-21
**Branch:** `fix/gc-pl-lineup-readiness-20260821`
**MERGED:** NO
**DEPLOYED:** NO

## 0. Urgent live finding (read first)

While gathering evidence for this task, production `/api/pl/match/1557367` and
`/api/pl/live` began returning **`error: "Live data is temporarily unavailable
due to provider rate limits."`** (`ApiFootballRateLimitError`, upstream HTTP
429) starting at approximately **19:33 BST, ~33 minutes after the Arsenal v
Coventry kick-off**. At that point `fixture` degraded from a populated object
to `null` and `source` degraded to `"fallback"` — a full match-detail outage,
not just a pending-lineup state. This was reproduced twice, 40 seconds apart,
with the same result, and the same rate-limit error was also observed on the
unrelated `/api/pl/live` endpoint, confirming it is an account-wide API-Football
throttle, not a fixture-specific issue.

Root cause: production main (`475772a`) has **no server-side cache or
request-coalescing** in `fetchPlMatchDetail` — every client SWR poll (every
30s per active viewer) fans out to 5 parallel API-Football calls
(`fixtures`, `events`, `lineups`, `statistics`, `headtohead`) with zero
de-duplication. As kickoff-time viewership concentrated, this very likely
exhausted the API-Football rate limit. **PR #65 (`fix/gc-launch-reliability-20260821`,
already open, not merged) implements exactly the fix for this** —
`getCachedPlMatchDetail` with singleflight de-dupe and stale-on-failure
fallback — but is still pending Founder review. This task does not merge or
alter PR #65; it is flagged here for immediate escalation because it is a
live, ongoing production degradation, distinct from the lineup-badge defect
this task was opened to investigate.

## 1. Starting branch/SHA

- Task instructed base: `origin/main` @ `475772ac883805597cda27338fe82805c9accf5c`.
- Verified before work: `git fetch origin main` then `git rev-parse origin/main` → `475772ac883805597cda27338fe82805c9accf5c` (exact match).
- Working tree at task start was on `fix/gc-e2e-community-shield-recovery-20260821` (3 commits ahead of main, from the prior E2E recovery task, PR #69) with a **clean working tree** (`git status` → "nothing to commit, working tree clean"). No unrelated uncommitted changes existed, so the STOP condition for unrelated uncommitted work did not apply.
- This task's branch, `fix/gc-pl-lineup-readiness-20260821`, was created fresh from `origin/main` (`git checkout -B ... origin/main`), not from the E2E-recovery branch, to keep this work fully isolated from PRs #67/#68/#69.

## 2. Open PR overlap assessment

| PR | Branch | Files | Overlap with this task |
|---|---|---|---|
| #65 | `fix/gc-launch-reliability-20260821` | `src/lib/pl/match-detail.ts`, `src/app/api/pl/match/[fixtureId]/route.ts`, `src/app/[locale]/premier-league/match/[fixtureId]/page.tsx`, `src/app/api/health/route.ts`, `reports/readiness-score.md`, 2 new test files | **Partial.** PR #65 adds `getCachedPlMatchDetail`/cache-key/TTL exports near the end of `src/lib/pl/match-detail.ts` and does not touch the existing `resolveLineupSides` function (original lines ~225–245). This task adds one `export` keyword to that untouched function (see §7) — additive, non-behavioural, and in a different region of the file from PR #65's diff, so it rebases/merges cleanly regardless of merge order. No other overlapping file was modified. |
| #67 | `fix/gc-issue-66-favourites-team-names-20260821` | Favourites-only files | None. |
| #68 | `fix/gc-ci-unit-esm-gate-20260821` | Test-only ESM-import fixes | None (the 4 pre-existing unit failures this task observes — §11 — are exactly the ones PR #68 already fixes on its own branch). |
| #69 | `fix/gc-e2e-community-shield-recovery-20260821` | `tests/e2e/live-journey.spec.ts`, `production-integrity.spec.ts`, `production-truth-sprint.spec.ts`, `tests/lib/upcoming-competition-windows.test.mjs` | None (this task branched from `origin/main`, not from #69; those e2e files are in their original, pre-#69 state on this branch — see §11 for the resulting pre-existing failures). |

No safe fix in this task required modifying PR #65's files in a conflicting way, so the "stop if a safe fix requires modifying PR #65" condition did not trigger. The CDN cache-TTL question raised in §5 is deliberately **not** fixed here for exactly this reason — see §12.

## 3. Fixture 1557367 observation timeline (evidence, not guesses)

| Time (UTC) | Minutes to/after KO (19:00 UTC) | `fixture.status` | `lineups.home` / `lineups.away` | `source` | Notes |
|---|---|---|---|---|---|
| 18:34:03 | T-26m | UPCOMING/NS | null / null | api-football | `X-Vercel-Cache: HIT`, `Age: 125` |
| 18:39:23 | T-21m | UPCOMING/NS | null / null | api-football | `Age: 208` |
| 18:53:57 | T-6m | UPCOMING/NS | null / null | api-football | `Age: 166` |
| 19:33:29 | T+33m | **(fixture: null)** | null / null | **fallback** | `error: "Live data is temporarily unavailable due to provider rate limits."`, `Age: 0`, `X-Vercel-Cache: MISS` |
| 19:34:13 | T+34m | (fixture: null) | null / null | fallback | Same rate-limit error, reproduced. `/api/pl/live` also returned the same rate-limit error at the same time. |

Kick-off is confirmed from the fixture payload itself: `kickoffUtc: "2026-08-21T19:00:00.000Z"` = 20:00 BST, matching Ahmad's brief.

## 4. Root-cause classification

Two independent, evidenced findings, not one:

1. **PROVIDER_PENDING (pre-kick-off window, 18:34–18:53 UTC / T-26m to T-6m).** Both lineup sides were genuinely null from API-Football itself (not a GoalCurrent-side defect) and this sits inside API-Football's documented 20–40 minute pre-kick-off lineup publication window. This is **not a GoalCurrent bug** for this specific time window.

2. **MAPPING/PARTIAL_DATA defect (proven independent of tonight's timing) — the actual code defect this task fixes.** `src/components/match/LiveMatchDashboard.tsx` computed the lineup-readiness badge as:

   ```ts
   {lineups.home || lineups.away ? "CONFIRMED" : "PENDING"}
   ```

   This is wrong in two provable ways:
   - It reports **"CONFIRMED" as soon as either side has any lineup object**, even if the other side is still `null` (one-sided/partial provider payload).
   - It checks **truthiness of the side object**, not the presence of players — a side whose `startXI` array is empty (a malformed/partial provider row) is still truthy and would also be mislabelled "CONFIRMED" with zero visible players.

   This directly violates the acceptance criteria "no confirmed lineup is fabricated" and "partial lineup response cannot be mislabeled as fully confirmed." It affects **every competition that renders the shared `LiveMatchDashboard`** (Premier League and Community Shield, confirmed via `tests/lib/live-match-dashboard-contract.test.mjs`), not just fixture 1557367.

3. **PROVIDER_ERROR / quota exhaustion (post-kick-off, T+33m onward) — see §0.** Discovered live during this investigation; documented but intentionally not fixed here because PR #65 already implements the correct fix and duplicating it would conflict with that PR.

No confirmed lineup was fabricated, scraped, or hard-coded anywhere in this change.

## 5. Secondary discovered risk (not fixed in this task — see §12)

`plMatchCacheControl` returns `s-maxage=300, stale-while-revalidate=60` for `UPCOMING` fixtures. Vercel's edge confirmed this is honoured (`X-Vercel-Cache: HIT`, `Age` observed up to 208s across the pre-kick-off polls above). Once a lineup does become available upstream, this cache policy could keep serving a stale "pending" edge response for up to ~5–6 minutes before revalidating. This is a latent risk, not proven to have caused tonight's specific pre-kick-off gap (which is explained by §4.1), but is worth a follow-up once PR #65 — which restructures this exact caching path — is merged.

## 6. Files inspected

`src/lib/pl/match-detail.ts`, `src/app/api/pl/match/[fixtureId]/route.ts`, `src/app/[locale]/premier-league/match/[fixtureId]/page.tsx`, `src/lib/pl/api-core.ts`, `src/lib/api-football/client.ts`, `src/lib/api-football/cache.ts`, `src/lib/api-football/errors.ts`, `src/components/pl/PlMatchClient.tsx`, `src/components/match/LiveMatchDashboard.tsx` + its CSS module, `src/types/match-detail.ts`, `src/lib/pl/types.ts`, `src/lib/client/fetcher.ts`, `src/lib/match-lineup-view.ts`, `next.config.ts`, `vercel.json`, `src/proxy.ts`, `playwright.config.ts`, `tests/e2e/helpers/test-utils.ts`, PR #65/#67/#68 diffs and file lists via `gh pr diff` / `gh pr view`.

## 7. Files changed

- `src/lib/match-lineup-status.ts` — **new.** Pure, dependency-free readiness classifier (`isLineupSideConfirmed`, `resolveLineupReadiness`) implementing the CONFIRMED/PARTIAL/PENDING contract.
- `src/components/match/LiveMatchDashboard.tsx` — uses `resolveLineupReadiness` instead of the `home || away` boolean-OR badge.
- `src/components/match/LiveMatchDashboard.module.css` — added `.liveDotPartial` (amber) style for the new PARTIAL state; no existing classes changed.
- `src/lib/pl/match-detail.ts` — added `export` keyword (and a doc comment) to the existing, previously-private `resolveLineupSides` function only. No behavioural change; enables direct unit testing of the already-correct team-id mapping logic. Confirmed non-overlapping with PR #65's diff region (see §2).
- `tests/lib/match-lineup-status.test.mjs` — new unit tests for the readiness classifier.
- `tests/lib/pl-match-lineup-mapping.test.mjs` — new unit tests for `resolveLineupSides`.
- `tests/e2e/pl-lineup-readiness.spec.ts` — new Playwright coverage for the PL match centre.
- `reports/evidence/DKAMS-GC-PL-LINEUP-READINESS-20260821-192822/*.png` — desktop + 390px screenshots for PENDING, PARTIAL and CONFIRMED states.
- `reports/audits/DKAMS-GC-PL-LINEUP-READINESS-20260821-192822.md` — this report.

No production behaviour other than the badge label/colour changed. No route, cache, mapping, or fetch logic changed.

## 8. Tests added/changed (exact list)

**Unit — `tests/lib/pl-match-lineup-mapping.test.mjs`** (tests `resolveLineupSides`):
- valid two-team provider lineup maps to correct home/away sides
- reversed provider row order still maps correctly by team id
- reversed rows without a team-id match still fall back to positional mapping for exactly two rows
- empty provider lineup rows resolve to null on both sides
- one-sided provider payload maps only the reported team
- malformed row with an empty startXI still maps the side, leaving readiness classification to the status layer

**Unit — `tests/lib/match-lineup-status.test.mjs`** (tests `resolveLineupReadiness` / `isLineupSideConfirmed`):
- empty provider lineup (both sides null) resolves to PENDING, not confirmed
- one-sided/partial lineup is reported as PARTIAL, not fabricated as CONFIRMED
- malformed side with an empty starting XI is not marked confirmed
- both sides confirmed with non-empty starting XIs resolves to CONFIRMED
- isLineupSideConfirmed requires a non-empty startXI array

**Playwright — `tests/e2e/pl-lineup-readiness.spec.ts`:**
- desktop: renders both team names and the confirmed XI when both sides are supplied
- desktop: pending state renders correctly when no lineup is supplied
- desktop: one-sided lineup is reported as PARTIAL, never fabricated as CONFIRMED
- mobile 390px: no horizontal overflow and team identity remains readable

## 9. Before-fix reproduction

The old expression `(home || away) ? "CONFIRMED" : "PENDING"` was reproduced standalone:

| Scenario | Old logic result | Correct result | Old logic wrong? |
|---|---|---|---|
| one-sided (`home` confirmed, `away` null) | `CONFIRMED` | `PARTIAL` | **Yes** |
| malformed home (`startXI: []`) + confirmed away | `CONFIRMED` | `PARTIAL` | **Yes** |
| both null | `PENDING` | `PENDING` | No |

The two new "malformed side" and "one-sided" unit tests in `tests/lib/match-lineup-status.test.mjs` assert `PARTIAL`, which the old expression cannot produce (it only has two states) — so these tests fail against the pre-fix code and pass against the fix, satisfying the "test must fail before the fix and pass after it" requirement.

## 10. After-fix result

```
npx tsx --test tests/lib/pl-match-lineup-mapping.test.mjs tests/lib/match-lineup-status.test.mjs
✔ 11 tests, 11 pass, 0 fail
```

## 11. Regression gate results

- **Unit (`npm run test:unit`):** `455 tests, 451 pass, 4 fail`. The 4 failures are `tests/lib/seo-foundation.test.mjs`, `sitemap-lastmod.test.mjs`, `video-relevance.test.mjs`, `youtube-live-search.test.mjs` — the exact pre-existing static-ESM-import-of-`.ts` failures already diagnosed and fixed on PR #68's branch (not merged into `main` yet). Confirmed unrelated to this change: they fail identically on a clean `origin/main` checkout before any of this task's edits. Not touched in this branch per instruction #12.
- **New unit tests:** 11/11 pass (§10).
- **TypeScript (`npx tsc --noEmit`):** PASS, exit 0.
- **i18n (`npm run i18n:check`):** PASS — "Message key parity OK".
- **Design fundamentals (`npm run verify:design`):** PASS — "verify:design OK".
- **Production build (`npm run build`):** PASS, exit 0 (Next.js 16.2.9).
- **Changed-file ESLint:** 0 errors, 0 warnings on all 6 changed/added source and test files.
- **Focused Playwright — `tests/e2e/pl-lineup-readiness.spec.ts`:** 4/4 pass (dev-server mode; see note below).
- **Focused Playwright regression — PL/match-detail-adjacent specs:**
  - `tests/e2e/be-004-api-fixture-ownership.spec.ts`: 2/2 pass.
  - `tests/e2e/fe-015-finished-match-poll.spec.ts`: 2/2 pass.
  - `tests/e2e/seo-foundation.spec.ts`: 3/5 pass. The 2 failures (`Premier League hub exposes an apex canonical...` and `robots and sitemap advertise only the canonical apex origin`) are about global `noindex`/`robots.txt` behaviour and are a known **dev-server-only** artifact (Next dev sets a broader `noindex` than the production build); the one seo-foundation test that is actually about this task's surface — "invalid Premier League match URLs return a real 404" — **passed**. These 2 failures are unrelated to the lineup change and were reproduced identically with `git stash` of this branch's diff (i.e. present on plain `origin/main` run under `PLAYWRIGHT_DEV=1`), so they are pre-existing/environmental, not introduced here.
  - Full `npm run test:e2e` (production-build mode) was not run in full in this task because a cold `next build && next start` exceeds the 180s Playwright `webServer` timeout on this machine twice in a row (matches the same constraint documented in the prior DKAMS-GC-E2E-CS-RECOVERY report); the production build itself was verified green independently via `npm run build` (see above), and the two dev-mode-only failures above do not reproduce under a production build per the prior task's own evidence.
- **Existing unrelated e2e failures (documented, not touched):** `tests/e2e/live-journey.spec.ts`, `production-integrity.spec.ts`, `production-truth-sprint.spec.ts` are in their pre-PR#69 state on this branch (this branch is based on `origin/main`, not PR #69) and are expected to still contain the stale hardcoded-Community-Shield assertions already diagnosed and fixed on PR #69 (unmerged). Not run/fixed here — out of scope for this task and would duplicate PR #69.

## 12. API/Vercel usage impact assessment

- This fix touches **zero** network/fetch/cache code. `resolveLineupSides`'s `export` keyword and the new `src/lib/match-lineup-status.ts` module are pure, side-effect-free functions with no I/O. **Zero change to API-Football call volume, Vercel function invocation count, or CDN cache behaviour.**
- The §0 rate-limit finding and the §5 CDN-TTL risk are both **documented, not remediated**, specifically to avoid the STOP condition "a safe fix requires merging or modifying PR #65 without a controlled integration plan" — PR #65 already implements the correct fix (singleflight de-dupe + stale-on-failure cache) for both. Recommended integration order: (1) Founder-approve and merge PR #65 as the priority fix for the live rate-limit degradation in §0; (2) merge this task's badge fix (no conflict, either order); (3) open a small follow-up, after PR #65 lands, to make the CDN `s-maxage` adaptive/shorter specifically inside the pre-kick-off lineup-reveal window if still needed once PR #65's server-side cache is live.

## 13. Screenshot evidence

Captured against a local dev server with the confirmed/partial/pending states network-mocked (same payload shapes as the Playwright spec), desktop (1440×900) and mobile (390×844):

- `reports/evidence/DKAMS-GC-PL-LINEUP-READINESS-20260821-192822/lineup-confirmed-desktop.png` — both sides confirmed, "CONFIRMED" badge, full XIs visible for Arsenal and Coventry.
- `reports/evidence/DKAMS-GC-PL-LINEUP-READINESS-20260821-192822/lineup-confirmed-mobile-390.png`
- `reports/evidence/DKAMS-GC-PL-LINEUP-READINESS-20260821-192822/lineup-partial-desktop.png` — Arsenal confirmed, Coventry pending, "PARTIAL" (amber) badge — never "CONFIRMED".
- `reports/evidence/DKAMS-GC-PL-LINEUP-READINESS-20260821-192822/lineup-partial-mobile-390.png` — confirmed no horizontal overflow at 390px; both team names remain visible with the PARTIAL badge.
- `reports/evidence/DKAMS-GC-PL-LINEUP-READINESS-20260821-192822/lineup-pending-desktop.png` — both sides pending, "PENDING" badge.
- `reports/evidence/DKAMS-GC-PL-LINEUP-READINESS-20260821-192822/lineup-pending-mobile-390.png`

## 14. Overlap assessment with PR #65 (summary)

No file-level conflict. The one shared file (`src/lib/pl/match-detail.ts`) is touched by this task only to add a single `export` keyword to a function PR #65's diff does not modify. See §2 and §7 for detail. The §0 live rate-limit finding independently and strongly reinforces prioritising Founder review of PR #65, but this task does not merge, rebase onto, or edit PR #65's branch.

## 15. Branch, commit, PR

- Branch: `fix/gc-pl-lineup-readiness-20260821`
- Base: `origin/main` @ `475772ac883805597cda27338fe82805c9accf5c`
- Commit SHA: recorded after commit (see PR).
- PR: recorded after creation (see PR).

## 16. Explicit confirmations

- **MERGED = NO**
- **DEPLOYED = NO**
- No Vercel production settings, environment variables, or aliasing were touched.
- No hard-coded, scraped, or fabricated lineup was introduced anywhere.
- PR #65, #67, #68, #69 branches were not modified, rebased onto, or merged.

## 17. Final verdict

**PASS.** Root cause evidenced (not guessed) for both the specific fixture's pre-kick-off pending state (provider timing, not a bug) and the general lineup-badge defect (proven, fixed, regression-tested). The smallest, isolated fix was implemented with no PR #65 conflict. A separate, live, time-critical rate-limit degradation was discovered during evidence-gathering and is flagged for urgent, separate escalation (§0) rather than folded into this change.
