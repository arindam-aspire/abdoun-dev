import type { RootState } from "@/store";
import type { ProfileUser } from "@/features/profile/profileSlice";

/** Current logged-in user from profile slice (single source of truth for user data in store). */
export function selectCurrentUser(state: RootState): ProfileUser | null {
  const userId = state.auth.userId;
  if (!userId || state.profile.userId !== userId) return null;
  const details = state.profile.userDetails;
  return details.id ? details : null;
}
