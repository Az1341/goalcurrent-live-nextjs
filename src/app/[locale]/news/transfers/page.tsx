import type { Metadata } from "next";
import TransferNewsHub from "@/components/transfers/TransferNewsHub";
import { buildPageMetadata } from "@/lib/page-metadata";

export const revalidate = 900;

export const metadata: Metadata = buildPageMetadata({
  title: "Transfer News",
  description: "Current football transfer news, rumours and reported deals on GoalCurrent.live.",
  path: "/news/transfers",
  locale: "en",
});

export default function TransferNewsPage() {
  return <TransferNewsHub view="latest" />;
}
