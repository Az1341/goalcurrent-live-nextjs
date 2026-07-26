# GC-FULLSTACK-STATIC-AUDIT-001-R2

**Project:** GoalCurrent  
**Report code:** GC-FULLSTACK-STATIC-AUDIT-001-R2  
**Type:** Audit-report reconciliation only  
**Mode:** DOCUMENTATION CORRECTION (no remediation, no re-scan)  
**Date:** 26/07/2026 (BST)  
**Supersedes counting/severity claims in:** GC-FULLSTACK-STATIC-AUDIT-001-R1  
**R1 evidence commit (unchanged audited code):** f134a4dceff215933d1dc6e5a66bad9ca6a30807  

**Agent note:** Reconciliation continued in the existing Cursor chat. No repository-wide re-analysis. Existing evidence reused unless noted.

---

## 1. Completion verdict

**COMPLETE — RECONCILIATION ONLY.** Canonical findings register produced. R1 double-counting (PERF-* vs FE/BE) removed. BE-001/BE-002 reclassified to separate confirmed repository behaviour from unverified production configuration. No application code, tests, configuration, dependencies, or lockfiles changed. No push, merge, deploy, or PR #11 modification.

## 2. Executive risk verdict (unchanged substance)

GoalCurrent remains buildable and covered by unit + critical Playwright gates, with confirmed live-data integrity defects (FE-001/002/003) and material reliability/security debt. Upstream quota risk is **confirmed in code** as public fan-out, but **production exploit criticality requires environment proof** (distributed rate limit / Upstash). Prior score input 71/100 is not recalculated in this reconciliation.

## 3. SHA register (precise)

| Role | SHA |
|------|-----|
| Starting audited-code SHA (R1 audit start) | `4d145580bc42c4dc5b2041ff86d790e4414e8efd` |
| Ending audited-code SHA (no app changes since) | `4d145580bc42c4dc5b2041ff86d790e4414e8efd` |
| Last functional Sprint 002 commit (reference) | `fe154666d8a8b32c1ae25f84a8db6dac86d34e49` |
| R1 evidence/docs commit | `f134a4dceff215933d1dc6e5a66bad9ca6a30807` |
| R2 documentation commit | Reported separately in Cursor final response (not amended into this file) |
| origin/main (unchanged) | `20515a11b12026bb6e90c47b023cfb582ab8f718` |

Branch: `recovery/gc-exec-batch-005`

## 4. Tool execution statements (precise)

- **Semgrep was not executed.**
- **SonarQube/SonarCloud was not executed.**
- Results that discuss scanner themes are a **manual Sonar-style / Semgrep-style local audit** only.
- **Full visual regression and complete E2E certification were not performed.**
- Only the **critical Playwright subset passed 7/7** (homepage, live-journey, locale-mobile-nav x4, mobile-critical-journey).

## 5. Accepted gate results (preserved)

| Gate | Result |
|------|--------|
| Unit | **134/134 PASS** |
| Playwright critical subset | **7/7 PASS** |
| TypeScript (`tsc --noEmit`) | **PASS** |
| Production build | **PASS** |
| Lint | **FAIL: 41 errors / 60 warnings** |
| npm audit | **15 unverified advisories** (8 high / 7 moderate / 0 critical) |

## 6. R1 defects corrected in R2

1. PERF-001..005 were counted separately while duplicating FE-002/FE-004/BE-001/BE-003/BE-010 — **removed from totals**; retained only as cross-references.
2. CRITICAL total incorrectly included BE-001/BE-002 as unconditional production-critical without env proof — **reclassified**.
3. MAJOR/MINOR/INFO totals were approximate ("~18", "several") — **replaced with exact canonical counts**.
4. Material findings lacked a single complete register — **canonical register below**.
5. Copilot addendum coverage matrix was missing — **added**.

---

## 7. Severity totals (canonical, each finding counted once)

| Severity | Count | IDs |
|----------|------:|-----|
| BLOCKER | 0 | (none in this audit register; inherited programme blockers listed in §10, not double-counted here) |
| CRITICAL | 3 | FE-001, FE-002, FE-003 |
| MAJOR | 19 | BE-001, BE-003, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, FE-004, FE-005, FE-006, FE-007, FE-008, FE-009, FE-010, FE-011, FE-014, FE-015 |
| MINOR | 5 | BE-011, BE-012, FE-012, FE-013, A11Y-001 |
| INFORMATIONAL | 4 | INFO-001, INFO-002, DEP-001, CFG-001 |
| CONDITIONAL / REQUIRES ENVIRONMENT PROOF | 2 | BE-002, ENV-001 |

**Canonical validated finding total:** 3 + 19 + 5 + 4 + 2 = **33**

### Performance de-duplication map (not counted separately)

| Former PERF ID | Canonical owner |
|----------------|-----------------|
| PERF-001 global 15s WC26 polling | FE-004 |
| PERF-002 match-detail / live-centre poll multiplication | FE-015 |
| PERF-003 visibility wipe refetch storms | FE-002 |
| PERF-004 SSR/API fan-out | BE-001 + BE-003 |
| PERF-005 Tier-2 top-scorers fan-out | BE-010 |

---

## 8. Canonical findings register

Every validated finding appears once below with the required fields.

### CRITICAL

#### FE-001 — Stoppage-time 1H/2H forced to FT when elapsed >= 90
- **Category:** Football data integrity  
- **Severity:** CRITICAL  
- **Confidence:** High  
- **Location:** `src/lib/wc26-match-status.ts`; consumers via results-sync / server mapping; incorrect expectation in `tests/wc26/data-contract.test.mjs`  
- **Evidence:** Function returns `"ft"` when `elapsed >= 90` and status is 1H/2H; R1 + source review  
- **Root cause:** Treats stoppage elapsed as finished  
- **Impact:** False Full Time during stoppage; wrong live UI / standings signals  
- **Exploitability:** N/A (logic defect)  
- **False-positive disposition:** Not FP (test encoding does not make behaviour correct)  
- **Recommended correction:** Trust provider finished statuses only; keep 2H@90+ as live  
- **Required tests:** Contract: 2H@90/95 not FT unless finished short  
- **Remediation size:** S  
- **Private-preview blocker:** Yes  
- **Production blocker:** Yes  

#### FE-002 — Visibility change clears entire SWR cache without revalidate
- **Category:** Reliability / client performance  
- **Severity:** CRITICAL  
- **Confidence:** High  
- **Location:** `src/lib/client/fetcher.ts` (`registerVisibilityPollingControl`)  
- **Evidence:** `mutate(() => true, undefined, { revalidate: false })` on `visibilitychange`  
- **Root cause:** Global cache clear on tab visibility events  
- **Impact:** Empty/loading flashes; refetch storms (former PERF-003)  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Pause interval when hidden; revalidate-on-visible only  
- **Required tests:** Visibility helper does not wipe all keys to undefined without revalidate  
- **Remediation size:** S  
- **Private-preview blocker:** Yes  
- **Production blocker:** Yes  

#### FE-003 — Conditional Hooks in useLiveApi
- **Category:** Reliability  
- **Severity:** CRITICAL  
- **Confidence:** High  
- **Location:** `src/lib/client/live-data.ts`  
- **Evidence:** ESLint `react-hooks/rules-of-hooks` (LINT.txt); early `if (options?.fresh) return useSWR(...)`  
- **Root cause:** Conditional Hook call paths  
- **Impact:** Hook-order instability if options change across renders  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Single `useSWR` call; select options object without branching Hook calls  
- **Required tests:** Unit/lint gate on hooks order; behavioural test both fresh/hub modes  
- **Remediation size:** S  
- **Private-preview blocker:** Yes  
- **Production blocker:** Yes  

### CONDITIONAL / REQUIRES ENVIRONMENT PROOF

#### BE-002 — Rate limit falls back to per-instance memory when Upstash unset
- **Category:** Security / availability controls  
- **Severity:** CONDITIONAL / REQUIRES ENVIRONMENT PROOF  
- **Confidence:** High (code path); **production Upstash configuration was not verified**  
- **Location:** `src/lib/rate-limit/index.ts`, `src/proxy.ts`  
- **Evidence:** Missing `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` → in-process limiter; no production env inspection in this audit  
- **Root cause:** Soft fallback instead of fail-closed distributed limiter  
- **Impact:** If unset in deployed serverless env, RL is ineffective across instances  
- **Exploitability:** High **only if** production lacks distributed RL (unverified)  
- **False-positive disposition:** Not FP as code behaviour; severity is env-conditional  
- **Recommended correction:** Prove Upstash (or equivalent) in preview/prod; alert/fail-closed if missing in non-dev  
- **Required tests:** Unit for fallback branch; ops checklist / config proof (not inventing secrets)  
- **Remediation size:** S–M  
- **Private-preview blocker:** No (unless preview must resist abuse)  
- **Production blocker:** **Conditional — requires environment proof**  

#### ENV-001 — Production residual upstream-quota abuse risk unproven
- **Category:** Security / availability (deployment)  
- **Severity:** CONDITIONAL / REQUIRES ENVIRONMENT PROOF  
- **Confidence:** Medium (depends on BE-001 code + unverified prod controls)  
- **Location:** Deployment env for Upstash/CDN caching; code fan-out in `src/app/api/pl/**`, `src/app/api/wc26/**`, SSR match pages  
- **Evidence:** Confirmed public fan-out (BE-001); **no production configuration verified**  
- **Root cause:** Cannot assert CRITICAL production exploitability without env proof  
- **Impact:** Possible API-Football quota burn / live degradation under abuse **if** controls weak  
- **Exploitability:** Environment-dependent  
- **False-positive disposition:** Not a claim of confirmed prod misconfiguration  
- **Recommended correction:** Founder/ops proof of distributed RL + cache hit rates before public scale  
- **Required tests:** Ops evidence checklist; optional load test in protected preview  
- **Remediation size:** S (proof) / M (hardening)  
- **Private-preview blocker:** No  
- **Production blocker:** **Conditional — requires environment proof**  

### MAJOR

#### BE-001 — Unauthenticated upstream fan-out on public PL/WC26 paths
- **Category:** Security / availability (confirmed repository behaviour)  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/app/api/pl/**`, `src/app/api/wc26/**`, SSR PL match page; multi-call helpers  
- **Evidence:** Public GETs trigger upstream provider calls; no session auth (by design for sports data)  
- **Root cause:** Open read APIs + multi-call match/players/top-scorer pipelines  
- **Impact:** Amplifies provider cost/latency; abuse impact severity depends on RL (see ENV-001/BE-002)  
- **Exploitability:** Confirmed reachable without auth; **criticality requires env proof**  
- **False-positive disposition:** Not FP; INFO-001 clarifies missing-auth alone is accepted product model  
- **Recommended correction:** Cap fan-out; stronger caching; ensure distributed RL (env proof)  
- **Required tests:** Fan-out budget tests; cache hit assertions  
- **Remediation size:** M  
- **Private-preview blocker:** No  
- **Production blocker:** Conditional — requires environment proof (ENV-001)  

#### BE-003 — HTML SSR expensive fetches bypass `/api` rate limit
- **Category:** Security / availability  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/proxy.ts` (RL only for `/api/`); PL match `page.tsx`  
- **Evidence:** Architecture/R1 review  
- **Root cause:** RL keyed to API pathname only  
- **Impact:** Page URLs can drive upstream cost outside API limiter  
- **Exploitability:** Medium–High  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Cache SSR heavily or apply equivalent edge/RL controls  
- **Required tests:** SSR path does not unboundedly fan out  
- **Remediation size:** M  
- **Private-preview blocker:** No  
- **Production blocker:** Conditional at public scale  

#### BE-004 — WC26 apiFixtureId trusted without ownership bind
- **Category:** Data integrity / abuse  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/app/api/wc26/match/[fixtureId]/route.ts`; `src/lib/server/wc26-match-detail.ts`  
- **Evidence:** Optional query override used for events/lineups/stats  
- **Root cause:** Missing league/fixture ownership check (unlike PL)  
- **Impact:** Wrong match detail; extra quota burn  
- **Exploitability:** Medium  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Bind apiFixtureId to local fixture/league/season  
- **Required tests:** Reject mismatched apiFixtureId  
- **Remediation size:** S  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### BE-005 — Debug dumps authorised by DEBUG_SECRET or CRON_SECRET
- **Category:** Security (secret coupling)  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/lib/server/cache.ts` `isDebugAuthorized`; `src/app/api/debug/**`  
- **Evidence:** R1/secrets evidence  
- **Root cause:** Shared secret acceptance  
- **Impact:** Cron secret becomes debug oracle if leaked/weak  
- **Exploitability:** Medium (secret-dependent)  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Separate DEBUG_SECRET; never accept CRON_SECRET for debug  
- **Required tests:** Auth matrix for debug routes  
- **Remediation size:** S  
- **Private-preview blocker:** Conditional if preview shares weak secrets / development openness  
- **Production blocker:** Conditional if mis-set  

#### BE-006 — Auth/provider error messages returned to clients
- **Category:** Information disclosure  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/lib/api-football/route-errors.ts`; `src/lib/pl/api-core.ts`  
- **Evidence:** AuthError / `Check API_FOOTBALL_KEY` style messages  
- **Root cause:** Unsanitised error mapping  
- **Impact:** Config/provider fingerprinting (not raw key values observed)  
- **Exploitability:** Low–Medium  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Generic client errors; detail server-side only  
- **Required tests:** Public error envelope contract  
- **Remediation size:** S  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### BE-007 — FCM topic subscribe without required Firebase idToken
- **Category:** Security / abuse  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/app/api/firebase/fcm-token/route.ts`  
- **Evidence:** idToken optional  
- **Root cause:** Missing required auth for topic subscribe  
- **Impact:** Topic subscription spam / Admin SDK quota burn  
- **Exploitability:** Medium  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Require verified idToken (or App Check)  
- **Required tests:** 401 without idToken  
- **Remediation size:** S  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### BE-008 — ScoreBat token in query string
- **Category:** Secret handling  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/lib/scorebat/getScoreBatEmbed.ts` (+ related ScoreBat callers)  
- **Evidence:** `?token=` outbound URL pattern  
- **Root cause:** Provider URL shape / client construction  
- **Impact:** Token leakage via proxy/CDN logs  
- **Exploitability:** Medium (log-dependent)  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Header-based auth if provider allows; reduce log retention  
- **Required tests:** No token in logged URL fixtures  
- **Remediation size:** S–M  
- **Private-preview blocker:** No  
- **Production blocker:** Conditional if ScoreBat used  

#### BE-009 — Sentry beforeSend omits custom secret headers
- **Category:** Secret handling / telemetry  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/lib/sentry-config.ts`  
- **Evidence:** Deletes `authorization`/`cookie` only  
- **Root cause:** Incomplete header redaction  
- **Impact:** `x-cron-secret` / `x-debug-secret` may enter telemetry **if Sentry enabled**  
- **Exploitability:** Environment-dependent  
- **False-positive disposition:** Not FP as code gap  
- **Recommended correction:** Redact custom secret headers  
- **Required tests:** beforeSend redaction unit test  
- **Remediation size:** XS  
- **Private-preview blocker:** No  
- **Production blocker:** Conditional if Sentry enabled with those headers  

#### BE-010 — Top-scorers Tier-2 LiveScore day fan-out
- **Category:** Reliability / performance  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/lib/server/wc26-top-scorers.ts` + livescore source  
- **Evidence:** R1 architecture review  
- **Root cause:** Day-walk + per-match incidents on Tier-1 empty  
- **Impact:** Long requests / function timeouts (former PERF-005)  
- **Exploitability:** N/A (availability)  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Cap days/concurrency; hard timeouts; cache empty  
- **Required tests:** Fan-out budget under empty Tier-1  
- **Remediation size:** M  
- **Private-preview blocker:** No  
- **Production blocker:** Conditional during tournament empty Tier-1  

#### FE-004 — Site-wide WC26 live/results polling from Layout
- **Category:** Performance / client efficiency  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/components/layout/Layout.tsx` → `Wc26ResultsSync`; `LIVE_POLL_MATCH_MS` 15000 via fresh path  
- **Evidence:** Source + R1; archiveComplete stops polls  
- **Root cause:** Global mount of live sync  
- **Impact:** Background traffic on all pages (former PERF-001)  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Scope polling to live/match/bracket surfaces; demote cadence  
- **Required tests:** Non-live routes do not start 15s live polls  
- **Remediation size:** S–M  
- **Private-preview blocker:** Yes (noisy/budget)  
- **Production blocker:** Yes (cost/reliability under load)  

#### FE-005 — Live overlay replace can wipe lives on empty blip
- **Category:** Football data integrity  
- **Severity:** MAJOR  
- **Confidence:** Medium–High  
- **Location:** `src/lib/wc26-fixture-overlay.ts` `replaceLiveFixtureOverlay`  
- **Evidence:** Clears live entries then merges  
- **Root cause:** Replace-all live strategy  
- **Impact:** Brief false upcoming / missing scores  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Do not clear lives on empty/partial payloads  
- **Required tests:** Empty live payload preserves prior live overlay  
- **Remediation size:** S  
- **Private-preview blocker:** Yes  
- **Production blocker:** Yes  

#### FE-006 — Knockout completed heuristic via apiFixtureId + scores
- **Category:** Football data integrity  
- **Severity:** MAJOR  
- **Confidence:** Medium–High  
- **Location:** `src/lib/wc26-fixture-overlay.ts` `isEffectiveFixtureCompleted`  
- **Evidence:** Non-group + apiFixtureId + scores ⇒ completed  
- **Root cause:** Heuristic bypasses live status  
- **Impact:** False FT presentation  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Require finished status codes for completion  
- **Required tests:** Scored live knockout not completed  
- **Remediation size:** S  
- **Private-preview blocker:** Yes  
- **Production blocker:** Yes  

#### FE-007 — More sheet missing dialog keyboard pattern
- **Category:** Accessibility  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/components/layout/MoreBottomSheet.tsx`  
- **Evidence:** role=dialog without focus trap / Escape / focus restore  
- **Root cause:** Incomplete dialog pattern  
- **Impact:** Keyboard/SR users can strand focus  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Focus trap, Escape, initial/restore focus  
- **Required tests:** Playwright keyboard More sheet  
- **Remediation size:** S  
- **Private-preview blocker:** Yes  
- **Production blocker:** Yes (WCAG dialog)  

#### FE-008 — Preview robots.txt still Allow:/
- **Category:** SEO / preview boundary  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/lib/seo/robots-txt.ts`; `/api/robots`  
- **Evidence:** Always Allow:/; Sprint 002 HTML noindex separate  
- **Root cause:** robots.txt not gated by `shouldNoIndexDeploy()`  
- **Impact:** Preview discovery invitations despite HTML noindex  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Disallow/noindex robots for preview/dev deploys  
- **Required tests:** robots.txt content under VERCEL_ENV=preview  
- **Remediation size:** S  
- **Private-preview blocker:** Yes  
- **Production blocker:** No  

#### FE-009 — Dual news fetch stacks
- **Category:** State ownership / performance  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/lib/use-news-feed.ts` vs `NewsHub` SWR `/api/news`  
- **Evidence:** R1 news audit + architecture  
- **Root cause:** Separate owners/caches  
- **Impact:** Divergent freshness; possible duplicate traffic across surfaces  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Single ownership model per product decision  
- **Required tests:** One owner per route surface  
- **Remediation size:** M  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### FE-010 — PL shared SWR key with divergent fetchers
- **Category:** State ownership  
- **Severity:** MAJOR  
- **Confidence:** Medium–High  
- **Location:** HomeClient / useLiveFixtures / PlHubClient  
- **Evidence:** R1  
- **Root cause:** Same key, different transforms  
- **Impact:** Cache pollution / wrong shape by mount order  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** One fetcher per key or distinct keys  
- **Required tests:** Mount-order cache shape test  
- **Remediation size:** S  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### FE-011 — Locale-unsafe next/link on PL/news surfaces
- **Category:** Internationalisation  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** Multiple PL/news components (e.g. PlFixtureCard, PlHubClient, HomeLatestNews)  
- **Evidence:** R1 frontend audit  
- **Root cause:** Bypass `@/i18n/navigation`  
- **Impact:** Locale drop for non-default locales  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Use locale-aware Link/router  
- **Required tests:** fa/ar navigation keeps prefix  
- **Remediation size:** M  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### FE-014 — Lint React Compiler / setState-in-effect debt in chrome
- **Category:** Maintainability / reliability  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** BottomTabBar, MoreBottomSheet, header dropdowns, Auth/FCM, PlHubClient (LINT.txt)  
- **Evidence:** 41 errors including set-state-in-effect, preserve-manual-memoization  
- **Root cause:** Effect/setState and memo dependency patterns  
- **Impact:** Compiler skips; cascading render risk  
- **Exploitability:** N/A  
- **False-positive disposition:** Script `no-require-imports` are lower product risk; **src** cluster is material  
- **Recommended correction:** Fix src clusters in small batches (not one mega lint sprint)  
- **Required tests:** Lint gate on touched files  
- **Remediation size:** M (phased)  
- **Private-preview blocker:** No  
- **Production blocker:** No (except FE-003 already CRITICAL)  

#### FE-015 — Match-detail and live-centre poll multiplication
- **Category:** Performance / client efficiency  
- **Severity:** MAJOR  
- **Confidence:** High  
- **Location:** `src/lib/use-match-detail.ts`; LiveMatchCentre lineup polls; alongside FE-004 global scores  
- **Evidence:** R1 frontend audit (former PERF-002)  
- **Root cause:** Per-match pollers + global scores  
- **Impact:** Inflated Vercel/upstream request rate on live surfaces  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP; not double-counted with FE-004  
- **Recommended correction:** Share scores cache; stop finished-match polls  
- **Required tests:** Finished match poll interval 0  
- **Remediation size:** S–M  
- **Private-preview blocker:** Partial  
- **Production blocker:** Partial (rate limits)  

### MINOR

#### BE-011 — Knockout API returns diagnostic fetch logs
- **Category:** Information disclosure  
- **Severity:** MINOR  
- **Confidence:** High  
- **Location:** `src/app/api/wc26/knockout-fixtures/route.ts`  
- **Evidence:** R1  
- **Root cause:** Internal logs in JSON  
- **Impact:** Low-sensitivity recon  
- **Exploitability:** Low  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Strip logs from public response  
- **Required tests:** Response schema excludes logs  
- **Remediation size:** XS  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### BE-012 — Stale success cache masks upstream failures
- **Category:** Data freshness  
- **Severity:** MINOR  
- **Confidence:** High  
- **Location:** `src/lib/api-football/cache.ts`  
- **Evidence:** R1  
- **Root cause:** Serve stale on failure  
- **Impact:** Stale scores possible  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Surface stale flag in UI contracts  
- **Required tests:** Stale header/body asserted  
- **Remediation size:** S  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### FE-012 — Unsanitised article HTML + JSON-LD script sink
- **Category:** XSS defense-in-depth  
- **Severity:** MINOR  
- **Confidence:** High  
- **Location:** `ArticleBodyWithAd.tsx`; `JsonLd.tsx` / `JsonLdScript.tsx`  
- **Evidence:** R1/Semgrep-style  
- **Root cause:** dangerouslySetInnerHTML; JSON.stringify without script-break escaping  
- **Impact:** Low today (repo-authored CMS); higher if untrusted HTML arrives  
- **Exploitability:** Low currently  
- **False-positive disposition:** Not FP as hotspot  
- **Recommended correction:** Sanitize HTML; escape `</script>` in JSON-LD  
- **Required tests:** XSS fixture strings  
- **Remediation size:** S  
- **Private-preview blocker:** No  
- **Production blocker:** No (unless untrusted HTML ships)  

#### FE-013 — Hydration risks from locale/time formatting
- **Category:** Reliability  
- **Severity:** MINOR  
- **Confidence:** Medium  
- **Location:** HomeHero / PL cards / LivePageClient JSON-LD time  
- **Evidence:** R1  
- **Root cause:** Server/client timezone formatting divergence  
- **Impact:** Hydration warnings / flicker  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP  
- **Recommended correction:** Consistent local-kickoff helpers  
- **Required tests:** Hydration-safe time rendering  
- **Remediation size:** S  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### A11Y-001 — Colour contrast / landmark / h1 issues observed in critical Playwright axe
- **Category:** Accessibility  
- **Severity:** MINOR  
- **Confidence:** Medium–High  
- **Location:** Homepage / live / match-detail (axe annotations in PLAYWRIGHT.txt)  
- **Evidence:** Deferred color-contrast; moderate landmark-unique; moderate page-has-heading-one  
- **Root cause:** Theme/contrast and landmark structure  
- **Impact:** WCAG risk; deferred contrast did not fail suite  
- **Exploitability:** N/A  
- **False-positive disposition:** Not FP; severity limited because contrast deferred  
- **Recommended correction:** Contrast audit + unique landmarks + h1 on match detail  
- **Required tests:** Promote contrast from deferred when fixed  
- **Remediation size:** M  
- **Private-preview blocker:** No  
- **Production blocker:** No  

### INFORMATIONAL

#### INFO-001 — Public sports APIs intentionally unauthenticated
- **Category:** Architecture / threat model  
- **Severity:** INFORMATIONAL  
- **Confidence:** High  
- **Location:** `src/app/api/{pl,wc26,news,videos,articles,scores}/**`  
- **Evidence:** R1  
- **Root cause:** Product model  
- **Impact:** Relies on RL/cache (BE-001/BE-002/ENV-001)  
- **Exploitability:** N/A  
- **False-positive disposition:** Treating “no auth” alone as CRITICAL auth bypass = FP  
- **Recommended correction:** None for auth model; harden quota controls  
- **Required tests:** N/A  
- **Remediation size:** N/A  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### INFO-002 — Script-tooling lint noise (non-literal fs / require)
- **Category:** Quality gate hygiene  
- **Severity:** INFORMATIONAL  
- **Confidence:** High  
- **Location:** `scripts/**`, screenshot-helpers (LINT-CLASSIFIED)  
- **Evidence:** LINT.txt  
- **Root cause:** ESLint applied to Node tooling  
- **Impact:** Inflates error counts; low runtime product risk  
- **Exploitability:** N/A  
- **False-positive disposition:** False positive as product security findings  
- **Recommended correction:** Scope eslint ignores for tooling in a dedicated chore  
- **Required tests:** N/A  
- **Remediation size:** XS  
- **Private-preview blocker:** No  
- **Production blocker:** No  

#### DEP-001 — npm audit 15 unverified advisories
- **Category:** Supply chain  
- **Severity:** INFORMATIONAL  
- **Confidence:** Scanner-only  
- **Location:** package-lock transitive graph (NPM-AUDIT*)  
- **Evidence:** 8 high / 7 moderate; no exploit path proven  
- **Root cause:** Advisory database vs unmapped code paths  
- **Impact:** Unknown until CVE-to-path mapping  
- **Exploitability:** Unverified  
- **False-positive disposition:** Unverified scanner advisory (not auto-BLOCKER)  
- **Recommended correction:** Separate dependency path-mapping sprint  
- **Required tests:** After upgrades, unit+critical e2e  
- **Remediation size:** M–L  
- **Private-preview blocker:** No  
- **Production blocker:** No (until mapped)  

#### CFG-001 — CI GitHub Actions pinned to major tags not commit SHAs
- **Category:** Supply chain / CI  
- **Severity:** INFORMATIONAL  
- **Confidence:** High  
- **Location:** `.github/workflows/ci.yml` (`actions/checkout@v4`, etc.)  
- **Evidence:** Pre-gate / secrets evidence  
- **Root cause:** Tag floating  
- **Impact:** Supply-chain mutability of actions  
- **Exploitability:** Low (GitHub trust model)  
- **False-positive disposition:** Not FP  
- **Recommended correction:** SHA-pin actions  
- **Required tests:** CI still green  
- **Remediation size:** XS  
- **Private-preview blocker:** No  
- **Production blocker:** No  

---

## 9. Copilot addendum coverage matrix

| Check | Status | Evidence / inspected locations | Resulting finding IDs |
|-------|--------|--------------------------------|------------------------|
| /styles and /public | Completed (targeted) | No top-level `/styles` dir; CSS modules under `src/components/**`; `public/` flags, images, `logo.svg`, `sw.js`, OneSignal workers | no material finding (asset presence OK; SW/OneSignal not deep-audited) |
| State ownership and prop drilling | Completed (from R1 + reuse) | Home PL props fix (Sprint 002); FE-009/FE-010 dual owners | FE-009, FE-010 |
| Context providers | Completed (targeted) | `ThemeProvider`, `NextIntlClientProvider`, `FirebaseAuthProvider` | no material finding |
| Async race conditions | Incomplete | Overlay replace + SWR visibility interactions inferred; no exhaustive race audit | FE-002, FE-005 (related); full race matrix incomplete |
| Internal links and dynamic routes | Completed (partial) | Locale Link issues; dynamic `[fixtureId]` / `[slug]` routes exist | FE-011; BE-004 |
| Keyboard navigation | Completed (partial) | More sheet reviewed; critical e2e opens More sheet but not full keyboard cert | FE-007 |
| Colour contrast | Completed (partial) | axe deferred contrast in PLAYWRIGHT.txt | A11Y-001 |
| Responsive consistency | Incomplete | Mobile critical journey 7/7 passed; no full breakpoint matrix | no material finding from subset; full matrix incomplete |
| API payload size | Incomplete | No payload-byte budgeting performed | no material finding (incomplete) |
| Dead/unreachable API routes | Incomplete | 29 `route.ts` files inventoried; no reachability graph proving dead routes | no material finding (incomplete) |
| HTTP status codes | Completed (partial) | Spot-check: 400/401/404/500 patterns in match/FCM/PL routes via `respondError` | no material finding |
| Runtime validation/null handling | Completed (partial) | Zod usage in validation schemas; gaps around apiFixtureId ownership | BE-004; BE-006 |
| Unnecessary provider/database requests | Completed (partial) | No DB clients; unnecessary upstream fan-out covered | BE-001, BE-010, FE-004, FE-015; INFO DB absence |
| CORS applicability | Completed (targeted) | `Access-Control-Allow-Origin: *` on assetlinks well-known only; browser same-origin app APIs | no material finding for core JSON APIs |

**Addendum verdict:** Partial coverage. Matrix documents completed vs incomplete checks without claiming full Copilot-style certification.

---

## 10. Inherited programme blockers (not counted in §7 totals)

| ID | Status | Notes |
|----|--------|-------|
| BLK-001/005 SoT programme | OPEN / partial | Repo DB NOT_FOUND; external proof open |
| BLK-002 PR #11 | OPEN | Not modified this task |
| BLK-003 GSC | OPEN | Programme |
| BLK-004 SEPANAI/membership | OPEN | Out of scope |
| BLK-006 private preview platform | OPEN | Code noindex exists; Deployment Protection unproven |

---

## 11. Private-preview blockers (from canonical register + inherited)

1. FE-001, FE-002, FE-003 (live integrity / client stability)  
2. FE-004, FE-005, FE-006 (live accuracy / polling)  
3. FE-007 (More sheet a11y)  
4. FE-008 (preview robots.txt)  
5. Inherited BLK-002, BLK-006  
6. BE-005 conditional if preview secrets weak / development debug openness  

## 12. Production blockers (from canonical register + inherited)

1. FE-001, FE-002, FE-003  
2. FE-004, FE-005, FE-006, FE-007  
3. BE-001 + BE-002 + ENV-001 — **conditional on environment proof** for quota/RL  
4. BE-009 conditional if Sentry enabled with custom secret headers  
5. Inherited BLK-001/005, BLK-003  

## 13. Recommended next smallest remediation sprint

**GC-MVP-READINESS-SPRINT-003 — Football live integrity**

Scope: FE-001 → FE-002 → FE-003 only (`wc26-match-status.ts`, `fetcher.ts`, `live-data.ts`, status/visibility/hooks tests).  
Do not mix RL/env proof, robots.txt, or lint-script cleanup.

## 14. Confirmation of prohibited actions

- No application code changed  
- No tests changed  
- No configuration changed  
- No dependencies or lockfiles changed  
- Nothing pushed, merged, or deployed  
- PR #11 untouched  
- main untouched  
- No Semgrep/Sonar execution  
- No repeated full gate runs (accepted R1 evidence)  
- R2 docs commit does not amend itself to insert its own SHA  

## 15. Evidence index (reused)

All `reports/audits/evidence/GC-FULLSTACK-STATIC-AUDIT-001-*` files from commit `f134a4d…`, plus this R2 report.

---

**GC-FULLSTACK-STATIC-AUDIT-001-R2 status:** COMPLETE (RECONCILIATION ONLY)