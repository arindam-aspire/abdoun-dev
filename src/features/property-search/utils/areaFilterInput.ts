/**
 * Square-meter / plot area filter helpers for URL-driven search fields.
 * Values are non-negative integers only (no decimals, no signs).
 */

/** Strip everything except digits so users cannot type negatives or letters. */
export function sanitizeSqmDigitsInput(raw: string): string {
  return raw.replace(/\D/g, "");
}

export type MinMaxSqmValidation = {
  /** Shown when both min and max are non-empty and min is greater than max. */
  pairError?: string;
};

export function validateMinMaxSqmPair(
  minStr: string,
  maxStr: string,
  pairErrorMessage: string,
): MinMaxSqmValidation {
  const minT = minStr.trim();
  const maxT = maxStr.trim();
  if (!minT || !maxT) return {};
  const minN = Number.parseInt(minT, 10);
  const maxN = Number.parseInt(maxT, 10);
  if (!Number.isFinite(minN) || !Number.isFinite(maxN)) return {};
  if (minN > maxN) return { pairError: pairErrorMessage };
  return {};
}

/**
 * Whether min/max may be written to the query string.
 * Empty optional bounds are allowed; one-sided is allowed; both filled require min <= max.
 */
export function isMinMaxSqmPairAllowedForQuery(minStr: string, maxStr: string): boolean {
  const minT = minStr.trim();
  const maxT = maxStr.trim();
  if (!/^\d*$/.test(minT) || !/^\d*$/.test(maxT)) return false;
  if (!minT && !maxT) return true;
  const minN = minT === "" ? null : Number.parseInt(minT, 10);
  const maxN = maxT === "" ? null : Number.parseInt(maxT, 10);
  if (minN !== null && (!Number.isFinite(minN) || minN < 0)) return false;
  if (maxN !== null && (!Number.isFinite(maxN) || maxN < 0)) return false;
  if (minN !== null && maxN !== null && minN > maxN) return false;
  return true;
}
