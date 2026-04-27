"use client";

import { useCallback } from "react";
import { isAxiosError } from "axios";
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
import {
  dataUrlToProfileFile,
  deleteProfilePicture,
  uploadProfilePicture,
} from "@/features/profile/api/profilePicture.api";
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
      if (updates.fullName !== undefined) {
        const next = updates.fullName.trim();
        if (next !== (authUser.name ?? "").trim()) {
          requestPayload.full_name = next;
        }
      }
      if (updates.phone !== undefined) {
        const next = updates.phone.trim();
        if (next !== (authUser.phone ?? "").trim()) {
          requestPayload.phone_number = next;
        }
      }
      if (updates.email !== undefined) {
        const next = updates.email.trim();
        if (next !== (authUser.email ?? "").trim()) {
          requestPayload.email = next;
        }
      }

      let sessionUser: AuthUser & {
        countryDialCode?: string;
        phoneNumber?: string;
        profilePictureUrl?: string | null;
      } = authUser;

      // Photo first: avoids PATCH /profile/request (400) on "unchanged" name when only the image changed;
      // also ensures the file reaches S3 before name/email flows that may require OTP.
      if (updates.avatarUrl !== undefined) {
        const raw = updates.avatarUrl;
        if (raw === "") {
          try {
            await deleteProfilePicture();
          } catch (e) {
            if (!isAxiosError(e) || (e.response?.status !== 404 && e.response?.status !== 405)) {
              throw e;
            }
          }
        } else if (raw.startsWith("data:")) {
          const file = await dataUrlToProfileFile(raw);
          await uploadProfilePicture(file);
        } else {
          // Legacy or unknown string — still sync from /me
        }
        const updated = await getCurrentUser();
        sessionUser = enrichWithPhoneParts(toSessionUserForProfile(updated));
        persistSession({ user: sessionUser });
        dispatch(login(sessionUser));
      }

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

      if (updates.displayName !== undefined) {
        dispatch(
          setProfileExtra({
            userId: authUser.id,
            extra: { displayName: updates.displayName },
          }),
        );
      }
    },
    [authUser, dispatch],
  );

  return { updateProfile, refreshProfile };
}
