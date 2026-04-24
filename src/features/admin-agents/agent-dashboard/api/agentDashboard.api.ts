import { createHttpClients, getApiErrorMessage } from "@/lib/http";
import type { StandardApiResponse } from "@/services/userService";
import {
  getPerformanceComparison,
} from "@/services/agentDashboardMockService";
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

export async function fetchAgentPerformanceComparison(): Promise<
  PerformanceComparisonItem[]
> {
  return await getPerformanceComparison();
}

