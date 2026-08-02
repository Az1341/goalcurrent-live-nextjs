# GC-MVP-READINESS-SPRINT-021-R3-CLOSEOUT

**Project:** GoalCurrent  
**Report code:** GC-MVP-READINESS-SPRINT-021-R3-CLOSEOUT  
**DKAMS code:** GC-MVP-READINESS-SPRINT-021-R3-CLOSEOUT  
**Type:** FE-012 R3 closeout — five blocking-defect corrections only  
**Owner:** Cursor  
**Finding:** FE-012  
**Branch:** `recovery/gc-exec-batch-005`  
**Date:** 31/07/2026 (BST)  
**Status:** COMPLETE — PENDING INDEPENDENT AUDIT / FORMAL VERDICT  
**FE-012 closure claim:** **NOT claimed.** Report returned for Ahmad independent audit.

---

## 1. Starting gate

| Check | Result |
|------|--------|
| Branch | `recovery/gc-exec-batch-005` |
| Approved Sprint 020 baseline | `b882f1eff3ae0e0e0368133dbc5c1e403ad1022b` |
| Starting HEAD (closeout gate) | `797690e738d13d3e6b4ef3170ceaaf5b42c3e267` |
| Implementation/test correction commit | `01ea8220509b6a6d3e3924f00078335c4e427089` |
| Implementation parent SHA | `797690e738d13d3e6b4ef3170ceaaf5b42c3e267` |
| Evidence/report commit | Created after this report; full SHA supplied in completion response (self-reference avoided) |
| Evidence commit role | Parent = implementation SHA above; contains only this report file |
| Dirty tracked tree at start | Clean at gate; closeout prep then applied as local delta |
| Protected untracked | Left untouched (`.mcp.json`, SoT drafts, `_s021*` temp evidence, helper scripts) |
| Unrelated findings | FE-014 / BE-001 / BE-003 untouched |

---

## 2. Complete Sprint 021 provenance (approved baseline → HEAD)

History is **linear** (`git rev-list --count --merges b882f1e..HEAD` = **0**).  
No Sprint 021 commit altered FE-014, BE-001, or BE-003.

`git log --oneline --decorate b882f1eff3ae0e0e0368133dbc5c1e403ad1022b^..HEAD` (at implementation tip; evidence commit follows):

```
01ea822 (HEAD) fix(security): pin sanitize-html 2.17.5 and close FE-012 R3 audit gaps
797690e docs(audit): fill Sprint 021-R3 evidence ending HEAD
3d8b014 docs(audit): record GC-MVP-READINESS-SPRINT-021-R3 evidence pack
d04aca3 fix(security): replace FE-012 article sanitiser with sanitize-html allowlist
8285ddf docs(audit): reconcile Sprint 021-R2 ending HEAD to tip
7a1192f docs(audit): fill Sprint 021-R2 evidence ending HEAD
96d9358 docs(audit): record GC-MVP-READINESS-SPRINT-021-R2 evidence pack
37c11e8 fix(security): harden FE-012 article HTML scheme obfuscation (021-R2)
2c0f7d0 docs(audit): reconcile Sprint 021 ending HEAD to tip
bcf6b30 docs(audit): fill Sprint 021 evidence ending HEAD
a1cc1a5 docs(audit): record GC-MVP-READINESS-SPRINT-021 evidence pack
7658a01 fix(security): lint-safe FE-012 article HTML sanitiser (no ReDoS regex)
6b6397a fix(security): sanitize article HTML and escape JSON-LD script sinks (FE-012)
49458c2 docs(audit): reconcile Sprint 020 ending HEAD to tip b882f1e
b882f1e docs(audit): reconcile Sprint 020 ending HEAD to tip
```

### Chronological commits (full SHA, subject, role, parent, files)

| Full SHA | Subject | Role | Parent | Files |
|----------|---------|------|--------|-------|
| `b882f1eff3ae0e0e0368133dbc5c1e403ad1022b` | docs(audit): reconcile Sprint 020 ending HEAD to tip | **Approved Sprint 020 baseline** | (prior) | Sprint 020 report |
| `49458c2e88359d2c80f54c931d7080e44660f1d9` | docs(audit): reconcile Sprint 020 ending HEAD to tip b882f1e | Sprint 020 tip fill | `b882f1e…` | `GC-MVP-READINESS-SPRINT-020-R1.md` |
| `6b6397a6434e903c175f57588e943630df6be9ee` | fix(security): sanitize article HTML and escape JSON-LD… | **R1 implementation** | `49458c2…` | ArticleBodyWithAd, JsonLd*, sanitize-article-html, serialize-json-ld, fe-012 tests |
| `7658a01161b7e4463e8dc057b2078a214f176952` | fix(security): lint-safe FE-012 article HTML sanitiser… | **R1 lint-safe follow-up** | `6b6397a…` | `sanitize-article-html.ts` |
| `a1cc1a50b51a691d6fc1a118765684022df5ed06` | docs(audit): record GC-MVP-READINESS-SPRINT-021 evidence pack | **R1 evidence** | `7658a01…` | `GC-MVP-READINESS-SPRINT-021-R1.md` |
| `bcf6b30fc9f36d85de3340c8608aa6b1b2fcaa16` | docs(audit): fill Sprint 021 evidence ending HEAD | R1 evidence SHA fill | `a1cc1a5…` | R1 report |
| `2c0f7d0418a59b13a9f3d98796bcc9a171032b44` | docs(audit): reconcile Sprint 021 ending HEAD to tip | R1 tip reconcile | `bcf6b30…` | R1 report |
| `37c11e8615f5c09828759b9ae5b0c5bf271ac233` | fix(security): harden FE-012 article HTML scheme obfuscation | **R2 correction** (reported, not approved baseline) | `2c0f7d0…` | sanitiser + tests |
| `96d9358196d67d88fc85b5b58e4c9bcbf981655b` | docs(audit): record GC-MVP-READINESS-SPRINT-021-R2 evidence pack | **R2 evidence** | `37c11e8…` | R2 report |
| `7a1192f1739c5a2c561f9b71d93e13c556c6dd70` | docs(audit): fill Sprint 021-R2 evidence ending HEAD | R2 SHA fill | `96d9358…` | R2 report |
| `8285ddff8c31d3afe1c0bf4fde5f383d008ef417` | docs(audit): reconcile Sprint 021-R2 ending HEAD to tip | R2 tip reconcile | `7a1192f…` | R2 report |
| `d04aca3c1ce3806c18d4ceab94a9bf39e657912a` | fix(security): replace FE-012 article sanitiser with sanitize-html allowlist | **R3 structural-sanitiser implementation** | `8285ddf…` | package*, sanitiser, ArticleBodyWithAd, article page, serialize-json-ld, tests |
| `3d8b014d1c1e374150bb607650758cee34089e56` | docs(audit): record GC-MVP-READINESS-SPRINT-021-R3 evidence pack | **R3 evidence** | `d04aca3…` | R3 report |
| `797690e738d13d3e6b4ef3170ceaaf5b42c3e267` | docs(audit): fill Sprint 021-R3 evidence ending HEAD | R3 tip fill / closeout start | `3d8b014…` | R3 report |
| `01ea8220509b6a6d3e3924f00078335c4e427089` | fix(security): pin sanitize-html 2.17.5 and close FE-012 R3 audit gaps | **This closeout correction** | `797690e…` | package.json, package-lock.json, sanitize-article-html.ts, fe-012 tests |
| *(evidence tip)* | docs(audit): record GC-MVP-READINESS-SPRINT-021-R3-CLOSEOUT | **This closeout evidence** | `01ea822…` | this file only |

**Baseline rule:** Approved baseline is Sprint 020 tip `b882f1e…`. Intermediate tips (`8285ddf…`, `797690e…`) are **not** treated as approved baselines.

### Final diff summary (approved baseline → implementation HEAD)

```
 package-lock.json                                | 166 ++++++++-
 package.json                                     |   2 +
 reports/audits/GC-MVP-READINESS-SPRINT-020-R1.md |   4 +-
 reports/audits/GC-MVP-READINESS-SPRINT-021-R1.md | 299 ++++++++++++++++
 reports/audits/GC-MVP-READINESS-SPRINT-021-R2.md | 173 ++++++++++
 reports/audits/GC-MVP-READINESS-SPRINT-021-R3.md | 200 +++++++++++
 src/app/[locale]/articles/[slug]/page.tsx        |   9 +-
 src/components/articles/ArticleBodyWithAd.tsx    |  28 +-
 src/components/seo/JsonLd.tsx                    |   7 +-
 src/components/seo/JsonLdScript.tsx              |   7 +-
 src/lib/sanitize-article-html.ts                 |  86 +++++
 src/lib/seo/serialize-json-ld.ts                 |  11 +
 tests/lib/fe-012-xss-sanitize.test.mjs           | 412 +++++++++++++++++++++++
 13 files changed, 1384 insertions(+), 20 deletions(-)
```

(Evidence commit adds only this report path.)

---

## 3. Exact files changed by this closeout (implementation commit)

1. `package.json` — pin `"sanitize-html": "2.17.5"` (exact)  
2. `package-lock.json` — lock `sanitize-html@2.17.5` + `htmlparser2@10.1.0` tree (vs 2.17.6 / htmlparser2@12)  
3. `src/lib/sanitize-article-html.ts` — optional `sanitizeHtmlImpl` injection for fail-closed tests (production default unchanged)  
4. `tests/lib/fe-012-xss-sanitize.test.mjs` — duplicate/broken-attribute, comments/encoded, fail-closed fixtures  

---

## 4. Defect 1 — Node compatibility

| Item | Evidence |
|------|----------|
| Rejected | `sanitize-html@2.17.6` declares `engines.node: ">=22.12.0"` (official package.json) |
| Selected | `sanitize-html@2.17.5` — **no `engines` field** (official package.json + installed metadata `engines: null`) |
| GoalCurrent engines | `package.json` / lock root: `node >=20.9.0` |
| packageManager | `npm@11.13.0` |
| CI | `.github/workflows/ci.yml` → `node-version: "20"` |
| Vercel | `vercel.json` has no Node override; project engines remain `>=20.9.0` |
| Installed | `node_modules/sanitize-html` version `2.17.5` |
| Transitive (2.17.5) | deepmerge, escape-string-regexp, htmlparser2@^10.1.0, is-plain-object, parse-srcset, postcss, launder |
| Lockfile impact | `package-lock.json` +48/−159 vs pre-closeout tip (downgrade 2.17.6→2.17.5; htmlparser2 12→10) |
| Security advisory | `npm audit --omit=dev` JSON: **no** vulnerability entry for `sanitize-html` or its direct tree names checked (`sanitize-html` absent from advisories) |
| Node 20 verification | Portable **v20.19.4**: require+sanitize PASS; focused FE-012 **42/42**; `npm run build` **PASS** |
| Default host Node | v24.16.0 (gates also run here); project contract unchanged |

**Acceptance:** Structural sanitisation works on Node >=20.9.0 without raising GoalCurrent engines.

---

## 5. Defect 2 — Hostile fixture matrices

### Duplicate / broken attributes

| Named test | Asserted safe outcome |
|------------|----------------------|
| duplicate href (hostile + safe) | no `javascript`; if href kept → `/articles` only |
| duplicate target/rel | `target`/`rel` absent; `href="/ok"` retained |
| broken quoted attributes | no `onclick` / `alert(`; text retained |
| broken unquoted attributes | no `onclick` / `id=`; `<p>text</p>` |
| angle brackets inside attributes | no script tags; `href="/x"` |
| malformed attrs + handlers | no onerror/onload/alert; text retained |
| mixed-case event handlers | no `on*=`; exact `<p>x</p>` |
| parser recovery malformed permitted | no script tags; ok/bold|nest retained |

### Comments / encoded markup

| Named test | Asserted safe outcome |
|------------|----------------------|
| script inside HTML comments | no script/alert; `<p>safe</p>` |
| conditional-comment-style | no script; `<p>safe</p>` |
| entity-encoded script | no real `<script` tag |
| double-encoded dangerous protocol | no javascript/vbscript/data href |
| encoded event-handler-like | no real `onclick=` attribute (`<\w[^>]*\sonclick`); may retain inert text |
| comments around dangerous protocols | no javascript / script: href |
| encoded angle brackets | no `<img`; no onerror attribute; encoded `&lt;` retained |

---

## 6. Defect 3 — Fail-closed exception test

| Check | Result |
|-------|--------|
| Trigger | `sanitizeHtmlImpl` mock throws (test-only deps; production uses real sanitize-html) |
| Hostile input | `<script>alert("xss")</script><p>visible</p>` |
| Result | `""` — not original; no script/visible passthrough |
| ArticleBodyWithAd | Sink binds only `safeHtml`; `__html: html` absent; failure path yields `""` |
| User-facing errors | Not exposed (empty catch → `""`) |

---

## 7. Structural sanitizer contract (unchanged allowlists)

- **Tags:** p, h1–h6, ul, ol, li, em, strong, blockquote, br, a  
- **Attrs:** `a[href|title]` only  
- **Schemes:** http, https + relative; `allowProtocolRelative: false`  
- **Fail-closed:** exceptions → `""`  
- **JSON-LD:** `serializeJsonLd` escapes `</script>` → `\u003c` and U+2028/U+2029; JsonLd / JsonLdScript consume it only — **assurance PASS** (existing R3 sink tests still green)

---

## 8. Verification gates (closeout)

| Gate | Command | Result |
|------|---------|--------|
| Focused FE-012 | `npx tsx --test tests/lib/fe-012-xss-sanitize.test.mjs` | **42/42 PASS** (Node v24.16.0) |
| Full unit | `npm run test:unit` | **293/293 PASS** |
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0) |
| Scoped lint | `npx eslint src/lib/sanitize-article-html.ts tests/lib/fe-012-xss-sanitize.test.mjs` | **PASS** (0 findings) |
| Full lint | `npm run lint` | **33 errors / 56 warnings** — equals established ceiling (no regression) |
| Production build | `npm run build` | **PASS** (Node v24.16.0) |
| FE-010 Playwright | `npx playwright test tests/e2e/fe-010-pl-fixtures-key.spec.ts --project=chromium` | **390×844 PASS**; **1440×900 PASS** |
| FE-015 Playwright | `npx playwright test tests/e2e/fe-015-finished-match-poll.spec.ts --project=chromium` | **390×844 PASS**; **1440×900 PASS** |
| Combined PW | both specs | **4/4 PASS** (after Chromium install; first fail was missing browser binary — not product) |
| Node 20 focused | PATH=`node-v20.19.4` + focused suite | **42/42 PASS** @ v20.19.4 |
| Node 20 build | PATH=`node-v20.19.4` + `npm run build` | **PASS** @ v20.19.4 |
| Advisory scoped | `npm audit --omit=dev` JSON filter | **no sanitize-html tree advisories** |

Playwright first attempt failed with missing `chrome-headless-shell` under sandbox browser path. Controlled remediation: `npx playwright install chromium`, then **one** controlled rerun → **4/4 PASS**. Classified as environment/browser install gap with exact evidence, not a product defect.

---

## 9. Five blocking defects — resolution

| # | Defect | Resolution | Status |
|---|--------|------------|--------|
| 1 | Node compatibility | Pin `sanitize-html@2.17.5`; Node 20.19.4 tests+build PASS; engines contract unchanged | **RESOLVED** |
| 2 | Missing hostile fixtures | Named tests for duplicate/broken attrs + comments/encoded; assert safe final output | **RESOLVED** |
| 3 | Fail-closed test | Forced throw → `""`; ArticleBodyWithAd sink cannot render hostile original | **RESOLVED** |
| 4 | Evidence commit identity | Separate impl `01ea822…` then evidence commit (SHA in completion response) | **RESOLVED** |
| 5 | Baseline reconciliation | Full chain from `b882f1e…` documented; unapproved tips not treated as baseline | **RESOLVED** |

---

## 10. Residual risks

- Encoded/hostile strings may remain as **inert text** after structural discard (by design).  
- `sanitize-html@2.17.5` is one patch behind latest; do not upgrade to 2.17.6 without Node engine policy change.  
- Ambient repo `npm audit` noise outside sanitize-html tree (e.g. firebase-admin/uuid) pre-exists; **out of scope**.  
- FE-012 formal closure still requires Ahmad independent audit / Founder Approval path.

---

## 11. Control confirmations

- Scope limited to the five blockers.  
- No alternate sanitiser introduced.  
- Project Node engine not raised.  
- No general dependency upgrades / general lint cleanup.  
- FE-014, BE-001, BE-003 untouched.  
- Sprint 022 not started.  
- Nothing pushed, merged, deployed, or released.  
- Independent approval **not** claimed.

---

**GC-MVP-READINESS-SPRINT-021-R3-CLOSEOUT status:** COMPLETE (pending independent audit)