# GC-RUNTIME-SECURITY-RECONCILIATION-001

**Project:** GoalCurrent  
**Report code:** GC-RUNTIME-SECURITY-RECONCILIATION-001  
**Type:** Runtime security reconciliation (tooling audit + live probes vs canonical register)  
**Mode:** RECONCILIATION ONLY — no remediation authorised by this document  
**Date:** 01/08/2026 (BST)  
**Session:** `2fc2ef`  
**Runtime log:** `.cursor/debug-2fc2ef.log`  
**Sibling audit:** `reports/audits/GC-BACKEND-TOOLING-AUDIT-002.md`

---

## 0. Git gate

| # | Item | Evidence |
|---|------|----------|
| 1 | Repository | `goalcurrent-live-nextjs` |
| 2 | Branch | `recovery/gc-exec-batch-005` |
| 3 | Local HEAD | `5f878a22ced29d467d1c23592240e709b769f7c4` |
| 4 | `origin/main` | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| 5 | Working tree | Dirty (product + audit instrumentation + untracked reports) |
| 6 | Gate note | Reconciliation records runtime evidence on the current tree; does not claim a clean audited SHA |

---

## 1. Purpose

Reconcile:

1. Canonical backend findings from `GC-FULLSTACK-STATIC-AUDIT-001-R2.md`
2. Sprint closures (BE-005…BE-009 etc.) from MVP readiness evidence
3. Runtime hypotheses H1–H5 and BA-001…BA-006 from `GC-BACKEND-TOOLING-AUDIT-002.md`

**Outcome:** single disposition table — OPEN / CLOSED / CONDITIONAL / RESIDUAL — with runtime proof where available.

---

## 2. Tooling status (reconciled)

| Tool | Disposition | Notes |
|------|-------------|-------|
| SonarQube | **NOT EXECUTED** | No `SONAR_TOKEN` / `SONAR_HOST_URL` |
| Snyk | **BLOCKED** | CLI present; `SNYK-0005` 401 |
| Aikido | **UNAVAILABLE** | No project integration |
| Sentry SDK | **WIRED** | Redaction includes cron/debug headers (BE-009 closed in code) |
| Sentry delivery (local) | **DISABLED** | Runtime: `enabled:false`, `hasDsn:false` |
| npm audit | **EXECUTED** | 13 vulns (6 high / 7 moderate) |
| ESLint security | **EXECUTED** | Project 98 problems; API surface 0 errors |
| Docker/container | **N/A** | No Dockerfile |

---

## 3. Runtime hypothesis → canonical mapping

| Runtime ID | Hypothesis | Verdict | Maps to canonical | Disposition |
|------------|------------|---------|-------------------|-------------|
| H1 | In-memory RL when Upstash unset | **CONFIRMED** | BE-002, ENV-001 | **OPEN — LOCAL ENV PROVED**; prod still conditional |
| H2 | Public APIs without auth | **CONFIRMED** | BE-001 (+ expanded UNL/UCL/FA Cup) | **OPEN** (accepted product model + abuse risk) |
| H3 | Sentry off without DSN | **CONFIRMED** | ENV (ops) / BE-009 context | **OPEN locally**; prod DSN not verified here |
| H4 | Errors via `captureRouteError` | **INCONCLUSIVE** | Observability path | Path exists; not exercised |
| H5 | Debug authorised in development without `DEBUG_SECRET` | **CONFIRMED** | Residual of BE-005 (dev openness) | **RESIDUAL OPEN** in development |

### BA risk IDs (tooling audit) → register

| BA ID | Title | Severity (BA-002 run) | Canonical link | Reconciled severity |
|-------|-------|----------------------|----------------|---------------------|
| BA-001 | In-memory rate limit | CRITICAL | BE-002 | **CONDITIONAL** for prod (R2); **CONFIRMED active** on this local runtime |
| BA-002 | Unauthenticated public match APIs | CRITICAL | BE-001 | **MAJOR** per R2 (authless by design); criticality still env-bound via BE-002/ENV-001 |
| BA-003 | Debug open in development | MAJOR | BE-005 residual | **MAJOR residual** — original CRON_SECRET coupling **CLOSED**; dev openness **still true** |
| BA-004 | Sentry DSN unset | MAJOR | Ops / ENV | **LOCAL CONFIRMED**; preview/prod DSN not proven |
| BA-005 | Vulnerable dependencies | HIGH | New (post-R2) | **OPEN** — npm audit evidence |
| BA-006 | Sonar/Snyk/Aikido blocked | INFO | Tooling | **OPEN** — credentials required |

**Severity discipline:** R2 correctly classified BE-002 as env-conditional. Runtime session upgrades local certainty only. Do not treat BA-001/BA-002 local CRITICAL labels as proven production CRITICAL without Netlify/Upstash/Sentry env proof.

---

## 4. Canonical BE register — post-runtime reconciliation

Sources: R2 wording; Sprint 014–017 closure notes; runtime session `2fc2ef`.

| ID | R2 title (short) | Sprint status (prior) | Runtime 01/08/2026 | Reconciled status |
|----|------------------|----------------------|--------------------|-------------------|
| BE-001 | Unauthenticated upstream fan-out | OPEN | H2: `/api/pl/fixtures` 200, `hasAuthHeader:false`, 380 fixtures; also `/api/unl/fixtures` 200 | **OPEN** — confirmed reachable; surface expanded (UNL/UCL/FA Cup) |
| BE-002 | RL falls back to memory without Upstash | CONDITIONAL | H1: `hasUpstashUrl:false`, `hasUpstashToken:false`, `rate_limit_fallback_in_memory` on upstream paths | **OPEN locally (proved)**; **prod CONDITIONAL** until Upstash proof |
| BE-003 | SSR bypasses `/api` RL | OPEN | Not re-probed this session | **OPEN** (unchanged) |
| BE-004 | WC26 apiFixtureId unbound | CLOSED (prior sprint) | Not re-probed | **CLOSED** (prior evidence; not reopened) |
| BE-005 | Debug auth accepts CRON_SECRET | CLOSED (Sprint ~014) | Code: `authorizeDebugAccess` uses DEBUG_SECRET only; H5: `authorized:true` when secret unset in `development` | **CLOSED for cron coupling**; **RESIDUAL** — development open-if-unset |
| BE-006 | Provider errors to clients | CLOSED (+ correction) | Not re-probed | **CLOSED** (prior) |
| BE-007 | FCM without idToken | CLOSED (Sprint 015) | Code still requires idToken | **CLOSED** (prior; not reopened) |
| BE-008 | ScoreBat token in query | CLOSED (Sprint 016) | Not re-probed | **CLOSED** (prior) |
| BE-009 | Sentry omits custom secret headers | CLOSED (Sprint 017) | Code redacts `x-cron-secret` / `x-debug-secret`; H3: Sentry disabled locally | **CLOSED** (code); delivery gated by DSN |
| BE-010 | Top-scorers fan-out | CLOSED / addressed prior | Not re-probed | **Prior disposition retained** |
| BE-011 | Knockout diagnostic logs | CLOSED (Sprint 019) | Not re-probed | **CLOSED** (prior) |
| BE-012 | Stale cache masks failures | CLOSED (Sprint 020) | Not re-probed | **CLOSED** (prior) |
| ENV-001 | Prod quota abuse unproven | CONDITIONAL | Local Upstash absent; prod not inspected | **STILL CONDITIONAL** |

---

## 5. Cited runtime evidence (NDJSON)

Log file: `.cursor/debug-2fc2ef.log`

| Hypothesis | Representative message / data |
|------------|-------------------------------|
| H1 | `rate_limit_fallback_in_memory` — `pathname:"/api/pl/fixtures"`, `upstreamPath:true`, Upstash flags false |
| H2 | `public_api_hit_unauthenticated` — `hasAuthHeader:false`; `public_api_upstream_success` — `fixtureCount:380` |
| H3 | `sentry_init_options` — `enabled:false`, `hasDsn:false`, `environment:"development"` |
| H5 | `debug_route_auth_check` — `authorized:true`, `debugSecretConfigured:false`, `nodeEnv:"development"` |
| HTTP | `GET /api/pl/fixtures` 200; `GET /api/unl/fixtures` 200; `GET /api/debug/api-football` **400** (auth passed, query invalid — not 401) |

Note: one early H1 line recorded pathname `"/api/pl/fixtures,"` (trailing comma) — proxy quirk; later lines use clean `/api/pl/fixtures`.

---

## 6. New findings introduced by this reconciliation

| ID | Title | Sev | Notes |
|----|-------|-----|-------|
| RSR-001 | Competition API surface expanded without distributed RL proof | MAJOR | UNL/UCL/FA Cup under same BE-001/BE-002 pattern |
| RSR-002 | Local Upstash unset → BE-002 active on every `/api/*` hit | MAJOR (local) | Proves soft-fallback path; not prod proof |
| RSR-003 | Development debug openness without `DEBUG_SECRET` | MAJOR | Distinct from closed CRON_SECRET acceptance |
| RSR-004 | npm audit high vulns (`next` &lt;16.2.11, `sharp`, …) | HIGH | Not in R2 register; track as dep hygiene |
| RSR-005 | Observability blind when DSN unset | MAJOR (local/ops) | Crashes won’t ship; H4 path untested |

---

## 7. What is NOT claimed

- Production Upstash / Sentry / Netlify secrets were **not** inspected.
- SonarQube, Snyk authenticated scan, and Aikido results were **not** obtained.
- BA “CRITICAL” labels do **not** override R2’s env-conditional production classification without ops proof.
- No push, merge, deploy, or founder approval implied.

---

## 8. Recommended next authorised actions (founder choose)

1. **Ops proof pack:** document preview/prod `UPSTASH_*` + `SENTRY_DSN` presence (values redacted) → close or escalate ENV-001/BE-002.
2. **Hardening sprint (isolated):** fail-closed RL outside development when Upstash missing (addresses RSR-002/BE-002).
3. **Debug residual:** refuse debug routes unless `DEBUG_SECRET` set even in development, or bind to explicit `ALLOW_INSECURE_DEBUG=1` (RSR-003).
4. **Deps:** plan `next` ≥ 16.2.11 + `sharp` bump under private-preview policy (RSR-004).
5. **Unlock scans:** Sonar token/host, `snyk auth`, optional Aikido project.
6. **Cleanup:** remove session `2fc2ef` debug instrumentation after founder acknowledges reconciliation.

---

## 9. Completion verdict

**COMPLETE — RECONCILIATION ONLY.**

Runtime probes **confirm** BE-001 reachability and **prove** BE-002 fallback on the local tree. Original BE-005 cron coupling remains **CLOSED**; development-open residual is recorded as **RSR-003**. Tooling gaps (Sonar/Snyk/Aikido) and dependency vulns are logged without remediation in this task.

**GC-RUNTIME-SECURITY-RECONCILIATION-001 status:** PASSED (as reconciliation deliverable)
