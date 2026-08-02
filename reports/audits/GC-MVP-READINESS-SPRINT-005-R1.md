# GC-MVP-READINESS-SPRINT-005-R1

**Project:** GoalCurrent  
**Report code:** GC-MVP-READINESS-SPRINT-005-R1  
**Type:** Controlled preview indexing protection  
**Date:** 26/07/2026 (BST)  
**Branch:** recovery/gc-exec-batch-005  
**Canonical audit baseline:** GC-FULLSTACK-STATIC-AUDIT-001-R2 (preserved)  
**Authorised finding:** FE-008 only  
**Status:** COMPLETE  

---

## 1. Completion verdict

COMPLETE for authorised Sprint 005 scope. Preview/non-production `robots.txt` now disallows crawling and omits sitemap advertisements, while confirmed production remains Allow + sitemap pointers. Page-level `deployRobotsMetadata` / `X-Robots-Tag` from Sprint 002 remain in place. No push, merge, or deployment.

## 2. Pre-execution gate

| Check | Result |
|-------|--------|
| Branch | recovery/gc-exec-batch-005 PASS |
| Starting HEAD | `00f5a12acba2263b63ef36a387b5201cc0e73646` PASS |
| Tracked overlap | None PASS |
| Untracked SoT drafts | Preserved |

## 3. R2 traceability (FE-008)

- **Location:** `src/lib/seo/robots-txt.ts`; `/api/robots`; robots rewrite in `src/proxy.ts`
- **Before:** Always `Allow: /` + Sitemap lines regardless of deploy
- **Root cause:** robots.txt not gated by `shouldNoIndexDeploy()`
- **Correction:** Reuse `shouldNoIndexDeploy`; preview/dev → `Disallow: /` and no Sitemap lines; production unchanged Allow + sitemaps
- **Required tests:** robots body under `VERCEL_ENV=preview` / production
- **Preview blocker:** Yes | **Production blocker:** No (R2)

## 4. Environment contract (Source of Truth)

Detection SoT: `shouldNoIndexDeploy()` in `src/lib/seo/deploy-robots.ts` (`VERCEL_ENV` first; local `NODE_ENV=development` only when Vercel env unset).

| Environment | Signal | robots.txt | Page metadata / X-Robots-Tag |
|-------------|--------|------------|------------------------------|
| Production | `VERCEL_ENV=production` | Allow:/ ; Disallow:/api/ ; Sitemap (SITE_URL) | Indexable (no deploy noindex) |
| Vercel preview | `VERCEL_ENV=preview` | Disallow:/ ; no Sitemap | noindex,nofollow |
| Vercel development | `VERCEL_ENV=development` | Disallow:/ ; no Sitemap | noindex,nofollow |
| Local `next dev` | `NODE_ENV=development` (no VERCEL_ENV) | Disallow:/ ; no Sitemap | noindex,nofollow |
| Local `next start` | `NODE_ENV=production` (no VERCEL_ENV) | Allow + Sitemap | Indexable (intentional) |

Hostname is not used for this decision.

## 5. SHAs

| Role | SHA |
|------|-----|
| Starting HEAD | `00f5a12acba2263b63ef36a387b5201cc0e73646` |
| Audited implementation HEAD | `e80cb3d1afa2074bccf04dee0dc8d82ac6df44bf` |
| Evidence/report commit | Reported separately in Cursor final response |
| origin/main (unchanged) | `20515a11b12026bb6e90c47b023cfb582ab8f718` |

## 6. Files changed

- `src/lib/seo/robots-txt.ts` — env-aware `buildRobotsTxt`
- `src/app/api/robots/route.ts` — noindex Cache-Control + `X-Robots-Tag` on preview; production cache unchanged
- `src/proxy.ts` — attach `X-Robots-Tag` on `/robots.txt` rewrite for preview
- `tests/lib/robots-txt.test.mjs` — new focused contract tests

## 7. Before / after indexing matrix

| Surface | Production before → after | Preview before → after |
|---------|---------------------------|------------------------|
| robots.txt body | Allow + Sitemap → **unchanged** | Allow + Sitemap → **Disallow:/ ; no Sitemap** |
| robots response headers | public cache | private,no-store + X-Robots-Tag |
| Layout metadata | indexable | noindex (Sprint 002; unchanged) |
| HTML X-Robots via proxy | none | noindex (Sprint 002; unchanged) |
| Sitemap route content | production SITE_URL paths | unchanged generator (not advertised by preview robots) |
| Canonicals (SITE_URL) | production | production SITE_URL defaults unchanged |

## 8. Production-safety proof (local, no deploy)

Proven by unit tests that `buildRobotsTxt({ VERCEL_ENV: "production", ... })`:
- includes `Allow: /`
- does **not** include site-wide `Disallow: /`
- includes Sitemap lines to `https://goalcurrent.live/...`

Also: `VERCEL_ENV=production` wins over `NODE_ENV=development`.  
`shouldNoIndexDeploy({ VERCEL_ENV: "production" }) === false` (existing deploy-robots tests).

No live Vercel production deploy was created or required.

## 9. Gate results

| Gate | Result |
|------|--------|
| Unit | **PASS 158/158** |
| FE-001/002/003/005/006 + robots spot-check | **PASS 35/35** |
| Typecheck | **PASS** |
| Lint scoped | **PASS** (exit 0; pre-existing unsafe-regex warning on proxy untouched pattern) |
| Lint full | **FAIL 39 errors / 60 warnings** (unchanged vs Sprint 004) |
| Build | **PASS** |
| Playwright homepage | **PASS 1/1** |

## 10. Secrets / leakage

- No env secret values printed
- robots bodies contain only public SITE_URL defaults
- No preview hostname emitted as canonical

## 11. Remaining risks

- FE-007, FE-009–015 and other R2 items unchanged
- Inherited BLK-006 (Deployment Protection platform proof) still OPEN — code indexing controls improved; platform lock not proven here
- Preview sitemap XML still generatable if fetched directly (robots no longer advertise it; page noindex remains)

## 12. Prohibited actions confirmation

- No FE-007 / FE-009–015  
- No general SEO rewrite / competition expansion  
- No dependency or lockfile changes  
- No general lint cleanup  
- No push / merge / deploy / public release  
- R2 not rewritten  

---

**GC-MVP-READINESS-SPRINT-005 status:** COMPLETE