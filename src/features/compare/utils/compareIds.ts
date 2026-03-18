export function parseCompareIds(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

