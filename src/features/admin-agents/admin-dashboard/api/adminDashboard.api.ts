import { createHttpClients, getApiErrorMessage } from "@/lib/http";
import type {
  AdminDashboardData,
  PerformanceComparisonItem,
} from "@/services/adminDashboardMockService";
import type { StandardApiResponse } from "@/services/userService";

const { authApi } = createHttpClients();

type AdminDashboardSummaryApiData = Record<string, unknown>;

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

const toNumberSeries = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => toFiniteNumber(item, 0));
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => (typeof item === "string" ? item : String(item ?? "")));
};

const toOptionalLabelString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
};

/**
 * Maps `propertyPerformanceSeries` rows from `GET /admin/dashboard/summary`
 * (camelCase or snake_case keys; label vs title; value vs views).
 */
const toPropertyPerformanceSeries = (value: unknown): PerformanceComparisonItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }
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
};

/** Normalizes `data` from `GET /admin/dashboard/property-performance` (array or common wrapper keys). */
function parsePropertyPerformanceApiData(data: unknown): PerformanceComparisonItem[] {
  if (Array.isArray(data)) {
    return toPropertyPerformanceSeries(data);
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.items)) return toPropertyPerformanceSeries(o.items);
    if (Array.isArray(o.propertyPerformanceSeries)) {
      return toPropertyPerformanceSeries(o.propertyPerformanceSeries);
    }
    if (Array.isArray(o.results)) return toPropertyPerformanceSeries(o.results);
  }
  return [];
}

/** Values sent as the `limit` query param (period / aggregation window). */
export type AdminPropertyPerformancePeriod = "all" | "weekly" | "monthly" | "yearly";

export type AdminPropertyPerformanceParams = {
  /** 1-based page index. */
  page?: number;
  /** Page size (query: `pageSize`). */
  pageSize?: number;
  /**
   * Period window — sent as query param `limit` (e.g. `weekly`, `monthly`, `yearly`, `all`).
   */
  period?: AdminPropertyPerformancePeriod;
};

export type AdminPropertyPerformanceResult = {
  items: PerformanceComparisonItem[];
  /** Total rows across all pages, when API sends it; else current page length. */
  total: number;
};

function parsePropertyPerformancePayload(data: unknown): AdminPropertyPerformanceResult {
  const items = parsePropertyPerformanceApiData(data);
  let total = items.length;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    const totalRaw =
      o.total ?? o.total_count ?? o.count ?? o.totalItems ?? o.total_records ?? o.totalCount;
    if (typeof totalRaw === "number" && Number.isFinite(totalRaw)) {
      total = totalRaw;
    } else if (typeof totalRaw === "string") {
      const n = Number(totalRaw);
      if (Number.isFinite(n)) total = n;
    }
  }
  return { items, total: Math.max(total, items.length) };
}

function currentLocalMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function resolveFailureMessage(body: StandardApiResponse<unknown> | undefined): string {
  if (body && typeof body === "object") {
    const err = body.error;
    const msg = body.message;
    if (typeof err === "string" && err.trim()) return err;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return "Unable to load admin dashboard.";
}

function assertSuccessData<T extends Record<string, unknown>>(
  body: StandardApiResponse<T> | undefined,
): T {
  if (!body?.success) {
    throw new Error(resolveFailureMessage(body));
  }
  if (!body.data || typeof body.data !== "object") {
    throw new Error("Invalid dashboard response.");
  }
  return body.data as T;
}

function pickPropertyPerformanceSeriesRaw(
  payload: AdminDashboardSummaryApiData,
): unknown {
  const p = payload as Record<string, unknown>;
  const camel = p.propertyPerformanceSeries;
  const snake = p.property_performance_series;
  if (Array.isArray(camel)) return camel;
  if (Array.isArray(snake)) return snake;
  return camel ?? snake;
}

const toAdminDashboardData = (payload: AdminDashboardSummaryApiData): AdminDashboardData => {
  const monthRaw = payload.month;
  const month =
    typeof monthRaw === "string" && /^\d{4}-\d{2}$/.test(monthRaw) ? monthRaw : currentLocalMonth();

  return {
    month,
    usersThisMonth: toFiniteNumber(payload.usersThisMonth),
    usersMoMDelta: toFiniteNumber(payload.usersMoMDelta),
    agentsThisMonth: toFiniteNumber(payload.agentsThisMonth),
    agentsMoMDelta: toFiniteNumber(payload.agentsMoMDelta),
    pendingApprovals: toFiniteNumber(payload.pendingApprovals),
    pendingApprovalsToday: toFiniteNumber(payload.pendingApprovalsToday),
    listingsThisMonth: toFiniteNumber(payload.listingsThisMonth),
    listingsMoMDelta: toFiniteNumber(payload.listingsMoMDelta),
    leadsThisMonth: toFiniteNumber(payload.leadsThisMonth),
    leadsMoMDelta: toFiniteNumber(payload.leadsMoMDelta),
    closedDealsThisMonth: toFiniteNumber(payload.closedDealsThisMonth),
    userGrowthSeries: toNumberSeries(payload.userGrowthSeries),
    listingGrowthSeries: toNumberSeries(payload.listingGrowthSeries),
    leadGrowthSeries: toNumberSeries(payload.leadGrowthSeries),
    leadSourceLabels: toStringArray(payload.leadSourceLabels),
    leadSourceValues: toNumberSeries(payload.leadSourceValues),
    monthLabels: toStringArray(payload.monthLabels),
    propertyPerformanceSeries: toPropertyPerformanceSeries(
      pickPropertyPerformanceSeriesRaw(payload),
    ),
  };
};

/**
 * Property performance list — call **only** from `AdminViewRatePage` (admin `/admin-dashboard/view-rate` route).
 * `GET /admin/dashboard/property-performance?page=&pageSize=&limit=`
 * (`limit` = `all` | `weekly` | `monthly` | `yearly`).
 */
export async function fetchAdminPropertyPerformance(
  params: AdminPropertyPerformanceParams = {},
): Promise<AdminPropertyPerformanceResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const period = params.period ?? "all";
  try {
    const response = await authApi.get<StandardApiResponse<unknown>>(
      "/admin/dashboard/property-performance",
      {
        params: {
          page,
          pageSize,
          limit: period,
        },
      },
    );
    const body = response.data;
    if (!body?.success) {
      throw new Error(resolveFailureMessage(body));
    }
    return parsePropertyPerformancePayload(body.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Loads the admin dashboard from `GET /admin/dashboard/summary` only.
 * Property-performance chart data comes from the summary payload when the API includes it;
 * the dedicated property-performance endpoint is used only on `AdminViewRatePage`.
 */
export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    const response = await authApi.get<StandardApiResponse<AdminDashboardSummaryApiData>>(
      "/admin/dashboard/summary",
    );
    const summaryData = assertSuccessData(response.data);
    return toAdminDashboardData(summaryData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export type AdminUserGrowthTrendsResult = {
  monthLabels: string[];
  values: number[];
};

function parseTrendsRowsArray(rows: unknown[]): AdminUserGrowthTrendsResult {
  const monthLabels: string[] = [];
  const values: number[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const labelRaw = r.month ?? r.label ?? r.period ?? r.name ?? r.monthLabel;
    const valueRaw = r.value ?? r.count ?? r.users ?? r.newUsers ?? r.signups ?? r.total;
    monthLabels.push(typeof labelRaw === "string" ? labelRaw : String(labelRaw ?? ""));
    values.push(toFiniteNumber(valueRaw));
  }
  return { monthLabels, values };
}

/**
 * Normalizes `GET /admin/dashboard/trends` payload (object with series fields or rows array).
 */
export function parseAdminUserGrowthTrendsPayload(data: unknown): AdminUserGrowthTrendsResult {
  if (data == null) {
    return { monthLabels: [], values: [] };
  }
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object") {
      return parseTrendsRowsArray(data);
    }
    return { monthLabels: [], values: toNumberSeries(data) };
  }
  if (typeof data !== "object") {
    return { monthLabels: [], values: [] };
  }
  const o = data as Record<string, unknown>;

  const rowCandidate = [o.items, o.trends, o.rows, o.results, o.data].find(
    (v): v is unknown[] => Array.isArray(v) && v.length > 0 && typeof v[0] === "object",
  );
  if (rowCandidate) {
    return parseTrendsRowsArray(rowCandidate);
  }

  const monthLabels = toStringArray(
    o.monthLabels ?? o.labels ?? o.months ?? o.categories,
  );
  const values = toNumberSeries(
    o.userGrowthSeries ?? o.series ?? o.values ?? o.counts ?? o.newUsers,
  );
  if (monthLabels.length > 0 || values.length > 0) {
    return { monthLabels, values };
  }
  if (Array.isArray(o.data)) {
    return { monthLabels: [], values: toNumberSeries(o.data) };
  }
  return { monthLabels: [], values: [] };
}

/**
 * `GET /admin/dashboard/trends?months=` — user growth time series for admin charts.
 */
export async function fetchAdminUserGrowthTrends(months = 12): Promise<AdminUserGrowthTrendsResult> {
  try {
    const response = await authApi.get<StandardApiResponse<unknown>>("/admin/dashboard/trends", {
      params: { months },
    });
    const body = response.data;
    if (!body?.success) {
      throw new Error(resolveFailureMessage(body));
    }
    return parseAdminUserGrowthTrendsPayload(body.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
