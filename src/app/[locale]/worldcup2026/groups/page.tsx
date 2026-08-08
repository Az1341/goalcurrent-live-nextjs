import type { Metadata } from "next";
import GroupsHubContent from "@/components/wc26/GroupsHubContent";
import { getWc26Section } from "@/lib/wc26-sections";
import { buildPageMetadata } from "@/lib/page-metadata";

const section = getWc26Section("groups")!;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Groups — World Cup 2026 Archive",
    description: section.description,
    path: section.href,
    locale,
  });
}
export default function GroupsHubPage() {
  return <GroupsHubContent />;
}
