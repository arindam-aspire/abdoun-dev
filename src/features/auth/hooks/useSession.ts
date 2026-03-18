"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { selectCurrentUser } from "@/store/selectors";
import { getCurrentSession } from "@/lib/auth/sessionManager";
import { enrichWithPhoneParts } from "@/lib/auth/enrichSessionUser";
import type { AuthUser } from "@/features/auth/authSlice";

export type UseSessionResult = {
  /** Current user from Redux (after hydration) or from session. */
  user: (AuthUser & { countryDialCode?: string; phoneNumber?: string }) | null;
  /** Current role (user?.role or session?.role). */
  role: AuthUser["role"] | null;
};

/**
 * Single source for current auth session. Hydrates Redux from cookies/token store
 * when session exists and Redux is empty or stale. Use in guards and header.
 */
export function useSession(): UseSessionResult {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const session = getCurrentSession();

  useEffect(() => {
    if (!session?.user) return;
    if (user?.id === session.user.id) return;
    dispatch(login(enrichWithPhoneParts(session.user)));
  }, [dispatch, session?.user, user?.id]);

  const effectiveUser =
    user ?? (session?.user ? enrichWithPhoneParts(session.user) : null);
  const role = effectiveUser?.role ?? session?.role ?? null;

  return { user: effectiveUser, role };
}
