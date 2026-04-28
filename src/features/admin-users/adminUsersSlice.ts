import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/lib/http";
import {
  listUsers,
  softDeleteUser,
  updateUser,
  type ListUsersParams,
  type ListUsersResult,
  type UserManagementUser,
} from "@/services/userService";

export const ADMIN_USERS_LIST_USER_TYPE = "register_user";

export type FetchAdminUsersArg = ListUsersParams & { force?: boolean };

function stripForce(arg: FetchAdminUsersArg | undefined): ListUsersParams {
  if (!arg) return {};
  const { force: _force, ...rest } = arg;
  return rest;
}

/** Normalized params for `GET /users` (admin register-user list). */
export function normalizeAdminUsersListParams(
  arg: FetchAdminUsersArg | undefined,
): ListUsersParams {
  const rest = stripForce(arg);
  return {
    userType: ADMIN_USERS_LIST_USER_TYPE,
    page: rest.page ?? 1,
    pageSize: rest.pageSize ?? 10,
    search: rest.search?.trim() ? rest.search.trim() : undefined,
    is_active: rest.is_active,
    role_name: rest.role_name,
  };
}

/** Stable cache key for the admin users list query. */
export function adminUsersListCacheKey(params: ListUsersParams): string {
  return [
    params.page ?? 1,
    params.pageSize ?? 10,
    params.userType ?? "",
    params.search ?? "",
    params.is_active === true ? "1" : params.is_active === false ? "0" : "",
    params.role_name ?? "",
  ].join("|");
}

type AdminUsersState = {
  items: UserManagementUser[];
  /** Total rows for the last list query when the API sends `total`; else `null`. */
  listTotal: number | null;
  hasNextPage: boolean;
  page: number;
  pageSize: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  lastFetchKey: string | null;
  listInFlightKey: string | null;
  /** Cached `GET /users` total for admin sidebar badge (`register_user` scope). */
  sidebarTotal: number | null;
  sidebarTotalStatus: "idle" | "loading" | "succeeded" | "failed";
  /** `auth.userId` when `sidebarTotal` was last fetched (invalidates on account switch). */
  sidebarCountsAuthUserId: string | null;
  /** User id while `PATCH /users/:id` (active flag) is in flight. */
  statusUpdateUserId: string | null;
  /** User id while `DELETE /users/:id` (soft delete) is in flight. */
  deleteUserId: string | null;
};

type AdminUsersThunkState = {
  adminUsers: AdminUsersState;
  auth: { userId: string | null };
};

const initialState: AdminUsersState = {
  items: [],
  listTotal: null,
  hasNextPage: false,
  page: 1,
  pageSize: 10,
  status: "idle",
  loading: false,
  error: null,
  lastFetchKey: null,
  listInFlightKey: null,
  sidebarTotal: null,
  sidebarTotalStatus: "idle",
  sidebarCountsAuthUserId: null,
  statusUpdateUserId: null,
  deleteUserId: null,
};

export const fetchAdminUsers = createAsyncThunk<
  ListUsersResult,
  FetchAdminUsersArg | undefined,
  { state: AdminUsersThunkState }
>(
  "adminUsers/fetchAdminUsers",
  async (arg, thunkApi) => {
    const params = normalizeAdminUsersListParams(arg);
    try {
      return await listUsers(params);
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const params = normalizeAdminUsersListParams(arg);
      const key = adminUsersListCacheKey(params);
      const s = getState().adminUsers;
      if (s.loading && s.listInFlightKey === key) return false;
      if (s.status === "succeeded" && s.lastFetchKey === key) return false;
      return true;
    },
  },
);

/**
 * Lightweight `GET /users` for admin sidebar count (does not replace the table `items` slice).
 */
export const fetchAdminUsersSidebarTotal = createAsyncThunk<
  { total: number | null; authUserId: string | null },
  void,
  { state: AdminUsersThunkState }
>(
  "adminUsers/fetchAdminUsersSidebarTotal",
  async (_, thunkApi) => {
    const authUserId = thunkApi.getState().auth.userId;
    try {
      const { items, total } = await listUsers(
        normalizeAdminUsersListParams({
          page: 1,
          pageSize: 1,
          userType: ADMIN_USERS_LIST_USER_TYPE,
        }),
      );
      const resolved =
        total != null ? total : items.length === 0 ? 0 : null;
      return { total: resolved, authUserId };
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const s = getState().adminUsers;
      const uid = getState().auth.userId;
      if (s.sidebarTotalStatus === "loading") return false;
      if (
        s.sidebarTotalStatus === "succeeded" &&
        uid != null &&
        s.sidebarCountsAuthUserId === uid
      ) {
        return false;
      }
      return true;
    },
  },
);

export const setAdminUserActiveStatus = createAsyncThunk<
  UserManagementUser,
  { userId: string; is_active: boolean },
  { state: AdminUsersThunkState }
>(
  "adminUsers/setAdminUserActiveStatus",
  async ({ userId, is_active }, thunkApi) => {
    try {
      return await updateUser(userId, { is_active });
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteAdminUser = createAsyncThunk<
  { userId: string },
  { userId: string },
  { state: AdminUsersThunkState }
>("adminUsers/deleteAdminUser", async ({ userId }, thunkApi) => {
  try {
    await softDeleteUser(userId);
    return { userId };
  } catch (error) {
    return thunkApi.rejectWithValue(getApiErrorMessage(error));
  }
});

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    resetAdminUsers() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
        state.listInFlightKey = adminUsersListCacheKey(
          normalizeAdminUsersListParams(action.meta.arg),
        );
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.status = "succeeded";
        state.listInFlightKey = null;
        const params = normalizeAdminUsersListParams(action.meta.arg);
        state.page = params.page ?? 1;
        state.pageSize = params.pageSize ?? 10;
        const { items, total } = action.payload;
        state.items = items;
        state.listTotal = total;
        if (total != null && Number.isFinite(total)) {
          state.hasNextPage = state.page * state.pageSize < total;
        } else {
          state.hasNextPage = items.length === state.pageSize;
        }
        state.lastFetchKey = adminUsersListCacheKey(params);
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        if (action.meta.condition === true) return;
        state.loading = false;
        state.listInFlightKey = null;
        state.items = [];
        state.listTotal = null;
        state.hasNextPage = false;
        state.error =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to load users.";
        state.status = "failed";
      })
      .addCase(fetchAdminUsersSidebarTotal.pending, (state) => {
        state.sidebarTotalStatus = "loading";
      })
      .addCase(fetchAdminUsersSidebarTotal.fulfilled, (state, action) => {
        state.sidebarTotalStatus = "succeeded";
        state.sidebarTotal = action.payload.total;
        state.sidebarCountsAuthUserId = action.payload.authUserId;
      })
      .addCase(fetchAdminUsersSidebarTotal.rejected, (state) => {
        state.sidebarTotalStatus = "failed";
      })
      .addCase(setAdminUserActiveStatus.pending, (state, action) => {
        state.statusUpdateUserId = action.meta.arg.userId;
      })
      .addCase(setAdminUserActiveStatus.fulfilled, (state, action) => {
        state.statusUpdateUserId = null;
        const updated = action.payload;
        state.items = state.items.map((u) =>
          u.id === updated.id ? ({ ...u, ...updated } as UserManagementUser) : u,
        );
      })
      .addCase(setAdminUserActiveStatus.rejected, (state) => {
        state.statusUpdateUserId = null;
      })
      .addCase(deleteAdminUser.pending, (state, action) => {
        state.deleteUserId = action.meta.arg.userId;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.deleteUserId = null;
        const { userId } = action.payload;
        state.items = state.items.filter((u) => u.id !== userId);
        if (typeof state.sidebarTotal === "number" && state.sidebarTotal > 0) {
          state.sidebarTotal -= 1;
        }
        if (typeof state.listTotal === "number" && state.listTotal > 0) {
          state.listTotal -= 1;
        }
        if (
          state.listTotal != null &&
          Number.isFinite(state.listTotal) &&
          state.listTotal >= 0
        ) {
          state.hasNextPage = state.page * state.pageSize < state.listTotal;
        } else if (state.items.length < state.pageSize) {
          state.hasNextPage = false;
        }
      })
      .addCase(deleteAdminUser.rejected, (state) => {
        state.deleteUserId = null;
      });
  },
});

export const { resetAdminUsers } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
