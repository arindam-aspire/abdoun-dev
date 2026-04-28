import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import agentDashboardSummaryReducer from "@/features/admin-agents/agent-dashboard/agentDashboardSummarySlice";
import authReducer from "@/features/auth/authSlice";
import { useAgentDashboard } from "@/features/admin-agents/agent-dashboard/hooks/useAgentDashboard";

const fetchAgentDashboardDataMock = jest.fn<Promise<AgentDashboardData>, []>();
const fetchAgentPerformanceComparisonMock = jest.fn<
  Promise<PerformanceComparisonItem[]>,
  []
>();

jest.mock("@/features/admin-agents/agent-dashboard/api/agentDashboard.api", () => ({
  fetchAgentDashboardData: () => fetchAgentDashboardDataMock(),
  fetchAgentPerformanceComparison: () => fetchAgentPerformanceComparisonMock(),
}));

function createHookStore(
  preloadedSummary?: Partial<ReturnType<typeof summaryInitial>>,
  authUserId: string | null = "session-user-1",
) {
  const summaryDefault = summaryInitial();
  return configureStore({
    reducer: {
      agentDashboardSummary: agentDashboardSummaryReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: { userId: authUserId },
      agentDashboardSummary: preloadedSummary
        ? {
            ...summaryDefault,
            ...preloadedSummary,
          }
        : summaryDefault,
    },
  });
}

function summaryInitial() {
  return {
    totalProperties: 0,
    leadsThisMonth: 0,
    inquiryVolumeLast7Days: 0,
    dashboardData: null as AgentDashboardData | null,
    performanceComparison: [] as PerformanceComparisonItem[],
    dashboardCacheAuthUserId: null as string | null,
    adminManageListingsTotal: null as number | null,
    adminManageListingsTotalStatus: "idle" as const,
    adminListingsCountsAuthUserId: null as string | null,
  };
}

function createDashboardFixture(): AgentDashboardData {
  return {
    totalProperties: 10,
    activeProperties: 8,
    draftProperties: 0,
    inquiryVolumeAllTime: 20,
    inquiryVolumeLast7Days: 5,
    leadsThisMonth: 7,
    totalPropertyViews: 100,
    dealCloseCount: 2,
    conversionRate: 28.6,
    listingsChangePercent: null,
    leadsChangePercent: null,
    dealsClosedChangePercent: null,
    propertyViewsChangePercent: null,
    inquiryTrendLast30Days: Array.from({ length: 30 }, () => 0),
    recentActivity: [{ text: "X", time: "Y", tone: "neutral" }],
  };
}

/** JSX is not parsed in `.ts` files; use createElement instead of renaming to `.tsx`. */
function createReduxWrapper(store: ReturnType<typeof createHookStore>) {
  return function ReduxWrapper({ children }: { children: ReactNode }) {
    return React.createElement(Provider, { store, children });
  };
}

describe("useAgentDashboard", () => {
  beforeEach(() => {
    fetchAgentDashboardDataMock.mockReset();
    fetchAgentPerformanceComparisonMock.mockReset();
  });

  it("returns data once loaded", async () => {
    const dashboard = createDashboardFixture();
    const perf: PerformanceComparisonItem[] = [{ label: "A", value: 1 }];

    fetchAgentDashboardDataMock.mockResolvedValueOnce(dashboard);
    fetchAgentPerformanceComparisonMock.mockResolvedValueOnce(perf);

    const store = createHookStore();
    const wrapper = createReduxWrapper(store);

    const { result } = renderHook(() => useAgentDashboard(), { wrapper });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(dashboard);
    expect(result.current.performanceData).toEqual(perf);
    expect(result.current.error).toBeNull();
  });

  it("uses Redux cache and does not call APIs when dashboard is already cached", () => {
    const dashboard = createDashboardFixture();
    const perf: PerformanceComparisonItem[] = [{ label: "A", value: 1 }];

    const store = createHookStore({
      totalProperties: dashboard.totalProperties,
      leadsThisMonth: dashboard.leadsThisMonth,
      inquiryVolumeLast7Days: dashboard.inquiryVolumeLast7Days,
      dashboardData: dashboard,
      performanceComparison: perf,
      dashboardCacheAuthUserId: "session-user-1",
    });
    const wrapper = createReduxWrapper(store);

    const { result } = renderHook(() => useAgentDashboard(), { wrapper });

    expect(fetchAgentDashboardDataMock).not.toHaveBeenCalled();
    expect(fetchAgentPerformanceComparisonMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(dashboard);
    expect(result.current.performanceData).toEqual(perf);
  });

  it("sets error when loading fails", async () => {
    fetchAgentDashboardDataMock.mockRejectedValueOnce(new Error("boom"));
    fetchAgentPerformanceComparisonMock.mockResolvedValueOnce([]);

    const store = createHookStore();
    const wrapper = createReduxWrapper(store);

    const { result } = renderHook(() => useAgentDashboard(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
