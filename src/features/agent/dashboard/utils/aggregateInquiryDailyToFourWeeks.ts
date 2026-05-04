/**
 * Turns a 30-day daily inquiry series into 4 weekly bars for SparkBarsChart.
 *
 * Convention (matches `buildTrendLast30Days` / dashboard summary API):
 * - `daily[0]` = count on the day **29 days ago**
 * - `daily[29]` = count **today**
 * - Output order: **oldest week first** → **newest week last** (left → right on chart)
 *
 * Bucket sizes: 7 + 7 + 7 + 9 days = 30 (last bucket includes the most recent 9 days).
 */

const BUCKET_SIZES = [7, 7, 7, 9] as const;

function formatWeekRangeLabel(
  startDaysAgo: number,
  endDaysAgo: number,
  locale: string,
): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - startDaysAgo);
  const end = new Date(now);
  end.setDate(end.getDate() - endDaysAgo);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, opts)}`;
}

export function aggregateInquiryDailyToFourWeeks(
  daily: number[],
  locale: string,
): { weekLabel: string; count: number }[] {
  if (!daily.length) {
    return [];
  }

  const padded: number[] = daily.slice(0, 30);
  while (padded.length < 30) {
    padded.push(0);
  }

  const out: { weekLabel: string; count: number }[] = [];
  let offset = 0;

  for (let w = 0; w < BUCKET_SIZES.length; w++) {
    const size = BUCKET_SIZES[w];
    let sum = 0;
    for (let i = 0; i < size; i++) {
      sum += padded[offset + i] ?? 0;
    }
    offset += size;

    const startIdx = offset - size;
    const endIdx = offset - 1;
    const startDaysAgo = 29 - startIdx;
    const endDaysAgo = 29 - endIdx;

    out.push({
      weekLabel: formatWeekRangeLabel(startDaysAgo, endDaysAgo, locale),
      count: sum,
    });
  }

  return out;
}
