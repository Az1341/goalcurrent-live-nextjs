[01/08/2026 – 18:45 BST]

DKAMS CODE: GC-REPORTS-DELETION-FORENSIC-GATE-001
PROJECT: GoalCurrent.live Rebuild
TASK OWNER: Cursor
CONTROL OWNER: ChatGPT
FOUNDER APPROVAL OWNER: Ahmad
STATUS: AUTHORISED — READ-ONLY FORENSIC CLASSIFICATION
DEPLOYMENT: PROHIBITED
CURSOR CHAT: OPEN A NEW CURSOR CHAT

# Task Title

Investigate Unexpected Mass Deletion Under `reports/`

# Context

RSR-003 is reported complete and intact at HEAD `d01befe`.

Reported state:
- fail-closed debug authentication is implemented;
- the task card is archived at `docs/governance/dkams-task-archive/GC-RSR-003-IMPLEMENTATION-001.md`;
- nothing was pushed;
- no merge or deployment is authorised;
- founder review remains pending.

A separate unexpected mass deletion exists under `reports/`. This must be investigated before any Git cleanup, restoration, push, merge, deployment, or new implementation.

# Repository

`C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs`

# Problem

The cause, scope, ownership, recoverability, and relationship of the `reports/` deletions to prior audit evidence are unknown.

Any premature cleanup could destroy audit evidence, break the Source of Truth, invalidate sprint closures, or contaminate the branch.

# User Benefit

This task protects GoalCurrent audit history, DKAMS traceability, repository integrity, and safe future merge/deployment decisions.

# Governing Rule

Read-only investigation only.

Do not restore, delete, reset, stash, clean, checkout, commit, push, merge, deploy, or rewrite history.

# Cursor Tasks

## Task 01 — Starting Gate

Record:
- real local BST date and time;
- repository path;
- current branch;
- full HEAD SHA;
- exact `git status --short`;
- local versus remote status;
- whether HEAD still resolves to `d01befe`;
- whether another process is modifying the repository.

Do not fabricate timestamps.

## Task 02 — Capture the Exact Deletion Set

List every deleted path under `reports/`.

For each path record:
- full path;
- Git status;
- tracked/untracked state;
- last known commit containing it;
- last committed size where available;
- whether another report references it;
- whether it belongs to sprint, closure, audit, or DKAMS evidence.

Do not restore files.

## Task 03 — Quantify Scope

Return totals for:
- deleted tracked files;
- missing untracked files;
- deleted directories;
- audit reports;
- evidence files;
- sprint reports;
- closure reports;
- generated artifacts;
- unknown items.

## Task 04 — Find the Earliest Deletion Point

Using read-only Git history and reflog inspection, determine:
- when the deletion first appears;
- whether it is committed or only in the working tree;
- whether it predates RSR-003;
- whether RSR-003 commits touched `reports/`;
- whether a prior Cursor task, script, cleanup action, checkout, or sync event could have caused it.

Do not rewrite history.

## Task 05 — Verify RSR-003 Commit Scope

Return:
- full RSR-003 implementation commit SHA;
- full RSR-003 evidence commit SHA;
- exact files in each commit;
- whether either commit includes a `reports/` deletion;
- whether the task-card archive commit affected `reports/`;
- whether HEAD `d01befe` contains only authorised RSR-003 changes.

Do not amend commits.

## Task 06 — Inspect Filesystem and OneDrive Indicators

Read-only inspection only:
- OneDrive sync indicators where visible;
- recycle-bin indicators where safely visible;
- filesystem timestamps;
- duplicate or moved copies;
- archive folders;
- similarly named reports outside `reports/`.

Do not move or restore anything.

## Task 07 — Inspect Scripts and Automation

Without executing them, inspect for commands or rules that could remove or relocate reports:
- `rm`;
- `del`;
- `Remove-Item`;
- `git clean`;
- `git checkout`;
- `git restore`;
- cleanup scripts;
- archive scripts;
- report-migration scripts;
- Cursor instructions containing deletion commands.

Return exact file paths and relevant lines.

## Task 08 — Classify Every Missing File

Assign one category:
1. Authorised relocation/archive.
2. Accidental deletion.
3. Generated and reproducible.
4. Duplicate or obsolete.
5. Unknown.
6. Critical evidence requiring restoration.

Include reason and confidence.

## Task 09 — Assess Recoverability

For each deleted tracked file, identify the safest source:
- current branch history;
- prior commit;
- remote branch;
- OneDrive version history;
- recycle bin;
- duplicate archive;
- unavailable.

Do not restore anything.

## Task 10 — Assign Repository Risk

Return one rating:
- CRITICAL
- HIGH
- MEDIUM
- LOW

Assess:
- Source of Truth damage;
- evidence-chain damage;
- merge risk;
- deployment risk;
- data-loss risk;
- recoverability.

## Task 11 — Propose a Controlled Recovery Plan

Propose only. Do not execute.

Specify:
- exact files to restore;
- exact source commit/location;
- files not to restore;
- whether a dedicated recovery branch is required;
- commit structure;
- validation commands;
- evidence report;
- founder approval gate.

## Task 12 — Final Evidence Return

Return:
1. Final status: COMPLETE, PARTIAL, or BLOCKED.
2. DKAMS code.
3. Branch.
4. Full HEAD SHA.
5. Exact `git status --short`.
6. Exact deletion count.
7. Complete deletion table.
8. Earliest deletion point.
9. Committed or uncommitted verdict.
10. Whether RSR-003 caused or included any deletion.
11. RSR-003 implementation SHA.
12. RSR-003 evidence SHA.
13. Exact files in both commits.
14. OneDrive/filesystem findings.
15. Script/automation findings.
16. Classification of every missing file.
17. Recoverability table.
18. Repository risk rating.
19. Proposed recovery plan.
20. Confirmation no files were restored or deleted.
21. Confirmation nothing was reset, stashed, committed, pushed, merged, or deployed.
22. Confirmation this task card remains active pending Ahmad's review.

# Acceptance Criteria

Pass only when:
- every deleted path is identified;
- deletion is proven committed or uncommitted;
- earliest deletion point is identified as far as evidence allows;
- RSR-003 commit scope is verified;
- every missing file is classified;
- recoverability is documented;
- no restoration or cleanup occurs;
- no history is rewritten;
- nothing is pushed, merged, or deployed;
- a controlled recovery plan is returned.

# Stop Conditions

Stop and return BLOCKED if:
- repository/branch cannot be identified;
- Git history is unavailable;
- deletion scope cannot be captured safely;
- inspection would require destructive action;
- another process is changing the same files;
- evidence cannot distinguish deletion from relocation.

# Approval Rule

RSR-003 is not approved for push, merge, or deployment while this deletion issue remains unresolved.

NO GIT CLEANUP, NO RESTORATION, NO PUSH, NO MERGE, NO PREVIEW DEPLOYMENT, AND NO PRODUCTION DEPLOYMENT WITHOUT AHMAD'S EXPLICIT APPROVAL.

# Mandatory Archive Instruction

Keep this task card active during investigation and founder review.

Only after the forensic evidence package is complete, Ahmad confirms closure, and the card is no longer needed:
1. Archive it in the authorised DKAMS task archive.
2. Do not delete it without preserving the archived copy.
3. Record the full archive path.
4. Confirm explicitly that it was archived.
5. Remove duplicate active copies only after archive approval.

Zero tolerance. No exception.
