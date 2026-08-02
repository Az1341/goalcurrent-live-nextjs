# GC-SOT-CLOSURE-R2-STAGE-03 - Targeted Risk, Founder-Decision and Task-Definition Correction

**Report code:** GC-SOT-CLOSURE-R2-STAGE-03  
**Type:** TARGETED RISK, FOUNDER-DECISION AND TASK-DEFINITION CORRECTION  
**Date:** 24/07/2026 - 15:25 BST  
**Status:** DOCUMENTATION ONLY — PROPOSED_ONLY until Founder accepts  
**Scope:** Original Tasks 28, 30 and 31 only  
**Branch:** `recovery/gc-exec-batch-005`  
**HEAD:** `e4873659836b007f26ee78b01c6e4355a584663f`  
**Authorised sources:** `GC-SOT-RECOVERY-CLOSURE-001-R1.md`; `GC-SOT-CLOSURE-R2-STAGE-01-R1.md`; `GC-SOT-CLOSURE-R2-STAGE-02.md`; repository evidence cited therein

---

## Control state

| Control | State |
|---------|-------|
| Application code | Unchanged |
| Source reports (R1, Stage 01-R1, Stage 02) | Not modified |
| Founder decisions | Recommendations only — no approval recorded |
| SOT-BATCH-001..020 | PROPOSED_ONLY — NOT AUTHORISED; not executed |
| Commit / push / merge / deploy / Stage 04 | Not performed |
| Subagents | Not used |
| Orphan script | Not modified / not executed / not relocated / not deleted |
| Deployment platform (verified) | **Vercel** (`docs/ENVIRONMENT.md:5`; `docs/DEPLOY.md`) — Netlify is **not** the governed production platform |

---

## TASK 01 — Complete risk register (original Task 28)

Fifteen material recovery risks. One permanent ID per theme. Severity not lowered without evidence.

| permanent risk ID | title | category | evidence (exact path + precise line range) | likelihood | impact | severity | affected system or data | mitigation | owner | dependency | closure evidence | current status |
|-------------------|-------|----------|--------------------------------------------|------------|--------|----------|-------------------------|------------|-------|------------|------------------|----------------|
| RSK-001 | Conflicting production vs proposed Sources of Truth | Architecture / SoT | `reports/audits/GC-GROWTH-RECONCILIATION-001-R3.md:174-190`; R1 TASK 15 lines 309-320; Stage 02 classification table lines 84-86; `docs/ENVIRONMENT.md:5-7` | High | High | Critical | Production data path; programme architecture | Founder D1 + D2; enforce outcome D (primary) and secondary B before any DB claim | Founder / Architecture | BLK-001; CNF-001; CNF-008 | Written SoT ruling accepted by Founder | OPEN |
| RSK-002 | PostgreSQL/Supabase absence on production path | Data platform | Stage 01-R1 Correction 5 lines 114-144; R1 TASK 04-05; Stage 02 lines 84; `package.json` (no DB deps) | High | High | Critical | DB-backed CMS, membership, SEPANAI persistence | Do not implement DB features until D2; keep production path honest as NOT_FOUND | Architecture | BLK-005; RSK-001 | Founder disposition + either authorised port evidence or revised architecture | OPEN |
| RSK-003 | Personal-data persistence without approved data model | Privacy | Stage 02 data-ownership matrix lines 65-69; Stage 01-R1 Corrections 1-3 lines 38-92; R1 TASK 18 lines 387-393 | Medium | High | High | Firebase optional UID/tokens; any future AI/membership stores | Prohibit new personal stores until D5 + privacy controls; retain Firebase as optional only | Privacy / Founder | BLK-004; D5 | Approved data model + DPIA/privacy note | OPEN |
| RSK-004 | Client-side entitlement bypass | Security / Pilot | Stage 01-R1 pilot table lines 264-269 (AI entitlement, per-user limits, server-side entitlement NOT_FOUND) | Medium | High | High | Future SEPANAI / membership gating | Require server-side entitlement before pilot; no client-only gates | Architecture / Security | D5; BLK-004; SOT-BATCH-011 | Server enforcement tests + preview proof | OPEN |
| RSK-005 | Uncontrolled AI-provider cost | Cost / Pilot | Stage 01-R1 lines 270-271 (provider routing, AI cost controls NOT_FOUND); Stage 02 lines 67-68 | Medium | High | High | Future AI provider spend | Defer SEPANAI runtime until cost controls + Founder D5 | Architecture / Ops | D5; BLK-004 | Cost-limit design approved + metering evidence | OPEN |
| RSK-006 | Missing subscriber and AI-processing consent records | Privacy / Consent | Stage 01-R1 Correction 1 lines 38-62 (cookie preference ≠ subscriber/AI consent); Stage 02 line 91 | High | High | Critical | Subscriber/AI lawful basis records | Block AI/membership processing until consent record design approved (D5) | Privacy / Founder | D5; RSK-003 | Consent store design + acceptance evidence | OPEN |
| RSK-007 | Missing AI retention and deletion controls | Privacy | Stage 01-R1 Correction 3 lines 81-92; Stage 02 matrix line 67 | Medium | High | High | Future AI request/response stores | No AI persistence until retention/deletion approved | Privacy | D5; RSK-003 | Retention/deletion policy + technical controls evidenced | OPEN |
| RSK-008 | Missing AI audit logging and Founder usage reporting | Governance / Audit | Stage 01-R1 lines 272-273; Stage 02 matrix line 69 | Medium | Medium | High | Founder oversight of AI usage | Require audit + Founder reporting design before pilot launch | Founder / Architecture | D5; SOT-BATCH-011/012 | Audit log + usage report acceptance | OPEN |
| RSK-009 | Missing pilot-specific abuse prevention | Security | Stage 01-R1 Correction 4 lines 96-110 (Upstash ≠ pilot abuse prevention); Stage 02 line 71 | Medium | High | High | Pilot AI/membership abuse surface | Design pilot abuse controls; do not claim Upstash as sufficient | Security | D5; SOT-BATCH-016 | Pilot abuse module + tests in protected preview | OPEN |
| RSK-010 | Stale PR #11 and failed E2E checks | Delivery / Quality | Stage 02 TASK 06 lines 148-206; R1 control state lines 22-23, 479-481; R3 lines 717, 631 | High | High | Critical | WC archive/SEO batch; merge safety | Rebuild/rebase onto `20515a11`; fix E2E; protected private preview (D4) | Dev / Founder | BLK-002; CNF-004; SOT-BATCH-004 | Clean rebase + E2E pass + Founder preview acceptance | OPEN |
| RSK-011 | Accidental public release before protected Founder preview | Release governance | `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md:1-16`; R1 TASK 03 lines 133-135; Stage 02 BLK-006 theme lines 239, 248 | Medium | High | Critical | Production `main` / public URLs | Enforce private-preview policy; prove Vercel Deployment Protection (D4/D7) | Founder / DevOps | BLK-006; SOT-BATCH-010 | Platform protection proof + Founder approval record | OPEN |
| RSK-012 | Unresolved Search Console application remediation | SEO / Growth | Stage 02 TASK 05 lines 131-141; R1 TASK 23 lines 465-469; GC-REC-005-05 lines 24, 100-106, 224-229, 264; growth NOT AUTHORISED R3:717-718 | High | Medium | High | Indexability / alternate canonical noise | Authorise sequenced GROWTH remediation after D1/D3/D6; then re-export | SEO / Founder | BLK-003; CNF-002; CNF-005; SOT-BATCH-005..008 | Post-fix GSC export closure evidence | OPEN |
| RSK-013 | Unnecessary or premature database migration | Architecture / Cost | R1 TASK 15-17 lines 309-383; Stage 01-R1 Correction 5; prohibition on Python/SQLite/broad DB migration (R1 TASK 31) | Medium | High | Critical | Repo stability; privacy surface | Defer migration until D2 + security review (SOT-BATCH-002/003); Option A for pilot | Architecture | BLK-001; D2 | Founder architecture ruling before any DDL/port | OPEN |
| RSK-014 | Loss of reproducible audit tooling | Audit tooling | Stage 02 TASK 07 lines 210-228; `reports/audits/gc-route-discovery.mjs` (UTF-16 orphan, untracked) | Low | Medium | Medium | Route-discovery reproducibility vs R3 method | Founder D8: UTF-8 normalise + commit under `reports/audits/`, or delete | Dev / Founder | D8; SOT-BATCH-019 hygiene | Disposition executed with evidence | OPEN |
| RSK-015 | Documentation mistaken for implemented capability | Governance | R1 control state lines 3-8, 45-55; Stage 02 lines 50, 88; Stage 01-R1 lines 21, 276; PROPOSED_ONLY classifications | High | High | Critical | Authorisation discipline across programme | Keep PROPOSED_ONLY / NOT_FOUND / VERIFIED_PLANNED_ONLY distinct; D3/D7 gates | Founder / Documentation | D3; D7; SOT-BATCH-001/018/020 | Founder acceptance records + no unauthorised impl | OPEN |

**Risk total:** 15  
**Mandatory themes covered:** 15/15 (RSK-001..015 map 1:1 to Stage 03 themes 1-15)

---

## TASK 02 — Complete Founder decision pack D1-D8 (original Task 30)

Recommendations are **not** approvals. Approval fields left blank.

### D1 — Production data Source of Truth

| Field | Content |
|-------|---------|
| Decision ID | D1 |
| Exact decision question | What is the authoritative **production** data Source of Truth for GoalCurrent categories on the current repository path (`main` / recovery HEAD), and may programme Supabase/PostgreSQL be treated as current production SoT? |
| Why required now | Programme brief and repo facts conflict (CNF-001/CNF-008); blocks growth DB work and honest pilot planning. |
| Verified evidence | R3:174-190; R1 TASK 15-16 lines 309-337; Stage 02 lines 30, 47, 84-86; `docs/ENVIRONMENT.md:5-7`; Stage 01-R1 Correction 5 |
| Viable options | (1) Affirm heterogeneous production SoT (git/static + vendor APIs; Firebase optional) — Option A. (2) Declare Supabase production SoT now (contradicts NOT_FOUND DB layer). (3) Defer any SoT statement (prolongs CONFLICTING_IMPLEMENTATIONS). |
| Consequences | (1) Matches verified production; defers DB. (2) False production claim; high migration/privacy risk. (3) Continued architecture drift. |
| Security / privacy / UX / cost / debt | (1) Lowest migration/privacy risk; medium deferred debt. (2) High security/privacy/cost. (3) Low short-term cost; high governance risk. |
| Recommended option | **Option (1) — continue heterogeneous category-specific production SoT (Option A); do not treat Supabase as current production SoT** |
| Reason | Aligns with R1 primary outcome **D** and Stage 01-R1 NOT_FOUND DB evidence; lowest false-authorisation risk. |
| Actions unlocked by approval | Honest category SoT communications; D2 scheduling; doc baseline work under D3. |
| Actions still prohibited | DB schema/migrations; claiming Supabase live on production path; growth DB features; SEPANAI persistence. |
| Founder approval | APPROVED: __________ / REJECTED: __________ / DATE: __________ / NOTES: __________ |

### D2 — Supabase/PostgreSQL programme disposition

| Field | Content |
|-------|---------|
| Decision ID | D2 |
| Exact decision question | What is the programme disposition for Supabase/PostgreSQL (defer port / port v2-rebuild / externalise / revise architecture), given production-path absence and v2 SHAs VERIFIED_PLANNED_ONLY? |
| Why required now | BLK-001/BLK-005 remain open; premature port is RSK-013. |
| Verified evidence | R1 TASK 15 lines 309-320; TASK 17 Options A/B/C lines 343-383; GC-REC-005-02:162-193; Stage 02 lines 40, 84-86 |
| Viable options | (A) Defer port; keep Option A production path; schedule architecture decision. (B) Authorise security-reviewed port of v2-rebuild SHAs `3913ec1`, `9789bb7`, `9eaa85f`. (C) Externalise SoT to separate service (BLOCKED_BY_MISSING_EVIDENCE today). (D) Revise programme to drop Supabase mandate. |
| Consequences | (A) Unblocks pilot planning without DB. (B) Large scope + DPIA. (C) Discovery required. (D) Resolves conflict by changing programme claim. |
| Security / privacy / UX / cost / debt | (A) Low ops cost; deferred debt. (B) High ops/privacy cost. (C) Unknown. (D) Comms debt; lower eng cost. |
| Recommended option | **(A) Defer Supabase/PostgreSQL port; treat v2 as VERIFIED_PLANNED_ONLY; primary outcome D + secondary blocker B** |
| Reason | Matches R1 evidence-bound ruling; avoids premature migration (RSK-013). |
| Actions unlocked by approval | SOT-BATCH-002 architecture note; SOT-BATCH-003 security-review planning only. |
| Actions still prohibited | DDL/migrations; production Supabase wiring; Python/SQLite/broad DB migration; SEPANAI DB foundation. |
| Founder approval | APPROVED: __________ / REJECTED: __________ / DATE: __________ / NOTES: __________ |

### D3 — Recovery documentation acceptance and canonical status

| Field | Content |
|-------|---------|
| Decision ID | D3 |
| Exact decision question | Does the Founder accept `GC-GROWTH-RECONCILIATION-001-R3` @ `e487365` and `GC-SOT-RECOVERY-CLOSURE-001-R1` (plus Stage 01-R1 / Stage 02 / Stage 03 evidence packs) as the canonical **documentation** baseline? |
| Why required now | R1 is PROPOSED_ONLY; programme closure NOT YET APPROVED; operators need a single canonical doc set (RSK-015). |
| Verified evidence | R1 lines 3-8, 45-55, 546-554; Stage 02 lines 34, 37-38, 50; R3 line 4 |
| Viable options | (1) Accept docs as canonical documentation baseline only. (2) Reject and require rework. (3) Accept and treat as implementation authorisation (unsafe). |
| Consequences | (1) Unlocks D7 doc merge planning. (2) Keeps closure blocked. (3) Violates growth NOT AUTHORISED / private-preview rules. |
| Security / privacy / UX / cost / debt | Documentation-only; no runtime change if option (1). |
| Recommended option | **(1) Yes — canonical documentation baseline only; does not authorise growth code or programme closure implementation** |
| Reason | Preserves evidence chain while preventing RSK-015 false authorisation. |
| Actions unlocked by approval | D7 doc-only merge consideration; sequencing of proposed batches. |
| Actions still prohibited | Application changes; growth implementation; public release; treating acceptance as SoT DB approval. |
| Founder approval | APPROVED: __________ / REJECTED: __________ / DATE: __________ / NOTES: __________ |

### D4 — PR #11 rebuild/rebase and protected private preview

| Field | Content |
|-------|---------|
| Decision ID | D4 |
| Exact decision question | Shall PR #11 be rebuilt/rebased onto `origin/main` tip `20515a11…` and advanced only through protected private Founder preview (not merged as-is)? |
| Why required now | Stale merge-base `31be078…`; Playwright E2E+visual FAILURE; R3:717 blocks safe merge (RSK-010/RSK-011). |
| Verified evidence | Stage 02 TASK 06 lines 148-206; R1 lines 22-23, 479-481; R3:631,717 |
| Viable options | (1) Rebuild/rebase + protected Vercel private preview. (2) Merge as-is. (3) Close/abandon PR. (4) Port selected files manually later. |
| Consequences | (1) Safe path. (2) High regression/public-risk. (3) Loses archive/SEO batch. (4) Controlled but slower. |
| Security / privacy / UX / cost / debt | (1) Mandatory preview reduces public risk. (2) Critical release risk. |
| Recommended option | **(1) REBUILD/rebase onto `20515a11` + protected private Founder preview; not safe to merge as-is** |
| Reason | Aligns Stage 02 disposition and R3 governance. |
| Actions unlocked by approval | SOT-BATCH-004; preview proof SOT-BATCH-010; selective archive SEO work after preview. |
| Actions still prohibited | Merge to main without preview+Founder approval; public deploy; skipping E2E repair. |
| Founder approval | APPROVED: __________ / REJECTED: __________ / DATE: __________ / NOTES: __________ |

### D5 — GoalCurrent × SEPANAI pilot membership/control prerequisites

| Field | Content |
|-------|---------|
| Decision ID | D5 |
| Exact decision question | What membership/control prerequisites must be Founder-approved before any GoalCurrent × SEPANAI pilot (subscriber identity, consent records, server entitlement, cost/abuse/audit/retention)? |
| Why required now | Stage 01-R1 classifies pilot control surfaces NOT_FOUND; SEPANAI runtime NOT_FOUND on `src/` (BLK-004; RSK-003..009). |
| Verified evidence | Stage 01-R1 lines 60-110, 260-276; Stage 02 lines 65-69, 90-91; R1 TASK 10/11 |
| Viable options | (1) Defer pilot until prerequisites designed and approved. (2) Launch on Firebase-only without membership binding (unsafe for AI entitlements). (3) Require full Supabase membership stack first (blocked by D2). |
| Consequences | (1) Honest deferral. (2) Entitlement/consent/cost risks materialise. (3) Couples pilot to premature DB port. |
| Security / privacy / UX / cost / debt | (1) Protects privacy/cost. (2) High bypass/cost risk. (3) High migration cost. |
| Recommended option | **(1) Defer SEPANAI pilot until D1/D2 resolved and membership/consent/entitlement/cost/abuse/audit/retention controls are designed and Founder-approved** |
| Reason | Matches Stage 01-R1 NOT_FOUND classifications; prevents RSK-004..009. |
| Actions unlocked by approval | Planning-only SOT-BATCH-011/012 after privacy review scoping. |
| Actions still prohibited | SEPANAI implementation; AI persistence; client-only entitlement; membership billing. |
| Founder approval | APPROVED: __________ / REJECTED: __________ / DATE: __________ / NOTES: __________ |

### D6 — Search Console remediation authorisation and sequencing

| Field | Content |
|-------|---------|
| Decision ID | D6 |
| Exact decision question | May Search Console application remediation proceed, and in what sequence relative to SoT/docs acceptance and private preview? |
| Why required now | GC-REC-005-05 complete as evidence but issues OPEN; app remediation NOT_FOUND on recovery; growth NOT AUTHORISED (RSK-012). |
| Verified evidence | Stage 02 TASK 05 lines 131-141; R1 TASK 23; `reports/evidence/gc-rec-005-05/issue-totals.json`; R3:717-718; GC-REC-005-05:24,100-106,224-229,264 |
| Viable options | (1) Authorise planning only after D1/D3; implement GROWTH-001/005 (etc.) only after separate batch authorisation + private preview; then GSC re-export. (2) Immediate code changes without SoT/docs gates. (3) Documentation-only forever (leaves GSC OPEN). |
| Consequences | (1) Controlled remediation loop. (2) Governance breach. (3) Persistent SEO noise. |
| Security / privacy / UX / cost / debt | SEO UX impact; low privacy if metadata-only; preview mandatory for public URL behaviour. |
| Recommended option | **(1) Sequencing: D1/D3 first → authorised GROWTH batches via private preview → SOT-BATCH-008 GSC re-export validation; no ad-hoc Search Console console changes as substitute for app fixes** |
| Reason | Preserves evidence chain; respects growth NOT AUTHORISED until gates clear. |
| Actions unlocked by approval | SOT-BATCH-005..008 planning under PROPOSED_ONLY until explicit batch authorisation. |
| Actions still prohibited | Unauthorised sitemap/canonical code merges; treating GSC UI clicks as closure; public release without preview. |
| Founder approval | APPROVED: __________ / REJECTED: __________ / DATE: __________ / NOTES: __________ |

### D7 — Documentation-only merge/retention policy

| Field | Content |
|-------|---------|
| Decision ID | D7 |
| Exact decision question | After D3 acceptance, may recovery/growth evidence documentation merge to `main` as documentation-only, and what retention policy applies to drafts/orphans? |
| Why required now | Recovery evidence largely untracked/off-main for operators (R1 RSK-007 family; Stage 02 register). |
| Verified evidence | R1 TASK 30 D7 row 568; Stage 02 lines 37-45; private-preview policy lines 8-16; git status untracked `reports/audits/**` |
| Viable options | (1) Doc-only merge to `main` after D3; retain rejected drafts as non-canonical; orphans per D8. (2) Keep docs branch-only. (3) Merge docs with application changes (out of scope / prohibited here). |
| Consequences | (1) Operator visibility. (2) Continued discovery friction. (3) Violates documentation-only control. |
| Security / privacy / UX / cost / debt | Ensure no secrets in reports; redacted GSC exports retained. |
| Recommended option | **(1) Yes — documentation-only merge/retention after Founder accepts D3; follow private-preview policy if any deploy occurs; retain rejected closure draft as non-canonical** |
| Reason | Clears operator gap without authorising code. |
| Actions unlocked by approval | SOT-BATCH-009; reporting standard adoption SOT-BATCH-018. |
| Actions still prohibited | Bundling `src/` changes; public product release; approving SOT-BATCH implementation by this merge alone. |
| Founder approval | APPROVED: __________ / REJECTED: __________ / DATE: __________ / NOTES: __________ |

### D8 — Orphan `gc-route-discovery.mjs` disposition

| Field | Content |
|-------|---------|
| Decision ID | D8 |
| Exact decision question | Relocate/commit after UTF-8 normalisation under `reports/audits/`, or delete the untracked UTF-16 orphan `reports/audits/gc-route-discovery.mjs`? |
| Why required now | Tooling drift risk (RSK-014); Stage 02 assessed purpose/safety but did not modify. |
| Verified evidence | Stage 02 TASK 07 lines 210-228; git status `?? reports/audits/gc-route-discovery.mjs` |
| Viable options | (1) UTF-8 normalise + commit under `reports/audits/`. (2) Delete. (3) Leave orphan (not recommended). |
| Consequences | (1) Reproducible helper. (2) Rely on R3 PowerShell method only. (3) Continued drift. |
| Security / privacy / UX / cost / debt | Low risk if read-only; no secrets observed in Stage 02 decode. |
| Recommended option | **(1) Relocate/commit after UTF-8 normalisation under `reports/audits/`; else (2) delete if Founder prefers PowerShell-only method** |
| Reason | Preserves audit reproducibility without treating script as production tooling. |
| Actions unlocked by approval | Explicit disposition task (documentation/tooling only). |
| Actions still prohibited | Executing/modifying script before disposition authorisation; using it to invent Task 22 twelve streams. |
| Founder approval | APPROVED: __________ / REJECTED: __________ / DATE: __________ / NOTES: __________ |

**Founder-decision total:** 8 (D1-D8)  
**Mandatory fields:** Present for every decision (ID, question, why now, evidence, options, consequences, impact dimensions, recommendation, reason, unlocked, prohibited, blank approval block).

---

## TASK 03 — Rebuild SOT-BATCH-001..020 (original Task 31)

All tasks: **`PROPOSED_ONLY — NOT AUTHORISED`**.  
Field order is identical for every task.  
R1 field shifts corrected for **007, 014, 016, 017** (and aligned **010** platform to Vercel; **018** tests/rollback separation).

### SOT-BATCH-001 — Founder sign-off R3 + R1

1. **Task ID:** SOT-BATCH-001  
2. **Title:** Founder sign-off R3 + R1  
3. **Problem:** Closure/growth docs lack programme approval; R1 remains PROPOSED_ONLY.  
4. **User or programme benefit:** Establishes canonical documentation baseline for operators.  
5. **Verified dependency:** D3; R1 lines 3-8; R3 @ e487365.  
6. **Authorisation gate:** Explicit Founder acceptance of D3 (documentation only).  
7. **Exact scope:** Record Founder acceptance against R3 + R1 (+ Stage evidence references); reports only.  
8. **Explicit exclusions:** No application code; no growth authorisation; no DB/Auth/SEPANAI work.  
9. **Technical approach:** Founder review checklist; acceptance note with hashes/paths.  
10. **Files or systems expected to change:** Acceptance record under `reports/` or governance log only.  
11. **Privacy and security controls:** No secrets in acceptance artefacts; redaction preserved.  
12. **Functional acceptance criteria:** Signed/dated acceptance recorded; status transitions from PROPOSED_ONLY for docs baseline only.  
13. **Required tests:** none  
14. **Evidence required:** Acceptance note; R1 + R3 paths; HEAD SHA `e4873659836b007f26ee78b01c6e4355a584663f`.  
15. **Private-preview requirement:** N/A for documentation-only acceptance.  
16. **Rollback method:** Publish errata / revoke acceptance note.  
17. **Stop condition:** Any request to treat acceptance as implementation authorisation.  
18. **Owner:** Founder  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-002 — Architecture SoT ruling

1. **Task ID:** SOT-BATCH-002  
2. **Title:** Architecture SoT ruling  
3. **Problem:** Programme Supabase SoT vs production NOT_FOUND DB layer (CONFLICTING_IMPLEMENTATIONS).  
4. **User or programme benefit:** Ends false SoT claims; guides safe future work.  
5. **Verified dependency:** D1 + D2; R1 TASK 15-17; Stage 01-R1 Correction 5.  
6. **Authorisation gate:** Founder approval of D1 and D2.  
7. **Exact scope:** Written architecture ruling (outcomes D/B/C etc.); governing doc harmonisation plan.  
8. **Explicit exclusions:** No DDL; no Supabase port; no `src/` DB clients.  
9. **Technical approach:** Decision log citing R3:174-190 and ENVIRONMENT.md:5-7.  
10. **Files or systems expected to change:** Architecture/governance docs only.  
11. **Privacy and security controls:** No credential collection; no live DB probing required.  
12. **Functional acceptance criteria:** Written ruling D/B/C (or revise-programme) published.  
13. **Required tests:** none  
14. **Evidence required:** Decision log with path/line citations.  
15. **Private-preview requirement:** N/A for docs.  
16. **Rollback method:** Publish errata superseding ruling.  
17. **Stop condition:** Attempt to implement DB before security review / D2 port approval.  
18. **Owner:** Architecture / Founder  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-003 — v2-rebuild security review

1. **Task ID:** SOT-BATCH-003  
2. **Title:** v2-rebuild security review  
3. **Problem:** Supabase port risk on `goalcurrent-v2-rebuild` SHAs.  
4. **User or programme benefit:** Safe evaluation before any port.  
5. **Verified dependency:** D2; GC-REC-005-02:162-193; SHAs 3913ec1, 9789bb7, 9eaa85f.  
6. **Authorisation gate:** Founder D2 allowing security-review planning (not port execution).  
7. **Exact scope:** Security review pack against planned Supabase stack only.  
8. **Explicit exclusions:** No production port; no main merge of v2 stack; no SEPANAI enablement.  
9. **Technical approach:** Checklist review of planned Auth/RLS/secrets patterns from branch ledger.  
10. **Files or systems expected to change:** Review artefacts under `reports/` only (unless later authorised).  
11. **Privacy and security controls:** No production secret export; DPIA trigger list.  
12. **Functional acceptance criteria:** Review checklist complete with go/no-go.  
13. **Required tests:** Security test plan listed; execute only if port later authorised.  
14. **Evidence required:** REC-005-02 excerpts; review checklist.  
15. **Private-preview requirement:** Mandatory if any code change later authorised.  
16. **Rollback method:** Abort port; retain review as historical.  
17. **Stop condition:** Critical security finding unresolved.  
18. **Owner:** Security / Architecture  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-004 — PR #11 rebase to main tip

1. **Task ID:** SOT-BATCH-004  
2. **Title:** PR #11 rebase to main tip  
3. **Problem:** Stale merge-base vs `20515a11`; E2E failures; unsafe merge.  
4. **User or programme benefit:** Enables safe archive/SEO batch evaluation.  
5. **Verified dependency:** D4; BLK-002; Stage 02 TASK 06.  
6. **Authorisation gate:** Founder approval of D4.  
7. **Exact scope:** Git rebuild/rebase of PR #11 onto `20515a11`; CI green including Playwright.  
8. **Explicit exclusions:** No merge to main; no public deploy; no orphan-script work.  
9. **Technical approach:** Rebase/rebuild; resolve conflicts; re-run lint/unit/e2e.  
10. **Files or systems expected to change:** PR #11 branch only (45-file class per R1).  
11. **Privacy and security controls:** No secret commits; preview protection required.  
12. **Functional acceptance criteria:** Clean history vs main tip; unit SUCCESS; E2E SUCCESS.  
13. **Required tests:** `test:unit` (111 pass baseline); Playwright e2e+visual.  
14. **Evidence required:** git log/diff; CI links; diffstat.  
15. **Private-preview requirement:** Protected private Vercel preview mandatory before Founder review.  
16. **Rollback method:** Close or reset PR branch to prior head.  
17. **Stop condition:** Persistent E2E failure or missing preview protection.  
18. **Owner:** Dev  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-005 — GROWTH-001 sitemap dedup

1. **Task ID:** SOT-BATCH-005  
2. **Title:** GROWTH-001 sitemap dedup  
3. **Problem:** Duplicate WC URL families in sitemap (CNF-002).  
4. **User or programme benefit:** Cleaner indexation baseline.  
5. **Verified dependency:** D6; CNF-002; GC-REC-005-04 join evidence.  
6. **Authorisation gate:** Founder D6 + separate growth batch authorisation after D1/D3.  
7. **Exact scope:** Deduplicate WC sitemap entries (e.g. `sitemap-entries` path class).  
8. **Explicit exclusions:** No Supabase; no unrelated SEO; no GSC console-only “fixes”.  
9. **Technical approach:** Dedupe policy + unit coverage using REC-005-04 samples.  
10. **Files or systems expected to change:** Sitemap generation modules under `src/` (when authorised).  
11. **Privacy and security controls:** Public URL metadata only; no PII.  
12. **Functional acceptance criteria:** Deduped sitemap sample matches policy.  
13. **Required tests:** Unit/SEO sitemap tests.  
14. **Evidence required:** GC-REC-005-04 join references; before/after sitemap sample.  
15. **Private-preview requirement:** Private preview sitemap fetch mandatory.  
16. **Rollback method:** Revert commit.  
17. **Stop condition:** SoT/docs gates not met; preview fails.  
18. **Owner:** SEO / Dev  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-006 — GROWTH-002 /live archive SEO

1. **Task ID:** SOT-BATCH-006  
2. **Title:** GROWTH-002 /live archive SEO  
3. **Problem:** `/live` SERP/archive positioning mismatch (CNF-003).  
4. **User or programme benefit:** Correct post-tournament archive discovery.  
5. **Verified dependency:** D4/D6; CNF-003; PR #11 archive intent.  
6. **Authorisation gate:** Founder D6 + D4 path (rebase/preview) before merge.  
7. **Exact scope:** `/live` metadata alignment to archive policy.  
8. **Explicit exclusions:** No DB; no SEPANAI runtime; no broad IA rewrite.  
9. **Technical approach:** Metadata/policy update with wc26-live-retirement tests.  
10. **Files or systems expected to change:** live page metadata modules.  
11. **Privacy and security controls:** Public metadata only.  
12. **Functional acceptance criteria:** Metadata matches archive policy on preview.  
13. **Required tests:** wc26-live-retirement / related SEO tests.  
14. **Evidence required:** `live/page` (or equivalent) diff; preview screenshots/HTML.  
15. **Private-preview requirement:** Preview SERP/metadata check mandatory.  
16. **Rollback method:** Revert commit.  
17. **Stop condition:** Conflicts with D4 rebase state.  
18. **Owner:** Product / Dev  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-007 — GROWTH-005 canonical/hreflang

1. **Task ID:** SOT-BATCH-007  
2. **Title:** GROWTH-005 canonical/hreflang  
3. **Problem:** Alternate-page canonical noise (GSC alternate canonical cluster).  
4. **User or programme benefit:** Reduces locale canonical confusion.  
5. **Verified dependency:** D6; CNF-002; Stage 02 GSC table; GC-REC-005-05.  
6. **Authorisation gate:** Founder D6 + growth authorisation; not self-authorising.  
7. **Exact scope:** page-metadata canonical/hreflang policy for representative URL set.  
8. **Explicit exclusions:** No Search Console manual URL removal as sole remediation; no DB.  
9. **Technical approach:** Policy update + representative URL documentation + tests.  
10. **Files or systems expected to change:** page-metadata / i18n SEO helpers.  
11. **Privacy and security controls:** Public URL metadata only.  
12. **Functional acceptance criteria:** Representative URL set documented; policy consistent on preview.  
13. **Required tests:** page-metadata / hreflang unit tests only.  
14. **Evidence required:** Test output; representative URL table; preview HTML link tags.  
15. **Private-preview requirement:** Preview hreflang/canonical audit mandatory.  
16. **Rollback method:** Revert policy commit.  
17. **Stop condition:** Preview audit fails or Founder rejects D6 sequencing.  
18. **Owner:** SEO / Dev  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-008 — GSC re-export validation

1. **Task ID:** SOT-BATCH-008  
2. **Title:** GSC re-export validation  
3. **Problem:** Post-fix measurement missing; issues remain OPEN.  
4. **User or programme benefit:** Closes validation loop after authorised fixes.  
5. **Verified dependency:** D6; GC-REC-005-05 baseline; prior GROWTH batches merged via preview.  
6. **Authorisation gate:** Founder D6 after application remediation authorised and previewed.  
7. **Exact scope:** Fresh Search Console export stored redacted; compare to baseline.  
8. **Explicit exclusions:** No application code in this task; no secret tokens in repo.  
9. **Technical approach:** Export → redact → store under `reports/evidence/`; diff issue totals.  
10. **Files or systems expected to change:** Evidence files under `reports/evidence/` only.  
11. **Privacy and security controls:** Redact account identifiers; no API secrets committed.  
12. **Functional acceptance criteria:** New export stored; diff vs `issue-totals.json` documented.  
13. **Required tests:** none  
14. **Evidence required:** New issue-totals + narrative delta vs GC-REC-005-05.  
15. **Private-preview requirement:** N/A for export task; prior code changes must have completed preview.  
16. **Rollback method:** Keep prior exports; mark new export superseded.  
17. **Stop condition:** Attempt to claim closure without app remediation evidence.  
18. **Owner:** SEO  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-009 — Merge recovery docs to main

1. **Task ID:** SOT-BATCH-009  
2. **Title:** Merge recovery docs to main  
3. **Problem:** Recovery/closure evidence not on `main` for operators.  
4. **User or programme benefit:** Shared canonical documentation access.  
5. **Verified dependency:** D3 + D7; SOT-BATCH-001 acceptance.  
6. **Authorisation gate:** Founder D7 after D3.  
7. **Exact scope:** Documentation-only git merge/retention of `reports/` (+ related docs).  
8. **Explicit exclusions:** No `src/` / `package.json` changes; no PR #11 code merge.  
9. **Technical approach:** Doc-only PR; diffstat proves reports/docs only.  
10. **Files or systems expected to change:** `reports/**`, selected `docs/**`.  
11. **Privacy and security controls:** Ensure no secrets; keep GSC redactions.  
12. **Functional acceptance criteria:** Reports present on main; rejected drafts marked non-canonical.  
13. **Required tests:** `test:unit` smoke if CI requires; no product behaviour change expected.  
14. **Evidence required:** git diffstat; CI green.  
15. **Private-preview requirement:** Follow private-preview policy if deploy occurs; docs-only may still use standard preview.  
16. **Rollback method:** Revert merge commit.  
17. **Stop condition:** Any non-doc file appears in merge.  
18. **Owner:** Founder / Dev  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-010 — Private preview proof

1. **Task ID:** SOT-BATCH-010  
2. **Title:** Private preview proof  
3. **Problem:** Deployment protection platform proof not evidenced in-repo (BLK-006).  
4. **User or programme benefit:** Enforces mandatory Founder preview gate.  
5. **Verified dependency:** D4/D7; `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md:1-16`; R3 private preview gaps.  
6. **Authorisation gate:** Founder acknowledgement of preview platform requirements.  
7. **Exact scope:** Evidenced **Vercel** Deployment Protection / protected preview checklist for GoalCurrent.  
8. **Explicit exclusions:** Netlify is **not** in scope as governed production platform; no public promotion.  
9. **Technical approach:** Capture protection settings evidence (screenshots/export redacted) + checklist.  
10. **Files or systems expected to change:** Evidence under `reports/`; Vercel project settings (ops).  
11. **Privacy and security controls:** Redact tokens; least-privilege access list.  
12. **Functional acceptance criteria:** Preview URL + checklist proving non-public access.  
13. **Required tests:** Smoke tests against protected preview URL.  
14. **Evidence required:** PRIVATE-PREVIEW-RELEASE-POLICY.md compliance note; platform proof artefact.  
15. **Private-preview requirement:** Mandatory — this task produces the proof.  
16. **Rollback method:** Re-enable stricter protection if weakened; revoke public access.  
17. **Stop condition:** Unable to prove protection → no merge-to-main deploy.  
18. **Owner:** DevOps / Founder  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-011 — Firebase membership boundary

1. **Task ID:** SOT-BATCH-011  
2. **Title:** Firebase membership boundary  
3. **Problem:** Optional Firebase Auth exists; pilot subscriber identity NOT_FOUND.  
4. **User or programme benefit:** Clear boundary before any membership/AI pilot.  
5. **Verified dependency:** D5; Stage 01-R1 Corrections 1-2; R1 TASK 09.  
6. **Authorisation gate:** Founder D5 + privacy review; blocked until D1/D2 as relevant.  
7. **Exact scope:** Scope document mapping Firebase UID (optional) vs subscriber identity; no pilot launch.  
8. **Explicit exclusions:** No SEPANAI; no billing; no entitlement bypass; no Supabase Auth.  
9. **Technical approach:** Boundary doc + optional auth test inventory.  
10. **Files or systems expected to change:** Docs; tests only if explicitly later authorised.  
11. **Privacy and security controls:** Minimise PII; document retention; no new stores without D5.  
12. **Functional acceptance criteria:** Scope doc approved; identity ≠ membership explicitly stated.  
13. **Required tests:** Existing auth unit tests if code untouched; new tests only if code authorised later.  
14. **Evidence required:** Firebase module map (`src/lib/firebase/client.ts`, FCM route).  
15. **Private-preview requirement:** Mandatory if any auth behaviour changes.  
16. **Rollback method:** Disable sign-in via env; revert docs.  
17. **Stop condition:** Attempt to treat Firebase UID as approved subscriber identity without D5.  
18. **Owner:** Privacy / Architecture  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-012 — SEPANAI fixture disposition

1. **Task ID:** SOT-BATCH-012  
2. **Title:** SEPANAI fixture disposition  
3. **Problem:** SEPANAI fixtures on PR #11 only; runtime NOT_FOUND on production path.  
4. **User or programme benefit:** Prevents fixture/runtime confusion.  
5. **Verified dependency:** D4 + D5; Stage 02 line 89; R1 TASK 11.  
6. **Authorisation gate:** Founder D5; PR path under D4.  
7. **Exact scope:** Document/test-only disposition of `sepanai-historical-matches` fixtures.  
8. **Explicit exclusions:** No SEPANAI provider integration; no AI persistence.  
9. **Technical approach:** Keep fixtures test-scoped; document non-runtime status.  
10. **Files or systems expected to change:** PR test fixtures/docs only when authorised.  
11. **Privacy and security controls:** No real user prompts; synthetic fixtures only.  
12. **Functional acceptance criteria:** Fixtures documented as test-only; `src/` remains SEPANAI-free unless separately authorised.  
13. **Required tests:** unit tests for fixtures.  
14. **Evidence required:** fixture path + test name evidence from PR head.  
15. **Private-preview requirement:** Preview if shipped with PR #11 batch.  
16. **Rollback method:** Remove fixtures from PR.  
17. **Stop condition:** Any runtime SEPANAI without D5 controls.  
18. **Owner:** Dev / Founder  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-013 — Editorial SoT policy

1. **Task ID:** SOT-BATCH-013  
2. **Title:** Editorial SoT policy  
3. **Problem:** Static editorial vs future CMS ambiguity.  
4. **User or programme benefit:** Clear publishing SoT for editors.  
5. **Verified dependency:** D1; Stage 02 matrix editorial row; R1 TASK 16.  
6. **Authorisation gate:** Founder D1 (production SoT) acknowledgement.  
7. **Exact scope:** Policy for `articles.ts` / editorial TS as production editorial SoT.  
8. **Explicit exclusions:** No CMS DB; no Supabase content types.  
9. **Technical approach:** Publish policy + inventory reference.  
10. **Files or systems expected to change:** Docs/policy; content only if separately authorised.  
11. **Privacy and security controls:** No personal data in editorial policy samples.  
12. **Functional acceptance criteria:** Policy published and linked from governing docs.  
13. **Required tests:** content/editorial tests if code changes authorised.  
14. **Evidence required:** editorial inventory citations from Stage 01-R1 Correction 7.  
15. **Private-preview requirement:** Preview if rendering changes.  
16. **Rollback method:** Revert policy/content commit.  
17. **Stop condition:** CMS/DB implementation without D2.  
18. **Owner:** Founder / Content  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-014 — Analytics consent alignment

1. **Task ID:** SOT-BATCH-014  
2. **Title:** Analytics consent alignment  
3. **Problem:** Ensure GA4/Clarity remain consent-gated; do not confuse cookie preference with subscriber/AI consent.  
4. **User or programme benefit:** Lawful analytics UX.  
5. **Verified dependency:** Stage 01-R1 Correction 1; CookieConsent evidence; D5 distinction retained.  
6. **Authorisation gate:** Privacy owner approval; Founder if behaviour changes.  
7. **Exact scope:** Verify/align analytics tags to `gc_cookie_consent_v1` gating.  
8. **Explicit exclusions:** No subscriber/AI consent store implementation here; no SEPANAI.  
9. **Technical approach:** Audit tag load paths; fix gating gaps if authorised.  
10. **Files or systems expected to change:** `CookieConsent.tsx`, analytics components.  
11. **Privacy and security controls:** No tags before consent; document key `gc_cookie_consent_v1`.  
12. **Functional acceptance criteria:** Consent gating verified on preview.  
13. **Required tests:** analytics consent tests only.  
14. **Evidence required:** analytics test output; component path/line citations.  
15. **Private-preview requirement:** Privacy preview check mandatory if code changes.  
16. **Rollback method:** Revert tags/component commit.  
17. **Stop condition:** Any claim that cookie preference equals AI/subscriber consent.  
18. **Owner:** Privacy / Analytics  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-015 — API key rotation drill

1. **Task ID:** SOT-BATCH-015  
2. **Title:** API key rotation drill  
3. **Problem:** Vendor keys require operable rotation discipline.  
4. **User or programme benefit:** Reduces outage/leak impact.  
5. **Verified dependency:** `.env.example` name inventory (Stage 01-R1 Correction 6); Vercel env ops.  
6. **Authorisation gate:** Ops/Founder authorisation for drill window.  
7. **Exact scope:** Rotation runbook rehearsal using **names only** in docs; execute in Vercel project.  
8. **Explicit exclusions:** No secrets committed; no DB keys (NOT_FOUND).  
9. **Technical approach:** Runbook + redacted execution log.  
10. **Files or systems expected to change:** Runbook under `docs/` or `reports/`; Vercel env values (ops).  
11. **Privacy and security controls:** Redacted logs; least privilege.  
12. **Functional acceptance criteria:** Rotation runbook exists; drill recorded without secret leakage.  
13. **Required tests:** none  
14. **Evidence required:** Redacted logs; checklist.  
15. **Private-preview requirement:** N/A (ops).  
16. **Rollback method:** Restore previous key version in Vercel if drill fails.  
17. **Stop condition:** Secret material appearing in git.  
18. **Owner:** Ops  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-016 — Rate limit verification

1. **Task ID:** SOT-BATCH-016  
2. **Title:** Rate limit verification  
3. **Problem:** Upstash optional; not pilot abuse prevention (Stage 01-R1 Correction 4).  
4. **User or programme benefit:** Confirms baseline API protection under load.  
5. **Verified dependency:** `src/lib/rate-limit/index.ts:25-43`; `src/proxy.ts:167`; D5 for pilot-abuse separation.  
6. **Authorisation gate:** Ops/Founder; does not satisfy D5 abuse prerequisite by itself.  
7. **Exact scope:** Document and verify general/upstream rate limits under controlled load.  
8. **Explicit exclusions:** No claim of SEPANAI/pilot abuse completion; no auth bypass testing with exploits.  
9. **Technical approach:** Integration/load verification against documented limits.  
10. **Files or systems expected to change:** Possibly rate-limit config/docs when authorised.  
11. **Privacy and security controls:** No production PII in load logs; IP-derived counters only.  
12. **Functional acceptance criteria:** Limits documented with observed behaviour evidence.  
13. **Required tests:** integration/load tests for rate limiting only.  
14. **Evidence required:** Test output; config path/line citations.  
15. **Private-preview requirement:** Preview/load against non-public environment preferred.  
16. **Rollback method:** Revert config; optionally disable Upstash via env to fall back to in-memory limiter.  
17. **Stop condition:** Treating this task as D5 abuse-prevention closure.  
18. **Owner:** Ops / Security  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-017 — WC26 archive QA

1. **Task ID:** SOT-BATCH-017  
2. **Title:** WC26 archive QA  
3. **Problem:** Archive hub integrity must be verified around sitemap/archive changes.  
4. **User or programme benefit:** Stable WC26 archive UX.  
5. **Verified dependency:** GC-REC-005-04; D4/D6 related batches.  
6. **Authorisation gate:** Founder/Archive owner after relevant GROWTH/PR authorisation.  
7. **Exact scope:** Sample archive URL QA (HTTP 200 + content checks).  
8. **Explicit exclusions:** No DB migration; no SEPANAI.  
9. **Technical approach:** Automated archive tests + sample crawl on preview.  
10. **Files or systems expected to change:** Tests/fixtures; archive pages only if fix authorised.  
11. **Privacy and security controls:** Public football data only.  
12. **Functional acceptance criteria:** Sample URLs return 200 with expected archive signals.  
13. **Required tests:** archive / wc26 tests only.  
14. **Evidence required:** Test output; sample URL list.  
15. **Private-preview requirement:** Preview crawl mandatory before public.  
16. **Rollback method:** Revert archive-related commit.  
17. **Stop condition:** Systemic 404/canonical regressions on preview.  
18. **Owner:** Archive / Dev  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-018 — Reporting standard adoption

1. **Task ID:** SOT-BATCH-018  
2. **Title:** Reporting standard adoption  
3. **Problem:** Report format drift across recovery artefacts.  
4. **User or programme benefit:** Consistent Founder-readable reports.  
5. **Verified dependency:** D3/D7; reporting standard docs on PR #11 / repo docs class.  
6. **Authorisation gate:** Founder D3/D7 documentation track.  
7. **Exact scope:** Adopt/validate reporting standard for new audit reports.  
8. **Explicit exclusions:** No product code; no rewriting of historical evidence meaning.  
9. **Technical approach:** Run validate-reporting-standard script if present; align templates.  
10. **Files or systems expected to change:** report templates / docs.  
11. **Privacy and security controls:** No secrets in templates.  
12. **Functional acceptance criteria:** Validator passes on adopted templates.  
13. **Required tests:** reporting-standard validation script execution only.  
14. **Evidence required:** script stdout; template paths.  
15. **Private-preview requirement:** N/A for docs.  
16. **Rollback method:** Revert templates.  
17. **Stop condition:** Validator failure unresolved.  
18. **Owner:** Documentation  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-019 — Conflict register hygiene

1. **Task ID:** SOT-BATCH-019  
2. **Title:** Conflict register hygiene  
3. **Problem:** CNF-001..008 remain OPEN; risk of stale conflict tracking.  
4. **User or programme benefit:** Keeps architecture decisions honest.  
5. **Verified dependency:** R1 TASK 26; Stage 03 risk/decision packs.  
6. **Authorisation gate:** Architecture cadence approval (Founder/Architecture).  
7. **Exact scope:** Monthly review log against CNF register; update statuses with evidence only.  
8. **Explicit exclusions:** No silent closure without evidence; no inventing Task 22 twelve streams.  
9. **Technical approach:** Diff register; link to D1-D8 outcomes when decided.  
10. **Files or systems expected to change:** conflict register reports only.  
11. **Privacy and security controls:** No new personal data.  
12. **Functional acceptance criteria:** Review log dated; OPEN items justified.  
13. **Required tests:** none  
14. **Evidence required:** register diff; decision citations.  
15. **Private-preview requirement:** N/A.  
16. **Rollback method:** N/A (documentation).  
17. **Stop condition:** Closing conflicts without Founder/evidence.  
18. **Owner:** Architecture  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

### SOT-BATCH-020 — Growth authorisation unlock

1. **Task ID:** SOT-BATCH-020  
2. **Title:** Growth authorisation unlock  
3. **Problem:** GROWTH-013/014 and related growth blocked until SoT/docs gates clear (R3:717-718).  
4. **User or programme benefit:** Explicit, sequenced unlock for growth work.  
5. **Verified dependency:** BLK-001; D1-D3; D6; private-preview policy.  
6. **Authorisation gate:** Explicit Founder growth authorisation memo after D1-D3 (and D2 as needed).  
7. **Exact scope:** Issue growth authorisation memo defining allowed GROWTH IDs only.  
8. **Explicit exclusions:** Self-authorisation forbidden; no DB/SEPANAI by implication; no public release without preview.  
9. **Technical approach:** Memo referencing R3 TASK 14 / lines 717-718 and Stage evidence.  
10. **Files or systems expected to change:** Authorisation memo under `reports/` or governance.  
11. **Privacy and security controls:** Memo must restate privacy prohibitions.  
12. **Functional acceptance criteria:** Explicit growth authorisation memo signed/dated.  
13. **Required tests:** `test:unit` + e2e required for any subsequent authorised growth code batches (not for memo alone).  
14. **Evidence required:** Memo; R3 citations; gate checklist.  
15. **Private-preview requirement:** Private preview mandatory for all unlocked growth code.  
16. **Rollback method:** Revoke memo.  
17. **Stop condition:** SoT conflict unresolved or preview policy bypassed.  
18. **Owner:** Founder  
19. **Status:** PROPOSED_ONLY — NOT AUTHORISED  

**Proposed-task total:** 20  
**All statuses:** PROPOSED_ONLY — NOT AUTHORISED  
**Field alignment:** Corrected (tests contain tests only; rollback contains rollback only; Upstash disable under rollback for 016; revert tags under rollback for 014; preview actions under private-preview fields).

---

## TASK 04 — Cross-consistency validation

| Check | Verdict |
|-------|---------|
| Every risk maps to ≥1 mitigation, decision, or proposed task | **PASS** — see mapping table below |
| Every Founder decision cites evidence | **PASS** — D1-D8 evidence fields populated |
| Every proposed task cites authorisation gate | **PASS** — field 6 on all 20 |
| No proposed task contradicts Stage 01-R1 or Stage 02 | **PASS** — pilot controls remain NOT_FOUND; twelve-stream gap preserved; PR #11 rebuild disposition preserved |
| No proposed source presented as current production truth | **PASS** — D1/D2 keep Supabase as non-production; Option A heterogeneous SoT |
| Vercel verified deployment platform | **PASS** — ENVIRONMENT.md:5; SOT-BATCH-010 scoped to Vercel |
| Netlify not governed production platform | **PASS** — explicitly excluded; R1 Netlify slips not repeated as governing fact |
| Task 22 twelve-stream limitation recorded (not invented away) | **PASS** — Stage 02 MISSING SOURCE retained; SOT-BATCH-019 stop condition forbids invention |
| Counts/IDs sequential and consistent | **PASS** — RSK-001..015; D1-D8; SOT-BATCH-001..020 |
| Markdown tables render | **PASS** (authoring check) |
| File UTF-8 | **PASS** (UTF-8, no BOM) |
| Exact UTF-8 byte count | **54742** |

### Risk → decision/task mapping

| Risk | Maps to |
|------|---------|
| RSK-001 | D1, D2; SOT-BATCH-002, 020 |
| RSK-002 | D2; SOT-BATCH-002, 003 |
| RSK-003 | D5; SOT-BATCH-011 |
| RSK-004 | D5; SOT-BATCH-011 |
| RSK-005 | D5; SOT-BATCH-011, 012 |
| RSK-006 | D5; SOT-BATCH-011, 014 (distinction) |
| RSK-007 | D5; SOT-BATCH-011 |
| RSK-008 | D5; SOT-BATCH-011, 012 |
| RSK-009 | D5; SOT-BATCH-016 (baseline only; not closure) |
| RSK-010 | D4; SOT-BATCH-004, 010 |
| RSK-011 | D4, D7; SOT-BATCH-010, 009 |
| RSK-012 | D6; SOT-BATCH-005..008, 020 |
| RSK-013 | D2; SOT-BATCH-002, 003 |
| RSK-014 | D8; SOT-BATCH-019 hygiene note |
| RSK-015 | D3, D7; SOT-BATCH-001, 018, 020 |

### Retained limitation (Task 22)

Stage 02 recorded **MISSING SOURCE** for twelve named recovery acceptance streams (only five named in R1). This Stage 03 report **does not invent** the twelve streams.

### Remaining blocker total

Carrying Stage 02 open themes (still valid; not cleared by documentation-only Stage 03):

1. Supabase/PostgreSQL SoT CONFLICTING_IMPLEMENTATIONS / DB NOT_FOUND  
2. Twelve-stream acceptance source missing (Task 22)  
3. PR #11 stale + E2E FAILURE + preview mandatory  
4. GSC application issues OPEN (no closed validation)  
5. Private preview platform proof BLOCKED_BY_MISSING_EVIDENCE  
6. Pilot membership/SEPANAI controls NOT_FOUND  

**Remaining blocker total: 6**

### Prohibited actions confirmation

| Action | Status |
|--------|--------|
| Application-code changes | None |
| Dependency / env / SQL / schema / migration changes | None |
| Supabase / auth / membership / SEPANAI implementation | None |
| Search Console changes | None |
| PR #11 rebase/rebuild/modification | None |
| Orphan-script modification/execution/relocation/deletion | None |
| Founder decision recorded as approved | None |
| Execution of SOT-BATCH-001..020 | None |
| Commit / push / merge / deploy / public release | None |
| Changes to `main` | None |
| Stage 04 work | None |
| Source report modifications | None |
| Subagents | None |

### Git identity

```text
Branch: recovery/gc-exec-batch-005
HEAD: e4873659836b007f26ee78b01c6e4355a584663f
```

### Final git status (short, at Stage 03 write)

```text
?? GC-SOT-CLOSURE-R2-STAGE-01(1).md
?? GC-SOT-RECOVERY-CLOSURE-001-draft.md
?? reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R1.md
?? reports/audits/GC-SOT-RECOVERY-CLOSURE-001.md
?? reports/audits/evidence/
?? reports/audits/gc-route-discovery.mjs
?? scripts/_fix_closure.py
```

---

**GC-SOT-CLOSURE-R2-STAGE-03 status:** COMPLETE for scoped correction of original Tasks 28, 30 and 31.
