"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { setProfileExtra } from "@/features/profile/profileSlice";
import { enrichWithPhoneParts } from "@/lib/auth/enrichSessionUser";
import { persistSession } from "@/lib/auth/sessionManager";
import { selectCurrentUser } from "@/store/selectors";
import {
  requestProfileUpdate,
  getCurrentUser,
  toSessionUserForProfile,
} from "@/features/profile/api/profile.api";
import type { AuthUser } from "@/features/auth/authSlice";
import type { ProfileData } from "@/types/auth";

/**
 * Profile save: PATCH /auth/me/profile/request when name/phone/email change;
 * refresh session from GET /auth/me when the server applies changes without OTP.
 */
export function useUpdateProfile(): {
  updateProfile: (updates: Partial<ProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
} {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectCurrentUser);

  const refreshProfile = useCallback(async () => {
    if (!authUser) return;
    const updated = await getCurrentUser();
    const sessionUser = enrichWithPhoneParts(toSessionUserForProfile(updated));
    persistSession({ user: sessionUser });
    dispatch(login(sessionUser));
  }, [authUser, dispatch]);

  const updateProfile = useCallback(
    async (updates: Partial<ProfileData>) => {
      if (!authUser) return;

      const requestPayload: {
        full_name?: string;
        phone_number?: string;
        email?: string;
      } = {};
      if (updates.fullName !== undefined) requestPayload.full_name = updates.fullName;
      if (updates.phone !== undefined) requestPayload.phone_number = updates.phone;
      if (updates.email !== undefined) requestPayload.email = updates.email;

      let sessionUser: AuthUser & { countryDialCode?: string; phoneNumber?: string } = authUser;

      if (Object.keys(requestPayload).length > 0) {
        const result = await requestProfileUpdate(requestPayload);
        if (result.requires_verification) {
          throw new Error(
            result.message ||
              "Verification required for email or phone. Complete OTP verification first.",
          );
        }
        const updated = await getCurrentUser();
        sessionUser = enrichWithPhoneParts(toSessionUserForProfile(updated));
        persistSession({ user: sessionUser });
        dispatch(login(sessionUser));
      }

      if (updates.role !== undefined) {
        const role =
          (updates.role.charAt(0).toUpperCase() + updates.role.slice(1)) as ProfileData["role"];
        sessionUser = enrichWithPhoneParts({ ...sessionUser, role });
        persistSession({ user: sessionUser });
        dispatch(login(sessionUser));
      }

      const profileOnly: Partial<{
        avatarUrl: string;
        displayName: string;
      }> = {};
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

  return { updateProfile, refreshProfile };
}
