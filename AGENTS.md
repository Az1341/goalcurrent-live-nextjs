<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent Skills policy

This repository uses project-scoped Agent Skills from `vercel-labs/agent-skills`.

### Priority order
1. Explicit current Cursor task
2. Security/privacy/safety requirements
3. Product architecture / ADR / Source of Truth
4. Repository-specific rules
5. Installed framework/version-specific documentation
6. Approved Agent Skills
7. Generic model knowledge

### React / Next.js changes
Use `vercel-react-best-practices` for relevant implementation and review.

### Web UI changes
Use `web-design-guidelines` for accessibility, interaction, forms, keyboard/focus, responsive behaviour, and user-facing UI quality.

### Component architecture
Use `vercel-composition-patterns` for reusable components, providers, context, compound components, prop/API design, and boolean-prop proliferation.

### Vercel performance/cost investigations
Use `vercel-optimize` only when the task concerns Vercel cost, caching, functions, route performance, deployment performance, or usage optimisation. It must NOT autonomously change production configuration.

### Agent Skills Gate
Apply only relevant skills. Do not require all four skills for every task.
Completion rule: `Agent Skills Gate: PASS / PASS WITH NOTES / FAIL`

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
