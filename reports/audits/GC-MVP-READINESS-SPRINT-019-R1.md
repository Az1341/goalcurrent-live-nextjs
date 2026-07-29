# GC-MVP-READINESS-SPRINT-019 - R1

**Date/time:** 2026-07-29 ~13:40-15:00 BST
**Task ID:** GC-MVP-READINESS-SPRINT-019
**Title:** Sprint 018 reconciliation + BE-011 knockout diagnostic fetch-log strip
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** c77ac0c1fe33bbf678fe3d59e5b23e14cd3323b0
**Phase-1 reconciliation commit:** 58443a749cd78aec90c885b824d77d97d1203c4f
**Implementation commit:** 76a4c60381d4f9f981aa9fb6db03a9f10fd48077
**Evidence commit:** PENDING_EVIDENCE_SHA
**Ending HEAD:** PENDING_ENDING_HEAD

---

## 1. Sprint 018 reconciliation (Phase 1)

| Check | Result |
|---|---|
| Branch | `recovery/gc-exec-batch-005` — matched |
| Required start | `c77ac0c1fe33bbf678fe3d59e5b23e14cd3323b0` — matched |
| Tracked dirty at start | Clean (protected untracked only) |
| Ahead of origin (at start) | 76 |
| Protected untracked | `.mcp.json`, SoT drafts/audits, `scripts/_fix_closure.py`, `scripts/_mvp_route_discover.py` — untouched |

### Sprint 018 first-parent chain (full SHAs)

| Full SHA | Parent | Subject | Files | Classification |
|---|---|---|---|---|
| `8696438538e0b78e94f3b3d45c400b0fa74289b9` | (prior) | docs(audit): record Sprint 017 final SHA-fill tip | S017 R1 | Docs (required 018 start) |
| `01874bec0192a1d9a5143be00233856df0a59ad1` | `8696438…` | docs(audit): reconcile Sprint 017 ending HEAD to tip 8696438 | S017 R1 | Documentation |
| `ff0c158c0824bdb88ff0f9f0415b82cdd8b8b6bc` | `01874be…` | fix(perf): bound WC26 LiveScore top-scorers day fan-out (BE-010) | `livescore.ts`, `be-010-*.test.mjs` | Implementation + tests |
| `609e4dc17d064e3b06d398df5ec98505c67cf8e3` | `ff0c158…` | docs(audit): record GC-MVP-READINESS-SPRINT-018 evidence pack | S018 R1 | Evidence |
| `e29736a9a7335aa7f0fae67ce9e5dde0446106fd` | `609e4dc…` | docs(audit): fill Sprint 018 evidence ending HEAD | S018 R1 | Documentation |
| `b9aa8d8f45f52989f278bd0dd100e6b7c4c4e943` | `e29736a…` | docs(audit): record Sprint 018 final SHA-fill tip | S018 R1 | Documentation |
| `c77ac0c1fe33bbf678fe3d59e5b23e14cd3323b0` | `b9aa8d8…` | docs(audit): reconcile Sprint 018 ending HEAD to tip b9aa8d8 | S018 R1 | Documentation |

### Post-BE-010 implementation file check

`git diff --name-only ff0c158…c77ac0c -- src tests` → **empty**.

### Sprint 018 evidence accuracy

S018 R1 correctly records implementation `ff0c158…`, evidence `609e4dc…`, budgets (40/104/144), unit **221/221**, lint **33/56**, Playwright **6/6**. Ending HEAD field was stale at `b9aa8d8…` relative to tip `c77ac0c…`.

### Phase-1 correction this sprint

`58443a749cd78aec90c885b824d77d97d1203c4f` — docs only: Ending HEAD → `c77ac0c…`. No application/test change.

---

## 2. Canonical BE-011

**BE-011 — Knockout API returns diagnostic fetch logs** (MINOR, XS)

**Location:** `src/app/api/wc26/knockout-fixtures/route.ts` (+ producer `src/lib/server/wc26-knockout-fixtures.ts`)

**Root cause:** Public JSON included `logs: Wc26KnockoutFetchLog[]` containing provider query `url`, API fixture ids, local fixture ids, and response counts.

**Isolation:** **PROCEED** — strip public field; keep server `console.info` diagnostics. No BE-001/BE-003, provider redesign, or product feature break. No browser consumer of `logs` exists.

---

## 3. Caller and response-path inventory

| Entry | Auth | Role |
|---|---|---|
| `GET /api/wc26/knockout-fixtures` | Public | Sole public surface returning knockout API fixtures |
| `GET …?round=` | Public | Single-round variant |
| `fetchWc26KnockoutRound` / `fetchWc26KnockoutFixtures` | Server | API-Football fetch + server-side `logKnockoutFetch` |
| Browser live hooks | N/A | **Do not** call this route (`LIVE_API_PATHS` has no knockout-fixtures entry) |

---

## 4. Field classification

| Field | Class |
|---|---|
| `fixtures[]` (ids, teams, kickoff, venue, round, matchNumber) | Required product data |
| `source` (`api-football` \| `static`) | Safe public metadata |
| `message` / `error` (sanitised codes via `apiFootballErrorMessage`) | Safe public metadata |
| `logs[]` (`url`, `fixtureIds`, `localFixtureIds`, `responseCount`, `round`) | **Internal diagnostic / potentially sensitive recon** — **removed from public** |

---

## 5. Before / after (synthetic)

**Before (success):**

```json
{
  "fixtures": [{ "apiFixtureId": 900073, "fixtureId": "fixture-073", "matchNumber": 73, "homeTeam": "A", "awayTeam": "B" }],
  "logs": [{ "round": "Round of 32", "url": "/fixtures?league=1&season=2026&round=Round+of+32", "fixtureIds": [900073], "localFixtureIds": ["fixture-073"], "responseCount": 1 }],
  "source": "api-football"
}
```

**After (success):**

```json
{
  "fixtures": [{ "apiFixtureId": 900073, "fixtureId": "fixture-073", "matchNumber": 73, "homeTeam": "A", "awayTeam": "B" }],
  "source": "api-football"
}
```

**After (failure):** `{ "fixtures": [], "source": "static", "error": "<code>", "message": "<client-safe>" }` — no `logs`, no raw provider text.

Server still emits `[wc26/knockout-fixtures] …` via `console.info` / `console.warn` (message-only on fallback failure).

---

## 6. Exact changed files

### Phase-1 docs

- `reports/audits/GC-MVP-READINESS-SPRINT-018-R1.md`

### Implementation + tests (`76a4c60…`)

- `src/app/api/wc26/knockout-fixtures/route.ts`
- `src/lib/server/wc26-knockout-fixtures.ts`
- `tests/lib/be-011-knockout-fetch-logs.test.mjs`

### Evidence (this file)

- `reports/audits/GC-MVP-READINESS-SPRINT-019-R1.md`

---

## 7. Test-to-behaviour matrix

| Test | Behaviour |
|---|---|
| Route source omits `logs:` | No public serialisation |
| Fetch helpers return fixtures only | Server-side log retained |
| Unconfigured / empty / round / failure / success GET | No diagnostic leak |
| Public key allowlist | Only fixtures/source/message/error |
| No simulate/debug restore flags in route | Dev flags cannot re-expose |
| BE-010 / 009 / 008 / 007 / 006 regressions | Adjacent |
| Full unit | 235/235 |
| Playwright BE-006/007/008 × 2 viewports | 6/6 |

Dedicated BE-011 Playwright: **N/A** — no browser consumer of this route; adjacent homepage security regressions cover UX.

---

## 8. Gate results

| Gate | Result |
|---|---|
| Focused BE-011 unit | **14/14 PASS** |
| Full unit suite | **235/235 PASS** (221 → 235 = +14) |
| Playwright BE-008/007/006 | **6/6 PASS** (390×844, 1440×900) |
| Typecheck | **PASS** |
| Scoped lint | **0 errors** |
| Full lint | **33 errors / 56 warnings** |
| Production build | **PASS** (Playwright webServer) |

---

## 9. Impact assessment

| Area | Effect |
|---|---|
| Knockout accuracy / bracket | Untouched (mapping unchanged) |
| Fixture / team / score identity | Preserved in `fixtures[]` |
| Match states / penalties | Untouched |
| Public API compatibility | `logs` removed (unused by clients) |
| Diagnostic / raw-error exposure | Reduced — public logs gone; errors remain sanitised codes |
| Auth / secrets | Untouched |
| Mobile / desktop UX | Untouched (Playwright PASS) |
| A11y / locale / SEO / sitemap | Untouched |
| Polling / fan-out / cache / Vercel compute | Untouched |
| Private-preview | Untouched |
| BE-001 / BE-003 / BE-010 | Not changed |

---

## 10. Remaining limitations

- BE-001, BE-003 and other open register findings remain.
- Server console still logs relative provider paths and response JSON (process-local only).
- Next register-ordered finding not started.

---

## 11. Confirmations

- Exactly one finding changed: **BE-011**.
- Nothing pushed, merged, deployed, or publicly released.
- No history rewrite, dependency/lockfile, env/Vercel, or competition expansion.

---

**GC-MVP-READINESS-SPRINT-019 status:** COMPLETE
