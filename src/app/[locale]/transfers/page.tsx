import type { Metadata } from "next";
import TransferNewsHub from "@/components/transfers/TransferNewsHub";
import { buildPageMetadata } from "@/lib/page-metadata";

export const revalidate = 900;

export const metadata: Metadata = buildPageMetadata({
  title: "Latest Transfers",
  description: "Current football transfer news, confirmed moves and credible market reports on GoalCurrent.live.",
  path: "/transfers",
  locale: "en",
});

export default function TransfersPage() {
  return <TransferNewsHub view="latest" />;
}
