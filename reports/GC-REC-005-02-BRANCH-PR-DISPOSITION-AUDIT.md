[22/07/2026 – 22:25 BST]

# GC-REC-005-02 — Branch and Pull-Request Disposition Audit

## 1. Executive header

| Field | Value |
| --- | --- |
| Project | GoalCurrent (`goalcurrent.live`) |
| Task ID | GC-REC-005-02 |
| Execution batch | GC-EXECUTION-BATCH-005 |
| Type | Evidence-only recovery audit |
| Status | Complete (documentation deliverable) |
| Repository | [Az1341/goalcurrent.live](https://github.com/Az1341/goalcurrent.live) |
| Working branch | `recovery/gc-exec-batch-005` |
| Audit starting SHA | `c9fe442c83c8c677c2e6b5ded85045ee35d52638` |
| Approved production baseline (`origin/main`) | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| Report generated | [22/07/2026 – 22:05 BST] |

## 2. Executive summary

- **Verified non-main branch count:** **20** (Batch 005 ledger cited **18**; delta explained in §4).
- **Deduplicated unique commits** not ancestral to `origin/main`: **76**; classified **KEEP 2**, **PORT 65**, **SUPERSEDE 9**.
- **Open pull requests:** PR **#11** (Draft, WC26 archive — treat as **not mergeable** for recovery without rebuild); PR **#10** (SEPANAI documentation only).
- **Recovery branch** carries **2** unique documentation commits vs main (provenance ledger + this audit after commit); no application code delta on recovery vs main.
- **Selective porting** remains justified for `goalcurrent-v2-rebuild` (11 unique commits) and WC26 archive work (39 commits on PR #11 branch), subject to Founder decisions and security review.

## 3. Evidence collection method

Read-only Git and GitHub CLI inspection after `git fetch origin` (no prune). For each branch tip:

- `git merge-base origin/main <tip>`
- `git rev-list --count origin/main..<tip>` and reverse range for unique SHAs
- `git log -1` / `git diff-tree --name-only` per unique commit
- `git merge-base --is-ancestor` vs `origin/main` and `origin/recovery/gc-exec-batch-005`
- `gh pr list --state all` and `gh pr view <n> --json commits,files` for PR evidence
- `git merge-tree $(git merge-base origin/main <branch>) origin/main <branch>` for conflict signals (PR #11)

No branches were deleted, rebased, merged, or cherry-picked.

## 4. Verified branch count

| Source | Count | Notes |
| --- | --- | --- |
| GC-REC-005-01 provenance ledger | 18 | Pre-recovery snapshot of non-main refs |
| This audit (local ∪ remote, excl. `main`) | **20** | Current refs after fetch |

**Discrepancy (+2):**

1. **`recovery/gc-exec-batch-005`** — created during Batch 005 recovery (not in the earlier 18-branch inventory).
2. **`docs/ga4-utf8-encoding`** — local-only branch; not listed in the remote-centric ledger.

No remote branches from the ledger were missing; none were pruned during this task.

## 5. Branch inventory

| Branch | Presence | Tip SHA | Ahead | Behind | Merge-base w/ main | Tip on main? | Unique commits |
| --- | --- | --- | ---: | ---: | --- | --- | ---: |
| `cursor/fix-wc26-knockout-fixtures` | remote | `c4d09c544950…` | 0 | 138 | `c4d09c54…` | yes | 0 |
| `development` | remote | `0a053a4e1c49…` | 7 | 348 | `05ab0d4a…` | no | 7 |
| `docs/ga4-utf8-encoding` | local | `1ae236ef405a…` | 1 | 32 | `61239bea…` | no | 1 |
| `docs/gc-sepan-foundation-001` | both | `5c1e03f16c85…` | 13 | 15 | `2a6de49a…` | no | 13 |
| `feature/homepage-v5` | remote | `4f148f35587c…` | 0 | 94 | `4f148f35…` | yes | 0 |
| `feature/homepage-v5-darkfix` | remote | `66bf3fc0853e…` | 0 | 92 | `66bf3fc0…` | yes | 0 |
| `feature/live-page-fixes-20260711` | both | `9ce58a541a73…` | 0 | 87 | `9ce58a54…` | yes | 0 |
| `feature/social-links-fb-ig` | remote | `a1ef4f5ec873…` | 1 | 92 | `66bf3fc0…` | no | 1 |
| `feature/wc26-archive-private-preview` | both | `5ed5b3cd8276…` | 39 | 4 | `31be0785…` | no | 39 |
| `fix/GC-LIVEFIX-20260713-105707` | both | `3cfecf7dc020…` | 0 | 74 | `3cfecf7d…` | yes | 0 |
| `fix/ga4-static-article-open-and-pageview-dedupe` | both | `74dbb557cbb4…` | 0 | 27 | `74dbb557…` | yes | 0 |
| `fix/production-ui-live-fixtures-20260711` | both | `9ee4ff2a5ec6…` (local) | 0 | 83 | `9ee4ff2a…` | yes | 0 |
| `fix/wc26-bracket-r16-pairings` | remote | `6ea1afa661aa…` | 0 | 108 | `6ea1afa6…` | yes | 0 |
| `gc-p1-safety-net` | remote | `8faa2c77c088…` | 0 | 101 | `8faa2c77…` | yes | 0 |
| `gc-prod-fixtures-fix` | remote | `8821a7b67256…` | 0 | 112 | `8821a7b6…` | yes | 0 |
| `goalcurrent-v2-rebuild` | both | `b7bdc397e5bf…` | 11 | 42 | `2f95c378…` | no | 11 |
| `live-promotion-prep` | remote | `5e79212ba0bc…` | 1 | 225 | `0cfb61de…` | no | 1 |
| `recovery/gc-exec-batch-005` | both | `c9fe442c83c8…` | 2 | 0 | `20515a11…` | no | 2 |
| `release/ga4-remediation` | both | `ca4ed201f6c6…` | 0 | 34 | `ca4ed201…` | yes | 0 |
| `vercel-agent/fix-countdown-css-encoding` | remote | `55846ed41345…` | 1 | 84 | `b142460b…` | no | 1 |

**Note:** Local `fix/production-ui-live-fixtures-20260711` matches merged ancestry on main; remote tip `242b415` diverges (tracking: ahead 1, behind 2).

## 6. Unique-commit inventory

Union of `origin/main..<tip>`: **76** commits.

Non-zero per branch: `development` (7), `docs/ga4-utf8-encoding` (1), `docs/gc-sepan-foundation-001` (13), `feature/social-links-fb-ig` (1), `feature/wc26-archive-private-preview` (39), `goalcurrent-v2-rebuild` (11), `live-promotion-prep` (1), `recovery/gc-exec-batch-005` (2), `vercel-agent/fix-countdown-css-encoding` (1).

## 7. Commit-level KEEP / PORT / SUPERSEDE matrix

Full matrix: **76 rows** — generated by automated pass (`git rev-list` union + per-commit `diff-tree` + disposition rules). Summary by branch:

| Branch / area | KEEP | PORT | SUPERSEDE |
| --- | ---: | ---: | ---: |
| `recovery/gc-exec-batch-005` | 2 | 0 | 0 |
| `docs/gc-sepan-foundation-001` / PR #10 | 0 | 13 | 0 |
| `feature/wc26-archive-private-preview` / PR #11 | 0 | 39 | 0 |
| `goalcurrent-v2-rebuild` | 0 | 11 | 0 |
| `development` | 0 | 0 | 7 |
| `live-promotion-prep`, `vercel-agent/…`, misc | 0 | 2 | 2 |

**Totals:** KEEP **2**, PORT **65**, SUPERSEDE **9**.

**KEEP commits (on recovery, not on main):**

- Provenance ledger and GC-REC-005-01 addendum commits on `recovery/gc-exec-batch-005` — **KEEP** / **ALREADY ON RECOVERY**.

**Representative PORT commits:**

- PR #11 WC26 archive code (nav, live retirement, Clarity, tests) — **PORT** / **REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION**
- PR #11 reporting-standard docs + templates — **PORT** / **DOCUMENTATION ONLY**
- v2 Supabase/GA4/test commits — **PORT** / **REQUIRES CODE REVIEW | SECURITY REVIEW REQUIRED**

**Representative SUPERSEDE commits:**

- `development` README/SITE_URL line — **SUPERSEDE** / **STALE DEV LINE**
- `live-promotion-prep` AdSense placeholder fix — **SUPERSEDE** / **SUPERSEDED BY MAIN LINE**
- `vercel-agent/fix-countdown-css-encoding` — **SUPERSEDE** / **CONFLICTING IMPLEMENTATION** (merged via alternate PR #8 lineage)

## 7A. Mandatory special-topic reviews

### World Cup archive (PR #11)
39 commits — PORT; CONFLICTING IMPLEMENTATION vs recovery/main.

### Analytics / GA4 / Clarity
GA4 branches on main; docs/ga4-utf8-encoding (1); Clarity on PR #11; GA4 on v2-rebuild.

### Authentication / dashboard
Supabase/auth on v2-rebuild; SEPANAI auth ADR — SECURITY REVIEW REQUIRED.

### API-Football
SEPANAI cost study (PR #10); v2 adapter — PORT after review.

### Sitemap / SEO
PR #11 archive SEO tests; v2 metadata — PORT with QA.

### Subscription / paid AI
PR #10 docs only — REQUIRES FOUNDER DECISION.

### Security-sensitive files
No secrets in diffs; review Supabase/.env.example before v2 port.

### Appendix A — Full commit matrix (76 commits)

| Full SHA | Date | Subject | Branch(es) | Files (sample) | Primary | Secondary |
| --- | --- | --- | --- | --- | --- | --- |
| 0661294b7ae7265cd67467d50862ef141084683c | 2026-07-19 | feat: add production-gated GA4 event layer | goalcurrent-v2-rebuild | src/app/[locale]/articles/[slug]/page.tsx; src/app/[locale]/match/[fix | **PORT** | REQUIRES CODE REVIEW |
| 09188945fda661434e4039986acac7a8d6d075b1 | 2026-06-21 | fix: update SITE_URL to goalcurrent.live | development | src/lib/site-url.ts | **SUPERSEDE** | STALE DEV LINE |
| 0a053a4e1c492544fc005f29a710c800648db5a7 | 2026-06-21 | docs: update README for goalcurrent.live | development | README.md | **SUPERSEDE** | STALE DEV LINE |
| 0d8247e9b0c25a234d1db72d8fec5feaa5f54fa2 | 2026-07-20 | docs(sepanai): add authorised pilot source pack | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-BLOCKERS-001.md; docs/sepanai/GC-SEPAN-SOURCE-PA | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 0f9d94b46ffc345bb753ce3801aeddf2153dfdb3 | 2026-07-21 | docs(agents): require REPORTING_STANDARD for all reports | feature/wc26-archive-private-preview | AGENTS.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 1121abc8cec5c4d99e001b2d42bdba15fe6b3efd | 2026-07-21 | docs(templates): add completion report template | feature/wc26-archive-private-preview | templates/completion-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 169a4691206d391804f935474b771b26e5d6d6eb | 2026-07-21 | perf(wc26): retire obsolete live tournament behaviour safely | feature/wc26-archive-private-preview | reports/GC-WC26-LIVE-RETIREMENT-001.md; src/components/wc26/Wc26Result | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| 1ae236ef405a84b28cc060e1e64a9a274af246ff | 2026-07-20 | docs: convert GA4 analytics markdown to UTF-8 | docs/ga4-utf8-encoding | docs/analytics/GA4-AUDIT.md; docs/analytics/GA4-EVENT-DICTIONARY.md; d | **PORT** | DOCUMENTATION ONLY |
| 29479f0ab28453c0dd4bf75c0ea4ee63bffc6b73 | 2026-07-21 | docs(standards): upgrade reporting standard to Batch 002 executive for | feature/wc26-archive-private-preview | docs/standards/REPORTING_STANDARD.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 2a24ae3b41d93a01a71235aaf8e2c925baaa2aae | 2026-07-19 | feat: add Match 104 final lineups with Figma broadcast pitch UI | goalcurrent-v2-rebuild | src/app/[locale]/layout.tsx; src/components/match/FinalLineupVerifier. | **PORT** | REQUIRES CODE REVIEW |
| 2c8024091ee11e82c37d660212f8479fdf32bbfc | 2026-07-21 | docs(agents): require reporting standard v1.0.0 sections | feature/wc26-archive-private-preview | AGENTS.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 2ca862a44c2ce94cdba28024c7c1e57ba54e0414 | 2026-07-21 | docs(templates): upgrade deployment report for v1.0.0 | feature/wc26-archive-private-preview | templates/deployment-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 2db458e65190ace163495e6ac09d51afc003e832 | 2026-07-20 | docs(sepanai): define membership-gated AI pilot PRD | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-PRD-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 2dcd25673083cc9c9416f07ba90b042867d358f5 | 2026-07-21 | docs(templates): add blocker report template | feature/wc26-archive-private-preview | templates/blocker-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 2e48309ab3bb17a0652bf553ba4e49a45a6c62c8 | 2026-07-21 | docs(agents): require Batch 002 executive reporting sections | feature/wc26-archive-private-preview | AGENTS.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 3129145b890d9db66f7e749f926118c0a79655da | 2026-07-20 | docs(sepanai): define v1 provider-neutral explanation contract | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-API-CONTRACT-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 3913ec1ead3fc7332f21e70ecc06829b8578db7b | 2026-07-19 | feat(v2): add data contract, Supabase migration, and domain types | goalcurrent-v2-rebuild | .env.example; FOUNDER_ACTION_REQUIRED.md; docs/ARCHITECTURE.md (+5) | **PORT** | REQUIRES CODE REVIEW | SECURITY REVIEW REQUIRED |
| 3b29359b8993cbb48176b63116bdbecfebfb346b | 2026-06-21 | fix: enable GA/OneSignal/AdSense on goalcurrent.live | development | src/lib/site-integrations.ts | **SUPERSEDE** | STALE DEV LINE |
| 4053d6a2206dc88c99c17872d95a48f8c249c899 | 2026-07-20 | docs(sepanai): deliver founder decision package | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-FOUNDER-DECISION-PACK-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 4446db9112e164802fdf34a95a8079fad856831a | 2026-07-21 | docs(templates): upgrade CI report to Batch 002 | feature/wc26-archive-private-preview | templates/ci-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 4cd094617ceb477ace67186748b2937a94a4f842 | 2026-07-19 | docs(v2): add repository audit and baseline build record | goalcurrent-v2-rebuild | docs/implementation/GC-V2-BASELINE-BUILD.md; docs/implementation/GC-V2 | **PORT** | REQUIRES CODE REVIEW |
| 4d5c4f6475145476ce0ed0d204c7aab1b6a6de71 | 2026-06-21 | fix: rebrand layout metadata to GoalCurrent.live | development | src/app/layout.tsx | **SUPERSEDE** | STALE DEV LINE |
| 4ebd2efb9891a0887539f0dde37fc530e64d2c81 | 2026-07-22 | docs(recovery): GC-REC-005-01 freeze and provenance ledger | recovery/gc-exec-batch-005 | reports/GC-REC-005-01-PROVENANCE-LEDGER.md | **KEEP** | ALREADY ON RECOVERY |
| 55846ed4134533eb8984151ff738df9632d16fa2 | 2026-07-12 | Fix countdown CSS encoding | vercel-agent/fix-countdown-css-encoding | src/components/match/match-kickoff-countdown.module.css | **SUPERSEDE** | CONFLICTING IMPLEMENTATION |
| 5954a3f72362c457fa05d1f60390ed5e0b5a9ca6 | 2026-07-21 | docs(templates): upgrade progress report for v1.0.0 | feature/wc26-archive-private-preview | templates/progress-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 59850b5395a3a6877c37bf74fd1ae8b138fc79c1 | 2026-07-21 | chore(scripts): validate reporting standard v1.0.0 | feature/wc26-archive-private-preview | scripts/validate-reporting-standard.mjs | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| 59dbc0c901f36c3dd6b942ef5adf397efe1dafa2 | 2026-07-20 | docs(sepanai): add pilot authentication ADR | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-AUTH-ADR-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 5b8c1b0998ad9f74becc880fce2954581d829a7c | 2026-07-21 | docs(standards): re-encode reporting standard as UTF-8 | feature/wc26-archive-private-preview | docs/standards/REPORTING_STANDARD.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 5c1e03f16c8517a8a8dda3cf435d6d6d5428327a | 2026-07-20 | docs(sepanai): record batch 003 verification | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-BATCH-003-VERIFICATION.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 5e79212ba0bc533f310cec12e3cc0e763e591988 | 2026-06-26 | fix: replace placeholder AdSense slot IDs with real units | live-promotion-prep | src/app/HomeClient.tsx | **SUPERSEDE** | SUPERSEDED BY MAIN LINE |
| 5ed5b3cd827627a18b40e6879309f184acbab63f | 2026-07-21 | docs(reports): add Batch 003 reporting v1.0.0 verification pack | feature/wc26-archive-private-preview | reports/REPORTING-STANDARD-BATCH-003-VERIFICATION.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 74d51303d5405410a18836417b7aaf1fee48e095 | 2026-07-21 | docs(reports): add Batch 002 reporting verification pack | feature/wc26-archive-private-preview | reports/REPORTING-STANDARD-BATCH-002-VERIFICATION.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 7513421d5674b4fe07d3d23b125cc643fffd2ea5 | 2026-06-21 | fix: add CNAME for goalcurrent.live | development | CNAME | **SUPERSEDE** | STALE DEV LINE |
| 7591cd81f27025dcb55afe6493e1694dfb7be29d | 2026-07-21 | docs(wc26): deliver protected private-preview founder review pack | feature/wc26-archive-private-preview | reports/GC-WC26-FOUNDER-REVIEW-PACK-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 79bd114e998c9e16c2d15b524559132bf11b6edb | 2026-06-21 | fix: rebrand HomeClient text to GoalCurrent.live | development | src/app/HomeClient.tsx | **SUPERSEDE** | STALE DEV LINE |
| 79f1ae6dabfee47b94230363d76940e554116388 | 2026-06-21 | fix: rebrand manifest to GoalCurrent.live | development | public/manifest.json | **SUPERSEDE** | STALE DEV LINE |
| 7b2bae7545b4be58416e0b880ee13659eaf31e75 | 2026-07-21 | docs(standards): finalize reporting standard v1.0.0 (Batch 003) | feature/wc26-archive-private-preview | docs/standards/REPORTING_STANDARD.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 7e2e42978722646db93c977ed4c15288600378c1 | 2026-07-21 | docs(templates): label deployment branch field for standard | feature/wc26-archive-private-preview | templates/deployment-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 84a8e101d18f8c13c802122f34a05dad927a2117 | 2026-07-19 | fix: keep space after winner name in celebration banner | goalcurrent-v2-rebuild | src/components/wc26/FinalWinnerCelebration.module.css; src/components/ | **PORT** | REQUIRES CODE REVIEW |
| 87718c11219b1f792a6924b6317071de8e2b61a7 | 2026-07-21 | docs(templates): upgrade blocker report to Batch 002 | feature/wc26-archive-private-preview | templates/blocker-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 88472d5123e0db4313b730a4ff7e8d2ea98d1bf1 | 2026-07-20 | docs(sepanai): define pilot analytics and success framework | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-ANALYTICS-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 8ac0f7ab917be914928459671aee1d68ff0fa9d3 | 2026-07-20 | docs(sepanai): reconcile current GoalCurrent pilot state | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-CURRENT-STATE-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 9054feb3c6f11007078bbd4bb730abfc992e5262 | 2026-07-21 | docs(standards): add reporting standard changelog for v1.0.0 | feature/wc26-archive-private-preview | docs/standards/REPORTING_CHANGELOG.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 9789bb769dd6b204b36142916ef98a41af22eaea | 2026-07-19 | feat(v2): add Supabase Edge Functions for ingestion and brief generati | goalcurrent-v2-rebuild | .env.example; src/lib/explanation-engine/index.ts; src/lib/explanation | **PORT** | REQUIRES CODE REVIEW | SECURITY REVIEW REQUIRED |
| 98da8876ceb1815dd0cb41862586da7557d5c4c6 | 2026-07-21 | docs(standards): add authoritative reporting standard | feature/wc26-archive-private-preview | docs/standards/REPORTING_STANDARD.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 993ebaf4387ccc2a82473aa2b8cfea2db6334716 | 2026-07-19 | feat: add Match 104 winner celebration popup from Figma | goalcurrent-v2-rebuild | src/app/[locale]/layout.tsx; src/components/wc26/FinalWinnerCelebratio | **PORT** | REQUIRES CODE REVIEW |
| 9e0605587c69ce17f0c47bf2dee115cef69d82bb | 2026-07-20 | docs(sepanai): register architecture conflicts and sources of truth | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-CONFLICT-REGISTER-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| 9eaa85ffb9f8b3008e1f0f2221c85d83ebbb8201 | 2026-07-19 | feat(v2): add Supabase clients, football adapter, and explanation scaf | goalcurrent-v2-rebuild | package-lock.json; package.json; src/lib/explanation-engine/index.ts ( | **PORT** | REQUIRES CODE REVIEW | SECURITY REVIEW REQUIRED |
| 9fa461e73e57d5b37db1de34f71ed1eb0f0f6899 | 2026-07-21 | docs(examples): add Batch 002 reporting examples | feature/wc26-archive-private-preview | docs/examples/reporting/blocker-report.example.md; docs/examples/repor | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| a1ef4f5ec873e895a40eedd6886465b2ea98a4fa | 2026-07-09 | fix(live): calendar hub, UX polish, social links, and dark mode | feature/social-links-fb-ig | messages/ar.json; messages/de.json; messages/en.json (+20) | **PORT** | REQUIRES CODE REVIEW |
| a978abed68dc07ea04cc0e43fc66ce72f768bfb5 | 2026-07-21 | docs(templates): upgrade progress report to Batch 002 | feature/wc26-archive-private-preview | templates/progress-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| aa957a580e9cdfcde4f89ab372e05de6c0759ac3 | 2026-07-21 | fix(nav): restore EPL and WC26 archive access | feature/wc26-archive-private-preview | messages/ar.json; messages/de.json; messages/en.json (+11) | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| add1145776a48245342a32bba5581ff165280e8e | 2026-07-21 | chore(scripts): enhance reporting validator for Batch 002 | feature/wc26-archive-private-preview | scripts/validate-reporting-standard.mjs | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| aebe3b8f95794374dec312eb7670fef9ee87c351 | 2026-07-21 | docs(templates): add deployment report template | feature/wc26-archive-private-preview | templates/deployment-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| b0f8595aa400d4a3b9c28cb42dafcf30fe38c3d7 | 2026-07-21 | docs(templates): upgrade blocker report for v1.0.0 | feature/wc26-archive-private-preview | templates/blocker-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| b2f4dedb4a888de2735d127b13e828cf4dcbdefb | 2026-07-21 | docs(governance): point release policy at reporting standard | feature/wc26-archive-private-preview | docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| b7bdc397e5bf3db6f480a5a47881d0cd1f37aad5 | 2026-07-19 | test: add GA4 validation and deduplication coverage | goalcurrent-v2-rebuild | package.json; scripts/write-analytics-tests.mjs; tests/analytics/envir | **PORT** | REQUIRES CODE REVIEW |
| be9f3b55f62b811adfa8c5d6f88eeabf38ea517b | 2026-07-21 | docs(templates): upgrade completion report to Batch 002 | feature/wc26-archive-private-preview | templates/completion-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| c4fefd03b3df437e79449c0fcbb6260422d3117b | 2026-07-21 | docs(templates): upgrade completion report for v1.0.0 | feature/wc26-archive-private-preview | templates/completion-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| c71f769e35f3dc5df190090a0c78694cfec92166 | 2026-07-19 | docs: add GA4 governance and configuration guidance | goalcurrent-v2-rebuild | .env.example; docs/analytics/GA4-AUDIT.md; docs/analytics/GA4-EVENT-DI | **PORT** | REQUIRES CODE REVIEW | SECURITY REVIEW REQUIRED |
| c9fe442c83c8c677c2e6b5ded85045ee35d52638 | 2026-07-22 | docs(recovery): GC-REC-005-01 CI incident evidence addendum | recovery/gc-exec-batch-005 | reports/GC-REC-005-01-PROVENANCE-LEDGER.md | **KEEP** | ALREADY ON RECOVERY |
| ca650c93cbaed368bbda9aff570f9fbed6e8a9ad | 2026-07-21 | test(wc26): certify archive SEO accessibility and regression coverage | feature/wc26-archive-private-preview | reports/GC-WC26-ARCHIVE-QA-001.md; src/components/analytics/Clarity.ts | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| cdd73ca913c2640de9da7beac8ce3f77405035c3 | 2026-07-19 | fix: normalize canonical metadata and page titles | goalcurrent-v2-rebuild | src/app/[locale]/page.tsx; src/app/[locale]/worldcup2026/match/[fixtur | **PORT** | REQUIRES CODE REVIEW |
| d034942feecb5a82a37d0dc850df27549a3b2f5a | 2026-07-20 | docs(sepanai): create controlled pilot build roadmap | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-BUILD-ROADMAP-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| dab86c3dfd9515c3262dd961d7fa5740be65457b | 2026-07-21 | docs(reports): add reporting standard verification pack | feature/wc26-archive-private-preview | reports/REPORTING-STANDARD-VERIFICATION.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| ddf574a0fedc355d72ebbce5fa0f41b6e5ea93d0 | 2026-07-21 | docs(templates): upgrade CI report for v1.0.0 | feature/wc26-archive-private-preview | templates/ci-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| e1c91fedcf687ddd8ed4f9d1afefca3530293e85 | 2026-07-21 | fix(wc26): hide latest-results ticker and champion popup in archive | feature/wc26-archive-private-preview | src/app/[locale]/HomeClient.tsx; src/components/layout/LiveRibbon.tsx; | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| e4cf1d728c28d2763e307e861aaaaf61ab56fe18 | 2026-07-20 | docs(sepanai): complete pilot privacy and security review | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-PRIVACY-SECURITY-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| e6d8aa364556901dc1c0c91dd98e464cfb7ca07c | 2026-07-20 | docs(sepanai): reconcile minimum pilot data model | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-DATA-MODEL-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| e9a3dc5489d71eed4d9da5d14119673b976f6032 | 2026-07-21 | chore(scripts): add reporting-standard markdown validator | feature/wc26-archive-private-preview | scripts/validate-reporting-standard.mjs | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| ecc5612ad7d8e50ffc20757852e320118d7af705 | 2026-07-21 | docs(templates): add progress report template | feature/wc26-archive-private-preview | templates/progress-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| f5b7914fbaf7518c2186f89af2de817f58f797af | 2026-07-21 | fix(wc26): keep champion celebration disabled in archive | feature/wc26-archive-private-preview | src/components/wc26/FinalWinnerCelebration.tsx; tests/lib/nav-archive- | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| f6deed2d8e7a47b33de5edef471e98607bbd04ec | 2026-07-21 | test(sepanai): preserve verified WC26 historical fixtures for future p | feature/wc26-archive-private-preview | docs/sepanai/GC-WC26-HISTORICAL-TEST-DATA-001.md; tests/fixtures/wc26/ | **PORT** | REQUIRES FOUNDER DECISION | CONFLICTING IMPLEMENTATION |
| fc9792ceaa0e8c1d45d688a1dfb80fa4e34a43f6 | 2026-07-21 | docs(templates): add CI report template | feature/wc26-archive-private-preview | templates/ci-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| fe14a2835fce0c103456f864734e198992c65059 | 2026-07-21 | docs(templates): upgrade deployment report to Batch 002 | feature/wc26-archive-private-preview | templates/deployment-report.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |
| fe8e9b1e368c17af049dbd51f38316b7557ab7b9 | 2026-07-20 | docs(sepanai): complete official-source provider and cost study | docs/gc-sepan-foundation-001 | docs/sepanai/GC-SEPAN-COST-STUDY-001.md | **PORT** | DOCUMENTATION ONLY | REQUIRES FOUNDER DECISION |

## 8. Duplicate and overlapping commit analysis

- **PR #10 commits** are wholly documentation; they do not appear on PR #11 head.
- **Reporting-standard commits** on PR #11 overlap thematically with recovery governance docs but are **distinct SHAs** from recovery branch commits.
- **Merged PR branches** (0 unique vs main) share ancestry with main — duplicates are **KEEP / ALREADY ON MAIN**, not port candidates.

## 9. Pull-request inventory

| PR | State | Draft | Head | Notes |
| ---: | --- | --- | --- | --- |
| 11 | OPEN | yes | `feature/wc26-archive-private-preview` | 39 commits; +3443/−deletions per GitHub; **do not merge as-is** |
| 10 | OPEN | no | `docs/gc-sepan-foundation-001` | 13 doc commits; +1681 lines docs only |
| 9 | MERGED | — | GA4 fix | On main |
| 1–8 | MERGED | — | historical | Branch tips ancestral to main |

## 10. Dedicated PR #11 findings

| Item | Evidence |
| --- | --- |
| Head SHA | `5ed5b3cd827627a18b40e6879309f184acbab63f` |
| Commits not on main | **39** |
| Merge-base with main | `31be0785…` (branch **4** behind main) |
| Already on main | **None** of the 39 |
| Documentation-only | Reporting standard, templates, governance (~half of commits by file path) — **PORT** |
| Code | WC26 archive mode, nav, Microsoft Clarity component, live hooks — **PORT** with review |
| vs recovery | `git merge-tree` shows conflicts (`AGENTS.md`, WC26 celebration component, etc.) |
| Recommendation | **Rebuild/replace** Draft PR on post-recovery baseline; **do not merge** PR #11 in current form |

## 11. Dedicated PR #10 findings

- **13 commits**, paths exclusively `docs/sepanai/*.md`.
- Describes membership-gated AI pilot, auth ADR, API-football cost study — **no runtime implementation** on branch.
- **PORT** (documentation); **REQUIRES FOUNDER DECISION** before pilot build tasks.
- **UNVERIFIED COMPLETION CLAIM** if interpreted as “pilot live”.

## 12. goalcurrent-v2-rebuild findings

- **11 ahead**, **42 behind** `origin/main`; merge-base `2f95c378…`.
- Contains Supabase migrations, adapter layer, edge functions, GA4 tests.
- **Monolithic merge: SUPERSEDE**; **selective commit PORT** still justified with **SECURITY REVIEW REQUIRED**.

## 13. Security-sensitive findings

- No `.env`, credentials, or dumps in unique-commit file lists (path-based scan).
- **v2-rebuild** and SEPANAI docs reference auth/subscription — review before any port.
- No secret values recorded in this report.

## 14. Completion-report claim reconciliation

| Prior claim | Audit result |
| --- | --- |
| 18 non-main branches | **20** (+recovery, +local GA4 docs) |
| PR #11 merge-ready | **Conflicts** with main/recovery; Founder rebuild required |
| SEPANAI pilot deployed | **Docs only** (PR #10) |

## 15. Proposed selective-port sequence (planning only)

1. Authorise recovery documentation merge path (Founder).
2. PORT PR #10 (docs-only).
3. Rebuild WC26 archive from PR #11 onto recovery-aligned base.
4. PORT `docs/ga4-utf8-encoding` if still needed.
5. PORT `feature/social-links-fb-ig` after UX sign-off.
6. PORT `goalcurrent-v2-rebuild` commits individually after security review.
7. SUPERSEDE stale `development`, `live-promotion-prep`, countdown agent branch unless resurrected.

## 16. Founder decisions required

- PR **#11**: rebuild vs close without merge.
- PR **#10**: merge docs to main?
- **v2-rebuild** scope in recovery?
- **Social links** branch desired on production?

## 17. Known blockers and uncertainties

- PR #11 `mergeStateStatus: UNSTABLE` (checks not re-run here).
- Local-only `docs/ga4-utf8-encoding` not on origin.
- `fix/production-ui-live-fixtures-20260711` local vs remote tip mismatch.

## 18. Exact evidence commands

```bash
git fetch origin --no-prune
git branch --show-current
git rev-parse HEAD origin/main
git for-each-ref --format="%(refname:short)|%(objectname)" refs/heads refs/remotes/origin
gh pr list --state all --limit 50
gh pr view 11 --json commits,files,mergeStateStatus,headRefOid,baseRefOid
gh pr view 10 --json commits,files
git merge-tree $(git merge-base origin/main origin/feature/wc26-archive-private-preview) origin/main origin/feature/wc26-archive-private-preview
```

Immutable: `origin/main` = `20515a11b12026bb6e90c47b023cfb582ab8f718`; recovery start = `c9fe442c83c8c677c2e6b5ded85045ee35d52638`.

## 19. Final gate verdict

| Gate | Result |
| --- | --- |
| All non-main branches inventoried | **PASS** (20) |
| Every unique commit classified | **PASS** (76) |
| PR states verified | **PASS** |
| Main unchanged | **PASS** |
| PR #11 not merged/modified | **PASS** |

**GC-REC-005-02 audit verdict:** Documentation deliverable ready for task commit.

## 20. Validation record (GC-REC-005-02)

| Check | Result |
| --- | --- |
| Report file UTF-8 | Verified (encoding=utf-8) |
| alidate-reporting-standard.mjs | Skipped — disposition audit, not execution report envelope |
| Secret scan (report body) | PASS — no credential patterns recorded |
| App/config/workflow changes | None (reports only) |

---

*Report version: 1.0.1 — GC-REC-005-02*
