<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Before commit / push — fundamental design check

Run `npm run verify:design` and confirm in the browser:

- **Logo** — header shows `/logo.svg`
- **Flags** — team rows show `/flags/4x3/*.svg` (not empty grey boxes)
- **Photos** — hero uses `/images/football-hero-bg.jpg`; article/news cards show images
- **Emojis** — match events (⚽ 🎯), language menu (🌐), stubs (🚧) render on Windows
- **Language** — header `🌐 EN ▾` (desktop) and More sheet → زبان (mobile)

Do **not** set `HOME_HERO_BG` to `null` or remove `image` fields from article hubs. Do not route `/flags`, `/images`, or `/icons` through the service-worker cache-first path.

## Forbidden: Relay / NovaAI SaaS preview (GC-CLEANUP-20260806)

Do **not** create, restore, or serve any of the following in this repository:

- Routes: `/preview-relay`, `/preview-novaai` (any locale)
- Folders: `src/components/relay/`, `src/components/novaai/`, `src/app/**/preview-relay/`, `src/app/**/preview-novaai/`
- Brand names for demos: "Relay", "NovaAI" as a GoalCurrent landing/preview product
- Supporting helpers added only for that demo: `LayoutShell` standalone bypass for those routes, `src/lib/cn.ts` if reintroduced solely for that page

This surface was repeatedly recreated as untracked local files and is permanently banned. GoalCurrent is a football product — do not add unrelated AI SaaS landing demos here.

## Mandatory private-preview release policy

Every GoalCurrent change must follow:

Build → Automated tests → Protected private preview → Ahmad’s review → Explicit Founder Approval → Merge into main → Public deployment

Nothing may be merged into main or published publicly without explicit Founder Approval after Ahmad has reviewed the protected private preview.

Full policy: `docs/governance/PRIVATE-PREVIEW-RELEASE-POLICY.md`
