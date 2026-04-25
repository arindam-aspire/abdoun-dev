import type { RootState } from "@/store";
import type { ProfileUser } from "@/features/profile/profileSlice";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import { AGENT_STATUS } from "@/constants/agentStatus";
import { createSelector } from "@reduxjs/toolkit";

/** Current logged-in user from profile slice (single source of truth for user data in store). */
export function selectCurrentUser(state: RootState): ProfileUser | null {
  const userId = state.auth.userId;
  if (!userId || state.profile.userId !== userId) return null;
  const details = state.profile.userDetails;
  return details.id ? details : null;
}

const selectAdminAgents = (state: RootState) => state.adminAgents.allItems;
const selectAdminAgentsTotal = (state: RootState) => state.adminAgents.total;
const selectPropertySearch = (state: RootState) => state.propertySearch;
const selectFavourites = (state: RootState) => state.favourites.propertyIds;
const selectSavedSearchesItems = (state: RootState) => state.savedSearches.items;
const selectAgentDashboardSummary = (state: RootState) =>
  state.agentDashboardSummary;

/** Full dashboard summary from `GET /agents/dashboard/summary` after first fetch (session cache). */
export function selectAgentDashboardCachedData(
  state: RootState,
): AgentDashboardData | null {
  return state.agentDashboardSummary.dashboardData;
}

/** Performance comparison rows cached with the dashboard bundle. */
export function selectAgentDashboardCachedPerformance(
  state: RootState,
): PerformanceComparisonItem[] {
  return state.agentDashboardSummary.performanceComparison;
}

export const selectSidebarCounts = createSelector(
  [
    selectAdminAgents,
    selectAdminAgentsTotal,
    selectPropertySearch,
    selectFavourites,
    selectAgentDashboardSummary,
    selectCurrentUser,
    selectSavedSearchesItems,
  ],
  (
    allItems,
    adminAgentsTotal,
    propertySearch,
    favouriteIds,
    agentDashboardSummary,
    user,
    savedSearchItems,
  ): Record<string, number> => {
    const pendingUsers = allItems.filter(
      (agent) => agent.status === AGENT_STATUS.PENDING_REVIEW,
    ).length;
    const totalProperties = propertySearch.total;
    const isAgent = user?.role === "agent";
    // Agents: sidebar "Manage Listings" + leads counts come only from the agent dashboard
    // bundle in Redux (`agentDashboardSummary` / `setAgentDashboardCache`), not from search.
    const totalListings = isAgent
      ? agentDashboardSummary.totalProperties
      : agentDashboardSummary.totalProperties > 0
        ? agentDashboardSummary.totalProperties
        : propertySearch.items.length;
    const totalSavedProperties = favouriteIds.length;
    const totalFavouriteProperties = favouriteIds.length;
    const totalSavedSearches = savedSearchItems.length;

    return {
      pendingUsers,
      /** Directory total from `GET /agents` pagination (`adminAgents.total`). */
      totalAgents: adminAgentsTotal,
      totalProperties,
      totalListings,
      totalSavedProperties,
      totalFavouriteProperties,
      totalSavedSearches,
      leadsThisMonth: agentDashboardSummary.leadsThisMonth,
      inquiryVolumeLast7Days: agentDashboardSummary.inquiryVolumeLast7Days,
    };
  },
);
