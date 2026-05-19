/**
 * Client-side auth bootstrap after vault reconcile. Separates:
 * - Sync token read (remember-me + session vault via localStorage)
 * - Async profile enrichment (GET /auth/me) only when vault tokens exist
 */
import type { AppDispatch } from "@/store";
import { login } from "@/features/auth/authSlice";
import { enrichWithPhoneParts } from "@/lib/auth/enrichSessionUser";
import {
  clearSession,
  getCurrentSession,
  getStoredTokens,
  persistSession,
  type Session,
} from "@/lib/auth/sessionManager";
import { toSessionUserForProfile } from "@/features/auth/api/auth.api";
import { getCurrentUserDeduped } from "@/lib/auth/currentUserRequest";

export type AuthBootstrapResult =
  /** Vault/cookies ready — unblock authenticated HTTP clients immediately. */
  | { kind: "ready" }
  /** Profile cookies exist but vault is empty — restore UI from cookies only. */
  | { kind: "needs_refresh" };

/**
 * Returns how soon authenticated API traffic may proceed. Call after
 * `reconcileAuthStorageOnLoad()` + `purgeOrphanedEphemeralTokens()`.
 */
export function resolveAuthBootstrapPhase(
  hasReduxUser: boolean,
): AuthBootstrapResult {
  if (hasReduxUser) {
    return { kind: "ready" };
  }

  const session = getCurrentSession();
  const tokens = getStoredTokens();

  if (!session?.user && !tokens) {
    return { kind: "ready" };
  }

  if (tokens) {
    return { kind: "ready" };
  }

  if (session?.user) {
    return { kind: "needs_refresh" };
  }

  return { kind: "ready" };
}

async function enrichProfileFromSession(
  dispatch: AppDispatch,
  session: Session,
  onForceChangePassword: () => void,
): Promise<void> {
  const tokens = session.tokens ?? getStoredTokens();
  if (!tokens) return;

  try {
    const me = await getCurrentUserDeduped();
    if (me.requires_password_set) {
      clearSession();
      onForceChangePassword();
      return;
    }
    const sessionUser = toSessionUserForProfile(me);
    persistSession({ user: sessionUser });
    dispatch(login(sessionUser));
  } catch {
    dispatch(login(enrichWithPhoneParts(session.user)));
  }
}

async function enrichProfileFromTokensOnly(
  dispatch: AppDispatch,
  onForceChangePassword: () => void,
): Promise<void> {
  try {
    const me = await getCurrentUserDeduped();
    if (me.requires_password_set) {
      clearSession();
      onForceChangePassword();
      return;
    }
    const sessionUser = toSessionUserForProfile(me);
    persistSession({ user: sessionUser });
    dispatch(login(sessionUser));
  } catch {
    clearSession();
  }
}

/** Fire-and-forget profile hydration when vault tokens exist (GET /auth/me only). */
export function startAuthProfileEnrichment(
  dispatch: AppDispatch,
  onForceChangePassword: () => void,
): void {
  if (!getStoredTokens()) return;

  const session = getCurrentSession();
  if (session?.user) {
    void enrichProfileFromSession(dispatch, session, onForceChangePassword);
    return;
  }
  void enrichProfileFromTokensOnly(dispatch, onForceChangePassword);
}

/** Profile cookies without vault tokens — restore Redux from cookies only, no auth API. */
export function restoreSessionFromCookiesOnly(dispatch: AppDispatch): void {
  const session = getCurrentSession();
  if (!session?.user) return;
  dispatch(login(enrichWithPhoneParts(session.user)));
}
