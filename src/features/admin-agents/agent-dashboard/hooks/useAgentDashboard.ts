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

  const [data, setData] = useState<AgentDashboardData | null>(cachedDashboard);
  const [performanceData, setPerformanceData] = useState<PerformanceComparisonItem[]>(
    cachedPerformance ?? [],
  );
  const [loading, setLoading] = useState(() => cachedDashboard == null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (cachedDashboard) {
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
        dispatch(
          setAgentDashboardCache({
            dashboard,
            performance,
          }),
        );
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
  }, [cachedDashboard, dispatch]);

  return { data, performanceData, loading, error };
}
