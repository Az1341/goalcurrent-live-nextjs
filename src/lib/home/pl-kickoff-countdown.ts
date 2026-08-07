export type CountdownParts = {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
};

/** Split remaining milliseconds into days / hours / minutes (floored, never negative). */
export function splitCountdownParts(remainingMs: number): CountdownParts {
  const ms = Math.max(0, Math.floor(remainingMs));
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
  };
}
