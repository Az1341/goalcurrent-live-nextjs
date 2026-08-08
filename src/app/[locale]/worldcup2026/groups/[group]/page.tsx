import type { Metadata } from "next";

import { notFound, redirect } from "next/navigation";

import GroupPageContent from "@/components/wc26/GroupPageContent";

import { WC26_GROUP_IDS, isWc26GroupId } from "@/data/wc26";

import type { Wc26GroupId } from "@/types/group";

import { groupHref } from "@/lib/wc26-groups";

import { buildPageMetadata } from "@/lib/page-metadata";
import { groupHubDescription, groupHubTitle } from "@/lib/wc26-group-hub";

type PageProps = {
  params: Promise<{ locale: string; group: string }>;
};

/** Accept legacy /groups/group-a URLs and map to canonical /groups/a. */

function resolveGroupParam(raw: string): Wc26GroupId | null {
  const legacy = /^group-([a-l])$/i.exec(raw.trim());

  const candidate = legacy ? legacy[1].toLowerCase() : raw.trim().toLowerCase();

  return isWc26GroupId(candidate) ? candidate : null;
}

export function generateStaticParams() {
  return WC26_GROUP_IDS.map((group) => ({ group }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, group } = await params;
  const groupId = resolveGroupParam(group);

  if (!groupId) {
    return { title: "Group — World Cup 2026" };
  }

  return buildPageMetadata({
    title: groupHubTitle(groupId),
    description: groupHubDescription(groupId),
    path: groupHref(groupId),
    locale,
  });
}

export default async function GroupPage({ params }: PageProps) {
  const { group } = await params;

  const legacy = /^group-([a-l])$/i.exec(group.trim());

  if (legacy) {
    redirect(`/worldcup2026/groups/${legacy[1].toLowerCase()}`);
  }

  if (!isWc26GroupId(group)) {
    notFound();
  }

  return <GroupPageContent groupId={group} />;
}
