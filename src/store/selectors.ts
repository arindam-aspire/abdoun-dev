import type { RootState } from "@/store";
import type { ProfileUser } from "@/features/profile/profileSlice";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import { createSelector } from "@reduxjs/toolkit";

/** Current logged-in user from profile slice (single source of truth for user data in store). */
export function selectCurrentUser(state: RootState): ProfileUser | null {
  const userId = state.auth.userId;
  if (!userId || state.profile.userId !== userId) return null;
  const details = state.profile.userDetails;
  return details.id ? details : null;
}

const selectAdminAgentsTotal = (state: RootState) => state.adminAgents.total;
const selectAdminUsersSidebarBadge = (state: RootState): number => {
  const { sidebarTotal, sidebarTotalStatus, sidebarCountsAuthUserId } =
    state.adminUsers;
  const uid = state.auth.userId;
  if (
    sidebarTotalStatus === "succeeded" &&
    sidebarTotal !== null &&
    uid != null &&
    sidebarCountsAuthUserId === uid
  ) {
    return sidebarTotal;
  }
  /** Hide sidebar badge until a definite total is known (see Sidebar count display). */
  return -1;
};
const selectPropertySearch = (state: RootState) => state.propertySearch;
const selectFavourites = (state: RootState) => state.favourites.propertyIds;
const selectSavedSearchesItems = (state: RootState) => state.savedSearches.items;
const selectAgentDashboardSummary = (state: RootState) =>
  state.agentDashboardSummary;

const selectAdminManageListingsSidebarBadge = (state: RootState): number => {
  const s = state.agentDashboardSummary;
  const uid = state.auth.userId;
  if (
    s.adminManageListingsTotalStatus === "succeeded" &&
    s.adminManageListingsTotal !== null &&
    uid != null &&
    s.adminListingsCountsAuthUserId === uid
  ) {
    return s.adminManageListingsTotal;
  }
  return -1;
};

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
    selectAdminAgentsTotal,
    selectPropertySearch,
    selectFavourites,
    selectAgentDashboardSummary,
    selectCurrentUser,
    selectSavedSearchesItems,
    selectAdminUsersSidebarBadge,
    selectAdminManageListingsSidebarBadge,
  ],
  (
    adminAgentsTotal,
    propertySearch,
    favouriteIds,
    agentDashboardSummary,
    user,
    savedSearchItems,
    adminUsersSidebarTotal,
    adminManageListingsTotal,
  ): Record<string, number> => {
    const totalProperties = propertySearch.total;
    const isAgent = user?.role === "agent";
    const isAdmin = user?.role === "admin";
    const agentSummaryCountsValid =
      isAgent &&
      !!user?.id &&
      agentDashboardSummary.dashboardCacheAuthUserId === user.id;
    // Agents: sidebar "Manage Listings" + leads counts come only from the agent dashboard
    // bundle in Redux (`agentDashboardSummary` / `setAgentDashboardCache`), not from search.
    // Admins: `GET /agent-properties` total via `fetchAdminManageListingsSidebarTotal` (-1 hides badge).
    const totalListings = isAgent
      ? agentSummaryCountsValid
        ? agentDashboardSummary.totalProperties
        : -1
      : isAdmin
        ? adminManageListingsTotal
        : agentDashboardSummary.totalProperties > 0
          ? agentDashboardSummary.totalProperties
          : propertySearch.items.length;
    const totalSavedProperties = favouriteIds.length;
    const totalFavouriteProperties = favouriteIds.length;
    const totalSavedSearches = savedSearchItems.length;

    return {
      /** `GET /users` total (`register_user`) for admin sidebar; `-1` hides the badge until known. */
      totalUsers: isAdmin ? adminUsersSidebarTotal : -1,
      /** Directory total from `GET /agents` pagination (`adminAgents.total`); admin-only. */
      totalAgents: isAdmin ? adminAgentsTotal : -1,
      totalProperties,
      totalListings,
      totalSavedProperties,
      totalFavouriteProperties,
      totalSavedSearches,
      leadsThisMonth:
        isAgent && agentSummaryCountsValid
          ? agentDashboardSummary.leadsThisMonth
          : -1,
      inquiryVolumeLast7Days:
        isAgent && agentSummaryCountsValid
          ? agentDashboardSummary.inquiryVolumeLast7Days
          : -1,
    };
  },
);
