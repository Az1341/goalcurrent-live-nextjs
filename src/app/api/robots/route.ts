import { buildRobotsTxt } from "@/lib/seo/robots-txt";
import {
  PREVIEW_X_ROBOTS_TAG,
  shouldNoIndexDeploy,
} from "@/lib/seo/deploy-robots";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export function GET(request: Request) {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const noIndex = shouldNoIndexDeploy();
  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": noIndex
      ? "private, no-store"
      : "public, max-age=3600, s-maxage=3600",
  };
  if (noIndex) {
    headers["X-Robots-Tag"] = PREVIEW_X_ROBOTS_TAG;
  }

  return new Response(buildRobotsTxt(), { headers });
}
