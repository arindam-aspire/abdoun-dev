import { renderHook, waitFor } from "@testing-library/react";
import type { AdminDashboardData } from "@/services/adminDashboardMockService";
import { useAdminDashboard } from "@/features/admin-agents/admin-dashboard/hooks/useAdminDashboard";

const fetchAdminDashboardDataMock = jest.fn<Promise<AdminDashboardData>, []>();

jest.mock("@/features/admin-agents/admin-dashboard/api/adminDashboard.api", () => ({
  fetchAdminDashboardData: () => fetchAdminDashboardDataMock(),
}));

describe("useAdminDashboard", () => {
  beforeEach(() => {
    fetchAdminDashboardDataMock.mockReset();
  });

  it("returns data once loaded", async () => {
    const dashboard: AdminDashboardData = {
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
      userGrowthSeries: Array.from({ length: 12 }, (_, i) => i),
      listingGrowthSeries: Array.from({ length: 12 }, (_, i) => i),
      leadGrowthSeries: Array.from({ length: 12 }, (_, i) => i),
      leadSourceLabels: ["A"],
      leadSourceValues: [1],
      monthLabels: Array.from({ length: 12 }, () => "Jan"),
    };

    fetchAdminDashboardDataMock.mockResolvedValueOnce(dashboard);

    const { result } = renderHook(() => useAdminDashboard());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(dashboard);
    expect(result.current.error).toBeNull();
  });

  it("sets error when loading fails", async () => {
    fetchAdminDashboardDataMock.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useAdminDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

