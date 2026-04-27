import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** User data stored in profile (synced from auth on login). */
export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  /** Country calling code (e.g. "+91" or "91"). */
  countryDialCode?: string;
  /** National number without country code (e.g. "86172 20397"). */
  phoneNumber?: string;
  role: "user" | "agent" | "admin";
  location?: string;
  /** @deprecated Do not use for image src; use profilePictureUrl from GET /auth/me. */
  avatarUrl?: string;
  /** Presigned GET from GET /auth/me — only source for displayed avatar. */
  profilePictureUrl?: string | null;
  displayName?: string;
  marketingEmails?: boolean;
  analyticsCookies?: boolean;
  isActive?: boolean | null;
  isEmailVerified?: boolean | null;
  isPhoneVerified?: boolean | null;
  requiresPasswordSet?: boolean | null;
}

export interface ProfileState {
  /** User data by user id (synced from auth when user logs in). */
  userDetails: ProfileUser;
  userId: string;
}

const initialState: ProfileState = {
  userDetails: {
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "user",
  },
  userId: "",
};

type ProfileExtraPayload = Partial<
  Pick<
    ProfileUser,
    | "location"
    | "avatarUrl"
    | "displayName"
    | "marketingEmails"
    | "analyticsCookies"
    | "countryDialCode"
    | "phoneNumber"
  >
>;

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileUser(state, action: PayloadAction<ProfileUser>) {
      const user = action.payload;
      state.userDetails = { ...user };
      state.userId = user.id;
    },
    setProfileExtra(
      state,
      action: PayloadAction<{ userId: string; extra: ProfileExtraPayload }>,
    ) {
      const { userId, extra } = action.payload;
      if (state.userId !== userId) return;
      const details = state.userDetails;
      if (extra.displayName !== undefined) details.displayName = extra.displayName;
      if (extra.location !== undefined) details.location = extra.location;
      if (extra.avatarUrl !== undefined) details.avatarUrl = extra.avatarUrl;
      if (extra.marketingEmails !== undefined) details.marketingEmails = extra.marketingEmails;
      if (extra.analyticsCookies !== undefined) details.analyticsCookies = extra.analyticsCookies;
      if (extra.countryDialCode !== undefined)
        details.countryDialCode = extra.countryDialCode;
      if (extra.phoneNumber !== undefined) details.phoneNumber = extra.phoneNumber;
    },
    clearProfileForUser(state, action: PayloadAction<string>) {
      if (state.userId !== action.payload) return;
      state.userDetails = { ...initialState.userDetails };
      state.userId = initialState.userId;
    },
  },
});

export const { setProfileUser, setProfileExtra, clearProfileForUser } =
  profileSlice.actions;
export default profileSlice.reducer;
