import type { Metadata } from "next";
import TransferNewsHub from "@/components/transfers/TransferNewsHub";
import { buildPageMetadata } from "@/lib/page-metadata";

export const revalidate = 900;

export const metadata: Metadata = buildPageMetadata({
  title: "Transfer Rumours",
  description: "Current football transfer rumours, talks and reported targets on GoalCurrent.live.",
  path: "/transfers/rumours",
  locale: "en",
});

export default function TransferRumoursPage() {
  return <TransferNewsHub view="rumours" />;
}
