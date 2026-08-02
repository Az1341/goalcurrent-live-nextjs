# GC-BACKEND-TOOLING-AUDIT-002

**Project:** GoalCurrent  
**Report code:** GC-BACKEND-TOOLING-AUDIT-002  
**Type:** Backend security / quality tooling audit (SonarQube, Snyk, Aikido, Sentry)  
**Mode:** AUDIT + runtime probe (instrumentation left in place)  
**Date:** 01/08/2026  
**Runtime log:** `.cursor/debug-2fc2ef.log` (session `2fc2ef`)

---

## 1. Tool execution matrix

| Tool | Executed | Result |
|------|----------|--------|
| SonarQube / SonarCloud | No | `@sonar/scan` present; `SONAR_TOKEN` / `SONAR_HOST_URL` absent |
| Snyk | Attempted | CLI 1.1306.2 → `SNYK-0005` 401 (auth required) |
| Aikido Security | No | No CLI, config, or MCP in workspace |
| Sentry | Code + runtime | SDK wired; **DSN unset locally → enabled:false** |
| npm audit (dep stand-in) | Yes | 13 vulns (6 high, 7 moderate) |
| ESLint + security plugin | Yes | 98 problems (39 errors, 59 warnings); API surface 0 errors |
| Docker / container scan | N/A | No Dockerfile or compose |

---

## 2. Hypothesis results (runtime)

| ID | Hypothesis | Verdict | Evidence |
|----|------------|---------|----------|
| H1 | Rate limit falls back to in-memory without Upstash | **CONFIRMED** | `rate_limit_fallback_in_memory` with `hasUpstashUrl:false`, `hasUpstashToken:false` on `/api/pl/fixtures`, `/api/unl/fixtures`, `/api/pl/match/*`, etc. |
| H2 | Public upstream APIs callable without auth | **CONFIRMED** | `public_api_hit_unauthenticated` `hasAuthHeader:false`; HTTP 200; `fixtureCount:380` |
| H3 | Sentry disabled when DSN unset | **CONFIRMED** | `sentry_init_options` `enabled:false`, `hasDsn:false`, `environment:development` |
| H4 | API failures go through `captureRouteError` | **INCONCLUSIVE** | No failing route in this probe (fixtures 200); path exists in code |
| H5 | Debug routes authorize in development without DEBUG_SECRET | **CONFIRMED** | `debug_route_auth_check` `authorized:true`, `debugSecretConfigured:false`, `nodeEnv:development`; HTTP **400** (auth passed, query invalid) not 401 |

---

## 3. Dependency findings (npm audit)

High: `next` (&lt;16.2.11 — middleware/proxy bypass + Server Actions DoS), `sharp` (&lt;0.35.0), `postcss`, `brace-expansion`, `fast-uri`, `fast-xml-parser`  
Moderate: `uuid` / `firebase-admin` chain, `protobufjs`, related Google Cloud clients  

No Dockerfile → Snyk container scan not applicable.

---

## 4. Sentry findings

- Init redacts `authorization`, `cookie`, `x-cron-secret`, `x-debug-secret` (BE-009 remediated in code).
- Local/runtime: crashes will **not** ship to Sentry until DSN is configured.
- `captureRouteError` calls `Sentry.captureException` but is gated by `enabled:false` when DSN missing.

---

## 5. Priority risk register (this run)

| ID | Title | Sev | Confidence |
|----|-------|-----|------------|
| BA-001 | In-memory rate limit (no Upstash) on all `/api/*` | CRITICAL | High |
| BA-002 | Unauthenticated public PL/UNL/UCL/FA Cup APIs | CRITICAL | High |
| BA-003 | Debug API authorized in development without secret | MAJOR | High |
| BA-004 | Sentry telemetry off (no DSN) — blind to prod-like local crashes | MAJOR | High |
| BA-005 | Vulnerable deps (`next`, `sharp`, …) | HIGH | High (npm audit) |
| BA-006 | Full Sonar / Snyk / Aikido scans blocked | INFO | High |

---

## 6. Unlock remaining tools

1. **Sonar:** set `SONAR_HOST_URL` + `SONAR_TOKEN` (or SonarCloud project key), then `npx @sonar/scan`
2. **Snyk:** run `snyk auth`, then `npx snyk test` / `snyk code test`
3. **Aikido:** install CLI or connect repo in Aikido dashboard; no in-repo integration today
4. **Sentry:** set `SENTRY_DSN` (and/or `NEXT_PUBLIC_SENTRY_DSN`) in Netlify/preview env

---

## 7. Instrumentation note

Debug fetch logs remain in:

- `src/lib/rate-limit/index.ts`
- `src/lib/sentry-config.ts`
- `src/lib/log.ts`
- `src/app/api/pl/fixtures/route.ts`
- `src/app/api/debug/api-football/route.ts`

Remove after founder confirms audit closed or remediations verified.
