# GC-COMSHIELD-001-R1 — Evidence Report

**DKAMS code:** DKAMS-GC-COMSHIELD-001-R1
**Date:** 2026-08-10
**Branch:** feat/gc-comshield-001-r1
**Starting HEAD:** eecb977e921f6ce88f8a6395ca55792c2c6d5c01 (origin/main)
**Ending HEAD:** f03c0a15084080e7f6d7e89d37ca863776713969
**Verdict:** PASS
**Deploy:** NOT performed
**Push:** NOT performed

## Team IDs (verified, not guessed)

| Team | API-Football ID | Source |
|---|---|---|
| Arsenal | 42 | `src/data/pl/fixtures-2026-27.json` (multiple fixtures, e.g. homeTeamId 42) |
| Manchester City | 50 | `src/data/pl/clubs-2026-27.json` (`teamId: 50`, name Manchester City) and `src/data/pl/fixtures-2026-27.json` (`homeTeamId: 50`) |

## Fixture ID

- Chosen: **880160001**
- Why: outside PL SSOT range `926270001–926270380` (`PL_SSOT_FIXTURE_ID_*`) and outside WC26 string IDs (`fixture-NNN`)

## Pattern fidelity (PL SSOT → SSR seed → SWR)

1. Static JSON: `src/data/community-shield/fixtures-2026.json`
2. SSOT reader: `src/lib/community-shield/fixtures-ssot.ts` (`getCommunityShieldFixture`)
3. Response wrapper: `src/lib/community-shield/api.ts` (`ssotCommunityShieldFixturesResponse`)
4. Server page: `src/app/[locale]/community-shield/page.tsx` seeds `initialData`
5. Client: `CommunityShieldHubClient` → `useCommunityShieldFixture(initialData)` → `fallbackData`
6. API: `GET /api/community-shield/fixture` returns SSOT only (no API-Football live poll)

## Result-update path (TASK 09)

**Manual JSON edit** after 16 Aug (same class of update as WC26 confirmed-results): edit `src/data/community-shield/fixtures-2026.json` (`kickoffUtc` when published; then `status` / scores when FT). API route has no speculative live polling — API-Football Community Shield coverage was not assumed.

## Translations

`communityShield` namespace in en/fr/de/es/it/nl — `npm run i18n:check` parity OK. Client uses `useTranslations`; no hardcoded English chrome.

## Out of scope confirmed untouched

- HomeClient / homepage
- Premier League hub
- FA Cup architecture

## Tests / gates

| Command | Result |
|---|---|
| `npm run test:unit` | 348 pass / 0 fail |
| Community Shield unit file | 4 pass |
| Scoped eslint (prod CS TS) | 0 errors |
| Full lint | 29 errors / 53 warnings (+1 warning from new test non-literal fs; errors delta 0) |
| `npm run build` | exit 0 |
| Local SSR `GET /community-shield` | 200; City/Arsenal/TBC present; SportsEvent JSON-LD present |
| Playwright | NOT RUN — Chromium binaries unavailable in this environment |

## Files created/modified (authorised)

Created:
- src/data/community-shield/fixtures-2026.json
- src/lib/community-shield/{constants,types,fixtures-ssot,api}.ts
- src/lib/client/useCommunityShieldFixture.ts
- src/app/api/community-shield/fixture/route.ts
- src/app/[locale]/community-shield/page.tsx
- src/components/community-shield/{CommunityShieldHubClient.tsx,CommunityShieldHub.module.css}
- tests/lib/community-shield-ssot.test.mjs
- reports/audits/GC-COMSHIELD-001-R1.md
- docs/tasks/archive/DKAMS-GC-COMSHIELD-001-R1.md

Modified:
- src/lib/client/live-data.ts (path + typed fallbackData support for SWR seed)
- src/lib/seo/sitemap-static-paths.ts (`/community-shield`)
- messages/{en,fr,de,es,it,nl}.json

## Recommendation

PASS for Ahmad audit. Safe to authorise push after review. No deploy.
