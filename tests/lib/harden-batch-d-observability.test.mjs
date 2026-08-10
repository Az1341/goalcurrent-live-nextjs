import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("BATCHD: locale error.tsx reports to Sentry like global-error.tsx", () => {
  const localeError = readFileSync(
    join(root, "src/app/[locale]/error.tsx"),
    "utf8",
  );
  const globalError = readFileSync(join(root, "src/app/global-error.tsx"), "utf8");
  assert.match(globalError, /Sentry\.captureException\(error\)/);
  assert.match(localeError, /from "@sentry\/nextjs"/);
  assert.match(localeError, /Sentry\.captureException\(error\)/);
  assert.doesNotMatch(localeError, /console\.error\(error\)/);
});

test("BATCHD: domestic routes captureRouteError on fixture/standings error paths", () => {
  const routes = readFileSync(
    join(root, "src/lib/domestic-league/routes.ts"),
    "utf8",
  );
  assert.match(routes, /import \{ captureRouteError \} from "@\/lib\/log"/);
  assert.match(routes, /captureRouteError\(routeTagFromCacheKey\(cacheKey\), body\.error\)/);
  const fixturesFn = routes.slice(
    routes.indexOf("export function respondDomesticFixtures"),
    routes.indexOf("export function respondDomesticStandings"),
  );
  const standingsFn = routes.slice(
    routes.indexOf("export function respondDomesticStandings"),
  );
  assert.match(fixturesFn, /captureRouteError/);
  assert.match(standingsFn, /captureRouteError/);
  assert.ok(
    fixturesFn.indexOf("captureRouteError") < fixturesFn.indexOf("getStaleApiCache"),
    "fixtures must capture before stale fallback",
  );
  assert.ok(
    standingsFn.indexOf("captureRouteError") < standingsFn.indexOf("getStaleApiCache"),
    "standings must capture before stale fallback",
  );
});