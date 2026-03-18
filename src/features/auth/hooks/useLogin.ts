"use client";

import { useCallback } from "react";
import { useAppDispatch } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { persistSession } from "@/lib/auth/sessionManager";
import { loginWithPasswordAndPersist } from "@/features/auth/api/auth.api";
import type { AuthUser } from "@/features/auth/authSlice";

export type LoginWithPasswordResult = {
  sessionUser: AuthUser & { countryDialCode?: string; phoneNumber?: string };
  requiresPasswordSet: boolean;
};

/**
 * Encapsulates auth API and session/Redux updates. Caller handles redirects and UI.
 * Use persistSessionAndLogin(user) after loginAndPersist when you have the final
 * session user (e.g. with role override for agent/admin).
 */
export function useLogin(): {
  /** Calls API, persists tokens; returns sessionUser and requiresPasswordSet. */
  loginAndPersist: (
    username: string,
    password: string,
  ) => Promise<LoginWithPasswordResult>;
  /** Persists user to session (cookies) and dispatches login. */
  persistSessionAndLogin: (
    user: AuthUser & { countryDialCode?: string; phoneNumber?: string },
  ) => void;
} {
  const dispatch = useAppDispatch();

  const loginAndPersist = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<LoginWithPasswordResult> => {
      return loginWithPasswordAndPersist(username.trim(), password);
    },
    [],
  );

  const persistSessionAndLogin = useCallback(
    (user: AuthUser & { countryDialCode?: string; phoneNumber?: string }) => {
      persistSession({ user });
      dispatch(login(user));
    },
    [dispatch],
  );

  return { loginAndPersist, persistSessionAndLogin };
}
