# GC-MVP-READINESS-SPRINT-018 - R1

**Date/time:** 2026-07-29 ~12:51-14:30 BST
**Task ID:** GC-MVP-READINESS-SPRINT-018
**Title:** Sprint 017 reconciliation + BE-010 LiveScore day fan-out bound
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 8696438538e0b78e94f3b3d45c400b0fa74289b9
**Phase-1 reconciliation commit:** 01874bec0192a1d9a5143be00233856df0a59ad1
**Implementation commit:** ff0c158c0824bdb88ff0f9f0415b82cdd8b8b6bc
**Evidence commit:** PENDING_EVIDENCE_SHA
**Ending HEAD:** PENDING_ENDING_HEAD

---

## 1. Sprint 017 reconciliation (Phase 1)

| Check | Result |
|---|---|
| Branch | `recovery/gc-exec-batch-005` — matched |
| Required start | `8696438538e0b78e94f3b3d45c400b0fa74289b9` — matched |
| Tracked dirty at start | Clean (protected untracked only) |
| Ahead of origin (at start) | 70 |
| Protected untracked | `.mcp.json`, SoT drafts/audits, `scripts/_fix_closure.py`, `scripts/_mvp_route_discover.py` — untouched |

### Sprint 017 chain (confirmed)

| Full SHA | Subject | Files | Role |
|---|---|---|---|
| `b5d80aa9b671ebaa683d6a8eeec42c2d5fe1946b` | docs(audit): fill Sprint 016 evidence ending HEAD | S016 R1 | Required 017 start base tip |
| `373372123209fec00f06269ac48ae46c3efaf2b1` | docs(audit): reconcile Sprint 016 ending HEAD to tip b5d80aa | S016 R1 | Phase-1 docs |
| `b53adad5b3723ce3a55ba87a12fe147d39a00fe4` | fix(security): redact cron and debug secrets in Sentry beforeSend (BE-009) | `sentry-config.ts`, `be-009-*.test.mjs` | Implementation + tests |
| `e99bd06d82a384c37c3b338fc259994aae99a3e8` | docs(audit): record GC-MVP-READINESS-SPRINT-017 evidence pack | S017 R1 | Evidence |
| `8696438538e0b78e94f3b3d45c400b0fa74289b9` | docs(audit): record Sprint 017 final SHA-fill tip | S017 R1 | Docs-only tip |

### Post-BE-009 implementation file check

`git diff --name-only b53adad5…8696438 -- src tests` → **empty**. No `src/**` or `tests/**` change after BE-009 impl.

### Phase-1 correction this sprint

`01874bec0192a1d9a5143be00233856df0a59ad1` — docs only: align Sprint 017 Ending HEAD / SHA-fill tip to canonical tip `8696438…`. No application/test change.

---

## 2. Canonical BE-010 evidence

**BE-010 — Top-scorers Tier-2 LiveScore day fan-out** (MAJOR, M)

**Location:** `src/lib/server/wc26-top-scorers-sources/livescore.ts` (+ pipeline orchestration in `wc26-top-scorers.ts` / `sources/index.ts` — read-only for isolation)

**Root cause:** `tournamentDateKeys()` walked every UTC day from 2026-06-11 to `now` with no tournament-end cap, no day budget, no incident budget, `revalidate: 0`, and no in-flight coalescing / scoped result cache. On Tier-1 empty, one GoalCurrent request could emit one LiveScore date fetch per calendar day plus one incidents fetch per finished WC match found.

---

## 3. Caller and request-path inventory

| Entry | Auth | Role |
|---|---|---|
| `GET /api/wc26/top-scorers` | Public | Primary API; LRU `getCached`/`setCached` on full response (`s-maxage=300`) |
| `useLiveTopScorers` / `useWc26TopScorers` | Browser → public API | Client SWR to `/api/wc26/top-scorers` |
| `Wc26TopScorers`, `GroupHubContent` | Browser | UI consumers of live hook |
| `GET /api/debug/wc26` | Debug secret | Calls pipeline + `fetchWc26TopScorersSourceBreakdown` (includes LiveScore) |
| `fetchWc26TopScorers` | Server | Tier-1 API-Football; on empty scorers → Tier-2 multi-source |
| `fetchMultiSourceWc26TopScorers` | Server | Parallel ScoreBat + ESPN + **LiveScore** |
| `fetchLiveScoreWc26ScorerGoals` | Server | **Only LiveScore consumer in repo** (date fan-out + incidents) |

**Tier-1:** API-Football topscorers / fixture events (`api-football.ts`).

**Tier-2:** ScoreBat + ESPN + LiveScore merge (`index.ts`). LiveScore day fan-out is the BE-010 surface.

**SSR:** Statistics `/statistics/top-scorers` is Coming Soon (no SSR LiveScore). No new browser polling introduced.

---

## 4. Isolation decision

**PROCEED — isolatable.**

Bounded correction confined to `livescore.ts` (+ focused tests). Does **not** require changing:

- BE-001 public PL/WC26 fan-out architecture
- BE-003 SSR rate-limit bypass (`proxy.ts`)
- unrelated LiveScore consumers (none exist)
- global provider routing / env / Vercel config

Reused established `getCached` / `setCached` (`src/lib/server/cache.ts`). No second cache/RL architecture.

---

## 5. Explicit upstream request budget

| Constant | Value |
|---|---:|
| `LIVESCORE_MAX_DATE_REQUESTS` | 40 |
| `LIVESCORE_MAX_INCIDENT_REQUESTS` | 104 |
| `LIVESCORE_MAX_UPSTREAM_REQUESTS` | **144** (= 40 + 104) |
| `LIVESCORE_INCIDENT_CONCURRENCY` | 4 |
| Tournament window | 2026-06-11 → 2026-07-19 (end capped; no post-final calendar walk) |
| Cache key | `wc26:top-scorers:livescore:v1` (WC26 / top-scorers / livescore scoped) |
| Cache TTL | 300_000 ms |
| Concurrency | Single-flight `inflightFetch` coalescing |

Behaviour:

1. Date keys deterministic; end = min(now, tournament end); truncate to most-recent ≤40 days if needed.
2. Walk newest-first; stop requesting more days once incident match budget is full.
3. Cap incident fetches at 104.
4. Cache + in-flight dedupe prevent duplicate identical Tier-2 LiveScore work.

---

## 6. Before / after request-count matrix

Scenario basis: one logical `fetchLiveScoreWc26ScorerGoals` call on **2026-07-29** (post-final calendar), Tier-1 empty so Tier-2 runs. Numbers from code + unit tests.

| Scenario | Tier-1 upstream | Max Tier-2 LiveScore date | Max Tier-2 LiveScore incidents | Max total LiveScore upstream | Cache | Concurrent identical callers | Result | Failure |
|---|---:|---:|---:|---:|---|---|---|---|
| Tier-1 success | ≥1 (API-Football path) | **0** | **0** | **0** | N/A (LiveScore not called) | N/A | Tier-1 scorers returned | N/A |
| BEFORE: Tier-1 empty, post-final | 0 LiveScore | **49** (Jun11→Jul29 unbounded) | ≤ finished WC matches (~104) | **~153+** (grows each calendar day) | none / `revalidate:0` | **N × full fan-out** | May succeed slowly | Per-day catch → continue; outer catch → `available:false` |
| AFTER: Tier-1 empty, post-final | 0 LiveScore | **≤39** (Jun11→Jul19; ≤40 budget) | **≤104** | **≤144** | hit after first fill (5m) | **1× work** (single-flight) | Goals if provider data present | Empty/malformed/partial → safe empty or partial goals; contract preserved |
| AFTER: incident flood on first day | 0 | **1** (early stop) | **104** | **105** | yes | 1× | Budget-complete stop | `stoppedEarly=true` |

---

## 7. Cache and concurrency assessment

- **API route cache** (unchanged): full top-scorers JSON keyed by `request.url`, TTL 5m.
- **New LiveScore scoped cache:** prevents repeated day/incident fan-out on cache miss storms inside the process.
- **In-flight coalescing:** concurrent identical LiveScore fetches share one promise (tested: 2 callers → 1 day-walk).
- **No cross-competition leak:** cache key embeds `wc26` + `top-scorers` + `livescore`; WC stage filter retained.

---

## 8. Exact changed files

### Phase-1 docs

- `reports/audits/GC-MVP-READINESS-SPRINT-017-R1.md`

### Implementation + tests (`ff0c158…`)

- `src/lib/server/wc26-top-scorers-sources/livescore.ts`
- `tests/lib/be-010-livescore-day-fanout.test.mjs`

### Evidence (this file)

- `reports/audits/GC-MVP-READINESS-SPRINT-018-R1.md`

**Not changed:** `proxy.ts`, PL APIs, API-Football routing, ScoreBat/ESPN sources, middleware/RL, env, lockfile, BE-001/BE-003 surfaces.

---

## 9. Test-to-behaviour matrix

| Test | Behaviour |
|---|---|
| Date keys deterministic / capped / no post-final walk | Bounded date selection |
| One logical fetch ≤ budget | Max upstream 144 |
| Incident budget stops further day fan-out | Early termination |
| Empty / malformed responses | Safe empty goals |
| Partial failures | Survive; return available goals |
| Total provider failure | Contract `{source, available, goals[]}` |
| Concurrent identical calls | No multiplied Tier-2 work |
| Cache key scope | No PL/cross-season leak |
| Order / statistics from LiveScore goals | Ranking + OG stats correct |
| Tier-1 source contract | No Tier-2 when Tier-1 has scorers |
| Budget constants explicit | WC26-scoped source contract |
| BE-009 / BE-008 / BE-007 / BE-006 regressions | Adjacent security/provider |
| Full unit suite | 221/221 |
| Playwright BE-006/007/008 × 2 viewports | 6/6 |

Dedicated BE-010 Playwright: **N/A** — fan-out is server-side / not browser-observable (same disposition as BE-009).

---

## 10. Gate results

| Gate | Result |
|---|---|
| Focused BE-010 unit | **15/15 PASS** |
| Full unit suite | **221/221 PASS** (206 → 221 = +15) |
| Playwright BE-008 | **2/2** (390×844, 1440×900) |
| Playwright BE-007 | **2/2** |
| Playwright BE-006 | **2/2** |
| Playwright total this sprint | **6/6 PASS** |
| Typecheck (`tsc --noEmit`) | **PASS** |
| Scoped lint (changed impl/test) | **0 errors** |
| Full lint | **33 errors / 56 warnings** (within ≤33/56) |
| Production build | **PASS** (Playwright webServer `npm run build && npm run start`) |

---

## 11. Impact assessment

| Area | Effect |
|---|---|
| Top-scorer accuracy / ordering | Preserved within tournament window + budgets; Tier-1 still preferred |
| Player / team identity | Unchanged (`getTeamDisplayName`) |
| Competition / season isolation | WC stage filter + scoped cache key |
| Fixtures / results / match states | Untouched |
| Mobile / desktop UX | Untouched (Playwright homepage regressions PASS) |
| Accessibility | Untouched |
| Locale routing | Untouched |
| Metadata / canonicals / structured data | Untouched |
| Sitemap / indexing | Untouched |
| Auth / secret handling | Untouched (BE-009 regression PASS) |
| Error sanitisation | Untouched (BE-006 regression PASS) |
| Polling | No new polling / browser requests |
| API request fan-out | LiveScore Tier-2 fan-out **bounded and reduced** |
| Cache correctness | Added scoped LiveScore cache; route cache unchanged |
| Vercel requests / compute | Lower worst-case upstream + coalesced duplicates |
| Private-preview behaviour | Untouched |
| BE-001 / BE-003 | **Not changed; remain OPEN** |

---

## 12. Remaining limitations / unresolved findings

- BE-001, BE-003 remain OPEN (not this sprint).
- BE-010 bounds LiveScore only; ScoreBat/ESPN Tier-2 paths unchanged (out of finding scope).
- In-memory cache/single-flight are per-instance (cold start / multi-instance still possible duplicate work across isolates — same class as existing `apiCache`).
- Register-ordered next MAJOR after BE-010 remains per audit register (not started).

---

## 13. Confirmations

- Exactly one finding changed: **BE-010**.
- BE-001 and BE-003 **not changed**.
- No second finding, competition expansion, Champions League, AI/AEO, dependency/lockfile, env/Vercel config, or history rewrite beyond permitted unpushed impl amend for UTF-8/lint hygiene.
- Nothing pushed, merged, deployed, or publicly released.

---

**GC-MVP-READINESS-SPRINT-018 status:** COMPLETE
