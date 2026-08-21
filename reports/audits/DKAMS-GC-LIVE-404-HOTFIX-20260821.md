# DKAMS-GC-LIVE-404-HOTFIX-20260821

Status: READY FOR CI

Production symptom: valid Premier League fixture route `/premier-league/match/1557367` rendered GoalCurrent's 404 page while API-Football was rate-limited.

Root cause: the server page treated every configured-provider `fixture: null` response as a definitive not-found result. During provider throttling this converted a transient upstream outage into a false 404.

Controlled fix on `recover/pr65-live-404-20260821`:
- add fixture-scoped match-detail fresh/stale cache wrapper with singleflight de-duplication;
- use stale successful match data during non-definitive provider failures;
- only return page-level 404 for explicit fixture-not-found / wrong-competition evidence;
- add `X-GC-Stale` for stale API responses;
- add quota-free `/api/health`;
- preserve the merged Stitch match-centre UI from PR #70;
- add focused cache and health unit coverage.

Production merge/deploy: pending CI.
