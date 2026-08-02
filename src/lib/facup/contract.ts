/**
 * FA Cup knockout data contract — rounds/statuses without standings or two-leg aggregates.
 */

import type {
  FacupFixtureRow,
  FacupFixtureStatus,
  FacupRoundGroup,
  FacupRoundKind,
} from "@/lib/facup/types";

export function mapFacupFixtureStatus(short: string): FacupFixtureStatus {
  const code = short.trim().toUpperCase();
  if (code === "PEN") return "PEN";
  if (code === "AET") return "AET";
  if (code === "FT") return "FT";
  if (
    code === "1H" ||
    code === "2H" ||
    code === "HT" ||
    code === "ET" ||
    code === "BT" ||
    code === "P" ||
    code === "INT" ||
    code === "LIVE"
  ) {
    return "LIVE";
  }
  if (code === "PST") return "POSTPONED";
  if (code === "ABD") return "ABANDONED";
  if (code === "CANC" || code === "AWD" || code === "WO") return "CANCELLED";
  return "UPCOMING";
}

export function mapFacupRound(round: string | null | undefined): {
  kind: FacupRoundKind;
  label: string;
  isReplay: boolean;
} {
  if (!round || !round.trim()) {
    return { kind: "other", label: "Other", isReplay: false };
  }
  const raw = round.trim();
  const r = raw.toLowerCase();
  const isReplay = r.includes("replay");

  if (r.includes("qualif") || r.includes("preliminary") || r.includes("extra preliminary")) {
    return { kind: "qualifying", label: raw, isReplay };
  }
  if (r.includes("1st") || r.includes("first round") || /\bfirst\b/.test(r)) {
    return { kind: "first_round", label: raw, isReplay };
  }
  if (r.includes("2nd") || r.includes("second round") || /\bsecond\b/.test(r)) {
    return { kind: "second_round", label: raw, isReplay };
  }
  if (r.includes("3rd") || r.includes("third round") || /\bthird\b/.test(r)) {
    return { kind: "third_round", label: raw, isReplay };
  }
  if (r.includes("4th") || r.includes("fourth round") || /\bfourth\b/.test(r)) {
    return { kind: "fourth_round", label: raw, isReplay };
  }
  if (r.includes("5th") || r.includes("fifth round") || /\bfifth\b/.test(r)) {
    return { kind: "fifth_round", label: raw, isReplay };
  }
  if (r.includes("quarter") || r.includes("1/4")) {
    return { kind: "quarter_final", label: raw, isReplay };
  }
  if (r.includes("semi") || r.includes("1/2")) {
    return { kind: "semi_final", label: raw, isReplay };
  }
  if (r.includes("final") && !r.includes("semi")) {
    return { kind: "final", label: raw, isReplay };
  }
  if (isReplay) {
    return { kind: "replay", label: raw, isReplay: true };
  }
  return { kind: "other", label: raw, isReplay: false };
}

export function isFinishedFacupStatus(status: FacupFixtureStatus): boolean {
  return status === "FT" || status === "AET" || status === "PEN";
}

export function isLiveFacupStatus(status: FacupFixtureStatus): boolean {
  return status === "LIVE";
}

export function facupStandingsSupported(): false {
  return false;
}

export function sanitiseFacupProviderError(message: string | undefined): string {
  if (!message) return "FA Cup data is temporarily unavailable.";
  const lower = message.toLowerCase();
  if (lower.includes("rate") || lower.includes("429")) {
    return "FA Cup data is rate-limited. Please try again shortly.";
  }
  if (lower.includes("key") || lower.includes("auth") || lower.includes("token")) {
    return "FA Cup data is not configured on this server.";
  }
  return "FA Cup data is temporarily unavailable.";
}

const ROUND_ORDER: FacupRoundKind[] = [
  "qualifying",
  "first_round",
  "second_round",
  "third_round",
  "fourth_round",
  "fifth_round",
  "quarter_final",
  "semi_final",
  "final",
  "replay",
  "other",
];

export function facupRoundSortIndex(kind: FacupRoundKind): number {
  const idx = ROUND_ORDER.indexOf(kind);
  return idx >= 0 ? idx : ROUND_ORDER.length;
}

export function groupFacupFixturesByRound(
  fixtures: FacupFixtureRow[],
): FacupRoundGroup[] {
  const map = new Map<string, FacupRoundGroup>();
  for (const fixture of fixtures) {
    const key = `${fixture.roundKind}:${fixture.roundLabel}`;
    const existing = map.get(key);
    if (existing) {
      existing.fixtures.push(fixture);
    } else {
      map.set(key, {
        roundKind: fixture.roundKind,
        roundLabel: fixture.roundLabel,
        fixtures: [fixture],
      });
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      facupRoundSortIndex(a.roundKind) - facupRoundSortIndex(b.roundKind) ||
      a.roundLabel.localeCompare(b.roundLabel),
  );
}