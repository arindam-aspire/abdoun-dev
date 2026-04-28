import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { useEffect } from "react";
import { fetchAgentDashboardSummary } from "@/features/admin-agents/agent-dashboard/agentDashboardSummarySlice";
import {
  selectAgentDashboardCachedData,
  selectAgentDashboardCachedPerformance,
} from "@/store/selectors";

type UseAgentDashboardState = {
  data: AgentDashboardData | null;
  performanceData: PerformanceComparisonItem[];
  loading: boolean;
  error: unknown;
};

export function useAgentDashboard(): UseAgentDashboardState {
  const dispatch = useAppDispatch();
  const cachedDashboard = useAppSelector(selectAgentDashboardCachedData);
  const cachedPerformance = useAppSelector(selectAgentDashboardCachedPerformance);
  const authUserId = useAppSelector((s) => s.auth.userId);
  const dashboardCacheAuthUserId = useAppSelector(
    (s) => s.agentDashboardSummary.dashboardCacheAuthUserId,
  );
  const dashboardStatus = useAppSelector((s) => s.agentDashboardSummary.dashboardStatus);
  const dashboardError = useAppSelector((s) => s.agentDashboardSummary.dashboardError);

  useEffect(() => {
    const cacheMatchesSession =
      cachedDashboard &&
      authUserId &&
      dashboardCacheAuthUserId === authUserId;

    if (cacheMatchesSession) return;
    if (!authUserId) return;
    void dispatch(fetchAgentDashboardSummary());
  }, [authUserId, cachedDashboard, dashboardCacheAuthUserId, dispatch]);

  const cacheMatchesSession =
    !!cachedDashboard && !!authUserId && dashboardCacheAuthUserId === authUserId;
  const loading = !cacheMatchesSession && (dashboardStatus === "loading" || dashboardStatus === "idle");
  const error = dashboardStatus === "failed" ? dashboardError ?? "Failed to load dashboard." : null;

  return {
    data: cacheMatchesSession ? cachedDashboard : cachedDashboard ?? null,
    performanceData: cacheMatchesSession ? cachedPerformance ?? [] : cachedPerformance ?? [],
    loading,
    error,
  };
}
