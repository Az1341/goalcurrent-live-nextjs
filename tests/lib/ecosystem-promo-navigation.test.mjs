import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("desktop favourites navigation shows a star", () => {
  const header = read("src/components/layout/MasterHeader.tsx");
  assert.match(header, /item\.href === ["']\/favourites["']/);
  assert.match(header, /★/);
});

test("SocialMedia advertisement opens a public product introduction before sign-in", () => {
  const promo = read("src/components/home/v5/HomeEcosystemPromo.tsx");
  const page = read("src/app/[locale]/ecosystem/socialmedia/page.tsx");

  assert.match(promo, /\/ecosystem\/socialmedia\?utm_source=goalcurrent/);
  assert.match(page, /See SocialMedia before you sign in/);
  assert.match(page, /help\/screenshots\/dashboard\.png/);
  assert.match(page, /help\/screenshots\/composer\.png/);
  assert.match(page, /help\/screenshots\/media\.png/);
  assert.match(page, /Open SocialMedia/);
});
