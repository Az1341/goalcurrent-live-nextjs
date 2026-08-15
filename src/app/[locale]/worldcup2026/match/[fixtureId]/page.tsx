import { permanentRedirect } from "next/navigation";
import { matchHref } from "@/lib/wc26-match";

type Wc26MatchRedirectProps = {
  params: Promise<{ fixtureId: string; locale: string }>;
};

/** Legacy WC26 path: permanently consolidate all signals on canonical /match/[fixtureId]. */
export default async function Wc26MatchRedirectPage({
  params,
}: Wc26MatchRedirectProps) {
  const { fixtureId: rawId } = await params;
  const fixtureId = decodeURIComponent(rawId);
  permanentRedirect(matchHref(fixtureId));
}
