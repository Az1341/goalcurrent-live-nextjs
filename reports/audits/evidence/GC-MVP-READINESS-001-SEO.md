# GC-MVP-READINESS-001 - SEO and Indexing Gate

**Report code:** GC-MVP-READINESS-001-SEO
**Task:** TASK 10
**Date:** 26/07/2026

## Verified surfaces

| Surface | Location | Finding |
|---------|----------|---------|
| robots.txt | /api/robots via rewrite; src/lib/seo/robots-txt.ts | Allow /, Disallow /api/; no preview host branch |
| sitemap | src/lib/seo/sitemap-entries.ts | FIXED: removed /worldcup2026/match/* redirect URLs (32bb530) |
| Canonical / metadata | src/lib/page-metadata.ts; locale layout metadataBase goalcurrent.live | Present |
| Redirects | next.config SITE_REDIRECTS; proxy.ts | Hub match -> /match/:id |
| 404 | src/app/[locale]/not-found.tsx | No robots noindex on 404 page (gap) |
| Archive indexability | worldcup2026 hub intentional index | OK for archive product |
| Preview noindex | code gap | Rely on Vercel Deployment Protection (BLK-006 still OPEN) |

## Correction

Isolated sitemap canonical fix + tests/lib/sitemap-canonical.test.mjs. No broad noindex introduced.

**GC-MVP-READINESS-001-SEO status:** COMPLETE WITH REMAINING GAPS