/**
 * Profile feature API module. Wraps user/profile endpoints with same contracts.
 * No API contract changes.
 */
import {
  updateUser as updateUserService,
  getUserById,
  type UpdateUserPayload,
  type UserManagementUser,
} from "@/services/userService";
import { getCurrentUser, toSessionUserForProfile } from "@/features/auth/api/auth.api";

export type { UpdateUserPayload, UserManagementUser };

/**
 * Update current user profile (PATCH /users/:id). Same payload and response as userService.
 */
export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<UserManagementUser> {
  return updateUserService(userId, payload);
}

/**
 * Fetch user by id (GET /users/:id).
 */
export async function getProfileUser(userId: string): Promise<UserManagementUser> {
  return getUserById(userId);
}

/**
 * Fetch current user and return session shape for profile (GET /auth/me).
 */
export { getCurrentUser, toSessionUserForProfile };
