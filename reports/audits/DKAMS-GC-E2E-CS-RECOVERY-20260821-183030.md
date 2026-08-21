# DKAMS-GC-E2E-CS-RECOVERY-20260821-183030

**Final verdict:** PASS
**DKAMS code:** DKAMS-GC-E2E-CS-RECOVERY-20260821-183030
**Date:** 2026-08-21
**Branch:** `fix/gc-e2e-community-shield-recovery-20260821`
**MERGED:** NO
**DEPLOYED:** NO

## Starting SHA

`20c0146ea9430ce38a0d0a163875fc4d77d950ff` (PR #68 head)

`origin/main` remained `475772ac883805597cda27338fe82805c9accf5c`. Stash `{0}` was not applied, popped, dropped, or altered.

## Ending SHA

`72ae89baabab106f29ca616241260429860589f0`

## Pre-fix three failures

GitHub CI run 32506038930: Chromium **86 passed / 3 failed**. Selector in all three:

`main a[href="/community-shield"]` — element(s) not found.

1. `tests/e2e/live-journey.spec.ts` — homepage to scores to Community Shield
2. `tests/e2e/production-integrity.spec.ts` — competition-neutral live and upcoming centre
3. `tests/e2e/production-truth-sprint.spec.ts` — live centre is competition-neutral after WC26 archive

SSOT fixture `src/data/community-shield/fixtures-2026.json` has `kickoffUtc: 2026-08-16T14:00:00.000Z` (5 days before this task). Local Playwright webServer timed out on cold `build && start` (180s budget); the same three failures were already recorded on GitHub and in the prior local production e2e baseline (82/7, of which these three were the CS cluster).

## Root cause

Stale test assumption, not a production defect.

`buildUpcomingCompetitionWindows` correctly excludes Community Shield when:
- `status` is `FT` or `CANCELLED`, or
- `kickoffUtc` is not in the future.

The live centre therefore omits `/community-shield` after 16 Aug 2026. Tests required that link permanently.

## Exact test changes

- `live-journey.spec.ts`: mock `/api/community-shield/fixture` with kickoff = now + 14 days. Journey remains Home → Scores → competition hub → Arsenal vs Manchester City. No real calendar date.
- `production-integrity.spec.ts`: durable `/live` checks — h1 Live and upcoming, no WC26 h1, Upcoming competitions region, and either the empty announced-fixtures state or a current-competition hub link. Community Shield is not required.
- `production-truth-sprint.spec.ts`: different durable truth — archive is not the live h1; current-football intro lists PL/UCL/FA Cup/Nations League; Upcoming competitions heading is present. Finished Community Shield is not required.
- `tests/lib/upcoming-competition-windows.test.mjs`: future CS appears; FT, cancelled, and past-kickoff UPCOMING CS are excluded.

## Whether src changed

NO. No production `src/` files.

## Focused results

`npx playwright test` of the three files, `--retries=0`: **15 passed / 0 fail** (includes sibling tests in those files).

Expiry unit: **4 pass / 0 fail**.

## Favourites verification

Local `favourites.spec.ts` failed (`waitForFunction` timeout). GitHub CI run 32506038930 passed this spec. Recorded as environment variance. Not edited.

## FE-011 verification

Local: **6 passed / 0 fail**. Not edited.

## Full unit result

`npm run test:unit`: **459 pass / 0 fail**.

## Lint

`npm run lint`: **41 errors / 74 warnings** (informational baseline).
Scoped eslint on changed files: **0 errors**.

## TypeScript

`npx tsc --noEmit`: PASS

## i18n

`npm run i18n:check`: PASS — Message key parity OK

## Design

`npm run verify:design`: PASS

## Build

`npm run build`: PASS

## Full E2E exact count

`npm run test:e2e`: first run **88 passed / 1 failed**.
The failure was `fe-010-pl-fixtures-key` desktop (GitHub-green previously). Allowed artifact-clear rerun of that spec: **2 passed / 0 fail**.
The three repaired CS tests all passed in the full run (ok 40 live-journey, ok 66 integrity, ok 71 truth).
No product change for FE-010.

## Visual result

`npm run test:visual`: **9 passed / 0 fail**. No snapshot updates.

## GitHub Actions

https://github.com/Az1341/goalcurrent.live/actions/runs/32513770664

- Overall: **SUCCESS**
- Quality: **SUCCESS** — https://github.com/Az1341/goalcurrent.live/actions/runs/32513770664/job/96870647216
- Playwright E2E + visual: **SUCCESS** — https://github.com/Az1341/goalcurrent.live/actions/runs/32513770664/job/96871070972

## Branch / commit / PR

- Branch: `fix/gc-e2e-community-shield-recovery-20260821`
- Implementation commit: `72ae89baabab106f29ca616241260429860589f0`
- PR **#69**: https://github.com/Az1341/goalcurrent.live/pull/69

## PR #67 untouched

YES. OPEN, unmerged, head `21b1f9286faa911b9208d9abb2fdfe4c7d29d0d9`.

## PR #68 branch untouched

YES. OPEN, unmerged, head still `20c0146ea9430ce38a0d0a163875fc4d77d950ff`.

## MERGED = NO

NO

## DEPLOYED = NO

NO