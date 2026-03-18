"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { setProfileExtra } from "@/features/profile/profileSlice";
import { selectCurrentUser } from "@/store/selectors";
import { updateUser, getCurrentUser, toSessionUserForProfile } from "@/features/profile/api/profile.api";
import type { ProfileData } from "@/types/auth";

const DEFAULT_LOCATION = "Dubai, UAE";

/**
 * Encapsulates profile update submit: API call and Redux updates.
 * Same endpoints and payloads as before.
 */
export function useUpdateProfile(): {
  updateProfile: (updates: Partial<ProfileData>) => Promise<void>;
} {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectCurrentUser);

  const updateProfile = useCallback(
    async (updates: Partial<ProfileData>) => {
      if (!authUser) return;

      const apiPayload: { full_name?: string; phone_number?: string } = {};
      if (updates.fullName !== undefined) apiPayload.full_name = updates.fullName;
      if (updates.phone !== undefined) apiPayload.phone_number = updates.phone;

      let sessionUser = authUser;
      if (Object.keys(apiPayload).length > 0) {
        await updateUser(authUser.id, apiPayload);
        const updated = await getCurrentUser();
        sessionUser = toSessionUserForProfile(updated);
        dispatch(login(sessionUser));
      }

      if (updates.role !== undefined) {
        const role =
          (updates.role.charAt(0).toUpperCase() + updates.role.slice(1)) as ProfileData["role"];
        dispatch(login({ ...sessionUser, role }));
        sessionUser = { ...sessionUser, role };
      }
      if (updates.email !== undefined) {
        dispatch(login({ ...sessionUser, email: updates.email }));
      }

      const profileOnly: Partial<{
        location: string;
        avatarUrl: string;
        displayName: string;
      }> = {};
      if (updates.location !== undefined) profileOnly.location = updates.location;
      if (updates.avatarUrl !== undefined) profileOnly.avatarUrl = updates.avatarUrl;
      if (updates.displayName !== undefined) profileOnly.displayName = updates.displayName;

      if (Object.keys(profileOnly).length > 0) {
        dispatch(
          setProfileExtra({
            userId: authUser.id,
            extra: profileOnly,
          }),
        );
      }
    },
    [authUser, dispatch],
  );

  return { updateProfile };
}
