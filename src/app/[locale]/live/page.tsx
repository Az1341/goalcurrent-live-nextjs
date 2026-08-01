export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";

import LivePageClient from "@/app/[locale]/live/LivePageClient";
import ErrorBoundary from "@/components/system/ErrorBoundary";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

export const metadata: Metadata = buildPageMetadata({
  title: "Live Scores",
  description: `Live and upcoming football on ${SITE_NAME} — Premier League, Nations League, Champions League and FA Cup fixtures.`,
  path: "/live",
});

export default function LivePage() {
  return (
    <ErrorBoundary>
      <LivePageClient />
    </ErrorBoundary>
  );
}
