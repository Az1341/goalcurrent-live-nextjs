# GC-MVP-READINESS-SPRINT-001-R1

**Report code:** GC-MVP-READINESS-SPRINT-001-R1
**Project:** GoalCurrent
**Type:** Controlled implementation and verification
**Date:** 26/07/2026
**Branch:** recovery/gc-exec-batch-005
**Approved baseline:** bbaa282c5750c3babd8e648754edfa683ab006b0
**Status:** COMPLETE — evidence-derived readiness advanced; programme blockers remain open

---

## 1. Completion status

COMPLETE for authorised sprint scope. Pre-gate was CONDITIONAL PASS due to overlapping WIP (incorporated as isolated commits). No push, merge, or deployment.

## 2. Executive verdict

GoalCurrent moved from documentation-only recovery baseline toward demonstrated implementation readiness for football status honesty, archive failure states, sitemap hygiene, archive polling waste, unit contracts, and a mobile critical journey. Full programme closure and private-preview platform proof remain incomplete. Evidence-derived score: **63/100**.

## 3. Starting branch and SHA

- Branch: recovery/gc-exec-batch-005
- Starting HEAD: bbaa282c5750c3babd8e648754edfa683ab006b0

## 4. Ending branch and SHA

- Branch: recovery/gc-exec-batch-005
- Ending HEAD: c9ca69dfa730924f8da4be133b66d372eb77e352
- Docs evidence commit may follow; final SHA after docs commit recorded in git log.

## 5. origin/main SHA before and after

- Before: 20515a11b12026bb6e90c47b023cfb582ab8f718
- After: 20515a11b12026bb6e90c47b023cfb582ab8f718 (unchanged)

## 6. Approved baseline confirmation

Baseline bbaa282c5750c3babd8e648754edfa683ab006b0 present and ancestor of sprint commits. R2 documentation baseline remains Founder-accepted (documentation only).

## 7. Six-blocker reconciliation

| # | Blocker | Priority | Final status |
|---|---------|----------|--------------|
| 1 | Supabase/PostgreSQL SoT CONFLICTING / DB NOT_FOUND (BLK-001/005) | P0 | OPEN |
| 2 | Twelve-stream acceptance source missing (RAC-06..12) | P1 | OPEN |
| 3 | PR #11 stale + E2E FAILURE + preview mandatory (BLK-002) | P0 | OPEN (untouched) |
| 4 | GSC application issues OPEN (BLK-003) | P0 | OPEN (sitemap hygiene improved only) |
| 5 | Private preview platform proof missing (BLK-006) | P0 | OPEN |
| 6 | Pilot membership/SEPANAI controls NOT_FOUND (BLK-004) | P1 | OPEN |

Details: reports/audits/evidence/GC-MVP-READINESS-001-BLOCKERS.md

## 8. Route inventory summary

- page_count: 89; api_count: 29
- Dynamic App Router pages under [locale] represented
- Known redirect conflict: /worldcup2026/match/[id] vs /match/[id]
- Evidence: GC-MVP-READINESS-001-ROUTES.md (+ RAW)

## 9. Football-data flow

Provider (API-Football) -> apiFootballFetch / wc26-api-football -> mapApiStatusShort + overlay/SSOT merge -> SWR/cache -> Live/Match/Standings UI.
SoT boundary: heterogeneous git static + confirmed results + optional API overlay.
Evidence: GC-MVP-READINESS-001-DATA-FLOW.md

## 10. Confirmed defects

1. Kickoff-passed scheduled fixtures treated as LIVE (false live state).
2. PST/CANC/ABD API shorts not mapped into overlay status.
3. Live centre invented LIVE hero from kickoff lag; archive sync copy misleading.
4. Sitemap included redirecting /worldcup2026/match/* URLs.
5. Global 15s WC26 score polls continued after archive complete.

## 11. Corrections completed

1. Status/live mapping lib fix + data-contract tests
2. Archive/empty/sync failure-state UI + i18n
3. Sitemap canonical-only match URLs
4. Archive polling short-circuit on global sync + final winner celebration
5. Mobile critical Playwright journey added

## 12. Unit-test evidence

- Command: npm run test:unit
- Result: **125 passed / 0 failed**
- New/updated: tests/wc26/data-contract.test.mjs, match-centre-state.test.mjs, archive-polling.test.mjs, tests/lib/sitemap-canonical.test.mjs

## 13. Playwright evidence

- Desktop subset (live-journey, locale-mobile-nav x4, standings): **6 passed** (after browser install)
- Mobile critical journey: **1 passed** (GC-MVP-READINESS-001-E2E-MOBILE-R2.txt)
- Initial e2e attempt failed due to missing Chromium binary (environment), not product regression
- Full visual project not run in this sprint

## 14. Mobile findings

Critical journey at 390x844 passes: homepage, Live tab, match/status or archive empty, standings, More sheet close, Home return, no horizontal overflow, no fatal console errors. More sheet does not close on Escape (close button required) — recorded as UX note, not fixed in this sprint.

## 15. Request/polling findings

Archive-complete global WC26 live/results polling stopped (commit fix(perf)). Remaining waste: homepage multi-subscribe to PL fixtures; dual news pollers. Evidence: GC-MVP-READINESS-001-POLLING.md

## 16. SEO/indexing findings

Sitemap redirect URLs removed. Remaining: preview noindex code gap; 404 lacks robots noindex; GSC remediation still OPEN (BLK-003). Evidence: GC-MVP-READINESS-001-SEO.md

## 17. Regression results

| Gate | Command | Result |
|------|---------|--------|
| Unit | npm run test:unit | PASS 125/125 |
| Typecheck | npx tsc --noEmit | PASS (exit 0) |
| Lint | npm run lint | FAIL (pre-existing: jsx-a11y plugin missing from ESLint config) |
| Build | via Playwright webServer next build | PASS (server started; Sentry auth warning only) |
| Playwright desktop subset | playwright chromium selected specs | PASS 6/6 |
| Playwright mobile critical | mobile-critical-journey.spec.ts | PASS 1/1 |
| Formatting | no dedicated format script | NOT RUN |
| Integration suite | none separate from unit/e2e | N/A |

## 18. Commit table

| SHA | Message | Files |
|-----|---------|-------|
| 8ba5c980adcda2c84c6e95cc25c92830a21c4071 | fix(wc26): stop treating kickoff lag as live status | src/lib/wc26-live.ts, src/lib/wc26-fixture-match.ts, tests/wc26/data-contract.test.mjs, tests/wc26/match-centre-state.test.mjs |
| 912bee2dd5bae8b9fc1b4726c19cfe4c44e0803d | fix(live): clarify archive empty and sync failure states | 9 messages/*.json, HomeLiveMatchCards, LiveRibbon, LiveMatchCard, LiveMatchCentre |
| 32bb53049cb967607e487b7f9e0ff1909ef63682 | fix(seo): drop redirect hub match URLs from sitemap | src/lib/seo/sitemap-entries.ts, tests/lib/sitemap-canonical.test.mjs |
| 9c05aebe7c7a76c4a8f342afdb4fce2fa913b72e | fix(perf): stop WC26 score polling after archive complete | Wc26ResultsSync, FinalWinnerCelebration, tests/wc26/archive-polling.test.mjs |
| e7c5219b4ff31c3e41c48da48474d713742abffe | test(e2e): add mobile critical football journey coverage | tests/e2e/mobile-critical-journey.spec.ts |
| 8d6aeb836252ba6ea56dcaf972e14099c76a51ed | docs(audit): GC-MVP-READINESS-SPRINT-001 evidence pack | reports/audits/GC-MVP-READINESS-SPRINT-001-R1.md + evidence/* |

Sprint commits since baseline:
- e7c5219b4ff31c3e41c48da48474d713742abffe test(e2e): add mobile critical football journey coverage
- 9c05aebe7c7a76c4a8f342afdb4fce2fa913b72e fix(perf): stop WC26 score polling after archive complete
- 32bb53049cb967607e487b7f9e0ff1909ef63682 fix(seo): drop redirect hub match URLs from sitemap
- 912bee2dd5bae8b9fc1b4726c19cfe4c44e0803d fix(live): clarify archive empty and sync failure states
- 8ba5c980adcda2c84c6e95cc25c92830a21c4071 fix(wc26): stop treating kickoff lag as live status

## 19. Remaining blockers

All six R2 blockers remain OPEN. Additional sprint residuals: ESLint jsx-a11y config break; preview robots gap; Escape does not close More sheet.

## 20. Evidence-derived readiness score

| Category | Max | Score | Evidence basis |
|----------|-----|-------|----------------|
| Football-data accuracy | 20 | 14 | Defect fixed + unit contracts; provider live fidelity not fully exercised |
| Architecture and failure safety | 15 | 10 | Archive/empty/sync hardened; not full provider failure matrix |
| Automated tests | 15 | 12 | 125 unit + mobile/desktop e2e subset; lint blocked; full suite incomplete |
| Mobile UX | 15 | 10 | Critical journey green; broader mobile/visual incomplete |
| Performance and Vercel efficiency | 10 | 7 | Archive poll waste fixed; other waste remains |
| SEO/indexing health | 10 | 6 | Sitemap fix; preview/404/GSC gaps remain |
| Security/privacy/release control | 10 | 3 | No secrets committed; BLK-006/platform proof absent |
| Private-preview readiness | 5 | 1 | CONDITIONALLY READY only; no preview created |
| **Total** | **100** | **63** | Not forced to target band |

Starting score reference: 45/100. Ending evidence-derived: **63/100**.

## 21. Private-preview readiness verdict

**CONDITIONALLY READY** — may proceed only with Vercel Deployment Protection + Founder checklist; in-repo platform proof still missing (BLK-006). No preview deployed in this task.

## 22. Recommended next smallest sprint

1. Capture Vercel Deployment Protection evidence (close BLK-006 proof gap).
2. Add preview-host robots noindex.
3. Repair ESLint jsx-a11y plugin wiring.
4. One GROWTH/sitemap follow-up under D6 for remaining GSC items — not ad-hoc console closure.

## 23. Confirmation of prohibited actions not performed

Confirmed: no merge to main; no production deployment; no public release; no PR #11 modification; no SEPANAI feature development; no AEO optimisation; no large UI redesign; no unrelated SOT-BATCH execution; no deletion of untracked recovery files; no push.

---

**GC-MVP-READINESS-SPRINT-001-R1 status:** COMPLETE
