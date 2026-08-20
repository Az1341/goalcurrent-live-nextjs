<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent Skills policy

This repository uses project-scoped Agent Skills from `vercel-labs/agent-skills` and `addyosmani/agent-skills`.

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

## Engineering workflow

For significant new features or architectural work:

`spec-driven-development`
→ `planning-and-task-breakdown`
→ `incremental-implementation`
→ applicable testing
→ `code-review-and-quality`

Use `context-engineering` to load only the files, rules, and docs needed for the current task. Do not indiscriminately consume the whole repository. Existing `AGENTS.md`, Cursor rules, ADRs, task scope, and security/privacy instructions remain primary context sources.

### Specification rule

Use `spec-driven-development` for:

* new features
* significant behaviour changes
* architectural changes
* multi-module changes
* ambiguous requirements

Do NOT force a large specification for:

* typos
* tiny configuration corrections
* trivial content changes
* obvious one-line fixes

The current Cursor task itself may satisfy the specification requirement when it already contains:

* problem
* scope
* technical approach
* risks
* acceptance criteria
* boundaries

Do NOT create duplicate documentation merely to satisfy the skill.

### Do not stop for routine approval

Some upstream workflow guidance may expect human approval between phases.

A fully specified approved Cursor task is authorization to execute the complete task through all internal phases.

Do NOT stop after:

* specification
* planning
* each implementation slice
* each test
* each audit phase

Continue autonomously unless one of these gates is reached:

1. new recurring or material cost
2. security/privacy permission decision
3. destructive/irreversible action
4. production deployment/merge approval
5. genuine visual/product decision requiring Ahmad
6. critical blocker that cannot safely be resolved

This repository-specific rule overrides upstream workflow pauses.

### Implementation rule

Use `incremental-implementation` for non-trivial implementation. Implement in coherent, testable slices.

Do NOT create unnecessary commits for every tiny slice. Repository/task-specific Git instructions remain authoritative.

### Testing rule

Use `test-driven-development` when:

* implementing logic
* fixing bugs
* changing behaviour
* adding edge-case handling

Tests should prove behavioural changes rather than relying on "looks correct."

Do NOT require strict TDD for:

* documentation
* Agent Skills installation
* static text
* non-behavioural configuration
* tasks where a higher-level repository rule defines another validation strategy

Existing test architecture remains authoritative.

### Debugging rule

Use `debugging-and-error-recovery` when:

* tests unexpectedly fail
* builds unexpectedly fail
* runtime behaviour differs from expected behaviour
* an attempted fix fails
* root cause is unclear

Require root-cause analysis before repeated speculative fixes. Do not permit endless trial-and-error loops.

### Code review rule

Before a material implementation is considered complete, use `code-review-and-quality`.

Review only the changed scope plus directly affected boundaries. Do not turn every task into a whole-codebase audit.

### Security rule

Use `security-and-hardening` when work touches:

* authentication
* authorization
* RLS
* personal data
* family/children data
* user input
* APIs
* external integrations
* uploads
* secrets
* storage
* database access
* payment/billing functionality

Existing project privacy/security controls always have higher priority.

A generic skill must never weaken:

* RLS
* authentication
* data-minimisation
* consent
* secrets management
* production isolation

### Source-driven development

Use `source-driven-development` when implementation depends on current framework/library behaviour.

Priority:

1. repository's installed version documentation
2. official vendor documentation
3. official source repository
4. trusted primary technical sources

Do not make framework/API decisions solely from model memory when current authoritative documentation is available.

### Agent Skills Gate

Apply only relevant skills. `N/A` is valid. Do not create compliance theatre.

```text
AGENT SKILLS GATE

Planning/Specification: PASS / N/A
Source Verification: PASS / N/A
Implementation Discipline: PASS / N/A
Testing: PASS / N/A
Debugging: PASS / N/A
Security: PASS / N/A
Vercel React Best Practices: PASS / N/A
Web Design Guidelines: PASS / N/A
Composition Patterns: PASS / N/A
Vercel Optimize: PASS / N/A
Code Review & Quality: PASS / N/A
Browser QA: PASS / PASS WITH NOTES / FAIL / N/A

OVERALL:
PASS / PASS WITH NOTES / FAIL
```

Required completion language for user-facing web changes:

`Browser QA Gate: PASS / PASS WITH NOTES / FAIL / N/A`

## Browser QA

Anthropic `webapp-testing` was audited and **rejected** for this repository (unrestricted `shell=True` helper, undeclared tool permissions, Unix/Claude path assumptions, Python Playwright instead of this repo's Node stack). Browser verification uses the native QA stack below.

For user-facing web changes, verify behaviour in a **local development or isolated test environment**. Do not claim `UI VERIFIED` from TypeScript, lint, build, reading JSX, or visual assumption alone. Where technically possible, material UI changes need browser execution evidence.

### Functional behaviour

Verify:

* page loads
* primary interaction works
* expected navigation works
* forms behave correctly
* errors render appropriately
* loading state works where relevant

### Browser health

Check:

* console errors
* uncaught exceptions
* failed relevant network requests
* hydration failures
* React errors

### Responsive behaviour

For changed UI, test representative viewport classes: mobile, tablet where materially relevant, and desktop. Do not require every possible viewport.

### Accessibility

Where relevant verify keyboard navigation, focus visibility, labels, semantic controls, dialog behaviour, and obvious contrast/accessibility regressions. `web-design-guidelines` remains the design/accessibility authority. Browser QA proves behaviour.

### Evidence and screenshots

Screenshots are QA evidence, not product assets. Capture only for visual regression, responsive verification, error-state verification, or Founder visual approval.

Store temporary QA screenshots in `.qa-screenshots/` (gitignored) or the OS temp directory. Do not commit arbitrary screenshots. Do not capture secrets, tokens, sensitive user data, or credentials.

### Production safety

Default target: local development / isolated test environment.

Do NOT submit real production forms, create production users, send production emails, publish social posts, make purchases, modify production Supabase data, or trigger external provider actions.

Production may be inspected read-only only when a future task explicitly permits it. Do not run `lighthouse:home` against production unless a future task explicitly permits read-only production inspection.

### Authenticated flows

Do not bypass authentication or disable security controls for testing.

If authenticated automation requires credentials not already available through an approved test mechanism, mark `AUTHENTICATED FLOW — NOT AUTOMATED` and report it. Never request or commit personal passwords or API keys into test code.

### Regression scope

Do not run the entire browser suite after every trivial change. Use risk-based scope:

* Text-only static change → N/A or lightweight
* Component/UI change → affected page/flow
* Authentication change → auth flow + affected protected path
* Shared navigation/layout → representative cross-page regression
* GoalCurrent live-score shared component → representative affected live-score pages

### Cross-skill routing

```text
DEFINE → spec-driven-development
PLAN → planning-and-task-breakdown
SOURCE → source-driven-development
BUILD → incremental-implementation, vercel-react-best-practices, vercel-composition-patterns
SECURITY → security-and-hardening
DESIGN → web-design-guidelines
VERIFY LOGIC → test-driven-development
DEBUG → debugging-and-error-recovery
VERIFY BROWSER → native Browser QA policy (`playwright.config.ts` / `tests/e2e`)
REVIEW → code-review-and-quality
OPTIMIZE → vercel-optimize where explicitly relevant
```

### Repository QA stack

* `@playwright/test` via `playwright.config.ts`; E2E specs in `tests/e2e`
* Accessibility: `@axe-core/playwright` and `eslint-plugin-jsx-a11y`
* Mobile and visual projects exist; default Playwright target is localhost (`PLAYWRIGHT_BASE_URL`)
* Existing Node unit tests under `tests/` remain the logic-verification authority

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
