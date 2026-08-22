import { formatEventMinute } from "@/lib/wc26-match";
import type { MatchEventItem } from "@/types/match-detail";

export type TimelineEventTone =
  | "goal"
  | "penalty"
  | "penalty-missed"
  | "own-goal"
  | "var-denied"
  | "var"
  | "subst"
  | "yellow"
  | "red"
  | "second-yellow"
  | "injury"
  | "period"
  | "neutral";

export type TimelineEventBadge = {
  symbol: string;
  secondarySymbol?: string;
  background: string;
  foreground: string;
  ariaLabel: string;
  variant?: "emoji" | "text";
  tone: TimelineEventTone;
};

export type TimelineEventDisplay = {
  badge: TimelineEventBadge;
  minute: string;
  title: string;
  playerName: string | null;
  assistLabel: string | null;
  teamName: string;
  isGoal: boolean;
  isPeriod: boolean;
  sortMinute: number;
  sortExtra: number;
};

export type TimelineEventSide = "home" | "away" | "neutral";

function badge(
  symbol: string,
  background: string,
  ariaLabel: string,
  tone: TimelineEventTone,
  options?: {
    secondarySymbol?: string;
    foreground?: string;
    variant?: "emoji" | "text";
  },
): TimelineEventBadge {
  return {
    symbol,
    secondarySymbol: options?.secondarySymbol,
    background,
    foreground: options?.foreground ?? "#ffffff",
    ariaLabel,
    variant: options?.variant ?? "emoji",
    tone,
  };
}

export function compareTimelineEvents(
  left: MatchEventItem,
  right: MatchEventItem,
): number {
  const leftMinute = left.minute ?? 0;
  const rightMinute = right.minute ?? 0;
  if (leftMinute !== rightMinute) {
    return leftMinute - rightMinute;
  }
  const leftExtra = left.extra ?? 0;
  const rightExtra = right.extra ?? 0;
  if (leftExtra !== rightExtra) {
    return leftExtra - rightExtra;
  }
  return 0;
}

export function sortTimelineEvents(
  events: readonly MatchEventItem[],
): MatchEventItem[] {
  return [...events].sort(compareTimelineEvents);
}

function safeEventText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTeamKey(value: unknown): string {
  return safeEventText(value).toLowerCase().replace(/\s+/g, " ");
}

export function resolveEventSide(
  eventTeamName: string,
  homeTeamName: string,
  awayTeamName: string,
  lineupHomeName?: string | null,
  lineupAwayName?: string | null,
): TimelineEventSide {
  const eventKey = normalizeTeamKey(eventTeamName);
  if (!eventKey) {
    return "neutral";
  }

  const homeKeys = [homeTeamName, lineupHomeName]
    .filter(Boolean)
    .map((name) => normalizeTeamKey(name));
  const awayKeys = [awayTeamName, lineupAwayName]
    .filter(Boolean)
    .map((name) => normalizeTeamKey(name));

  if (homeKeys.some((key) => key === eventKey || eventKey.includes(key) || key.includes(eventKey))) {
    return "home";
  }
  if (awayKeys.some((key) => key === eventKey || eventKey.includes(key) || key.includes(eventKey))) {
    return "away";
  }

  return "neutral";
}

export function resolveTimelineEventDisplay(
  event: MatchEventItem,
): TimelineEventDisplay {
  // API-Football has historically returned null text fields for some archived
  // events despite the normalized application type being string-based. Keep
  // the rendering boundary fail-safe so one malformed provider row cannot 500
  // an otherwise valid match page or its JSON-LD/live-blog generation.
  const type = safeEventText(event.type).toLowerCase();
  const detail = safeEventText(event.detail).toLowerCase();
  const minute = formatEventMinute(event.minute, event.extra);
  const playerName = safeEventText(event.playerName) || null;
  const teamName = safeEventText(event.teamName);
  const sortMinute = event.minute ?? 0;
  const sortExtra = event.extra ?? 0;

  const periodMatch = resolvePeriodBadge(type, detail);
  if (periodMatch) {
    return {
      badge: periodMatch.badge,
      minute,
      title: periodMatch.title,
      playerName: null,
      assistLabel: null,
      teamName,
      isGoal: false,
      isPeriod: true,
      sortMinute,
      sortExtra,
    };
  }

  if (type === "goal") {
    if (detail.includes("missed")) {
      return {
        badge: badge("❌", "#dc2626", "Penalty missed", "penalty-missed"),
        minute,
        title: "Penalty missed",
        playerName,
        assistLabel: null,
        teamName,
        isGoal: false,
        isPeriod: false,
        sortMinute,
        sortExtra,
      };
    }
    if (detail.includes("own")) {
      return {
        badge: badge("🥅", "#ea580c", "Own goal", "own-goal"),
        minute,
        title: "Own goal",
        playerName,
        assistLabel: null,
        teamName,
        isGoal: true,
        isPeriod: false,
        sortMinute,
        sortExtra,
      };
    }
    if (detail.includes("penalty")) {
      return {
        badge: badge("🎯", "#7c3aed", "Penalty goal", "penalty"),
        minute,
        title: "Penalty goal",
        playerName,
        assistLabel: assistLabel(event.assistName),
        teamName,
        isGoal: true,
        isPeriod: false,
        sortMinute,
        sortExtra,
      };
    }
    return {
      badge: badge("⚽", "#16a34a", "Goal", "goal"),
      minute,
      title: "Goal",
      playerName,
      assistLabel: assistLabel(event.assistName),
      teamName,
      isGoal: true,
      isPeriod: false,
      sortMinute,
      sortExtra,
    };
  }

  if (type === "card") {
    if (
      detail.includes("second yellow") ||
      detail.includes("yellow-red") ||
      detail.includes("yellow red")
    ) {
      return {
        badge: badge("🟨", "#ea580c", "Second yellow card", "second-yellow", {
          secondarySymbol: "🟥",
        }),
        minute,
        title: "Second yellow",
        playerName,
        assistLabel: null,
        teamName,
        isGoal: false,
        isPeriod: false,
        sortMinute,
        sortExtra,
      };
    }
    if (detail.includes("red")) {
      return {
        badge: badge("🟥", "#dc2626", "Red card", "red"),
        minute,
        title: "Red card",
        playerName,
        assistLabel: null,
        teamName,
        isGoal: false,
        isPeriod: false,
        sortMinute,
        sortExtra,
      };
    }
    return {
      badge: badge("🟨", "#facc15", "Yellow card", "yellow", { foreground: "#1f2937" }),
      minute,
      title: "Yellow card",
      playerName,
      assistLabel: null,
      teamName,
      isGoal: false,
      isPeriod: false,
      sortMinute,
      sortExtra,
    };
  }

  if (type === "subst" || type === "substitution") {
    return {
      badge: badge("🔄", "#0d9488", "Substitution", "subst"),
      minute,
      title: "Substitution",
      playerName,
      assistLabel: safeEventText(event.assistName) ? `Off: ${safeEventText(event.assistName)}` : null,
      teamName,
      isGoal: false,
      isPeriod: false,
      sortMinute,
      sortExtra,
    };
  }

  if (type === "var") {
    if (
      detail.includes("goal") &&
      (detail.includes("disallowed") ||
        detail.includes("cancelled") ||
        detail.includes("canceled") ||
        detail.includes("no goal"))
    ) {
      return {
        badge: badge("🚫", "#1e3a8a", "VAR disallowed goal", "var-denied", {
          secondarySymbol: "⚽",
        }),
        minute,
        title: "Goal disallowed",
        playerName,
        assistLabel: null,
        teamName,
        isGoal: false,
        isPeriod: false,
        sortMinute,
        sortExtra,
      };
    }
    return {
      badge: badge("📺", "#2563eb", "VAR review", "var"),
      minute,
      title: "VAR review",
      playerName,
      assistLabel: safeEventText(event.detail) || null,
      teamName,
      isGoal: false,
      isPeriod: false,
      sortMinute,
      sortExtra,
    };
  }

  if (detail.includes("injury") || type.includes("injury")) {
    return {
      badge: badge("🚑", "#ef4444", "Injury", "injury"),
      minute,
      title: "Injury",
      playerName,
      assistLabel: null,
      teamName,
      isGoal: false,
      isPeriod: false,
      sortMinute,
      sortExtra,
    };
  }

  const fallbackTitle = safeEventText(event.detail) || safeEventText(event.type) || "Event";
  return {
    badge: badge("•", "#6b7280", safeEventText(event.type) || "Event", "neutral"),
    minute,
    title: fallbackTitle,
    playerName,
    assistLabel: assistLabel(event.assistName),
    teamName,
    isGoal: false,
    isPeriod: false,
    sortMinute,
    sortExtra,
  };
}

function assistLabel(assistName: string | null): string | null {
  const normalized = safeEventText(assistName);
  if (!normalized) {
    return null;
  }
  return `🅰️ ${normalized}`;
}

function resolvePeriodBadge(
  type: string,
  detail: string,
): { badge: TimelineEventBadge; title: string } | null {
  const combined = `${type} ${detail}`.toLowerCase();

  if (
    combined.includes("penalty shootout") ||
    combined.includes("penalties") ||
    type === "pen"
  ) {
    return {
      badge: badge("PEN", "#7c3aed", "Penalty shootout", "period", { variant: "text" }),
      title: "Penalty shootout",
    };
  }
  if (combined.includes("extra time") || type === "et") {
    return {
      badge: badge("ET", "#4b5563", "Extra time", "period", { variant: "text" }),
      title: "Extra time",
    };
  }
  if (combined.includes("half time") || type === "ht") {
    return {
      badge: badge("HT", "#6b7280", "Half time", "period", { variant: "text" }),
      title: "Half time",
    };
  }
  if (combined.includes("full time") || type === "ft") {
    return {
      badge: badge("FT", "#374151", "Full time", "period", { variant: "text" }),
      title: "Full time",
    };
  }

  return null;
}
