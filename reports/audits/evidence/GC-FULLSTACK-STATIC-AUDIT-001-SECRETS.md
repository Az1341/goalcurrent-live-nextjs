# GC-FULLSTACK-STATIC-AUDIT-001 - Secrets and configuration

Mode: read-only. Values redacted. No secret values printed.

## Tracked env files
- .env.example present (names/docs only)
- .env* gitignored except .env.example
- No .pem tracked (gitignore *.pem)
- .vercel gitignored

## Public identifiers observed in source (not secrets)
- NEXT_PUBLIC_GA_ID default G-X84HCE5KGT (src/lib/analytics/config.ts)
- NEXT_PUBLIC_CLARITY_PROJECT_ID default xmag3yk04j
- Site domain defaults goalcurrent.live

## Server secret name references (values not read)
API_FOOTBALL_KEY, CRON_SECRET, DEBUG_SECRET, YOUTUBE_API_KEY, GNEWS_API_KEY, SCOREBAT_API_TOKEN, FIREBASE_SERVICE_ACCOUNT_JSON, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN, Firebase NEXT_PUBLIC_* set

## Findings (config)
1. DEBUG_SECRET OR CRON_SECRET authorises debug dumps (coupling)
2. NEXT_PUBLIC_GA_INTERNAL_UNLOCK is client-visible by design
3. ScoreBat token sent as query ?token=
4. Sentry beforeSend deletes authorization/cookie only
5. Preview HTML noindex added (Sprint 002) but robots.txt always Allow:/
6. CI actions use major version tags (actions/checkout@v4) not full SHA pins

No local gitleaks/trufflehog executed (tooling unavailable). No external secret-scan upload.