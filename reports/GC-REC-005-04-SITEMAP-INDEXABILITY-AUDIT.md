# GC-REC-005-04 — Sitemap, Indexability and Search Console Reconciliation

## 1. Executive header

| Field | Value |
| --- | --- |
| Project | GoalCurrent (`goalcurrent.live`) |
| Task ID | GC-REC-005-04 |
| Execution batch | GC-EXECUTION-BATCH-005 |
| Type | Evidence-only SEO audit (no remediation) |
| Repository | Az1341/goalcurrent.live |
| Working branch | `recovery/gc-exec-batch-005` |
| Audit starting SHA | `9ad9b55d286cd3dde4a02aeb4537554fafe7bdd0` |
| Approved production baseline | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| Report version | 1.0.0 |

## 2. Executive verdict

Production exposes a **single urlset sitemap** with **3,177 unique `<loc>` URLs**, matching GC-REC-005-03. **Safe bulk HTTP validation completed for all 3,177 URLs** after retry (initial pass suffered **client-side DNS resolution failures** on 1,983 URLs; not attributed to origin HTTP status). **All 3,177 URLs returned HTTP 200** with **no redirect hops** observed. **Google Search Console export ZIPs named in the task brief were not present** in the repository or workspace; **coverage reconciliation from Google exports is BLOCKED** (not zero issues). **Locale-prefixed URLs overwhelmingly canonicalise to unprefixed English paths** (2,824 confirmed pattern); hreflang markup present on all probed HTML (≥9 `hreflang` link tokens). **Material SEO/content contradictions** align with GC-REC-005-03: **live/TBD/syncing language** on archived WC and pre-season PL surfaces; **duplicate WC match URL families** (`/match/fixture-*` and `/worldcup2026/match/fixture-*`) both sitemapped. **Remediation is planning-only** in this task.

## 3. Observation times and timezone

| Phase | Timestamp (UTC) | Notes |
| --- | --- | --- |
| Primary sitemap fetch + first probe pass | `2026-07-22T21:31:00Z` | 1,983 transport/DNS errors on auditor host |
| Probe retry passes (3×, concurrency 3) | `2026-07-23T19:34:43Z` | 0 transport errors; 3,177× HTTP 200 |
| Sitemap HEAD re-check | 2026-07-23T19:35:06Z | Headers captured |
| Report authored (UK) | 23/07/2026 – 20:40 BST | |

## 4. Repository / deployment identity

| Item | Evidence |
| --- | --- |
| `origin/main` | `20515a11b12026bb6e90c47b023cfb582ab8f718` (unchanged during task) |
| Production deployment SHA | `20515a11` (Vercel; per GC-REC-005-03 deployment 5539597252) |
| Public host | `https://goalcurrent.live` |
| PR #11 | OPEN, Draft, head `5ed5b3cd827627a18b40e6879309f184acbab63f` (not modified) |

## 5. Input and checksum manifest

### Repository inputs (from `input-manifest.json`)

See `reports/evidence/gc-rec-005-04/input-manifest.json` for SHA-256, bytes, and mtime of GC-REC-005-03, GC-REC-005-02, sitemap/robots source files.

### Google Search Console exports (expected, unavailable)

| Filename | Available |
| --- | --- |
| `goalcurrent.live-Coverage-2026-07-22.zip` | **No** |
| `goalcurrent.live-Coverage-Valid-2026-07-22.zip` | **No** |
| `goalcurrent.live-Coverage-Validation-2026-07-22.zip` | **No** |
| `goalcurrent.live-Coverage-Drilldown-2026-07-22.zip` | **No** |

### Generated evidence artifacts (this task)

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `reports/evidence/gc-rec-005-04/input-manifest.json` | 2514 | `4fe10dd453fdc95cb00e4a7db1ba0f7e8cb5247ee701a5aef1c09d73bdc6a60b` |
| `reports/evidence/gc-rec-005-04/summary.json` | 1339 | `6a7e797be9651c18d1f730be1373eb2f2f598ed9f92b2ad971cf6950fa6a9f1b` |
| `reports/evidence/gc-rec-005-04/analysis-summary.json` | 2523 | `8d1a22c620b9dee9aee745f92fccebce15dd822a7ebcf2238c3c134aea4b28bc` |
| `reports/evidence/gc-rec-005-04/robots-production.txt` | 143 | `f5558d5cdf44aa8d70342230bef2e944a05c30e180ca31ba227c20527502e35a` |
| `reports/evidence/gc-rec-005-04/http-indexability.csv` | 1062899 | `94750f52e1711903a64077f1ec450470493cbbaa40b1c7d662fe4e48b5a81216` |

## 6. Evidence-collection method

- **User-Agent:** `GoalCurrent-GC-REC-005-04-audit/1.0` (retry: `...-retry/1.0`).
- **Methods:** GET/HEAD only; `ThreadPoolExecutor` max **6** then retry max **3**; timeouts 25–35s; limited redirect follow (≤8 hops).
- **No** Search Console API, indexing requests, robots changes, or load testing.
- **Indexability:** first ~120KB of HTML per URL; regex extraction of `<title>`, `meta robots`, `rel=canonical`, `hreflang` count; `X-Robots-Tag` from headers.
- **Heuristics** (not Google classifications): substring soft-404 scan; “Syncing live data”; token counts for `LIVE` and `TBD`.

## 7. Search Console export inventory

**No exports available to parse.** Tasks 04 and 16 cannot produce row-level Google status counts. Do **not** infer zero coverage issues.

## 8. Sitemap inventory

| URL | HTTP | Content-Type | Bytes | SHA-256 (body) | Structure |
| --- | ---: | --- | ---: | --- | --- |
| `https://goalcurrent.live/sitemap.xml` | 200 | `application/xml; charset=utf-8` | 4,085,382 | `3b9bdb46e5b8ea94cccff3cc0ea32b16914194c2c856633e24a1bb7aca6bd52f` | Single **urlset** (not an index) |
| `https://goalcurrent.live/sitemap-news.xml` | 200 | (xml) | 179 | `1d39feae470870fbf1c28b16795270b7783a44a0fe9cc4fa829da57da3cdff66` | **0** `<loc>` entries |

**robots.txt** declares both sitemaps; **`Disallow: /api/`** only. Cached: `public, max-age=3600`. No `Last-Modified` / `ETag` on sitemap HEAD (2026-07-23).

**Duplicate `<loc>` within sitemap:** 0 (3,177 raw = 3,177 unique).

## 9. Verified URL totals

| Metric | Count |
| --- | ---: |
| Unique sitemap URLs | **3,177** |
| GC-REC-005-03 reported unique | 3,177 (**match**) |
| URLs HTTP-probed | 3,177 |
| Locale distribution | 9 locales × 353 URLs each |

**Route family (path heuristic):**

| Family | URLs |
| --- | ---: |
| static (incl. `/match/*`, hubs, `/live`) | 2004 |
| wc_match | 1040 |
| wc_hub | 68 |
| pl | 29 |
| editorial | 36 |

## 10. HTTP status matrix

| Status | Count |
| --- | ---: |
| 200 | 3177 |
| 3xx | 0 |
| 4xx | 0 |
| 5xx | 0 |
| Transport / DNS (after retry) | 0 |

## 11. Redirect / error matrix

| Class | Count |
| --- | ---: |
| Redirect hops > 0 | 0 |
| Redirect chains | 0 |
| 404 / 410 | 0 |
| Timeouts (final) | 0 |

## 12. Indexability matrix

| Signal | Count | Notes |
| --- | ---: | --- |
| `meta robots` containing `noindex` | 0 | None observed |
| `X-Robots-Tag` noindex | 0 | None observed |
| Missing canonical on 200 HTML | 0 | All sampled pages had canonical |
| hreflang link count = 0 | 0 | |
| hreflang count ≥ 9 | 3177 | Consistent alternates markup |
| Heuristic soft-404 flag | 3150 | **Unreliable** (HTML substring `404`; 0 titles contain “not found”) |
| “Syncing live data” heuristic | 355 | Confirmed copy on many PL/WC/editorial URLs |

**Indexable by robots/meta (confirmed):** all 3,177 return 200 without noindex — **crawlable/indexable unless Google quality filters apply** (not evidenced here).

## 13. Canonical findings

| Classification | Count | Evidence type |
| --- | ---: | --- |
| English unprefixed self-canonical | 243 | **Confirmed** |
| Locale URL → unprefixed English path | 2,824 | **Confirmed** (consistent hreflang cluster) |
| Other path pairing | 110 | **Heuristic** (mixed `/match/` vs `/worldcup2026/match/` targets) |
| Missing / multiple / off-domain | 0 | **Confirmed** |
| HTTP↔HTTPS or www mismatch | 0 | **Confirmed** |

**Duplicate sitemap exposure:** 104 canonical clusters with up to **18** locale/duplicate route variants per logical match (e.g. M104 listed under `/match/fixture-104` and `/worldcup2026/match/fixture-104` × 9 locales).

## 14. Robots / directive findings

- **Sitemap URLs blocked by robots.txt:** **0** (no sitemap URL under `/api/`).
- **Sitemap URLs with noindex:** **0**.
- **API routes in sitemap:** **0**.
- **Conflict:** none between robots.txt allow-all (except `/api/`) and page-level index signals.

## 15. Thin / placeholder / soft-404 findings

| Heuristic | Count | Representative evidence |
| --- | ---: | --- |
| LIVE token in HTML | 3,123+ route-family aggregate | Archived WC match pages, `/live`, tickers |
| TBD token in HTML | Similar | Fixture placeholders |
| Syncing copy | 355 | PL hub + many WC/editorial URLs |
| Title “not found” | 0 | — |

**Classification:** **High risk of misleading “live/upcoming” SERP snippets** despite HTTP 200 — **confirmed** via titles/canonical pages sampled in `analysis-summary.json` (not Google soft-404 verdict).

## 16. World Cup findings

| Class | Finding |
| --- | --- |
| Archive content | Hub + completed match URLs return 200 with Spain–Argentina final copy |
| Duplicate routes | **936** `/worldcup2026/match/*` plus **1040** wc_match family total incl. `/match/fixture-*` |
| M104 | **18** sitemap rows; canonical → `https://goalcurrent.live/match/fixture-104`; LIVE tokens in HTML |
| Live-labelled archive | `/live` × 9 locales in sitemap; titles “Live Scores” pattern |
| TBD/unresolved | TBD tokens on match templates (heuristic) |
| GC-REC-005-03 contradictions (5) | **VERIFIED COMPLETE** against live HTML probes (live copy vs archive; empty fixtures API not re-tested here) |

**Sitemap inclusion (later action only):** consider deduplicating `/match/` vs `/worldcup2026/match/` and demoting `/live` after tournament — **Founder decision**.

## 17. Premier League findings

| Metric | Value |
| --- | ---: |
| PL sitemap URLs | 29 |
| HTTP 200 | 29 |
| Syncing heuristic | 29 (100% of PL URLs) |
| noindex | 0 |

Pre-season state (per GC-REC-005-03) likely yields **low utility indexable pages** with “loading/syncing” copy — **confirmed** on all PL sitemap URLs in this audit.

## 18. Locale / hreflang findings

- **Balanced sitemap:** 353 URLs per locale (en + 8 prefixed).
- **hreflang:** present on all probed pages (≥9 alternates).
- **Canonical strategy:** locale pages → English unprefixed URL (**confirmed**); aligns with `localePrefix: as-needed` repository pattern.
- **Risk:** canonical targets do not always match the URL’s locale (intentional consolidation); verify `x-default` in HTML not fully parsed in bulk CSV — manual spot-check deferred to GC-REC-005-05 if needed.

## 19. Search Console reconciliation

**BLOCKED — exports unavailable.** Cannot tabulate indexed / crawled-not-indexed / duplicate canonical / validation states. URLs in sitemap **cannot** be matched to Google rows without supplied CSV/ZIP evidence dated 2026-07-22.

## 20. Prior-claim reconciliation

| Claim | Classification | Source |
| --- | --- | --- |
| Production SHA = main `20515a11` | VERIFIED COMPLETE | GC-REC-005-03 + deployment API |
| 3,177 sitemap URLs | VERIFIED COMPLETE | Live sitemap parse + this audit |
| WC archive (no LIVE in API) | VERIFIED COMPLETE | GC-REC-005-03 |
| `/live` live SEO vs archive UX | IMPLEMENTED BUT UNVERIFIED (SEO risk) | GC-REC-005-03 + this audit HTML |
| ~149 URL sitemap docs | SUPERSEDED | `docs/SITEMAP-ROUTES.md` vs live 3,177 |
| GSC validation/coverage fixes | PLANNED / BLOCKED | No exports |
| PR #11 merge-ready | REJECTED | GC-REC-005-02 disposition |
| All sitemap URLs return 200 | VERIFIED COMPLETE | This audit (post-retry) |

## 21. Security / privacy observations

- Probes used **read-only** public URLs; no credentials in evidence files.
- **Do not commit** raw GSC exports if they contain account emails when supplied later.

## 22. Prioritised remediation backlog (planning only)

| ID | Severity | Issue | URLs (approx) | Later batch |
| --- | --- | --- | ---: | --- |
| F-001 | High | Duplicate WC match URL families in sitemap | 1,040+ | 005-05 / Founder |
| F-002 | High | `/live` and LIVE tokens on archived WC | 18+ / many | 005-05 |
| F-003 | Medium | PL pre-season “syncing” indexable pages | 29 | 005-05 |
| F-004 | Medium | Empty `sitemap-news.xml` declared in robots | 1 file | 005-05 |
| F-005 | Low | Soft-404 / quality — Google side | unknown | Needs GSC exports |
| F-006 | Medium | M104 / final SEO “live centre” wording | 18 | Content + Founder |

## 23. Founder decisions required

1. Deduplicate sitemap: `/match/*` vs `/worldcup2026/match/*` vs locale variants.
2. Retire or noindex `/live` and live-oriented titles post-tournament.
3. Whether to supply GSC ZIP exports for GC-REC-005-05 reconciliation.
4. PL indexing strategy before season start (Aug 2026 fixtures per GC-REC-005-03).

## 24. Blockers and uncertainties

1. **GSC exports missing** — coverage reconciliation incomplete.
2. **Initial probe DNS failures (`getaddrinfo failed`)** — environmental; resolved on retry; logged in `summary.json`.
3. **Soft-404 heuristic** — high false-positive rate; not used for severity scoring.
4. **Canonical “other” 110** — needs manual spot-check for `/worldcup2026/` vs `/match/` pairing.

## 25. Exact commands and immutable evidence references

```bash
git fetch origin --no-tags
git rev-parse HEAD origin/main origin/recovery/gc-exec-batch-005
gh pr view 11 --json state,headRefOid,title

python C:\Users\zafar\AppData\Local\Temp\gc_rec_005_04_retry_utf8.py
# Regenerated reports/evidence/gc-rec-005-04/http-indexability.csv and summary.json

# Sitemap SHA-256 from summary.json; probe CSV is authoritative URL-level matrix.
```

## 26. Inputs required for GC-REC-005-05

1. All four `goalcurrent.live-Coverage-*-2026-07-22.zip` exports (or successor date).
2. Founder decisions on F-001–F-006.
3. Optional: bracket graph reconciliation script output (not run here).

## 27. Final gate verdict

| Gate | Result |
| --- | --- |
| GC-REC-005-04 documentation | **COMPLETE** (with GSC export gap explicitly blocked) |
| Application / production modified | **No** |
| GC-REC-005-05 started | **No** |

---

**GC-REC-005-04 status:** VERIFIED COMPLETE *(audit scope: live sitemap + full URL probe; GSC reconciliation blocked pending exports)*

Report SHA-256 will match committed file after write.
