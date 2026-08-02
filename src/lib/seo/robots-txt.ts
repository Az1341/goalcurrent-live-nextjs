import { absoluteUrl } from "@/lib/site-url";
import { shouldNoIndexDeploy } from "@/lib/seo/deploy-robots";

export type RobotsTxtEnv = {
  VERCEL_ENV?: string;
  NODE_ENV?: string;
};

/**
 * robots.txt body. Production remains crawlable with sitemap pointers.
 * Preview / local-dev deploys disallow all and omit Sitemap lines so they
 * do not invite crawling or advertise URLs (page-level noindex is separate).
 */
export function buildRobotsTxt(env: RobotsTxtEnv = process.env): string {
  if (shouldNoIndexDeploy(env)) {
    return `User-agent: *
Disallow: /
`;
  }

  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${absoluteUrl("/sitemap.xml")}
Sitemap: ${absoluteUrl("/sitemap-news.xml")}
`;
}
