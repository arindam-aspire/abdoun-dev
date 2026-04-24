import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAdminDashboardData } from "@/features/admin-agents/admin-dashboard/api/adminDashboard.api";
import { getApiErrorMessage } from "@/lib/http";
import type { AdminDashboardData } from "@/services/adminDashboardMockService";

export type AdminDashboardSummaryStatus = "idle" | "loading" | "succeeded" | "failed";

type AdminDashboardSummaryState = {
  data: AdminDashboardData | null;
  status: AdminDashboardSummaryStatus;
  error: string | null;
};

/** Minimal `getState()` shape for the summary thunk (avoids importing `RootState` from the store). */
type AdminDashboardSummaryThunkState = {
  adminDashboardSummary: AdminDashboardSummaryState;
};

const initialState: AdminDashboardSummaryState = {
  data: null,
  status: "idle",
  error: null,
};

/**
 * Loads `GET /admin/dashboard/summary` into the store.
 * Skips when already loading or when a successful payload is cached (use logout to clear).
 */
export const loadAdminDashboardSummary = createAsyncThunk<
  AdminDashboardData,
  void,
  { state: AdminDashboardSummaryThunkState }
>("adminDashboardSummary/load", async (_, { rejectWithValue }) => {
  try {
    return await fetchAdminDashboardData();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
}, {
  condition: (_, { getState }) => {
    const s = getState().adminDashboardSummary;
    if (s.status === "loading") return false;
    if (s.status === "succeeded" && s.data != null) return false;
    return true;
  },
});

const adminDashboardSummarySlice = createSlice({
  name: "adminDashboardSummary",
  initialState,
  reducers: {
    clearAdminDashboardSummary() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminDashboardSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadAdminDashboardSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.data = action.payload;
      })
      .addCase(loadAdminDashboardSummary.rejected, (state, action) => {
        state.status = "failed";
        state.data = null;
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Unable to load admin dashboard.";
      });
  },
});

export const { clearAdminDashboardSummary } = adminDashboardSummarySlice.actions;

export default adminDashboardSummarySlice.reducer;

export function selectAdminDashboardSummary(state: AdminDashboardSummaryThunkState) {
  return state.adminDashboardSummary;
}
