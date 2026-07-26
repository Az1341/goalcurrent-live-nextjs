# GC-FULLSTACK-STATIC-AUDIT-001-R1

**Project:** GoalCurrent  
**Report code:** GC-FULLSTACK-STATIC-AUDIT-001-R1  
**Type:** Repository-wide frontend, backend, security and quality audit  
**Mode:** AUDIT ONLY (no remediation)  
**Date:** 26/07/2026 (BST)  
**Priority:** P0  
**Prior verified score (input):** 71/100  

**Agent execution note:** This audit continued in the **existing Cursor chat** rather than a brand-new agent, after founder control confirmation that Sprint 002 was complete and only this agent would operate.

---

## 1. Completion verdict

**COMPLETE — AUDIT ONLY.** Evidence-based risk register produced. No application code, tests, configuration, dependencies, or lockfiles were modified. No push, merge, deploy, publish, or PR #11 modification. Documentation/evidence files only (single docs commit after this report).

## 2. Executive risk verdict

GoalCurrent is buildable, type-safe, and covered by a solid unit + critical Playwright subset, but still carries **data-integrity defects** (stoppage-time false FT; SWR cache wipe; overlay heuristics), **availability/cost abuse paths** on public upstream APIs (rate-limit degradation; SSR bypass), and **release-control blockers** inherited from prior recovery work (PR #11, SoT programme closure, private-preview platform proof, GSC). Lint remains FAIL (41/60). Score baseline 71/100 is consistent with “works but not release-safe without controlled remediation sprints.”

## 3. Starting branch and SHA

- Branch: `recovery/gc-exec-batch-005`
- Starting HEAD: `4d145580bc42c4dc5b2041ff86d790e4414e8efd`
- origin/main: `20515a11b12026bb6e90c47b023cfb582ab8f718`

## 4. Ending audited-code SHA

- Audited working tree at start/end of audit (pre-docs-commit): `4d145580bc42c4dc5b2041ff86d790e4414e8efd`
- Last functional/test implementation commit (Sprint 002): `fe154666d8a8b32c1ae25f84a8db6dac86d34e49`

## 5. Evidence-report commit

Recorded separately after this file is committed (documentation-only). Not treated as audited application code.

## 6. Tool availability

| Tool | Available |
|------|-----------|
| Node/npm/tsc/eslint/playwright/tsx tests | Yes |
| npm audit | Yes |
| Semgrep | No |
| Sonar Scanner / approved Sonar endpoint | No |
| gitleaks/trufflehog | No |

## 7. Actual tools executed

| Tool | Version / note | Evidence |
|------|----------------|----------|
| Node | v24.16.0 | pre-gate |
| npm | 11.13.0 | pre-gate |
| TypeScript `tsc --noEmit` | via project typescript ^5 | *-TSC.txt |
| ESLint | eslint ^9 / eslint-config-next 16.2.9 | *-LINT.txt |
| Unit tests (tsx --test) | 134/134 | *-UNIT.txt |
| `npm run build` | Next 16.2.9 | *-BUILD.txt |
| Playwright | @playwright/test ^1.61.1 | *-PLAYWRIGHT.txt (7/7) |
| `npm audit` | npm built-in | *-NPM-AUDIT* |

## 8. Tools not executed and reasons

| Tool | Reason |
|------|--------|
| Semgrep | Not installed; no project config; install/upload forbidden → SEMGREP NOT EXECUTED — TOOLING UNAVAILABLE (+ manual Semgrep-style review) |
| SonarQube/SonarCloud | No approved local config/endpoint → SONAR-STYLE LOCAL AUDIT only |
| Secret scanners | Not installed; no external upload |
| `npm audit fix` / upgrades | Forbidden (mutating) |
| Full visual e2e / Lighthouse prod | Out of critical subset / would hit production |

## 9. Architecture and trust boundaries

See `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-ARCHITECTURE.md`.

Summary: Next.js App Router + public JSON APIs + static WC26 fixtures + API-Football as live SoT + client SWR overlays. No in-repo DB. Preview noindex partially implemented in HTML/headers; robots.txt still permissive. Ownership conflicts: overlay vs static schedule; dual news clients; optional Firebase.

## 10. Backend findings (validated)

| ID | Title | Sev | Confidence | Location |
|----|-------|-----|------------|----------|
| BE-001 | Unauthenticated upstream quota amplification | CRITICAL | High | `src/app/api/pl/**`, `src/app/api/wc26/**`, SSR PL match page |
| BE-002 | Rate limit falls back to per-instance memory without Upstash | CRITICAL | High | `src/lib/rate-limit/index.ts`, `src/proxy.ts` |
| BE-003 | HTML SSR expensive fetches bypass `/api` rate limit | MAJOR | High | `src/proxy.ts`; PL match `page.tsx` |
| BE-004 | WC26 `apiFixtureId` trusted without ownership bind | MAJOR | High | `src/app/api/wc26/match/[fixtureId]/route.ts`, `src/lib/server/wc26-match-detail.ts` |
| BE-005 | Debug dumps authorised by DEBUG_SECRET **or** CRON_SECRET | MAJOR | High | `src/lib/server/cache.ts` `isDebugAuthorized` |
| BE-006 | Auth/provider error messages returned to clients | MAJOR | High | `src/lib/api-football/route-errors.ts`, `src/lib/pl/api-core.ts` |
| BE-007 | FCM topic subscribe without required Firebase idToken | MAJOR | High | `src/app/api/firebase/fcm-token/route.ts` |
| BE-008 | ScoreBat token in query string | MAJOR | High | `src/lib/scorebat/getScoreBatEmbed.ts`, related sources |
| BE-009 | Sentry does not redact `x-cron-secret` / `x-debug-secret` | MAJOR | High | `src/lib/sentry-config.ts` |
| BE-010 | Top-scorers Tier-2 LiveScore day fan-out | MAJOR | High | `src/lib/server/wc26-top-scorers*.ts` |
| BE-011 | Public knockout API returns diagnostic fetch logs | MINOR | High | `src/app/api/wc26/knockout-fixtures/route.ts` |
| BE-012 | Stale success cache masks upstream failures | MINOR | High | `src/lib/api-football/cache.ts` |

## 11. Frontend findings (validated)

| ID | Title | Sev | Confidence | Location |
|----|-------|-----|------------|----------|
| FE-001 | Stoppage-time 1H/2H forced to FT when elapsed>=90 | CRITICAL | High | `src/lib/wc26-match-status.ts` (also encoded in `tests/wc26/data-contract.test.mjs`) |
| FE-002 | Visibility change clears entire SWR cache without revalidate | CRITICAL | High | `src/lib/client/fetcher.ts` `registerVisibilityPollingControl` |
| FE-003 | Conditional Hooks in `useLiveApi` (`options?.fresh`) | CRITICAL | High | `src/lib/client/live-data.ts` (eslint rules-of-hooks) |
| FE-004 | Site-wide WC26 live/results polling from Layout | MAJOR | High | `Layout.tsx` → `Wc26ResultsSync` (15s fresh when not archived) |
| FE-005 | Live overlay replace can wipe lives on empty blip | MAJOR | Med-High | `replaceLiveFixtureOverlay` |
| FE-006 | Knockout completed heuristic via apiFixtureId+scores | MAJOR | Med-High | `isEffectiveFixtureCompleted` |
| FE-007 | More sheet missing focus trap / Escape / focus restore | MAJOR | High | `MoreBottomSheet.tsx` |
| FE-008 | Preview robots.txt still Allow:/ | MAJOR | High | `src/lib/seo/robots-txt.ts` |
| FE-009 | Dual news fetch stacks | MAJOR | High | `use-news-feed.ts` vs `NewsHub` SWR |
| FE-010 | PL shared SWR key with divergent fetchers | MAJOR | Med-High | Home / useLiveFixtures / PlHubClient |
| FE-011 | Locale-unsafe `next/link` on many PL/news surfaces | MAJOR | High | multiple PL/news components |
| FE-012 | Article HTML unsanitised + JSON-LD script injection surface | MINOR | High | `ArticleBodyWithAd.tsx`, JsonLd* |
| FE-013 | Hydration risks from locale time formatting | MINOR | Med | HomeHero / PL cards / LivePageClient JSON-LD |
| FE-014 | Lint React Compiler / setState-in-effect debt in chrome | MAJOR | High | BottomTabBar, headers, PlHubClient, Firebase |

## 12. Security findings

Union of BE-* security items + FE-012. Highest: BE-001/002 (quota abuse), BE-005/009 (secret handling), BE-007 (FCM), FE-012 (XSS blast radius if CMS expands). No classic SSRF/open-redirect/SQLi evidence.

## 13. Sonar/Sonar-style findings

Label: **SONAR-STYLE LOCAL AUDIT** (see evidence file). Emphasises FE-001/002/003, BE-001/002, maintainability of overlay modules, lint/compiler debt, and test gaps that currently encode FE-001 incorrectly.

## 14. Semgrep findings

**SEMGREP NOT EXECUTED — TOOLING UNAVAILABLE.** Manual Semgrep-style review recorded in evidence; not claimed as scanner output.

## 15. Secret/configuration findings

See evidence SECRETS.md. No tracked `.env` secrets. Public GA/Clarity defaults present. Preview indexing controls incomplete at robots.txt layer.

## 16. Dependency findings

15 npm audit advisories (8 high / 7 moderate). Treated as **unverified scanner advisories** pending exploit-path confirmation. No lockfile changes made. CI actions not SHA-pinned.

## 17. Test and quality-gate results

| Gate | Result |
|------|--------|
| tsc | PASS |
| unit | PASS 134/134 |
| lint | FAIL 41e/60w |
| build | PASS |
| Playwright critical | PASS 7/7 |
| npm audit | FAIL advisory (15) |

## 18. Performance/Vercel findings

| ID | Title | Sev | Notes |
|----|-------|-----|-------|
| PERF-001 | Global 15s WC26 scores polling from layout | MAJOR | Quantified interval: LIVE_POLL_MATCH_MS=15000; archiveComplete stops polls |
| PERF-002 | Match-detail + live-centre multiplied polls | MAJOR | per-match polls alongside global scores |
| PERF-003 | Visibility cache wipe causes refetch storms | CRITICAL | couples with FE-002 |
| PERF-004 | SSR+API fan-out on match detail | MAJOR | multi upstream calls; bypasses API RL |
| PERF-005 | Tier-2 top-scorers fan-out | MAJOR | long request bursts |

No cost estimate without usage telemetry.

## 19. False-positive register

| Candidate | Disposition |
|-----------|-------------|
| Public unauthenticated sports APIs (as “missing auth”) | INFO / accepted product model — risk is quota (BE-001), not broken session auth |
| security/detect-non-literal-fs-filename in scripts | False positive for product runtime |
| npm audit “high” on next without mapped exploit path | Unverified advisory — not auto-BLOCKER |
| normalizeWc26MatchStatus FT@90 “as designed” because unit test asserts it | **Not FP** — product-incorrect; tests encode defect |

## 20. Findings by severity

| Severity | Count (validated material) |
|----------|----------------------------|
| BLOCKER | 0 new code blockers unique to this audit beyond inherited programme blockers (see §21–22) |
| CRITICAL | 5 (FE-001, FE-002, FE-003, BE-001, BE-002) — PERF-003 folds into FE-002 |
| MAJOR | 18 |
| MINOR | 8 |
| INFORMATIONAL | several (architecture notes, script lint, accepted public APIs) |

Exact IDs above; inherited recovery blockers listed separately.

## 21. Private-preview blockers

1. **Inherited BLK-006** — Vercel Deployment Protection / private preview platform proof still OPEN (code noindex exists; platform unproven).  
2. **FE-008** — preview `robots.txt` still Allow:/ (HTML noindex incomplete defence).  
3. **FE-001 / FE-002 / FE-003** — live accuracy and client stability defects unsuitable for founder preview sign-off of “accurate football”.  
4. **Inherited BLK-002** — PR #11 draft still open/failing CI (not modified).  
5. **BE-005** — if preview runs with weak/shared cron/debug secrets or NODE_ENV=development debug openness.

## 22. Production blockers

1. **FE-001** — false Full Time during stoppage.  
2. **FE-002 / PERF-003** — SWR wipe on visibility.  
3. **BE-001 + BE-002** — upstream quota abuse if Upstash unset/weak.  
4. **Inherited BLK-001/005** — SoT programme closure (repo NOT_FOUND DB; external proof open).  
5. **Inherited BLK-003** — GSC / indexing programme items open.  
6. **BE-009** — Sentry secret-header redaction if Sentry enabled with cron/debug headers.  
7. Lint cleanliness not a hard prod blocker alone, but CI soft-fail masks `src` Hooks errors (FE-003).

## 23. Prioritised remediation backlog (future sprints)

1. Football status correctness (FE-001 + tests invert)  
2. SWR visibility control (FE-002)  
3. Conditional hooks fix (FE-003)  
4. Overlay empty-blip + knockout completion (FE-005/006)  
5. Upstash RL proof + SSR cost controls (BE-001/002/003)  
6. Error sanitisation + debug secret separation (BE-005/006/009)  
7. Preview robots.txt alignment (FE-008)  
8. More sheet a11y (FE-007)  
9. Scoped lint exclusions for scripts + fix src Hooks/compiler errors (clustered, not “fix all lint”)  
10. Dependency CVE path-mapping sprint (read-only first)  
11. Programme: PR #11, SoT external proof, GSC, Deployment Protection

## 24. Recommended next smallest remediation sprint

**Name:** `GC-MVP-READINESS-SPRINT-003` — Football live integrity (status + client cache)

**Single product concern:** Correct live match presentation under stoppage time and tab visibility.

**Max safe file scope:**
- `src/lib/wc26-match-status.ts`
- `src/lib/client/fetcher.ts`
- `src/lib/client/live-data.ts` (hooks shape)
- `tests/wc26/data-contract.test.mjs` (+ new status/visibility unit tests)
- Optionally `src/lib/wc26-fixture-overlay.ts` only if empty-blip fix fits without expanding scope

**Required tests:**
- Stoppage: `2H` + elapsed 90/95 remains live/not FT unless provider status is finished
- Visibility handler does not clear all SWR data to `undefined` without revalidate
- `useLiveApi` obeys Rules of Hooks (both branches)

**Ordering:** FE-001 → FE-002 → FE-003 (same sprint, one concern: live integrity). Do **not** mix backend RL, SEO robots, or lint-script cleanup.

**Preview vs public:** Required before private-preview accuracy sign-off; also production blocker for live correctness.

## 25. Confirmation of prohibited actions not performed

- No application-code changes  
- No automatic fixes  
- No dependency/lockfile changes  
- No lint/security-rule suppression  
- No production connection/mutation  
- No secret values in reports  
- No external source upload  
- No push / merge / deploy / public release  
- No PR #11 modification  
- No SEPANAI features  
- Sprint 002 not repeated  

---

## Appendix A — Finding detail templates (top five)

### FE-001 — Stoppage-time forced to FT
- **Category:** Football data integrity  
- **Severity:** CRITICAL  
- **Confidence:** High  
- **Evidence:** `normalizeWc26MatchStatus` returns `"ft"` when elapsed>=90 and status is 1H/2H; unit test asserts FT for `2H,90`  
- **Root cause:** Incorrect assumption that elapsed>=90 means finished  
- **Impact:** Users see Full Time during stoppage; standings/live ribbons wrong  
- **Exploitability:** N/A (logic bug)  
- **FP status:** Not FP  
- **Correction:** Trust provider short status; only map finished codes to FT  
- **Tests:** Contract tests for 2H@90/95 stay live  
- **Size:** S  
- **Private-preview blocker:** Yes  
- **Production blocker:** Yes  

### FE-002 — SWR cache wipe on visibilitychange
- **Category:** Reliability / performance  
- **Severity:** CRITICAL  
- **Confidence:** High  
- **Evidence:** `mutate(() => true, undefined, { revalidate: false })` on every visibilitychange  
- **Root cause:** Aggressive global cache clear  
- **Impact:** Loading flashes; refetch storms; empty states  
- **Correction:** Pause polling when hidden; revalidate on visible only  
- **Tests:** Unit/integration around visibility helper  
- **Size:** S  
- **Preview/Prod blocker:** Yes / Yes  

### FE-003 — Conditional Hooks in useLiveApi
- **Category:** Reliability  
- **Severity:** CRITICAL  
- **Confidence:** High  
- **Evidence:** eslint `react-hooks/rules-of-hooks` on early `if (options?.fresh)` return useSWR  
- **Impact:** Hook order bugs / runtime instability when options change  
- **Correction:** Single useSWR call; options object selected without conditional hook calls  
- **Size:** S  
- **Preview/Prod blocker:** Yes / Yes  

### BE-001 — Upstream quota amplification
- **Category:** Security / availability  
- **Severity:** CRITICAL  
- **Confidence:** High  
- **Evidence:** Public PL/WC26 endpoints and SSR match fan-out without auth  
- **Impact:** API-Football quota burn; degraded live data  
- **Exploitability:** High if RL weak  
- **Correction:** Enforce distributed RL; cache; cap fan-out; protect SSR  
- **Size:** M  
- **Preview blocker:** No (unless preview must stay live under abuse)  
- **Production blocker:** Yes if Upstash unset/weak  

### BE-002 — Memory rate-limit fallback
- **Category:** Security  
- **Severity:** CRITICAL (if Upstash unset in prod) / MAJOR (if set)  
- **Confidence:** High  
- **Evidence:** Missing UPSTASH_* → in-process counters  
- **Impact:** RL ineffective across serverless instances  
- **Correction:** Require Upstash in prod; fail closed or alert  
- **Size:** S–M  
- **Production blocker:** Yes if unset  

## Appendix B — Evidence index

- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-PRE-GATE.md`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-ARCHITECTURE.md`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-SEMGREP.md`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-SONAR-STYLE.md`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-SECRETS.md`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-DEPS.md`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-GATES.md`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-LINT.txt`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-LINT-CLASSIFIED.md`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-TSC.txt`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-UNIT.txt`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-BUILD.txt`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-PLAYWRIGHT.txt`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-NPM-AUDIT.txt`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-NPM-AUDIT.json`
- `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-NPM-AUDIT-SUMMARY.json`

---

**GC-FULLSTACK-STATIC-AUDIT-001 status:** COMPLETE (AUDIT ONLY)