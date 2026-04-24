import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import type { AdminDashboardData } from "@/services/adminDashboardMockService";
import { useAdminDashboard } from "@/features/admin-agents/admin-dashboard/hooks/useAdminDashboard";
import adminDashboardSummaryReducer from "@/features/admin-agents/admin-dashboard/adminDashboardSummarySlice";

const fetchAdminDashboardDataMock = jest.fn<Promise<AdminDashboardData>, []>();

jest.mock("@/features/admin-agents/admin-dashboard/api/adminDashboard.api", () => ({
  fetchAdminDashboardData: () => fetchAdminDashboardDataMock(),
}));

function createTestStore() {
  return configureStore({
    reducer: {
      adminDashboardSummary: adminDashboardSummaryReducer,
    },
  });
}

function wrapperFor(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useAdminDashboard", () => {
  beforeEach(() => {
    fetchAdminDashboardDataMock.mockReset();
  });

  it("returns data once loaded", async () => {
    const dashboard: AdminDashboardData = {
      month: "2026-04",
      usersThisMonth: 100,
      usersMoMDelta: 1.2,
      agentsThisMonth: 10,
      agentsMoMDelta: 2.3,
      pendingApprovals: 4,
      pendingApprovalsToday: 1,
      listingsThisMonth: 50,
      listingsMoMDelta: 3.2,
      leadsThisMonth: 200,
      leadsMoMDelta: 4.1,
      closedDealsThisMonth: 12,
      userGrowthSeries: Array.from({ length: 12 }, (_, i) => i),
      listingGrowthSeries: Array.from({ length: 12 }, (_, i) => i),
      leadGrowthSeries: Array.from({ length: 12 }, (_, i) => i),
      leadSourceLabels: ["A"],
      leadSourceValues: [1],
      monthLabels: Array.from({ length: 12 }, () => "Jan"),
      propertyPerformanceSeries: [{ label: "Test", value: 1 }],
    };

    fetchAdminDashboardDataMock.mockResolvedValueOnce(dashboard);

    const store = createTestStore();
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: wrapperFor(store),
    });
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(dashboard);
    expect(result.current.error).toBeNull();
  });

  it("sets error when loading fails", async () => {
    fetchAdminDashboardDataMock.mockRejectedValueOnce(new Error("boom"));

    const store = createTestStore();
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: wrapperFor(store),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("boom");
  });
});
