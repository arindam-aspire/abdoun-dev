/**
 * Single abstraction for reading/writing auth session (cookies + token store).
 * Guards and header use this instead of raw cookie/token access.
 */
import type { AuthUser } from "@/features/auth/authSlice";
import { LocalStorageTokenStore } from "@/lib/auth/adapters/localStorageTokenStore";
import {
  clearAuthSession,
  persistAuthSession,
  readAuthSessionFromBrowser,
} from "@/lib/auth/sessionCookies";

const tokenStore = new LocalStorageTokenStore();

export type Session = {
  user: AuthUser;
  role: AuthUser["role"];
  tokens: { accessToken: string; refreshToken: string } | null;
};

/**
 * Returns current session from cookies and token store, or null if not authenticated.
 */
export function getCurrentSession(): Session | null {
  const user = readAuthSessionFromBrowser();
  if (!user) return null;
  const tokens = tokenStore.getTokens();
  return {
    user,
    role: user.role,
    tokens,
  };
}

/**
 * Persists user to cookies and optionally tokens to storage.
 */
export function persistSession(session: {
  user: AuthUser;
  tokens?: { accessToken: string; refreshToken: string } | null;
}): void {
  persistAuthSession(session.user);
  if (session.tokens) {
    tokenStore.setTokens(session.tokens);
  }
}

/**
 * Clears session cookies and token store.
 */
export function clearSession(): void {
  clearAuthSession();
  tokenStore.clearTokens();
}

/**
 * Returns tokens from storage only (no cookie read). Use when hydrating from tokens.
 */
export function getStoredTokens(): { accessToken: string; refreshToken: string } | null {
  return tokenStore.getTokens();
}
