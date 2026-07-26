# GC-FULLSTACK-STATIC-AUDIT-001 - Dependency and supply-chain

Commands: npm audit (read-only). No npm audit fix. No lockfile regeneration.

## Inventory
- Direct dependencies: 14
- Dev dependencies: 15
- Lockfile: package-lock.json (npm)
- packageManager field: npm@11.13.0

## npm audit summary
- total: 15 (critical 0, high 8, moderate 7, low 0, info 0)
- Notable high: next (multiple advisory entries in range including 16.2.9 path), postcss, sharp, brace-expansion, fast-uri, fast-xml-parser, js-yaml, @tailwindcss/postcss
- Notable moderate: firebase-admin transitive uuid/gaxios/teeny-request/@google-cloud/storage; protobufjs

## Classification
| Class | Items | Notes |
|-------|-------|-------|
| Confirmed exploitable in this deployment | None proven in this audit | Would need runtime exploit path evidence |
| Environment-dependent | next advisory cluster | Depends on App Router features used (proxy/middleware, server actions, image opt) |
| Development-only | Several transitive via tooling | Still relevant to CI supply chain |
| Unverified scanner advisory | Most npm audit rows | Require CVE-to-codepath mapping before BLOCKER |
| False positive | Not declared without path proof | |

## Other supply-chain notes
- CI uses actions/checkout@v4, setup-node@v4, upload-artifact@v4 (major-tag pinning, not commit SHA)
- No install lifecycle scripts observed on direct deps beyond package prebuild (flags sync)
- Deprecated packages: not exhaustively enumerated; firebase-admin upgrade path flagged as breaking by audit fix --force
- Package-name confusion: no suspicious lookalike direct deps observed

Do not update dependencies in this audit.