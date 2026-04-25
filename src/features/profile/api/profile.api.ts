/**
 * Profile feature API module. Wraps user/profile and self-service profile update endpoints.
 */
import { createHttpClients } from "@/lib/http";
import {
  updateUser as updateUserService,
  getUserById,
  type StandardApiResponse,
  type UpdateUserPayload,
  type UserManagementUser,
} from "@/services/userService";
import { getCurrentUser, toSessionUserForProfile } from "@/features/auth/api/auth.api";

export type { UpdateUserPayload, UserManagementUser };

const { authApi } = createHttpClients();

const unwrap = <T,>(body: StandardApiResponse<T>): T => body.data;

export type ProfileUpdateRequestPayload = {
  full_name?: string;
  email?: string;
  phone_number?: string;
};

export type ProfileUpdateRequestData = {
  message: string;
  requires_verification: boolean;
  verification_fields: string[];
  dev_phone_otp: string | null;
};

/**
 * PATCH /auth/me/profile/request — start profile change; OTP may be required for email/phone.
 */
export async function requestProfileUpdate(
  payload: ProfileUpdateRequestPayload,
): Promise<ProfileUpdateRequestData> {
  const response = await authApi.patch<StandardApiResponse<ProfileUpdateRequestData>>(
    "/auth/me/profile/request",
    payload,
  );
  return unwrap(response.data);
}

export type ProfileUpdateVerifyPayload = {
  email?: string;
  email_otp?: string;
  phone_number?: string;
  phone_otp?: string;
};

/**
 * POST /auth/me/profile/verify — complete profile change with OTP(s).
 */
export async function verifyProfileUpdate(
  payload: ProfileUpdateVerifyPayload,
): Promise<{ message: string }> {
  const response = await authApi.post<StandardApiResponse<{ message: string }>>(
    "/auth/me/profile/verify",
    payload,
  );
  return unwrap(response.data);
}

/**
 * Update another user (admin) — PATCH /users/:id.
 */
export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<UserManagementUser> {
  return updateUserService(userId, payload);
}

/** Fetch user by id (GET /users/:id). */
export async function getProfileUser(userId: string): Promise<UserManagementUser> {
  return getUserById(userId);
}

/**
 * Fetch current user and return session shape for profile (GET /auth/me).
 */
export { getCurrentUser, toSessionUserForProfile };
