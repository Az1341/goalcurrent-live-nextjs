# GC-REPORTS-RESTORE-001-R1

**DKAMS code:** GC-REPORTS-RESTORE-001  
**Report timestamp:** 2026-08-01 19:29:35 +01:00 (BST)  
**Project:** GoalCurrent.live Rebuild  
**Repository:** `C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs`  
**Branch:** `recovery/gc-reports-restore-001` (created from authorised HEAD)  
**Starting HEAD:** `d01befe69e5f5d9a4cf086390ba8d497bc8c3092`  
**Ending HEAD:** pending evidence commit  
**Forensic source:** `docs/tasks/active/GC-REPORTS-DELETION-FORENSIC-GATE-001.md`  
**Inventory:** `_forensic_deleted_compact.txt` / `_forensic_deleted_reports.csv`  
**Task owner:** Cursor  
**Founder approval owner:** Ahmad  
**Deployment:** none

---

## 1. Starting gate

| Item | Value |
|------|--------|
| Branch at start | `recovery/gc-exec-batch-005` |
| HEAD | `d01befe69e5f5d9a4cf086390ba8d497bc8c3092` (match) |
| Tracked deletions under `reports/` before | **113** |
| OneDrive process present | Yes (`OneDrive*`) |
| Inventory verify | 113/113 match WT; all in HEAD; all under `reports/` |

## 2. Restore execution

Recovery branch created:

`
git switch -c recovery/gc-reports-restore-001
`

Exact restore command pattern (batched from inventory paths):

`
git restore --source=d01befe69e5f5d9a4cf086390ba8d497bc8c3092 -- <exact listed paths>
`

Batches: 40 + 40 + 33 = **113** paths.  
Inventory reference: `_forensic_deleted_compact.txt`

## 3. Before / after

| Metric | Before | After |
|--------|-------:|------:|
| Tracked `D reports/...` | 113 | **0** |
| Restored paths present on disk | 0 of 113 missing set | **113 / 113** |
| `git diff --exit-code HEAD -- reports/` | N/A | **0** (clean content) |
| Blob hash mismatches vs HEAD (113 paths) | N/A | **0** |

## 4. Case determination

**Case A — working-tree recovery only.**  
Restored files match HEAD content exactly. **No recovery commit required.**

Note: `git status` may show some restored paths as ` M` due to index/stat/racy refresh on Windows/OneDrive, but `git hash-object` equals `HEAD:<path>` for all 113 and `git diff HEAD -- reports/` is empty. Zero `D` remain.

## 5. Spot-checks (readable; content not rewritten)

| File | Absolute path | Result |
|------|---------------|--------|
| Fullstack R2 | `C:\Users\zafar\OneDrive\Desktop\CURSOR BAT\goalcurrent-live-nextjs\reports\audits\GC-FULLSTACK-STATIC-AUDIT-001-R2.md` | Present; header OK |
| Sprint 021 R1 | `...\reports\audits\GC-MVP-READINESS-SPRINT-021-R1.md` | Present |
| Sprint 014–020 R1 (BE-005..012 era) | `...\reports\audits\GC-MVP-READINESS-SPRINT-014-R1.md` … `020-R1.md` | Present |
| GC-REC-005-01 | `...\reports\GC-REC-005-01-PROVENANCE-LEDGER.md` | Present |
| GC-REC-005-05 | `...\reports\GC-REC-005-05-SEARCH-CONSOLE-RECONCILIATION.md` | Present |
| SOT Closure R2 | `...\reports\audits\GC-SOT-RECOVERY-CLOSURE-001-R2.md` | Present |
| RSR-003 R1 | `...\reports\audits\GC-RSR-003-IMPLEMENTATION-001-R1.md` | Present |

## 6. Unresolved missing untracked set (NOT restored)

| Path | Likely recovery source |
|------|------------------------|
| `reports/audits/GC-BACKEND-TOOLING-AUDIT-002.md` | Chat transcript / prior agent output; not in HEAD |
| `reports/audits/GC-RUNTIME-SECURITY-RECONCILIATION-001.md` | Chat transcript; may have been UTF-risk; not in HEAD |
| `reports/audits/GC-SOT-RECOVERY-CLOSURE-001.md` | Root draft `GC-SOT-RECOVERY-CLOSURE-001-draft.md` or chat; not in HEAD |
| `reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R1.md` | Root draft / chat; not in HEAD |
| `reports/audits/evidence/GC-SOT-CLOSURE-R2-STAGE-01.md` | Root `GC-SOT-CLOSURE-R2-STAGE-01(1).md` / chat; not in HEAD |

## 7. Controls

- Unrelated dirty product work: untouched.
- Runtime session `2fc2ef` instrumentation paths: untouched (status fingerprint unchanged).
- Forensic card remains active: `docs/tasks/active/GC-REPORTS-DELETION-FORENSIC-GATE-001.md`.
- Restore task card remains active: `docs/tasks/active/GC-REPORTS-RESTORE-001.md`.
- Nothing pushed, merged, or deployed.

## 8. Final verdict

**COMPLETE** — 113 tracked `reports/` files restored from HEAD on branch `recovery/gc-reports-restore-001`. Working-tree recovery only (Case A). Founder review still required before push/merge/deploy. Untracked session reports remain a separate recovery set.

**GC-REPORTS-RESTORE-001 status:** PASSED (restore + evidence pending this commit)