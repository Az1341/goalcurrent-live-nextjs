# GC-PRIVATE-PREVIEW-GATE-001 — R1

**UK date/time (close):** 2026-08-10 ~15:03 BST  
**Prior capture:** 2026-07-26 14:51 BST (unauth + config; auth then BLOCKED)  
**Task ID:** GC-PRIVATE-PREVIEW-GATE-001  
**Batch:** GC-HARDENING-20260809-BATCHPLAN / Batch G (BLK-006)  
**Title:** Vercel Deployment Protection Evidence  
**Type:** Environment verification / governance gate (no application code)  
**Status:** COMPLETE  
**Verdict for BLK-006:** **PASSED**

---

## 1. Decision summary

| PASS criterion | Status |
|----------------|--------|
| Unauthenticated preview access denied | **Proven** (2026-07-26 and reconfirmed 2026-08-10) |
| Authorised team-member access loads GoalCurrent app | **Proven** (2026-08-10 via `vercel curl` as `azafarani4-5274`) |
| Representative routes do not bypass protection (unauth) | **Proven** |
| Production custom domain remains publicly accessible | **Proven** |

**BLK-006:** **CLOSED / PASSED**

Configuration was already correct (`ssoProtection.enabled = true`, `deploymentType = all_except_custom_domains`). No enable/disable flip was required on 2026-08-10; this close adds the missing authorised app-load proof.

---

## 2. Canonical BLK-006 traceability

**Source:** `reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md`

| Field | Value |
|-------|-------|
| Finding ID | **BLK-006** |
| Prior wording | `BLK-006 private preview platform \| OPEN \| Code noindex exists; Deployment Protection unproven` |
| Required closure proof | Unauth visitors cannot access preview app content; authorised reviewer can; production remains public |
| Policy | `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md` |

---

## 3. Vercel project identity

| Field | Value |
|-------|-------|
| Project name | `goalcurrent.live` |
| Project ID | `prj_S6UM3tRI1I7436Q7Pz3q6yqhWBe4` |
| Team | **AZ TEAM_1** (`az-team-1`, `team_ucQ5b2E2kltKRvphqNd86BQm`) |
| CLI identity | `azafarani4-5274` |
| Repository | GitHub `Az1341/goalcurrent.live` |
| Production branch | `main` |
| Production domain | `https://goalcurrent.live` |

**Not recorded:** access tokens, cookies, session credentials, protection-bypass secrets, full preview hostnames in this narrative (deployment IDs retained).

---

## 4. Protection configuration (read via Vercel MCP, 2026-08-10)

| Control | Observed value |
|---------|----------------|
| Vercel Authentication (`ssoProtection`) | **Enabled** — `deploymentType = all_except_custom_domains` |
| Password protection | disabled |
| Trusted IPs | disabled |
| Scope implication | `*.vercel.app` preview/production aliases require Vercel auth; **custom production domains remain public** |

No protection settings were changed to achieve this PASS (already enabled from prior ops).

---

## 5. Preview target used for close (2026-08-10)

| Field | Value |
|-------|-------|
| Deployment ID | `dpl_BdyF2e1UcpCovGbQjWyKx1A9Vnfm` |
| Branch | `feat/gc-comshield-001-r1` |
| Commit SHA | `81c201f1940284d45b44c9605a3367d64e3f9f69` |
| Status | READY (preview) |
| Preview URL | **REDACTED** (branch alias under `az-team-1.vercel.app`) |

Earlier R1 probes (2026-07-26) used `dpl_6JnLrvxvnjgCYaF1KE8v4Ds2sVeB` (`recovery/gc-exec-batch-005`); unauth denial pattern was identical.

---

## 6. Unauthenticated access (reconfirmed 2026-08-10)

Method: `curl.exe --ssl-no-revoke --max-redirs 0` with **no** cookies / auth headers / bypass secret.

| Path | HTTP | Redirect | App content | Result |
|------|------|----------|-------------|--------|
| `/` | 302 | Vercel `/sso-api` | No (`Redirecting...`) | **PASS** |
| `/en` | 302 | Vercel `/sso-api` | No | **PASS** |
| `/robots.txt` | 302 | Vercel `/sso-api` | No | **PASS** |
| `/api/videos?limit=1` | 302 | Vercel `/sso-api` | No | **PASS** |
| `/logo.svg` | 302 | Vercel `/sso-api` | No | **PASS** |

**Unauthenticated-access result:** **PASS**

---

## 7. Authorised access (close evidence — 2026-08-10)

Method: `npx vercel curl` as CLI user `azafarani4-5274` (team member on `az-team-1`), targeting the preview deployment URL, following redirects. Protection remained enabled; anonymous curl still 302 (section 6).

| Check | Result |
|-------|--------|
| Gate bypass for anonymous | No — unauth still SSO 302 |
| Authorised response | **200** `text/html` |
| Body size | ~67 217 bytes |
| App markers | GoalCurrent HTML; `data-dpl-id="dpl_BdyF2e1UcpCovGbQjWyKx1A9Vnfm"`; `X-Matched-Path: /en`; app CSP / `X-Robots-Tag: noindex, nofollow` |
| Vercel Login wall | Absent in authorised response |

**Authorised-access result:** **PASS**

---

## 8. Production regression (2026-08-10)

| Route | Result |
|-------|--------|
| `https://goalcurrent.live/` | **200** — public |
| `https://goalcurrent.live/robots.txt` | **200** — public |
| `https://goalcurrent.live/about` | **200** — public (prior matrix; domain public) |

**Production-regression result:** **PASS**

---

## 9. Prior BLOCKED state (2026-07-26) — retained for audit trail

R1 originally recorded: unauth PASS, config enabled, authorised founder browser/MCP app-load **not** proven → **BLOCKED**. That gap is closed by section 7. Machine-readable summary updated in `reports/audits/evidence/GC-PRIVATE-PREVIEW-GATE-001-probe.json`.

---

## 10. Prohibited-action confirmation

| Control | Confirmed |
|---------|-----------|
| No application code changed | Yes |
| No tests / dependencies changed | Yes |
| SSO protection not disabled | Yes |
| Production custom domain not locked | Yes |
| Nothing merged / publicly released by this task | Yes |
| Bypass secrets / preview hostnames not published in report | Yes |

Note: during authorised probe, Vercel CLI may refresh a **project automation protection-bypass** credential for `vercel curl`. That does not open anonymous access (unauth still 302). Founder may rotate that automation secret in Vercel → Deployment Protection if desired; value is **not** recorded here.

---

## 11. Batch G sequencing note

Per `GC-HARDENING-20260809-BATCHPLAN`: Batch G is config/evidence-only and may run **before** Home SSR merge. Batches **A → D → E → B → C → F** remain queued behind Home SSR (`GC-HOME-SSR-001-R2` / R4 local PASS not yet merged) and sequential evidence gates.

**NOT MERGED AND NOT PUBLICLY DEPLOYED** as a consequence of this evidence pack (docs-only; no product change).

---

**GC-PRIVATE-PREVIEW-GATE-001 status:** **PASSED** (BLK-006 closed)
