import { useEffect, useState } from "react";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  fetchAgentDashboardData,
  fetchAgentPerformanceComparison,
} from "@/features/admin-agents/agent-dashboard/api/agentDashboard.api";
import { setAgentDashboardCache } from "@/features/admin-agents/agent-dashboard/agentDashboardSummarySlice";
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

  const [data, setData] = useState<AgentDashboardData | null>(cachedDashboard);
  const [performanceData, setPerformanceData] = useState<PerformanceComparisonItem[]>(
    cachedPerformance ?? [],
  );
  const [loading, setLoading] = useState(() => cachedDashboard == null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const cacheMatchesSession =
      cachedDashboard &&
      authUserId &&
      dashboardCacheAuthUserId === authUserId;

    if (cacheMatchesSession) {
      setData(cachedDashboard);
      setPerformanceData(cachedPerformance ?? []);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [dashboard, performance] = await Promise.all([
          fetchAgentDashboardData(),
          fetchAgentPerformanceComparison(),
        ]);

        if (cancelled) return;
        setData(dashboard);
        setPerformanceData(performance);
        if (authUserId) {
          dispatch(
            setAgentDashboardCache({
              dashboard,
              performance,
              authUserId,
            }),
          );
        }
      } catch (e) {
        if (cancelled) return;
        setError(e);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    authUserId,
    cachedDashboard,
    cachedPerformance,
    dashboardCacheAuthUserId,
    dispatch,
  ]);

  return { data, performanceData, loading, error };
}
