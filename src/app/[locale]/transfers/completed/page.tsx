import type { Metadata } from "next";
import TransferNewsHub from "@/components/transfers/TransferNewsHub";
import { buildPageMetadata } from "@/lib/page-metadata";

export const revalidate = 900;

export const metadata: Metadata = buildPageMetadata({
  title: "Completed Transfers",
  description: "Recent confirmed football signings, completed moves and departures on GoalCurrent.live.",
  path: "/transfers/completed",
  locale: "en",
});

export default function TransferCompletedPage() {
  return <TransferNewsHub view="completed" />;
}
