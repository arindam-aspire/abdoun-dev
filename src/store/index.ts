import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/counter/counterSlice";
import uiReducer from "@/features/ui/uiSlice";
import authReducer from "@/features/auth/authSlice";
import profileReducer from "@/features/profile/profileSlice";
import favouritesReducer from "@/features/favourites/favouritesSlice";
import compareReducer from "@/features/compare/compareSlice";
import savedSearchesReducer from "@/features/savedSearches/savedSearchesSlice";
import adminAgentsReducer from "@/features/admin-agents/adminAgentsSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    ui: uiReducer,
    auth: authReducer,
    profile: profileReducer,
    favourites: favouritesReducer,
    compare: compareReducer,
    savedSearches: savedSearchesReducer,
    adminAgents: adminAgentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

