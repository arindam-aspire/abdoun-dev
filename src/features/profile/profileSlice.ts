import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ProfileExtra {
  displayName?: string;
  location?: string;
  avatarUrl?: string;
  marketingEmails?: boolean;
  analyticsCookies?: boolean;
}

export interface ProfileState {
  /** Extended profile data by user id (displayName, location, avatarUrl, privacy prefs). */
  byUserId: Record<string, ProfileExtra>;
}

const initialState: ProfileState = {
  byUserId: {},
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileExtra(
      state,
      action: PayloadAction<{ userId: string; extra: Partial<ProfileExtra> }>,
    ) {
      const { userId, extra } = action.payload;
      if (!state.byUserId[userId]) {
        state.byUserId[userId] = {};
      }
      const current = state.byUserId[userId];
      if (extra.displayName !== undefined) current.displayName = extra.displayName;
      if (extra.location !== undefined) current.location = extra.location;
      if (extra.avatarUrl !== undefined) current.avatarUrl = extra.avatarUrl;
      if (extra.marketingEmails !== undefined) current.marketingEmails = extra.marketingEmails;
      if (extra.analyticsCookies !== undefined) current.analyticsCookies = extra.analyticsCookies;
    },
    clearProfileForUser(state, action: PayloadAction<string>) {
      delete state.byUserId[action.payload];
    },
  },
});

export const { setProfileExtra, clearProfileForUser } = profileSlice.actions;
export default profileSlice.reducer;
