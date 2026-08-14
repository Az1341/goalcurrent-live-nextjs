import { NextResponse } from "next/server";
import {
  communityShieldMatchCacheControl,
  fetchCommunityShieldMatchDetail,
} from "@/lib/community-shield/match-detail";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fixtureId: string }> },
) {
  const { fixtureId: rawFixtureId } = await context.params;
  const fixtureId = Number.parseInt(rawFixtureId, 10);
  const body = await fetchCommunityShieldMatchDetail(fixtureId);

  return NextResponse.json(body, {
    status: body.error === "Invalid Community Shield fixture id." ? 404 : 200,
    headers: {
      "Cache-Control": communityShieldMatchCacheControl(body),
    },
  });
}
