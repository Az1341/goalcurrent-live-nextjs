# GC-MVP-READINESS-002 - Supabase/PostgreSQL SoT Investigation

**Report code:** GC-MVP-READINESS-002-SOT
**Task:** TASK 09
**Date:** 26/07/2026
**Method:** read-only repository/configuration inspection
**Production access:** none

## Declared data stores on production path

| Store | Classification | Evidence |
|-------|----------------|----------|
| Git static WC26 schedule / confirmed results | VERIFIED_IMPLEMENTED | src/data/wc26, confirmed-results SSOT |
| API-Football overlay | VERIFIED_IMPLEMENTED | src/lib/api-football/*, API_FOOTBALL_KEY name only |
| Content/news/video caches | VERIFIED_IMPLEMENTED | API routes + cache helpers |
| Firebase Auth (optional) | VERIFIED_PARTIAL | firebase client when configured |
| Supabase / PostgreSQL client | NOT_FOUND | no supabase/ dir; no package deps; zero src matches |
| SQL migrations / schema | NOT_FOUND | zero tracked *.sql |

## Environment variable names (no values)

Relevant names previously evidenced on path: API_FOOTBALL_KEY, Firebase-related, cron secret names. No SUPABASE_* or DATABASE_URL in application package/deps scan this sprint.

## BLK-001/005 classification

**PARTIALLY RESOLVED (repository truth)** — production-path absence of Supabase/PostgreSQL remains NOT_FOUND and consistent with R2 D1/D2 documentation disposition.

**Still BLOCKED for programme closure** — live external Supabase project state was not accessed (out of scope / no production connection). Founder evidence request if needed: export or screenshot of any live Supabase project linked to goalcurrent.live confirming empty/unused, without sharing secrets.

**Status:** PARTIALLY RESOLVED — no invented database decision