import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import { fetchAgentProperties } from "@/features/admin-agents/agent-dashboard/api/agentProperties.api";
import { getApiErrorMessage } from "@/lib/http";

type AgentDashboardSummaryState = {
  totalProperties: number;
  leadsThisMonth: number;
  inquiryVolumeLast7Days: number;
  /** Full `GET /agents/dashboard/summary` payload; null until first successful fetch in this session. */
  dashboardData: AgentDashboardData | null;
  /** Cached with the same fetch as the home dashboard (performance chart). */
  performanceComparison: PerformanceComparisonItem[];
  /** `auth.userId` when agent dashboard summary cache was written. */
  dashboardCacheAuthUserId: string | null;
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
  dashboardCacheAuthUserId: null,
  adminManageListingsTotal: null,
  adminManageListingsTotalStatus: "idle",
  adminListingsCountsAuthUserId: null,
};

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
    },
    clearAgentDashboardSummary() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
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
  },
});

export const { setAgentDashboardCache, clearAgentDashboardSummary } =
  agentDashboardSummarySlice.actions;

export default agentDashboardSummarySlice.reducer;
