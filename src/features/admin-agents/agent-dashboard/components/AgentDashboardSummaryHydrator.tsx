"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  fetchAgentDashboardData,
  fetchAgentPerformanceComparison,
} from "@/features/admin-agents/agent-dashboard/api/agentDashboard.api";
import { setAgentDashboardCache } from "@/features/admin-agents/agent-dashboard/agentDashboardSummarySlice";
import { selectAgentDashboardCachedData, selectCurrentUser } from "@/store/selectors";

/**
 * Fetches agent dashboard summary into Redux when an agent is logged in so sidebar
 * badge counts (listings, leads) match the dashboard without visiting it first.
 */
export function AgentDashboardSummaryHydrator() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const cached = useAppSelector(selectAgentDashboardCachedData);

  useEffect(() => {
    if (user?.role !== "agent") return;
    if (cached) return;

    let cancelled = false;
    void (async () => {
      try {
        const [dashboard, performance] = await Promise.all([
          fetchAgentDashboardData(),
          fetchAgentPerformanceComparison(),
        ]);
        if (cancelled) return;
        dispatch(setAgentDashboardCache({ dashboard, performance }));
      } catch {
        // Counts stay 0 until a successful fetch (e.g. from dashboard page).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, cached, dispatch]);

  return null;
}
