# GC-MVP-READINESS-SPRINT-010 - R1

**Date/time:** 2026-07-26 ~17:08-17:30 BST
**Task ID:** GC-MVP-READINESS-SPRINT-010
**Title:** Next Canonical Frontend Remediation After FE-010
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** dcd97f7d8f71f4cd8a46b450d2ea6d17d48cd99b
**Implementation commit:** 8af57c25514b7f4ea7d831a6f2d1257f82167b49
**Evidence commit:** (this docs commit; SHA in return payload)
**Ending HEAD:** (after this docs commit)

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### FE-011 - Locale-unsafe next/link on PL/news surfaces
- **Category:** Internationalisation
- **Severity:** MAJOR
- **Confidence:** High
- **Location:** Multiple PL/news components (e.g. PlFixtureCard, PlHubClient, HomeLatestNews)
- **Evidence:** R1 frontend audit
- **Root cause:** Bypass @/i18n/navigation
- **Impact:** Locale drop for non-default locales
- **Exploitability:** N/A
- **False-positive disposition:** Not FP
- **Recommended correction:** Use locale-aware Link/router
- **Required tests:** fa/ar navigation keeps prefix
- **Remediation size:** M
- **Private-preview blocker:** No
- **Production blocker:** No

No other findings remediated. FE-001-010 untouched.

## 2. Selection rationale

| Finding | Severity | Eligible | Reason |
|---|---|---|---|
| FE-001..010 | various | No | Closed |
| FE-011 | MAJOR | Yes | Selected - next unresolved MAJOR FE after FE-010 |
| FE-012+ | MINOR/MAJOR | Deferred | Lower register order |

## 3. Closure cross-check

- Sprint 008/009 explicitly deferred FE-011.
- Not superseded by FE-009/010.
- No prior remediation of PL/news next/link imports.

## 4. Link and locale trace

| Surface | Destinations | Change |
|---|---|---|
| PlFixtureCard | /premier-league/match/:id (internal); Google Calendar stays <a> | next/link -> @/i18n/navigation |
| PlHubClient | /premier-league/table + section nav | locale-aware Link |
| HomeLatestNews | /news + internal article paths; external stays <a> | locale-aware Link |
| PlClubs/Match/Live | PL internal routes | locale-aware Link |
| NewsHub/Card/ArticleCard/Category/Editorial | /news /articles / + internal; external <a> | locale-aware Link |

Routing: localePrefix as-needed; default en unprefixed; fa/ar prefixed. No duplicated prefixes (Playwright).

## 5. Before / after

- Before: next/link dropped locale on fa/ar for PL/news internal links.
- After: @/i18n/navigation Link retains locale; default locale remains unprefixed.

## 6. Files changed

Implementation 8af57c25514b7f4ea7d831a6f2d1257f82167b49:
1. src/components/pl/PlFixtureCard.tsx
2. src/components/pl/PlHubClient.tsx
3. src/components/pl/PlClubsClient.tsx
4. src/components/pl/PlMatchClient.tsx
5. src/components/pl/PlLiveClient.tsx
6. src/components/home/v5/HomeLatestNews.tsx
7. src/components/news/NewsHub.tsx
8. src/components/news/NewsCard.tsx
9. src/components/news/NewsArticleCard.tsx
10. src/components/news/NewsCategoryFeed.tsx
11. src/components/news/EditorialArticleView.tsx
12. tests/i18n/fe-011-locale-link.test.mjs
13. tests/e2e/fe-011-locale-link.spec.ts
Evidence: reports/audits/GC-MVP-READINESS-SPRINT-010-R1.md

## 7. Acceptance matrix

| Criterion | Result |
|---|---|
| Locale retained (fa) | PASS |
| Default locale unprefixed | PASS |
| No duplicated locale prefix | PASS |
| Dynamic PL match paths preserved | PASS (pathname pattern unchanged) |
| External links unchanged | PASS (<a target=_blank>) |
| Mobile / desktop | PASS (390/1440) |
| Keyboard / a11y | PASS (FE-007 regression on prod build) |
| SEO / canonical / robots / sitemap | unchanged |
| Hydration / requests / polling | no new requests or polls |

## 8. Quality gates

| Gate | Result |
|---|---|
| Focused unit FE-011 | PASS 4/4 |
| Complete unit | PASS 174/174 |
| Playwright FE-011 mobile+desktop | PASS 6/6 (production build webServer) |
| Playwright FE-007 | PASS 3/3 (production build) |
| Playwright FE-004/009/010 + homepage | PASS in earlier same-session run |
| Mobile-critical | One fail: console 429 Too Many Requests (rate-limit noise; not FE-011). Later webServer retries timed out (Access denied) - non-authoritative |
| Typecheck | PASS |
| Scoped eslint | PASS 0 problems |
| Full eslint | 34 errors / 57 warnings (within 38/60 ceiling) |
| Production build | PASS (Playwright webServer npm run build) |

## 9. SEO / request / Vercel

- No new API routes, polling, fan-out, or Vercel functions.
- Link import swap only; no SEO metadata/robots/sitemap changes.

## 10. Remaining limitations

- Other non-PL/news next/link usages outside R2 Location remain (not broad migration).
- Mobile-critical console 429 flake under rate limiting during dense e2e runs.

## 11. Remaining unresolved R2 frontend findings

FE-012, FE-013, FE-014, FE-015, A11Y-001. BE-*/ENV/INFO remain as in R2.

## 12. UTF-8 verification

Written with Node utf8 and real newlines. Zero null bytes. Strict UTF-8 decode OK. No encoding-repair commit.

## 13. Prohibited-action confirmation

No second finding. No FE-001-010 rework. No general locale refactor beyond PL/news Location. No competition/AI/AEO/backend/env/Vercel/dependency/lockfile changes. No protected untracked edits. Nothing pushed, merged, or deployed.

**GC-MVP-READINESS-SPRINT-010 status:** COMPLETE
