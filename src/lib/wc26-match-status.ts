/**
 * Normalize api-football / overlay status for WC26 surfaces.
 *
 * Provider in-play shorts (1H / 2H) must be preserved even when elapsed is 90+
 * during stoppage time. Only finished provider statuses (e.g. FT, AET, PEN)
 * should be treated as completed elsewhere — never invent FT from elapsed alone.
 */
export function normalizeWc26MatchStatus(
  status: string,
  elapsed?: number | null,
): string {
  void elapsed;
  return status;
}