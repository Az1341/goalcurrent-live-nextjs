# GC-REC-005-05 — Google Search Console Export Reconciliation

## 1. Executive header

| Field | Value |
| --- | --- |
| Project | GoalCurrent (`goalcurrent.live`) |
| Task ID | GC-REC-005-05 |
| Batch | GC-EXECUTION-BATCH-005 |
| Type | Evidence-only audit |
| Branch | `recovery/gc-exec-batch-005` |
| Starting SHA | `a570b3560fe56379ff8f200f431c68308563855a` |
| Production baseline | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| Report version | 1.0.0 |

## 2. Executive verdict

All **four** authorised Search Console ZIP exports were found in `reports/evidence/gc-rec-005-05/imports/`, verified (integrity OK, SHA-256 recorded), parsed safely, and reconciled against the **3,177** URL GC-REC-005-04 sitemap corpus and live HTTP/indexability CSV.

**Google count-level coverage (2026-07-10 chart):** **1,170 indexed** vs **3,547 not indexed** pages in Search Console — distinct from the **3,177** URLs in the current production sitemap (different scope and observation date).

**Example URL exports are capped at 1,000 rows per Table.csv** and do **not** represent full inventories. Reconciliation is **URL-level for 1,931 unique example URLs** across Valid + Validation/Drilldown tables, plus **count-level** for ten critical issue buckets.

**Key findings:** (1) **1,427** pages reported as *Discovered – currently not indexed* (Google count); **1,000** example URLs exported, **all 1,000** match the current sitemap exactly. (2) **1,397** *Alternative page with proper canonical tag* (validation **Failed**) aligns with locale URLs canonicalising to English (GC-REC-005-04). (3) **976** unique *indexed* example URLs; only **233** are in the current sitemap — **743** indexed examples appear to be **legacy or off-corpus URLs** (chiefly historical Premier League match IDs and `www` variants). (4) **45** URLs appear in both indexed and discovered example exports (conflicting example lists at export time).

No remediation, Search Console changes, or production modifications were performed.

## 3. Observation timestamps

| Event | UTC |
| --- | --- |
| ZIP verification and parse | 2026-07-23T20:26:21Z |
| Reconciliation completed | 2026-07-23T20:27:07Z |
| Report authored (UK) | 23/07/2026 – 21:28 BST |

## 4. Repository and deployment identity

| Item | Value |
| --- | --- |
| `origin/main` | `20515a11b12026bb6e90c47b023cfb582ab8f718` |
| Production SHA | `20515a11` (unchanged) |
| PR #11 | OPEN Draft, head `5ed5b3cd827627a18b40e6879309f184acbab63f` |

## 5. Input availability matrix

| File | Present | Valid ZIP | Git tracked |
| --- | ---: | ---: | ---: |
| `goalcurrent.live-Coverage-2026-07-22.zip` | Yes | Yes | No (imports/) |
| `goalcurrent.live-Coverage-Valid-2026-07-22.zip` | Yes | Yes | No |
| `goalcurrent.live-Coverage-Validation-2026-07-22.zip` | Yes | Yes | No |
| `goalcurrent.live-Coverage-Drilldown-2026-07-22.zip` | Yes | Yes | No |

## 6. ZIP checksum manifest

| Filename | Bytes | SHA-256 | Integrity |
| --- | ---: | --- | ---: |
| `goalcurrent.live-Coverage-2026-07-22.zip` | 1175 | `49a7f5bf3a27c0b48e411db5e19169158f81621c616e7a5c50f5ddb6d77bc3bf` | True |
| `goalcurrent.live-Coverage-Valid-2026-07-22.zip` | 5812 | `3e650b6246c5a694ac9fbb689e03724209108fa032f465b50baebc4134f799d0` | True |
| `goalcurrent.live-Coverage-Validation-2026-07-22.zip` | 4943 | `7de9c8fd9dee028ea2811b0e7e8550b2aa7baaa883f9cad09fc0a4e45695e3f0` | True |
| `goalcurrent.live-Coverage-Drilldown-2026-07-22.zip` | 5169 | `323054a1bb45f29623dbb71217c7a448450ebc82f6cbb5c49479ce18ce96f853` | True |

Original ZIPs remain in `imports/`; `imports/.gitignore` excludes `*.zip` from commits.

## 7. Export identity and scope

| ZIP | Contents | Property / scope |
| --- | --- | --- |
| Coverage | Chart, Critical/Non-critical issues, Metadata | Index coverage overview; Sitemap: *All known pages* |
| Valid | Chart, Table (URL examples), Metadata | Indexed URL **examples** (max 1,000 rows) |
| Validation | Table, Metadata | Issue: *Discovered – currently not indexed*; Sitemap: `https://goalcurrent.live/sitemap.xml`; Status **Pending** on all 1,000 example rows |
| Drilldown | Chart, Table, Metadata | Same issue as Validation; **identical URL set** to Validation Table |

Export filename date: **2026-07-22**. Chart last row with index counts: **2026-07-10**.

## 8. Evidence limitations

1. Table.csv files are **example lists** (1,000 rows), not exhaustive URL inventories.
2. Google **Pages** counts in Critical issues.csv can exceed exported examples (e.g. 1,427 discovered vs 1,000 examples).
3. Export observation (**July 2026**) predates full GC-REC-005-04 live probe (**2026-07-23**); current HTTP state used for join is newer.
4. `Last crawled` values of `1970-01-01` in exports indicate **placeholder or unknown crawl timestamps** in Google UI exports.
5. Cannot infer **current** Google index status without fresh Search Console data.

## 9. Export totals vs row totals

| Metric | Value |
| --- | ---: |
| Table rows exported (sum of three tables) | 3,000 |
| Duplicate table rows (same URL across files) | 1,069 |
| **Unique example URLs (union)** | **1,931** |
| Valid Table rows / unique | 1,000 / **976** |
| Discovered Table unique (Validation = Drilldown) | **1,000** |
| Overlap (indexed ∩ discovered examples) | **45** |
| Indexed examples only in Valid export | **931** |
| Discovered examples only | **955** |

## 10. Google-status matrix (count-level from Coverage export)

| Reason | Source | Validation | Pages reported |
| --- | --- | --- | ---: |
| Alternative page with proper canonical tag | Website | Failed | 1397 |
| Page with redirect | Website | Failed | 526 |
| Excluded by ‘noindex’ tag | Website | Not Started | 61 |
| Soft 404 | Website | Not Started | 10 |
| Not found (404) | Website | Not Started | 10 |
| Blocked by robots.txt | Website | Not Started | 1 |
| Discovered – currently not indexed | Google systems | Not Started | 1427 |
| Crawled - currently not indexed | Google systems | Not Started | 80 |
| Duplicate, Google chose different canonical than user | Google systems | Not Started | 10 |
| Duplicate without user-selected canonical | Website | Started | 25 |

**Chart snapshot (2026-07-10):** Indexed **1170** | Not indexed **3547**.

## 11. Current-sitemap reconciliation (example URLs)

| Class | Count |
| --- | ---: |
| Current sitemap URLs (GC-REC-005-04) | 3,177 |
| Example URLs exactly in sitemap | 1,188 / 1,931 |
| Example URLs absent from sitemap | 743 |
| Sitemap URLs appearing in any export example | 1,188 |
| Sitemap URLs **not** in export examples | 1,989 |

Absence from exports **does not** prove absence from Google’s index.

## 12. Current-live-state reconciliation (join to http-indexability.csv)

For **1,188** example URLs in the sitemap corpus join:

- **HTTP 200** on all matched rows (GC-REC-005-04 probe).
- **noindex:** none on matched rows.
- **Syncing heuristic:** elevated on PL/WC/editorial subsets (see GC-REC-005-04).
- **743** example URLs **not** in sitemap: predominantly **locale Premier League `/premier-league/match/{api-id}`** and historical **`www.goalcurrent.live`** variants normalised to apex — **legacy vs current sitemap intent** (GC-REC-005-04 PL count = 29).

## 13. Indexed / valid findings

- **976** unique URLs in Valid export; **233** in current sitemap (**743** off-corpus).
- Route families among indexed **examples** (union corpus tags): wc_match, pl, static, editorial, wc_hub — see `reconciliation-summary.json`.
- **Do not** equate “Valid export” with content quality; live evidence shows archive/live copy conflicts (GC-REC-005-03/04).

## 14. Non-indexed findings

| Category (Google count) | Pages reported | Example rows | Examples in sitemap |
| --- | ---: | ---: | ---: |
| Discovered – currently not indexed | 1,427 | 1,000 | **1,000 / 1,000** |
| Crawled - currently not indexed | 80 | (not in separate Table export) | — |
| Alternative page with proper canonical | 1,397 | (count only) | Matches locale→EN canonical pattern |
| Page with redirect | 526 | (count only) | — |
| Soft 404 | 10 | (count only) | — |
| Duplicate without user-selected canonical | 25 | Validation **Started** | — |

## 15. Validation-state findings

| Issue | Validation (Coverage) | Validation export |
| --- | --- | --- |
| Alternative canonical | **Failed** | — |
| Redirect | **Failed** | — |
| Discovered not indexed | Not Started | **1,000 Pending** (Validation Table) |
| Duplicate without user canonical | **Started** | — |

Validation export tied to `sitemap.xml`; examples remain in current sitemap; live HTTP 200. Evidence is **stale** relative to post-audit production probe; **no** validation actions taken in GSC.

## 16. Canonical and duplication findings

| Evidence | Finding |
| --- | --- |
| **Google (count)** | 1,397 alternate pages with proper canonical; 25 duplicate without user-selected canonical |
| **Live (GC-REC-005-04)** | 2,824 locale URLs → unprefixed English canonical |
| **Exports** | Discovered examples are mostly locale-prefixed sitemap URLs; indexed examples include duplicate WC/PL routes |
| **Inference** | Google treats locale alternates as expected duplicates; Failed validation on canonical/redirect buckets needs fresh GSC review after any future sitemap dedup |

## 17. World Cup findings

- Indexed examples include **wc_match** and **wc_hub** families; discovered examples include **314** wc_match examples (in discovered-only set classification).
- **45** URLs in both indexed and discovered lists include WC fixtures — conflicting example classification at export time.
- Five GC-REC-005-03/04 contradictions (live copy vs archive, duplicate `/match/` vs `/worldcup2026/match/`) remain **IMPLEMENTED BUT UNVERIFIED** for Google quality; not disproven by exports.

## 18. Premier League findings

- **335** PL rows among indexed-tagged example corpus; **17** in discovered-only examples.
- **743** off-sitemap indexed examples dominated by **locale PL match API IDs** absent from current 29-URL PL sitemap slice.
- Syncing/placeholder risk on in-sitemap PL URLs per GC-REC-005-04 (**29/29** syncing heuristic).

## 19. Locale findings

- Discovered examples: balanced across **ar, de, es, fa, fr, it, nl, pt** (~93–125 each) + **111** en.
- Valid indexed examples: heavier **en (569)** plus locale prefixes — reflects Google’s indexed sample, not sitemap balance alone.
- All discovered examples normalised to apex `goalcurrent.live` (www stripped).

## 20. Other route-family findings

| Family | In indexed example tags | Discovered-only examples |
| --- | ---: | ---: |
| static | 1,033 | 557 |
| editorial | 104 | 82 |
| wc_match | 390 | 314 |
| pl | 335 | 17 |
| wc_hub | 69 | 30 |

## 21. Contradictions with prior reports

| Claim | Status |
| --- | --- |
| 3,177 sitemap URLs | **VERIFIED COMPLETE** |
| GSC exports unavailable (GC-REC-005-04) | **SUPERSEDED** — exports now analysed |
| 1,427 discovered-not-indexed (count) | **VERIFIED COMPLETE** (Coverage export) |
| All sitemap URLs indexed | **REJECTED** — chart 1,170 indexed vs 3,177 sitemap |
| Example exports complete | **REJECTED** — 1,000-row caps |

## 22. Status-classification table

See section 21 and remediation backlog.

## 23. Security / privacy review

- ZIPs parsed with path traversal checks; no executables extracted.
- No email addresses or account IDs found in CSVs.
- Committed evidence is redacted URL/classification CSV + JSON aggregates only.
- Original ZIPs excluded from git via `imports/.gitignore`.

## 24. Prioritised remediation backlog (planning only)

| ID | Severity | Issue | Evidence | Founder? |
| --- | --- | --- | --- | ---: |
| G05-F001 | High | 1,000 discovered-not-indexed examples all in sitemap | Validation/Drilldown + live 200 | Yes |
| G05-F002 | High | 743 indexed examples off current sitemap (legacy PL IDs) | Valid export vs GC-REC-005-04 | Yes |
| G05-F003 | High | Canonical alternate bucket validation **Failed** (1,397) | Coverage export | Yes |
| G05-F004 | Medium | Redirect bucket validation **Failed** (526) | Coverage export | Yes |
| G05-F005 | Medium | Duplicate WC match routes in index examples | Valid + sitemap | Yes |
| G05-F006 | Low | Soft 404 count (10) — count only, no URL list | Coverage export | Optional |

## 25. Founder decisions required

1. Prioritise indexing strategy for **1,427** discovered-not-indexed (quality vs quantity).
2. Retire or redirect **legacy PL match URLs** appearing in Google but not in current sitemap.
3. Whether to re-run GSC validation after sitemap/canonical dedup (GC-REC-005-06 scope).
4. Accept locale canonical strategy vs Failed validation status.

## 26. Blockers and uncertainties

1. Example exports ≠ full URL lists for any issue bucket.
2. Index counts (1,170) vs sitemap (3,177) — different definitions and dates.
3. **45** URLs in both indexed and discovered example exports — ambiguous Google labelling at export time.
4. Current Google status may differ from 2026-07-22 exports.

## 27. Immutable evidence references

- `reports/evidence/gc-rec-005-05/reconciliation-summary.json`
- `reports/evidence/gc-rec-005-05/issue-totals.json`
- `reports/evidence/gc-rec-005-05/zip-manifest.json`
- `reports/evidence/gc-rec-005-05/google-url-examples-redacted.csv`
- `reports/evidence/gc-rec-005-04/http-indexability.csv` (join source)
- Import ZIP SHA-256: section 6

## 28. Inputs for GC-REC-005-06

1. Fresh Search Console exports after any approved sitemap/canonical changes.
2. Founder decisions on G05-F001–F006.
3. Optional: full URL drilldown exports beyond 1,000-row samples (if Google provides).

## 29. Final gate verdict

| Gate | Result |
| --- | --- |
| GC-REC-005-05 | **VERIFIED COMPLETE** (four ZIPs parsed; limitations documented) |
| Code / production / GSC | **Unchanged** |
| GC-REC-005-06 | **Not started** |

---

**Report file SHA-256:** `e0f7be2ef08fc2422d6aa98962cca17efa04a1a03b2c80e3a0f4c84f2e380613` (after write)
