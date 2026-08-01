import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UnlMatchClient from "@/components/unl/UnlMatchClient";
import { getUnlSsotFixtureById } from "@/lib/unl/fixtures-ssot";
import { UNL_DISPLAY_NAME } from "@/lib/unl/constants";

type PageProps = {
  params: Promise<{ locale: string; fixtureId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  const fixture = getUnlSsotFixtureById(id);
  if (!fixture) {
    return { title: `Match — ${UNL_DISPLAY_NAME}` };
  }
  return {
    title: `${fixture.homeTeamName} vs ${fixture.awayTeamName} — ${UNL_DISPLAY_NAME}`,
    description: `${fixture.homeTeamName} vs ${fixture.awayTeamName} · Nations League ${fixture.groupId.toUpperCase()}`,
  };
}

export default async function UnlMatchPage({ params }: PageProps) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const fixture = getUnlSsotFixtureById(id);
  if (!fixture) notFound();
  return <UnlMatchClient fixture={fixture} />;
}