import test from "node:test";
import assert from "node:assert/strict";

const LOCALES = ["en", "es", "it", "de", "fr", "nl"];
const DEFAULT_LOCALE = "en";
const SITE_URL = "https://goalcurrent.live";

function localizedPath(pathname, locale) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === DEFAULT_LOCALE) {
    return normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

function localizedUrl(pathname, locale) {
  const path = localizedPath(pathname, locale);
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function buildHreflangAlternates(pathname) {
  const alternates = {};
  for (const locale of LOCALES) {
    alternates[locale] = localizedUrl(pathname, locale);
  }
  alternates["x-default"] = localizedUrl(pathname, DEFAULT_LOCALE);
  return alternates;
}

test("localizedPath keeps English unprefixed", () => {
  assert.equal(localizedPath("/live", "en"), "/live");
  assert.equal(localizedPath("/live", "es"), "/es/live");
  assert.equal(localizedPath("/", "de"), "/de");
});

test("hreflang alternates include x-default and all locales", () => {
  const alternates = buildHreflangAlternates("/live");
  assert.ok(alternates["x-default"]);
  assert.equal(Object.keys(alternates).length, 7);
  assert.equal(alternates.en, "https://goalcurrent.live/live");
  assert.equal(alternates.es, "https://goalcurrent.live/es/live");
});
