# DKAMS-GC-CI-UNIT-GATE-RECOVERY-20260821-172426 — Archived Task Card

**Status:** COMPLETE — PASS
**Archived:** 2026-08-21
**Branch:** fix/gc-ci-unit-esm-gate-20260821
**Evidence:** reports/audits/DKAMS-GC-CI-UNIT-GATE-RECOVERY-20260821-172426.md

Isolated CI unit-gate recovery from origin/main @ 475772ac. Converted four `.mjs` tests from static named TypeScript imports to the repo's dynamic `await import(pathToFileURL)` path so `tsx --test` can see CJS-compiled named exports. Full unit suite 455/0. Playwright 82/7 recorded as a separate follow-up gate. PR opened, not merged, production untouched. PR #67 untouched.