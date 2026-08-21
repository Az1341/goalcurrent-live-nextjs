# DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001

**Final verdict:** PASS
**DKAMS code:** DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001
**Date:** 2026-08-21
**Branch:** `fix/gc-issue-66-favourites-team-names-20260821`
**MERGED:** NO
**DEPLOYED:** NO

## 1. Final verdict

PASS for the Issue #66 recovery + favourites identity fix. Pull request opened to `main` and left unmerged. Production was not deployed.

Full-repo `npm run test:e2e` is not green (78 passed / 15 failed). None of the failures are the new Issue #66 tests (those 4 passed in the same run). The unrelated failures are recorded below and block merge.

## 2. Root cause

Favourites persisted matches as `string[]` IDs only. `FavouriteMatchButton` already received a human-readable `label` (for example `Arsenal vs Coventry`) but `toggleFavouriteMatch(matchId)` discarded it. `FavouritesPageContent` resolved saved IDs through WC26 `getFixtureById`. Prefixed Premier League IDs such as `pl:<fixtureId>` are not WC26 fixture IDs, so resolution failed and the UI rendered `savedMatch({ matchId })` — the opaque identifier.

## 3. Repository recovery actions

- Recorded local state on `feat/gc-pl-countdown-article-rolling-freshness-20260820` at `2c2c6623130fd3a6b21e379442726604e5bf3dee`.
- Named stash of untracked reports/evidence (no `reset --hard`, no `git clean -fd`).
- `git fetch --prune origin`.
- Verified `origin/main` == `475772ac883805597cda27338fe82805c9accf5c` (PR #64 merge).
- `2c2c662` is an ancestor of `origin/main`; left-right cherry-pick showed only the PR #64 merge commit on main.
- Checked out `main` and `git pull --ff-only origin main`.
- HEAD == origin/main, working tree clean, then created the Issue #66 branch.

## 4. Pre-existing work preservation identifier

- Stash: `stash@{0}`
- Name: `preserve/gc-issue-66-pre-recovery-20260821: untracked reports/evidence + snapshot before Issue #66 recovery`
- Stash commit: `e765bf52578e1964071d10e0ca55890997745a26`
- Restore: `git stash apply stash@{0}`
- Feature branch commits remain on `origin/feat/gc-pl-countdown-article-rolling-freshness-20260820` at `2c2c662`.

## 5. Starting main SHA

`475772ac883805597cda27338fe82805c9accf5c`

## 6. Ending branch SHA

`ffb782ebe48a191fd70fb972fd5a1cea43daa3cd` (implementation). Latest docs commit on branch after this report update.

## 7. Files changed

- `src/lib/favourites.ts`
- `src/components/FavouriteButton.tsx`
- `src/components/favourites/FavouritesPageContent.tsx`
- `src/components/wc26/wc26.module.css`
- `tests/lib/favourites-match-labels.test.mjs`
- `tests/e2e/issue-66-favourites-team-names.spec.ts`
- `reports/evidence/DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001/favourites-desktop.png`
- `reports/evidence/DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001/favourites-mobile-390.png`
- `reports/audits/DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001.md`
- `docs/tasks/archive/DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001.md`

## 8. Exact storage schema change

`gc_favourites` localStorage JSON:

```json
{
  "teams": ["string"],
  "matches": ["string"],
  "competitions": ["string"],
  "matchLabels": { "<matchId>": "<sanitized display label>" }
}
```

- `teams` / `matches` / `competitions` unchanged.
- `matchLabels` is optional on disk. Readers always normalize it to `Record<string, string>`.
- Labels are display-only, never identifiers.
- Empty/whitespace/non-string values are dropped.
- Orphan labels (keys not in `matches`) are dropped.
- Remove/unfavourite deletes both the ID and its label.

## 9. Legacy compatibility evidence

Unit tests in `tests/lib/favourites-match-labels.test.mjs`:

- `{"teams":["team-bra"],"matches":["pl:123"],"competitions":["wc26"]}` loads; `matchLabels` becomes `{}`.
- Malformed `matchLabels` array is treated as empty.
- Nested/number/orphan label values are dropped; teams and competitions are preserved.
- Invalid JSON fails closed to empty state.
- Playwright: legacy `matches:["pl:926270001"]` without labels shows "No longer available", not `Saved match (pl:926270001)`.
- Playwright: malformed `matchLabels: ["not-an-object"]` still renders Favourites, including competitions.

## 10. Unit test results

Focused: `npx tsx --test tests/lib/favourites-match-labels.test.mjs`

- Before implementation: 13 fail / 0 pass (TDD).
- After implementation: **13 pass / 0 fail**.

Full `npm run test:unit`: **453 pass / 4 fail**.

The 4 failures are pre-existing on `main` (static ESM named imports of `.ts` files):

- `tests/lib/seo-foundation.test.mjs`
- `tests/lib/sitemap-lastmod.test.mjs`
- `tests/lib/video-relevance.test.mjs`
- `tests/lib/youtube-live-search.test.mjs`

Baseline before Issue #66 edits was 440 pass / 4 fail. After: +13 Issue #66 tests, same 4 unrelated failures.

## 11. Playwright results

Focused Issue #66 spec (`tests/e2e/issue-66-favourites-team-names.spec.ts`, Chromium): **4 passed**.

Journey covered:

1. Homepage PL countdown with deterministic mocked `/api/pl/fixtures` (Arsenal vs Coventry).
2. Favourite the match.
3. Favourites page shows `Arsenal vs Coventry`.
4. Raw `pl:926270001` is not the primary label.
5. Reload persists the label.
6. Remove clears the row.

Also in the full production `npm run test:e2e` run: the same 4 Issue #66 tests passed (`ok 40`–`ok 43`).

## 12. Full regression results

| Command | Result |
|---|---|
| `git status --short --branch` before preservation | `feat/gc-pl-countdown-article-rolling-freshness-20260820...origin/main [ahead 3]` plus untracked reports/evidence |
| Preservation stash | `stash@{0}` / `e765bf52578e1964071d10e0ca55890997745a26` |
| `git fetch --prune origin` | `origin/main` 7f2d917..475772a |
| origin/main after fetch | `475772ac883805597cda27338fe82805c9accf5c` |
| Clean main | HEAD == origin/main, empty `git status --short` |
| `npm run lint` | **41 errors / 73 warnings** — identical to baseline on main; CI treats full-repo lint as informational. Scoped eslint on Issue #66 TS files: **0 problems**. |
| `npm run i18n:check` | **PASS** (Message key parity OK) |
| `npm run test:unit` | **453 pass / 4 fail** (4 pre-existing ESM import failures) |
| `npm run build` | **PASS** after clearing a stale `.next/dev` cache left by `PLAYWRIGHT_DEV=1` |
| Focused Issue #66 unit | **13/13 PASS** |
| Focused Issue #66 Playwright | **4/4 PASS** |
| `npm run test:e2e` | **78 passed / 15 failed**. Issue #66 tests all passed. See remaining risks. |

One allowed rerun: `tests/e2e/favourites.spec.ts` still failed. Snapshot after timeout still showed `Add Mexico vs South Africa to favourites` (click never toggled). The same `FavouriteMatchButton` path passed on the homepage PL journey, so this is not the new `matchLabels` write path.

## 13. Mobile/desktop screenshot paths

- Mobile 390x844: `reports/evidence/DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001/favourites-mobile-390.png`
- Desktop: `reports/evidence/DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001/favourites-desktop.png`

Both show **Arsenal vs Coventry** with reachable **Remove**, no raw `pl:` ID, no horizontal overflow.

## 14. Diff/scope review

Product/test diff limited to favourites persistence, Favourites fallback rendering, a 2-property overflow wrap on `.favListLabel`, and Issue #66 tests/evidence. No Vercel/prod files, no second favourites system, no WC26 card redesign, no database.

## 15. Branch name

`fix/gc-issue-66-favourites-team-names-20260821`

## 16. Commit SHA

`ffb782ebe48a191fd70fb972fd5a1cea43daa3cd`

## 17. PR number and URL

PR **#67**: https://github.com/Az1341/goalcurrent.live/pull/67

## 18. Confirmation: MERGED = NO

NO

## 19. Confirmation: DEPLOYED = NO

NO. No Vercel production deploy, no merge to main.

## 20. Archive location

`docs/tasks/archive/DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001.md`

## 21. Remaining risks / follow-up

- Full-repo `npm run lint` remains red on main (41/73); Issue #66 files are clean.
- 4 unit files on main fail under Node ESM named imports of `.ts` sources.
- Full e2e 15 failures, unrelated to Issue #66: WC26 `favourites.spec.ts` click timeout; locale/mobile nav and More sheet not found; live/CS journey URL; local `robots.txt` `Disallow: /` / `noindex` under `next start` without production Vercel env.
- Those failures block merge of this PR until classified on CI or fixed separately.
- Existing Favourites hydration mismatch (SSR empty vs client localStorage) is pre-existing; not redesigned here.
- Legacy saved PL matches without `matchLabels` show a neutral "No longer available" state until the user re-favourites them.