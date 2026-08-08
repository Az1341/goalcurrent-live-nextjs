# GC-I18N-CANONICAL-20260808 — Report

**Project:** goalcurrent.live
**Report code:** GC-I18N-CANONICAL-20260808
**Date:** 2026-08-08
**Status:** PASSED

---

## Summary

Wired the real route `locale` into every `buildPageMetadata()` caller so canonical / Open Graph URLs no longer default to English. Static `export const metadata` pages were converted to `generateMetadata`; the three already-dynamic pages were checked and fixed where locale was missing from the `buildPageMetadata` call.

Verification was source + local tooling only — no live network requests to any Vercel or goalcurrent.live URL.

---

## Files modified (43)

1. `src/app/[locale]/about/page.tsx`
2. `src/app/[locale]/affiliate-disclosure/page.tsx`
3. `src/app/[locale]/articles/page.tsx`
4. `src/app/[locale]/bundesliga/page.tsx`
5. `src/app/[locale]/champions-league/page.tsx`
6. `src/app/[locale]/contact/page.tsx`
7. `src/app/[locale]/cookies/page.tsx`
8. `src/app/[locale]/fa-cup/page.tsx`
9. `src/app/[locale]/favourites/page.tsx`
10. `src/app/[locale]/fixture/page.tsx`
11. `src/app/[locale]/la-liga/page.tsx`
12. `src/app/[locale]/live/page.tsx`
13. `src/app/[locale]/nations-league/league/[league]/group/[group]/page.tsx`
14. `src/app/[locale]/nations-league/league/[league]/page.tsx`
15. `src/app/[locale]/nations-league/page.tsx`
16. `src/app/[locale]/news/page.tsx`
17. `src/app/[locale]/news/premier-league/page.tsx`
18. `src/app/[locale]/news/world-cup/page.tsx`
19. `src/app/[locale]/page.tsx`
20. `src/app/[locale]/premier-league/2025-26/table/page.tsx`
21. `src/app/[locale]/premier-league/clubs/page.tsx`
22. `src/app/[locale]/premier-league/fixtures/page.tsx`
23. `src/app/[locale]/premier-league/live/page.tsx`
24. `src/app/[locale]/premier-league/page.tsx`
25. `src/app/[locale]/premier-league/players/page.tsx`
26. `src/app/[locale]/premier-league/statistics/page.tsx`
27. `src/app/[locale]/premier-league/table/page.tsx`
28. `src/app/[locale]/premier-league/transfers/page.tsx`
29. `src/app/[locale]/privacy/page.tsx`
30. `src/app/[locale]/serie-a/page.tsx`
31. `src/app/[locale]/terms/page.tsx`
32. `src/app/[locale]/video/youtube/page.tsx`
33. `src/app/[locale]/videos/page.tsx`
34. `src/app/[locale]/videos/premier-league/page.tsx`
35. `src/app/[locale]/videos/world-cup/page.tsx`
36. `src/app/[locale]/worldcup2026/bracket/page.tsx`
37. `src/app/[locale]/worldcup2026/fixtures/page.tsx`
38. `src/app/[locale]/worldcup2026/groups/[group]/page.tsx`
39. `src/app/[locale]/worldcup2026/groups/page.tsx`
40. `src/app/[locale]/worldcup2026/page.tsx`
41. `src/app/[locale]/worldcup2026/standings/page.tsx`
42. `src/app/[locale]/worldcup2026/teams/page.tsx`
43. `src/app/[locale]/worldcup2026/venues/page.tsx`

### Already-dynamic files (3) — checked and fixed

All three used `generateMetadata` but did **not** pass `locale` into `buildPageMetadata`. Each was updated to destructure `locale` from `await params` and forward it:

1. `src/app/[locale]/nations-league/league/[league]/page.tsx`
2. `src/app/[locale]/nations-league/league/[league]/group/[group]/page.tsx`
3. `src/app/[locale]/worldcup2026/groups/[group]/page.tsx`

---

## Sample generateMetadata (3 modified files)

### 1. Homepage — src/app/[locale]/page.tsx

```ts
export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: normalizePageTitleText(
      `${SITE_NAME} | Live Football Scores, Fixtures and News`,
    ),
    description: `${SITE_NAME} | live football scores, fixtures, results, standings and news from leagues and tournaments worldwide.`,
    path: "/",
    absoluteTitle: true,
    locale,
  });
}
```

### 2. Nations League league hub — src/app/[locale]/nations-league/league/[league]/page.tsx

```ts
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, league: raw } = await params;
  const league = parseLeague(raw);
  const label = league ? `League ${league.toUpperCase()}` : "League";
  return buildPageMetadata({
    title: `${UNL_DISPLAY_NAME} · ${label}`,
    description: `${label} groups and teams for UEFA Nations League ${UNL_SEASON_LABEL}.`,
    path: league ? `/nations-league/league/${league}` : "/nations-league",
    locale,
  });
}
```

### 3. WC26 group hub — src/app/[locale]/worldcup2026/groups/[group]/page.tsx

```ts
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, group } = await params;
  const groupId = resolveGroupParam(group);

  if (!groupId) {
    return { title: "Group — World Cup 2026" };
  }

  return buildPageMetadata({
    title: groupHubTitle(groupId),
    description: groupHubDescription(groupId),
    path: groupHref(groupId),
    locale,
  });
}
```

---

## Ship

| Field | Value |
|---|---|
| **Branch** | `fix/gc-i18n-canonical-locale-20260808` |
| **PR** | https://github.com/Az1341/goalcurrent.live/pull/36 |
| **Head SHA** | `65b4432fb50961d98500220cbf356de7c92c4af5` |
| **Lint** | 29 errors, 52 warnings — delta 0 vs baseline |
| **Unit tests** | 342 pass, 0 fail |
| **Vercel** | See PR checks / GitHub Deployments API (URL not crawled) |

---

## Out of scope / follow-ups (not part of the 43)

Helpers that also call `buildPageMetadata` / related builders without locale still exist:

- `src/lib/team-profile/metadata.ts`
- `src/lib/coming-soon-page.tsx`
- Pages using `buildArticleMetadata` / `buildMatchMetadata` that do not already forward locale

Suggested optional live check (not performed per task rule): inspect `rel=canonical` on a Spanish locale preview page after deploy — manually, not via automated crawl.

---

**GC-I18N-CANONICAL-20260808 status:** PASSED
