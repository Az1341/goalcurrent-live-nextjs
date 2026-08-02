# GC-MVP-READINESS-001 - Pre-Execution Gate

**Report code:** GC-MVP-READINESS-001-PRE-GATE
**Task:** GC-MVP-READINESS-SPRINT-001 / TASK 01
**Date:** 26/07/2026 - 11:47 BST
**Branch required:** recovery/gc-exec-batch-005
**Approved baseline:** bbaa282c5750c3babd8e648754edfa683ab006b0

## Gate results

| Check | Result |
|-------|--------|
| Current branch | recovery/gc-exec-batch-005 - PASS |
| HEAD SHA | bbaa282c5750c3babd8e648754edfa683ab006b0 - PASS |
| Approved baseline exists locally | PASS (equals HEAD) |
| Baseline is ancestor of HEAD | PASS |
| origin/main SHA | 20515a11b12026bb6e90c47b023cfb582ab8f718 |
| Local vs remote branch | Ahead of origin/recovery/gc-exec-batch-005 by 1 commit; remote tip e4873659836b007f26ee78b01c6e4355a584663f |
| main would be modified | No - not on main |
| Checkout / reset / clean / delete / merge / rebase / push / deploy | None performed |
| Node version | v24.16.0 |
| Package manager | npm@11.13.0 |
| Vercel config | vercel.json present (cron /api/cron/refresh-content @ 0 6 * * *) |
| Production domain refs | goalcurrent.live / Vercel project goalcurrent.live |

## Available test / quality scripts

| Script | Command |
|--------|---------|
| test:unit | tsx --test tests/i18n|content|wc26|lib|analytics |
| test:e2e | playwright test --project=chromium |
| test:visual | playwright test --project=visual |
| lint | eslint |
| build | next build |
| i18n:check | node scripts/check-message-parity.cjs |
| verify:design | node scripts/verify-fundamentals.cjs |
| Typecheck | tsc Version 5.9.3 (no npm script) |

## Tracked modifications (pre-existing WIP)

| Path | Notes |
|------|-------|
| messages/{ar,de,en,es,fa,fr,it,nl,pt}.json | Locale string updates |
| src/components/home/v5/HomeLiveMatchCards.tsx | Live card labelling |
| src/components/layout/LiveRibbon.tsx | Ribbon status |
| src/components/live/LiveMatchCard.tsx | Card status |
| src/components/live/LiveMatchCentre.tsx | Centre partitioning / labels |
| src/lib/wc26-fixture-match.ts | mapApiStatusShort PST/CANC/ABD mapping |
| src/lib/wc26-live.ts | Stop treating kickoff-passed as LIVE; compact status labels |

Overlap with sprint domain: YES - football live/status paths required by Tasks 04-07.

## Untracked files (preserved; not deleted)

- .mcp.json
- GC-SOT-CLOSURE-R2-STAGE-01(1).md
- GC-SOT-RECOVERY-CLOSURE-001-draft.md
- reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R1.md
- reports/audits/GC-SOT-RECOVERY-CLOSURE-001.md
- reports/audits/evidence/GC-SOT-CLOSURE-R2-STAGE-01.md
- scripts/_fix_closure.py

## Control decision

| Stop condition | Evaluation |
|----------------|------------|
| Branch not recovery/gc-exec-batch-005 | Not triggered |
| Approved baseline missing | Not triggered |
| main would be modified | Not triggered |
| Deploy/publish command | Not triggered |
| Existing tracked changes overlap required files | TRIGGERED |

**Verdict:** CONDITIONAL PASS - OVERLAP RECORDED

Proceed under these controls:

1. Evidence, route inventory, audits, tests, and reports may proceed.
2. Application-code correction on overlapping paths is limited to verifying and completing the already-present WIP as the single highest-risk football-data defect (kickoff-passed falsely treated as LIVE; PST/CANC mapping), after red/green unit proof.
3. Commits must not include untracked recovery drafts, _fix_closure.py, .mcp.json, or unrelated WIP outside the authorised concern.
4. No push, merge, rebase, deploy, or public release.

If the WIP cannot be proven as a single isolated defect with tests, Tasks 06-07 must report NO DEFECT PROVEN / no further application edits on those paths.

**GC-MVP-READINESS-001-PRE-GATE status:** CONDITIONAL PASS - OVERLAP RECORDED
