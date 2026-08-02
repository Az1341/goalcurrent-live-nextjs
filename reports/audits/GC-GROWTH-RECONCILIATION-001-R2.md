# GC-GROWTH-RECONCILIATION-001-R2 — Repository-Grounded Growth Baseline (Amended)

**Status:** EVIDENCE-ONLY REPORT AMENDMENT  
**Supersedes:** `reports/audits/GC-GROWTH-RECONCILIATION-001-R1.md` (retain as superseded draft only)  
**Report version:** 2.0.0-R2  
**Audit timestamp (BST):** 24/07/2026 – 12:20 BST  
**Authorisation:** Documentation only — no implementation

---

## TASK 01 — Repository state (verified)

See **Appendix A** for exact command outputs.

| Item | Value |
|------|-------|
| Repository path | `C:/Users/zafar/OneDrive/Desktop/CURSOR BAT/goalcurrent-live-nextjs` |
| Current branch | `recovery/gc-exec-batch-005` |
| HEAD SHA | `bbed4cfc22f3b1b906cac6184f3f805f7c2513aa` |
| `origin/main` | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| Recovery remote | `bbed4cfc22f3b1b906cac6184f3f805f7c2513aa` |
| PR #11 head | `5ed5b3cd827627a18b40e6879309f184acbab63f` |
| merge-base(main, recovery) | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| merge-base(main, PR #11) | `31be07851cff24828f92f13d374336bd014964a8` |

---

## TASK 02 — Complete route inventory (89 routes)

**Discovery command:**

```text
node C:/Users/zafar/AppData/Local/Temp/gc_r2_routes_utf8.mjs
```

**Output:** `count 89` (verified 24/07/2026 – 12:20 BST)

**Canonical behaviour (all indexable pages):** path-based canonical via `buildPageMetadata` / `generateMetadata` (`src/lib/page-metadata.ts:46-80`). Locale-prefixed URLs often canonicalise to unprefixed English — **live evidence** in `reports/evidence/gc-rec-005-04/http-indexability.csv` (GC-REC-005-04).

| # | File | Public route | Type | Indexability | Canonical behaviour | Metadata source | Data source | Classification |
|---|------|--------------|------|--------------|---------------------|-----------------|-------------|----------------|
| 1 | `src/app/[locale]/about/page.tsx` | `/about` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 2 | `src/app/[locale]/affiliate-disclosure/page.tsx` | `/affiliate-disclosure` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 3 | `src/app/[locale]/articles/[slug]/page.tsx` | `/articles/[slug]` | dynamic-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | generateMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 4 | `src/app/[locale]/articles/alireza-beiranvand-iran-world-cup-hero/page.tsx` | `/articles/alireza-beiranvand-iran-world-cup-hero` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 5 | `src/app/[locale]/articles/champions-league-new-rules/page.tsx` | `/articles/champions-league-new-rules` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 6 | `src/app/[locale]/articles/england-6-4-france-third-place-recap/page.tsx` | `/articles/england-6-4-france-third-place-recap` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 7 | `src/app/[locale]/articles/england-advance-to-face-mexico-round-of-16/page.tsx` | `/articles/england-advance-to-face-mexico-round-of-16` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 8 | `src/app/[locale]/articles/england-argentina-world-cup-semifinal-analysis/page.tsx` | `/articles/england-argentina-world-cup-semifinal-analysis` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 9 | `src/app/[locale]/articles/england-france-third-place-preview/page.tsx` | `/articles/england-france-third-place-preview` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 10 | `src/app/[locale]/articles/fifa-world-cup-2026-head-to-head-rule-early-elimination/page.tsx` | `/articles/fifa-world-cup-2026-head-to-head-rule-early-elimination` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 11 | `src/app/[locale]/articles/football-and-peace/page.tsx` | `/articles/football-and-peace` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 12 | `src/app/[locale]/articles/football-as-an-industry/page.tsx` | `/articles/football-as-an-industry` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 13 | `src/app/[locale]/articles/football-in-developing-countries/page.tsx` | `/articles/football-in-developing-countries` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 14 | `src/app/[locale]/articles/football-inspiring-canadas-next-generation/page.tsx` | `/articles/football-inspiring-canadas-next-generation` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 15 | `src/app/[locale]/articles/page.tsx` | `/articles` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 16 | `src/app/[locale]/articles/premier-league-2026-27-august-countdown/page.tsx` | `/articles/premier-league-2026-27-august-countdown` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 17 | `src/app/[locale]/articles/premier-league-2026-27-new-season/page.tsx` | `/articles/premier-league-2026-27-new-season` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 18 | `src/app/[locale]/articles/spain-world-cup-2026-champion-masterclass/page.tsx` | `/articles/spain-world-cup-2026-champion-masterclass` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 19 | `src/app/[locale]/articles/world-cup-2026-july-1-recap/page.tsx` | `/articles/world-cup-2026-july-1-recap` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 20 | `src/app/[locale]/articles/world-cup-2026-july-3-recap/page.tsx` | `/articles/world-cup-2026-july-3-recap` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 21 | `src/app/[locale]/articles/world-cup-2026-june-22-recap/page.tsx` | `/articles/world-cup-2026-june-22-recap` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 22 | `src/app/[locale]/articles/world-cup-2026-june-23-recap/page.tsx` | `/articles/world-cup-2026-june-23-recap` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 23 | `src/app/[locale]/articles/world-cup-2026-june-27-group-stage-finale/page.tsx` | `/articles/world-cup-2026-june-27-group-stage-finale` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 24 | `src/app/[locale]/articles/world-cup-2026-june-27-recap/page.tsx` | `/articles/world-cup-2026-june-27-recap` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 25 | `src/app/[locale]/articles/world-cup-2026-june-30-recap/page.tsx` | `/articles/world-cup-2026-june-30-recap` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 26 | `src/app/[locale]/articles/world-cup-2026-teams-already-out/page.tsx` | `/articles/world-cup-2026-teams-already-out` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | staticArticleMetadata | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 27 | `src/app/[locale]/contact/page.tsx` | `/contact` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 28 | `src/app/[locale]/cookies/page.tsx` | `/cookies` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 29 | `src/app/[locale]/favourites/clubs/page.tsx` | `/favourites/clubs` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | static/marketing content | VERIFIED_PARTIAL |
| 30 | `src/app/[locale]/favourites/page.tsx` | `/favourites` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 31 | `src/app/[locale]/favourites/players/page.tsx` | `/favourites/players` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | static/marketing content | VERIFIED_PARTIAL |
| 32 | `src/app/[locale]/live/page.tsx` | `/live` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | /api/wc26/scores + client | VERIFIED_IMPLEMENTED |
| 33 | `src/app/[locale]/match/[fixtureId]/page.tsx` | `/match/[fixtureId]` | dynamic-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | generateMetadata | WC26/PL static + API overlay | VERIFIED_IMPLEMENTED |
| 34 | `src/app/[locale]/news/alireza-beiranvand-iran-world-cup-hero/page.tsx` | `/news/alireza-beiranvand-iran-world-cup-hero` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | n/a redirect | VERIFIED_IMPLEMENTED |
| 35 | `src/app/[locale]/news/articles/[slug]/page.tsx` | `/news/articles/[slug]` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 36 | `src/app/[locale]/news/articles/football-inspiring-canadas-next-generation/page.tsx` | `/news/articles/football-inspiring-canadas-next-generation` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 37 | `src/app/[locale]/news/articles/page.tsx` | `/news/articles` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | src/data/articles.ts + editorial | VERIFIED_IMPLEMENTED |
| 38 | `src/app/[locale]/news/page.tsx` | `/news` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 39 | `src/app/[locale]/news/premier-league/page.tsx` | `/news/premier-league` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 40 | `src/app/[locale]/news/transfers/page.tsx` | `/news/transfers` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | static/marketing content | VERIFIED_PARTIAL |
| 41 | `src/app/[locale]/news/world-cup/page.tsx` | `/news/world-cup` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 42 | `src/app/[locale]/page.tsx` | `/` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 43 | `src/app/[locale]/premier-league/2025-26/table/page.tsx` | `/premier-league/2025-26/table` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 44 | `src/app/[locale]/premier-league/clubs/[club]/page.tsx` | `/premier-league/clubs/[club]` | dynamic-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | generateMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 45 | `src/app/[locale]/premier-league/clubs/page.tsx` | `/premier-league/clubs` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 46 | `src/app/[locale]/premier-league/fixtures/page.tsx` | `/premier-league/fixtures` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 47 | `src/app/[locale]/premier-league/live/page.tsx` | `/premier-league/live` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 48 | `src/app/[locale]/premier-league/match/[fixtureId]/page.tsx` | `/premier-league/match/[fixtureId]` | dynamic-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | generateMetadata | WC26/PL static + API overlay | VERIFIED_IMPLEMENTED |
| 49 | `src/app/[locale]/premier-league/page.tsx` | `/premier-league` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 50 | `src/app/[locale]/premier-league/players/page.tsx` | `/premier-league/players` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 51 | `src/app/[locale]/premier-league/statistics/page.tsx` | `/premier-league/statistics` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 52 | `src/app/[locale]/premier-league/table/page.tsx` | `/premier-league/table` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 53 | `src/app/[locale]/premier-league/transfers/page.tsx` | `/premier-league/transfers` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 54 | `src/app/[locale]/privacy/page.tsx` | `/privacy` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 55 | `src/app/[locale]/statistics/assists/page.tsx` | `/statistics/assists` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 56 | `src/app/[locale]/statistics/clean-sheets/page.tsx` | `/statistics/clean-sheets` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 57 | `src/app/[locale]/statistics/disciplinary/page.tsx` | `/statistics/disciplinary` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 58 | `src/app/[locale]/statistics/live/page.tsx` | `/statistics/live` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | /api/wc26/scores + client | VERIFIED_PARTIAL |
| 59 | `src/app/[locale]/statistics/player-rankings/page.tsx` | `/statistics/player-rankings` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 60 | `src/app/[locale]/statistics/players/page.tsx` | `/statistics/players` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 61 | `src/app/[locale]/statistics/teams/page.tsx` | `/statistics/teams` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 62 | `src/app/[locale]/statistics/top-scorers/page.tsx` | `/statistics/top-scorers` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 63 | `src/app/[locale]/terms/page.tsx` | `/terms` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 64 | `src/app/[locale]/transfers/completed/page.tsx` | `/transfers/completed` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 65 | `src/app/[locale]/transfers/free-agents/page.tsx` | `/transfers/free-agents` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 66 | `src/app/[locale]/transfers/page.tsx` | `/transfers` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 67 | `src/app/[locale]/transfers/rumours/page.tsx` | `/transfers/rumours` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | none (stub) | VERIFIED_PARTIAL |
| 68 | `src/app/[locale]/video/highlights/page.tsx` | `/video/highlights` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | static/marketing content | VERIFIED_PARTIAL |
| 69 | `src/app/[locale]/video/page.tsx` | `/video` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | n/a redirect | VERIFIED_IMPLEMENTED |
| 70 | `src/app/[locale]/video/podcasts/page.tsx` | `/video/podcasts` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | static/marketing content | VERIFIED_PARTIAL |
| 71 | `src/app/[locale]/video/premier-league/page.tsx` | `/video/premier-league` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 72 | `src/app/[locale]/video/press-conferences/page.tsx` | `/video/press-conferences` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | static/marketing content | VERIFIED_PARTIAL |
| 73 | `src/app/[locale]/video/world-cup/page.tsx` | `/video/world-cup` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | n/a redirect | VERIFIED_IMPLEMENTED |
| 74 | `src/app/[locale]/video/youtube/page.tsx` | `/video/youtube` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | static/marketing content | VERIFIED_IMPLEMENTED |
| 75 | `src/app/[locale]/videos/page.tsx` | `/videos` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | YouTube API + fallback | VERIFIED_IMPLEMENTED |
| 76 | `src/app/[locale]/videos/premier-league/page.tsx` | `/videos/premier-league` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | API-Football via /api/pl/* | VERIFIED_IMPLEMENTED |
| 77 | `src/app/[locale]/videos/world-cup/page.tsx` | `/videos/world-cup` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | YouTube API + fallback | VERIFIED_IMPLEMENTED |
| 78 | `src/app/[locale]/worldcup2026/bracket/page.tsx` | `/worldcup2026/bracket` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 79 | `src/app/[locale]/worldcup2026/fixtures/page.tsx` | `/worldcup2026/fixtures` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 80 | `src/app/[locale]/worldcup2026/groups/[group]/page.tsx` | `/worldcup2026/groups/[group]` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 81 | `src/app/[locale]/worldcup2026/groups/page.tsx` | `/worldcup2026/groups` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 82 | `src/app/[locale]/worldcup2026/match/[fixtureId]/page.tsx` | `/worldcup2026/match/[fixtureId]` | redirect | follow; redirect target indexed separately | redirect; target URL canonical policy applies | inherits layout only (redirect) | WC26/PL static + API overlay | VERIFIED_IMPLEMENTED |
| 83 | `src/app/[locale]/worldcup2026/news/morocco-knock-out-netherlands-on-penalties/page.tsx` | `/worldcup2026/news/morocco-knock-out-netherlands-on-penalties` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildArticleMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 84 | `src/app/[locale]/worldcup2026/page.tsx` | `/worldcup2026` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 85 | `src/app/[locale]/worldcup2026/players/page.tsx` | `/worldcup2026/players` | stub-noindex | noindex,follow | n/a (noindex stub) | buildComingSoonMetadata | src/data/wc26 + archive helpers | VERIFIED_PARTIAL |
| 86 | `src/app/[locale]/worldcup2026/standings/page.tsx` | `/worldcup2026/standings` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 87 | `src/app/[locale]/worldcup2026/teams/[teamId]/page.tsx` | `/worldcup2026/teams/[teamId]` | dynamic-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | generateMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 88 | `src/app/[locale]/worldcup2026/teams/page.tsx` | `/worldcup2026/teams` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |
| 89 | `src/app/[locale]/worldcup2026/venues/page.tsx` | `/worldcup2026/venues` | static-page | index (default; no robots override in page) | path-based absoluteUrl; locale often unprefixed EN (GC-REC-005-04) | buildPageMetadata | src/data/wc26 + archive helpers | VERIFIED_IMPLEMENTED |

---

## TASK 03 — Supabase/PostgreSQL Source-of-Truth conflict

**Classification:** `CONFLICTING_IMPLEMENTATIONS`

| Layer | Finding | Evidence |
|-------|---------|----------|
| Governing architecture (programme) | Supabase/PostgreSQL stated as SoT for GoalCurrent + SEPANAI growth path | Task authorisation brief; `reports/GC-REC-005-02-BRANCH-PR-DISPOSITION-AUDIT.md:162-193` (Supabase commits on `goalcurrent-v2-rebuild` branch, not `main`) |
| This repository (`main` / checked-out recovery) | No Supabase dependency, schema, migrations, RLS, or generated DB types | `git ls-files '*.sql'` → empty; `supabase/` → NOT_FOUND; `package.json` grep supabase/drizzle → no matches |
| SEPANAI foundation docs | 14 files on `docs/gc-sepan-foundation-001` branch; **absent on `origin/main`** | `reports/GC-BATCH-004-BASELINE-001.md:29-30` |
| In-repo WC data SoT | TypeScript static data | `docs/ENVIRONMENT.md:7`, `src/data/wc26/index.ts:2` |

**Remaining possibilities (evidence-bound):**

1. **Database exists outside this repository** — **supported** by Supabase migration commits on separate branch `goalcurrent-v2-rebuild` (GC-REC-005-02 ledger SHAs `3913ec1`, `9789bb7`, `9eaa85f`).
2. **Another repository contains it** — **BLOCKED_BY_MISSING_EVIDENCE** (no repo URL/path verified in this audit).
3. **Planned but not implemented on production path** — **supported** by Batch 004 prohibition: `docs/sepanai/GC-WC26-HISTORICAL-TEST-DATA-001.md:5`, `reports/GC-BATCH-004-BASELINE-001.md:80`.
4. **Governing architecture statement applies to v2/future stack, not current Next.js app on `main`** — **supported** by branch disposition audit separating v2-rebuild from production `main`.

**Final status:** `CONFLICTING_IMPLEMENTATIONS` — **no database-dependent GoalCurrent or SEPANAI implementation may be authorised until Founder/Architecture resolves SoT location and target repo/branch.**

---

## TASK 04 — Command-evidence appendix

See **Appendix A** (embedded outputs).

---

## TASK 05 — Worktree evidence (corrected)

| Phase | Timestamp (BST) | State | Evidence |
|-------|-----------------|-------|----------|
| **A. Pre-audit (before R1)** | 24/07/2026 – 11:59 | **Clean** — no untracked files | R1 audit recorded `git status`: clean at GC-GROWTH-RECONCILIATION-001-R1 execution |
| **B. Before R2 creation** | 24/07/2026 – 12:20 | **Not clean** — untracked `reports/audits/` | `git status` this session |
| **C. Post-R2 report write** | 24/07/2026 – 12:20 | **Not clean** — untracked audit files | `git status` after write |
| **D. Untracked paths** | — | `reports/audits/GC-GROWTH-RECONCILIATION-001-R1.md`; `reports/audits/GC-GROWTH-RECONCILIATION-001-R2.md` | `git status --short` |

**Correction:** R1 incorrectly stated the worktree remained clean after creating an untracked report. The worktree has carried untracked `reports/audits/` since R1.

---

## TASK 06 — PR #11 complete file inventory (45 files)

**Evidence source:** `gh pr view 11 --json files` and `git diff --stat origin/main...5ed5b3cd827627a18b40e6879309f184acbab63f`

**Changed-file total:** **45**

| File | + | - | Change | Purpose | Class | Port/Rebuild/Drop | Recovery dep | Growth dep | Conflict risk | Evidence source |
|------|---:|---:|--------|---------|-------|-------------------|--------------|------------|---------------|-----------------|
| `AGENTS.md` | 22 | 1 | MODIFIED | Private preview policy pointer | governance | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/examples/reporting/blocker-report.example.md` | 154 | 0 | ADDED | Reporting example | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/examples/reporting/ci-report.example.md` | 148 | 0 | ADDED | Reporting example | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/examples/reporting/completion-report.example.md` | 135 | 0 | ADDED | Reporting example | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/examples/reporting/deployment-report.example.md` | 154 | 0 | ADDED | Reporting example | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/examples/reporting/progress-report.example.md` | 145 | 0 | ADDED | Reporting example | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md` | 10 | 1 | MODIFIED | Release gate text | governance | PORT | medium | medium | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/sepanai/GC-WC26-HISTORICAL-TEST-DATA-001.md` | 53 | 0 | ADDED | SEPANAI test data spec | docs | PORT | medium | medium | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/standards/REPORTING_CHANGELOG.md` | 50 | 0 | ADDED | Reporting standard changelog | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `docs/standards/REPORTING_STANDARD.md` | 258 | 0 | ADDED | Reporting standard v1 | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/ar.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/de.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/en.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/es.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/fa.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/fr.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/it.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/nl.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `messages/pt.json` | 4 | 3 | MODIFIED | Archive copy i18n | i18n | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `reports/GC-WC26-ARCHIVE-QA-001.md` | 38 | 0 | ADDED | WC archive QA report | docs | PORT | medium | medium | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `reports/GC-WC26-FOUNDER-REVIEW-PACK-001.md` | 113 | 0 | ADDED | Founder review pack | docs | PORT | medium | medium | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `reports/GC-WC26-LIVE-RETIREMENT-001.md` | 30 | 0 | ADDED | Live retirement report | docs | PORT | medium | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `reports/REPORTING-STANDARD-BATCH-002-VERIFICATION.md` | 164 | 0 | ADDED | Reporting verification | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `reports/REPORTING-STANDARD-BATCH-003-VERIFICATION.md` | 227 | 0 | ADDED | Reporting verification | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `reports/REPORTING-STANDARD-VERIFICATION.md` | 89 | 0 | ADDED | Reporting verification | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `scripts/validate-reporting-standard.mjs` | 175 | 0 | ADDED | Report validator script | tooling | PORT | low | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/app/[locale]/HomeClient.tsx` | 0 | 5 | MODIFIED | Remove live-home wiring | code | REBUILD | medium | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/components/analytics/Clarity.tsx` | 66 | 0 | ADDED | Microsoft Clarity analytics | code | REBUILD | low | medium | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/components/layout/BottomTabBar.tsx` | 10 | 8 | MODIFIED | Archive nav labels | code | REBUILD | medium | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/components/layout/LiveRibbon.tsx` | 5 | 0 | MODIFIED | Archive ribbon copy | code | REBUILD | medium | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/components/layout/MasterHeader.tsx` | 26 | 14 | MODIFIED | Header archive nav | code | REBUILD | medium | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/components/layout/master-chrome.module.css` | 21 | 0 | MODIFIED | Header styles | code | REBUILD | low | medium | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/components/wc26/FinalWinnerCelebration.tsx` | 10 | 296 | MODIFIED | Retire live celebration UI | code | REBUILD | high | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/components/wc26/Wc26ResultsSync.tsx` | 10 | 4 | MODIFIED | Archive results sync | code | REBUILD | medium | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/lib/client/useLiveScores.ts` | 6 | 4 | MODIFIED | Live scores hook tweak | code | REBUILD | medium | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `src/lib/nav.ts` | 24 | 6 | MODIFIED | WC archive navigation | code | REBUILD | high | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `templates/blocker-report.md` | 203 | 0 | ADDED | Report template | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `templates/ci-report.md` | 217 | 0 | ADDED | Report template | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `templates/completion-report.md` | 205 | 0 | ADDED | Report template | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `templates/deployment-report.md` | 223 | 0 | ADDED | Report template | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `templates/progress-report.md` | 215 | 0 | ADDED | Report template | docs | PORT | none | low | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `tests/fixtures/wc26/sepanai-historical-matches.json` | 50 | 0 | ADDED | SEPANAI fixture data | test | PORT | medium | medium | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `tests/lib/nav-archive-access.test.mjs` | 91 | 0 | ADDED | Nav archive tests | test | REBUILD | medium | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `tests/lib/sepanai-historical-fixtures.test.mjs` | 35 | 0 | ADDED | SEPANAI fixture tests | test | PORT | medium | medium | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |
| `tests/lib/wc26-live-retirement.test.mjs` | 25 | 0 | ADDED | Live retirement tests | test | REBUILD | high | high | low | `gh pr view 11`; `git diff --stat origin/main...5ed5b3cd` |

---

## TASK 07 — Acceptance criteria for GROWTH-001–020 (proposed only)

### GROWTH-001

| Field | Value |
|-------|-------|
| Problem | Duplicate WC match URLs in sitemap (/match/ and /worldcup2026/match/) |
| User/business benefit | Cleaner crawl signals; fewer duplicate URL examples in GSC |
| Technical scope | Sitemap generation only (planning) |
| Verified dependency | Founder approval; evidence `src/lib/seo/sitemap-entries.ts:114-126`; GC-REC-005-04 |
| Functional acceptance | Exactly one sitemap loc per fixture ID in generated XML |
| Required evidence | Re-run GC-REC-005-04-style sitemap parse; duplicate count = 0 |
| Required tests | Unit test on collectSitemapPathSpecs fixture URL count |
| Private-preview proof | Private preview sitemap fetch + CSV diff vs baseline |
| Rollback method | Revert sitemap commit; redeploy prior SHA |
| Completion gate | Founder approval after Ahmad review |
| Prohibited assumptions | Assuming GSC alternate-canonical counts drop without re-export |

### GROWTH-002

| Field | Value |
|-------|-------|
| Problem | /live SEO conflicts with WC archive positioning |
| User/business benefit | Accurate SERP snippets post-tournament |
| Technical scope | Metadata/copy on /live (PR #11 path or equivalent) |
| Verified dependency | PR #11 rebuild on main tip OR equivalent patch; `live/page.tsx:11-14` |
| Functional acceptance | Sample of 9 locale /live URLs shows archive-consistent title/description OR noindex |
| Required evidence | http-indexability.csv row sample; browser snapshot |
| Required tests | wc26-live-retirement.test.mjs (PR #11) |
| Private-preview proof | Protected preview URL audit |
| Rollback method | Revert metadata commit |
| Completion gate | Founder approval |
| Prohibited assumptions | Assuming merge to main before private preview |

### GROWTH-003

| Field | Value |
|-------|-------|
| Problem | Empty news sitemap in production |
| User/business benefit | Valid news discovery when editorial pipeline exists |
| Technical scope | news-sitemap.ts + editorial dates |
| Verified dependency | Editorial content within 48h window OR policy to remove news sitemap declaration |
| Functional acceptance | sitemap-news.xml has >0 loc OR robots drops news sitemap reference |
| Required evidence | Live HEAD fetch; GC-REC-005-03 baseline 0 locs |
| Required tests | news-sitemap unit/integration test |
| Private-preview proof | Preview sitemap-news fetch |
| Rollback method | Revert robots/sitemap change |
| Completion gate | Founder approval |
| Prohibited assumptions | Assuming editorial CMS exists |

### GROWTH-004

| Field | Value |
|-------|-------|
| Problem | GSC reports 1,427 Discovered-not-indexed (count-level) |
| User/business benefit | Improved index coverage if quality supports it |
| Technical scope | Measurement + selective improvements only |
| Verified dependency | Fresh GSC export; GC-REC-005-05 baseline |
| Functional acceptance | New export shows count trend documented with same methodology |
| Required evidence | GSC ZIP reconciliation report |
| Required tests | n/a (measurement) |
| Private-preview proof | n/a |
| Rollback method | n/a |
| Completion gate | Founder decision on whether to pursue indexing |
| Prohibited assumptions | Claiming crawl budget or quality as cause without URL-level proof (Task 09) |

### GROWTH-005

| Field | Value |
|-------|-------|
| Problem | GSC alternate-canonical validation Failed (1,397 count) |
| User/business benefit | Aligned Search Console validation state |
| Technical scope | Canonical + hreflang architecture decision |
| Verified dependency | Canonical architecture decision; hreflang architecture decision; representative URL validation; repository evidence (`page-metadata.ts`, locale routing); operational predecessor: optional sitemap dedup (GROWTH-001) — not automatic technical dependency |
| Functional acceptance | Representative locale URL set documents intended canonical target; GSC re-export after change |
| Required evidence | Manual URL sample + GSC validation export |
| Required tests | hreflang/canonical unit tests if added |
| Private-preview proof | Preview URL canonical/hreflang audit |
| Rollback method | Revert canonical policy commit |
| Completion gate | Founder approval |
| Prohibited assumptions | Requiring GROWTH-001 merge before canonical decision |

### GROWTH-006

| Field | Value |
|-------|-------|
| Problem | 743 indexed GSC example URLs off current sitemap (legacy PL IDs) |
| User/business benefit | Reduced legacy URL confusion |
| Technical scope | Redirect or 410 policy for legacy PL match URLs |
| Verified dependency | GSC Valid export examples; redirect inventory |
| Functional acceptance | Documented redirect map for sample legacy URLs |
| Required evidence | GC-REC-005-05 google-url-examples-redacted.csv |
| Required tests | HTTP redirect tests for sample URLs |
| Private-preview proof | Preview redirect probe |
| Rollback method | Revert redirect rules |
| Completion gate | Founder approval |
| Prohibited assumptions | Mass redirect without URL list evidence |

### GROWTH-007

| Field | Value |
|-------|-------|
| Problem | PL pre-season pages with syncing copy indexed |
| User/business benefit | Avoid misleading SERP for empty season state |
| Technical scope | noindex or enriched content policy for PL hub pages |
| Verified dependency | Season start date; GC-REC-005-04 syncing heuristic on 29 PL URLs |
| Functional acceptance | PL sample URLs match chosen index policy |
| Required evidence | http-indexability.csv PL rows |
| Required tests | metadata robots assertion tests |
| Private-preview proof | Preview PL hub audit |
| Rollback method | Revert robots metadata |
| Completion gate | Founder approval |
| Prohibited assumptions | Assuming API-Football data live before evidence |

### GROWTH-008

| Field | Value |
|-------|-------|
| Problem | Statistics/transfers stubs vs accidental indexing |
| User/business benefit | Crawl budget protection |
| Technical scope | Verify stubs remain noindex and out of sitemap |
| Verified dependency | NOINDEX_STUB_PATHS list `sitemap-static-paths.ts:7-24` |
| Functional acceptance | All NOINDEX_STUB_PATHS return noindex and absent from sitemap |
| Required evidence | grep sitemap-entries + live probe sample |
| Required tests | existing coming-soon metadata tests if any |
| Private-preview proof | Preview stub audit |
| Rollback method | Revert metadata |
| Completion gate | Founder approval |
| Prohibited assumptions | Enabling stubs without content |

### GROWTH-009

| Field | Value |
|-------|-------|
| Problem | No CWV CI |
| User/business benefit | Regression detection for LCP/CLS/INP |
| Technical scope | CI wiring only |
| Verified dependency | Lighthouse script exists `scripts/lighthouse-home.mjs` |
| Functional acceptance | CI job runs lighthouse-home with thresholds documented |
| Required evidence | CI log artifact |
| Required tests | CI job itself |
| Private-preview proof | Preview deploy lighthouse run |
| Rollback method | Disable CI job |
| Completion gate | Founder approval for CI cost |
| Prohibited assumptions | Claiming CWV pass without measured scores |

### GROWTH-010

| Field | Value |
|-------|-------|
| Problem | No production Clarity (in PR #11 only) |
| User/business benefit | Behaviour analytics post-release |
| Technical scope | Analytics component merge via preview |
| Verified dependency | PR #11 Clarity.tsx; privacy review |
| Functional acceptance | Clarity loads only on approved environments |
| Required evidence | network tab on preview; analytics config tests |
| Required tests | environment-gating pattern |
| Private-preview proof | Required before production |
| Rollback method | Remove Clarity component |
| Completion gate | Founder approval |
| Prohibited assumptions | Loading Clarity on preview without policy check |

### GROWTH-011

| Field | Value |
|-------|-------|
| Problem | JSON-LD SportsEvent on archived live surfaces |
| User/business benefit | Structured data matches visible archive state |
| Technical scope | Schema type/copy alignment |
| Verified dependency | GROWTH-002; LivePageClient.tsx JSON-LD |
| Functional acceptance | Live/match schema reviewed against visible status on sample URLs |
| Required evidence | Rich results test or manual JSON-LD inspect |
| Required tests | schema snapshot tests if added |
| Private-preview proof | Preview schema audit |
| Rollback method | Revert schema commit |
| Completion gate | Founder approval |
| Prohibited assumptions | Claiming Google rich result eligibility |

### GROWTH-012

| Field | Value |
|-------|-------|
| Problem | Manual editorial internal links only |
| User/business benefit | Better crawl paths between match/article/hub |
| Technical scope | Link helper expansion (planning) |
| Verified dependency | Content model unchanged on main |
| Functional acceptance | Coverage metric for match pages with RelatedInternalLinks |
| Required evidence | Component usage grep; crawl sample |
| Required tests | link helper unit tests |
| Private-preview proof | Preview link audit |
| Rollback method | Revert template changes |
| Completion gate | Founder approval |
| Prohibited assumptions | Auto-generated links without editorial review |

### GROWTH-013

| Field | Value |
|-------|-------|
| Problem | SEPANAI operational pipeline absent |
| User/business benefit | Future AI-assisted explanations |
| Technical scope | Architecture decision only until conflict resolved |
| Verified dependency | Supabase SoT conflict resolved (Task 03); editorial workflow |
| Functional acceptance | BLOCKED until SoT conflict closed |
| Required evidence | grep sepanai in src/ = empty on main |
| Required tests | sepanai-historical-fixtures.test.mjs on PR #11 only |
| Private-preview proof | n/a until authorised |
| Rollback method | n/a |
| Completion gate | Founder + architecture sign-off |
| Prohibited assumptions | Any AI provider calls before authorisation (docs/sepanai prohibition) |

### GROWTH-014

| Field | Value |
|-------|-------|
| Problem | No editorial draft/review/approval workflow in code |
| User/business benefit | Safe content publication at scale |
| Technical scope | Workflow design |
| Verified dependency | Database SoT decision OR explicit static-workflow continuation |
| Functional acceptance | Documented states with file/DB evidence |
| Required evidence | types/editorial.ts lacks draft fields |
| Required tests | workflow tests when implemented |
| Private-preview proof | CMS preview if built |
| Rollback method | n/a |
| Completion gate | Founder approval |
| Prohibited assumptions | Assuming Supabase tables exist in this repo |

### GROWTH-015

| Field | Value |
|-------|-------|
| Problem | No dynamic head-to-head routes |
| User/business benefit | Long-tail SEO (if licensed) |
| Technical scope | Feasibility study only |
| Verified dependency | Data licensing review; API cost model |
| Functional acceptance | Written feasibility doc with data availability proof |
| Required evidence | route inventory NOT_FOUND for /head-to-head |
| Required tests | n/a |
| Private-preview proof | n/a |
| Rollback method | n/a |
| Completion gate | Founder approval |
| Prohibited assumptions | Implementing routes in feasibility task |

### GROWTH-016

| Field | Value |
|-------|-------|
| Problem | Bluesky/Threads sharing absent |
| User/business benefit | Extended social reach |
| Technical scope | ShareButtons extension |
| Verified dependency | Product decision |
| Functional acceptance | Share intent URLs for chosen platforms on sample pages |
| Required evidence | ShareButtons.tsx X+Facebook only |
| Required tests | component tests |
| Private-preview proof | Preview share smoke test |
| Rollback method | Revert ShareButtons |
| Completion gate | Founder approval |
| Prohibited assumptions | Auto-posting |

### GROWTH-017

| Field | Value |
|-------|-------|
| Problem | Private preview deployment gate not in repo |
| User/business benefit | Founder-safe review |
| Technical scope | Vercel/deployment protection config (external) |
| Verified dependency | PRIVATE-PREVIEW-RELEASE-POLICY.md; platform config |
| Functional acceptance | Preview URL requires auth per platform settings |
| Required evidence | BLOCKED_BY_MISSING_EVIDENCE for Vercel dashboard config |
| Required tests | manual access test |
| Private-preview proof | Required |
| Rollback method | Disable protection |
| Completion gate | Founder approval |
| Prohibited assumptions | Assuming protection enabled without screenshot/config export |

### GROWTH-018

| Field | Value |
|-------|-------|
| Problem | hreflang/x-default consistency unverified at scale |
| User/business benefit | Locale SEO clarity |
| Technical scope | Audit sample of locale URLs |
| Verified dependency | Canonical architecture decision (GROWTH-005 related) |
| Functional acceptance | Documented x-default and reciprocal hreflang on N-page sample |
| Required evidence | GC-REC-005-04 hreflang counts; manual HTML sample |
| Required tests | i18n parity tests exist (`npm run test:i18n`) |
| Private-preview proof | Preview locale audit |
| Rollback method | n/a |
| Completion gate | Founder approval |
| Prohibited assumptions | Locale removal based on audit alone |

### GROWTH-019

| Field | Value |
|-------|-------|
| Problem | Sitemap lastmod uses generation fallback for static paths |
| User/business benefit | Accurate crawl scheduling signals |
| Technical scope | lastmod source refinement |
| Verified dependency | sitemap-entries.ts:86-90 |
| Functional acceptance | Static paths use content-derived dates where available |
| Required evidence | sitemap XML sample diff |
| Required tests | sitemap unit tests |
| Private-preview proof | Preview sitemap fetch |
| Rollback method | Revert sitemap date logic |
| Completion gate | Founder approval |
| Prohibited assumptions | Claiming ranking impact |

### GROWTH-020

| Field | Value |
|-------|-------|
| Problem | Post-fix GSC measurement undefined |
| User/business benefit | Verify remediation outcomes |
| Technical scope | GC-REC-005-06-style reconciliation (future) |
| Verified dependency | GROWTH-001 through chosen fixes; fresh GSC exports |
| Functional acceptance | New GSC export reconciled with same methodology as GC-REC-005-05 |
| Required evidence | reconciliation-summary.json successor |
| Required tests | n/a |
| Private-preview proof | n/a |
| Rollback method | n/a |
| Completion gate | Founder approval |
| Prohibited assumptions | Declaring success without dated export |


---

## TASK 08 — GSC capability classifications (separated)

| Capability | Classification | Evidence |
|------------|----------------|----------|
| GSC export ingestion and reconciliation (GC-REC-005-05) | **VERIFIED_IMPLEMENTED** | `reports/GC-REC-005-05-SEARCH-CONSOLE-RECONCILIATION.md`; `reports/evidence/gc-rec-005-05/reconciliation-summary.json` |
| GSC application remediation (sitemap/canonical/robots code fixes) | **NOT_FOUND** on `main` | `git diff origin/main...HEAD -- src/` empty on recovery; no GSC-fix commits on main |
| GSC post-fix validation (Search Console UI) | **VERIFIED_PLANNED_ONLY** | GC-REC-005-05 §25 Founder decisions; no validation actions executed |

---

## TASK 09 — Search Console causal claims (corrected)

| R1-style claim | R2 classification | Evidence |
|----------------|-------------------|----------|
| Discovered-not-indexed caused by "crawl budget" or "quality" | **BLOCKED_BY_MISSING_EVIDENCE** | GC-REC-005-05 provides **counts** and **1,000 example URLs** only; no URL-level quality scoring |
| Alternate canonical caused by locale strategy | **Supported as hypothesis** — locale canonical pattern confirmed live (GC-REC-005-04); GSC count 1,397 from export | Count-level + live HTML join; not Google internal rationale |
| Legacy PL URLs "dominate" off-sitemap indexed examples | **Supported for exported sample** | GC-REC-005-05: 743/976 valid examples off sitemap; route-family concentration in CSV |
| All discovered examples in sitemap | **VERIFIED** | GC-REC-005-05: 1000/1000 discovered examples match sitemap |

---

## TASK 10 — GROWTH-005 dependencies (corrected)

GROWTH-005 verified dependencies:

1. Canonical architecture decision (Founder)
2. hreflang architecture decision where applicable
3. Representative URL validation (live HTML + export samples)
4. Repository evidence (`src/lib/page-metadata.ts`, `src/i18n/routing.ts`, `src/lib/i18n/urls.ts`)

**Operational predecessor (optional):** GROWTH-001 sitemap deduplication may reduce duplicate URL noise — **not an automatic technical dependency** for canonical policy.

---

## TASK 11 — Mandatory private-preview and release sequence

1. Recovery sign-off (GC-REC-005 batch closure)
2. Rebase or rebuild evidence (PR #11 onto current `main` tip `20515a11`)
3. Candidate commit SHA recorded
4. Protected private-preview deployment
5. Test and audit evidence (unit tests, design verify, SEO sample)
6. Founder review (Ahmad private review per AGENTS.md)
7. Founder approval or rejection
8. Merge decision (**only if approved**)
9. Production deployment (**only if approved**)
10. Post-release validation and GSC measurement (dated export)

**Prohibited:** Recommending merge before steps 4–7.

---

## TASK 12 — Capability status matrix (single classification each)

| Capability | Classification | Evidence |
|------------|----------------|----------|
| Next.js page routes (89) | VERIFIED_IMPLEMENTED | Task 02 table; `src/app/[locale]/**` |
| Sitemap API model | VERIFIED_IMPLEMENTED | `src/app/api/sitemap/route.ts`, `sitemap-entries.ts` |
| Sitemap duplicate WC URLs | CONFLICTING_IMPLEMENTATIONS | `sitemap-entries.ts:114-126`; GC-REC-005-04 |
| robots.txt | VERIFIED_IMPLEMENTED | `src/lib/seo/robots-txt.ts:3-10` |
| PostgreSQL/Supabase SoT in this repo | NOT_FOUND | Task 03 |
| Supabase SoT in programme architecture | CONFLICTING_IMPLEMENTATIONS | Task 03; v2 branch ledger |
| SEPANAI runtime code | NOT_FOUND | `git grep sepanai -- src/` empty |
| SEPANAI test fixtures | VERIFIED_IN_ACTIVE_PR | PR #11 files |
| SEPANAI foundation docs (full set) | VERIFIED_PLANNED_ONLY | GC-BATCH-004: absent on main |
| Editorial workflow (draft/review/approve) | NOT_FOUND | `src/types/editorial.ts:14-25` |
| Static editorial articles | VERIFIED_PARTIAL | `src/data/editorial/index.ts:5-8` (2 articles) |
| Firebase optional auth | VERIFIED_PARTIAL | `src/contexts/FirebaseAuthContext.tsx` |
| GSC evidence reconciliation | VERIFIED_IMPLEMENTED | GC-REC-005-05 |
| GSC application remediation | NOT_FOUND | Task 08 |
| GSC post-fix validation | VERIFIED_PLANNED_ONLY | Task 08 |
| WC archive hub on main | VERIFIED_IMPLEMENTED | `worldcup2026/page.tsx:20-24`, `src/lib/wc26/archive.ts` |
| WC live-surface retirement | VERIFIED_IN_ACTIVE_PR | PR #11 + tests |
| /live archive SEO alignment | CONFLICTING_IMPLEMENTATIONS | `live/page.tsx:11-14` vs archive hub |
| Private preview deployment gate (platform) | BLOCKED_BY_MISSING_EVIDENCE | not in repo |
| Private preview policy (docs) | VERIFIED_IMPLEMENTED | `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md` |
| Unit test suite | VERIFIED_IMPLEMENTED | `npm run test:unit` → 111 pass |
| Lighthouse home script | VERIFIED_PARTIAL | `scripts/lighthouse-home.mjs`; no CI |
| Bluesky/Threads social | NOT_FOUND | grep |
| X/Facebook share | VERIFIED_PARTIAL | `ShareButtons.tsx` |
| Recovery audit reports | VERIFIED_IMPLEMENTED | `reports/GC-REC-005-*` on recovery branch |
| PR #11 WC archive batch | VERIFIED_IN_ACTIVE_PR | PR #11; not on main |

---

## TASK 13 — Conflict, risk and blocker registers

### Blockers

| ID | Severity | Evidence | Consequence | Owner | Resolution | Blocks |
|----|----------|----------|-------------|-------|------------|--------|
| B-R2-001 | Critical | Task 03 | DB-dependent features | Architecture | Locate SoT repo/branch or update architecture | SEPANAI, CMS, GROWTH-013/014 |
| B-R2-002 | High | merge-base `31be078` | PR #11 stale vs main | Dev | Rebase/rebuild onto `20515a11` | Preview |
| B-R2-003 | High | GC-REC-005-04/05 | SEO remediation backlog | Founder | Prioritise GROWTH-001–007 | Growth authorisation |
| B-R2-004 | Medium | R1 untracked audits | Audit traceability | Ops | Commit R2 when authorised | Baseline sign-off |
| B-R2-005 | Medium | GSC example caps | Incomplete URL lists | SEO | Fresh exports | GROWTH-020 |

### Conflicts

| ID | Severity | Evidence | Consequence | Resolution |
|----|----------|----------|-------------|------------|
| C-001 | Critical | Supabase SoT vs repo | Wrong implementation target | Architecture decision |
| C-002 | High | Duplicate sitemap WC URLs | GSC duplicate signals | GROWTH-001 |
| C-003 | High | /live vs archive | Misleading SERP | GROWTH-002 / PR #11 |
| C-004 | Medium | PR #11 vs main tip | Merge conflicts | Rebuild |
| C-005 | Medium | GSC docs vs code fixes | False "fixed" belief | Separate classifications Task 08 |

---

## TASK 14 — Final recommendation

1. **R2 may become the canonical growth baseline** once Founder accepts Task 03 Supabase conflict gate and Task 05 worktree correction.
2. **R1:** retain only as **superseded draft** — do not use for authorisation decisions.
3. **PR #11:** **not safe to merge** as-is — **rebuild/rebase** onto `20515a11`, then **private preview** per Task 11; do **not** discard without Founder review (WC archive intent is valuable).
4. **Growth implementation:** **NOT AUTHORISED** — especially GROWTH-013/014 until SoT conflict resolved.
5. **Next decision gate:** Architecture ruling on Supabase SoT + Founder approval of R2 as baseline + recovery sign-off.

---

## Appendix A — Command evidence (verbatim outputs)

### git rev-parse / branch

```text
$ git rev-parse --show-toplevel
C:/Users/zafar/OneDrive/Desktop/CURSOR BAT/goalcurrent-live-nextjs

$ git branch --show-current
recovery/gc-exec-batch-005

$ git rev-parse HEAD
bbed4cfc22f3b1b906cac6184f3f805f7c2513aa

$ git rev-parse origin/main
20515a11b12026bb6e90c47b023cfb582ab8f718

$ git rev-parse origin/recovery/gc-exec-batch-005
bbed4cfc22f3b1b906cac6184f3f805f7c2513aa

$ git rev-parse 5ed5b3cd827627a18b40e6879309f184acbab63f
5ed5b3cd827627a18b40e6879309f184acbab63f
(PR #11 head — feature/wc26-archive-private-preview)
```

### remotes

```text
$ git remote -v
origin  https://github.com/Az1341/goalcurrent-live-nextjs.git (fetch)
origin  https://github.com/Az1341/goalcurrent-live-nextjs.git (push)
```

### merge-base

```text
$ git merge-base origin/main origin/recovery/gc-exec-batch-005
20515a11b12026bb6e90c47b023cfb582ab8f718

$ git merge-base origin/main 5ed5b3cd827627a18b40e6879309f184acbab63f
31be07851cff24828f92f13d374336bd014964a8
```

### git status (R2 audit — 24/07/2026 – 12:20 BST)

```text
On branch recovery/gc-exec-batch-005
Your branch is up to date with 'origin/recovery/gc-exec-batch-005'.

Untracked files:
  reports/audits/GC-GROWTH-RECONCILIATION-001-R1.md
  reports/audits/GC-GROWTH-RECONCILIATION-001-R2.md

nothing added to commit but untracked files present
```

### diff stat recovery vs main

```text
17 files changed, 7265 insertions(+)
(all under reports/ — GC-REC-005-*)
```

### diff stat PR #11 vs main

```text
45 files changed, 3443 insertions(+), 366 deletions(-)
```

### SQL / supabase / deps

```text
$ git ls-files "*.sql"
(empty)

supabase/ directory: NOT_FOUND

$ Select-String package.json -Pattern "supabase|drizzle|postgres"
(no matches)

$ git grep -i sepanai -- src/
(empty)
```

### route count

```text
$ node gc_r2_routes_utf8.mjs → count 89
```

### unit tests

```text
$ npm run test:unit
ℹ tests 111
ℹ pass 111
ℹ fail 0
ℹ duration_ms ~2313–3116 (runs 24/07/2026)
```

---

**GC-GROWTH-RECONCILIATION-001-R2 status:** COMPLETE — evidence-amended baseline for Founder review.

**No code, commit, merge, or deployment occurred.**

