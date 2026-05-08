import { configureStore } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { login } from "@/features/auth/authSlice";
import profileReducer, { setProfileUser } from "@/features/profile/profileSlice";
import type { ProfileUser } from "@/features/profile/profileSlice";
import uiReducer from "@/features/ui/uiSlice";
import authReducer from "@/features/auth/authSlice";
import favouritesReducer from "@/features/favourites/favouritesSlice";
import compareReducer from "@/features/compare/compareSlice";
import savedSearchesReducer from "@/features/saved-searches/savedSearchesSlice";
import adminAgentsReducer from "@/features/admin/adminAgentsSlice";
import adminUsersReducer from "@/features/admin-users/adminUsersSlice";
import propertySearchReducer from "@/features/property-search/propertySearchSlice";
import propertyDetailsReducer from "@/features/property-details/propertyDetailsSlice";
import exclusivePropertiesReducer from "@/features/exclusive-properties/exclusivePropertiesSlice";
import agentDashboardSummaryReducer from "@/features/agent/dashboard/agentDashboardSummarySlice";
import adminUserGrowthTrendsReducer from "@/features/admin/dashboard/adminUserGrowthTrendsSlice";
import adminDashboardSummaryReducer from "@/features/admin/dashboard/adminDashboardSummarySlice";
import addPropertyWizardReducer from "@/features/agent/dashboard/components/add-property/addPropertyWizardSlice";
import locationTaxonomyReducer from "@/features/location-taxonomy/locationTaxonomySlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";

/** Syncs auth login payload into profile reducer so profile has user details. */
const profileUserSyncMiddleware: Middleware =
  (store) => (next) => (action: unknown) => {
    const result = next(action);
    if (
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      (action as { type: string }).type === login.type &&
      "payload" in action
    ) {
      store.dispatch(setProfileUser((action as { payload: ProfileUser }).payload));
    }
    return result;
  };

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    profile: profileReducer,
    favourites: favouritesReducer,
    compare: compareReducer,
    savedSearches: savedSearchesReducer,
    adminAgents: adminAgentsReducer,
    adminUsers: adminUsersReducer,
    propertySearch: propertySearchReducer,
    propertyDetails: propertyDetailsReducer,
    exclusiveProperties: exclusivePropertiesReducer,
    agentDashboardSummary: agentDashboardSummaryReducer,
    adminUserGrowthTrends: adminUserGrowthTrendsReducer,
    adminDashboardSummary: adminDashboardSummaryReducer,
    addPropertyWizard: addPropertyWizardReducer,
    locationTaxonomy: locationTaxonomyReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(profileUserSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

