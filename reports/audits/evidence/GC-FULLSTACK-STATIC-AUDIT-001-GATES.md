# GC-FULLSTACK-STATIC-AUDIT-001 - Quality gate results

| Gate | Command | Exit | Totals / notes |
|------|---------|------|----------------|
| Typecheck | npx tsc --noEmit | 0 | PASS |
| Unit | npm run test:unit | 0 | 134 pass / 0 fail; duration_ms ~4946 |
| Lint | npx eslint . --max-warnings 99999 | 1 | FAIL 41 errors / 60 warnings |
| Production build | npm run build | 0 | PASS (Compiled successfully; YouTube key absent logged) |
| Playwright critical | npx playwright test tests/e2e/homepage.spec.ts tests/e2e/live-journey.spec.ts tests/e2e/mobile-critical-journey.spec.ts tests/e2e/locale-mobile-nav.spec.ts --project=chromium | 0 | 7 passed (~2.4m) |
| npm audit | npm audit | 1 | 15 vulns (0 critical, 8 high, 7 moderate) - advisory; see NPM-AUDIT* |

Not run as separate named scripts (not configured or covered by above):
- Dedicated formatting check (no prettier format:check script)
- Full visual regression suite (test:visual) - not required subset here
- Lighthouse against production (would hit live site; skipped for audit isolation)
- Route/SEO validation beyond unit tests already present (deploy-robots, not-found, sitemap coverage from prior sprints)

Failures were not remediated (audit-only).