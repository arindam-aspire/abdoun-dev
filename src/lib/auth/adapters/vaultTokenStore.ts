import type { AuthTokens, TokenStore } from "@/lib/auth/ports";
import { authTokenLog, authTokenWarn, logTokenPairMeta } from "@/lib/auth/authTokenLog";
import { readAuthSessionFromBrowser } from "@/lib/auth/sessionCookies";
import {
  isAuthTokenVerboseLoggingEnabled,
  isJwtAccessTokenLikelyExpired,
  looksLikeJwt,
  normalizeAuthTokens,
  revalidateAuthTokens,
} from "@/lib/auth/tokenValidation";

/** When set to "1", refresh/access tokens live in localStorage (survives browser restart). */
export const AUTH_TOKEN_PERSIST_MARKER_KEY = "abdoun_persist_refresh_tokens";
export const AUTH_REFRESH_MODE_KEY = "abdoun_auth_refresh_mode";

const DEFAULT_ACCESS_KEY = "accessToken";
const DEFAULT_REFRESH_KEY = "refreshToken";

export type VaultKind = "local" | "session";

/** Tokens in localStorage without this marker are shared across tabs but cleared after browser restart. */
function isPersistMarkerOn(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_TOKEN_PERSIST_MARKER_KEY) === "1";
}

/**
 * sessionStorage is per-tab (not per browser session). Move legacy tab-scoped tokens into
 * localStorage so new tabs and target="_blank" links keep Bearer auth.
 */
function migrateLegacySessionVaultToLocal(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): void {
  if (typeof window === "undefined") return;

  const sessionPair = readPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
  const sessionAccess = readAccessToken(window.sessionStorage, accessTokenKey);
  if (!sessionPair && !sessionAccess) return;

  const localPair = readPair(window.localStorage, accessTokenKey, refreshTokenKey);
  const localAccess = readAccessToken(window.localStorage, accessTokenKey);

  if (isPersistMarkerOn() && (localPair || localAccess)) {
    clearPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
    clearAuxKeys(window.sessionStorage);
    return;
  }

  if (localPair || localAccess) {
    clearPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
    clearAuxKeys(window.sessionStorage);
    return;
  }

  if (sessionPair) {
    window.localStorage.setItem(accessTokenKey, sessionPair.accessToken);
    window.localStorage.setItem(refreshTokenKey, sessionPair.refreshToken);
  } else if (sessionAccess) {
    window.localStorage.setItem(accessTokenKey, sessionAccess);
  }

  const sessionMode = window.sessionStorage.getItem(AUTH_REFRESH_MODE_KEY);
  if (sessionMode === "token" || sessionMode === "cookie") {
    window.localStorage.setItem(AUTH_REFRESH_MODE_KEY, sessionMode);
  }
  const sessionSub = window.sessionStorage.getItem("subId");
  if (sessionSub) window.localStorage.setItem("subId", sessionSub);
  const sessionUsername = window.sessionStorage.getItem("authUsername");
  if (sessionUsername) window.localStorage.setItem("authUsername", sessionUsername);

  clearPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
  clearAuxKeys(window.sessionStorage);
  authTokenLog("vault.migrate:session-to-local");
}

/**
 * Drop non-persistent tokens left over after the browser session ended (cookies cleared).
 * Call only once on app startup — not during token reads (would race with login before cookies exist).
 */
export function purgeOrphanedEphemeralTokens(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): void {
  if (typeof window === "undefined") return;
  if (isPersistMarkerOn() || readAuthSessionFromBrowser()) return;

  const hasLocal =
    readPair(window.localStorage, accessTokenKey, refreshTokenKey) != null ||
    readAccessToken(window.localStorage, accessTokenKey) != null;
  if (!hasLocal) return;

  clearPair(window.localStorage, accessTokenKey, refreshTokenKey);
  clearAuxKeys(window.localStorage);
  authTokenLog("vault.purge:orphan-ephemeral-tokens");
}

/** Migrate legacy per-tab sessionStorage tokens (safe to call during token reads). */
export function reconcileAuthStorageOnLoad(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): void {
  migrateLegacySessionVaultToLocal(accessTokenKey, refreshTokenKey);
}

function readPair(
  storage: Storage,
  accessKey: string,
  refreshKey: string,
): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const accessToken = storage.getItem(accessKey);
  const refreshToken = storage.getItem(refreshKey);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

function readAccessToken(storage: Storage, accessKey: string): string | null {
  if (typeof window === "undefined") return null;
  const accessToken = storage.getItem(accessKey);
  if (!accessToken) return null;
  const normalized = accessToken.trim();
  return normalized.length > 0 ? normalized : null;
}

function clearPair(storage: Storage, accessKey: string, refreshKey: string): void {
  storage.removeItem(accessKey);
  storage.removeItem(refreshKey);
}

function clearAuxKeys(storage: Storage): void {
  storage.removeItem("subId");
  storage.removeItem("authUsername");
  storage.removeItem(AUTH_REFRESH_MODE_KEY);
}

/**
 * Pure vault choice from marker + stored pairs (no side effects). Used by `resolveTokenVault`,
 * diagnostics, and unit tests.
 */
export function peekTokenVaultFromPairs(
  markerRaw: string | null,
  localPair: AuthTokens | null,
  sessionPair: AuthTokens | null,
): VaultKind | null {
  const markerOn = markerRaw === "1";
  if (markerOn && localPair) {
    return "local";
  }
  if (localPair && sessionPair) {
    return "local";
  }
  if (sessionPair) {
    return "session";
  }
  if (localPair) {
    return "local";
  }
  return null;
}

/**
 * Where access/refresh tokens should be read from.
 * All new logins store tokens in localStorage (shared across tabs). The persist marker alone
 * controls whether tokens survive a full browser restart (remember-me).
 *
 * Resolution rules:
 * - Migrate legacy per-tab sessionStorage tokens into localStorage first.
 * - Prefer localStorage when it holds tokens (persistent or ephemeral).
 * - sessionStorage is only used for unmigrated legacy data.
 */
export function resolveTokenVault(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): VaultKind | null {
  if (typeof window === "undefined") return null;

  reconcileAuthStorageOnLoad(accessTokenKey, refreshTokenKey);

  const markerOn = isPersistMarkerOn();
  const localPair = readPair(window.localStorage, accessTokenKey, refreshTokenKey);
  const sessionPair = readPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
  const localAccess = readAccessToken(window.localStorage, accessTokenKey);
  const sessionAccess = readAccessToken(window.sessionStorage, accessTokenKey);

  if (markerOn && localAccess) {
    return "local";
  }

  if (localPair || localAccess) {
    return "local";
  }
  if (sessionPair) {
    return "session";
  }
  if (sessionAccess) {
    return "session";
  }

  if (markerOn) {
    window.localStorage.removeItem(AUTH_TOKEN_PERSIST_MARKER_KEY);
  }
  return null;
}

/** Safe diagnostics for logs (no raw tokens; does not mutate storage). */
export function getVaultPlacementDiagnostics(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): Record<string, unknown> {
  if (typeof window === "undefined") {
    return { context: "no-window" };
  }
  const markerRaw = window.localStorage.getItem(AUTH_TOKEN_PERSIST_MARKER_KEY);
  const localPair = readPair(window.localStorage, accessTokenKey, refreshTokenKey);
  const sessionPair = readPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
  const localAccess = readAccessToken(window.localStorage, accessTokenKey);
  const sessionAccess = readAccessToken(window.sessionStorage, accessTokenKey);
  return {
    marker: markerRaw,
    hasLocalPair: localPair != null,
    hasSessionPair: sessionPair != null,
    hasLocalAccess: localAccess != null,
    hasSessionAccess: sessionAccess != null,
    peekVault: peekTokenVaultFromPairs(markerRaw, localPair, sessionPair),
    resolvedVault: resolveTokenVault(accessTokenKey, refreshTokenKey),
  };
}

/** Verbose / dev: log vault marker + which storages hold keys (no raw token values). */
export function logVaultTokenPlacement(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): void {
  if (!isAuthTokenVerboseLoggingEnabled() || typeof window === "undefined") return;
  authTokenLog("vault.placement", getVaultPlacementDiagnostics(accessTokenKey, refreshTokenKey));
}

/** True when remember-me is active (tokens + profile cookies survive browser restart). */
export function isPersistentTokenVault(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): boolean {
  void accessTokenKey;
  void refreshTokenKey;
  return isPersistMarkerOn();
}

export function getSubIdFromActiveVault(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): string | null {
  if (typeof window === "undefined") return null;
  const vault = resolveTokenVault(accessTokenKey, refreshTokenKey);
  if (vault === "session") {
    return window.sessionStorage.getItem("subId");
  }
  if (vault === "local") {
    return window.localStorage.getItem("subId");
  }
  return (
    window.sessionStorage.getItem("subId") ??
    window.localStorage.getItem("subId") ??
    null
  );
}

export type RefreshMode = "token" | "cookie";

export function setRefreshModeInActiveVault(mode: RefreshMode, rememberMe: boolean): void {
  if (typeof window === "undefined") return;
  void rememberMe;
  window.localStorage.setItem(AUTH_REFRESH_MODE_KEY, mode);
}

export function getRefreshModeFromActiveVault(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): RefreshMode | null {
  if (typeof window === "undefined") return null;
  const vault = resolveTokenVault(accessTokenKey, refreshTokenKey);
  if (vault === "session") {
    const mode = window.sessionStorage.getItem(AUTH_REFRESH_MODE_KEY);
    return mode === "token" || mode === "cookie" ? mode : null;
  }
  if (vault === "local") {
    const mode = window.localStorage.getItem(AUTH_REFRESH_MODE_KEY);
    return mode === "token" || mode === "cookie" ? mode : null;
  }
  const fromSession = window.sessionStorage.getItem(AUTH_REFRESH_MODE_KEY);
  if (fromSession === "token" || fromSession === "cookie") return fromSession;
  const fromLocal = window.localStorage.getItem(AUTH_REFRESH_MODE_KEY);
  if (fromLocal === "token" || fromLocal === "cookie") return fromLocal;
  return null;
}

/**
 * Writes tokens for password / OTP login.
 * @param rememberMe - When true, sets the persist marker so tokens survive browser restart.
 *   When false, tokens still use localStorage (shared across tabs) but are purged on next
 *   load if session cookies are gone.
 */
export function persistTokensToVault(
  tokens: AuthTokens,
  rememberMe: boolean,
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): void {
  if (typeof window === "undefined") return;

  const normalized = revalidateAuthTokens(normalizeAuthTokens(tokens));
  if (!normalized) {
    authTokenWarn("vault.persist:reject-invalid-input");
    return;
  }

  clearPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
  clearPair(window.localStorage, accessTokenKey, refreshTokenKey);
  clearAuxKeys(window.sessionStorage);
  clearAuxKeys(window.localStorage);

  try {
    if (rememberMe) {
      window.localStorage.setItem(AUTH_TOKEN_PERSIST_MARKER_KEY, "1");
      window.localStorage.setItem(accessTokenKey, normalized.accessToken);
      window.localStorage.setItem(refreshTokenKey, normalized.refreshToken);
      window.localStorage.setItem(AUTH_REFRESH_MODE_KEY, "token");
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_PERSIST_MARKER_KEY);
      window.localStorage.setItem(accessTokenKey, normalized.accessToken);
      window.localStorage.setItem(refreshTokenKey, normalized.refreshToken);
      window.localStorage.setItem(AUTH_REFRESH_MODE_KEY, "token");
    }
  } catch (e) {
    authTokenWarn("vault.persist:storage-write-failed", {
      rememberMe,
      name: e instanceof Error ? e.name : "unknown",
    });
    throw e;
  }

  authTokenLog("vault.persist:write", { rememberMe, vault: "local" });
  const storage = window.localStorage;
  const verify = revalidateAuthTokens(normalizeAuthTokens(readPair(storage, accessTokenKey, refreshTokenKey)));
  if (!verify || verify.accessToken !== normalized.accessToken || verify.refreshToken !== normalized.refreshToken) {
    authTokenWarn("vault.persist:read-after-write-mismatch", { vault: "local" });
  }
}

/**
 * Stores access token even when refresh token is absent (e.g. remember-me cookie based refresh).
 * This keeps Authorization header injection working while refresh may be handled server-side.
 */
export function persistAccessTokenToVault(
  accessToken: string,
  rememberMe: boolean,
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): void {
  if (typeof window === "undefined") return;
  const normalizedAccess = accessToken.trim();
  if (!normalizedAccess) {
    authTokenWarn("vault.persist-access-only:empty-access");
    return;
  }

  clearPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
  clearPair(window.localStorage, accessTokenKey, refreshTokenKey);
  clearAuxKeys(window.sessionStorage);
  clearAuxKeys(window.localStorage);

  try {
    if (rememberMe) {
      window.localStorage.setItem(AUTH_TOKEN_PERSIST_MARKER_KEY, "1");
      window.localStorage.setItem(accessTokenKey, normalizedAccess);
      window.localStorage.setItem(AUTH_REFRESH_MODE_KEY, "cookie");
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_PERSIST_MARKER_KEY);
      window.localStorage.setItem(accessTokenKey, normalizedAccess);
      window.localStorage.setItem(AUTH_REFRESH_MODE_KEY, "cookie");
    }
  } catch (e) {
    authTokenWarn("vault.persist-access-only:storage-write-failed", {
      rememberMe,
      name: e instanceof Error ? e.name : "unknown",
    });
    throw e;
  }

  authTokenLog("vault.persist-access-only:write", { rememberMe, vault: "local" });
}

export function setSubIdInActiveVault(subId: string, rememberMe: boolean): void {
  if (typeof window === "undefined") return;
  void rememberMe;
  window.localStorage.setItem("subId", subId);
}

export function setAuthUsernameInActiveVault(username: string, rememberMe: boolean): void {
  if (typeof window === "undefined") return;
  void rememberMe;
  window.localStorage.setItem("authUsername", username.trim());
}

/** Clears marker, both storages' token + aux keys. */
export function clearAllVaultTokenStorage(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): void {
  if (typeof window === "undefined") return;
  authTokenLog("vault.clear-all");
  window.localStorage.removeItem(AUTH_TOKEN_PERSIST_MARKER_KEY);
  clearPair(window.localStorage, accessTokenKey, refreshTokenKey);
  clearPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
  clearAuxKeys(window.localStorage);
  clearAuxKeys(window.sessionStorage);
}

export class VaultTokenStore implements TokenStore {
  private readonly accessTokenKey: string;
  private readonly refreshTokenKey: string;

  constructor(options?: { accessTokenKey?: string; refreshTokenKey?: string }) {
    this.accessTokenKey = options?.accessTokenKey ?? DEFAULT_ACCESS_KEY;
    this.refreshTokenKey = options?.refreshTokenKey ?? DEFAULT_REFRESH_KEY;
  }

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    reconcileAuthStorageOnLoad(this.accessTokenKey, this.refreshTokenKey);

    const localAccess = window.localStorage.getItem(this.accessTokenKey)?.trim() ?? "";
    const sessionAccess = window.sessionStorage.getItem(this.accessTokenKey)?.trim() ?? "";

    if (localAccess) return localAccess;
    if (sessionAccess) return sessionAccess;
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    const vault = resolveTokenVault(this.accessTokenKey, this.refreshTokenKey);
    if (!vault) return null;
    const storage = vault === "local" ? window.localStorage : window.sessionStorage;
    const refreshToken = storage.getItem(this.refreshTokenKey)?.trim() ?? "";
    return refreshToken || null;
  }

  getRefreshMode(): RefreshMode | null {
    return getRefreshModeFromActiveVault(this.accessTokenKey, this.refreshTokenKey);
  }

  getTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null;

    const vault = resolveTokenVault(this.accessTokenKey, this.refreshTokenKey);
    if (!vault) {
      authTokenLog("vault.get", { vault: null });
      return null;
    }

    const storage = vault === "local" ? window.localStorage : window.sessionStorage;
    const raw = readPair(storage, this.accessTokenKey, this.refreshTokenKey);
    if (!raw) {
      authTokenLog("vault.get", { vault, pair: null });
      return null;
    }

    const once = normalizeAuthTokens(raw);
    if (!once) {
      authTokenWarn("vault.get:corrupt-pair-cleared", { vault });
      clearPair(storage, this.accessTokenKey, this.refreshTokenKey);
      return null;
    }

    const twice = revalidateAuthTokens(once);
    if (!twice) {
      authTokenWarn("vault.get:revalidate-failed", { vault });
      return null;
    }

    if (looksLikeJwt(twice.accessToken) && isJwtAccessTokenLikelyExpired(twice.accessToken)) {
      authTokenLog("vault.get:access-jwt-likely-expired", { vault });
    }

    logTokenPairMeta("vault.get:ok", twice);
    return twice;
  }

  setTokens(tokens: AuthTokens): void {
    if (typeof window === "undefined") return;

    const normalized = revalidateAuthTokens(normalizeAuthTokens(tokens));
    if (!normalized) {
      authTokenWarn("vault.set:reject-invalid");
      return;
    }

    const vault = resolveTokenVault(this.accessTokenKey, this.refreshTokenKey);
    if (!vault) {
      persistTokensToVault(normalized, isPersistMarkerOn(), this.accessTokenKey, this.refreshTokenKey);
      return;
    }

    const storage = vault === "local" ? window.localStorage : window.sessionStorage;
    try {
      storage.setItem(this.accessTokenKey, normalized.accessToken);
      storage.setItem(this.refreshTokenKey, normalized.refreshToken);
    } catch (e) {
      authTokenWarn("vault.set:storage-write-failed", {
        vault,
        name: e instanceof Error ? e.name : "unknown",
      });
      throw e;
    }

    authTokenLog("vault.set:write", { vault });
    const verify = revalidateAuthTokens(
      normalizeAuthTokens(readPair(storage, this.accessTokenKey, this.refreshTokenKey)),
    );
    if (
      !verify ||
      verify.accessToken !== normalized.accessToken ||
      verify.refreshToken !== normalized.refreshToken
    ) {
      authTokenWarn("vault.set:read-after-write-mismatch", { vault });
    }
  }

  setAccessToken(accessToken: string): void {
    if (typeof window === "undefined") return;
    const trimmed = accessToken.trim();
    if (!trimmed) return;
    window.localStorage.setItem(this.accessTokenKey, trimmed);
  }

  setRefreshMode(mode: RefreshMode): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_REFRESH_MODE_KEY, mode);
  }

  clearTokens(): void {
    clearAllVaultTokenStorage(this.accessTokenKey, this.refreshTokenKey);
  }
}

/**
 * Default token vault for the browser app. Single instance shared by `authApi` interceptors
 * (Authorization header) and `sessionManager` so token reads/writes stay aligned.
 */
export const browserVaultTokenStore = new VaultTokenStore();
