import type { Metadata } from "next";

import FixtureCalendarClient from "@/components/fixtures/FixtureCalendarClient";
import ErrorBoundary from "@/components/system/ErrorBoundary";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

export const metadata: Metadata = buildPageMetadata({
  title: "Fixtures calendar",
  description: `Fixtures calendar on ${SITE_NAME} — Premier League, Champions League, FA Cup, and Nations League 26/27.`,
  path: "/fixture",
});

export default function FixtureCalendarPage() {
  return (
    <ErrorBoundary>
      <FixtureCalendarClient />
    </ErrorBoundary>
  );
}