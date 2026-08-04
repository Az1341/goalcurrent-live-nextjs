import Link from "next/link";
import { getLocale } from "next-intl/server";
import JsonLd from "@/components/seo/JsonLd";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs";
import { breadcrumbSchema } from "@/lib/seo/breadcrumbs";
import {
  combineSchemaGraph,
  liveBlogPostingSchema,
  sportsEventSchema,
  type LiveBlogPostingSchemaInput,
  type SportsEventSchemaInput,
} from "@/lib/seo/schema";
import styles from "./seo.module.css";

type MatchSeoProps = {
  event: Omit<SportsEventSchemaInput, "locale">;
  breadcrumbs: readonly BreadcrumbItem[];
  /** LIVE/FT updates only — omit or null for scheduled/postponed/cancelled. */
  liveBlog?: Omit<LiveBlogPostingSchemaInput, "locale"> | null;
};

export default async function MatchSeo({
  event,
  breadcrumbs,
  liveBlog = null,
}: MatchSeoProps) {
  const locale = await getLocale();
  const schema = combineSchemaGraph([
    sportsEventSchema({ ...event, locale }),
    liveBlog ? liveBlogPostingSchema({ ...liveBlog, locale }) : null,
    breadcrumbSchema(breadcrumbs, locale),
  ]);

  return (
    <>
      <JsonLd data={schema} />
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        {breadcrumbs.map((item) => (
          <span key={item.path}>
            <span aria-hidden="true"> › </span>
            <Link href={item.path}>{item.name}</Link>
          </span>
        ))}
      </nav>
    </>
  );
}
