# GC-MVP-READINESS-SPRINT-021-R3

**Project:** GoalCurrent  
**Report code:** GC-MVP-READINESS-SPRINT-021-R3  
**DKAMS code:** GC-MVP-READINESS-SPRINT-021-R3  
**Type:** FE-012 structural-sanitiser correction (authorised dependency)  
**Owner:** Cursor  
**Finding:** FE-012  
**Branch:** `recovery/gc-exec-batch-005`  
**Date:** 30/07/2026 (BST)  
**Status:** COMPLETE — PENDING INDEPENDENT AUDIT / FORMAL VERDICT  
**FE-012 closure claim:** **NOT claimed.** Report returned for Ahmad independent audit.

---

## 1. Repository gate (TASK 01)

| Check | Result |
|------|--------|
| Branch | `recovery/gc-exec-batch-005` |
| Starting HEAD | `8285ddff8c31d3afe1c0bf4fde5f383d008ef417` |
| Implementation HEAD | `d04aca3c1ce3806c18d4ceab94a9bf39e657912a` |
| Dirty tracked tree at start | Clean |
| Protected untracked | Left untouched |
| `7a1192f1739c5a2c561f9b71d93e13c556c6dd70` | Recorded as reported R2 fill SHA — **not approved** |

### Sprint 021 commit chain (full SHAs from R1 start through R3 impl)

```
d04aca3c1ce3806c18d4ceab94a9bf39e657912a fix(security): replace FE-012 article sanitiser with sanitize-html allowlist 8285ddff8c31d3afe1c0bf4fde5f383d008ef417 docs(audit): reconcile Sprint 021-R2 ending HEAD to tip 7a1192f1739c5a2c561f9b71d93e13c556c6dd70 docs(audit): fill Sprint 021-R2 evidence ending HEAD 96d9358196d67d88fc85b5b58e4c9bcbf981655b docs(audit): record GC-MVP-READINESS-SPRINT-021-R2 evidence pack 37c11e8615f5c09828759b9ae5b0c5bf271ac233 fix(security): harden FE-012 article HTML scheme obfuscation (021-R2) 2c0f7d0418a59b13a9f3d98796bcc9a171032b44 docs(audit): reconcile Sprint 021 ending HEAD to tip bcf6b30fc9f36d85de3340c8608aa6b1b2fcaa16 docs(audit): fill Sprint 021 evidence ending HEAD a1cc1a50b51a691d6fc1a118765684022df5ed06 docs(audit): record GC-MVP-READINESS-SPRINT-021 evidence pack 7658a01161b7e4463e8dc057b2078a214f176952 fix(security): lint-safe FE-012 article HTML sanitiser (no ReDoS regex) 6b6397a6434e903c175f57588e943630df6be9ee fix(security): sanitize article HTML and escape JSON-LD script sinks (FE-012) 49458c2e88359d2c80f54c931d7080e44660f1d9 docs(audit): reconcile Sprint 020 ending HEAD to tip b882f1e
```

---

## 2. Dependency assessment (TASK 02)

| Item | Value |
|------|--------|
| Existing structural sanitiser in package.json/lockfile before R3 | **None** |
| Selected package | `sanitize-html@2.17.6` (MIT) |
| Types | `@types/sanitize-html@2.16.1` (devDependency) |
| Engines note | sanitize-html 2.17.6 declares `node >= 22.12.0`; local Node `v24.16.0`; project engines `>=20.9.0` — document Node 22.12+ for this dependency |
| Direct tree | `sanitize-html` → `htmlparser2@12`, `deepmerge`, `launder`, `escape-string-regexp`, `is-plain-object`, `parse-srcset`, `postcss` |
| DOMPurify / jsdom / other sanitisers | **Not added** |
| Lockfile scope | Only packages required by sanitize-html / types (`package-lock.json` +277/−2 lines in impl commit) |
| Known advisories on sanitize-html itself | No sanitize-html-specific advisory observed at install time; ambient repo `npm audit` noise (brace-expansion / fast-uri) pre-exists and was not broadly upgraded |

---

## 3. Security contract (TASK 03–07)

### Permitted elements
`p`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `ul`, `ol`, `li`, `em`, `strong`, `blockquote`, `br`, `a`

### Permitted attributes
- `a`: `href`, `title` only  
- All other attributes discarded (including `style`, `class`, `onclick`, `target`, `rel`, `data-*`)

### URL protocols (href)
- Allowed: `http`, `https`, relative paths (no scheme)  
- Rejected: `javascript:`, `data:`, `vbscript:`, mixed-case / whitespace / entity-obfuscated variants (via htmlparser2 + scheme filter)  
- Protocol-relative `//…`: **rejected** (`allowProtocolRelative: false`)

### Relative-URL policy
Relative site paths (e.g. `/articles`) **authorised and retained**.

### External-link policy
`https://` (and `http://`) allowed on `href`. No `target` / `rel` invented. Input `target`/`rel` stripped. No new browsing-context behaviour.

### Removed
`script`, `style`, `iframe`, `object`, `embed`, `form`, `input`, SVG, MathML, event handlers, inline CSS, arbitrary data attributes, comments as executable vectors (discarded with disallowed tags).

### Malformed markup
Parsed structurally; nested/broken hostile tags do not restore executable elements. Inert text residue may remain after discard.

### Failure behaviour
`try/catch` around `sanitizeHtml` — on throw returns `""`. Never returns original unsafe HTML.

### Server rendering
`sanitizeArticleHtml` runs in `ArticleBodyWithAd` (server component path for article slug). Deterministic Node htmlparser2 parse.

### Formatting preservation without inline CSS
Article slug page no longer injects `style=` into publisher HTML. Equivalent `h2`/`p` presentation moved to `.article-body` CSS inside `ArticleBodyWithAd`.

---

## 4. Implementation commit

**SHA:** `d04aca3c1ce3806c18d4ceab94a9bf39e657912a`  
**Subject:** `fix(security): replace FE-012 article sanitiser with sanitize-html allowlist`

### Exact changed files
1. `package.json`
2. `package-lock.json`
3. `src/lib/sanitize-article-html.ts`
4. `src/lib/seo/serialize-json-ld.ts`
5. `src/components/articles/ArticleBodyWithAd.tsx`
6. `src/app/[locale]/articles/[slug]/page.tsx`
7. `tests/lib/fe-012-xss-sanitize.test.mjs`

`JsonLd.tsx` / `JsonLdScript.tsx` already consumed `serializeJsonLd` — verified by sink tests; no file change required.

---

## 5. Hostile HTML fixture matrix (TASK 08)

| Fixture class | Result |
|---------------|--------|
| Lower-case script | PASS — removed |
| Mixed-case SCRIPT | PASS — removed |
| Event handlers | PASS — removed |
| javascript: | PASS — href stripped |
| Mixed-case JavaScript: | PASS — href stripped |
| Whitespace/control bypass | PASS — href stripped |
| Entity-encoded bypass | PASS — href stripped |
| data: / vbscript: | PASS — href stripped |
| Protocol-relative | PASS — href stripped |
| iframe/object/embed/form | PASS — removed |
| SVG / MathML | PASS — removed |
| style element + style attr | PASS — removed |
| Nested malformed script | PASS — no executable tags |
| Dangerous attrs on `a` | PASS — stripped |
| target/rel stripped | PASS |
| Legitimate formatting | PASS — preserved |
| Empty input | PASS — `""` |

Focused suite: **25/25 PASS**  
Command: `npx tsx --test tests/lib/fe-012-xss-sanitize.test.mjs`

---

## 6. JSON-LD fixture matrix (TASK 09)

| Fixture | Result |
|---------|--------|
| `</script>` terminator | PASS — `\u003c` escape |
| Mixed-case terminators in objects/arrays | PASS — no raw `<`; JSON.parse OK |
| U+2028 / U+2029 | PASS — escaped; round-trip OK |
| Ampersands / angle brackets | PASS — parseable |

Both sinks verified to call `serializeJsonLd` only (source assertions).

---

## 7. Sink verification (TASK 10)

| Sink | Boundary |
|------|----------|
| `ArticleBodyWithAd.tsx` | `sanitizeArticleHtml(html)` → `dangerouslySetInnerHTML` |
| `JsonLd.tsx` | `serializeJsonLd(data)` → script HTML |
| `JsonLdScript.tsx` | `serializeJsonLd(data)` → script HTML |
| Article slug page | Passes `article.content` only (no inline-style rewrite path) |

---

## 8. Verification gates (TASK 11)

| Gate | Command / note | Result |
|------|----------------|--------|
| Focused FE-012 | `npx tsx --test tests/lib/fe-012-xss-sanitize.test.mjs` | **25/25 PASS** |
| Full unit | `npm run test:unit` | **276/276 PASS** |
| Typecheck | `npx tsc --noEmit` | **PASS** |
| Scoped lint | eslint on R3 changed files | **0 errors** |
| Full lint | `npm run lint` | **33 errors / 56 warnings** (baseline ceiling held) |
| Production build | `npm run build` | **PASS** |
| FE-010 Playwright | mobile 390×844 + desktop 1440×900 | **2/2 PASS** |
| FE-015 Playwright | mobile 390×844 + desktop 1440×900 | **2/2 PASS** |
| Playwright totals | `npx playwright test tests/e2e/fe-010-pl-fixtures-key.spec.ts tests/e2e/fe-015-finished-match-poll.spec.ts --project=chromium` | **4/4 PASS** |

---

## 9. Residual risks

- Not a browser DOM sanitiser; server htmlparser2 vs browser HTML5 edge cases remain theoretically possible (structural dependency chosen to minimise this vs regex).
- Node engine floor of sanitize-html 2.17.6 is 22.12+; hosts on Node 20 need alignment.
- Inert text residue after malformed nesting can remain (non-executable).
- FE-012 **not** declared closed/approved pending independent audit.

---

## 10. Confirmations

- Unrelated findings untouched (FE-014, BE-001, BE-003, FE-013, A11Y-001) — YES  
- No general lint cleanup — YES  
- No Sprint 022 / Champions League / AEO / AI — YES  
- No push / merge / deploy / release — YES  
- Founder private review remains mandatory — YES  

---

## 11. Ending state

| Field | Value |
|-------|--------|
| Starting HEAD | `8285ddff8c31d3afe1c0bf4fde5f383d008ef417` |
| Implementation SHA | `d04aca3c1ce3806c18d4ceab94a9bf39e657912a` |
| Ending HEAD | `3d8b014d1c1e374150bb607650758cee34089e56` |
| FE-012 status for programme | **Open pending Ahmad formal verdict** (R3 structural correction delivered) |

**Sprint 021-R3 status: COMPLETE — AWAITING INDEPENDENT AUDIT**
