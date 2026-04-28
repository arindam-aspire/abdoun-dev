import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import { fetchAgentProperties } from "@/features/admin-agents/agent-dashboard/api/agentProperties.api";
import {
  fetchAgentDashboardData,
  fetchAgentPropertyPerformance,
  type AgentPropertyPerformanceParams,
  type AgentPropertyPerformanceResult,
} from "@/features/admin-agents/agent-dashboard/api/agentDashboard.api";
import { getApiErrorMessage } from "@/lib/http";

type AgentPropertyPerformanceStatus = "idle" | "loading" | "succeeded" | "failed";

type AgentPropertyPerformanceState = {
  items: PerformanceComparisonItem[];
  total: number;
  page: number;
  pageSize: number;
  period: AgentPropertyPerformanceParams["period"];
  status: AgentPropertyPerformanceStatus;
  error: string | null;
  lastFetchKey: string | null;
  inFlightKey: string | null;
};

type AgentDashboardSummaryState = {
  totalProperties: number;
  leadsThisMonth: number;
  inquiryVolumeLast7Days: number;
  /** Full `GET /agents/dashboard/summary` payload; null until first successful fetch in this session. */
  dashboardData: AgentDashboardData | null;
  /** Cached with the same fetch as the home dashboard (performance chart). */
  performanceComparison: PerformanceComparisonItem[];
  /** `GET /agent/property-performance` list for agent view-rate page. */
  propertyPerformance: AgentPropertyPerformanceState;
  /** `auth.userId` when agent dashboard summary cache was written. */
  dashboardCacheAuthUserId: string | null;
  dashboardStatus: "idle" | "loading" | "succeeded" | "failed";
  dashboardError: string | null;
  /** `GET /agent-properties` total for admin “Manage Listings” sidebar badge. */
  adminManageListingsTotal: number | null;
  adminManageListingsTotalStatus: "idle" | "loading" | "succeeded" | "failed";
  /** `auth.userId` when `adminManageListingsTotal` was last fetched. */
  adminListingsCountsAuthUserId: string | null;
};

type AgentDashboardSummaryThunkState = {
  agentDashboardSummary: AgentDashboardSummaryState;
  auth: { userId: string | null };
};

const initialState: AgentDashboardSummaryState = {
  totalProperties: 0,
  leadsThisMonth: 0,
  inquiryVolumeLast7Days: 0,
  dashboardData: null,
  performanceComparison: [],
  propertyPerformance: {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    period: "all",
    status: "idle",
    error: null,
    lastFetchKey: null,
    inFlightKey: null,
  },
  dashboardCacheAuthUserId: null,
  dashboardStatus: "idle",
  dashboardError: null,
  adminManageListingsTotal: null,
  adminManageListingsTotalStatus: "idle",
  adminListingsCountsAuthUserId: null,
};

function propertyPerformanceCacheKey(params: AgentPropertyPerformanceParams): string {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const period = params.period ?? "all";
  return `${page}|${pageSize}|${period}`;
}

/**
 * Loads the agent dashboard bundle (summary + performance) once per session/user.
 * Dedupe rules:
 * - skip when already loading
 * - skip when cache already matches current `auth.userId`
 */
export const fetchAgentDashboardSummary = createAsyncThunk<
  { dashboard: AgentDashboardData; performance: PerformanceComparisonItem[]; authUserId: string },
  { force?: boolean } | undefined,
  { state: AgentDashboardSummaryThunkState }
>(
  "agentDashboardSummary/fetchAgentDashboardSummary",
  async (_arg, thunkApi) => {
    const authUserId = thunkApi.getState().auth.userId;
    if (!authUserId) {
      return thunkApi.rejectWithValue("Missing auth user.");
    }
    try {
      const dashboard = await fetchAgentDashboardData();
      const performance = dashboard.propertyPerformance ?? [];
      return { dashboard, performance, authUserId };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const s = getState().agentDashboardSummary;
      const uid = getState().auth.userId;
      if (s.dashboardStatus === "loading") return false;
      if (s.dashboardData && uid && s.dashboardCacheAuthUserId === uid) return false;
      return true;
    },
  },
);

/**
 * Loads `GET /agent/property-performance` for the agent “View rate” page.
 * Dedupe rules:
 * - skip when already loading the same key
 * - skip when succeeded for the same key
 */
export const fetchAgentPropertyPerformancePage = createAsyncThunk<
  { result: AgentPropertyPerformanceResult; params: AgentPropertyPerformanceParams },
  AgentPropertyPerformanceParams | undefined,
  { state: AgentDashboardSummaryThunkState }
>(
  "agentDashboardSummary/fetchAgentPropertyPerformancePage",
  async (arg, thunkApi) => {
    const params: AgentPropertyPerformanceParams = {
      page: arg?.page ?? 1,
      pageSize: arg?.pageSize ?? 10,
      period: arg?.period ?? "all",
    };
    try {
      const result = await fetchAgentPropertyPerformance(params);
      return { result, params };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      const params: AgentPropertyPerformanceParams = {
        page: arg?.page ?? 1,
        pageSize: arg?.pageSize ?? 10,
        period: arg?.period ?? "all",
      };
      const key = propertyPerformanceCacheKey(params);
      const s = getState().agentDashboardSummary.propertyPerformance;
      if (s.status === "loading" && s.inFlightKey === key) return false;
      if (s.status === "succeeded" && s.lastFetchKey === key) return false;
      return true;
    },
  },
);

/**
 * Loads listing directory total for admin sidebar (`GET /agent-properties` pagination `total`).
 */
export const fetchAdminManageListingsSidebarTotal = createAsyncThunk<
  { total: number | null; authUserId: string | null },
  void,
  { state: AgentDashboardSummaryThunkState }
>(
  "agentDashboardSummary/fetchAdminManageListingsSidebarTotal",
  async (_, thunkApi) => {
    const authUserId = thunkApi.getState().auth.userId;
    try {
      const data = await fetchAgentProperties({ page: 1, limit: 1 });
      const resolved =
        typeof data.total === "number" && Number.isFinite(data.total)
          ? data.total
          : data.items.length === 0
            ? 0
            : null;
      return { total: resolved, authUserId };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const s = getState().agentDashboardSummary;
      const uid = getState().auth.userId;
      if (s.adminManageListingsTotalStatus === "loading") return false;
      if (
        s.adminManageListingsTotalStatus === "succeeded" &&
        uid != null &&
        s.adminListingsCountsAuthUserId === uid
      ) {
        return false;
      }
      return true;
    },
  },
);

const agentDashboardSummarySlice = createSlice({
  name: "agentDashboardSummary",
  initialState,
  reducers: {
    setAgentDashboardCache(
      state,
      action: PayloadAction<{
        dashboard: AgentDashboardData;
        performance: PerformanceComparisonItem[];
        authUserId: string;
      }>,
    ) {
      const { dashboard, performance, authUserId } = action.payload;
      state.totalProperties = dashboard.totalProperties;
      state.leadsThisMonth = dashboard.leadsThisMonth;
      state.inquiryVolumeLast7Days = dashboard.inquiryVolumeLast7Days;
      state.dashboardData = dashboard;
      state.performanceComparison = performance;
      state.dashboardCacheAuthUserId = authUserId;
      state.dashboardStatus = "succeeded";
      state.dashboardError = null;
    },
    clearAgentDashboardSummary() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentDashboardSummary.pending, (state) => {
        state.dashboardStatus = "loading";
        state.dashboardError = null;
      })
      .addCase(fetchAgentDashboardSummary.fulfilled, (state, action) => {
        const { dashboard, performance, authUserId } = action.payload;
        state.totalProperties = dashboard.totalProperties;
        state.leadsThisMonth = dashboard.leadsThisMonth;
        state.inquiryVolumeLast7Days = dashboard.inquiryVolumeLast7Days;
        state.dashboardData = dashboard;
        state.performanceComparison = performance;
        state.dashboardCacheAuthUserId = authUserId;
        state.dashboardStatus = "succeeded";
        state.dashboardError = null;
      })
      .addCase(fetchAgentDashboardSummary.rejected, (state, action) => {
        if (action.meta.condition === true) return;
        state.dashboardStatus = "failed";
        state.dashboardError =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to load agent dashboard.";
      })
      .addCase(fetchAdminManageListingsSidebarTotal.pending, (state) => {
        state.adminManageListingsTotalStatus = "loading";
      })
      .addCase(fetchAdminManageListingsSidebarTotal.fulfilled, (state, action) => {
        state.adminManageListingsTotalStatus = "succeeded";
        state.adminManageListingsTotal = action.payload.total;
        state.adminListingsCountsAuthUserId = action.payload.authUserId;
      })
      .addCase(fetchAdminManageListingsSidebarTotal.rejected, (state) => {
        state.adminManageListingsTotalStatus = "failed";
      });

    builder
      .addCase(fetchAgentPropertyPerformancePage.pending, (state, action) => {
        const params: AgentPropertyPerformanceParams = {
          page: action.meta.arg?.page ?? 1,
          pageSize: action.meta.arg?.pageSize ?? 10,
          period: action.meta.arg?.period ?? "all",
        };
        const key = propertyPerformanceCacheKey(params);
        state.propertyPerformance.status = "loading";
        state.propertyPerformance.error = null;
        state.propertyPerformance.inFlightKey = key;
      })
      .addCase(fetchAgentPropertyPerformancePage.fulfilled, (state, action) => {
        const { result, params } = action.payload;
        const key = propertyPerformanceCacheKey(params);
        state.propertyPerformance.status = "succeeded";
        state.propertyPerformance.error = null;
        state.propertyPerformance.items = result.items ?? [];
        state.propertyPerformance.total = result.total ?? state.propertyPerformance.items.length;
        state.propertyPerformance.page = params.page ?? 1;
        state.propertyPerformance.pageSize = params.pageSize ?? 10;
        state.propertyPerformance.period = params.period ?? "all";
        state.propertyPerformance.lastFetchKey = key;
        state.propertyPerformance.inFlightKey = null;
      })
      .addCase(fetchAgentPropertyPerformancePage.rejected, (state, action) => {
        if (action.meta.condition === true) return;
        state.propertyPerformance.status = "failed";
        state.propertyPerformance.inFlightKey = null;
        state.propertyPerformance.items = [];
        state.propertyPerformance.total = 0;
        state.propertyPerformance.error =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to load property performance.";
      });
  },
});

export const { setAgentDashboardCache, clearAgentDashboardSummary } =
  agentDashboardSummarySlice.actions;

export default agentDashboardSummarySlice.reducer;
