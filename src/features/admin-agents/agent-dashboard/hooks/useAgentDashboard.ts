import { useEffect, useState } from "react";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import {
  fetchAgentDashboardData,
  fetchAgentPerformanceComparison,
} from "@/features/admin-agents/agent-dashboard/api/agentDashboard.api";

type UseAgentDashboardState = {
  data: AgentDashboardData | null;
  performanceData: PerformanceComparisonItem[];
  loading: boolean;
  error: unknown;
};

export function useAgentDashboard(): UseAgentDashboardState {
  const [data, setData] = useState<AgentDashboardData | null>(null);
  const [performanceData, setPerformanceData] = useState<
    PerformanceComparisonItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [dashboard, performance] = await Promise.all([
          fetchAgentDashboardData(),
          fetchAgentPerformanceComparison(),
        ]);

        if (cancelled) return;
        setData(dashboard);
        setPerformanceData(performance);
      } catch (e) {
        if (cancelled) return;
        setError(e);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, performanceData, loading, error };
}

