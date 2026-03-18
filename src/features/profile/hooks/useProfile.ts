"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { getProfileFromAuth, type ProfileData } from "@/types/auth";
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";

export interface UseProfileResult {
  profile: ProfileData;
  saveProfile: (updates: Partial<ProfileData>) => Promise<void>;
}

const DEFAULT_LOCATION = "Dubai, UAE";

/**
 * Current profile data from slice (auth-derived + extras) and save handler.
 * Save is delegated to useUpdateProfile; same API and behavior.
 */
export function useProfile(): UseProfileResult | null {
  const authUser = useAppSelector(selectCurrentUser);
  const { updateProfile } = useUpdateProfile();

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

  if (!profile) return null;

  return { profile, saveProfile: updateProfile };
}
