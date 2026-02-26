"use client";

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { setProfileExtra } from "@/features/profile/profileSlice";
import {
  getProfileFromAuth,
  mockUpdateProfile,
  type ProfileData,
} from "@/services/authMockService";

export interface UseProfileResult {
  profile: ProfileData;
  saveProfile: (updates: Partial<ProfileData>) => Promise<void>;
}

const DEFAULT_LOCATION = "Dubai, UAE";

export function useProfile(): UseProfileResult | null {
  const authUser = useAppSelector((state) => state.auth.user);
  const profileExtra = useAppSelector((state) =>
    authUser ? state.profile.byUserId[authUser.id] : null,
  );
  const dispatch = useAppDispatch();

  const profile = useMemo((): ProfileData | null => {
    if (!authUser) return null;
    const base = getProfileFromAuth(authUser);
    return {
      ...base,
      location: profileExtra?.location ?? base.location ?? DEFAULT_LOCATION,
      avatarUrl: profileExtra?.avatarUrl,
      displayName: profileExtra?.displayName,
    };
  }, [authUser, profileExtra]);

  const saveProfile = useCallback(
    async (updates: Partial<ProfileData>) => {
      if (!authUser) return;

      const authUpdates: Partial<{
        name: string;
        email: string;
        phone: string;
        role: ProfileData["role"];
      }> = {};
      if (updates.fullName !== undefined) authUpdates.name = updates.fullName;
      if (updates.email !== undefined) authUpdates.email = updates.email;
      if (updates.phone !== undefined) authUpdates.phone = updates.phone;
      if (updates.role !== undefined) authUpdates.role = updates.role;

      if (Object.keys(authUpdates).length > 0) {
        dispatch(login({ ...authUser, ...authUpdates }));
      }

      const profileOnly: Partial<{
        location: string;
        avatarUrl: string;
        displayName: string;
      }> = {};
      if (updates.location !== undefined) profileOnly.location = updates.location;
      if (updates.avatarUrl !== undefined) profileOnly.avatarUrl = updates.avatarUrl;
      if (updates.displayName !== undefined) profileOnly.displayName = updates.displayName;

      const persistenceUpdates: Partial<ProfileData> = {};
      if (updates.fullName !== undefined) persistenceUpdates.fullName = updates.fullName;
      if (updates.email !== undefined) persistenceUpdates.email = updates.email;
      if (updates.phone !== undefined) persistenceUpdates.phone = updates.phone;
      if (updates.role !== undefined) persistenceUpdates.role = updates.role;
      if (updates.location !== undefined) persistenceUpdates.location = updates.location;
      if (updates.avatarUrl !== undefined) persistenceUpdates.avatarUrl = updates.avatarUrl;
      if (updates.displayName !== undefined) persistenceUpdates.displayName = updates.displayName;

      if (Object.keys(profileOnly).length > 0) {
        dispatch(
          setProfileExtra({
            userId: authUser.id,
            extra: profileOnly,
          }),
        );
      }

      if (Object.keys(persistenceUpdates).length > 0) {
        await mockUpdateProfile(authUser.id, persistenceUpdates);
      }
    },
    [authUser, dispatch],
  );

  if (!profile) return null;

  return { profile, saveProfile };
}
