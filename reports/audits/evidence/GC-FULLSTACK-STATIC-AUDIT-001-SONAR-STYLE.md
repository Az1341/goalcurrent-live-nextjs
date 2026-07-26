# GC-FULLSTACK-STATIC-AUDIT-001 - Sonar-style local audit

## Label

SONAR-STYLE LOCAL AUDIT

Not ACTUAL SONAR EXECUTION.

Reasons Sonar was not run:
- No sonar-project.properties / .sonarcloud.properties
- No sonar-scanner CLI
- No authorised SonarCloud/Qube endpoint configured for this audit
- Would risk unexpected private source upload

## Manual quality dimensions

### Bugs / reliability
- normalizeWc26MatchStatus forces FT when elapsed>=90 on 1H/2H (stoppage false FT)
- Visibility handler clears all SWR cache without revalidate
- Conditional hooks in useLiveApi
- Live overlay wipe-on-empty risk
- Knockout completion heuristic via apiFixtureId+scores

### Security hotspots
- Unauthenticated upstream quota amplification
- Rate-limit memory fallback without Upstash
- Debug auth shares CRON_SECRET
- ScoreBat token in query string
- Sentry header redaction incomplete for custom secret headers

### Maintainability / complexity
- Large WC26 overlay / standings / match-detail modules
- Dual news ownership (SWR vs module store)
- PL status label inconsistency across surfaces
- Lint debt 41/60 across scripts+src

### Duplication
- Provider status mapping appears in multiple WC26/PL layers (improved by Sprint 001/002 tests but still multi-surface)
- News fetch stacks remain dual

### Dead / unused
- Multiple unused-vars lint hits in API routes and components

### Unsafe assertions / suppressions
- No broad eslint-disable campaign observed; CI soft-fails full lint

### Test gaps (Sonar-style)
- No unit test asserting stoppage-time remains LIVE (current data-contract asserts FT at 2H/90)
- No test for visibility SWR clear behaviour
- No a11y dialog focus-trap test for More sheet
- No authz test for FCM idToken requirement
- No quota/RL integration test

Coverage percentage not used as sole quality measure.