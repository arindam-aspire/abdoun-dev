import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/counter/counterSlice";
import uiReducer from "@/features/ui/uiSlice";
import authReducer from "@/features/auth/authSlice";
import favouritesReducer from "@/features/favourites/favouritesSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    ui: uiReducer,
    auth: authReducer,
    favourites: favouritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

