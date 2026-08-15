import type { Metadata } from "next";
import TransferNewsHub from "@/components/transfers/TransferNewsHub";
import { buildPageMetadata } from "@/lib/page-metadata";

export const revalidate = 900;

export const metadata: Metadata = buildPageMetadata({
  title: "Free Agents",
  description: "Current football free-agent, released-player and out-of-contract reports on GoalCurrent.live.",
  path: "/transfers/free-agents",
  locale: "en",
});

export default function TransferFreeAgentsPage() {
  return <TransferNewsHub view="free-agents" />;
}
