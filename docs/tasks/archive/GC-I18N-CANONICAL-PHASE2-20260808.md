# GC-I18N-CANONICAL-PHASE2-20260808 — Report

**Project:** goalcurrent.live
**Report code:** GC-I18N-CANONICAL-PHASE2-20260808
**Date:** 2026-08-08
**Status:** PASSED

---

## Summary

Phase 2 follow-up to GC-I18N-CANONICAL-20260808: threaded real route `locale` through indexed team-profile and article metadata helpers/callers. Coming-soon pages were skipped (already `noindex`).

Verification: source + local tooling only — no live URL fetches.

---

## Files modified

1. `src/lib/team-profile/metadata.ts` — added required `locale` to `buildPlClubMetadata` / `buildWc26TeamMetadata`; pass through to `buildPageMetadata`
2. `src/app/[locale]/premier-league/clubs/[club]/page.tsx` — extract `locale` from params; pass to helper
3. `src/app/[locale]/worldcup2026/teams/[teamId]/page.tsx` — extract `locale` from params; pass to helper
4. `src/app/[locale]/articles/alireza-beiranvand-iran-world-cup-hero/page.tsx` — static metadata → `generateMetadata` with `locale`
5. `src/app/[locale]/articles/fifa-world-cup-2026-head-to-head-rule-early-elimination/page.tsx` — same
6. `src/app/[locale]/worldcup2026/news/morocco-knock-out-netherlands-on-penalties/page.tsx` — same

`buildArticleMetadata` already accepted optional `locale` (default English); no signature change required in `page-metadata.ts` — callers now pass the real locale.

---

## Item 1 — team profile helpers

Done. Both helpers now require `locale: string` and forward it to `buildPageMetadata`. Both page callers updated.

### buildPlClubMetadata (updated)

```ts
export function buildPlClubMetadata(club: PlClub, locale: string): Metadata {
  const title = `${club.name} News, Fixtures, Transfers & Results | ${SITE_NAME}`;
  return buildPageMetadata({
    title,
    description: `${club.name} - latest Premier League results, fixtures, form, league position, transfer rumours, injuries and news for the 2026/27 season on ${SITE_NAME}.`,
    path: clubHref(club.slug),
    absoluteTitle: true,
    locale,
  });
}
```

---

## Item 2 — buildArticleMetadata callers

Done. All three named pages converted to `generateMetadata` and pass `locale` into `buildArticleMetadata`.

### Example caller fix (Beiranvand)

```ts
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildArticleMetadata({
    title: article.title,
    description: article.description,
    path: article.path,
    keywords: article.keywords,
    publishedTime: article.publishedAt,
    modifiedTime: article.publishedAt,
    authors: [article.author],
    locale,
  });
}
```

---

## Item 3 — coming-soon pages

**Skipped.** All 19 callers already set `robots: { index: false, follow: true }`, so wrong English canonicals have no search-visibility impact. Converting 19 pages is not justified for consistency-only cleanup in this pass.

---

## Ship

| Field | Value |
|---|---|
| **Branch** | `fix/gc-i18n-canonical-phase2-20260808` |
| **PR** | https://github.com/Az1341/goalcurrent.live/pull/37 |
| **Head SHA** | `5ba98bf93fed2343b8d2f4abf7884786dff054dc` |
| **Lint** | 29 errors, 52 warnings — delta 0 vs baseline |
| **Unit tests** | 342 pass, 0 fail |
| **Vercel** | Ready (success) — https://goalcurrentlive-naxnpqi79-az-team-1.vercel.app (Deployments API; not crawled) |

---

**GC-I18N-CANONICAL-PHASE2-20260808 status:** PASSED
