const FLAG_BASE = "/flags/4x3";

/** Public flag asset path for a UNL nation flag code, or null when missing. */
export function getUnlFlagSrc(flagCode: string | null | undefined): string | null {
  const code = flagCode?.trim().toLowerCase();
  if (!code) return null;
  return `${FLAG_BASE}/${code}.svg`;
}