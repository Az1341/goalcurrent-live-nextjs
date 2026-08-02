# GC-FULLSTACK-STATIC-AUDIT-001 - Lint classification

Command: npx eslint . --max-warnings 99999 -f stylish
Exit code: 1
Totals: 101 problems (41 errors, 60 warnings)
Raw: GC-FULLSTACK-STATIC-AUDIT-001-LINT.txt

## By rule (counts from stylish output)

| Rule | Focus | Approx | Product risk |
|------|-------|--------|--------------|
| react-hooks/set-state-in-effect | error | 17 | MAJOR - cascading renders in Auth/FCM/layout/WC26 |
| @typescript-eslint/no-require-imports | error | 14 | MINOR - scripts/screenshot helpers |
| react-hooks/preserve-manual-memoization | error | 4 | MAJOR - PlHubClient React Compiler skip |
| Parsing error | error | 3 | MINOR - non-UTF/corrupt tooling scripts |
| react-hooks/rules-of-hooks | error | 2 | CRITICAL - conditional useSWR in live-data.ts |
| security/detect-non-literal-fs-filename | warning | 25 | INFO - Node scripts |
| @typescript-eslint/no-unused-vars | warning | 26 | MINOR |
| @next/next/no-img-element | warning | 2 | MINOR |
| react-hooks/exhaustive-deps | warning | 1 | MINOR |
| security/detect-possible-timing-attacks | warning | 1 | MINOR |

## Highest product-risk clusters

1. src/lib/client/live-data.ts - conditional Hooks
2. BottomTabBar / MoreBottomSheet / header dropdowns
3. PlHubClient.tsx memoization
4. AuthMenu / FcmRegistration effects

CI notes: full lint continue-on-error; changed-TS lint is the hard gate. No suppressions added by this audit.