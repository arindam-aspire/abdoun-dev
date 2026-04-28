import { createHttpClients, getApiErrorMessage } from "@/lib/http";
import type { StandardApiResponse } from "@/services/userService";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";

type AgentDashboardSummaryActivityTone = "neutral" | "success" | "warning" | "info";

type AgentDashboardSummaryApiActivity = {
  text?: unknown;
  time?: unknown;
  tone?: unknown;
};

type AgentDashboardSummaryApiData = {
  totalProperties?: unknown;
  leadsThisMonth?: unknown;
  dealCloseCount?: unknown;
  conversionRate?: unknown;
  totalPropertyViews?: unknown;
  activeProperties?: unknown;
  draftProperties?: unknown;
  inquiryVolumeAllTime?: unknown;
  inquiryVolumeLast7Days?: unknown;
  inquiryTrendLast30Days?: unknown;
  recentActivity?: unknown;
  listingsChangePercent?: unknown;
  leadsChangePercent?: unknown;
  dealsClosedChangePercent?: unknown;
  propertyViewsChangePercent?: unknown;
  /** New backend key for dashboard bar chart. */
  propertyPerformance?: unknown;
};

const { authApi } = createHttpClients();

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

/** Percent deltas from API: omit or invalid → null (hide trend chip). */
const toOptionalFiniteNumber = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const toActivityTone = (tone: unknown): AgentDashboardSummaryActivityTone => {
  if (tone === "success" || tone === "warning" || tone === "neutral" || tone === "info") {
    return tone;
  }
  return "neutral";
};

const toRecentActivity = (
  activity: unknown,
): AgentDashboardData["recentActivity"] => {
  if (!Array.isArray(activity)) {
    return [];
  }

  return activity.map((item) => {
    const row = (item ?? {}) as AgentDashboardSummaryApiActivity;
    return {
      text: typeof row.text === "string" ? row.text : "",
      time: typeof row.time === "string" ? row.time : "",
      tone: toActivityTone(row.tone),
    };
  });
};

const toTrend = (trend: unknown): number[] => {
  if (!Array.isArray(trend)) {
    return [];
  }

  return trend.map((value) => toFiniteNumber(value, 0));
};

function toOptionalLabelString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function toPerformanceItems(value: unknown): PerformanceComparisonItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    const labelRaw =
      r.label ??
      r.property_title ??
      r.propertyTitle ??
      r.title ??
      r.name ??
      r.property_name ??
      r.propertyName;
    const label = toOptionalLabelString(labelRaw).trim();
    const valueRaw =
      r.value ??
      r.views ??
      r.view_count ??
      r.viewCount ??
      r.total_views ??
      r.totalViews ??
      r.count;
    return {
      label: label || toOptionalLabelString(r.id).trim() || "—",
      value: toFiniteNumber(valueRaw, 0),
    };
  });
}

const toAgentDashboardData = (payload: AgentDashboardSummaryApiData): AgentDashboardData => ({
  totalProperties: toFiniteNumber(payload.totalProperties),
  activeProperties: toFiniteNumber(payload.activeProperties),
  draftProperties: toFiniteNumber(payload.draftProperties),
  inquiryVolumeAllTime: toFiniteNumber(payload.inquiryVolumeAllTime),
  inquiryVolumeLast7Days: toFiniteNumber(payload.inquiryVolumeLast7Days),
  leadsThisMonth: toFiniteNumber(payload.leadsThisMonth),
  totalPropertyViews: toFiniteNumber(payload.totalPropertyViews),
  dealCloseCount: toFiniteNumber(payload.dealCloseCount),
  conversionRate: toFiniteNumber(payload.conversionRate),
  listingsChangePercent: toOptionalFiniteNumber(payload.listingsChangePercent),
  leadsChangePercent: toOptionalFiniteNumber(payload.leadsChangePercent),
  dealsClosedChangePercent: toOptionalFiniteNumber(payload.dealsClosedChangePercent),
  propertyViewsChangePercent: toOptionalFiniteNumber(payload.propertyViewsChangePercent),
  inquiryTrendLast30Days: toTrend(payload.inquiryTrendLast30Days),
  recentActivity: toRecentActivity(payload.recentActivity),
  propertyPerformance: toPerformanceItems(payload.propertyPerformance),
});

export async function fetchAgentDashboardData(): Promise<AgentDashboardData> {
  try {
    const response = await authApi.get<StandardApiResponse<AgentDashboardSummaryApiData>>(
      "/agents/dashboard/summary",
    );
    return toAgentDashboardData(response.data.data ?? {});
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/* ------------------------------------------------------------------ */
/*  Agent property performance (View rate page)                         */
/* ------------------------------------------------------------------ */

export type AgentPropertyPerformancePeriod = "all" | "weekly" | "monthly" | "yearly";

export type AgentPropertyPerformanceParams = {
  /** 1-based page index. */
  page?: number;
  /** Page size. */
  pageSize?: number;
  /** Period window. */
  period?: AgentPropertyPerformancePeriod;
};

export type AgentPropertyPerformanceResult = {
  items: PerformanceComparisonItem[];
  /** Total rows across all pages, when API sends it; else current page length. */
  total: number;
};

type AgentPropertyPerformanceApiData = unknown;

function parseAgentPropertyPerformancePayload(data: AgentPropertyPerformanceApiData): AgentPropertyPerformanceResult {
  // Accept either an array or common wrapper shapes.
  if (Array.isArray(data)) {
    const items = toPerformanceItems(data);
    return { items, total: items.length };
  }

  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const seriesCandidate =
      o.items ??
      o.propertyPerformanceSeries ??
      o.results ??
      o.rows ??
      o.data;

    const items = toPerformanceItems(seriesCandidate);

    const totalRaw =
      o.total ?? o.total_count ?? o.count ?? o.totalItems ?? o.total_records ?? o.totalCount;
    const total =
      typeof totalRaw === "number" && Number.isFinite(totalRaw)
        ? totalRaw
        : typeof totalRaw === "string" && Number.isFinite(Number(totalRaw))
          ? Number(totalRaw)
          : items.length;

    return { items, total: Math.max(total, items.length) };
  }

  return { items: [], total: 0 };
}

/**
 * `GET /agent/property-performance?page=&pageSize=&period=`
 * (`period` = `all` | `weekly` | `monthly` | `yearly`).
 */
export async function fetchAgentPropertyPerformance(
  params: AgentPropertyPerformanceParams = {},
): Promise<AgentPropertyPerformanceResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const period = params.period ?? "all";

  try {
    const response = await authApi.get<StandardApiResponse<AgentPropertyPerformanceApiData>>(
      "/agent/property-performance",
      {
        params: { page, pageSize, period },
      },
    );
    const body = response.data;
    return parseAgentPropertyPerformancePayload(body?.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

