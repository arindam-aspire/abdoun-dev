"use client";

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { setProfileExtra } from "@/features/profile/profileSlice";
import { selectCurrentUser } from "@/store/selectors";
import { getProfileFromAuth, type ProfileData } from "@/types/auth";
import { updateUser } from "@/services/userService";
import { getCurrentUser, toSessionUserForProfile } from "@/services/authService";

export interface UseProfileResult {
  profile: ProfileData;
  saveProfile: (updates: Partial<ProfileData>) => Promise<void>;
}

const DEFAULT_LOCATION = "Dubai, UAE";

export function useProfile(): UseProfileResult | null {
  const authUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const profile = useMemo((): ProfileData | null => {
    if (!authUser) return null;
    const base = getProfileFromAuth(authUser);
    return {
      ...base,
      location: authUser.location ?? base.location ?? DEFAULT_LOCATION,
      avatarUrl: authUser.avatarUrl,
      displayName: authUser.displayName,
    };
  }, [authUser]);

  const saveProfile = useCallback(
    async (updates: Partial<ProfileData>) => {
      if (!authUser) return;

      // Update via API (PATCH /users/:id) for full_name, phone_number
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

      // Local-only auth fields (role, email) — update session from inputs
      if (updates.role !== undefined) {
        const role =
          (updates.role.charAt(0).toUpperCase() + updates.role.slice(1)) as ProfileData["role"];
        dispatch(login({ ...sessionUser, role }));
        sessionUser = { ...sessionUser, role };
      }
      if (updates.email !== undefined) {
        dispatch(login({ ...sessionUser, email: updates.email }));
      }

      // Profile extras (avatar, displayName, location) — Redux only
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

  if (!profile) return null;

  return { profile, saveProfile };
}
