# GoalCurrent.live — Launch Readiness Source of Truth

**Updated:** 21 August 2026, 11:30 BST  
**Production:** https://goalcurrent.live  
**Production commit:** `475772a`  
**Launch reliability candidate:** PR #65 — `fix/gc-launch-reliability-20260821`  
**Release policy:** protected preview and explicit Founder Approval required before merge or production deployment.

## Current verdict

**AMBER — production is operational; the launch-reliability candidate is ready for Founder review but is not approved for production.**

| Area | Status | Verified evidence |
|---|---|---|
| Production availability | PASS | Homepage and `/live` render current content; no framework error overlay |
| Latest production deploy | PASS | Vercel deployment `dpl_Gr1jEdDaFZtQDHgJRoedeo6MPVia` READY on `475772a` |
| Runtime errors | PASS | No grouped Vercel runtime-error clusters in the latest 24-hour query |
| API-Football reliability | PENDING RELEASE | PR #65 adds fixture cache, singleflight dedupe, status-aware TTLs and stale-success fallback |
| Health monitoring | PENDING RELEASE | PR #65 adds quota-free `/api/health`; external alerting is still not configured |
| TypeScript | PASS | `npx tsc --noEmit` |
| i18n | PASS | Message key parity OK |
| Design fundamentals | PASS | `verify:design OK` |
| Targeted reliability tests | PASS | 6/6 |
| Changed-file lint | PASS | No errors |
| Full-repository lint | BASELINE DEBT | 41 pre-existing errors outside PR #65 |
| Protected preview | READY / ACCESS LIMITED | Vercel build READY; preview requires authenticated Vercel access and no temporary share URL was issued |
| Production release | BLOCKED BY POLICY | Requires Ahmad's explicit Founder Approval after review |

## Candidate acceptance criteria

- Concurrent identical Premier League match-detail loads do not multiply the upstream fan-out.
- Successful fixture data is cached by fixture and status.
- Provider failure may serve last-known successful data marked `stale: true` and `X-GC-Stale: 1`.
- Stale responses use `Cache-Control: no-store`.
- Invalid fixture IDs retain the strict not-found path.
- `/api/health` makes no API-Football request and exposes no credentials.
- No merge or production deployment occurs without Founder Approval.

## Open launch risks

1. API-Football throttling remains present in production until PR #65 is approved and released.
2. External synthetic uptime alerting is not yet configured.
3. Full-repository lint debt must be handled as a separate controlled cleanup; it is not introduced by PR #65.
4. The authenticated preview could not be independently opened through the connector, so final Founder visual review remains a release gate.
