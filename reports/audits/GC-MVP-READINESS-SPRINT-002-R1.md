# GC-MVP-READINESS-SPRINT-002-R1

**Report code:** GC-MVP-READINESS-SPRINT-002-R1
**Project:** GoalCurrent
**Type:** Controlled blocker reduction and regression hardening
**Date:** 26/07/2026
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 4674dea3da6ecc0d3ce9b26b69d74ab99d408739
**Audited implementation HEAD (pre-report):** fe154666d8a8b32c1ae25f84a8db6dac86d34e49
**Evidence-report commit:** recorded separately after this file is committed (not claimed inside the audited code baseline)
**Status:** COMPLETE — evidence-derived improvement; blockers remain

---

## 1. Completion verdict

COMPLETE for authorised Sprint 002 scope. Lint gate restored (no longer crashes); match-status contracts expanded; homepage PL subscription duplication removed; preview/404 noindex controls added in code; news dual-pollers audited with no consolidation; Supabase/PostgreSQL path re-confirmed NOT_FOUND; PR #11 left open. No push, merge, or deployment.

## 2. Starting and ending implementation SHAs

- Starting HEAD: `4674dea3da6ecc0d3ce9b26b69d74ab99d408739`
- Audited implementation HEAD: `fe154666d8a8b32c1ae25f84a8db6dac86d34e49` (last functional/test commit before this evidence report)
- origin/main before/after: `20515a11b12026bb6e90c47b023cfb582ab8f718` (unchanged)

## 3. Evidence-report commit described separately

This R1 file is authored against implementation HEAD `fe154666d8a8b32c1ae25f84a8db6dac86d34e49`. The git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" that adds this report is intentionally **not** treated as the audited code baseline and is not required to appear as "Ending HEAD" inside the report body.

## 4. Sprint 001 SHA reconciliation

See `reports/audits/evidence/GC-MVP-READINESS-002-S001-RECON.md` and the POST-HOC section on Sprint 001 R1.

| Role | SHA |
|------|-----|
| Sprint 001 implementation/test HEAD | e7c5219b4ff31c3e41c48da48474d713742abffe |
| Sprint 001 evidence pack | 8d6aeb836252ba6ea56dcaf972e14099c76a51ed |
| Claimed Ending HEAD in Sprint 001 R1 body | c9ca69dfa730924f8da4be133b66d372eb77e352 |
| Actual HEAD at Sprint 002 start | 4674dea3da6ecc0d3ce9b26b69d74ab99d408739 |

Nine commits ahead of origin at Sprint 002 start: bbaa282 (R2) + five Sprint 001 functional/test commits + three docs/SHA finalize commits.

## 5. Lint result

- Root cause: custom config spread `jsx-a11y` recommended rules without owning the plugin; next/core-web-vitals already registers `jsx-a11y`. Re-registering caused redefine errors.
- Fix commit: `2b9dca2` — keep next a11y rules; isolate security plugin; ignore non-app artefacts (reports, ss-figma).
- `npm run lint` / `npx eslint .`: **FAIL** — 101 problems (41 errors, 60 warnings) pre-existing in application/tests. Gate restored (runs); not represented as PASS.
- Accessibility rules were not disabled.

## 6. Match-status findings and tests

- Existing Sprint 001 mappings for PST/CANC/ABD/INT/LIVE/FT/PEN retained.
- SUSP: not inventively remapped; fallthrough `susp` is not live.
- Kickoff-passed scheduled remains non-live.
- Tests: `tests/wc26/status-contract.test.mjs` (commit `82c7f96`).

## 7. PL subscription findings

- Proven: homepage mounted three `useSWR("/api/pl/fixtures")` subscribers (HomeClient + HomeTodaysMatches + HomeTeamsLeagues). SWR dedupes network by key, but subscription ownership was duplicated.
- Correction: single fetch in HomeClient; props passed to children (commit `4b8b6d1`).
- Verification: `tests/lib/home-pl-subscription.test.mjs`.

## 8. News polling findings

- NewsHub SWR (news page) and `useNewsFeed` module store (home/profile/group) are distinct owners; simultaneous duplicate requests on one route **not proven**.
- No consolidation. Evidence: `GC-MVP-READINESS-002-NEWS.md`.

## 9. Preview noindex result

- `deployRobotsMetadata()` + layout spread; `X-Robots-Tag` via proxy when `shouldNoIndexDeploy()`.
- Production `VERCEL_ENV=production` unchanged (indexable).
- Tests: `tests/lib/deploy-robots.test.mjs` (commit `e00469d`).
- No Vercel preview created/deployed. BLK-006 platform Deployment Protection proof still OPEN.

## 10. 404 indexing result

- Locale `not-found.tsx` exports `robots: { index:false, follow:false }`.
- Remains a not-found UI (no homepage redirect of all unknowns).
- Test: `tests/lib/not-found-robots.test.mjs` (commit `fe15466`).

## 11. Data Source-of-Truth findings

- Supabase/PostgreSQL on production path: **NOT_FOUND** (repo).
- BLK-001/005: **PARTIALLY RESOLVED** for repository truth; still blocked for programme closure without external project proof.
- Evidence: `GC-MVP-READINESS-002-SOT.md`.

## 12. PR #11 findings

- OPEN draft; base `20515a11…`; head `5ed5b3cd…`; Playwright E2E+visual **FAILURE**.
- Not modified. BLK-002 remains **OPEN**.
- Evidence: `GC-MVP-READINESS-002-PR11.md` (+ JSON capture).

## 13. Full regression results

| Gate | Command | Result |
|------|---------|--------|
| Unit | npm run test:unit | PASS **134/134** |
| Typecheck | npx tsc --noEmit | PASS (exit 0) |
| Lint | npx eslint . | FAIL 41 errors / 60 warnings (pre-existing; gate runs) |
| Build | Playwright webServer next build | PASS (e2e suite started) |
| Desktop+mobile Playwright subset | live, locale-mobile-nav x4, mobile-critical, standings | PASS **7/7** |
| Status-contract | tsx status-contract.test.mjs | PASS |
| Sitemap canonical | included in unit suite | PASS |
| Preview noindex | deploy-robots.test.mjs | PASS |
| 404 indexing | not-found-robots.test.mjs | PASS |

## 14. Commit/file table (Sprint 002)

| SHA | Message | Files |
|-----|---------|-------|
| 7bf8044 | docs(audit): reconcile Sprint 001 HEAD versus evidence-report SHAs | PRE-GATE, S001-RECON, Sprint 001 R1 note |
| 2b9dca2 | fix(lint): restore ESLint by stopping jsx-a11y plugin conflict | eslint.config.mjs |
| 82c7f96 | test(wc26): expand provider match-status contract coverage | tests/wc26/status-contract.test.mjs |
| 4b8b6d1 | fix(home): fetch Premier League fixtures once on the homepage | HomeClient, HomeTodaysMatches, HomeTeamsLeagues, home-pl-subscription.test.mjs |
| e00469d | fix(seo): noindex preview and development deploys | deploy-robots.ts, layout.tsx, proxy.ts, deploy-robots.test.mjs |
| fe15466 | fix(seo): mark locale not-found pages as noindex | not-found.tsx, not-found-robots.test.mjs |
| (evidence commit) | docs(audit): GC-MVP-READINESS-SPRINT-002 evidence pack | this R1 + evidence logs |

## 15. Remaining blockers

| ID | Status after Sprint 002 |
|----|-------------------------|
| BLK-001/005 SoT | PARTIALLY RESOLVED (repo NOT_FOUND); programme closure still open |
| RAC-06..12 | OPEN |
| BLK-002 PR #11 | OPEN |
| BLK-003 GSC | OPEN |
| BLK-006 private preview platform proof | OPEN (code noindex added; platform proof absent) |
| BLK-004 SEPANAI/membership | OPEN |
| Lint cleanliness | OPEN (41 pre-existing errors) |

## 16. Evidence-derived score

Starting verified: **63/100**. Ending: **71/100**.

| Category | Was | Now | Delta reason |
|----------|-----|-----|--------------|
| Football-data accuracy | 14 | 15 | Status-contract tests locked provider mappings |
| Architecture and failure safety | 10 | 11 | SoT repo re-confirmed; homepage data ownership clearer |
| Automated tests | 12 | 13 | 134 unit + 7 e2e; lint still failing |
| Mobile UX | 10 | 10 | Critical journey still green; no new UX work |
| Performance and Vercel efficiency | 7 | 8 | Homepage PL multi-subscribe removed |
| SEO/indexing health | 6 | 8 | Preview robots metadata/header + 404 noindex |
| Security/privacy/release control | 3 | 4 | Lint gate restored (not clean); no secrets/deploy |
| Private-preview readiness | 1 | 2 | Code noindex proven; Deployment Protection still missing |
| **Total** | **63** | **71** | Not forced to 72–75 |

## 17. Recommended next smallest action

1. Capture Vercel Deployment Protection evidence (BLK-006).
2. Triage the 41 remaining ESLint errors in a dedicated lint-debt batch (do not weaken rules).
3. Keep PR #11 on a rebuild+preview path separate from recovery (BLK-002).

## 18. Confirmation of prohibited actions not performed

Confirmed: no push; no merge; no deployment/public release; no PR #11 modification; no production DB connection/mutation; no secrets printed; no main changes; no worktree/branch switch; untracked recovery drafts excluded from commits.

---

**GC-MVP-READINESS-SPRINT-002-R1 status:** COMPLETE