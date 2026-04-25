import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  inviteAdminAgent,
  listAdminAgents,
  approveAgent,
  declineAgent,
  deleteAgent,
  grantAdminAccess,
  type ListAdminAgentsParams,
  type AdminAgent,
  type InviteAgentResponse,
  agentOnboardingManually,
} from "@/services/adminAgentApiService";
import { AGENT_STATUS } from "@/constants/agentStatus";
import { normalizeAgentStatus } from "@/constants/agentStatus";

/** Thunk argument: same as list API params, plus optional `force` to bypass session cache. */
export type FetchAdminAgentsArg = ListAdminAgentsParams & { force?: boolean };

function listParamsFromFetchArg(arg: FetchAdminAgentsArg | undefined): ListAdminAgentsParams {
  if (!arg) return {};
  const { force: _force, ...rest } = arg;
  return rest;
}

/** Stable key for `GET /agents` query (must match `listAdminAgents` defaults). */
export function adminAgentsListCacheKey(params: ListAdminAgentsParams): string {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const sort_by = params.sort_by ?? "invited_at";
  const order = params.order ?? "desc";
  const status = params.status ?? "";
  return `${page}|${limit}|${sort_by}|${order}|${status}`;
}

type AdminAgentsState = {
  /** All agents we've seen so far across any page/filter (merged by id). */
  allItems: AdminAgent[];
  /** Agents for the current page/filter coming from the last fetch. */
  currentItems: AdminAgent[];
  total: number;
  /** Page number of the currently stored items (1-based). */
  page: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  inviting: boolean;
  inviteError: string | null;
  inviteSuccessMessage: string | null;
  /** Last successful `GET /agents` query key; used to skip duplicate fetches. */
  lastFetchKey: string | null;
  /** True after invite/create/delete until the next successful list fetch. */
  agentsListStale: boolean;
  /** Query key for the in-flight list request (dedupes parallel identical dispatches). */
  listInFlightKey: string | null;
};

/** Minimal `getState()` shape for the agents list thunk (avoids importing `RootState`). */
type AdminAgentsThunkState = {
  adminAgents: AdminAgentsState;
};

const initialState: AdminAgentsState = {
  allItems: [],
  currentItems: [],
  total: 0,
  page: 1,
  status: "idle",
  loading: false,
  error: null,
  inviting: false,
  inviteError: null,
  inviteSuccessMessage: null,
  lastFetchKey: null,
  agentsListStale: false,
  listInFlightKey: null,
};

export const fetchAdminAgents = createAsyncThunk<
  Awaited<ReturnType<typeof listAdminAgents>>,
  FetchAdminAgentsArg | undefined,
  { state: AdminAgentsThunkState }
>(
  "adminAgents/fetchAdminAgents",
  async (params, thunkApi) => {
    const listParams = listParamsFromFetchArg(params);
    try {
      return await listAdminAgents(listParams);
    } catch (error) {
      if (error instanceof Error && error.message) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue("Failed to load agents.");
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const listParams = listParamsFromFetchArg(arg);
      const key = adminAgentsListCacheKey(listParams);
      const { adminAgents: s } = getState();
      if (s.loading && s.listInFlightKey === key) return false;
      if (s.status === "succeeded" && s.lastFetchKey === key && !s.agentsListStale) {
        return false;
      }
      return true;
    },
  },
);

/** Map invite API response to AdminAgent for storing in the list. */
function inviteResponseToAgent(res: InviteAgentResponse): AdminAgent {
  return {
    id: res.id,
    fullName: "Agent",
    email: res.email,
    phone: "N/A",
    city: "N/A",
    status: normalizeAgentStatus(res.status),
    invitedAt: res.invitedAt ?? new Date().toISOString(),
    // Use backend-provided invitedBy (logged-in user), fallback to N/A
    invitedBy: res.invitedBy?.trim() || "N/A",
  };
}

export const inviteAdminAgentByEmail = createAsyncThunk(
  "adminAgents/inviteAdminAgentByEmail",
  async (email: string, thunkApi) => {
    try {
      const data = await inviteAdminAgent(email);
      return data;
    } catch (error) {
      const anyError = error as unknown as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: string;
      };

      const detail =
        anyError.response?.data?.detail ??
        anyError.response?.data?.message ??
        anyError.message;

      if (typeof detail === "string" && detail.trim()) {
        return thunkApi.rejectWithValue(detail);
      }

      return thunkApi.rejectWithValue("Failed to create agent invitation");
    }
  },
);

export const approveAdminAgent = createAsyncThunk(
  "adminAgents/approveAdminAgent",
  async (agentId: string, thunkApi) => {
    try {
      await approveAgent(agentId);
      return { agentId };
    } catch (error) {
      const anyError = error as unknown as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: string;
      };

      const detail =
        anyError.response?.data?.detail ??
        anyError.response?.data?.message ??
        anyError.message;

      if (typeof detail === "string" && detail.trim()) {
        return thunkApi.rejectWithValue(detail);
      }

      return thunkApi.rejectWithValue("Failed to approve agent.");
    }
  },
);

export const declineAdminAgent = createAsyncThunk(
  "adminAgents/declineAdminAgent",
  async (agentId: string, thunkApi) => {
    try {
      await declineAgent(agentId);
      return { agentId };
    } catch (error) {
      const anyError = error as unknown as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: string;
      };

      const detail =
        anyError.response?.data?.detail ??
        anyError.response?.data?.message ??
        anyError.message;

      if (typeof detail === "string" && detail.trim()) {
        return thunkApi.rejectWithValue(detail);
      }

      return thunkApi.rejectWithValue("Failed to decline agent.");
    }
  },
);

export const deleteAdminAgent = createAsyncThunk(
  "adminAgents/deleteAdminAgent",
  async (agentId: string, thunkApi) => {
    try {
      await deleteAgent(agentId);
      return { agentId };
    } catch (error) {
      const anyError = error as unknown as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: string;
      };

      const detail =
        anyError.response?.data?.detail ??
        anyError.response?.data?.message ??
        anyError.message;

      if (typeof detail === "string" && detail.trim()) {
        return thunkApi.rejectWithValue(detail);
      }

      return thunkApi.rejectWithValue("Failed to delete agent.");
    }
  },
);

export const grantAdminAccessForAgent = createAsyncThunk(
  "adminAgents/grantAdminAccessForAgent",
  async (
    options: {
      adminId: string;
      agentId: string;
    },
    thunkApi,
  ) => {
    try {
      await grantAdminAccess(options);
      return options;
    } catch (error) {
      const anyError = error as unknown as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: string;
      };

      const detail =
        anyError.response?.data?.detail ??
        anyError.response?.data?.message ??
        anyError.message;

      if (typeof detail === "string" && detail.trim()) {
        return thunkApi.rejectWithValue(detail);
      }

      return thunkApi.rejectWithValue("Failed to grant admin access.");
    }
  },
);

export const createAdminAgentManually = createAsyncThunk(
  "adminAgents/createAdminAgentManually",
  async (agent: AdminAgent, thunkApi) => {
    try {
      await agentOnboardingManually(agent);
      return agent;
    } catch (error) {
      const anyError = error as unknown as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: string;
      };

      const detail =
        anyError.response?.data?.detail ??
        anyError.response?.data?.message ??
        anyError.message;

      if (typeof detail === "string" && detail.trim()) {
        return thunkApi.rejectWithValue(detail);
      }

      return thunkApi.rejectWithValue("Failed to create agent manually.");
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
    resetAdminAgents() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminAgents.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
        state.listInFlightKey = adminAgentsListCacheKey(listParamsFromFetchArg(action.meta.arg));
      })
      .addCase(fetchAdminAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const pageItems = action.payload.items;
        state.currentItems = pageItems;
        state.total = action.payload.total;
        state.page = action.payload.page ?? 1;
        state.status = "succeeded";
        state.agentsListStale = false;
        state.lastFetchKey = adminAgentsListCacheKey(listParamsFromFetchArg(action.meta.arg));
        state.listInFlightKey = null;
        // Merge into allItems, upserting by id
        const byId = new Map(state.allItems.map((a) => [a.id, a] as const));
        for (const agent of pageItems) {
          byId.set(agent.id, agent);
        }
        state.allItems = Array.from(byId.values());
      })
      .addCase(fetchAdminAgents.rejected, (state, action) => {
        if (action.meta.condition === true) return;
        state.loading = false;
        state.listInFlightKey = null;
        state.currentItems = [];
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
        state.inviteSuccessMessage = `Invitation sent to ${action.payload.email}`;
        state.agentsListStale = true;
        const newAgent = inviteResponseToAgent(action.payload);
        state.total += 1;
        if (state.page === 1) {
          state.currentItems = [newAgent, ...state.currentItems];
        }
        state.allItems = [newAgent, ...state.allItems.filter((a) => a.id !== newAgent.id)];
      })
      .addCase(inviteAdminAgentByEmail.rejected, (state, action) => {
        state.inviting = false;
        state.inviteSuccessMessage = null;
        state.inviteError =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to invite agent.";
      })
      .addCase(approveAdminAgent.fulfilled, (state, action) => {
        const id = action.payload.agentId;
        const apply = (list: AdminAgent[]) => {
          const agent = list.find((a) => a.id === id);
          if (agent) {
            agent.status = AGENT_STATUS.ACTIVE;
          }
        };
        apply(state.currentItems);
        apply(state.allItems);
      })
      .addCase(declineAdminAgent.fulfilled, (state, action) => {
        const id = action.payload.agentId;
        const apply = (list: AdminAgent[]) => {
          const agent = list.find((a) => a.id === id);
          if (agent) {
            agent.status = AGENT_STATUS.DECLINED;
          }
        };
        apply(state.currentItems);
        apply(state.allItems);
      })
      .addCase(deleteAdminAgent.fulfilled, (state, action) => {
        state.agentsListStale = true;
        const id = action.payload.agentId;
        state.currentItems = state.currentItems.filter((a) => a.id !== id);
        state.allItems = state.allItems.filter((a) => a.id !== id);
        if (state.total > 0) state.total -= 1;
      })
      .addCase(createAdminAgentManually.fulfilled, (state, action) => {
        state.agentsListStale = true;
        // Use the original payload to build the new agent entry
        const arg = action.meta.arg as AdminAgent;
        const now = new Date().toISOString();
        const newAgent: AdminAgent = {
          id: arg.id ?? `manual_${Date.now()}`,
          fullName: arg.fullName,
          email: arg.email,
          phone: arg.phone,
          city: arg.city,
          status: normalizeAgentStatus(arg.status ?? AGENT_STATUS.ACTIVE),
          invitedAt: arg.invitedAt ?? now,
          invitedBy: arg.invitedBy ?? "Manual onboarding",
        };

        state.total += 1;
        if (state.page === 1) {
          state.currentItems = [newAgent, ...state.currentItems];
        }
        state.allItems = [newAgent, ...state.allItems.filter((a) => a.id !== newAgent.id)];
      });
  },
});

export const { clearInviteFeedback, resetAdminAgents } = adminAgentsSlice.actions;
export default adminAgentsSlice.reducer;
