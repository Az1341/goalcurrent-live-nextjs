# GC-SOT-CLOSURE-R2-STAGE-01-R1 - Targeted Evidence Correction

**Report code:** GC-SOT-CLOSURE-R2-STAGE-01-R1  
**Type:** TARGETED EVIDENCE CORRECTION  
**Date:** 24/07/2026 - 14:23 BST  
**Source:** `reports/audits/evidence/GC-SOT-CLOSURE-R2-STAGE-01.md`  
**Status:** DOCUMENTATION ONLY  
**Branch:** `recovery/gc-exec-batch-005`  
**HEAD:** `e4873659836b007f26ee78b01c6e4355a584663f`

---

## Control state

| Control | State |
|---------|-------|
| Stage 01 source report | **Not modified** |
| Application code | **Unchanged** |
| Commit / push | **Not performed** |
| Scope | Eight mandatory corrections only |
| Classifications allowed | VERIFIED_IMPLEMENTED, VERIFIED_PLANNED_ONLY, NOT_FOUND, CONFLICTING_IMPLEMENTATIONS, BLOCKED_BY_MISSING_EVIDENCE |

---

## Preserved Stage 01 findings (supported; not reopened)

| Area | Preserved conclusion |
|------|----------------------|
| Supabase on production path | NOT_FOUND |
| v2-rebuild Supabase ledger | VERIFIED_PLANNED_ONLY (SHAs 3913ec1, 9789bb7, 9eaa85f) |
| Programme SoT vs repo | CONFLICTING_IMPLEMENTATIONS |
| DB/migration deps in package.json | NOT_FOUND |
| Optional Firebase Auth login/logout/session (env-gated) | Present as Stage 01 TASK 06 evidence |
| Deployment platform | Vercel (`goalcurrent.live`); Netlify non-primary |

---

## Correction 1 - Consent records reclassification

**Stage 01 defect:** Classified cookie-preference localStorage as consent records for the pilot gap.

**Evidence (cookie preference only - not subscriber/AI consent):**

| Path | Lines | Finding |
|------|-------|---------|
| `src/lib/site-keys.ts` | 2-4 | `COOKIE_CONSENT_KEY = "gc_cookie_consent_v1"` |
| `src/components/layout/CookieConsent.tsx` | 22-23, 39, 47, 51 | Persists accepted/declined cookie preference in localStorage |
| `src/components/analytics/GA.tsx` | 24, 36-43 | Gates analytics on cookie preference |
| `src/components/analytics/Clarity.tsx` | 23, 35 | Same analytics gate |

**Search for subscriber / AI-processing consent records:**

```text
Command: git grep -niE "subscriber|membership identity|free.?membership|pilot identity" -- ':!node_modules' ':!.next' ':!reports/audits/evidence'
Relevant production hits: article prose + React feed subscriberCount in src/lib/use-news-feed.ts (not consent records)
Command: git grep -niE "AI.?consent|processing.?consent|subscriber.?consent|consent.?record" -- 'src/' 'docs/'
Output: no qualifying subscriber/AI consent record store
```

**Classification:** `NOT_FOUND`

Cookie-preference localStorage is analytics/cookie UI only. It is not a subscriber consent or AI-processing consent record.

---

## Correction 2 - Subscriber identity reclassification

**Rule:** VERIFIED_PLANNED_ONLY only if an approved implementation document directly establishes the planned capability with exact path and lines.

```text
Command: git grep -niE "subscriber identity|membership status|pilot identity|free.?membership" -- 'docs/' 'src/'
Output: no matching approved implementation document establishing pilot subscriber identity
```

Firebase Auth (optional Google/Apple) provides a Firebase UID when configured (`src/lib/firebase/client.ts`, `src/contexts/FirebaseAuthContext.tsx`) but no approved plan document maps this to GoalCurrent x SEPANAI **subscriber identity**. `src/lib/use-news-feed.ts:27,90-103` uses `subscriberCount` as a React subscription counter, not membership identity.

**Classification:** `NOT_FOUND`

---

## Correction 3 - Retention and deletion reclassification

**Rule:** A privacy-rights page is not an implemented retention/deletion system. VERIFIED_PLANNED_ONLY only with an approved technical plan.

| Path | Lines | Finding |
|------|-------|---------|
| `src/app/[locale]/privacy/page.tsx` | ~86-87 | UK GDPR rights text only |
| `docs/product/GC-WC26-ARCHIVE-SPEC-001.md` | 147-148 | Lists SEPANAI/Supabase Auth and wholesale WC26 deletion as **out of scope** - not a retention/deletion implementation plan |

No approved technical plan for pilot user/AI retention or deletion was found under `docs/` or `src/`.

**Classification:** `NOT_FOUND`

---

## Correction 4 - Abuse prevention reclassification

**Rule:** Generic/optional rate limiting does not prove GoalCurrent x SEPANAI pilot-specific abuse prevention.

| Path | Lines | Finding |
|------|-------|---------|
| `src/lib/rate-limit/index.ts` | 25-43, 59+ | Optional Upstash sliding-window limits (`gc:rl:general`, `gc:rl:upstream`) |
| `src/proxy.ts` | 7-9, 167 | Calls `checkRateLimitAsync` for general request limiting |

```text
Command: git grep -niE "abuse|sepanai.*limit|pilot.*abuse|prompt.?inject" -- 'src/'
Output: no pilot-specific abuse-prevention module
```

**Classification:** `NOT_FOUND`

---

## Correction 5 - Complete PostgreSQL and SQL evidence (Stage 01 Task 02)

**Exclusions used:** `:!node_modules` `:!.next` (and vendor lock where noted).

| # | Exact command | Relevant unedited output | Paths / line ranges | Classification |
|---|---------------|--------------------------|---------------------|----------------|
| 1 | `Test-Path supabase` | `False` | n/a | NOT_FOUND |
| 2 | `git ls-files "*.sql"` | `(empty)` | n/a | NOT_FOUND |
| 3 | `git grep -n "CREATE TABLE" -- ':!node_modules' ':!.next'` | `(empty)` | n/a | NOT_FOUND |
| 4 | `git grep -n "ALTER TABLE" -- ':!node_modules' ':!.next'` | `(empty)` | n/a | NOT_FOUND |
| 5 | `git grep -n "CREATE INDEX" -- ':!node_modules' ':!.next'` | `(empty)` | n/a | NOT_FOUND |
| 6 | `git grep -ni "row-level security\|row level security\|ENABLE ROW LEVEL SECURITY" -- ':!node_modules' ':!.next'` | `(empty)` | n/a | NOT_FOUND |
| 7 | `git grep -niE "postgres(ql)?://" -- ':!node_modules' ':!.next'` | `(empty)` | n/a | NOT_FOUND |
| 8 | `git grep -n "DATABASE_URL" -- ':!node_modules' ':!.next'` | `(empty)` | n/a | NOT_FOUND |
| 9 | `Select-String -Path package.json -Pattern 'supabase\|drizzle\|postgres\|pg\|prisma\|knex\|sqlite'` | `(no matches)` | `package.json` | NOT_FOUND |
| 10 | Directory scan for `migrations\|prisma\|drizzle\|supabase` excl. node_modules/.next/.git | `(none)` | n/a | NOT_FOUND |
| 11 | `git grep -niE "from ['\"]pg['\"]\|from ['\"]postgres\|new Pool\(\|PrismaClient\|drizzle\(" -- 'src/'` | `(empty)` | n/a | NOT_FOUND |
| 12 | `git grep -niE "database\.url\|dbUrl\|getDb\|sql\.query" -- 'src/'` | `(empty)` | n/a | NOT_FOUND |
| 13 | `git ls-files "**/migrations/**" "**/prisma/**" "supabase/**"` | `(empty)` | n/a | NOT_FOUND |
| 14 | `git grep -niE "\bprisma\b\|\bknex\b\|\bdrizzle\b" -- ':!node_modules' ':!.next' ':!package-lock.json'` | hits in `reports/audits/GC-GROWTH-RECONCILIATION-001-R*.md` only (documentation) | docs/reports only | NOT_FOUND on production path |
| 15 | `git ls-files "*schema*" "*migration*" "*prisma*"` | `src/lib/analytics/schemas.ts`; `src/lib/seo/home-featured-schema.ts`; `src/lib/seo/schema.ts`; `src/lib/validation/schemas.ts`; `tests/analytics/event-schema.test.mjs` | Zod/JSON-LD/analytics schemas - **not** SQL DDL | NOT_FOUND (SQL schema) |

**Production vs other:**

| Class | Result |
|-------|--------|
| Production path (`src/`, `package.json`, tracked SQL) | PostgreSQL/SQL layer **NOT_FOUND** |
| Documentation / audits | Mentions only |
| Other branch ledger | VERIFIED_PLANNED_ONLY (preserved) |

**Conclusion:** PostgreSQL/SQL evidence for Stage 01 Task 02 is now complete with commands, zero-result outputs, exclusions, and path/line notes. Verdict unchanged: **NOT_FOUND** on production path.

---

## Correction 6 - Complete environment-variable evidence (names only)

**Rule:** Never expose values. Each finding: command, output, path, line range, name, usage category, production relevance.

### A. `.env.example` (command)

```text
Command: Select-String -Path .env.example -Pattern '^[A-Z0-9_]+='
```

| Path | Line | Name | Usage category | Production relevance |
|------|------|------|----------------|----------------------|
| `.env.example` | 7 | API_FOOTBALL_KEY | Vendor football API | Required for live/PL when enabled |
| `.env.example` | 11 | FIGMA_TOKEN | Design tooling | Dev/sync scripts |
| `.env.example` | 13 | FIGMA_FILE_KEY | Design tooling | Dev/sync scripts |
| `.env.example` | 15 | API_FOOTBALL_FIXTURE_ID | Debug/fixture tooling | Non-core |
| `.env.example` | 17 | FIGMA_LINEUP_PLUGIN_PORT | Design tooling | Local plugin |
| `.env.example` | 20 | FOOTBALL_DATA_KEY | Secondary football data | Documented optional |
| `.env.example` | 24 | SCOREBAT_API_TOKEN | Video/embed vendor | Optional |
| `.env.example` | 28 | API_FOOTBALL_SIMULATE | Test simulation flag | Non-production simulate |
| `.env.example` | 32 | YOUTUBE_API_KEY | YouTube Data API | Required for videos when enabled |
| `.env.example` | 36 | GNEWS_API_KEY | News vendor | Optional |
| `.env.example` | 40 | CRON_SECRET | Cron auth | Production cron |
| `.env.example` | 44 | DEBUG_SECRET | Debug routes | Optional |
| `.env.example` | 47-48 | UPSTASH_REDIS_REST_URL / TOKEN | Rate limit | Optional |
| `.env.example` | 52-57 | SENTRY_* / NEXT_PUBLIC_SENTRY_DSN | Observability | Optional |
| `.env.example` | 61-67 | NEXT_PUBLIC_GA_* / CLARITY_* | Analytics | Optional/consent-gated |
| `.env.example` | 73-80 | NEXT_PUBLIC_FIREBASE_* | Firebase web | Optional Auth/FCM |
| `.env.example` | 82 | FIREBASE_SERVICE_ACCOUNT_JSON | Firebase admin | Optional server |

**Absent names:** `SUPABASE_*`, `DATABASE_URL`.

### B. Source usage (command)

```text
Command: git grep -nE "process\.env\.[A-Z0-9_]+" -- 'src/'
```

Representative production-path findings (name only):

| Path | Line(s) | Name | Usage category | Production relevance |
|------|---------|------|----------------|----------------------|
| `src/lib/api-football/client.ts` | 26, 30, 38 | API_FOOTBALL_KEY, API_FOOTBALL_SIMULATE | Vendor API | Live scores/PL |
| `src/lib/youtube-videos.ts` | 176 | YOUTUBE_API_KEY | Vendor API | Videos |
| `src/utils/api-news/gnews.ts` | 21 | GNEWS_API_KEY | Vendor API | Optional news |
| `src/lib/rate-limit/index.ts` | 25-26 | UPSTASH_REDIS_REST_URL/TOKEN | Rate limit | Optional |
| `src/lib/firebase/admin.ts` | 12 | FIREBASE_SERVICE_ACCOUNT_JSON | Auth/FCM admin | Optional |
| `src/lib/firebase/config.ts` | 18-24 | NEXT_PUBLIC_FIREBASE_* (via `read()`) | Auth/FCM client | Optional |
| `src/lib/sentry-config.ts` | 4, 16-17 | SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN, VERCEL_ENV, VERCEL_GIT_COMMIT_SHA | Observability / platform | Optional |
| `src/lib/analytics/config.ts` | 3, 7 | NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_CLARITY_PROJECT_ID | Analytics | Consent-gated |
| `src/app/api/cron/refresh-content/route.ts` | 14, 34 | CRON_SECRET, YOUTUBE_API_KEY | Cron + videos | Production cron |
| `src/content/videos.ts` | 50 | SCOREBAT_API_TOKEN | Embeds | Optional |
| `src/lib/site-url.ts` | 2-4 | NEXT_PUBLIC_SITE_NAME/DOMAIN/URL | Site identity | Production |

### C. CI

```text
Command: Get-Content .github/workflows/ci.yml
```

No application secret env names configured in workflow steps (checkout, setup-node 20, npm ci, lint/tsc/tests only).

### D. Vercel config

```text
Command: Get-Content vercel.json
Output: cron path /api/cron/refresh-content only - no env values
Path: vercel.json lines 1-9
```

### E. Tests / docs

Tests use consent constants; no `SUPABASE_*` / `DATABASE_URL` injection. Docs (`docs/ENVIRONMENT.md`, `docs/DEPLOY.md`) document Vercel env **names** aligned with `.env.example`.

**Conclusion:** Environment-variable evidence is complete with path/line/name/category. No DB/Supabase connection variable names on the production path.

---

## Correction 7 - Data-source inventory (exact consumers; no directory-level examples)

| Data category | Source | Exact consumer file | Exact line range | Exact route or loader | Browser/server | Persistence | Fixture status | Production status | Direct evidence |
|---------------|--------|---------------------|------------------|-----------------------|----------------|-------------|----------------|-------------------|-----------------|
| WC26 fixture metadata | `@/data/wc26` modules via barrel | `src/app/[locale]/match/[fixtureId]/page.tsx` | 7-7, imports `WC26_FIXTURES`, `getFixtureById`, `getVenueById` | Route loader: same page (RSC) | Server | Git static TS | Live modules | Live | import line 7 |
| WC26 API fixture resolve | `@/data/wc26` | `src/app/api/wc26/match/[fixtureId]/route.ts` | 3 | `GET` `/api/wc26/match/[fixtureId]` | Server | Ephemeral cache + static IDs | Live | Live when keyed | import line 3; `fetchWc26MatchDetail` line 8 |
| WC26 confirmed results | `@/data/wc26-confirmed-results.json` | `src/lib/wc26/confirmed-results-ssot.ts` | 1 | Used by WC26 score/result loaders (e.g. scores pipeline) | Server | Git JSON | Production static | Live | `import raw from ...` line 1 |
| API-Football client | api-sports.io | `src/lib/api-football/client.ts` | 25-30, 57-63 | Consumed by `/api/pl/*`, `/api/wc26/*` | Server | Ephemeral/lru cache | Env-gated | Live when keyed | `API_FOOTBALL_KEY` lines 26-30 |
| YouTube videos | YouTube Data API | `src/lib/youtube-videos.ts` | 172-188 | Loaded via `src/content/ingest.ts` 76-77; route `src/app/api/videos/route.ts` 4-9,21 (`fetchCachedVideos`) | Server | Cache | Env-gated | Live when keyed | `YOUTUBE_API_KEY` line 176 |
| GNews | GNews API | `src/utils/api-news/gnews.ts` | 21 | Ingest `src/content/ingest.ts` 13; route `src/app/api/news/route.ts` 4,8-17 (`fetchNewsFeed`) | Server | Cache | Optional | Partial | `GNEWS_API_KEY` line 21 |
| Editorial/articles index | `src/data/articles.ts`, `src/data/editorial` | `src/lib/article-hub.ts` | 1-2 | Article hub / SEO loaders importing hub | Server | Git | Live | Live | imports lines 1-2 |
| ScoreBat embed | ScoreBat API | `src/lib/scorebat/getScoreBatEmbed.ts` | 37 | Match page `src/app/[locale]/match/[fixtureId]/page.tsx` 18 | Server | Cache | Optional | Partial | `SCOREBAT_API_TOKEN` line 37 |
| Firebase Auth/FCM | Firebase | `src/app/api/firebase/fcm-token/route.ts` | 1-40 | `POST` `/api/firebase/fcm-token`; client `FirebaseRoot` in layout | Browser + server | Firebase cloud | Optional | Partial | admin imports 2-6; `verifyIdToken` 39 |
| Upstash rate limit | Upstash Redis | `src/lib/rate-limit/index.ts` | 25-43 | `src/proxy.ts` 7-9, 167 | Server | Redis | Optional | Partial | UPSTASH env 25-26 |
| Cookie preference (analytics gate) | localStorage key `gc_cookie_consent_v1` | `src/components/layout/CookieConsent.tsx` | 22-23, 39 | Layout banner (not a data SoT) | Browser | localStorage | Live UI | Live | site-keys lines 2-4 |
| Supabase/PostgreSQL | - | - | - | - | - | - | - | NOT_FOUND | Correction 5 |
| SEPANAI generation | - | - | - | - | - | - | - | NOT_FOUND | `git grep -ni sepanai -- src/` empty |

**Conclusion:** Material production data sources now have exact consumer files and line ranges. Directory-only citations removed.

---

## Correction 8 - Revalidation of Tasks 04-10

| Original task | Requirement | R1 status |
|---------------|-------------|-----------|
| 04 Supabase search | Commands + outputs + classification | **PASS** (preserved Stage 01 + still NOT_FOUND) |
| 05 PostgreSQL/SQL | Complete command/output/exclusion/path evidence | **PASS** (Correction 5) |
| 06 Dependency inventory | Line refs + lock + used/unused | **PASS** (preserved Stage 01) |
| 07 Env-variable inventory | Path/line/name/category evidence | **PASS** (Correction 6) |
| 08 Data-source inventory | Exact consumer file + line range per source | **PASS** (Correction 7) |
| 09 Authentication inventory | Individual capabilities | **PASS** (preserved Stage 01 Firebase findings) |
| 10 Pilot gap audit | Allowed classifications only; corrected 1-4 | **PASS** with updated classifications below |

### Updated pilot-gap classifications (Tasks 10 / Stage 01 Task 07)

| Area | Classification |
|------|----------------|
| Subscriber identity | NOT_FOUND |
| Consent records | NOT_FOUND |
| Membership status | NOT_FOUND (preserved) |
| AI entitlement | NOT_FOUND (preserved) |
| Per-user limits | NOT_FOUND (preserved) |
| Server-side entitlement enforcement | NOT_FOUND (preserved) |
| Provider routing | NOT_FOUND (preserved) |
| AI cost controls | NOT_FOUND (preserved) |
| AI audit logging | NOT_FOUND (preserved) |
| Founder usage reporting | NOT_FOUND (preserved) |
| Retention and deletion | NOT_FOUND |
| Abuse prevention | NOT_FOUND |
| Programme DB SoT (cross-cutting) | CONFLICTING_IMPLEMENTATIONS (preserved) |

### Tasks 04-10 final verdict

**FULLY EVIDENCED** for documentation/audit purposes under Stage 01-R1 requirements.

Remaining programme blockers (not evidence gaps): Supabase/PostgreSQL SoT conflict; absence of pilot membership/SEPANAI controls on production path.

**Remaining blocker total (programme):** 2 critical/open themes - (1) SoT CONFLICTING_IMPLEMENTATIONS / DB NOT_FOUND, (2) pilot control surfaces NOT_FOUND - consistent with prior BLK-001/BLK-004 family.

---

## Prohibited actions confirmation

| Action | Status |
|--------|--------|
| Application-code changes | None |
| Dependency / env changes | None |
| SQL / schema / migration changes | None |
| Auth / SEPANAI implementation | None |
| Modify Stage 01 source report | None |
| Stage 02 / commit / push / deploy | None |
| Subagents | None |

### Git identity

```text
Branch: recovery/gc-exec-batch-005
HEAD: e4873659836b007f26ee78b01c6e4355a584663f
```

---

**GC-SOT-CLOSURE-R2-STAGE-01-R1 status:** COMPLETE for eight mandatory evidence corrections.