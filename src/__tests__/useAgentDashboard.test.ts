import { renderHook, waitFor } from "@testing-library/react";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
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

describe("useAgentDashboard", () => {
  beforeEach(() => {
    fetchAgentDashboardDataMock.mockReset();
    fetchAgentPerformanceComparisonMock.mockReset();
  });

  it("returns data once loaded", async () => {
    const dashboard: AgentDashboardData = {
      totalProperties: 10,
      activeProperties: 8,
      draftProperties: 0,
      inquiryVolumeAllTime: 20,
      inquiryVolumeLast7Days: 5,
      leadsThisMonth: 7,
      totalPropertyViews: 100,
      dealCloseCount: 2,
      conversionRate: 28.6,
      inquiryTrendLast30Days: Array.from({ length: 30 }, () => 0),
      recentActivity: [{ text: "X", time: "Y", tone: "neutral" }],
    };
    const perf: PerformanceComparisonItem[] = [{ label: "A", value: 1 }];

    fetchAgentDashboardDataMock.mockResolvedValueOnce(dashboard);
    fetchAgentPerformanceComparisonMock.mockResolvedValueOnce(perf);

    const { result } = renderHook(() => useAgentDashboard());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(dashboard);
    expect(result.current.performanceData).toEqual(perf);
    expect(result.current.error).toBeNull();
  });

  it("sets error when loading fails", async () => {
    fetchAgentDashboardDataMock.mockRejectedValueOnce(new Error("boom"));
    fetchAgentPerformanceComparisonMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAgentDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

