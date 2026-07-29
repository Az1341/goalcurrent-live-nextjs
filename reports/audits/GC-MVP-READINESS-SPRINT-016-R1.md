# GC-MVP-READINESS-SPRINT-016 - R1

**Date/time:** 2026-07-29 ~11:45-12:30 BST
**Task ID:** GC-MVP-READINESS-SPRINT-016
**Title:** Sprint 015 reconciliation + BE-008 ScoreBat token hygiene
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 3b772cad237cc522174496031b302bc8c32dda0d
**Phase-1 reconciliation commit:** 1b3e3dda8ca2252d6a516aed50eb27bd624139e4
**Implementation commit:** f735a7c06bc53f11ebc6f5d2f3dc988806eff4bf
**Evidence commit:** e495ab3b174c8f77532ff2c7df2b310419587e56
**Ending HEAD:** e495ab3b174c8f77532ff2c7df2b310419587e56

---

## 1. Sprint 015 reconciliation (Phase 1)

| Check | Result |
|---|---|
| Branch | `recovery/gc-exec-batch-005` |
| Required start | `3b772cad237cc522174496031b302bc8c32dda0d` — matched |
| Tracked dirty at start | Clean (protected untracked only) |
| Ahead of origin (at start) | 58 |

### Full evidence SHA for `c2d6ff0…`

`c2d6ff06b3bac9f116b6b12b1de8f3dbd32b2713`

### First-parent chain `f2677a842a0bb64b15f70cb63ef5909c1272e429` → `3b772cad237cc522174496031b302bc8c32dda0d`

| Full SHA | Parent | Subject | Files | Role |
|---|---|---|---|---|
| `f2677a842a0bb64b15f70cb63ef5909c1272e429` | `456b40b3…` | fix(security): require verified Firebase idToken for FCM subscribe (BE-007) | route.ts, schemas.ts, be-007 unit+e2e | Implementation + tests |
| `c2d6ff06b3bac9f116b6b12b1de8f3dbd32b2713` | `f2677a842a0bb64b15f70cb63ef5909c1272e429` | docs(audit): record GC-MVP-READINESS-SPRINT-015 evidence pack | GC-MVP-READINESS-SPRINT-015-R1.md | Evidence |
| `3b772cad237cc522174496031b302bc8c32dda0d` | `c2d6ff06b3bac9f116b6b12b1de8f3dbd32b2713` | docs(audit): fill Sprint 015 evidence ending HEAD | GC-MVP-READINESS-SPRINT-015-R1.md | SHA-fill docs |

**Why evidence = `c2d6ff06b3bac9f116b6b12b1de8f3dbd32b2713`:** first docs commit that **adds** the Sprint 015 R1 pack.

**Why tip was `3b772cad237cc522174496031b302bc8c32dda0d`:** documentation-only SHA fill after evidence; no `src/**` or `tests/**` after `f2677a842a0bb64b15f70cb63ef5909c1272e429` (`git diff --name-status f2677a8..3b772ca -- src tests` empty).

**R1 correction:** Ending HEAD in Sprint 015 R1 was stale at evidence SHA; `1b3e3dda8ca2252d6a516aed50eb27bd624139e4` set Ending HEAD to `3b772cad237cc522174496031b302bc8c32dda0d` and noted the SHA-fill tip. No application/test change.

---

## 2. Selected finding (Phase 2)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### BE-008 — ScoreBat token in query string
- **Severity:** MAJOR
- **Category:** Secret handling
- **Location:** `src/lib/scorebat/getScoreBatEmbed.ts` (+ related ScoreBat callers)
- **Recommended correction:** Header-based auth if provider allows; reduce log retention
- **Required tests:** No token in logged URL fixtures

**Rationale:** After BE-007, next register-ordered MAJOR. Provider docs require `?token=` (no header auth), so closure is centralized fetch + mandatory URL redaction before any logging, removing inline token construction from all callers.

**Exclusions:** BE-001/003 (not isolated); ENV-001 (env proof); BE-009+ lower order; FE-014 lint cleanup; WC Event-location not selected; competition expansion prohibited.

---

## 3. Named finding status

| ID | Status |
|---|---|
| BE-001, BE-003 | OPEN (excluded) |
| BE-007 | CLOSED (Sprint 015) |
| BE-008 | **CLOSED this sprint** |
| BE-009–012 | OPEN |
| FE-012–014, A11Y-001, ENV-001 | OPEN |
| WC Event-location | OPEN (not selected) |

---

## 4. Root cause / before-after

- **Before:** Three call sites built `feed/?token=` inline; failures could log raw URLs.
- **After:** Single `fetchScoreBatFeed` / `buildScoreBatFeedUrl` / `redactScoreBatUrl` in `src/lib/scorebat/request.ts`; callers never read `SCOREBAT_API_TOKEN` or inline `?token=`; `console.error` uses redacted URL only.
- **Limitation:** Outbound ScoreBat requests still must use query tokens (provider contract). Leakage surface reduced for logs/fixtures/HTML; CDN/proxy of outbound URL remains provider-constrained.

---

## 5. Commit file lists

### Phase-1 `1b3e3dda8ca2252d6a516aed50eb27bd624139e4`

| Status | Path |
|---|---|
| M | `reports/audits/GC-MVP-READINESS-SPRINT-015-R1.md` |

### Implementation `f735a7c06bc53f11ebc6f5d2f3dc988806eff4bf`

| Status | Path |
|---|---|
| A | `src/lib/scorebat/request.ts` |
| M | `src/lib/scorebat/getScoreBatEmbed.ts` |
| M | `src/lib/server/wc26-top-scorers-sources/scorebat.ts` |
| M | `src/content/videos.ts` |
| A | `tests/lib/be-008-scorebat-token-redaction.test.mjs` |
| A | `tests/e2e/be-008-scorebat-token-redaction.spec.ts` |

### Evidence (this commit)

| Status | Path |
|---|---|
| A | `reports/audits/GC-MVP-READINESS-SPRINT-016-R1.md` |

---

## 6. Test-to-behaviour matrix

| Test | Proves |
|---|---|
| Unit redact fixtures | Secret tokens stripped to `[REDACTED]` |
| Unit caller source contract | Callers use `fetchScoreBatFeed`; no inline `?token=` / env read |
| Unit credential samples | sk_live / Bearer / plain secrets absent after redact |
| PW 390+1440 | Homepage usable; HTML lacks feed token URL / env name |
| BE-006/007 unit+PW | Regressions pass |

---

## 7. Gates

| Gate | Result |
|---|---|
| BE-008 unit | **3/3 PASS** |
| Full unit | **201/201 PASS** |
| BE-005/006/007 + scorebat unit | **19/19 PASS** |
| PW BE-008/007/006 (390+1440) | **6/6 PASS** |
| Typecheck | **PASS** |
| Scoped lint | **0 errors** |
| Full lint | **33 errors / 56 warnings** (baseline held) |
| Build | **PASS** |

Infrastructure: Playwright Chromium missing once in sandbox cache; `npx playwright install chromium` then **6/6**. YouTube key warnings during webServer — authority unaffected.

---

## 8. Impacts

Football-data / locale / SEO / a11y / polling / fan-out / Vercel: unchanged (request helper only). Secrets: ScoreBat token centralized; logs/HTML fixtures redacted. FCM (BE-007) unchanged. Private-preview: improved secret hygiene; no deploy.

---

## 9. Prohibitions

NO SECOND FINDING. NO BE-007 REWORK. NO COMPETITION EXPANSION. NO LINT CLEANUP. NO HISTORY REWRITE. NO PUSH. NO MERGE. NO DEPLOY.

---

**GC-MVP-READINESS-SPRINT-016 status:** COMPLETE