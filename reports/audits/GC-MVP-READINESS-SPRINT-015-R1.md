# GC-MVP-READINESS-SPRINT-015 - R1

**Date/time:** 2026-07-29 ~11:37–12:20 BST
**Task ID:** GC-MVP-READINESS-SPRINT-015
**Title:** Next Isolated Canonical Finding After BE-006
**Status:** COMPLETE
**Branch:** recovery/gc-exec-batch-005
**Starting HEAD:** 456b40b329dc1d263fb225e868b6ef71438266ad
**Implementation commit:** f2677a842a0bb64b15f70cb63ef5909c1272e429
**Evidence commit:** c2d6ff06b3bac9f116b6b12b1de8f3dbd32b2713
**Ending HEAD:** c2d6ff06b3bac9f116b6b12b1de8f3dbd32b2713

---

## 1. Selected finding (exact R2 wording)

**Source:** reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md

#### BE-007 — FCM topic subscribe without required Firebase idToken
- **Category:** Security / abuse
- **Severity:** MAJOR
- **Confidence:** High
- **Location:** `src/app/api/firebase/fcm-token/route.ts`
- **Evidence:** idToken optional
- **Root cause:** Missing required auth for topic subscribe
- **Impact:** Topic subscription spam / Admin SDK quota burn
- **Exploitability:** Medium
- **False-positive disposition:** Not FP
- **Recommended correction:** Require verified idToken (or App Check)
- **Required tests:** 401 without idToken
- **Remediation size:** S
- **Private-preview blocker:** No
- **Production blocker:** No

No other findings remediated.

---

## 2. Selection rationale

After closed FE-001–011, FE-015, BE-004–006: no remaining CRITICAL/BLOCKER in the R2 register. BE-001/BE-003 remain open but are M-sized fan-out/RL architecture (not safely isolated). BE-007 is the next register-ordered MAJOR with S-sized isolated remediation and clear 401 contract.

**User benefit:** Stops anonymous devices from burning Firebase Admin topic-subscribe quota; push registration requires a signed-in Firebase user.

---

## 3. Higher-priority exclusions

| Finding | Why excluded |
|---|---|
| FE-001–003 CRITICAL | Closed Sprint 003 |
| BE-001 / BE-003 | Not isolated (fan-out + SSR/RL architecture; env-coupled) |
| BE-002 / ENV-001 | Environment proof only |
| BE-004–006 | Closed |
| BE-008–010 | Lower register order than BE-007 |
| FE-014 | Phased lint programme; general cleanup prohibited |
| MINORs / INFO | Lower severity while BE-007 eligible |
| WC Event-location | Non-R2 sprint item; not selected |

---

## 4. Named finding status

| ID | Status |
|---|---|
| BE-001 | OPEN (excluded) |
| BE-003 | OPEN (excluded) |
| BE-007 | **CLOSED this sprint** |
| BE-008 | OPEN |
| BE-009 | OPEN |
| BE-010 | OPEN |
| BE-011 | OPEN |
| BE-012 | OPEN |
| FE-012 | OPEN |
| FE-013 | OPEN |
| FE-014 | OPEN |
| A11Y-001 | OPEN |
| ENV-001 | OPEN (conditional) |
| WC Event-location | OPEN (not R2; not selected) |

---

## 5. Defect proof

- **Before:** `idToken` optional; missing token still subscribed to `goalcurrent-live` (+ locale) topics.
- **After:** `requireFcmIdToken` returns **401** `missing_id_token`; verified `verifyIdToken` required; `user-{uid}` always bound; no optional gate around subscribe.
- **Cause:** Optional auth path treated anonymous subscribe as success.

---

## 6. Commit file lists

### Implementation `f2677a842a0bb64b15f70cb63ef5909c1272e429`

| Status | Path |
|---|---|
| M | `src/app/api/firebase/fcm-token/route.ts` |
| M | `src/lib/validation/schemas.ts` |
| A | `tests/lib/be-007-fcm-id-token.test.mjs` |
| A | `tests/e2e/be-007-fcm-id-token.spec.ts` |

### Evidence (this commit)

| Status | Path |
|---|---|
| A | `reports/audits/GC-MVP-READINESS-SPRINT-015-R1.md` |

---

## 7. Test-to-behaviour matrix

| Test | Proves |
|---|---|
| Unit requireFcmIdToken | Missing/blank → 401; valid → ok |
| Unit POST without idToken | 401 `missing_id_token` before Firebase admin / subscribe |
| Unit empty idToken | Rejected (400/401); no subscribe |
| Unit source contract | Always `verifyIdToken(required.idToken)`; no `if (idToken)` optional gate |
| PW 390 / 1440 | Homepage usable; POST without idToken → 401 |

---

## 8. Gates

| Gate | Result |
|---|---|
| BE-007 unit | **4/4 PASS** |
| Full unit | **198/198 PASS** |
| BE-005 + BE-006 unit | **12/12 PASS** |
| PW BE-007 390+1440 | **2/2 PASS** |
| PW BE-005 + BE-006 | **4/4 PASS** |
| Typecheck | **PASS** |
| Scoped lint | **0 errors** |
| Full lint | **33 errors / 56 warnings** (≤ 33/57 baseline) |
| Build | **PASS** |

---

## 9. Impacts

Football-data, locale, SEO, a11y, polling, fan-out, Vercel: unchanged. Auth: FCM subscribe now requires verified Firebase ID token. Private-preview: safer push surface; no deploy.

---

## 10. Remaining limitations

- Unsigned browser clients that still POST without idToken receive 401 (expected).
- Invalid idToken path requires Firebase Admin configured to exercise verify failure in live env.
- BE-001/003/008–012, FE-012–014, A11Y-001, ENV-001 remain open.

---

## 11. Prohibitions

NO SECOND FINDING. NO BE-006 REWORK. NO COMPETITION EXPANSION. NO LINT CLEANUP. NO HISTORY REWRITE. NO PUSH. NO MERGE. NO DEPLOY.

---

**GC-MVP-READINESS-SPRINT-015 status:** COMPLETE