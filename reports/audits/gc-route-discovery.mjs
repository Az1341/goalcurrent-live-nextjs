/**
 * GC-GROWTH-RECONCILIATION route discovery — audit evidence script (documentation only).
 * Reproduces page-route count for src/app/[locale]/**/page.tsx
 *
 * Usage (from repository root):
 *   node reports/audits/gc-route-discovery.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const APP = path.join(REPO, "src/app");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name === "page.tsx") acc.push(p);
  }
  return acc;
}

function toRoutePattern(rel) {
  let r = rel
    .replace(/^src\/app\/\[locale\]\//, "")
    .replace(/\\/g, "/")
    .replace(/\/page\.tsx$/, "");
  if (r === "page.tsx") r = "";
  if (!r) r = "/";
  else r = "/" + r;
  return r;
}

const pages = walk(APP)
  .map((abs) => path.relative(REPO, abs).replace(/\\/g, "/"))
  .sort();

console.log("count", pages.length);
for (const rel of pages) {
  console.log(rel, "->", toRoutePattern(rel));
}
