# GC-MVP-READINESS-002 - News Polling Audit

**Report code:** GC-MVP-READINESS-002-NEWS
**Task:** TASK 06
**Date:** 26/07/2026

## Pollers

| Poller | Owner surfaces | Interval | Destination | Cleanup |
|--------|----------------|----------|-------------|---------|
| NewsHub useSWR | /news page only (`src/app/[locale]/news/page.tsx`) | 3_600_000 ms visibility-aware | /api/news | SWR unmount |
| useNewsFeed module store | HomeLatestNews, ProfileNewsSection, GroupHubContent | 3_600_000 ms setInterval | /api/news | clears interval + aborts when subscriberCount hits 0 |

## Duplication verdict

NOT PROVEN as simultaneous duplicate requests on one route. NewsHub and useNewsFeed serve different surfaces and are not co-mounted on the homepage or news hub.

## Action

No consolidation in this sprint. Both remain necessary for their owners. useNewsFeed already cleans up on last unsubscribe.

**Status:** AUDITED — NO CODE CHANGE