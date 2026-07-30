# GC-MVP-READINESS-SPRINT-021-R2

**Project:** GoalCurrent  
**Report code:** GC-MVP-READINESS-SPRINT-021-R2  
**DKAMS code:** GC-MVP-READINESS-SPRINT-021-R2  
**Type:** FE-012 Security Assurance Rework  
**Owner:** Cursor  
**Candidate:** FE-012 only (no second finding)  
**Branch:** `recovery/gc-exec-batch-005`  
**Date:** 30/07/2026 (BST)  
**Status:** COMPLETE  
**Supersedes residual-risk claims in:** `reports/audits/GC-MVP-READINESS-SPRINT-021-R1.md`  

---

## 1. Authorisation and scope

Continue in the existing Sprint 021 chat. Complete the already-authorised **FE-012 Security Assurance Rework**. Do not start another finding. Do not push, merge, deploy or release.

**In-scope (R1 residual security gap):** R1 closed the canonical sinks but left a documented limitation that the stripper was defense-in-depth only. Adversarial probing after R1 showed remaining **URL-scheme obfuscation** bypasses:

- `javascript&#58;…` (HTML entity colon)
- `java\tscript:` / `java\nscript:` (whitespace inside scheme)

**Out of scope:** FE-013/014, A11Y-001, BE-001/003, DOMPurify/dependency addition, ThemeScript, football-data, polling, lockfile, env/Vercel, general lint cleanup.

---

## 2. Pre-execution git gate

| Check | Result |
|------|--------|
| Branch | `recovery/gc-exec-batch-005` |
| Starting HEAD (R1 tip) | `2c0f7d0418a59b13a9f3d98796bcc9a171032b44` |
| Tracked tree at R2 start | Clean (protected untracked only) |
| Protected untracked | Left untouched (`.mcp.json`, SoT drafts/scripts, `_s021*` evidence temps) |

---

## 3. Canonical FE-012 (unchanged wording)

From `reports/audits/GC-FULLSTACK-STATIC-AUDIT-001-R2.md`:

> #### FE-012 — Unsanitised article HTML + JSON-LD script sink  
> - **Severity:** MINOR  
> - **Location:** `ArticleBodyWithAd.tsx`; `JsonLd.tsx` / `JsonLdScript.tsx`  
> - **Recommended correction:** Sanitize HTML; escape `</script>` in JSON-LD  
> - **Required tests:** XSS fixture strings  

R1 already wired sanitise + JSON-LD `\u003c` escape. R2 hardens HTML URL-scheme handling only.

---

## 4. Before-change assurance proof (R2)

Probe against R1 sanitiser (`scripts` ephemeral; not committed):

| Fixture | R1 result |
|---------|-----------|
| `javascript&#58;alert(1)` | **BYPASS** — href retained |
| `java\tscript:alert(1)` | **BYPASS** — href retained |
| `java\nscript:alert(1)` | **BYPASS** — href retained |
| Uppercase `<SCRIPT>` | Stripped (already OK) |
| `<svg>` / `<iframe>` | Stripped (already OK) |
| Plain `javascript:` | Neutralised (already OK) |
| JSON-LD `</script>` breakout | Escaped (already OK) |

---

## 5. Isolation verdict

**PROCEED** — FE-012-only; no public API change; no football-data / polling / deps / FE-014.

**Root cause (R2):** URL attribute checks matched literal `javascript:` only; entity-encoded `:` and intra-scheme whitespace were not normalised.  
**Smallest correction:** Decode basic numeric/named entities and strip ASCII control/whitespace before scheme classification; rewrite dangerous URL attrs to `#`.  
**Files:** `src/lib/sanitize-article-html.ts`; `tests/lib/fe-012-xss-sanitize.test.mjs`.

---

## 6. Implementation

**Commit:** `37c11e8615f5c09828759b9ae5b0c5bf271ac233`  
**Subject:** `fix(security): harden FE-012 article HTML scheme obfuscation (021-R2)`

### Changed behaviour
- `decodeBasicEntities` for `&#…;`, `&#x…;`, `&colon;`, `&tab;`, `&newline;`
- Compact control/whitespace then test `/^(?:javascript|vbscript|data):/i`
- Quoted and unquoted `href|src|xlink:href|action|formaction|poster` rewritten to `#` when dangerous

### Unchanged
- Component sinks (`ArticleBodyWithAd`, `JsonLd`, `JsonLdScript`)
- `serializeJsonLd`
- No lockfile / dependency / env / Vercel change

---

## 7. Test-to-requirement matrix (R2)

| Requirement | Coverage |
|-------------|----------|
| R1 XSS fixtures still green | 9 baseline tests PASS |
| Entity-scheme bypass closed | `FE-012 R2: … HTML-entity scheme` |
| Whitespace-scheme bypass closed | `FE-012 R2: … whitespace-obfuscated` |
| Uppercase SCRIPT | assurance test |
| svg/iframe sinks | assurance test |
| Editorial happy path | preserved |
| Empty input | preserved |
| JSON-LD escape | preserved |

Focused: **13/13 PASS** (9 R1 + 4 R2).

---

## 8. Validation gates

| Gate | Result |
|------|--------|
| Focused FE-012 | **13/13 PASS** |
| Full unit | **264/264 PASS** (260 + 4) |
| Typecheck (`tsc --noEmit`) | **PASS** |
| Scoped lint (changed files) | **0 errors** |
| Full lint | **33 errors / 56 warnings** (ceiling OK) |
| Production build | **PASS** |
| FE-012 Playwright | **N/A** — string sanitisation; XSS fixtures remain the required method |
| Adjacent Playwright re-run | Not required for this string-only assurance delta; R1 already recorded FE-010/015 viewport PASS and env flakes on FE-007/articles |

---

## 9. Impact audit

| Area | Impact |
|------|--------|
| Canonical FE-012 | Strengthened HTML URL-scheme defense |
| JSON-LD | Unchanged (already escaped) |
| Mobile/desktop UI | No layout/CSS change |
| Keyboard / a11y | Untouched |
| Locale / navigation | Untouched |
| Football-data / polling / fan-out | Untouched |
| Caching / BE-012 stale | Untouched |
| Dependencies / env / Vercel | Untouched |
| FE-014 | Untouched |
| BE-001 / BE-003 | Remain OPEN, untouched |

**Residual limitation (honest):** Still not a full HTML parser/DOMPurify. R2 closes the probed scheme-obfuscation class without new dependencies. Exotic parser-differential attacks remain outside MINOR defense-in-depth scope.

---

## 10. Ending state

| Field | Value |
|-------|--------|
| Starting HEAD | `2c0f7d0418a59b13a9f3d98796bcc9a171032b44` |
| Implementation SHA | `37c11e8615f5c09828759b9ae5b0c5bf271ac233` |
| Ending HEAD | `PENDING_EVIDENCE_COMMIT` |
| FE-012 | CLOSED with R2 security assurance |
| Other findings | Unchanged |
| Push / merge / deploy | **None** |

---

## 11. Confirmations

1. FE-012 only — YES  
2. R1 residual scheme bypasses closed and tested — YES  
3. No second finding — YES  
4. No dependency/lockfile/env/Vercel — YES  
5. No football-data / polling — YES  
6. FE-014 untouched — YES  
7. BE-001 / BE-003 open untouched — YES  
8. Focused + full unit + typecheck + scoped lint 0 + full lint ≤33/56 + build PASS — YES  
9. Nothing pushed, merged, deployed or released — YES  

**Sprint 021-R2 status: COMPLETE**
