import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminAgentLeaderboard,
  fetchAdminDashboardData,
  type AdminLeaderboardData,
} from "@/features/admin-agents/admin-dashboard/api/adminDashboard.api";
import { getApiErrorMessage } from "@/lib/http";
import type { AdminDashboardData } from "@/services/adminDashboardMockService";

export type AdminDashboardSummaryStatus = "idle" | "loading" | "succeeded" | "failed";
export type AdminLeaderboardStatus = "idle" | "loading" | "succeeded" | "failed";

type AdminLeaderboardState = {
  data: AdminLeaderboardData | null;
  status: AdminLeaderboardStatus;
  error: string | null;
};

type AdminDashboardSummaryState = {
  data: AdminDashboardData | null;
  status: AdminDashboardSummaryStatus;
  error: string | null;
  /** `GET /agents/leaderboard` (same admin home context; cleared with summary on logout). */
  leaderboard: AdminLeaderboardState;
};

/** Minimal `getState()` shape for thunks (avoids importing `RootState` from the store). */
type AdminDashboardSummaryThunkState = {
  adminDashboardSummary: AdminDashboardSummaryState;
};

const leaderboardInitial: AdminLeaderboardState = {
  data: null,
  status: "idle",
  error: null,
};

const initialState: AdminDashboardSummaryState = {
  data: null,
  status: "idle",
  error: null,
  leaderboard: leaderboardInitial,
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

/**
 * Loads `GET /agents/leaderboard` for the admin home “Top agents” section.
 * Skips when in-flight or when a successful payload is already cached.
 */
export const loadAdminLeaderboard = createAsyncThunk<
  AdminLeaderboardData,
  void,
  { state: AdminDashboardSummaryThunkState }
>("adminDashboardSummary/loadLeaderboard", async (_, { rejectWithValue }) => {
  try {
    return await fetchAdminAgentLeaderboard();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
}, {
  condition: (_, { getState }) => {
    const s = getState().adminDashboardSummary.leaderboard;
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

    builder
      .addCase(loadAdminLeaderboard.pending, (state) => {
        state.leaderboard.status = "loading";
        state.leaderboard.error = null;
      })
      .addCase(loadAdminLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.status = "succeeded";
        state.leaderboard.error = null;
        state.leaderboard.data = action.payload;
      })
      .addCase(loadAdminLeaderboard.rejected, (state, action) => {
        state.leaderboard.status = "failed";
        state.leaderboard.data = null;
        state.leaderboard.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Unable to load leaderboard.";
      });
  },
});

export const { clearAdminDashboardSummary } = adminDashboardSummarySlice.actions;

export default adminDashboardSummarySlice.reducer;

export function selectAdminDashboardSummary(state: AdminDashboardSummaryThunkState) {
  return state.adminDashboardSummary;
}

export function selectAdminLeaderboard(state: AdminDashboardSummaryThunkState) {
  return state.adminDashboardSummary.leaderboard;
}
