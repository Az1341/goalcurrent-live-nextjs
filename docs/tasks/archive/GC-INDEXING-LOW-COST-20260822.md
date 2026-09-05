# GC-INDEXING-LOW-COST-20260822 ? Archive

**Project:** goalcurrent.live
**Report code:** GC-INDEXING-LOW-COST-20260822
**Date:** 2026-08-22
**Baseline:** origin/main d2be852
**Branch:** fix/gc-indexing-low-cost-20260822
**Amendment:** DKAMS-GC-PR80-NARROWING-20260822-231144

## Proven defect

WC26 match pages and /articles/* detail pages omit locale from metadata, so HTML canonical is English. Advertising /es/match/... and /de/articles/... as sitemap locs created non-self-canonical index targets.

## Repair

- Self-canonical indexable families (homepage, scores, league hubs, teams, news hubs, WC26 archive hubs) still emit one sitemap loc per locale.
- English-canonical match and article families emit the default-locale loc only.
- hreflang + x-default remain on every emitted entry.
- News sitemap stays default-locale only while article metadata remains English-canonical.

## Not claimed

Locale sitemap locs are not invalid for self-canonical hubs. The first PR #80 commit was broader than the proven defect and was narrowed.

## Deployment disclosure

Cursor did not invoke the Vercel CLI. GitHub integration automatically created a Vercel preview for PR #80.

## Follow-up

- Trailing-slash canonicals on /videos and /news/* metadata
- Thin /premier-league/2025-26/table still in sitemap
- Pass locale through WC26 match and article metadata if those locale URLs should become self-canonical
- Search Console example URLs still needed for 404 / soft 404 / crawled-not-indexed
