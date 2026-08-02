[01/08/2026 – 12:21 BST]

DKAMS CODE: GC-RSR-003-IMPLEMENTATION-001
PROJECT: GoalCurrent.live Rebuild
TASK OWNER: Cursor
CONTROL OWNER: ChatGPT
FOUNDER APPROVAL OWNER: Ahmad
STATUS: AUTHORISED — ONE ISOLATED SECURITY REMEDIATION
DEPLOYMENT: PROHIBITED
CURSOR CHAT: CONTINUE IN CURRENT DEBUG SESSION `2fc2ef`

# Task Title

Implement RSR-003 Fail-Closed Debug Authentication

# Authorised Baseline

The control gate `GC-RSR-003-CONTROL-GATE-001` is accepted.

Approved baseline:

- Repository: `C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs`
- Branch: `recovery/gc-exec-batch-005`
- Starting HEAD: `5f878a22ced29d467d1c23592240e709b769f7c4`
- Isolation verdict: `SAFE TO IMPLEMENT`
- Selected remediation: `RSR-003 / BE-005 residual`
- Defect: debug routes authorise in development when `DEBUG_SECRET` is unset
- Approved implementation file: `src/lib/server/cache.ts`
- Existing dirty product work and runtime instrumentation must remain untouched

# Problem

`authorizeDebugAccess` currently fails open in development when `DEBUG_SECRET` is unset.

This allows debug routes to pass authentication and continue to route-specific behaviour, proven by runtime HTTP 400 instead of HTTP 401.

The prior BE-005 correction remains valid for CRON_SECRET separation. This task must not reopen or redesign that completed control.

# User Benefit

This change prevents unintended debug-route access while preserving:

- public football routes;
- existing product work;
- CRON_SECRET separation;
- current competition functionality;
- production stability;
- controlled audit evidence.

# Technical Approach

Make the smallest possible change in the shared debug authentication utility.

The required contract is:

| Scenario | Expected result |
|---|---|
| `DEBUG_SECRET` unset in development | Reject with 401 |
| `DEBUG_SECRET` unset in preview | Reject with 401 |
| `DEBUG_SECRET` unset in production | Reject with 401 |
| Secret configured, request credential missing | Reject with 401 |
| Secret configured, request credential incorrect | Reject with 401 |
| Correct Bearer credential | Authorise |
| Correct `x-debug-secret` credential | Authorise |
| CRON credentials | Never authorise |
| Error response | Generic; no secret or environment disclosure |

Do not add `ALLOW_INSECURE_DEBUG` or any alternative bypass.

# Authorised Cursor Tasks

## Task 01 — Starting Gate

Before modifying files, record:

- current local date and BST time;
- current branch;
- full HEAD SHA;
- `git status --short`;
- confirmation that `src/lib/server/cache.ts` is clean;
- confirmation that approved test files can be changed without touching unrelated work.

Stop if HEAD differs from:

`5f878a22ced29d467d1c23592240e709b769f7c4`

unless the difference is fully explained and contains no unauthorised implementation.

Do not fabricate timestamps.

## Task 02 — Preserve Dirty Work

Do not:

- reset;
- stash;
- delete;
- clean;
- stage;
- commit;
- rewrite;
- format;
- or otherwise modify unrelated dirty files.

Do not stage runtime session `2fc2ef` instrumentation.

Explicitly exclude:

- `src/app/api/debug/api-football/route.ts`;
- `src/app/api/pl/fixtures/route.ts`;
- `src/lib/rate-limit/index.ts`;
- `src/lib/log.ts`;
- `src/lib/sentry-config.ts`;
- `.cursor/`;
- all competition, navigation, localisation, fixture, UNL, UCL, FA Cup, and PL product work.

## Task 03 — Implement Minimal Fail-Closed Logic

Modify only the shared authentication logic in:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\src\lib\server\cache.ts`

Required behaviour:

- when `DEBUG_SECRET` is absent or empty, return unauthorised in every environment;
- do not use `NODE_ENV === "development"` as implicit authorisation;
- preserve Bearer and `x-debug-secret` support;
- preserve constant-time or existing safe comparison behaviour;
- preserve CRON_SECRET separation;
- do not expose configuration state in responses.

No unrelated refactor.

## Task 04 — Update Unit Tests

Update:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\tests\lib\be-005-debug-auth.test.mjs`

Required cases:

1. Missing `DEBUG_SECRET` rejects in development.
2. Missing `DEBUG_SECRET` rejects in preview-equivalent environment handling.
3. Missing `DEBUG_SECRET` rejects in production.
4. Configured secret + missing request credential rejects.
5. Configured secret + incorrect Bearer rejects.
6. Configured secret + incorrect `x-debug-secret` rejects.
7. Correct Bearer authorises.
8. Correct `x-debug-secret` authorises.
9. CRON_SECRET credentials never authorise.
10. No secret values are returned or logged.
11. Public route modules are not imported or changed.

Remove or invert any existing test that expects development fail-open behaviour.

## Task 05 — Add Focused Playwright Coverage

Use one of:

- preferred: `tests/e2e/be-005-debug-auth.spec.ts`
- otherwise: `tests/e2e/rsr-003-debug-failclosed.spec.ts`

Cover:

1. Anonymous debug request returns 401.
2. Incorrect secret returns 401.
3. Correct configured secret passes authentication.
4. Response body does not expose `DEBUG_SECRET`, CRON_SECRET, or environment values.
5. Homepage remains accessible.
6. Premier League hub remains accessible.
7. No extra football upstream fan-out beyond existing controlled helpers.

Playwright workers/concurrency must not exceed 2.

## Task 06 — Focused Verification

Run the smallest relevant test commands first.

Record exact commands and results for:

- RSR-003 unit tests;
- focused debug-auth Playwright test.

Do not claim success from unexecuted tests.

## Task 07 — Regression Gate

Run the approved regression subset covering at minimum:

- homepage;
- Premier League hub;
- debug-route unauthorised access;
- correct debug credential path;
- locale-preserving navigation;
- mobile bottom navigation;
- no change to public football APIs.

Record exact pass, fail, and skipped totals.

## Task 08 — Build and Static Gate

Run:

- type checking;
- lint for changed files only;
- production build;
- secret scan for changed files.

Do not run general lint cleanup.

Do not upgrade dependencies.

## Task 09 — Diff and Staging Audit

Before committing, prove that the implementation commit contains only approved files.

Expected implementation/test files:

- `src/lib/server/cache.ts`
- `tests/lib/be-005-debug-auth.test.mjs`
- one approved Playwright file

Use explicit path staging.

Do not use:

- `git add .`
- `git add -A`
- broad directory staging

Return the staged diff file list before commit.

## Task 10 — Implementation Commit

Create one isolated implementation-and-tests commit.

The commit must contain only approved RSR-003 files.

Record the full commit SHA.

Do not push.

## Task 11 — Evidence Report

Create:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\reports\audits\GC-RSR-003-IMPLEMENTATION-001-R1.md`

The report must include:

- DKAMS code;
- real local date and BST time;
- branch;
- starting HEAD;
- ending HEAD;
- implementation commit SHA;
- exact changed files;
- defect reproduction;
- final security contract;
- implementation summary;
- unit-test commands and results;
- Playwright command and results;
- regression results;
- typecheck result;
- changed-file lint result;
- build result;
- secret-scan result;
- residual risks;
- confirmation that unrelated dirty work remained untouched;
- confirmation that runtime session `2fc2ef` instrumentation was not staged;
- confirmation that nothing was pushed, merged, or deployed;
- final verdict.

## Task 12 — Evidence Commit

Create a separate evidence-only commit containing only:

`reports/audits/GC-RSR-003-IMPLEMENTATION-001-R1.md`

Record the full evidence commit SHA.

Do not push.

## Task 13 — Final Evidence Return

Return:

1. Final status: `COMPLETE`, `PARTIAL`, or `BLOCKED`.
2. DKAMS code.
3. Branch.
4. Starting full HEAD SHA.
5. Ending full HEAD SHA.
6. Implementation commit SHA.
7. Evidence commit SHA.
8. Exact implementation commit file list.
9. Exact evidence commit file list.
10. Unit-test command and result.
11. Playwright command and result.
12. Regression command and result.
13. Typecheck result.
14. Changed-file lint result.
15. Production-build result.
16. Secret-scan result.
17. Final RSR-003 behaviour table.
18. Exact remaining `git status --short`.
19. Confirmation unrelated dirty work was untouched.
20. Confirmation session `2fc2ef` instrumentation was not staged.
21. Confirmation nothing was pushed, merged, or deployed.
22. Evidence report full absolute path.
23. Task-card archive status and full archive path.

# Risks

- Accidentally staging unrelated dirty product work.
- Mixing runtime instrumentation into the security fix.
- Reopening CRON_SECRET coupling.
- Breaking authorised debug access.
- Returning a non-401 response when configuration is absent.
- Claiming tests passed without execution.
- Committing secrets.
- Deploying before founder review.

# Acceptance Criteria

This task is accepted only when:

1. Starting HEAD and working tree are recorded.
2. The fail-open development branch is removed.
3. Missing `DEBUG_SECRET` fails closed in all environments.
4. Correct Bearer and `x-debug-secret` credentials still work.
5. CRON_SECRET cannot authorise debug routes.
6. Unit tests cover the full contract.
7. Focused Playwright coverage passes.
8. Required regression tests pass.
9. Typecheck passes.
10. Changed-file lint passes.
11. Production build passes.
12. Secret scan passes.
13. Only approved files enter the implementation commit.
14. Evidence is committed separately.
15. Unrelated dirty work remains untouched.
16. No push, merge, preview deployment, or production deployment occurs.
17. Founder review remains mandatory.

# Stop Conditions

Stop and return `BLOCKED` if:

- starting HEAD cannot be reconciled;
- `src/lib/server/cache.ts` is unexpectedly dirty;
- the fix requires changes outside the approved authentication utility and tests;
- unrelated files become staged;
- tests require uncontrolled external API traffic;
- any secret value would be committed or printed;
- regression, typecheck, build, or secret-scan gates fail;
- implementation cannot be isolated from current dirty work.

# Deployment Rule

**NO PUSH, NO MERGE, NO PREVIEW DEPLOYMENT, AND NO PRODUCTION DEPLOYMENT WITHOUT AHMAD'S EXPLICIT APPROVAL.**

# Mandatory Archive Instruction

After Cursor completes this task, writes the evidence report, creates the authorised commits, returns the complete evidence package, and the task card is no longer required:

1. Archive this task card in the authorised DKAMS/task archive location.
2. Do not delete it.
3. Record the full archive path in the final evidence return.
4. Confirm explicitly that the task card was archived.
5. Do not leave the completed task card active or untracked.

Zero tolerance. No exception.
