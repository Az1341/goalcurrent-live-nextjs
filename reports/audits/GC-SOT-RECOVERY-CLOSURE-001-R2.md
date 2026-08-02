# GC-SOT-RECOVERY-CLOSURE-001-R2 — Final Consolidation and Canonical Validation

**Report code:** GC-SOT-RECOVERY-CLOSURE-001-R2  
**Project:** GoalCurrent + SEPANAI  
**Type:** FINAL CONSOLIDATION AND CANONICAL VALIDATION  
**Date:** 24/07/2026 — 15:41 BST  
**Status:** `CANONICAL DOCUMENTATION BASELINE — FOUNDER ACCEPTED (DOCUMENTATION ONLY)`  
**Scope:** Recovery closure documentation only — no implementation  
**Authorisation:** Documentation baseline Founder-accepted 24/07/2026 — does **not** authorise implementation, PR #11 merge, deployment, public release, or SEPANAI pilot

---

## 1. Executive control header

| Control | State |
|---------|-------|
| R2 status | `CANONICAL DOCUMENTATION BASELINE — FOUNDER ACCEPTED (DOCUMENTATION ONLY)` |
| Programme recovery closure | **DOCUMENTATION BASELINE ACCEPTED** — full programme closure still incomplete (RAC-06..12 + open blockers) |
| Application code | **Unchanged** vs `origin/main` at recovery HEAD |
| Founder decisions D1–D8 | **APPROVED** 24/07/2026 (recommended options; D8 = UTF-8 normalise + retain) — documentation baseline only |
| SOT-BATCH-001..020 | `PROPOSED_ONLY — NOT AUTHORISED` — not executed |
| Commit / push / merge / deploy | **Not performed** |
| Subagents | **Not used** |
| Source reports | **Not modified** |
| Verified production platform | **Vercel** (`goalcurrent.live`) |
| Branch | `recovery/gc-exec-batch-005` |
| HEAD | `e4873659836b007f26ee78b01c6e4355a584663f` |
| `origin/main` | `20515a11b12026bb6e90c47b023cfb582ab8f718` |

---

## 2. Source and repository gate

### 2.1 Pre-execution gate (TASK 01)

| Check | Result |
|-------|--------|
| Current branch | `recovery/gc-exec-batch-005` |
| Exact HEAD SHA | `e4873659836b007f26ee78b01c6e4355a584663f` |
| `origin/main` SHA | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| Concise git status | Untracked only: `GC-SOT-CLOSURE-R2-STAGE-01(1).md`, `GC-SOT-RECOVERY-CLOSURE-001-draft.md`, `reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R1.md`, `reports/audits/GC-SOT-RECOVERY-CLOSURE-001.md`, `reports/audits/evidence/`, `reports/audits/gc-route-discovery.mjs`, `scripts/_fix_closure.py` |
| Gate result | **PASSED** — all four authorised sources present and readable |

### 2.2 Authorised source inventory (UTF-8 byte sizes)

| Authorised source | Path | UTF-8 bytes | Readable |
|-------------------|------|-------------|----------|
| Recovery closure R1 | `reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R1.md` | **49408** | Yes |
| Stage 01-R1 | `reports/audits/evidence/GC-SOT-CLOSURE-R2-STAGE-01-R1.md` | **17420** | Yes |
| Stage 02 | `reports/audits/evidence/GC-SOT-CLOSURE-R2-STAGE-02.md` | **25614** | Yes |
| Stage 03 | `reports/audits/evidence/GC-SOT-CLOSURE-R2-STAGE-03.md` | **54742** | Yes |

No authorised source was modified.

---

## 3. Executive verdict

R2 consolidates authorised recovery-closure evidence into the `CANONICAL DOCUMENTATION BASELINE — FOUNDER ACCEPTED (DOCUMENTATION ONLY)`. It does **not** authorise implementation, growth code, database work, SEPANAI runtime, PR #11 merge, deployment, public release, SEPANAI pilot, or full programme closure.

| Verdict dimension | Conclusion |
|-------------------|------------|
| Production deployment | **Vercel** verified; Netlify is not the governed production platform |
| Production data SoT | Heterogeneous category-specific SoT on production path (primary outcome **D** / Option A) |
| Supabase/PostgreSQL | **NOT_FOUND** on production path; v2 direction **VERIFIED_PLANNED_ONLY** |
| Authentication | Optional Firebase Auth **VERIFIED_PARTIAL**; membership/subscriber identity **NOT_FOUND** |
| GoalCurrent × SEPANAI pilot controls | Runtime and pilot controls **NOT_FOUND** (consent records, cost, audit, retention, abuse) |
| Search Console | Export reconciliation evidence complete; application remediation **OPEN** / not closed |
| PR #11 | OPEN draft — disposition **REBUILD** onto `20515a11` + protected private preview; **not safe to merge** |
| Documentation batch | GC-REC-005-01..05 + growth R3 @ `e487365` evidenced; R2 documentation baseline Founder-accepted 24/07/2026; programme closure remains incomplete |
| Recovery acceptance | **INCOMPLETE** — streams 6–12 source missing (`BLOCKED_BY_MISSING_EVIDENCE`) |
| Risks / decisions / tasks | **15** risks; **8** Founder decisions (**APPROVED** 24/07/2026; documentation baseline only); **20** proposed tasks |
| Cross-consistency | **PASS** under Stage 03 mapping retained |
| Canonical label | `CANONICAL DOCUMENTATION BASELINE — FOUNDER ACCEPTED (DOCUMENTATION ONLY)` — **not** implementation, merge, deploy, or pilot authorisation |

**Programme recovery-closure verdict:** **DOCUMENTATION BASELINE ACCEPTED — PROGRAMME CLOSURE INCOMPLETE**. R2 is canonical for documentation only; implementation remains unauthorised; SOT-BATCH-001–020 remain `PROPOSED_ONLY — NOT AUTHORISED`; PR #11 remains unapproved for merge; deployment/public release remain unauthorised; SEPANAI pilot remains deferred; full programme closure cannot be claimed while RAC-06–12 and recorded blockers remain open.

---

## 4. Verified current-state register

| # | Topic | Classification | Exact evidence (path + lines) | Operational consequence | Unresolved blocker |
|---|-------|----------------|-------------------------------|-------------------------|--------------------|
| 1 | Production deployment platform | VERIFIED_IMPLEMENTED | `docs/ENVIRONMENT.md:5`; Stage 03 control state lines 25; `vercel.json:1-9` | Production deploy path is Vercel project `goalcurrent.live` | Platform Deployment Protection proof remains BLK-006 |
| 2 | Production data sources and ownership | VERIFIED_IMPLEMENTED (heterogeneous) | Stage 01-R1 Correction 7 lines 228-242; R1 TASK 16 lines 325-337; Stage 02 matrix lines 57-72; `docs/ENVIRONMENT.md:7` | Live SoT is git static WC26/editorial + vendor APIs; not a single DB | Whether to move domains to Supabase = NOT_DECIDED |
| 3 | Supabase/PostgreSQL status | NOT_FOUND (prod path); VERIFIED_PLANNED_ONLY (v2); CONFLICTING_IMPLEMENTATIONS (programme vs repo) | Stage 01-R1 Correction 5 lines 114-144; R3:174-190; GC-REC-005-02:162-193; R1 TASK 15 lines 309-320 | No DB layer on production path; programme DB claim unresolved | BLK-001 / BLK-005 |
| 4 | Authentication status | VERIFIED_PARTIAL (Firebase optional); NOT_FOUND (session guards / admin / Supabase Auth) | R1 TASK 09 lines 225-234; Stage 01-R1 preserved Firebase; `src/lib/firebase/client.ts` | Optional Google/Apple sign-in when configured; no membership binding | Pilot identity architecture (BLK-004) |
| 5 | Membership and entitlement status | NOT_FOUND | Stage 01-R1 pilot table lines 264-269; Stage 02 matrix lines 65-66 | Free-membership pilot not implementable on current path | BLK-004; Founder D5 |
| 6 | GoalCurrent × SEPANAI runtime status | NOT_FOUND (runtime); VERIFIED_PLANNED_ONLY / VERIFIED_IN_ACTIVE_PR (fixtures/docs only) | R1 TASK 11 lines 262-268; Stage 02 lines 89-90; Stage 01-R1 line 242 | No SEPANAI generation on production path | BLK-004; D5 |
| 7 | Consent-record status | NOT_FOUND (subscriber/AI); cookie preference separate | Stage 01-R1 Correction 1 lines 38-62; `src/lib/site-keys.ts:2-4`; `CookieConsent.tsx:22-23,39` | Cookie localStorage is analytics UI only — not subscriber/AI consent | Consent model for pilot (D5) |
| 8 | AI cost, audit, retention, abuse controls | NOT_FOUND | Stage 01-R1 Corrections 3–4 lines 81-110; pilot table lines 270-275; Stage 03 RSK-005..009 | Pilot AI processing must remain deferred | BLK-004; D5 |
| 9 | Search Console remediation status | VERIFIED_IMPLEMENTED (export evidence); NOT_FOUND (app remediation on recovery); VERIFIED_PLANNED_ONLY (post-fix) | Stage 02 TASK 05 lines 131-144; R1 TASK 23 lines 462-469; `reports/evidence/gc-rec-005-05/issue-totals.json` | Evidence captured; no GSC issue closed without post-fix validation | BLK-003; D6 |
| 10 | PR #11 status and disposition | VERIFIED_IN_ACTIVE_PR (OPEN draft); disposition REBUILD | Stage 02 TASK 06 lines 148-206; R1 lines 22-23, 473-484; head `5ed5b3cd…` | Not safe to merge; rebase + protected private preview required | BLK-002; D4 |
| 11 | Private Founder-preview rule | VERIFIED_IMPLEMENTED (policy doc); BLOCKED_BY_MISSING_EVIDENCE (platform proof) | `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md:1-12`; R1 BLK-006 line 525; Stage 02 lines 239, 248 | Policy mandatory for merges/deploys; in-repo platform proof absent | BLK-006; SOT-BATCH-010 |
| 12 | Recovery branch and documentation status | VERIFIED_IMPLEMENTED (GC-REC artefacts); R2 documentation baseline Founder-accepted | R1 TASK 20–21 lines 413-443; Stage 02 lines 37-45; Founder D3 24/07/2026 | Recovery HEAD is reports-only vs `origin/main`; docs baseline accepted; implementation still blocked | D7 merge still separately gated; SOT-BATCH remain proposed |

---

## 5. Contradiction-resolution register

| Conflict ID | Conflicting claims | Source locations | Controlling conclusion | Reason | Remaining action |
|-------------|--------------------|------------------|------------------------|--------|------------------|
| CX-001 | Programme asserts Supabase/PostgreSQL SoT vs repo has no DB layer | R3:174-190; R1 CNF-001/CNF-008; Stage 01-R1 Correction 5; `docs/ENVIRONMENT.md:7` | Production SoT = heterogeneous Option A / outcome **D**; Supabase **not** current production truth | Mandatory Stage 04 rule + evidenced NOT_FOUND DB layer | Founder D1 + D2 |
| CX-002 | v2 Supabase sometimes implied as near-production vs planned-only | R1 DEF-004; GC-REC-005-02:162-193; Stage 02 line 86 | v2 SHAs `3913ec1`, `9789bb7`, `9eaa85f` = **VERIFIED_PLANNED_ONLY** | Not on `main` or PR #11 application path | D2 / SOT-BATCH-003 (review only) |
| CX-003 | Netlify named as host/processor in older R1 ownership wording vs Vercel verified platform | R1 TASK 19 lines 401-402 (“Netlify/host”); Stage 03 line 25; `docs/ENVIRONMENT.md:5`; `docs/DEPLOY.md` | **Vercel** is verified production platform; Netlify may appear only as historical/unsupported wording | Stage 04 mandatory reconciliation | Prefer Vercel in all governing conclusions; SOT-BATCH-010 scoped to Vercel |
| CX-004 | Cookie consent treated as pilot consent vs analytics preference only | Rejected draft / Stage 01 defect; Stage 01-R1 Correction 1 lines 38-62 | Cookie preference ≠ subscriber/AI consent; subscriber/AI consent records = **NOT_FOUND** | Targeted reclassification with grep evidence | D5 consent design |
| CX-005 | Firebase UID implied as subscriber identity vs no approved mapping | Stage 01-R1 Correction 2 lines 66-77; Stage 02 matrix line 65 | Subscriber identity = **NOT_FOUND** | No approved plan maps Firebase to pilot subscriber identity | D5 / SOT-BATCH-011 |
| CX-006 | Privacy-rights page / archive out-of-scope text implied as retention system | Stage 01-R1 Correction 3 lines 81-92; `GC-WC26-ARCHIVE-SPEC-001.md:147-148` | Retention/deletion controls = **NOT_FOUND** | Rights text ≠ technical retention/deletion | D5 |
| CX-007 | Upstash rate limit implied as pilot abuse prevention | Stage 01-R1 Correction 4 lines 96-110; Stage 03 RSK-009 | Pilot-specific abuse prevention = **NOT_FOUND** | Generic rate limit ≠ SEPANAI/pilot abuse module | D5 / SOT-BATCH-016 (baseline only) |
| CX-008 | Documentation completeness implied as programme closure / implementation authorisation | R1 TASK 29 lines 546-554; Stage 03 RSK-015; Stage 02 lines 50, 88 | Recovery docs do **not** authorise implementation; recommendations ≠ approval | Governance discipline | D3 acceptance as docs-only only |
| CX-009 | Growth/GSC evidence complete vs code fixes done | R1 TASK 22–23; Stage 02 TASK 05; R3:717-718 | Evidence complete; app remediation **NOT_FOUND** on recovery; growth **NOT AUTHORISED** | Empty `src/` diff on recovery | D6 + authorised GROWTH batches |
| CX-010 | PR #11 base labelled current main tip vs stale merge-base | Stage 02 TASK 06 lines 167-171; R1 lines 22-23, 479 | Merge-base `31be078…` is **stale** vs `20515a11…`; disposition **REBUILD** | Divergence + E2E FAILURE | D4 / SOT-BATCH-004 |
| CX-011 | Twelve acceptance streams assumed vs only five named | Stage 02 TASK 04 lines 101-123; R1 TASK 22:447-456 | Streams 6–12 = **BLOCKED_BY_MISSING_EVIDENCE**; do not invent | Missing source retained | Recover source or Founder accepts incompleteness |
| CX-012 | Proposed tasks / recommendations treated as authorised work | Stage 03 TASK 03 status fields; Stage 04 rules | All SOT-BATCH items remain `PROPOSED_ONLY — NOT AUTHORISED` | No Founder batch authorisation recorded | Explicit authorisation gates before any execution |

---

## 6. Recovery acceptance matrix

### 6.1 Documented streams (5/12) — from R1 TASK 22

| Criterion ID | Requirement | Status | Supporting evidence | Missing evidence | Closure action | Owner / decision gate |
|--------------|-------------|--------|---------------------|------------------|----------------|-----------------------|
| RAC-01 | GC-REC-005 evidence pack complete | PASS (doc artefacts + D3 accepted) | R1 TASK 21:434-438; Stage 02:116-117; Founder D3 24/07/2026 | Full programme closure still blocked by RAC-06..12 | Retain as evidence; no implementation unlocked | Founder / Dev — D3 |
| RAC-02 | Growth baseline R3 accepted as evidence baseline | PASS (documentation baseline via D3) | R3 @ `e487365`; R1 TASK 02–03; Stage 02:118; Founder D3 24/07/2026 | Growth implementation still NOT AUTHORISED | Keep docs baseline; no growth code unlocked | Founder — D3 |
| RAC-03 | GSC/sitemap/canonical **code** fixes | FAIL (app) / PARTIAL (planned) | Empty `src/` on recovery; R1:453; Stage 02:119 | Merged authorised app fixes + preview | Authorise GROWTH after gates | Founder/Dev — D6 |
| RAC-04 | Supabase SoT resolution | FAIL / BLOCKED | NOT_FOUND DB; CONFLICTING programme claim; Stage 02:120 | Written architecture ruling | Founder D1/D2 ruling | Founder / Architecture |
| RAC-05 | Private preview proof for PR #11 | BLOCKED | Stage 02:121; BLK-006; policy exists | In-repo/platform protection proof + rebase | Rebase + protected preview | Dev/Founder — D4 |

### 6.2 Streams 6–12 (mandatory limitation)

| Criterion ID | Requirement | Status | Supporting evidence | Missing evidence | Closure action | Owner / decision gate |
|--------------|-------------|--------|---------------------|------------------|----------------|-----------------------|
| RAC-06 | (unnamed — source absent) | BLOCKED_BY_MISSING_EVIDENCE | Stage 02 TASK 04 lines 101-123 | Named stream definition | Do not invent; recover original twelve-stream source | Founder / Documentation |
| RAC-07 | (unnamed — source absent) | BLOCKED_BY_MISSING_EVIDENCE | Stage 02 TASK 04 | Named stream definition | Same | Founder / Documentation |
| RAC-08 | (unnamed — source absent) | BLOCKED_BY_MISSING_EVIDENCE | Stage 02 TASK 04 | Named stream definition | Same | Founder / Documentation |
| RAC-09 | (unnamed — source absent) | BLOCKED_BY_MISSING_EVIDENCE | Stage 02 TASK 04 | Named stream definition | Same | Founder / Documentation |
| RAC-10 | (unnamed — source absent) | BLOCKED_BY_MISSING_EVIDENCE | Stage 02 TASK 04 | Named stream definition | Same | Founder / Documentation |
| RAC-11 | (unnamed — source absent) | BLOCKED_BY_MISSING_EVIDENCE | Stage 02 TASK 04 | Named stream definition | Same | Founder / Documentation |
| RAC-12 | (unnamed — source absent) | BLOCKED_BY_MISSING_EVIDENCE | Stage 02 TASK 04 | Named stream definition | Same | Founder / Documentation |

**Recovery acceptance verdict:** **INCOMPLETE** — cannot claim full programme closure while streams 6–12 remain `BLOCKED_BY_MISSING_EVIDENCE`.

---

## 7. Data-ownership summary

| Domain | Current production source | Proposed authoritative source | Classification | Evidence |
|--------|---------------------------|-------------------------------|----------------|----------|
| WC26 fixtures/results | Git `src/data/wc26/` + confirmed results JSON + API-Football overlay | NOT_DECIDED | VERIFIED_IMPLEMENTED | Stage 02:59; ENVIRONMENT.md:7 |
| PL / live match data | API-Football via `/api/pl/*` | NOT_DECIDED | VERIFIED_IMPLEMENTED | Stage 02:60; api-football client |
| Editorial / articles | Git editorial TS | NOT_DECIDED | VERIFIED_IMPLEMENTED | Stage 02:61; Stage 01-R1 Correction 7 |
| News / videos | Vendor APIs + caches | NOT_DECIDED | VERIFIED_IMPLEMENTED / partial | Stage 02:62-63 |
| Auth identity | Firebase Auth (optional) | NOT_DECIDED | VERIFIED_PARTIAL | Stage 02:64 |
| Membership / subscriber identity | NOT_FOUND | NOT_DECIDED | NOT_FOUND | Stage 01-R1 Correction 2 |
| Subscriber / AI consent records | NOT_FOUND | NOT_DECIDED | NOT_FOUND | Stage 01-R1 Correction 1 |
| AI requests / entitlements / audit | NOT_FOUND | NOT_DECIDED | NOT_FOUND | Stage 02:67-69 |
| Analytics | GA4/Clarity/Sentry consent-gated | NOT_DECIDED | VERIFIED_PARTIAL | Stage 02:70 |
| Supabase schema (v2) | Branch ledger only | NOT_DECIDED | VERIFIED_PLANNED_ONLY | GC-REC-005-02:162-193 |

**Production data-SoT conclusion:** Category-specific heterogeneous SoT on the verified production path. Supabase/PostgreSQL is **not** current production truth.

---

## 8. Authentication and pilot-control summary

| Control surface | Classification | Evidence | Consequence |
|-----------------|----------------|----------|-------------|
| Firebase Google/Apple sign-in | VERIFIED_PARTIAL | R1 TASK 09; firebase client | Optional when env configured |
| Session middleware / route guards | NOT_FOUND | R1 TASK 09 | No membership route protection |
| Membership tiers / RBAC / admin | NOT_FOUND | R1 TASK 09–10 | Pilot entitlement unavailable |
| Subscriber identity | NOT_FOUND | Stage 01-R1 Correction 2 | Cannot bind pilot membership |
| Subscriber / AI consent records | NOT_FOUND | Stage 01-R1 Correction 1 | Cookie preference insufficient |
| AI entitlement / per-user limits / server enforcement | NOT_FOUND | Stage 01-R1:264-269 | Client-only gates prohibited |
| AI cost / provider routing | NOT_FOUND | Stage 01-R1:270-271 | SEPANAI cost uncontrolled if launched |
| AI audit / Founder usage reporting | NOT_FOUND | Stage 01-R1:272-273 | Oversight gap |
| Retention / deletion | NOT_FOUND | Stage 01-R1 Correction 3 | No pilot deletion system |
| Pilot-specific abuse prevention | NOT_FOUND | Stage 01-R1 Correction 4 | Upstash ≠ pilot abuse closure |
| SEPANAI runtime | NOT_FOUND | `git grep -ni sepanai -- src/` empty | No runtime activation |

**Authentication and membership conclusion:** Optional Firebase Auth exists; membership and subscriber identity are **NOT_FOUND**.  
**SEPANAI pilot-control conclusion:** Runtime and required pilot controls are **NOT_FOUND**; pilot remains deferred per Founder-approved D5 (24/07/2026). D1/D2 are approved for documentation disposition only and do **not** authorise SEPANAI pilot implementation.

---

## 9. Search Console closure register

| Issue | Evidence | Closure status | Blocker |
|-------|----------|----------------|---------|
| Alternative page with proper canonical (1,397) | Stage 02:133; issue-totals; GC-REC-005-05 | OPEN | App fix NOT_FOUND; growth NOT AUTHORISED |
| Discovered — currently not indexed (1,427) | Stage 02:134 | OPEN | Strategy / Founder |
| Indexed examples off current sitemap (743) | Stage 02:135 | OPEN | GROWTH/sitemap authorisation |
| Page with redirect (526) | Stage 02:136 | OPEN | App remediation absent on recovery |
| Duplicate WC match routes | Stage 02:137; R1 CNF-002 | OPEN | GROWTH-001 planned only |
| Soft 404 (10) / duplicate without canonical (25) / crawled not indexed (80) | Stage 02:138-140 | OPEN | Lower priority / strategy |
| Application remediation merged | R1 TASK 23; empty `src/` diff | OPEN / NOT_FOUND | BLK-003 |
| Post-fix validation | R1:469; Stage 02:142 | OPEN / VERIFIED_PLANNED_ONLY | Prior remediation required |

**Search Console closure verdict:** Evidence reconciliation **complete**; **no issue closed** (no post-fix validation). Remediation remains proposed/authorisation-gated only.

---

## 10. PR #11 disposition

| Field | Value |
|-------|-------|
| PR | **#11 OPEN draft** — `feature/wc26-archive-private-preview` |
| Head SHA | `5ed5b3cd827627a18b40e6879309f184acbab63f` |
| Base tip (`origin/main`) | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| Merge-base | `31be07851cff24828f92f13d374336bd014964a8` (**stale**) |
| Files / diff | 45 files; +3443 / −366 vs main |
| Checks | Unit/lint SUCCESS; Playwright E2E+visual **FAILURE**; Vercel SUCCESS |
| Relationship to recovery | Orthogonal — recovery reports-only; PR is app/governance batch |
| Disposition | **REBUILD** onto `20515a11` + **protected private Founder preview** |
| Merge as-is | **Reject** |
| SEPANAI fixtures on PR | Test/docs only — not runtime activation |

**PR #11 disposition:** REBUILD + protected private preview; **not safe to merge**. Recovery closure does **not** approve PR #11.

---

## 11. Consolidated risk register

Fifteen validated risks (Stage 03). Severity not lowered. Every risk maps to mitigation, decision, or proposed task.

| ID | Title | Severity | Mitigation / map | Status |
|----|-------|----------|------------------|--------|
| RSK-001 | Conflicting production vs proposed SoT | Critical | D1, D2; SOT-BATCH-002, 020 | OPEN |
| RSK-002 | PostgreSQL/Supabase absence on production path | Critical | D2; SOT-BATCH-002, 003 | OPEN |
| RSK-003 | Personal-data persistence without approved data model | High | D5; SOT-BATCH-011 | OPEN |
| RSK-004 | Client-side entitlement bypass | High | D5; SOT-BATCH-011 | OPEN |
| RSK-005 | Uncontrolled AI-provider cost | High | D5; SOT-BATCH-011, 012 | OPEN |
| RSK-006 | Missing subscriber and AI-processing consent records | Critical | D5; SOT-BATCH-011, 014 | OPEN |
| RSK-007 | Missing AI retention and deletion controls | High | D5; SOT-BATCH-011 | OPEN |
| RSK-008 | Missing AI audit logging and Founder usage reporting | High | D5; SOT-BATCH-011, 012 | OPEN |
| RSK-009 | Missing pilot-specific abuse prevention | High | D5; SOT-BATCH-016 (baseline only) | OPEN |
| RSK-010 | Stale PR #11 and failed E2E checks | Critical | D4; SOT-BATCH-004, 010 | OPEN |
| RSK-011 | Accidental public release before protected Founder preview | Critical | D4, D7; SOT-BATCH-010, 009 | OPEN |
| RSK-012 | Unresolved Search Console application remediation | High | D6; SOT-BATCH-005..008, 020 | OPEN |
| RSK-013 | Unnecessary or premature database migration | Critical | D2; SOT-BATCH-002, 003 | OPEN |
| RSK-014 | Loss of reproducible audit tooling | Medium | D8 UTF-8 retain applied; commit still pending if desired | PARTIALLY_MITIGATED |
| RSK-015 | Documentation mistaken for implemented capability | Critical | D3, D7; SOT-BATCH-001, 018, 020 | OPEN |

**Risk total:** **15** (all OPEN).

Full evidence path/line detail: Stage 03 TASK 01 lines 35-49.

---

## 12. Founder decision pack D1–D8

Founder approved recommended options D1–D8 on 24/07/2026 (see §17). Scope: documentation baseline only.

| ID | Exact question (concise) | Recommended option | Consequence of approval | Consequence of deferral | Unlocks | Still prohibited |
|----|--------------------------|--------------------|-------------------------|-------------------------|---------|------------------|
| D1 | What is authoritative **production** data SoT; may Supabase be treated as current production SoT? | Heterogeneous Option A; do **not** treat Supabase as current production SoT | Honest production SoT; schedules D2 | Prolongs CONFLICTING_IMPLEMENTATIONS | Doc SoT communications; D2 scheduling | DB schema/migrations; claiming Supabase live |
| D2 | Programme disposition for Supabase/PostgreSQL? | Defer port; v2 = VERIFIED_PLANNED_ONLY; outcome D + secondary B | Unblocks pilot planning without DB | Port/migration risk remains open | SOT-BATCH-002/003 planning only | DDL; production Supabase wiring; broad DB migration |
| D3 | Accept R3 @ e487365 + R1 (+ Stage packs) as canonical **documentation** baseline? | Yes — documentation baseline only | Unlocks D7 doc-merge planning | Closure remains PROPOSED_ONLY | Sequencing of proposed batches | Treating acceptance as growth/DB/SEPANAI authorisation |
| D4 | Rebuild/rebase PR #11 onto `20515a11` + protected private preview (not merge as-is)? | REBUILD + protected private preview | Safe evaluation path | Stale PR / E2E FAILURE risk persists | SOT-BATCH-004, 010 | Merge without preview; public deploy |
| D5 | What pilot membership/control prerequisites before GoalCurrent × SEPANAI? | Defer pilot until controls designed and Founder-approved | Protects privacy/cost/abuse surface | Pilot remains blocked (honest) | Planning-only SOT-BATCH-011/012 | SEPANAI implementation; AI persistence; client-only entitlement |
| D6 | May GSC app remediation proceed, and in what sequence? | D1/D3 first → authorised GROWTH via private preview → re-export | Controlled remediation loop | GSC issues remain OPEN | SOT-BATCH-005..008 planning | Ad-hoc GSC UI “closure”; unauthorised sitemap merges |
| D7 | After D3, may recovery docs merge to `main` as documentation-only? | Yes — doc-only after D3; retain rejected drafts as non-canonical | Operator visibility on main | Docs remain branch/untracked friction | SOT-BATCH-009, 018 | Bundling `src/` changes; product release by merge alone |
| D8 | Disposition of orphan `gc-route-discovery.mjs`? | **Approved:** UTF-8 normalise and retain under `reports/audits/` (commit not performed in this step) | Tooling retained as UTF-8 | n/a (approved) | Disposition applied (UTF-8) | Execute script to invent streams; treat as production tooling |

Full decision narratives: Stage 03 TASK 02 lines 60-194.

---

## 13. Proposed-task register `SOT-BATCH-001`–`020`

All tasks: **`PROPOSED_ONLY — NOT AUTHORISED`**. None executed. Each retains an authorisation gate; private preview mandatory where applicable. D1–D8 approval (24/07/2026) does **not** authorise execution of SOT-BATCH-001–020; implementation remains unauthorised.

| Task ID | Title | Authorisation gate | Private-preview | Status |
|---------|-------|--------------------|-----------------|--------|
| SOT-BATCH-001 | Founder sign-off R3 + R1 | D3 | N/A (docs) | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-002 | Architecture SoT ruling | D1 + D2 | N/A (docs) | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-003 | v2-rebuild security review | D2 (review planning only) | Mandatory if code later | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-004 | PR #11 rebase to main tip | D4 | Protected Vercel preview mandatory | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-005 | GROWTH-001 sitemap dedup | D6 + separate growth auth after D1/D3 | Mandatory | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-006 | GROWTH-002 /live archive SEO | D6 + D4 path | Mandatory | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-007 | GROWTH-005 canonical/hreflang | D6 + growth auth | Mandatory | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-008 | GSC re-export validation | D6 after remediations | Prior code must have previewed | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-009 | Merge recovery docs to main | D7 after D3 | Follow policy if deploy | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-010 | Private preview proof (Vercel) | Founder acknowledgement of platform requirements | This task produces proof | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-011 | Firebase membership boundary | D5 + privacy; blocked until D1/D2 as relevant | Mandatory if auth behaviour changes | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-012 | SEPANAI fixture disposition | D5; PR path under D4 | If shipped with PR #11 | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-013 | Editorial SoT policy | D1 acknowledgement | If rendering changes | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-014 | Analytics consent alignment | Privacy / Founder if behaviour changes | Mandatory if code changes | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-015 | API key rotation drill | Ops/Founder drill window | N/A (ops) | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-016 | Rate limit verification | Ops/Founder; does **not** close D5 abuse | Preferred non-public env | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-017 | WC26 archive QA | Founder/Archive after related auth | Preview crawl mandatory | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-018 | Reporting standard adoption | D3/D7 docs track | N/A (docs) | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-019 | Conflict register hygiene | Architecture cadence | N/A | PROPOSED_ONLY — NOT AUTHORISED |
| SOT-BATCH-020 | Growth authorisation unlock | Explicit Founder growth memo after D1–D3 | Mandatory for unlocked growth code | PROPOSED_ONLY — NOT AUTHORISED |

**Proposed-task total:** **20**. Full field definitions: Stage 03 TASK 03 lines 206-645.

---

## 14. Blockers and evidence gaps

### Remaining blockers (6)

1. Supabase/PostgreSQL SoT **CONFLICTING_IMPLEMENTATIONS** / DB **NOT_FOUND** (BLK-001/005 family)  
2. Twelve-stream acceptance source missing (Task 22 / RAC-06..12)  
3. PR #11 stale + E2E FAILURE + preview mandatory (BLK-002)  
4. GSC application issues OPEN — no closed validation (BLK-003)  
5. Private preview platform proof **BLOCKED_BY_MISSING_EVIDENCE** (BLK-006)  
6. Pilot membership/SEPANAI controls **NOT_FOUND** (BLK-004)

**Remaining blocker total:** **6**

### Remaining evidence gaps (5)

1. No in-repo artefact naming twelve recovery acceptance streams  
2. Live Supabase project state not accessed  
3. Vercel Deployment Protection settings not evidenced in-repo  
4. Orphan script route-count equality to R3 (89) unproven (UTF-16; not re-run)  
5. Post-fix GSC validation absent  

**Remaining evidence-gap total:** **5**

---

## 15. Canonical-status and supersession register

| Item | Status under this R2 |
|------|----------------------|
| This R2 report after Founder approval | **IS** the **canonical recovery-closure documentation baseline** (documentation only — not implementation authorisation) — accepted 24/07/2026 |
| Founder documentation acceptance (D3) | `CANONICAL DOCUMENTATION BASELINE — FOUNDER ACCEPTED (DOCUMENTATION ONLY)` — 24/07/2026 |
| Stage 01-R1 / Stage 02 / Stage 03 | Remain **evidence appendices** under `reports/audits/evidence/` |
| GC-SOT-RECOVERY-CLOSURE-001-R1 | Superseded for **conclusions** by R2; retained for audit history |
| Rejected `GC-SOT-RECOVERY-CLOSURE-001.md` | Remains **REJECTED AS CANONICAL** / unapproved draft |
| Growth R3 @ e487365 | Canonical **growth evidence baseline** under Founder-approved D3 (24/07/2026); not growth implementation authority |
| Growth R1/R2 | SUPERSEDED (historical) |
| GC-REC-005-01..05 | Evidence artefacts (VERIFIED_COMPLETE as deliverables); not programme closure approval |
| v2 Supabase / SEPANAI foundation docs | Remain **VERIFIED_PLANNED_ONLY** |
| SOT-BATCH-001..020 | Remain proposed only |
| Blockers preventing complete programme closure | Six blockers in §14 + RAC-06..12 missing-source limitation |
| Actions still prohibited after this acceptance | App/DB/Auth/SEPANAI implementation; GSC console closure; PR #11 merge as-is; executing SOT-BATCH-001..020 (except D8 UTF-8 retain already applied); commit/push/merge/deploy/public release; inventing Task 22 streams |

R2 is Founder-accepted as the **canonical documentation baseline only**. It is **not** programme-complete, implementation-authorised, or a release approval.

---

## 16. Final validation

| Validation check | Result |
|------------------|--------|
| All authorised sources read | **PASS** — R1, Stage 01-R1, Stage 02, Stage 03 |
| Material Stage 01-R1 findings preserved | **PASS** — consent/identity/retention/abuse NOT_FOUND; DB NOT_FOUND; data inventory |
| Material Stage 02 findings/limitations preserved | **PASS** — ownership matrix, GSC OPEN, PR #11 REBUILD, Task 22 twelve-stream gap |
| Material Stage 03 risks/decisions/tasks preserved | **PASS** — 15 risks; D1–D8; SOT-BATCH-001..020 |
| Every classification has evidence | **PASS** — §4 register cites path/lines |
| Cited paths exist (targeted check) | **PASS** — ENVIRONMENT, DEPLOY, private-preview policy, archive spec, R3, REC-005-02, issue-totals, site-keys, CookieConsent, rate-limit, firebase client, vercel.json, package.json |
| Cited line ranges contain claimed evidence | **PASS** — ENVIRONMENT:5-7 Vercel + WC26 SoT; site-keys cookie key; R3:174-180 CONFLICTING_IMPLEMENTATIONS |
| No unsupported Netlify production claim | **PASS** — Vercel controlling; Netlify historical only (CX-003) |
| No Supabase/PostgreSQL production claim | **PASS** — NOT_FOUND / planned-only |
| No missing pilot control misclassified implemented/planned | **PASS** — remain NOT_FOUND |
| Counts/IDs correct | **PASS** — risks 15; decisions 8; tasks 20; blockers 6; gaps 5; RAC 1–12 |
| Markdown tables render | **PASS** (authoring check) |
| Deliverable UTF-8 | **PASS** (UTF-8, no BOM) |
| Exact UTF-8 byte size | Reported in §18 after write verification |
| No secret value exposed | **PASS** — names only |
| No prohibited action occurred | **PASS** — see confirmation below |

| Prohibited action | Status |
|-------------------|--------|
| Application-code / dependency / env / SQL / schema / migration changes | None |
| Supabase / auth / membership / SEPANAI implementation | None |
| Search Console changes | None |
| PR #11 changes | None |
| Orphan-script modification / execution / relocation / deletion | D8: UTF-8 normalisation applied in place under reports/audits/; not executed for route discovery; not deleted; commit not performed |
| Founder decision recorded as approved | D1–D8 recorded 24/07/2026 (documentation baseline scope only) |
| Execution of SOT-BATCH-001..020 | None |
| Commit / push / merge / rebase / deploy / public release | None |
| Changes to `main` | None |
| Source report modifications | None |
| Subagents / background agents | None |

**Final validation verdict:** **PASS** — documentation baseline Founder-accepted; programme closure remains incomplete (not implementation-authorised).

If any mandatory validation had failed, status would be `REWORK REQUIRED`. No such failure recorded.

---

## 17. Founder approval register

### D1 — Production data Source of Truth

- **Decision ID:** D1  
- **Exact question:** What is the authoritative production data Source of Truth for GoalCurrent categories on the current repository path, and may programme Supabase/PostgreSQL be treated as current production SoT?  
- **Recommended option:** Continue heterogeneous category-specific production SoT (Option A); do not treat Supabase as current production SoT.  
- **Consequence of approval:** Honest production SoT communications; D2 scheduling unlocked.  
- **Consequence of deferral:** CONFLICTING_IMPLEMENTATIONS persists.  
- **Actions unlocked:** Doc SoT baseline work under documentation gates.  
- **Actions still prohibited:** DB schema/migrations; claiming Supabase live; SEPANAI persistence.  

APPROVED: Yes — Founder
REJECTED: __________
DATE: 24/07/2026
NOTES: Recommended Option A / heterogeneous production SoT approved. Documentation baseline only; does not authorise DB implementation.
### D2 — Supabase/PostgreSQL programme disposition

- **Decision ID:** D2  
- **Exact question:** What is the programme disposition for Supabase/PostgreSQL given production-path absence and v2 SHAs VERIFIED_PLANNED_ONLY?  
- **Recommended option:** Defer port; treat v2 as VERIFIED_PLANNED_ONLY; primary outcome D + secondary blocker B.  
- **Consequence of approval:** Unblocks pilot planning without DB migration.  
- **Consequence of deferral:** Architecture conflict and premature-port risk remain open.  
- **Actions unlocked:** SOT-BATCH-002 architecture note; SOT-BATCH-003 security-review planning only.  
- **Actions still prohibited:** DDL/migrations; production Supabase wiring; Python/SQLite/broad DB migration.  

APPROVED: Yes — Founder
REJECTED: __________
DATE: 24/07/2026
NOTES: Defer Supabase/PostgreSQL port; v2 remains VERIFIED_PLANNED_ONLY. Does not authorise port, DDL, or production Supabase wiring.
### D3 — Recovery documentation acceptance and canonical status

- **Decision ID:** D3  
- **Exact question:** Does the Founder accept growth R3 @ e487365 and recovery R1 (plus Stage 01-R1 / Stage 02 / Stage 03 / this R2) as the canonical documentation baseline?  
- **Recommended option:** Yes — canonical documentation baseline only; does not authorise growth code or implementation.  
- **Consequence of approval:** Unlocks D7 doc-only merge consideration.  
- **Consequence of deferral:** Closure remains non-canonical.  
- **Actions unlocked:** Sequencing of proposed documentation batches.  
- **Actions still prohibited:** Application changes; growth implementation; public release; treating acceptance as DB SoT approval.  

APPROVED: Yes — Founder
REJECTED: __________
DATE: 24/07/2026
NOTES: Accepts R2 (with R3 @ e487365, R1, Stage 01-R1/02/03 evidence) as the canonical documentation baseline only. Does not authorise implementation, growth code, PR #11 merge, deployment, public release, or SEPANAI pilot.
### D4 — PR #11 rebuild/rebase and protected private preview

- **Decision ID:** D4  
- **Exact question:** Shall PR #11 be rebuilt/rebased onto origin/main tip 20515a11… and advanced only through protected private Founder preview (not merged as-is)?  
- **Recommended option:** REBUILD/rebase + protected private Founder preview; not safe to merge as-is.  
- **Consequence of approval:** Safe archive/SEO batch evaluation path.  
- **Consequence of deferral:** Stale merge-base and E2E FAILURE risk persist.  
- **Actions unlocked:** SOT-BATCH-004; SOT-BATCH-010 preview proof.  
- **Actions still prohibited:** Merge to main without preview + Founder approval; public deploy; skipping E2E repair.  

APPROVED: Yes — Founder
REJECTED: __________
DATE: 24/07/2026
NOTES: REBUILD/rebase onto 20515a11 + protected private Founder preview required. Does not authorise merge as-is, deployment, or public release.
### D5 — GoalCurrent × SEPANAI pilot membership/control prerequisites

- **Decision ID:** D5  
- **Exact question:** What membership/control prerequisites must be Founder-approved before any GoalCurrent × SEPANAI pilot?  
- **Recommended option:** Defer SEPANAI pilot until D1/D2 resolved and membership/consent/entitlement/cost/abuse/audit/retention controls are designed and Founder-approved.  
- **Consequence of approval:** Honest deferral protecting privacy/cost.  
- **Consequence of deferral:** Pilot remains blocked (same operational outcome until designed).  
- **Actions unlocked:** Planning-only SOT-BATCH-011/012 after privacy scoping.  
- **Actions still prohibited:** SEPANAI implementation; AI persistence; client-only entitlement; membership billing.  

APPROVED: Yes — Founder
REJECTED: __________
DATE: 24/07/2026
NOTES: SEPANAI pilot deferred until membership/consent/entitlement/cost/abuse/audit/retention controls are designed and separately Founder-approved. Does not authorise SEPANAI pilot or implementation.
### D6 — Search Console remediation authorisation and sequencing

- **Decision ID:** D6  
- **Exact question:** May Search Console application remediation proceed, and in what sequence relative to SoT/docs acceptance and private preview?  
- **Recommended option:** D1/D3 first → authorised GROWTH batches via private preview → SOT-BATCH-008 re-export; no ad-hoc GSC console substitute.  
- **Consequence of approval:** Controlled remediation validation loop.  
- **Consequence of deferral:** GSC issues remain OPEN.  
- **Actions unlocked:** SOT-BATCH-005..008 planning under PROPOSED_ONLY until batch authorisation.  
- **Actions still prohibited:** Unauthorised sitemap/canonical merges; treating GSC UI clicks as closure.  

APPROVED: Yes — Founder
REJECTED: __________
DATE: 24/07/2026
NOTES: Sequencing approved (D1/D3 first -> authorised GROWTH via private preview -> re-export). Does not authorise GROWTH code batches or GSC console-only closure.
### D7 — Documentation-only merge/retention policy

- **Decision ID:** D7  
- **Exact question:** After D3 acceptance, may recovery/growth evidence documentation merge to main as documentation-only, and what retention applies to drafts/orphans?  
- **Recommended option:** Yes — documentation-only merge/retention after D3; retain rejected drafts as non-canonical; orphans per D8.  
- **Consequence of approval:** Operator visibility on main.  
- **Consequence of deferral:** Continued discovery friction for evidence.  
- **Actions unlocked:** SOT-BATCH-009; SOT-BATCH-018.  
- **Actions still prohibited:** Bundling src changes; public product release; approving SOT-BATCH implementation by merge alone.  

APPROVED: Yes — Founder
REJECTED: __________
DATE: 24/07/2026
NOTES: Documentation-only merge/retention authorised in principle after D3; rejected drafts remain non-canonical. Does not authorise bundling src/ changes, deployment, or public release. Explicit merge execution still requires separate batch authorisation.
### D8 — Orphan `gc-route-discovery.mjs` disposition

- **Decision ID:** D8  
- **Exact question:** Relocate/commit after UTF-8 normalisation under reports/audits/, or delete the untracked UTF-16 orphan?  
- **Recommended option:** UTF-8 normalise + commit under reports/audits/; else delete if PowerShell-only method preferred.  
- **Consequence of approval:** Ends orphan tooling drift.  
- **Consequence of deferral:** UTF-16 orphan drift continues.  
- **Actions unlocked:** Explicit documentation/tooling disposition task.  
- **Actions still prohibited:** Executing/modifying script before disposition authorisation; using it to invent Task 22 twelve streams.  

APPROVED: Yes — Founder
REJECTED: __________
DATE: 24/07/2026
NOTES: UTF-8 normalise and retain gc-route-discovery.mjs under reports/audits/. Disposition applied (UTF-8 normalisation). Commit not performed in this approval step unless separately requested. Does not authorise inventing Task 22 twelve streams.
**Confirmation:** Founder approved D1–D8 on 24/07/2026. Scope limited to establishing R2 as the canonical **documentation baseline only**. Does **not** authorise implementation, PR #11 merge, deployment, public release, or the SEPANAI pilot. SOT-BATCH-001..020 remain `PROPOSED_ONLY — NOT AUTHORISED` except the D8 UTF-8 retain disposition applied above.

---



### Founder acceptance record (24/07/2026)

Founder approved recommended decisions **D1–D8**.

- **D8 selection:** UTF-8 normalise and retain `reports/audits/gc-route-discovery.mjs` (applied).
- **Effect:** Establishes this R2 as the **canonical documentation baseline only**.
- **Explicit non-authorisation:** Does **not** authorise implementation, PR #11 merge, deployment, public release, or the SEPANAI pilot.
- **SOT-BATCH-001..020:** Remain `PROPOSED_ONLY — NOT AUTHORISED` (D8 file normalisation only).

## 18. End-of-document marker

### UTF-8 byte size

**43916** — exact UTF-8 byte count verified after final write.

### Git identity at R2 write

```text
Branch: recovery/gc-exec-batch-005
HEAD: e4873659836b007f26ee78b01c6e4355a584663f
origin/main: 20515a11b12026bb6e90c47b023cfb582ab8f718
```

### Final git status (short; includes this R2 file once written)

```text
?? GC-SOT-CLOSURE-R2-STAGE-01(1).md
?? GC-SOT-RECOVERY-CLOSURE-001-draft.md
?? reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R1.md
?? reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R2.md
?? reports/audits/GC-SOT-RECOVERY-CLOSURE-001.md
?? reports/audits/evidence/
?? reports/audits/gc-route-discovery.mjs
?? scripts/_fix_closure.py
```

---

**GC-SOT-RECOVERY-CLOSURE-001-R2 status:** `CANONICAL DOCUMENTATION BASELINE — FOUNDER ACCEPTED (DOCUMENTATION ONLY)`

END OF DOCUMENT
