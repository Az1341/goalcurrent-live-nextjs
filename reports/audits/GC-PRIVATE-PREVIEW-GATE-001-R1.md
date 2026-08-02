# GC-PRIVATE-PREVIEW-GATE-001 — R1

**UK date/time:** 2026-07-26 14:51 BST (evidence capture window through ~15:00 BST)  
**Task ID:** GC-PRIVATE-PREVIEW-GATE-001  
**Title:** Vercel Deployment Protection Evidence  
**Type:** Environment verification only  
**Status:** COMPLETE — EVIDENCE ONLY  
**Verdict for BLK-006:** **BLOCKED**

---

## 1. Repository gate (TASK 01)

| Field | Value |
|-------|-------|
| Branch | `recovery/gc-exec-batch-005` |
| Starting HEAD | `14f56ba281a36e4cbc7aa18a0d786770e5a76216` |
| Ending HEAD (before docs commit) | `14f56ba281a36e4cbc7aa18a0d786770e5a76216` |
| Tracked changes | none |
| Untracked (pre-existing / unrelated) | `.mcp.json`, SoT closure drafts, `scripts/_fix_closure.py`, `scripts/_mvp_route_discover.py`, prior SoT audit drafts |
| Active merge/rebase | none |
| Overlapping unexplained edits | none for this task |
| Single-agent operation | yes (this Cursor agent only) |

Working tree was **not** cleaned, reset, stashed, or altered except for this documentation evidence pack.

---

## 2. Canonical BLK-006 traceability (TASK 02)

**Source:** `reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md`

| Field | Recorded wording / value |
|-------|--------------------------|
| Finding ID | **BLK-006** (inherited programme blocker; not counted in §7 audit totals) |
| Exact register wording | `BLK-006 private preview platform | OPEN | Code noindex exists; Deployment Protection unproven` |
| Private-preview blockers list | Inherited **BLK-006** alongside BLK-002 |
| Severity / classification | Inherited programme blocker — **private preview platform proof OPEN** |
| Existing evidence (pre-task) | Code-side preview noindex / robots controls (e.g. Sprint 005 FE-008); policy `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md`; repeated platform proof absent notes |
| Missing evidence (pre-task) | Runtime Vercel Deployment Protection / authenticated preview access proof |
| Required closure proof | Prove unauthenticated visitors cannot access preview application content; authorised founder can access; production remains public |
| Relationship to founder private-preview readiness | Founder private review cannot be declared complete while BLK-006 is OPEN/BLOCKED |

This task does **not** broaden or redefine BLK-006.

---

## 3. Existing evidence review (TASK 03)

Prior repo evidence consistently states BLK-006 remains **OPEN / BLOCKED_BY_MISSING_EVIDENCE** (MVP readiness packs, SoT recovery R1/R2, Sprint 002/005 notes). No conclusive current runtime Deployment Protection proof was found in-repo. Policy requires protection for private preview; robots/noindex alone are insufficient.

---

## 4. Vercel project identity (TASK 04)

| Field | Value |
|-------|-------|
| Project name | `goalcurrent.live` |
| Project ID | `prj_S6UM3tRI1I7436Q7Pz3q6yqhWBe4` |
| Team / account | **AZ TEAM_1** (`az-team-1`, `team_ucQ5b2E2kltKRvphqNd86BQm`) |
| CLI identity used (read-only) | `azafarani4-5274` |
| Repository linkage | GitHub `Az1341/goalcurrent.live` |
| Production branch | `main` |
| Production domain | `https://goalcurrent.live` (also `www.goalcurrent.live`) |
| Inspected preview belongs to project | **Yes** — preview deployment metadata names project `goalcurrent.live` / environment `preview` |

**Not recorded:** access tokens, cookies, session credentials, secret env values, bypass secrets.

**MCP limitation:** Cursor Vercel MCP session only lists team `ahmad-zafarani-s-projects` and returns **403** for `az-team-1/goalcurrent.live`. CLI scope `az-team-1` was used for read-only project/deployment metadata.

---

## 5. Protection configuration (TASK 05) — read-only

From Vercel project API (no settings changed):

| Control | Observed value |
|---------|----------------|
| Vercel Authentication / SSO protection | **Enabled** — `ssoProtection.deploymentType = all_except_custom_domains` |
| Password protection | not set |
| Trusted IPs | not set |
| Protection bypass flag (project field) | false |
| Git fork protection | true |
| Scope implication | Non-custom-domain deployment URLs (including `*.vercel.app` preview/production aliases) require Vercel auth; **custom production domains remain publicly reachable** |

No enable/disable/reconfigure actions were performed.

---

## 6. Existing preview target (TASK 06)

| Field | Value |
|-------|-------|
| Deployment ID | `dpl_6JnLrvxvnjgCYaF1KE8v4Ds2sVeB` |
| Branch | `recovery/gc-exec-batch-005` |
| Commit SHA | `e4873659836b007f26ee78b01c6e4355a584663f` |
| Status | READY (preview / staged) |
| Preview URL | **REDACTED** in this report (see section 12) |
| Current enough for BLK-006? | **Yes for platform protection behaviour** on the remote branch tip |
| Match to local starting HEAD `14f56ba…`? | **No** — local branch is **ahead 27** unpushed commits; remote tip `e487365…` is the newest deployed recovery preview |

No deployment or redeploy was created.

---

## 7. Unauthenticated access (TASK 07)

Method: `curl` with **no cookies / no auth headers**, `--max-redirs 0`. Browser confirmation: lands on **Vercel Login**, not GoalCurrent HTML.

| Observation | Result |
|-------------|--------|
| HTTP behaviour | **302** to Vercel `/sso-api` |
| Redirect destination type | Vercel Authentication / SSO gate (then login) |
| Application HTML (`__NEXT_DATA__` / match UI) | **Absent** (body `Redirecting...`) |
| Application data / API JSON | **Not exposed** (API path also 302) |
| Vercel auth/protection screen | **Yes** (browser: "Log in to Vercel") |
| Preview content before authentication | **No** |

**Unauthenticated-access result:** **PASS** (denial proven).

---

## 8. Authorised founder access (TASK 08)

| Check | Result |
|-------|--------|
| Authentication succeeds in agent environment | **Not verifiable** — browser has no Vercel session; MCP on wrong team |
| Intended preview application loads for authorised user | **Not proven** |
| Protection remains enabled | Config still enabled; not disabled for testing |
| Bypass / protection disable used | **No** (share bypass tools **not** used) |

**Authorised-access result:** **BLOCKED** (authorised session unavailable for runtime app-load proof).

Per task rule: do **not** assume success.

---

## 9. Route-bypass matrix (TASK 09) — unauthenticated

| Path | Expected | Actual | App/sensitive content exposed | Result |
|------|----------|--------|-------------------------------|--------|
| `/` | Protected | 302 to `/sso-api` | No | **PASS** |
| `/robots.txt` | Protected | 302 to `/sso-api` | No | **PASS** |
| Sitemap (`/sitemap.xml`) | Protected | 302 to `/sso-api` | No | **PASS** |
| `/en` (app route) | Protected | 302 to `/sso-api` | No | **PASS** |
| `/api/videos?limit=1` (safe API) | Protected | 302 to `/sso-api` | No | **PASS** |
| `/api/robots` | Protected | 302 to `/sso-api` | No | **PASS** |
| `/logo.svg` (static) | Protected | 302 to `/sso-api` | No | **PASS** |
| `/favicon.ico` (static) | Protected | 302 to `/sso-api` | No | **PASS** |
| Branch-alias `/`, `/robots.txt`, `/en` | Protected | 302 to `/sso-api` | No | **PASS** |

No vulnerability scanning or auth bypass attempts.

---

## 10. Production regression (TASK 10)

| Route | Result |
|-------|--------|
| `https://goalcurrent.live/` | **200** — GoalCurrent homepage HTML loads (browser + curl) |
| `https://goalcurrent.live/robots.txt` | **200** — public robots with Allow/Sitemap (not preview-style disallow-all) |
| `https://goalcurrent.live/about` | **200** — ordinary public page |
| Production `*.vercel.app` deployment alias | **302** SSO — consistent with `all_except_custom_domains`; **does not block** custom-domain production |

**Production-regression result:** **PASS** (public custom-domain production remains accessible; preview protection did not lock production domains).

---

## 11. BLK-006 decision (TASK 11)

### Verdict: **BLOCKED**

| PASS criterion | Status |
|----------------|--------|
| Unauthenticated preview access denied | Proven |
| Authorised founder access works | **Not proven** (session unavailable) |
| Representative routes do not bypass protection | Proven (unauth) |
| Production remains publicly accessible | Proven |

Configuration alone is **not** sufficient for PASS. Runtime unauth denial is proven; runtime authorised load is missing → **BLOCKED**, not PASS or FAIL.

Machine-readable probe summary: `reports/audits/evidence/GC-PRIVATE-PREVIEW-GATE-001-probe.json`

---

## 12. Redactions applied

- Full preview deployment hostname(s) and branch-alias hostname(s)
- SSO `nonce` query values
- Any share/bypass URLs (none created)
- Tokens, cookies, env secrets (none recorded)

Deployment ID and commit SHA retained for founder verification inside the Vercel dashboard.

---

## 13. Exact limitations

1. Local HEAD `14f56ba…` is **not** the deployed preview SHA (`e487365…`); 27 local commits are unpushed (this task did not push/deploy).
2. Cursor Vercel MCP cannot access `az-team-1` (wrong linked team).
3. Agent browser had no Vercel login; authorised app-load could not be completed without founder interactive login.
4. TLS probes used `curl --ssl-no-revoke` due to local Schannel revocation-check failures; this does not weaken Deployment Protection conclusions.

---

## 14. Exact founder action required

To close BLK-006 to **PASS** without changing protection settings:

1. Sign in to Vercel as an authorised **AZ TEAM_1** member (founder account that owns `goalcurrent.live`).
2. Open deployment **`dpl_6JnLrvxvnjgCYaF1KE8v4Ds2sVeB`** (branch `recovery/gc-exec-batch-005`, commit `e4873659836b007f26ee78b01c6e4355a584663f`) from the Vercel project dashboard.
3. Confirm the GoalCurrent application UI loads **while Deployment Protection / Vercel Authentication remains enabled**.
4. Optionally re-run this gate task (or append R2 evidence) after that authenticated load is recorded — still without disabling protection.
5. If preview of local HEAD `14f56ba…` is required later, that needs an **authorised push/deploy task** (out of scope here).
6. Optionally reconnect Cursor Vercel MCP to team **az-team-1** so future evidence can use MCP read tools against the correct project.

---

## 15. Prohibited-action confirmation (TASK 14)

| Control | Confirmed |
|---------|-----------|
| No application code changed | Yes |
| No tests changed | Yes |
| No dependencies / lockfiles changed | Yes |
| No Vercel setting changed | Yes |
| No environment variable changed | Yes |
| No deployment created or redeployed | Yes |
| Protection not disabled | Yes |
| Production not altered | Yes |
| Nothing pushed | Yes |
| Nothing merged | Yes |
| Nothing publicly released | Yes |
| No credential or protected URL published | Yes |

---

## 16. Documentation commit

At most one documentation-only evidence commit is authorised for this report + probe JSON. Application/runtime artefacts unchanged. **Do not push.**

---

**GC-PRIVATE-PREVIEW-GATE-001 status:** **BLOCKED** (BLK-006 remains open pending authorised founder preview load proof)