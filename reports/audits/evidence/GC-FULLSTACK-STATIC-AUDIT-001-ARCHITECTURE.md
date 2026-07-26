# GC-FULLSTACK-STATIC-AUDIT-001 - Architecture and trust boundaries

## Implemented system map

### Next.js app
- App Router under src/app/[locale]/** for public pages
- API routes under src/app/api/** (29 route.ts handlers)
- Proxy/middleware logic in src/proxy.ts (i18n redirects, rate limit on /api, security headers on HTML, preview X-Robots-Tag)

### Server vs Client
- Heavy client shell: Layout, HomeClient, live centre, PL hubs, SWR polling
- Server: API routes, match SSR fetches (PL match page), metadata/robots helpers
- Server-only secrets via process.env (non NEXT_PUBLIC) in lib/server and api-football clients

### Provider integrations
- API-Football (PL + WC26 primary)
- ScoreBat, ESPN, LiveScore (WC26 top-scorers tier-2)
- GNews / RSS / YouTube ingest
- Firebase Auth (client) + firebase-admin (FCM subscribe)
- Sentry, GA4, Clarity (consent-gated analytics)
- Upstash Redis rate limit (optional)

### Football data transformations
- Static WC26 fixtures in src/data/wc26
- Overlay runtime: src/lib/wc26-fixture-overlay.ts + wc26-results-sync
- Status normalization: wc26-match-status, wc26-live, pl/api mapFixtureStatus
- Confirmed results archive path when tournament complete

### Caching / revalidation
- In-process LRU caches (api-football/cache, server/cache)
- SWR client cache with visibility-aware intervals
- Route revalidate metadata on some pages (build output shows 30s etc.)
- Cron refresh-content daily

### Auth / authz
- Public sports APIs intentionally unauthenticated
- Cron/debug gated by secrets
- Firebase optional for UX; FCM idToken optional

### Database
- No Supabase/PostgreSQL/Prisma/Drizzle clients on repository production path (NOT_FOUND; prior Sprint 002 evidence)

### Scheduled jobs / polling
- Vercel cron: /api/cron/refresh-content
- Client: Wc26ResultsSync + FinalWinnerCelebration in layout; PL/news SWR; match-detail polls

### Admin / editorial
- Articles from repo data (src/data/articles.ts) - not a CMS admin surface in-repo
- Debug API dumps for operators

### Preview vs production
- shouldNoIndexDeploy() for preview/dev HTML + X-Robots-Tag
- robots.txt still Allow:/ globally
- Deployment Protection not proven in this audit (platform)

## Sources of Truth (actual)

| Domain | SoT | Conflict |
|--------|-----|----------|
| WC26 schedule skeleton | Static fixtures data | Overlay/API can override scores/status/participants |
| Live scores | API-Football via /api/wc26/scores | Overlay replace/heuristic completion can disagree |
| PL fixtures/standings | API-Football via /api/pl/* | Client fetcher transforms may diverge by mount order |
| News | Ingest cache + /api/news | Dual client owners (SWR vs useNewsFeed) |
| Articles | Repo TypeScript data | N/A |
| Auth identity | Firebase | Optional; not required for scores |
| Persistent DB | None in repo | Programme SoT closure still external |

No architectural rewrite recommended solely from this audit; Critical findings are correctness/abuse controls within the current design.