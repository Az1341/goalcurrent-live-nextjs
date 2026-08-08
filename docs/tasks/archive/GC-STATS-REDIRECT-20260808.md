# GC-STATS-REDIRECT-20260808 — Report

**Project:** goalcurrent.live
**Report code:** GC-STATS-REDIRECT-20260808
**Date:** 2026-08-08
**Status:** PASSED

---

## Summary

Redirected three coming-soon statistics stubs to the real PL statistics hub, removed them from sitemap stub lists, deleted their page files, and retargeted remaining in-app links. `/statistics/clean-sheets` and `/statistics/player-rankings` left unchanged as noindex stubs.

Verification: source + local tooling only — no live URL fetches.

---

## Files modified / deleted

### Modified
- `next.config.ts` — permanent redirects for the three stubs → `/premier-league/statistics`
- `src/proxy.ts` — locale-aware matching redirects (same dual pattern as other SITE_REDIRECTS)
- `src/lib/seo/sitemap-static-paths.ts` — removed the three paths from `NOINDEX_STUB_PATHS`
- `src/app/[locale]/statistics/clean-sheets/page.tsx` — dropped Disciplinary stub link
- `src/app/[locale]/statistics/players/page.tsx` — links → PL Statistics
- `src/app/[locale]/statistics/player-rankings/page.tsx` — links → PL Statistics
- `src/app/[locale]/statistics/live/page.tsx` — links → PL Statistics
- `src/app/[locale]/worldcup2026/players/page.tsx` — Top Scorers link → PL Statistics
- `tests/lib/wc26-redirect-map.test.mjs` — assert the three redirects
- `docs/tasks/archive/GC-STATS-REDIRECT-20260808.md` — this report

### Deleted
- `src/app/[locale]/statistics/top-scorers/page.tsx`
- `src/app/[locale]/statistics/assists/page.tsx`
- `src/app/[locale]/statistics/disciplinary/page.tsx`

### Unchanged (as required)
- `/statistics/clean-sheets`
- `/statistics/player-rankings`

---

## Nav menu check

`src/lib/nav.ts` already links Statistics to `/premier-league/statistics` in:
- `PL_SECTION_NAV`
- `MORE_SHEET_SUBMENUS.pl`
- `DESKTOP_PL_DROPDOWN`

`MORE_SHEET_SUBMENUS.statistics` is empty (no stub paths). No header/More nav updates required.

Remaining coming-soon page cross-links that pointed at the three deleted stubs were updated to `/premier-league/statistics` so in-app navigation does not rely on the redirect.

Post-change grep of active source: only `next.config.ts`, `src/proxy.ts`, and the unit test still reference the three paths (as redirect sources). Historical `reports/` / `build-report*.txt` audit artifacts still mention them and were left alone.

---

## Ship

| Field | Value |
|---|---|
| **Branch** | `fix/gc-stats-redirect-20260808` |
| **PR** | https://github.com/Az1341/goalcurrent.live/pull/38 |
| **Head SHA** | `2ead82dc58773c5f4dc8c74ba51b76ca14929b71` |
| **Lint** | 29 errors, 52 warnings — delta 0 vs baseline |
| **Unit tests** | 344 pass, 0 fail |
| **Vercel** | Ready (success) — https://goalcurrentlive-28wf2v5uh-az-team-1.vercel.app (Deployments API; not crawled) |

---

**GC-STATS-REDIRECT-20260808 status:** PASSED
