import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import { fetchAgentProperties } from "@/features/agent/dashboard/api/agentProperties.api";
import { fetchAgentPropertyDrafts } from "@/features/agent/dashboard/api/agentProperties.api";
import {
  fetchAgentDashboardData,
  fetchAgentPropertyPerformance,
  type AgentPropertyPerformanceParams,
  type AgentPropertyPerformanceResult,
} from "@/features/agent/dashboard/api/agentDashboard.api";
import { getAdminLeads, getAgentLeads, getMyLeads } from "@/features/leads/api/leadApiService";
import { getApiErrorMessage, getThunkRejectedMessage } from "@/lib/http/apiError";
import type { PaginatedResult } from "@/lib/api/pagination";

/** Draft sidebar count fetch — pageSize > 1 so item count can correct a low API `total`. */
const DRAFT_SIDEBAR_COUNT_PAGE_SIZE = 10;

function resolveDraftSidebarTotal<T>(result: PaginatedResult<T>): number | null {
  const { items, pagination } = result;
  if (items.length === 0) return 0;
  const apiTotal = pagination.total;
  if (!Number.isFinite(apiTotal)) return null;
  if (items.length < pagination.pageSize) {
    return Math.max(apiTotal, items.length);
  }
  return apiTotal;
}

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
  /** `GET /agent-properties/drafts` total for admin “Draft Listings” sidebar badge. */
  adminDraftListingsTotal: number | null;
  adminManageListingsTotalStatus: "idle" | "loading" | "succeeded" | "failed";
  /** `auth.userId` when `adminManageListingsTotal` was last fetched. */
  adminListingsCountsAuthUserId: string | null;
  /** Agent sidebar badges (Manage Listings + Draft Listings). */
  agentManageListingsTotal: number | null;
  agentDraftListingsTotal: number | null;
  agentListingsCountsStatus: "idle" | "loading" | "succeeded" | "failed";
  /** `auth.userId` when agent listing sidebar counts were last fetched. */
  agentListingsCountsAuthUserId: string | null;
  /** Lead totals used for sidebar "Leads and Inquiries" badge. */
  leadsSidebarTotal: number | null;
  leadsSidebarTotalStatus: "idle" | "loading" | "succeeded" | "failed";
  /** `auth.userId` when `leadsSidebarTotal` was last fetched. */
  leadsSidebarCountsAuthUserId: string | null;
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
  adminDraftListingsTotal: null,
  adminManageListingsTotalStatus: "idle",
  adminListingsCountsAuthUserId: null,
  agentManageListingsTotal: null,
  agentDraftListingsTotal: null,
  agentListingsCountsStatus: "idle",
  agentListingsCountsAuthUserId: null,
  leadsSidebarTotal: null,
  leadsSidebarTotalStatus: "idle",
  leadsSidebarCountsAuthUserId: null,
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
 * Loads listing directory total for admin sidebar (`GET /admin/property-submissions` total).
 */
export const fetchAdminManageListingsSidebarTotal = createAsyncThunk<
  { total: number | null; draftTotal: number | null; authUserId: string | null },
  { force?: boolean } | undefined,
  { state: AgentDashboardSummaryThunkState }
>(
  "agentDashboardSummary/fetchAdminManageListingsSidebarTotal",
  async (_arg, thunkApi) => {
    const authUserId = thunkApi.getState().auth.userId;
    try {
      const [data, drafts] = await Promise.all([
        fetchAgentProperties({ page: 1, pageSize: 1 }),
        fetchAgentPropertyDrafts({ page: 1, pageSize: DRAFT_SIDEBAR_COUNT_PAGE_SIZE }),
      ]);
      const resolved =
        typeof data.pagination.total === "number" && Number.isFinite(data.pagination.total)
          ? data.pagination.total
          : data.items.length === 0
            ? 0
            : null;
      const draftTotal = resolveDraftSidebarTotal(drafts);
      return { total: resolved, draftTotal, authUserId };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
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

/**
 * Loads agent listing totals for sidebar badges (`/agent-properties` + `/agent-properties/drafts`).
 */
export const fetchAgentListingsSidebarCounts = createAsyncThunk<
  { total: number | null; draftTotal: number | null; authUserId: string | null },
  { force?: boolean } | undefined,
  { state: AgentDashboardSummaryThunkState }
>(
  "agentDashboardSummary/fetchAgentListingsSidebarCounts",
  async (_arg, thunkApi) => {
    const authUserId = thunkApi.getState().auth.userId;
    try {
      const [data, drafts] = await Promise.all([
        fetchAgentProperties({ page: 1, pageSize: 1, include_drafts: false }),
        fetchAgentPropertyDrafts({ page: 1, pageSize: DRAFT_SIDEBAR_COUNT_PAGE_SIZE }),
      ]);
      const resolved =
        typeof data.pagination.total === "number" && Number.isFinite(data.pagination.total)
          ? data.pagination.total
          : data.items.length === 0
            ? 0
            : null;
      const draftTotal = resolveDraftSidebarTotal(drafts);
      return { total: resolved, draftTotal, authUserId };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const s = getState().agentDashboardSummary;
      const uid = getState().auth.userId;
      if (s.agentListingsCountsStatus === "loading") return false;
      if (
        s.agentListingsCountsStatus === "succeeded" &&
        uid != null &&
        s.agentListingsCountsAuthUserId === uid
      ) {
        return false;
      }
      return true;
    },
  },
);

/**
 * Loads lead totals for sidebar badges based on current area (`/admin/leads`, `/agent/leads`, `/leads/my`).
 */
export const fetchLeadsSidebarTotal = createAsyncThunk<
  { total: number | null; authUserId: string | null },
  { mode: "admin" | "agent" | "user"; force?: boolean },
  { state: AgentDashboardSummaryThunkState }
>(
  "agentDashboardSummary/fetchLeadsSidebarTotal",
  async (arg, thunkApi) => {
    const authUserId = thunkApi.getState().auth.userId;
    try {
      const listFn = arg.mode === "admin" ? getAdminLeads : arg.mode === "agent" ? getAgentLeads : getMyLeads;
      const data = await listFn({ page: 1, pageSize: 1 });
      const total = typeof data.total === "number" && Number.isFinite(data.total) ? data.total : null;
      return { total, authUserId };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg.force) return true;
      const s = getState().agentDashboardSummary;
      const uid = getState().auth.userId;
      if (s.leadsSidebarTotalStatus === "loading") return false;
      if (
        s.leadsSidebarTotalStatus === "succeeded" &&
        uid != null &&
        s.leadsSidebarCountsAuthUserId === uid
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
        state.dashboardError = getThunkRejectedMessage(
          action,
          "Failed to load agent dashboard.",
        );
      })
      .addCase(fetchAdminManageListingsSidebarTotal.pending, (state) => {
        state.adminManageListingsTotalStatus = "loading";
      })
      .addCase(fetchAdminManageListingsSidebarTotal.fulfilled, (state, action) => {
        state.adminManageListingsTotalStatus = "succeeded";
        state.adminManageListingsTotal = action.payload.total;
        state.adminDraftListingsTotal = action.payload.draftTotal;
        state.adminListingsCountsAuthUserId = action.payload.authUserId;
      })
      .addCase(fetchAdminManageListingsSidebarTotal.rejected, (state) => {
        state.adminManageListingsTotalStatus = "failed";
      })
      .addCase(fetchAgentListingsSidebarCounts.pending, (state) => {
        state.agentListingsCountsStatus = "loading";
      })
      .addCase(fetchAgentListingsSidebarCounts.fulfilled, (state, action) => {
        state.agentListingsCountsStatus = "succeeded";
        state.agentManageListingsTotal = action.payload.total;
        state.agentDraftListingsTotal = action.payload.draftTotal;
        state.agentListingsCountsAuthUserId = action.payload.authUserId;
      })
      .addCase(fetchAgentListingsSidebarCounts.rejected, (state) => {
        state.agentListingsCountsStatus = "failed";
      })
      .addCase(fetchLeadsSidebarTotal.pending, (state) => {
        state.leadsSidebarTotalStatus = "loading";
      })
      .addCase(fetchLeadsSidebarTotal.fulfilled, (state, action) => {
        state.leadsSidebarTotalStatus = "succeeded";
        state.leadsSidebarTotal = action.payload.total;
        state.leadsSidebarCountsAuthUserId = action.payload.authUserId;
      })
      .addCase(fetchLeadsSidebarTotal.rejected, (state) => {
        state.leadsSidebarTotalStatus = "failed";
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
        state.propertyPerformance.total = result.pagination.total;
        state.propertyPerformance.page = result.pagination.page;
        state.propertyPerformance.pageSize = result.pagination.pageSize;
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
        state.propertyPerformance.error = getThunkRejectedMessage(
          action,
          "Failed to load property performance.",
        );
      });
  },
});

export const { setAgentDashboardCache, clearAgentDashboardSummary } =
  agentDashboardSummarySlice.actions;

export default agentDashboardSummarySlice.reducer;
