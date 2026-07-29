# GC-MVP-READINESS-SPRINT-013-AUDIT-CLOSURE-R1

**Date/time:** 2026-07-29 ~10:00–10:30 BST
**Task ID:** GC-MVP-READINESS-SPRINT-013-AUDIT-CLOSURE-R1
**Type:** Evidence-only audit closure (no application/test/config changes)
**Branch:** recovery/gc-exec-batch-005
**Starting / ending HEAD (pre-docs):** 207ae7dfde41342374917799fd55d28e5e3f8494
**Status:** COMPLETE

---

## 1. Repository gate

| Check | Result |
|---|---|
| Branch | `recovery/gc-exec-batch-005` |
| HEAD at audit start | `207ae7dfde41342374917799fd55d28e5e3f8494` |
| Sprint 013 impl | `a2ca91cc7e0b65a2d2f1dff5274f20035292fd77` |
| Sprint 013 evidence | `207ae7dfde41342374917799fd55d28e5e3f8494` |
| Tracked dirty app tree | Clean (protected untracked only) |
| Ahead of origin | 46 commits (local only; nothing pushed) |

---

## 2. Commit file lists

### Implementation `a2ca91cc7e0b65a2d2f1dff5274f20035292fd77`

| Status | Path |
|---|---|
| M | `src/lib/server/cache.ts` |
| A | `tests/e2e/be-005-debug-auth.spec.ts` |
| A | `tests/lib/be-005-debug-auth.test.mjs` |

### Evidence `207ae7dfde41342374917799fd55d28e5e3f8494`

| Status | Path |
|---|---|
| A | `reports/audits/GC-MVP-READINESS-SPRINT-013-R1.md` |

---

## 3. CRON_SECRET fallback proof (cache.ts)

Before (removed):

```ts
const secret =
  process.env.DEBUG_SECRET?.trim() || process.env.CRON_SECRET?.trim();
```

After (current):

- `authorizeDebugAccess` reads only the supplied `debugSecret` option.
- `isDebugAuthorized` passes only `process.env.DEBUG_SECRET` (never `process.env.CRON_SECRET`).
- Authorization headers checked: `Authorization: Bearer <DEBUG_SECRET>` or `x-debug-secret`.
- `x-cron-secret` is not consulted by debug auth.
- Source unit asserts `process.env.CRON_SECRET` and `x-cron-secret` are absent from the auth functions.

Therefore CRON_SECRET cannot be used as an env fallback for debug authentication.

Cron routes remain separately gated in `src/app/api/cron/refresh-content/route.ts` via `CRON_SECRET` / `x-cron-secret` (unchanged; out of BE-005 scope).

---

## 4. Authentication-case evidence matrix

| Case | Required behaviour | Unit evidence | Playwright evidence |
|---|---|---|---|
| DEBUG_SECRET absent and CRON present (token/env-role) | Debug denied in production | `BE-005: CRON_SECRET never authorizes` with `debugSecret: undefined` + Bearer cron; source never reads `process.env.CRON_SECRET` | Unauth/cron probes return 401 on live server |
| Cron Bearer token supplied | Debug denied unless value equals DEBUG_SECRET | Bearer `cron-secret` with DEBUG set → false; Bearer cron with DEBUG absent → false | `Authorization: Bearer cron-secret-probe` → 401 |
| `x-cron-secret` supplied | Debug denied | Source forbids `x-cron-secret` in debug auth | `x-cron-secret: cron-secret-probe` → 401 on `/api/debug/wc26` and `/api/debug/api-football` |
| Correct DEBUG_SECRET | Debug allowed | Bearer `debug-only` and `x-debug-secret: debug-only` → true | Not exercised with a real production secret (by design); unit is authoritative |
| Incorrect token | Debug denied | Bearer/header mismatch cases → false | Probe tokens → 401 |
| No token | Debug denied outside development-open path | production + no headers + undefined DEBUG → false | `GET /api/debug/wc26` unauthenticated → 401 |
| Empty DEBUG_SECRET | Fail closed in production; development open only | `debugSecret: ""` → development true; undefined + production false (`!debugSecret` treats empty as absent) | Production webServer unauth → 401 |

---

## 5. Equal-secret configuration assessment

If an operator sets `DEBUG_SECRET` and `CRON_SECRET` to the **same string**, that shared string can authenticate:

- debug routes (because it matches `DEBUG_SECRET`), and
- cron routes (because it matches `CRON_SECRET`).

This is **not** a CRON fallback bug; it is value equality. BE-005 does not compare the two env vars.

**Configuration limitation (explicit):** production must use **distinct** `DEBUG_SECRET` and `CRON_SECRET` values. No environment configuration was changed by this audit.

Sprint 013 R1 already noted: “Production requires a distinct DEBUG_SECRET for debug routes.”

---

## 6. Secret-exposure assessment

| Surface | Assessment |
|---|---|
| Application logs in debug/cron auth helpers | No secret values logged by `authorizeDebugAccess` / `isDebugAuthorized` |
| Client API responses | Unauthorized returns generic `Unauthorized.` via `respondError` (no secret echo) |
| Client bundle | `isDebugAuthorized` only imported by server `app/api/debug/**` routes; not imported under `src/components` |
| Unit/Playwright fixtures | Use placeholder labels (`debug-only`, `cron-secret`, `cron-secret-probe`) — not production credentials |
| Evidence reports | Name env var keys only; no secret values |

---

## 7. Fail-closed confirmation

When `DEBUG_SECRET` is absent or empty (`trim()` → falsy):

- `nodeEnv === "development"` → open (local DX only)
- otherwise → **denied** (fail closed)

Unit: production + undefined DEBUG → false. Empty string uses the same `!debugSecret` branch.

---

## 8. Gate results (reconfirmed)

| Gate | Result |
|---|---|
| Full lint (this audit) | **33 errors / 57 warnings** (baseline held) |
| Push / merge / deploy | None — branch ahead of origin by 46; local only |
| Application code changed this task | **No** |
| Tests changed this task | **No** |

---

## 9. Corrections applied to Sprint 013 evidence

Original R1 left evidence/ending HEAD as placeholders. This audit:

1. Fills `Evidence commit` / `Ending HEAD` with `207ae7dfde41342374917799fd55d28e5e3f8494` in `GC-MVP-READINESS-SPRINT-013-R1.md`.
2. Adds pointer to this audit-closure report.
3. Records the authentication matrix, equal-secret limitation, secret-exposure and fail-closed proofs above.

---

## 10. Prohibited actions confirmation

NO APPLICATION-CODE CHANGE. NO TEST CHANGE. NO NEW FINDING. NO LINT CLEANUP. NO ENVIRONMENT OR VERCEL CHANGE. NO DEPENDENCY OR LOCKFILE CHANGE. NO PUSH. NO MERGE. NO DEPLOYMENT. NO PUBLIC RELEASE. NO SPRINT 014.

---

**GC-MVP-READINESS-SPRINT-013-AUDIT-CLOSURE-R1 status:** COMPLETE
