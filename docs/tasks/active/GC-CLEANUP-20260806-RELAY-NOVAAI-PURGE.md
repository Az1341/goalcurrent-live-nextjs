# GC-CLEANUP-20260806 — Relay/NovaAI permanent purge

## Finding
Relay/NovaAI lived as **untracked local files** (never on `main`). That is why route-only deletions did not stick: agents recreated the folder tree locally after restarts.

## Actions
- Deleted local `src/components/relay/**` and `src/app/[locale]/preview-relay/**`
- Deleted local `LayoutShell.tsx` and `src/lib/cn.ts` (Relay-only)
- Restored `Layout.tsx` to GoalCurrent shell (no standalone bypass)
- Removed Relay-only npm deps from the working tree — these were never committed to `main`
- Added AGENTS.md ban + `.gitignore` path bans to prevent reintroduction

## External checks
- GitHub: no branches named relay/novaai/preview-relay/preview-novaai
- GitHub Actions: `.github/workflows/ci.yml` has no relay/novaai references
- Vercel: no deployment URLs containing relay/novaai; no env vars named relay/novaai