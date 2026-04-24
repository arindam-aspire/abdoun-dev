import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminUserGrowthTrends,
  type AdminUserGrowthTrendsResult,
} from "@/features/admin-agents/admin-dashboard/api/adminDashboard.api";
import { getApiErrorMessage } from "@/lib/http";

export type AdminUserGrowthTrendsStatus = "idle" | "loading" | "succeeded" | "failed";

type AdminUserGrowthTrendsState = AdminUserGrowthTrendsResult & {
  status: AdminUserGrowthTrendsStatus;
  error: string | null;
};

const initialState: AdminUserGrowthTrendsState = {
  monthLabels: [],
  values: [],
  status: "idle",
  error: null,
};

export const loadAdminUserGrowthTrends = createAsyncThunk(
  "adminUserGrowthTrends/load",
  async (months: number | undefined, { rejectWithValue }) => {
    try {
      return await fetchAdminUserGrowthTrends(months ?? 12);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const adminUserGrowthTrendsSlice = createSlice({
  name: "adminUserGrowthTrends",
  initialState,
  reducers: {
    clearAdminUserGrowthTrends() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminUserGrowthTrends.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.monthLabels = [];
        state.values = [];
      })
      .addCase(loadAdminUserGrowthTrends.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.monthLabels = action.payload.monthLabels;
        state.values = action.payload.values;
      })
      .addCase(loadAdminUserGrowthTrends.rejected, (state, action) => {
        state.status = "failed";
        state.monthLabels = [];
        state.values = [];
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Unable to load user growth trends.";
      });
  },
});

export const { clearAdminUserGrowthTrends } = adminUserGrowthTrendsSlice.actions;

export default adminUserGrowthTrendsSlice.reducer;
