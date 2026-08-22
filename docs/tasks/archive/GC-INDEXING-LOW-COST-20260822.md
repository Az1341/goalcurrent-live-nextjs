# GC-INDEXING-LOW-COST-20260822 ? Archive

**Project:** goalcurrent.live
**Report code:** GC-INDEXING-LOW-COST-20260822
**Date:** 2026-08-22
**Baseline:** origin/main d2be852
**Branch:** fix/gc-indexing-low-cost-20260822

## Proven defect

Sitemap generator advertised all 6 locales (251 paths x 6 = 1506 locs). WC26 match and article metadata still canonicalize to English, so locale sitemap URLs were non-self-canonical index targets.

## Repair

Main and news sitemaps emit one default-locale loc per page. hreflang + x-default remain on that loc.

## Follow-up

- Trailing-slash canonicals on /videos and /news/* metadata
- Thin /premier-league/2025-26/table still in sitemap
- Pass locale through WC26 match and article metadata if locale URLs should be self-canonical
- Search Console example URLs still needed for 404 / soft 404 / crawled-not-indexed

## Notes

Dirty checkout on recover/merge-gc-launch-reliability-pr65-20260821 was left untouched. Work used a clean worktree from origin/main.
