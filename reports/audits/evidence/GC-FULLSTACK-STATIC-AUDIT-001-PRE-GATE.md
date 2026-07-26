# GC-FULLSTACK-STATIC-AUDIT-001 - Pre-gate

**Project:** GoalCurrent
**Task:** GC-FULLSTACK-STATIC-AUDIT-001
**Date:** 26/07/2026 (BST)
**Mode:** AUDIT ONLY
**Agent context:** Continued in the existing Cursor chat (not a new agent), after explicit founder control note. Sprint 002 was already complete; no Sprint 002 work repeated.

---

## Control checks

| Check | Required | Observed | Result |
|-------|----------|----------|--------|
| Branch | recovery/gc-exec-batch-005 | recovery/gc-exec-batch-005 | PASS |
| Starting HEAD | 4d145580bc42c4dc5b2041ff86d790e4414e8efd | 4d145580bc42c4dc5b2041ff86d790e4414e8efd | PASS |
| Sprint 002 implementation HEAD | fe154666d8a8b32c1ae25f84a8db6dac86d34e49 | Present as parent of evidence commit | PASS |
| origin/main | 20515a11b12026bb6e90c47b023cfb582ab8f718 | Match | PASS |
| Tracked application modifications | None overlapping | Clean working tree for tracked files | PASS |
| main modification risk | Forbidden | No checkout/merge of main | PASS |
| Deploy/publish/upload risk | Forbidden | No deploy/publish; scanners local-only | PASS |

**Pre-gate verdict:** PASS - proceed with audit-only documentation evidence.

---

## Local / remote relationship

- Branch tracks origin/recovery/gc-exec-batch-005
- Local ahead 16 commits
- Push forbidden for this audit

### Commits ahead of branch remote (newest first)

```
4d14558 docs(audit): record GC-MVP-READINESS-SPRINT-002 evidence pack
fe15466 fix(seo): mark locale not-found pages as noindex
e00469d fix(seo): noindex preview and development deploys
4b8b6d1 fix(home): fetch Premier League fixtures once on the homepage
82c7f96 test(wc26): expand provider match-status contract coverage
2b9dca2 fix(lint): restore ESLint by stopping jsx-a11y plugin conflict
7bf8044 docs(audit): reconcile Sprint 001 HEAD versus evidence-report SHAs
4674dea docs(audit): set GC-MVP-READINESS-SPRINT-001 final HEAD SHA
c9ca69d docs(audit): finalize GC-MVP-READINESS-SPRINT-001 ending SHA
8d6aeb8 docs(audit): record GC-MVP-READINESS-SPRINT-001 evidence pack
e7c5219 test(e2e): add mobile critical football journey coverage
9c05aeb fix(perf): stop WC26 score polling after archive complete
32bb530 fix(seo): drop redirect hub match URLs from sitemap
912bee2 fix(live): clarify archive empty and sync failure states
8ba5c98 fix(wc26): stop treating kickoff lag as live status
bbaa282 docs(audit): establish approved GoalCurrent recovery baseline
```

Audited-code SHA: 4d145580bc42c4dc5b2041ff86d790e4414e8efd (last functional commit fe154666...).

---

## Untracked files preserved

- .mcp.json
- GC-SOT-CLOSURE-R2-STAGE-01(1).md
- GC-SOT-RECOVERY-CLOSURE-001-draft.md
- reports/audits/GC-SOT-RECOVERY-CLOSURE-001-R1.md
- reports/audits/GC-SOT-RECOVERY-CLOSURE-001.md
- reports/audits/evidence/GC-SOT-CLOSURE-R2-STAGE-01.md
- scripts/_fix_closure.py
- scripts/_mvp_route_discover.py

---

## Runtime / package inventory

| Item | Value |
|------|-------|
| Package manager | npm (packageManager npm@11.13.0; package-lock.json present) |
| Local Node | v24.16.0 |
| Engines | >=20.9.0 (CI uses Node 20) |
| Framework | Next.js 16.2.9, React 19.2.4 |
| Hosting | vercel.json cron; platform Vercel |

Scripts: dev, build, start, lint, prebuild, sync:flags, sync:figma-lineups, i18n:check, verify:design, test:unit, test:i18n, test:e2e, test:visual, test:visual:update, lighthouse:home

---

## Delivery / quality configuration

| Area | Present | Notes |
|------|---------|-------|
| CI | Yes | .github/workflows/ci.yml |
| Vercel | Yes | cron 0 6 * * * -> /api/cron/refresh-content |
| ESLint | Yes | eslint.config.mjs |
| TypeScript | Yes | tsconfig.json |
| Playwright | Yes | playwright.config.ts |
| Unit tests | Yes | npm run test:unit |

---

## Scanner availability

| Tool | Present | Decision |
|------|---------|----------|
| Semgrep | No | SEMGREP NOT EXECUTED - TOOLING UNAVAILABLE |
| Sonar | No config/endpoint | SONAR NOT EXECUTED - Sonar-style manual only |
| gitleaks/trufflehog | No | Manual secrets inspection |
| npm audit | Yes | Executed read-only |

Stop conditions: no prod credentials, no external upload, no lockfile mutation, no app-code changes, no push/merge/deploy/PR#11 changes.