# GC-FULLSTACK-STATIC-AUDIT-001 - Semgrep

## Execution status

SEMGREP NOT EXECUTED - TOOLING UNAVAILABLE

Evidence:
- Get-Command semgrep: not found
- npx --no-install semgrep --version: failed (no local package)
- python importlib find_spec("semgrep"): False
- No semgrep.yml / .semgrep.yml in repository
- Did not install Semgrep into the repository or mutate package.json/lockfile
- Did not upload source to any hosted Semgrep service

## Semgrep-style manual review (clearly labelled MANUAL)

Scope reviewed: src/app/api/**, src/lib/server/**, src/lib/api-football/**, src/proxy.ts, client fetchers, HTML sinks.

| Pattern class | Result | Notes |
|---------------|--------|-------|
| Classic SSRF (user URL fetch) | Not found | Outbound hosts hardcoded |
| Open redirect | Not found | proxy uses nextUrl.clone + fixed path maps |
| SQL injection / DB | N/A | No DB clients on app path |
| Path traversal (fs from user) | Not found in API handlers | Script fs warnings only |
| XSS sinks | Present | dangerouslySetInnerHTML in ArticleBodyWithAd, JsonLd*, ThemeScript |
| Secrets in client bundle | Present | NEXT_PUBLIC_* expected; GA unlock public |
| Authz gaps | Present | Public data APIs intentional; FCM subscribe without required idToken |
| Sensitive logging | Present | AuthError/provider messages; Sentry omits auth/cookie but not x-cron-secret |
| Injection via query IDs | Partial | WC26 apiFixtureId trusted without ownership bind |

Detailed validated findings are in the R1 report (SEC-* / FE-* IDs). This section is NOT an actual Semgrep run.