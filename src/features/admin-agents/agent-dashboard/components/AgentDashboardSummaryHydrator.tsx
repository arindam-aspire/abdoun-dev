"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  fetchAdminManageListingsSidebarTotal,
  fetchAgentDashboardSummary,
} from "@/features/admin-agents/agent-dashboard/agentDashboardSummarySlice";
import { selectAgentDashboardCachedData, selectCurrentUser } from "@/store/selectors";

/**
 * Fetches dashboard summary for agents and listing-directory total for admins so sidebar
 * badge counts match without visiting those pages first.
 */
export function AgentDashboardSummaryHydrator() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const cached = useAppSelector(selectAgentDashboardCachedData);
  const dashboardCacheAuthUserId = useAppSelector(
    (s) => s.agentDashboardSummary.dashboardCacheAuthUserId,
  );

  useEffect(() => {
    if (user?.role === "admin") {
      void dispatch(fetchAdminManageListingsSidebarTotal());
      return;
    }

    if (user?.role !== "agent") return;
    if (cached && user.id && dashboardCacheAuthUserId === user.id) return;
    void dispatch(fetchAgentDashboardSummary());
  }, [user?.id, user?.role, cached, dashboardCacheAuthUserId, dispatch]);

  return null;
}
