"use client";

import type { AppDispatch } from "@/store";
import { logout as logoutAction } from "@/features/auth/authSlice";
import { clearProfileForUser } from "@/features/profile/profileSlice";
import { clearFavourites } from "@/features/favourites/favouritesSlice";
import { clearSavedSearches } from "@/features/saved-searches/savedSearchesSlice";
import { clearCompare } from "@/features/compare/compareSlice";
import { resetAdminAgents } from "@/features/admin-agents/adminAgentsSlice";
import { clearAgentDashboardSummary } from "@/features/admin-agents/agent-dashboard/agentDashboardSummarySlice";
import { clearAdminDashboardSummary } from "@/features/admin-agents/admin-dashboard/adminDashboardSummarySlice";
import { clearAdminUserGrowthTrends } from "@/features/admin-agents/admin-dashboard/adminUserGrowthTrendsSlice";
import { clearAuthSession } from "@/lib/auth/sessionCookies";
import { logout as apiLogout } from "@/services/authService";
import { LocalStorageTokenStore } from "@/lib/auth/adapters/localStorageTokenStore";

const AUTH_USERNAME_STORAGE_KEY = "authUsername";
const AUTH_SUBID_STORAGE_KEY = "subId";
export const SESSION_EXPIRED_MESSAGE_KEY = "auth:session-expired-message";

/** Clears all token/session storage (localStorage + cookies). */
function clearAllAuthStorage(): void {
  const tokenStore = new LocalStorageTokenStore();
  tokenStore.clearTokens();

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_USERNAME_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_SUBID_STORAGE_KEY);
  }

  clearAuthSession();
}

/** Logs out on the server, clears all local tokens/session, and resets all user-related store state. */
export async function performClientLogout(
  dispatch: AppDispatch,
  userId?: string,
): Promise<void> {
  try {
    await apiLogout();
  } catch {
    // Network/API issues should not block local logout.
  }

  clearAllAuthStorage();

  dispatch(clearFavourites());
  dispatch(clearSavedSearches());
  dispatch(clearCompare());
  dispatch(resetAdminAgents());
  dispatch(clearAgentDashboardSummary());
  dispatch(clearAdminDashboardSummary());
  dispatch(clearAdminUserGrowthTrends());
  if (userId) {
    dispatch(clearProfileForUser(userId));
  }
  dispatch(logoutAction());
}

/**
 * Force logout without calling the logout API (e.g. when refresh returns "Invalid or expired token").
 * Clears all auth storage, resets Redux state, optionally stores message for login page toast, then redirects.
 */
export function forceLocalLogout(
  dispatch: AppDispatch,
  userId?: string,
  message?: string,
  onRedirect?: () => void,
): void {
  clearAllAuthStorage();

  dispatch(clearFavourites());
  dispatch(clearSavedSearches());
  dispatch(clearCompare());
  dispatch(resetAdminAgents());
  dispatch(clearAgentDashboardSummary());
  dispatch(clearAdminDashboardSummary());
  dispatch(clearAdminUserGrowthTrends());
  if (userId) {
    dispatch(clearProfileForUser(userId));
  }
  dispatch(logoutAction());

  if (typeof window !== "undefined" && message) {
    window.sessionStorage.setItem(SESSION_EXPIRED_MESSAGE_KEY, message);
  }

  onRedirect?.();
}

