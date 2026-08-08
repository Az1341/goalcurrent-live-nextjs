# GC-NEWS-REFRESH-HOURLY-20260808 - Report

**Project:** goalcurrent.live
**Report code:** GC-NEWS-REFRESH-HOURLY-20260808
**Date:** 2026-08-08
**Status:** PASSED

---

## Summary

Added a GitHub Actions workflow that GETs the existing production content-refresh endpoint once per hour (UTC), using repository secret `CRON_SECRET`. Leaves the daily Vercel cron and the refresh route untouched as fallback.

Verification: lint + unit tests + YAML syntax only - workflow was not manually triggered against the live site.

---

## New file created

- `.github/workflows/refresh-content-cron.yml`

### Behaviour
- Triggers: `schedule` cron `0 * * * *` (hourly UTC) + `workflow_dispatch`
- Exactly one HTTP GET to `https://goalcurrent.live/api/cron/refresh-content`
- Header: `Authorization: Bearer ${{ secrets.CRON_SECRET }}`
- Logs HTTP status and response body; fails the step on non-2xx

### Unchanged (as required)
- `vercel.json` - daily cron `"0 6 * * *"` to `/api/cron/refresh-content` left as fallback
- `src/app/api/cron/refresh-content/route.ts` - auth and handler left untouched

---

## Verification

| Check | Result |
|---|---|
| `npm run lint` | 29 errors, 52 warnings - delta 0 vs baseline |
| `npm run test:unit` | 344 pass, 0 fail |
| Workflow YAML syntax (`js-yaml` parse) | OK |
| Live workflow trigger | Not run (deferred to post-merge manual test) |

---

## Ship

| Field | Value |
|---|---|
| **Branch** | `chore/gc-news-refresh-hourly-20260808` |
| **PR** | https://github.com/Az1341/goalcurrent.live/pull/39 |
| **Head SHA** | `b7cd181ccfd306900a631f6a8e81a6aa3315fc08` |
| **Lint** | 29 errors, 52 warnings - delta 0 vs baseline |
| **Unit tests** | 344 pass, 0 fail |

---

**GC-NEWS-REFRESH-HOURLY-20260808 status:** PASSED