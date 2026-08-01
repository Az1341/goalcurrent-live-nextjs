[01/08/2026 – 19:11 BST]

DKAMS CODE: GC-REPORTS-RESTORE-001
PROJECT: GoalCurrent.live Rebuild
TASK OWNER: Cursor
CONTROL OWNER: ChatGPT
FOUNDER APPROVAL OWNER: Ahmad
STATUS: AUTHORISED — CONTROLLED RESTORE OF TRACKED REPORT FILES ONLY
DEPLOYMENT: PROHIBITED
CURSOR CHAT: OPEN A NEW CURSOR CHAT

# Task Title

Restore 113 Tracked `reports/` Files from HEAD

# Authorised Baseline

Repository:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs`

Branch:

`recovery/gc-exec-batch-005`

Authorised starting HEAD:

`d01befe69e5f5d9a4cf086390ba8d497bc8c3092`

Forensic task:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\docs\tasks\active\GC-REPORTS-DELETION-FORENSIC-GATE-001.md`

Archived RSR-003 task:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\docs\governance\dkams-task-archive\GC-RSR-003-IMPLEMENTATION-001.md`

# Approved Forensic Findings

- 113 tracked files under `reports/` are deleted from the working tree.
- Those files remain intact in Git at HEAD `d01befe69e5f5d9a4cf086390ba8d497bc8c3092`.
- The deletion is uncommitted working-tree loss.
- RSR-003 did not cause or include the deletions.
- The missing tracked files are recoverable from HEAD.
- Missing untracked reports are not recoverable from Git and are outside this restore task.
- Risk remains CRITICAL until the tracked files are restored and verified.

# Problem

The working tree is missing 113 tracked audit, sprint, closure, evidence, DKAMS, and generated report files.

The Git history remains intact, but merge, push, deployment, and further cleanup are unsafe while the working tree contains these deletions.

# User Benefit

This task restores the project evidence chain and Source of Truth without:

- changing application code;
- touching unrelated dirty product work;
- touching runtime session `2fc2ef` instrumentation;
- recreating untracked reports speculatively;
- pushing or deploying.

# Technical Approach

Restore only the 113 tracked report paths from the authorised HEAD.

Use the exact forensic inventory if present:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\_forensic_deleted_compact.txt`

and:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\_forensic_deleted_reports.csv`

Do not use broad cleanup commands.

Do not restore or recreate missing untracked reports during this task.

# Authorised Cursor Tasks

## Task 01 — Starting Gate

Record:

- real local BST date and time;
- repository absolute path;
- branch;
- full HEAD SHA;
- exact `git status --short`;
- exact count of tracked deletions under `reports/`;
- whether OneDrive sync is running;
- whether another process is actively changing the repository.

Stop if HEAD is not:

`d01befe69e5f5d9a4cf086390ba8d497bc8c3092`

unless the difference is fully explained and approved.

Do not fabricate timestamps.

## Task 02 — Verify Forensic Inventory

Confirm:

- `_forensic_deleted_compact.txt` exists;
- `_forensic_deleted_reports.csv` exists;
- both inventories describe exactly the same 113 tracked deletions;
- every listed path exists in HEAD;
- no listed path is outside `reports/`.

If the inventories are missing, regenerate a read-only list from:

`git diff --name-only --diff-filter=D HEAD -- reports/`

Do not alter files yet.

## Task 03 — Create Recovery Branch

Create:

`recovery/gc-reports-restore-001`

from:

`d01befe69e5f5d9a4cf086390ba8d497bc8c3092`

Do not switch to or create any branch from a different baseline.

Record the full branch creation result.

## Task 04 — Restore Tracked Files Only

Restore only the exact 113 tracked deleted paths from HEAD.

Preferred approach:

`git restore --source=d01befe69e5f5d9a4cf086390ba8d497bc8c3092 -- <exact listed paths>`

Do not use:

- `git restore .`
- `git checkout .`
- `git reset --hard`
- `git clean`
- `git add .`
- `git add -A`
- broad directory cleanup
- any command that touches unrelated dirty files

Do not restore missing untracked reports.

## Task 05 — Verify Restoration

After restore, verify:

- zero tracked `D` entries remain under `reports/`;
- all 113 expected paths are present;
- no unrelated modified or untracked file changed;
- no application source file changed;
- no runtime instrumentation changed;
- no missing untracked report was recreated.

Return before/after counts.

## Task 06 — Spot-Check Critical Evidence

Confirm the restored presence and readable content of at least:

- `reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md`
- `reports/audits/GC-MVP-READINESS-SPRINT-021-R1.md`
- relevant GC-SOT recovery closure reports
- relevant BE-005 through BE-012 evidence reports
- any DKAMS/REC reports identified as critical by the forensic inventory

Use full absolute paths in the evidence return.

Do not rewrite content.

## Task 07 — Integrity Comparison

For every restored tracked file, confirm the working-tree version matches HEAD.

Use read-only comparison such as:

`git diff --exit-code HEAD -- reports/`

Expected result after restoration:

- no deletions;
- no modifications caused by the restore;
- existing intentionally present report additions remain separately identifiable.

Do not erase valid untracked or modified report files that were already on disk.

## Task 08 — Stage Restored Paths Explicitly

If Git considers the restore itself as returning the working tree to HEAD, there may be nothing to commit.

Determine which applies:

### Case A — Restoration returns files exactly to HEAD and leaves no report diff

- Do not create an empty commit.
- Record that restoration was a working-tree recovery only.
- Proceed to evidence report.

### Case B — A recovery commit is genuinely required

- Stage only the exact authorised restored report paths.
- Do not stage unrelated files.
- Return the staged file list before committing.
- Create one isolated recovery commit.

Do not use broad staging commands.

## Task 09 — Recover Missing Untracked Reports: Evidence Only

Do not recreate or restore these files in this task:

- `reports/audits/GC-BACKEND-TOOLING-AUDIT-002.md`
- `reports/audits/GC-RUNTIME-SECURITY-RECONCILIATION-001.md`
- `reports/audits/GC-SOT-RECOVERY-CLOSURE-001.md`
- `reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R1.md`
- `reports/audits/evidence/GC-SOT-CLOSURE-R2-STAGE-01.md`

Record them as a separate unresolved recovery set.

For each, identify the most likely recovery source:

- ChatGPT attachment/transcript;
- Downloads;
- OneDrive version history;
- root draft;
- unavailable.

Do not fabricate content.

## Task 10 — Validation Gate

Run:

- `git status --short`
- `git diff --name-status HEAD -- reports/`
- exact count of remaining `D reports/...`
- spot-check file existence commands
- secret scan limited to any newly created evidence report
- no application build is required because no application code is authorised to change

If any tracked report deletion remains, stop and return BLOCKED.

## Task 11 — Evidence Report

Create:

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\reports\audits\GC-REPORTS-RESTORE-001-R1.md`

The report must include:

- DKAMS code;
- real BST timestamp;
- repository;
- branch;
- starting HEAD;
- ending HEAD;
- forensic source;
- exact number of restored tracked files;
- before/after deletion counts;
- exact restore commands;
- exact restored path inventory or reference to attached inventory;
- spot-check results;
- integrity comparison result;
- whether a recovery commit was required;
- recovery commit SHA if applicable;
- unresolved missing untracked report table;
- confirmation unrelated dirty work remained untouched;
- confirmation runtime instrumentation remained untouched;
- confirmation nothing was pushed, merged, or deployed;
- final verdict.

## Task 12 — Evidence Commit

Create a separate evidence-only commit containing only:

`reports/audits/GC-REPORTS-RESTORE-001-R1.md`

If this file is untracked and all validation passes, stage it explicitly and commit it separately.

Record the full evidence commit SHA.

Do not push.

## Task 13 — Final Evidence Return

Return:

1. Final status: `COMPLETE`, `PARTIAL`, or `BLOCKED`.
2. DKAMS code.
3. Repository full absolute path.
4. Branch.
5. Starting full HEAD SHA.
6. Ending full HEAD SHA.
7. Exact tracked deletion count before restore.
8. Exact tracked deletion count after restore.
9. Exact restored file count.
10. Recovery commit SHA, or `NOT REQUIRED`.
11. Evidence commit SHA.
12. Exact recovery commit file list, if any.
13. Exact evidence commit file list.
14. Exact restore command.
15. Exact validation commands and results.
16. Critical evidence spot-check table with full absolute paths.
17. Integrity comparison result.
18. Exact remaining `git status --short`.
19. Missing untracked report table.
20. Confirmation unrelated dirty work was untouched.
21. Confirmation runtime session `2fc2ef` files were untouched.
22. Confirmation nothing was pushed, merged, or deployed.
23. Evidence report full absolute path.
24. Active task-card full absolute path.
25. Task-card archive status.

# Risks

- Restoring more than the 113 authorised tracked files.
- Touching unrelated product work.
- Accidentally staging all current dirty files.
- Recreating untracked reports with incomplete or fabricated content.
- OneDrive changing files during restoration.
- Creating an unnecessary recovery commit.
- Pushing before founder review.

# Acceptance Criteria

This task passes only when:

1. The branch starts from authorised HEAD `d01befe69e5f5d9a4cf086390ba8d497bc8c3092`.
2. All 113 tracked deleted report files are restored from HEAD.
3. Zero tracked `D reports/...` entries remain.
4. Restored files match HEAD.
5. Unrelated dirty files remain untouched.
6. Runtime instrumentation remains untouched.
7. Missing untracked reports remain separately documented and are not fabricated.
8. Evidence report is complete.
9. Evidence is committed separately.
10. Nothing is pushed, merged, or deployed.
11. Founder review remains mandatory.

# Stop Conditions

Stop and return `BLOCKED` if:

- HEAD cannot be reconciled;
- the forensic inventory does not match current deletions;
- any path outside `reports/` would be changed;
- OneDrive or another process is actively changing the target files during restore;
- any restored file differs from HEAD unexpectedly;
- any tracked report deletion remains;
- unrelated files become staged;
- recovery requires destructive Git operations.

# Approval Rule

RSR-003 remains locally closed, but no push, merge, preview deployment, or production deployment is authorised until this restore task is complete and reviewed.

**NO GIT CLEANUP, NO BROAD RESTORE, NO PUSH, NO MERGE, NO PREVIEW DEPLOYMENT, AND NO PRODUCTION DEPLOYMENT WITHOUT AHMAD'S EXPLICIT APPROVAL.**

# Mandatory Archive Instruction

This task card must remain active during restoration and founder review.

Only after:

- all 113 tracked files are restored;
- validation passes;
- the evidence report is complete;
- Ahmad confirms the task is closed;
- the card is no longer needed;

archive it to the authorised DKAMS task archive.

Required archive behaviour:

1. Do not delete the task card without preserving an archived copy.
2. Record the full archive path.
3. Confirm explicitly that the task card was archived.
4. Remove duplicate active copies only after archive approval.
5. Include the archive path in the final closure return.

Zero tolerance. No exception.
