# GC-GROWTH-RECONCILIATION-001-R1 — Repository-Grounded Growth Reconciliation

**Status:** REWORK REQUIRED — EVIDENCE-ONLY REPOSITORY AUDIT  
**Report version:** 1.0.0-R1  
**Audit timestamp (BST):** 24/07/2026 – 11:59 BST  
**Auditor scope:** Audit and planning only — no implementation authorised

---

## 0. Mandatory pre-execution git gate

| # | Item | Evidence |
|---|------|----------|
| 1 | Repository path | `C:/Users/zafar/OneDrive/Desktop/CURSOR BAT/goalcurrent-live-nextjs` (`git rev-parse --show-toplevel`) |
| 2 | Current branch | `recovery/gc-exec-batch-005` |
| 3 | Current HEAD SHA | `bbed4cfc22f3b1b906cac6184f3f805f7c2513aa` |
| 4 | `origin/main` SHA | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| 5 | Recovery branch SHA (remote) | `bbed4cfc22f3b1b906cac6184f3f805f7c2513aa` |
| 6 | Draft PR #11 head SHA | `5ed5b3cd827627a18b40e6879309f184acbab63f` |
| 7 | Working-tree status | Clean (`git status`: nothing to commit) |
| 8 | Local/remote match | Yes — recovery branch up to date with `origin/recovery/gc-exec-batch-005` |
| 9 | Untracked files | None at audit time |
| 10 | Gate timestamp | 24/07/2026 – 11:59 BST |

**Production baseline:** `20515a11` (Vercel production = `origin/main` per `reports/GC-REC-005-03-PRODUCTION-TRUTH-SNAPSHOT.md`).

**Branch topology (evidence):**

- `recovery/gc-exec-batch-005` merge-base with `origin/main` = `20515a11` — recovery is **main + 11 documentation commits** (GC-REC-005-*); **no application code diff** vs main.
- PR #11 branch = `feature/wc26-archive-private-preview` (`git branch -a --contains 5ed5b3c`); merge-base with main = `31be078` — **separate line of work**, not merged to main or recovery.
- **Gate result:** PASSED — branches and PR accessible.

**Prior unsupported report:** No file matching `GC-GROWTH-RECONCILIATION-001*` or `GC-GROWTH*` exists in the repository (`glob **/GC-GROWTH*` → 0). This R1 report supersedes any out-of-repo plan.

---

## 1. Task 01 — Repository truth (inventories)

### 1.1 Route inventory

**Evidence:** 89 `page.tsx` files under `src/app/[locale]/` (glob count); locale routing `src/i18n/routing.ts` (`localePrefix: "as-needed"`).

| Route family | Public URL pattern | Filesystem | Status |
|--------------|-------------------|------------|--------|
| Homepage | `/` | `src/app/[locale]/page.tsx` | VERIFIED_IMPLEMENTED |
| Live scores | `/live` | `src/app/[locale]/live/page.tsx` | VERIFIED_IMPLEMENTED |
| WC match | `/match/[fixtureId]` | `src/app/[locale]/match/[fixtureId]/page.tsx` | VERIFIED_IMPLEMENTED |
| WC hub/archive | `/worldcup2026` + subroutes | `src/app/[locale]/worldcup2026/**` | VERIFIED_IMPLEMENTED (archive UX on main: `src/lib/wc26/archive.ts`, hub `worldcup2026/page.tsx:20-24`) |
| WC legacy match | `/worldcup2026/match/[fixtureId]` | `worldcup2026/match/[fixtureId]/page.tsx:8-14` | VERIFIED_IMPLEMENTED — redirect to `/match/` |
| Premier League | `/premier-league/**` | `src/app/[locale]/premier-league/**` | VERIFIED_IMPLEMENTED |
| Articles | `/articles`, `/articles/[slug]`, static slugs | `src/app/[locale]/articles/**` | VERIFIED_IMPLEMENTED |
| News hubs | `/news/**` | `src/app/[locale]/news/**` | VERIFIED_IMPLEMENTED |
| Statistics stubs | `/statistics/*` (7 routes) | `src/app/[locale]/statistics/**` | VERIFIED_PARTIAL — noindex stubs |
| Transfer stubs | `/transfers/*` (4 routes) | `src/app/[locale]/transfers/**` | VERIFIED_PARTIAL — noindex stubs |
| Favourites | `/favourites` (+ club/player stubs) | `src/app/[locale]/favourites/**` | VERIFIED_PARTIAL |
| Videos | `/videos/**`, legacy `/video/**` redirects | `src/app/[locale]/videos/**`, `video/**` | VERIFIED_IMPLEMENTED |
| Legal/info | `/about`, `/contact`, `/terms`, etc. | respective `page.tsx` | VERIFIED_IMPLEMENTED |
| Auth UI | (Firebase sign-in menu) | `src/components/firebase/AuthMenu.tsx` | VERIFIED_PARTIAL — optional user auth, not route-gated site |
| Dashboard | — | grep `dashboard` in `src/app` → **0 page routes** | NOT_FOUND |
| Private preview gate | — | no middleware/password in app code | NOT_FOUND — policy in docs only |

Full static sitemap path list: `src/lib/seo/sitemap-static-paths.ts:27-60`.  
Noindex stub list: `src/lib/seo/sitemap-static-paths.ts:7-24`.

### 1.2 Metadata inventory

| Mechanism | Location | Count / notes |
|-----------|----------|---------------|
| Root defaults | `src/app/[locale]/layout.tsx:55-84` | `metadataBase`, OG, Twitter |
| `generateMetadata` | 6 dynamic routes | match, articles/[slug], wc26 groups/teams, PL clubs/match |
| Static `export const metadata` | 77+ pages | via `buildPageMetadata`, `buildComingSoonMetadata`, article helpers |
| Shared builder | `src/lib/page-metadata.ts:46-80` | OG + Twitter |
| Noindex stubs | `src/lib/coming-soon-page.tsx:18-28` | `robots: { index: false, follow: true }` |
| Canonical / alternates | `buildPageMetadata`, hreflang via `src/lib/i18n/urls.ts` | locale → often unprefixed EN (GC-REC-005-04) |

### 1.3 Sitemap inventory

| Artifact | Path | Role |
|----------|------|------|
| Sitemap generator | `src/lib/seo/sitemap-entries.ts` | `collectSitemapPathSpecs`, `buildMultilingualSitemap` |
| Static paths | `src/lib/seo/sitemap-static-paths.ts` | indexable vs noindex |
| XML API | `src/app/api/sitemap/route.ts` | serves `/sitemap.xml` |
| News sitemap | `src/app/api/sitemap-news/route.ts`, `src/lib/seo/news-sitemap.ts` | 48h news window |
| Robots | `src/lib/seo/robots-txt.ts:3-10`, `src/app/api/robots/route.ts` | Allow `/`, Disallow `/api/` |
| Rewrites | `next.config.ts:80-89` | `/sitemap.xml`, `/robots.txt` → API |
| **No** root `sitemap.ts` | glob → 0 | API-driven only |

**Production truth (GC-REC-005-04):** 3,177 unique `<loc>` in live sitemap; duplicate WC match families (`/match/` + `/worldcup2026/match/` both emitted at `sitemap-entries.ts:114-126`).

### 1.4 Schema / migration inventory

| Item | Result | Evidence |
|------|--------|----------|
| SQL migrations | NOT_FOUND | `glob **/*.sql` → 0; no `supabase/` directory |
| Drizzle / Supabase deps | NOT_FOUND | `package.json` — no `@supabase/*`, `drizzle-orm` |
| DB types | NOT_FOUND | no generated DB types in repo |
| Data layer | VERIFIED_IMPLEMENTED | Static TS/JSON: `src/data/`, `src/utils/cache/` |

Future DB references are **documentation only**: `docs/product/GC-WC26-ARCHIVE-SPEC-001.md:147`, `reports/GC-REC-005-02-BRANCH-PR-DISPOSITION-AUDIT.md:111-261`.

### 1.5 SEPANAI inventory

| Item | State | Evidence |
|------|-------|----------|
| SEPANAI API client / adapter | NOT_FOUND | grep `sepanai` in `src/` → 0 |
| SEPANAI route handlers | NOT_FOUND | no `src/app/api/sepanai` |
| SEPANAI env vars in code | NOT_FOUND | grep in `src/` → 0 |
| SEPANAI test fixtures | VERIFIED_IN_ACTIVE_PR | `tests/fixtures/wc26/sepanai-historical-matches.json` — **on PR #11 only** (`git show HEAD:path` → absent on recovery/main) |
| SEPANAI tests | VERIFIED_IN_ACTIVE_PR | `tests/lib/sepanai-historical-fixtures.test.mjs` — PR #11 only |
| SEPANAI documentation | VERIFIED_PLANNED_ONLY | `docs/sepanai/GC-WC26-HISTORICAL-TEST-DATA-001.md` (present on current branch) |

**Classification:** SEPANAI operational pipeline = **NOT_FOUND** on main/production path; test data + docs = **VERIFIED_PLANNED_ONLY** / **VERIFIED_IN_ACTIVE_PR**.

### 1.6 Editorial workflow inventory

| Capability | State | Evidence |
|------------|-------|----------|
| Content storage | VERIFIED_IMPLEMENTED | Static TS: `src/data/articles.ts`, `src/data/editorial/*.ts` |
| Editorial type | VERIFIED_IMPLEMENTED | `src/types/editorial.ts:14-25` — `publishedAt`, no draft fields |
| Draft / review / approval states | NOT_FOUND | no enum/DB fields for workflow |
| Founder approval in code | NOT_FOUND | policy in `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md` |
| Rollback / version history | NOT_FOUND | git history only |
| Factual validation gates | NOT_FOUND | manual/content review implied |
| Empty-output protection | NOT_FOUND | no generator pipeline in repo |
| Audit logging (editorial) | NOT_FOUND | |
| Merge RSS + editorial | VERIFIED_IMPLEMENTED | `src/content/merge.ts:42-55` |

### 1.7 Social integration inventory

| Platform | State | Evidence |
|----------|-------|----------|
| X (Twitter) | VERIFIED_PARTIAL | Footer `src/lib/nav.ts:261-263`; share intent `src/components/ui/ShareButtons.tsx:20-24`; site metadata |
| Facebook | VERIFIED_PARTIAL | Footer + ShareButtons `:28-32` |
| Instagram | VERIFIED_PARTIAL | Footer link only `nav.ts:256-258` — no API/publishing |
| TikTok | VERIFIED_PARTIAL | Footer link `nav.ts:266-268` |
| Bluesky | NOT_FOUND | grep → 0 (false positive in article prose only) |
| Threads | NOT_FOUND | grep → 0 |
| Auto publishing / webhooks | NOT_FOUND | grep `webhook` in `src/` → 0 social publish |

### 1.8 Authentication / preview-control inventory

| Item | State | Evidence |
|------|-------|----------|
| Firebase Auth (optional) | VERIFIED_IMPLEMENTED | `src/contexts/FirebaseAuthContext.tsx`, `AuthMenu.tsx` |
| next-auth | NOT_FOUND | grep → 0 |
| Route middleware auth | NOT_FOUND | no `middleware.ts` auth gate |
| Netlify/Vercel deployment protection | BLOCKED_BY_MISSING_EVIDENCE | not in repo — external platform config |
| Private preview policy | VERIFIED_PLANNED_ONLY | `AGENTS.md:19-27`, `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md` |
| Analytics preview gating | VERIFIED_IMPLEMENTED | `src/lib/analytics/config.ts:10`, tests `tests/analytics/environment-gating.test.mjs` |

---

## 2. Task 02 — Active branches and Draft PR #11

### 2.1 Comparison table

| Branch / ref | SHA | vs `origin/main` | Purpose |
|--------------|-----|------------------|---------|
| `origin/main` (production) | `20515a11` | baseline | Live GoalCurrent |
| `recovery/gc-exec-batch-005` | `bbed4cf` | +11 commits, **docs/evidence only** | GC-REC-005 recovery audits |
| PR #11 `feature/wc26-archive-private-preview` | `5ed5b3c` | +45 files, **code + docs + tests** | WC26 archive private preview (Batch 004) |

### 2.2 Recovery branch changes (vs main)

**Evidence:** `git diff --stat origin/main...origin/recovery/gc-exec-batch-005` — 17 files, +7,265 lines, **all under `reports/`** (GC-REC-005-01 through 005-05 + evidence CSV/JSON). **Zero** `src/`, `package.json`, or config changes.

**Overlap with growth:** Recovery reports document sitemap/GSC/WC contradictions — **planning input only**, not fixes.

### 2.3 Draft PR #11 changes (vs main)

**Evidence:** `gh pr view 11 --json files` — 45 files changed (+3,443 / −366). Summary by type:

| Category | Examples | Growth overlap |
|----------|----------|----------------|
| WC26 archive UX | `FinalWinnerCelebration.tsx` (−296 lines), `Wc26ResultsSync.tsx`, `nav.ts`, `LiveRibbon.tsx` | Live retirement, archive nav — **active fix for GC-REC-005-03/04 live/archive conflict** |
| Analytics | `src/components/analytics/Clarity.tsx` (new) | Post-release measurement |
| Reporting standard | `templates/*.md`, `scripts/validate-reporting-standard.mjs`, `docs/standards/REPORTING_STANDARD.md` | Process, not product |
| SEPANAI test data | `tests/fixtures/wc26/sepanai-historical-matches.json`, tests | Future AI content — **planned** |
| i18n | `messages/*.json` (4 lines each × 9 locales) | Archive copy tweaks |
| Docs/reports | `reports/GC-WC26-*`, `docs/sepanai/*` | Founder review pack |

**Conflicts / regressions (documented, not re-tested here):**

- PR #11 not rebased onto latest main (`merge-base` = `31be078` ≠ `20515a11`) — **merge risk** per GC-REC-005-02 disposition (**PORT**, rebuild recommended).
- Recovery audit branch does **not** include PR #11 code — auditors on recovery see **main/production code**, not PR #11 deltas.

---

## 3. Task 03 — Route architecture (selected routes)

| Route | Path | Rendering | Data source | Canonical | Indexability | Status |
|-------|------|-----------|-------------|-----------|--------------|--------|
| Homepage | `/` | RSC + client | WC26/PL APIs + static | self | index | VERIFIED_IMPLEMENTED |
| Live | `/live` | `force-dynamic` (`live/page.tsx:1-2`) | `/api/wc26/scores` | self | index — **SEO/live copy conflict** (GC-REC-005-03) | VERIFIED_IMPLEMENTED |
| WC match | `/match/[fixtureId]` | dynamic metadata | WC26 static + API overlay | self | index | VERIFIED_IMPLEMENTED |
| WC hub | `/worldcup2026` | static metadata "Archive" | `src/lib/wc26/archive.ts` | self | index | VERIFIED_IMPLEMENTED |
| PL hub | `/premier-league` | static | API-Football via `/api/pl/*` | self | index | VERIFIED_IMPLEMENTED (pre-season) |
| Articles | `/articles/[slug]` | static + dynamic slug | `src/data/articles.ts` | self | index | VERIFIED_IMPLEMENTED |
| Statistics stub | `/statistics/assists` | Coming soon | none | self | **noindex** (`coming-soon-page.tsx:27`) | VERIFIED_PARTIAL |
| Auth | N/A (component) | client Firebase | Firebase | N/A | N/A | VERIFIED_PARTIAL |
| Dashboard | — | — | — | — | — | NOT_FOUND |
| Private preview | — | — | — | — | — | NOT_FOUND (docs only) |

---

## 4. Task 04 — Metadata architecture

**Verified patterns:**

- Title/description via `buildPageMetadata` with path-based canonical URLs.
- Dynamic routes compute match/article-specific titles (`match/[fixtureId]/page.tsx:31+`).
- Stub pages inherit noindex via `buildComingSoonMetadata` (`coming-soon-page.tsx:27`).

**Pollution / inheritance risks (confirmed):**

1. **`/live` metadata still says "World Cup 2026 live scores"** while hub is archive — `src/app/[locale]/live/page.tsx:11-14` vs `worldcup2026/page.tsx:20-22` (GC-REC-005-03 contradiction #1).
2. **Locale URLs canonicalise to unprefixed English** — live evidence GC-REC-005-04; GSC **1,397** alternate-canonical count (GC-REC-005-05).
3. **Redirect-only pages** (6 routes) inherit root layout metadata only — no page-specific SEO (`news/articles/page.tsx`, `video/*`, `worldcup2026/match/*`).
4. **`/live` priority 0.9 in sitemap** — `sitemap-entries.ts:58` — elevates legacy live surface in crawl budget.

---

## 5. Task 05 — Structured data

**Search completed:** `JsonLd`, `JsonLdScript`, `schema.org`, `@type` across `src/`.

| Schema type | Generator | Routes (sample) |
|-------------|-----------|-----------------|
| `@graph` / Organization | `SiteJsonLd.tsx` | layout |
| `SportsEvent` | `schema.ts`, `MatchSeo.tsx`, `LivePageClient.tsx:27-49` | match, live |
| `NewsArticle` | `ArticleSeo.tsx`, `schema.ts` | articles |
| `Event` / `EventSeries` | `worldcup2026/page.tsx:31-50` | WC hub |
| BreadcrumbList | `breadcrumbs.ts:22` | multiple |

**Tests:** No dedicated JSON-LD unit tests found (grep `tests/**` + `JsonLd` → 0).

**Risks:** Live page emits `SportsEvent` while tournament archived — alignment risk with visible content (GC-REC-005-03).

---

## 6. Task 06 — Sitemap and robots

**Current model:**

1. `collectSitemapPathSpecs()` builds logical paths (static + WC fixtures × **two paths each** + PL clubs + articles).
2. `buildMultilingualSitemap()` expands each path × 9 locales with hreflang (`sitemap-entries.ts:165-185`).
3. Served via API route; `lastModified` from fixture kickoff, article dates, or **fallback `new Date()`** at generation (`sitemap-entries.ts:86-90`).

**Duplication risk (VERIFIED):** `sitemap-entries.ts:114-126` emits both `matchHref(id)` and `wc26HubMatchHref(id)` for every fixture → **~2× WC match URLs** × locales (3,177 total per GC-REC-005-04).

**Stale timestamp risk:** Static paths use single `fallback` date at request time — all static pages share same `lastmod` per generation.

**News sitemap:** `news-sitemap.ts` — editorial window 48h; production **0 locs** (GC-REC-005-03).

**Cron/regeneration:** No cron in repo for sitemap; generated on demand via API GET.

---

## 7. Task 07 — Supabase/PostgreSQL

**Result:** **NOT_FOUND** in repository.

- No migrations, no RLS, no editorial tables, no fixture result tables in SQL.
- All fixture/article data in TypeScript modules (`src/data/wc26.ts`, etc.) and JSON caches.

**Do not propose new tables in this audit** (per task brief).

---

## 8. Task 08 — SEPANAI

| Component | Classification | Evidence |
|-----------|----------------|----------|
| API client | NOT_FOUND | — |
| Prompts / validators | NOT_FOUND | — |
| Feature flags | NOT_FOUND | — |
| Test fixtures | VERIFIED_IN_ACTIVE_PR | PR #11 files only |
| Documentation | VERIFIED_PLANNED_ONLY | `docs/sepanai/GC-WC26-HISTORICAL-TEST-DATA-001.md` |
| Operational usage controls | NOT_FOUND | — |

---

## 9. Task 09 — Editorial workflow trace

**Actual path today:**

1. Author writes TypeScript content in `src/data/` or static `page.tsx` / `*Body.tsx`.
2. Article index in `src/data/articles.ts` + `EDITORIAL_ARTICLES` in `src/data/editorial/index.ts:5-8` (2 editorial articles).
3. Sitemap picks up slugs via `getAllCanonicalArticleSlugs()` and `EDITORIAL_ARTICLES` (`sitemap-entries.ts:138-159`).
4. News sitemap uses `publishedAt` (`news-sitemap.ts:85-102`).
5. Deploy via git → Vercel (policy: Founder approval after private preview).

**Missing vs enterprise CMS:** draft, review, approval, rollback, audit log, empty-output guards — all **NOT_FOUND**.

---

## 10. Task 10 — Internal linking

**Verified components:**

- `src/lib/seo/internal-links.ts:5-58` — WC/PL match, team, club link builders.
- `src/components/match/MatchRelatedLinks.tsx:21-68` — prev/next match, same-group fixtures.
- `src/components/seo/RelatedInternalLinks.tsx:14-29` — generic aside.
- Editorial inline links in recap pages (e.g. `world-cup-2026-july-3-recap/page.tsx:60-190`).

**Gaps:**

- Article → match linking is **manual** in static JSX, not systematic.
- Duplicate match URL families may split link equity (`/match/` vs `/worldcup2026/match/` redirect).
- Long-tail H2H/form routes **NOT_FOUND** as dedicated pages.

---

## 11. Task 11 — World Cup archive status

| Aspect | State | Evidence |
|--------|-------|----------|
| Hub presentation | Archived | `worldcup2026/page.tsx:20-24`, `archive.ts` |
| Live API WC fixtures | Empty array | GC-REC-005-03 `/api/wc26/fixtures` |
| `/live` route | Still public, live SEO | `live/page.tsx:11-14` |
| Duplicate match URLs in sitemap | Yes | `sitemap-entries.ts:114-126`; GC-REC-005-04 |
| PR #11 live retirement | VERIFIED_IN_ACTIVE_PR | `tests/lib/wc26-live-retirement.test.mjs` (PR only), nav changes |
| noindex on WC | No | indexable |
| Public production (main) | Archive hub + live copy conflict | GC-REC-005-03 |

---

## 12. Task 12 — Search Console remediation scope

Mapped from `reports/GC-REC-005-05-SEARCH-CONSOLE-RECONCILIATION.md` + repository evidence:

| GSC issue | Count | URL pattern | Repo cause | Active code fix | Validation |
|-----------|------:|-------------|------------|-----------------|------------|
| Alternative page with proper canonical | 1,397 | `/{locale}/*` → EN canonical | locale hreflang strategy | NOT_FOUND on main | Failed |
| Discovered – not indexed | 1,427 | sitemap URLs | crawl budget / quality | NOT_FOUND | Not Started |
| Page with redirect | 526 | legacy/www/PL IDs | redirects + legacy URLs | PARTIAL (`worldcup2026/match` redirect) | Failed |
| Duplicate without user canonical | 25 | WC duplicate routes | `sitemap-entries.ts:114-126` | NOT_FOUND | Started |
| Soft 404 | 10 | unknown examples | thin/syncing pages | NOT_FOUND | Not Started |
| noindex | 61 | stub pages? | `NOINDEX_STUB_PATHS` | VERIFIED_IMPLEMENTED for stubs | Not Started |

**No Search Console fix exists in application code on main** — only recovery **reports**. PR #11 addresses **live/archive UX** partially, not sitemap dedup or GSC validation.

---

## 13. Task 13 — Core Web Vitals

| Work | State | Evidence |
|------|-------|----------|
| Lighthouse script | VERIFIED_IMPLEMENTED | `scripts/lighthouse-home.mjs`, `npm run lighthouse:home` |
| Perf doc | VERIFIED_IMPLEMENTED | `docs/perf/HOMEPAGE-PERF.md` |
| CLS mitigation | VERIFIED_PARTIAL | `RemoteImage.tsx:16` explicit dimensions |
| eslint CWV | VERIFIED_IMPLEMENTED | `eslint.config.mjs:2` core-web-vitals |
| CI Lighthouse | NOT_FOUND | `reports/GC-PERFORMANCE-001.md` |
| Automated CLS/LCP tests | NOT_FOUND | grep tests → 0 |
| Clarity (PR #11) | VERIFIED_IN_ACTIVE_PR | `Clarity.tsx` on PR #11 |

---

## 14. Task 14 — Social (summary)

See §1.7. **Automatic publishing: NOT_FOUND.** Share = X + Facebook only.

---

## 15. Task 15 — Long-tail content capability

| Page type | Routes | Data | Assessment |
|-----------|--------|------|------------|
| Head-to-head | NOT_FOUND as route | editorial article only (`fifa-world-cup-2026-head-to-head-rule-*`) | **NOT_FOUND** — no dynamic H2H pages |
| Form guide | NOT_FOUND | team/fixture stats in components only | **NOT_FOUND** |
| Qualification scenarios | NOT_FOUND | `getWc26FinalQualificationMap` display only | **VERIFIED_PARTIAL** — display not standalone URLs |
| Standings implications | VERIFIED_PARTIAL | group standings components | no dedicated implication pages |
| Post-match explanation | VERIFIED_PARTIAL | static recap articles | manual, not generated |

**Thin-content / API cost:** Any auto-generated long-tail would need SEPANAI + DB — **NOT_FOUND** today.

---

## 16. Task 16 — Duplication and conflict register

| Growth concept | Existing (main) | Active (PR #11) | Planned (docs) | Conflict |
|----------------|-----------------|-------------------|----------------|----------|
| WC archive UX | partial archive.ts | nav/live retirement tests | GC-WC26-* reports | `/live` SEO still live-labelled on main |
| Sitemap dedup | duplicate WC paths | not in PR #11 | GC-REC-005-04 backlog | **CONFLICTING_IMPLEMENTATIONS** — sitemap vs redirect |
| SEPANAI content | NOT_FOUND | test fixtures | docs/sepanai | safe extension: after DB decision |
| Supabase editorial | NOT_FOUND | NOT_FOUND | v2 specs | defer |
| GSC canonical fix | NOT_FOUND | NOT_FOUND | GC-REC-005-05 backlog | locale strategy vs GSC Failed validation |
| Social auto-publish | NOT_FOUND | NOT_FOUND | — | reject for now |
| Private preview gate | docs only | reporting templates | PRIVATE-PREVIEW policy | needs platform config |
| Long-tail SEO pages | NOT_FOUND | NOT_FOUND | growth proposals | requires data + licensing review |

---

## 17. Task 17 — Verified gap analysis (matrix excerpt)

| Capability | Verified state | Evidence | Recommendation |
|------------|----------------|----------|----------------|
| Production truth audits | VERIFIED_IMPLEMENTED | GC-REC-005-* reports | RETAIN |
| Sitemap URL hygiene | VERIFIED_PARTIAL | 3,177 URLs, duplicates | COMPLETE_ACTIVE_WORK after Founder approval |
| GSC reconciliation | VERIFIED_IMPLEMENTED | GC-REC-005-05 | RETAIN — refresh exports later |
| WC live retirement | VERIFIED_IN_ACTIVE_PR | PR #11 | COMPLETE_ACTIVE_WORK — merge via private preview |
| SEPANAI pipeline | NOT_FOUND | docs/tests only | DEFER |
| PostgreSQL editorial CMS | NOT_FOUND | — | DEFER |
| Long-tail programmatic SEO | NOT_FOUND | — | REJECT until recovery closed |
| Bluesky/Threads | NOT_FOUND | — | DEFER |
| CWV CI | NOT_FOUND | manual lighthouse only | ADD_AFTER_RECOVERY |
| Editorial workflow automation | VERIFIED_PARTIAL | static TS only | AMEND — design before scale |

---

## 18. Task 18 — Acceptance criteria (future capabilities, no implementation)

### 18.1 Sitemap deduplication (when authorised)

- Functional: single canonical `<loc>` per logical WC match; `/worldcup2026/match/*` redirect-only, excluded from sitemap.
- SEO: GSC alternate-canonical count trends down on re-export; 0 duplicate fixture `<loc>`.
- Tests: unit test on `collectSitemapPathSpecs` URL count; GC-REC-005-04-style spot check.
- Private preview: Ahmad review + Founder approval per `AGENTS.md`.
- Performance: sitemap generation < 5s on Vercel.

### 18.2 WC live-surface retirement (PR #11 path)

- Functional: `/live` copy/metadata reflect archive or route noindexed.
- SEO: no "live scores" title on completed tournament pages in sample of 20 URLs.
- Tests: `wc26-live-retirement.test.mjs` passes (already on PR #11).
- Founder approval required before public release.

### 18.3 SEPANAI content (deferred)

- Functional: generated article with human review gate — **blocked until editorial schema exists**.
- Privacy: no PII in prompts/logs.
- Licensing: API-Football attribution preserved.

*(Additional criteria for PL indexing strategy, CWV CI, social share expansion — see §24 backlog.)*

---

## 19. Task 19 — Proposed execution order

1. **Recovery completion** — close remaining GC-REC items; refresh GSC exports if needed (GC-REC-005-06+).
2. **Production-truth validation** — re-run live probes after any merge.
3. **Growth foundation** — merge PR #11 via private preview OR rebuild on `main` tip; sitemap/canonical dedup design.
4. **Private founder preview** — WC archive + SEO fixes on protected URL.
5. **Public release** — Founder explicit approval only.
6. **Post-release measurement** — Clarity/Lighthouse/GSC comparison.

**No growth implementation before:** GSC/sitemap blockers documented in GC-REC-005-04/05 and PR #11 merge disposition.

---

## 20. Task 20 — Proposed future implementation batch (NOT AUTHORISED)

| ID | Problem | Starting state | Dependencies |
|----|---------|----------------|--------------|
| GROWTH-001 | Duplicate WC sitemap URLs | VERIFIED — `sitemap-entries.ts:114-126` | Founder approval |
| GROWTH-002 | `/live` archive SEO conflict | VERIFIED — `live/page.tsx:11-14` | PR #11 or equivalent |
| GROWTH-003 | Empty news sitemap | VERIFIED — 0 locs production | Editorial pipeline |
| GROWTH-004 | GSC discovered-not-indexed (1,427) | GC-REC-005-05 | Quality review |
| GROWTH-005 | Canonical validation Failed (1,397) | locale canonical strategy | GROWTH-001 |
| GROWTH-006 | Legacy PL URLs in Google off-sitemap | 743 examples GC-REC-005-05 | Redirect policy |
| GROWTH-007 | PL pre-season thin pages | 29 URLs syncing heuristic | Season start timing |
| GROWTH-008 | Statistics/transfers stubs indexed accidentally | NOINDEX_STUB_PATHS | Content or keep noindex |
| GROWTH-009 | CWV CI pipeline | NOT_FOUND | infra |
| GROWTH-010 | Clarity production analytics | PR #11 Clarity.tsx | privacy review |
| GROWTH-011 | JSON-LD/live content alignment | SportsEvent on archived live | GROWTH-002 |
| GROWTH-012 | Internal linking automation | manual editorial links | content model |
| GROWTH-013 | SEPANAI MVP | NOT_FOUND code | DB + editorial workflow |
| GROWTH-014 | Editorial draft/review states | NOT_FOUND | GROWTH-013 |
| GROWTH-015 | Head-to-head route feasibility study | NOT_FOUND routes | licensing |
| GROWTH-016 | Bluesky/Threads share buttons | NOT_FOUND | product decision |
| GROWTH-017 | Private preview deployment gate | docs only | Vercel/Netlify config |
| GROWTH-018 | hreflang/x-default audit | 9 locales VERIFIED | GROWTH-005 |
| GROWTH-019 | Sitemap lastmod accuracy | fallback date issue | GROWTH-001 |
| GROWTH-020 | Post-fix GSC re-export reconciliation | GC-REC-005-05 baseline | GROWTH-001–007 |

Each task requires: acceptance criteria (§18 pattern), tests, private-preview proof, rollback = revert deploy + resubmit sitemap.

---

## 21. Blocker register

| ID | Blocker | Evidence |
|----|---------|----------|
| B-001 | No `GC-GROWTH-RECONCILIATION-001` v0 in repo | glob 0 files |
| B-002 | PR #11 not on main/recovery; merge-base stale | merge-base `31be078` |
| B-003 | GSC fixes not in application code | GC-REC-005-05 — reports only |
| B-004 | SEPANAI not operational | no `src/` implementation |
| B-005 | No PostgreSQL layer | 0 SQL files |
| B-006 | Deployment protection config not in repo | BLOCKED_BY_MISSING_EVIDENCE |

---

## 22. Risk register (summary)

| Risk | Severity | Mitigation recommendation |
|------|----------|---------------------------|
| Sitemap duplication | High | GROWTH-001 before scale SEO |
| 1,427 discovered-not-indexed | High | Quality + crawl strategy — DEFER mass indexing |
| Locale canonical vs GSC Failed | Medium | Document intent; re-validate after dedup |
| PR #11 merge drift | Medium | Rebase/rebuild before preview |
| SEPANAI without workflow | Medium | REJECT auto-publish |
| Thin PL pre-season pages | Medium | noindex until season data live |
| No CWV CI | Low | ADD_AFTER_RECOVERY |

---

## 23. Repository evidence inventory (committed artifacts)

| Path | Role |
|------|------|
| `reports/GC-REC-005-01-PROVENANCE-LEDGER.md` | Branch/commit ledger |
| `reports/GC-REC-005-02-BRANCH-PR-DISPOSITION-AUDIT.md` | PR #11 disposition |
| `reports/GC-REC-005-03-PRODUCTION-TRUTH-SNAPSHOT.md` | Live production probe |
| `reports/GC-REC-005-04-SITEMAP-INDEXABILITY-AUDIT.md` | 3,177 URL audit |
| `reports/GC-REC-005-05-SEARCH-CONSOLE-RECONCILIATION.md` | GSC export reconciliation |
| `reports/evidence/gc-rec-005-04/http-indexability.csv` | URL-level live probe |
| `reports/evidence/gc-rec-005-05/reconciliation-summary.json` | GSC join summary |
| `reports/GC-SEO-001.md`, `GC-PERFORMANCE-001.md`, `GC-SECURITY-001.md` | Prior audits |
| `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md` | Release gates |

---

## 24. Final recommendation

1. **Accept this R1 report** as the repository-grounded baseline; treat any prior GC-GROWTH-001 document outside the repo as **SUPERSEDED / BLOCKED_BY_MISSING_EVIDENCE**.
2. **Do not start growth implementation** until recovery blockers are closed and PR #11 is rebased, privately previewed, and Founder-approved.
3. **Prioritise** (planning only): sitemap deduplication, `/live` archive alignment (PR #11 path), GSC refresh — in that order.
4. **Defer** SEPANAI, PostgreSQL editorial CMS, long-tail programmatic routes, and social auto-publish until explicit architecture decision.
5. **Next audit input for growth batch authorisation:** merge commit SHA of approved private preview + fresh GSC export set.

---

## 25. Validation record

| Check | Result |
|-------|--------|
| Git gate | PASSED |
| Unit tests (`npm run test:unit`) | 111 pass / 0 fail (2026-07-24 audit run) |
| Application code modified | No |
| Commits created | No (report file only — commit at Founder discretion) |
| Python used | No |
| Assumptions unlabelled | None intentional |

---

**GC-GROWTH-RECONCILIATION-001-R1 status:** COMPLETE — evidence-only, ready for Founder and Architecture review.

**Implementation status:** NOT AUTHORISED.
