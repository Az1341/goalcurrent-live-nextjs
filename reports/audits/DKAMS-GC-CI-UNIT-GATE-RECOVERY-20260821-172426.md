# DKAMS-GC-CI-UNIT-GATE-RECOVERY-20260821-172426

**Final verdict:** PASS
**DKAMS code:** DKAMS-GC-CI-UNIT-GATE-RECOVERY-20260821-172426
**Date:** 2026-08-21
**Branch:** `fix/gc-ci-unit-esm-gate-20260821`
**MERGED:** NO
**DEPLOYED:** NO

## 1. Final verdict

PASS for the isolated unit-gate recovery. Four pre-existing `tsx`/Node ESM named-import failures are repaired. Full `npm run test:unit` is 455 pass / 0 fail. A new PR is opened to `main` and left unmerged. Production was not deployed. PR #67 was not modified.

Playwright remains a separate follow-up gate. Local post-fix e2e baseline: **82 passed / 7 failed**. Those failures were recorded only; they were not remediated in this task.

## 2. Starting main SHA

`475772ac883805597cda27338fe82805c9accf5c`

`origin/main` was unchanged from the task-creation SHA. Stash `{0}` was not applied, popped, dropped, or altered.

## 3. Ending branch SHA

`5126cb1673246841d91a743a36abc43b8e40aec3`

## 4. Exact pre-fix error for each of the 4 tests

All four failed at ESM link time on Node.js v24.16.0 before any assertion ran. File-level result: 1 fail / 0 pass each.

### tests/lib/seo-foundation.test.mjs

```
file:///.../tests/lib/seo-foundation.test.mjs:5
  canonicalHostRedirectUrl,
SyntaxError: The requested module '../../src/lib/seo/canonical-host.ts' does not provide an export named 'canonicalHostRedirectUrl'
    at #asyncInstantiate (node:internal/modules/esm/module_job:327:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:431:5)
    at async node:internal/modules/esm/loader:633:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)
```

### tests/lib/sitemap-lastmod.test.mjs

```
file:///.../tests/lib/sitemap-lastmod.test.mjs:4
import { collectSitemapPathSpecs } from "../../src/lib/seo/sitemap-entries.ts";
SyntaxError: The requested module '../../src/lib/seo/sitemap-entries.ts' does not provide an export named 'collectSitemapPathSpecs'
    at #asyncInstantiate (node:internal/modules/esm/module_job:327:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:431:5)
```

### tests/lib/video-relevance.test.mjs

```
file:///.../tests/lib/video-relevance.test.mjs:5
  filterRelevantFootballVideos,
SyntaxError: The requested module '../../src/lib/video-relevance.ts' does not provide an export named 'filterRelevantFootballVideos'
    at #asyncInstantiate (node:internal/modules/esm/module_job:327:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:431:5)
```

### tests/lib/youtube-live-search.test.mjs

```
file:///.../tests/lib/youtube-live-search.test.mjs:4
import { isYouTubeLiveSearchEnabled } from "../../src/lib/youtube-videos.ts";
SyntaxError: The requested module '../../src/lib/youtube-videos.ts' does not provide an export named 'isYouTubeLiveSearchEnabled'
    at #asyncInstantiate (node:internal/modules/esm/module_job:327:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:431:5)
```

Pre-fix full suite: `npm run test:unit` → **444 tests, 440 pass, 4 fail**. The only failures were these four files.

## 5. Root cause

The four tests used static ESM named imports from native `.mjs` files into TypeScript sources:

```js
import { namedExport } from "../../src/lib/....ts";
```

`package.json` does not set `"type": "module"`. Under `tsx --test`, those `.ts` modules are compiled as CommonJS. Node's static ESM linker then reports `SyntaxError: The requested module ... does not provide an export named '...'` even though the TypeScript sources correctly `export function` those names.

Sibling passing tests already used dynamic import, including the same sitemap module:

```js
const { collectSitemapPathSpecs } = await import(
  pathToFileURL(join(root, "src/lib/seo/sitemap-entries.ts")).href
);
```

This is a test/runtime interop defect, not a production SEO, sitemap, video, or YouTube logic defect. The named exports exist and behave correctly once loaded through tsx's dynamic-import path.

## 6. Exact technical fix

Converted the four tests to the repository's proven `await import(pathToFileURL(...).href)` pattern. Every existing assertion and expected URL/ranking/env behavior is unchanged. No production module, package.json `type`, tsconfig, or CI ignore rule was changed.

Added `tests/lib/tsx-esm-named-import.test.mjs` to prevent recurrence: it fails if any `tests/lib/*.test.mjs` file statically named-imports a `.ts` module, and it asserts the four previously unlinked exports are functions after dynamic import.

## 7. Files changed

- `tests/lib/seo-foundation.test.mjs` (import interop only)
- `tests/lib/sitemap-lastmod.test.mjs` (import interop only)
- `tests/lib/video-relevance.test.mjs` (import interop only)
- `tests/lib/youtube-live-search.test.mjs` (import interop only)
- `tests/lib/tsx-esm-named-import.test.mjs` (new recurrence guard)
- `reports/audits/DKAMS-GC-CI-UNIT-GATE-RECOVERY-20260821-172426.md`
- `docs/tasks/archive/DKAMS-GC-CI-UNIT-GATE-RECOVERY-20260821-172426.md`

No `src/` production files. No favourites files. No Vercel/CI workflow files.

## 8. Dependency changes

None. No package added, removed, or upgraded.

## 9. Focused test results

| File | After fix |
|---|---|
| `npx tsx --test tests/lib/seo-foundation.test.mjs` | **4 pass / 0 fail** |
| `npx tsx --test tests/lib/sitemap-lastmod.test.mjs` | **3 pass / 0 fail** |
| `npx tsx --test tests/lib/video-relevance.test.mjs` | **4 pass / 0 fail** |
| `npx tsx --test tests/lib/youtube-live-search.test.mjs` | **2 pass / 0 fail** |
| `npx tsx --test tests/lib/tsx-esm-named-import.test.mjs` | **2 pass / 0 fail** |

No `test.skip`, `test.todo`, assertion weakening, or catch-and-ignore.

## 10. Full unit result

`npm run test:unit`: **455 pass / 0 fail** (23 suites).

Count reconciliation: pre-fix 444 file-level tests (4 were whole-file import crashes). After fix those four files contribute 13 inner tests (4+3+4+2) and the new guard adds 2 → 440 + 13 + 2 = 455.

## 11. Full lint baseline and scoped changed-file lint result

- `npm run lint`: **41 errors / 74 warnings**. Error count matches the documented main baseline (41). Warning count is +1 versus the previously recorded 73 because the new recurrence guard uses `readFileSync` (same informational `security/detect-non-literal-fs-filename` warning already present in other tests). CI treats full-repo lint as informational (`continue-on-error: true`).
- Scoped ESLint on the five changed `.mjs` files: **0 errors**, 1 warning (the new file).
- No `.ts`/`.tsx` files changed, so the CI changed-TypeScript lint gate skips.

## 12. TypeScript result

`npx tsc --noEmit`: **PASS** (exit 0).

## 13. i18n result

`npm run i18n:check`: **PASS** — `Message key parity OK`.

## 14. design verification result

`npm run verify:design`: **PASS** — `verify:design OK`.

## 15. build result

`npm run build`: **PASS** (Next.js 16.2.9, exit 0). No Vercel or production env changes.

## 16. Full e2e post-fix baseline and remaining failures

Command: `npm run test:e2e` (Chromium). First attempt timed out waiting for `webServer` (`build && start` exceeded 180s on a cold build). Second attempt with a warm `.next` completed.

**82 passed / 7 failed** in 9.7 minutes. Not remediated in this task.

Remaining failures (exact titles):

1. `tests/e2e/favourites.spec.ts` — Favourites persistence: adding a match favourite persists after reload (`TimeoutError: page.waitForFunction` / favourite click did not toggle).
2. `tests/e2e/fe-011-locale-link.spec.ts` — mobile: es locale keeps prefix on PL hub table navigation (`toHaveURL` failed).
3. `tests/e2e/fe-011-locale-link.spec.ts` — mobile: default locale PL hub table link stays unprefixed (`toHaveURL` failed).
4. `tests/e2e/fe-011-locale-link.spec.ts` — desktop: es locale keeps prefix on PL hub table navigation (`toHaveURL` failed).
5. `tests/e2e/live-journey.spec.ts` — homepage to scores to Community Shield (`main a[href="/community-shield"]` not found).
6. `tests/e2e/production-integrity.spec.ts` — scores page after WC26 archive: competition-neutral live/upcoming centre (`main a[href="/community-shield"]` not found).
7. `tests/e2e/production-truth-sprint.spec.ts` — live centre is competition-neutral after WC26 archive (`main a[href="/community-shield"]` not found).

Categories for the next isolated task:

- WC26 favourites click / persistence (1)
- Locale-prefixed PL hub table navigation (3)
- Live/CS Community Shield deep-link visibility (3)

Compared with the previous Issue #66 report (78/15 on that branch): this main-based run did not reproduce the More-sheet / robots.txt `Disallow: /` cluster. `locale-mobile-nav`, More-sheet a11y, and `seo-foundation` robots/sitemap tests passed here.

## 17. GitHub Actions run URL/result

https://github.com/Az1341/goalcurrent.live/actions/runs/32506038930

- Overall workflow: **FAILURE** (expected — e2e job still red)
- Quality job `Lint, types, i18n, unit tests`: **SUCCESS** — https://github.com/Az1341/goalcurrent.live/actions/runs/32506038930/job/96846300145
- Playwright job `Playwright E2E + visual regression`: **FAILURE** — https://github.com/Az1341/goalcurrent.live/actions/runs/32506038930/job/96846676794

This matches the intended next-stage split: the unit gate is restored; Playwright remains a separate recovery task.

## 18. Branch name

`fix/gc-ci-unit-esm-gate-20260821`

## 19. Commit SHA

`5126cb1673246841d91a743a36abc43b8e40aec3` (implementation + first evidence). This docs commit records PR and CI URLs.

## 20. PR number and URL

PR **#68**: https://github.com/Az1341/goalcurrent.live/pull/68

## 21. Confirmation: PR #67 untouched

YES. Rechecked `gh pr view 67`: state OPEN, `mergedAt` null, head `fix/gc-issue-66-favourites-team-names-20260821` @ `21b1f9286faa911b9208d9abb2fdfe4c7d29d0d9`, mergeable. This work used a separate branch from `origin/main`.

## 22. Confirmation: MERGED = NO

NO

## 23. Confirmation: DEPLOYED = NO

NO. No Vercel production deploy, no merge to main, no production env changes.

## 24. Next recommended isolated task

Open a **Playwright e2e recovery** task against current `origin/main` (after this unit-gate PR is reviewed). Do not mix it with Issue #66.

Suggested first cluster: **Live/CS Community Shield deep-link** (3 shared failures: `live-journey`, `production-integrity`, `production-truth-sprint` all look for `main a[href="/community-shield"]`). Second cluster: **FE-011 locale PL table URLs** (3). Third: **WC26 favourites click timeout** (1). Keep robots/noindex out unless CI reproduces it.
