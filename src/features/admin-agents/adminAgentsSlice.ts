import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminAgentsMock,
  inviteAgentByEmailMock,
  type AdminAgent,
} from "@/services/adminAgentMockService";
import type { RootState } from "@/store";

type AdminAgentsState = {
  items: AdminAgent[];
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  inviting: boolean;
  inviteError: string | null;
  inviteSuccessMessage: string | null;
};

const initialState: AdminAgentsState = {
  items: [],
  status: "idle",
  loading: false,
  error: null,
  inviting: false,
  inviteError: null,
  inviteSuccessMessage: null,
};

export const fetchAdminAgents = createAsyncThunk(
  "adminAgents/fetchAdminAgents",
  async (_, thunkApi) => {
    try {
      return await fetchAdminAgentsMock();
    } catch (error) {
      if (error instanceof Error && error.message) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue("Failed to load agents.");
    }
  },
);

export const inviteAdminAgentByEmail = createAsyncThunk(
  "adminAgents/inviteAdminAgentByEmail",
  async (email: string, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const adminName = state.auth.user?.name ?? "Admin User";
      return await inviteAgentByEmailMock(email, adminName);
    } catch (error) {
      if (error instanceof Error && error.message) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue("Failed to invite agent.");
    }
  },
);

const adminAgentsSlice = createSlice({
  name: "adminAgents",
  initialState,
  reducers: {
    clearInviteFeedback(state) {
      state.inviteError = null;
      state.inviteSuccessMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(fetchAdminAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchAdminAgents.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to load agents.";
        state.status = "failed";
      })
      .addCase(inviteAdminAgentByEmail.pending, (state) => {
        state.inviting = true;
        state.inviteError = null;
        state.inviteSuccessMessage = null;
      })
      .addCase(inviteAdminAgentByEmail.fulfilled, (state, action) => {
        state.inviting = false;
        state.inviteError = null;
        state.items = [action.payload, ...state.items.filter((a) => a.id !== action.payload.id)];
        state.inviteSuccessMessage = `Invitation sent to ${action.payload.email}`;
      })
      .addCase(inviteAdminAgentByEmail.rejected, (state, action) => {
        state.inviting = false;
        state.inviteSuccessMessage = null;
        state.inviteError =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to invite agent.";
      });
  },
});

export const { clearInviteFeedback } = adminAgentsSlice.actions;
export default adminAgentsSlice.reducer;
