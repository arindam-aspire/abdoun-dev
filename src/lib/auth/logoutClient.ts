"use client";

import type { AppDispatch } from "@/store";
import { resetAppState } from "@/store";
import { clearAuthSession } from "@/lib/auth/sessionCookies";
import { logout as apiLogout } from "@/features/auth/api/auth.api";
import { clearAllVaultTokenStorage } from "@/lib/auth/adapters/vaultTokenStore";

export const SESSION_EXPIRED_MESSAGE_KEY = "auth:session-expired-message";
export const DEFAULT_SESSION_EXPIRED_MESSAGE = "Your session has expired. Please sign in again.";

/** Clears all token/session storage (local + session storage + cookies). */
function clearAllAuthStorage(): void {
  clearAllVaultTokenStorage();
  clearAuthSession();
}

/** Logs out on the server, clears all local tokens/session, and resets all user-related store state. */
export async function performClientLogout(
  dispatch: AppDispatch,
  _userId?: string,
): Promise<void> {
  try {
    await apiLogout();
  } catch {
    // Network/API issues should not block local logout.
  }

  clearAllAuthStorage();
  dispatch(resetAppState());
}

/**
 * Force logout without calling the logout API (e.g. when refresh returns "Invalid or expired token").
 * Clears all auth storage, resets Redux state, optionally stores message for login page toast, then redirects.
 */
export function forceLocalLogout(
  dispatch: AppDispatch,
  _userId?: string,
  message?: string,
  onRedirect?: () => void,
): void {
  clearAllAuthStorage();
  dispatch(resetAppState());

  if (typeof window !== "undefined") {
    const nextMessage =
      typeof message === "string" && message.trim()
        ? message.trim()
        : DEFAULT_SESSION_EXPIRED_MESSAGE;
    window.sessionStorage.setItem(SESSION_EXPIRED_MESSAGE_KEY, nextMessage);
  }

  onRedirect?.();
}

