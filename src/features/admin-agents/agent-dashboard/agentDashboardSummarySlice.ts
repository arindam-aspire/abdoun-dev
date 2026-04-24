import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";

type AgentDashboardSummaryState = {
  totalProperties: number;
  leadsThisMonth: number;
  inquiryVolumeLast7Days: number;
  /** Full `GET /agents/dashboard/summary` payload; null until first successful fetch in this session. */
  dashboardData: AgentDashboardData | null;
  /** Cached with the same fetch as the home dashboard (performance chart). */
  performanceComparison: PerformanceComparisonItem[];
};

const initialState: AgentDashboardSummaryState = {
  totalProperties: 0,
  leadsThisMonth: 0,
  inquiryVolumeLast7Days: 0,
  dashboardData: null,
  performanceComparison: [],
};

const agentDashboardSummarySlice = createSlice({
  name: "agentDashboardSummary",
  initialState,
  reducers: {
    setAgentDashboardCache(
      state,
      action: PayloadAction<{
        dashboard: AgentDashboardData;
        performance: PerformanceComparisonItem[];
      }>,
    ) {
      const { dashboard, performance } = action.payload;
      state.totalProperties = dashboard.totalProperties;
      state.leadsThisMonth = dashboard.leadsThisMonth;
      state.inquiryVolumeLast7Days = dashboard.inquiryVolumeLast7Days;
      state.dashboardData = dashboard;
      state.performanceComparison = performance;
    },
    clearAgentDashboardSummary() {
      return initialState;
    },
  },
});

export const { setAgentDashboardCache, clearAgentDashboardSummary } =
  agentDashboardSummarySlice.actions;

export default agentDashboardSummarySlice.reducer;
