# GC-HARDEN-BATCHA-R1 — Evidence Report

**DKAMS code:** GC-HARDENING-20260809-BATCHPLAN / Batch A  
**UK date/time:** 2026-08-10 ~15:50 BST  
**Project:** GoalCurrent.live  
**Branch:** `chore/gc-harden-batch-a-20260810`  
**Base:** `origin/main` @ `0138e69` (Community Shield)  
**Status:** IMPLEMENTED — awaiting push/review authorization for private preview  
**Deploy:** NOT performed  
**Merge:** NOT performed  

---

## Scope (items 6, 13, 14, 15, 17 rotation)

| Item | Change | Result |
|------|--------|--------|
| 6 | HSTS on all routes via `next.config.ts` `headers()` `/:path*` | Done |
| 13 | `/preview-pastel` gated out of production (page `notFound` + proxy 404); not deleted | Done — was live 200 on production before this branch |
| 14 | Stale `ar\|fa\|pt` removed from `next.config.ts` locale header sources and `src/proxy.ts` public-asset rewrite | Done — aligned to `en\|es\|it\|de\|fr\|nl` |
| 15 | `CRON_SECRET` row fixed into required-variables table in `docs/ENVIRONMENT.md` | Done |
| 17 (rotation) | `DEBUG_SECRET` set on Vercel Production + Preview (was absent); unauth `/api/debug/*` → 401 confirmed; unit smoke added | Done — secret value not recorded |

---

## Files touched

- `next.config.ts` — HSTS; locale header matchers
- `src/proxy.ts` — locale rewrite; production pastel block
- `src/app/[locale]/preview-pastel/page.tsx` — production gate
- `src/lib/pastel/preview-gate.ts` — shared allow helper
- `docs/ENVIRONMENT.md` — CRON_SECRET table formatting
- `tests/lib/pastel-preview-gate.test.mjs` — gate unit tests
- `tests/lib/be-005-debug-auth.test.mjs` — BATCHA smoke assertion

---

## Pastel production exposure (pre-fix)

Unauthenticated production probe before deploy of this branch:

| URL | HTTP |
|-----|------|
| `https://goalcurrent.live/preview-pastel` | **200** (exposed — confirms gate needed) |
| `https://goalcurrent.live/en/preview-pastel` | 307 |
| Grep of `src/` for inbound product links to pastel | Only `pastelNav.ts` self-nav — unused by main chrome |

Gate keeps route for preview/dev; blocks `VERCEL_ENV=production` and production-like `next start`.

---

## DEBUG_SECRET rotation

| Check | Result |
|-------|--------|
| Pre-state on Vercel | `DEBUG_SECRET` **not listed** in `vercel env ls` |
| Action | Added **Sensitive** `DEBUG_SECRET` to Production and Preview (new random value; not written to git or this report) |
| Live unauth `GET https://goalcurrent.live/api/debug/wc26` | **401** `unauthorized` |
| Live unauth `GET https://goalcurrent.live/api/debug/api-football` | **401** `unauthorized` |
| Unit smoke | `BATCHA smoke: missing DEBUG_SECRET never authorizes either probe header` |

Note: authorised debug access with the new secret requires a redeploy that loads the env — **not authorised in this batch**. Unauth fail-closed behaviour does not depend on the secret being present.

`.env.example` still contains the false “falls back to CRON_SECRET” claim — owned by **Batch B**, left untouched here.

---

## Verification (local)

| Check | Result |
|-------|--------|
| `npm run test:unit` | **353/353** pass |
| `npm run lint` | **29 errors / 53 warnings** (error baseline unchanged; +1 warning vs prior 52 note — no new errors) |

---

## Out of scope / follow-ups

- Home SSR R4 rebase/merge (cleared separately; not this batch)
- Batch B+ (fail-closed Upstash, CSP, etc.)
- Deploy / merge of Batch A — needs Explicit Founder Approval after protected private preview
- Optional: rotate Vercel automation protection-bypass from Batch G probe (unrelated)

---

**NOT MERGED AND NOT PUBLICLY DEPLOYED.**

**GC-HARDEN-BATCHA-R1 status:** READY FOR REVIEW (pending push)