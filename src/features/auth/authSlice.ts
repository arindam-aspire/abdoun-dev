import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "user" | "agent" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean | null;
  isEmailVerified?: boolean | null;
  isPhoneVerified?: boolean | null;
  requiresPasswordSet?: boolean | null;
}

export interface AuthState {
  /** Current user id; full user data lives in profile.userDetails. */
  userId: string | null;
}

const initialState: AuthState = {
  userId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<AuthUser>) {
      state.userId = action.payload.id;
    },
    logout(state) {
      state.userId = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

