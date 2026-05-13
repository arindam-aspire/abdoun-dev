import type { AuthTokens, TokenStore } from "@/lib/auth/ports";
import { authTokenLog, authTokenWarn, logTokenPairMeta } from "@/lib/auth/authTokenLog";
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
    return "session";
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
 * Session vault = tab/browser session; local vault = survives restart when marker is set.
 *
 * Resolution rules (single source of truth for interceptors + session):
 * - If persistence marker is on **and** local has a full pair → **local** (remember-me).
 * - If **both** storages have a full pair → **session** (active tab session wins over stale local).
 * - Otherwise prefer whichever storage has a full pair.
 * - Repairs orphan `abdoun_persist_refresh_tokens` marker when session is canonical without local
 *   tokens, or when no tokens exist anywhere.
 */
export function resolveTokenVault(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): VaultKind | null {
  if (typeof window === "undefined") return null;

  const markerRaw = window.localStorage.getItem(AUTH_TOKEN_PERSIST_MARKER_KEY);
  const markerOn = markerRaw === "1";
  const localPair = readPair(window.localStorage, accessTokenKey, refreshTokenKey);
  const sessionPair = readPair(window.sessionStorage, accessTokenKey, refreshTokenKey);
  const localAccess = readAccessToken(window.localStorage, accessTokenKey);
  const sessionAccess = readAccessToken(window.sessionStorage, accessTokenKey);

  // Remember-me cookie mode may have access token only (refresh is server HttpOnly cookie).
  if (markerOn && localAccess) {
    return "local";
  }

  if (sessionPair) {
    return "session";
  }
  if (localPair) {
    return "local";
  }
  if (sessionAccess) {
    return "session";
  }
  if (localAccess) {
    return "local";
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

/** Cookie max-age should mirror persistent vault (not session vault). */
export function isPersistentTokenVault(
  accessTokenKey = DEFAULT_ACCESS_KEY,
  refreshTokenKey = DEFAULT_REFRESH_KEY,
): boolean {
  return resolveTokenVault(accessTokenKey, refreshTokenKey) === "local";
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
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(AUTH_REFRESH_MODE_KEY, mode);
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
 * Writes tokens for password / OTP login. Clears the opposite vault.
 * @param rememberMe - When true, tokens survive browser restart (localStorage + marker).
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
      window.sessionStorage.setItem(accessTokenKey, normalized.accessToken);
      window.sessionStorage.setItem(refreshTokenKey, normalized.refreshToken);
      window.sessionStorage.setItem(AUTH_REFRESH_MODE_KEY, "token");
    }
  } catch (e) {
    authTokenWarn("vault.persist:storage-write-failed", {
      rememberMe,
      name: e instanceof Error ? e.name : "unknown",
    });
    throw e;
  }

  authTokenLog("vault.persist:write", { rememberMe, vault: rememberMe ? "local" : "session" });
  const vault = rememberMe ? "local" : "session";
  const storage = vault === "local" ? window.localStorage : window.sessionStorage;
  const verify = revalidateAuthTokens(normalizeAuthTokens(readPair(storage, accessTokenKey, refreshTokenKey)));
  if (!verify || verify.accessToken !== normalized.accessToken || verify.refreshToken !== normalized.refreshToken) {
    authTokenWarn("vault.persist:read-after-write-mismatch", { vault });
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
      window.sessionStorage.setItem(accessTokenKey, normalizedAccess);
      window.sessionStorage.setItem(AUTH_REFRESH_MODE_KEY, "cookie");
    }
  } catch (e) {
    authTokenWarn("vault.persist-access-only:storage-write-failed", {
      rememberMe,
      name: e instanceof Error ? e.name : "unknown",
    });
    throw e;
  }

  authTokenLog("vault.persist-access-only:write", {
    rememberMe,
    vault: rememberMe ? "local" : "session",
  });
}

export function setSubIdInActiveVault(subId: string, rememberMe: boolean): void {
  if (typeof window === "undefined") return;
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem("subId", subId);
}

export function setAuthUsernameInActiveVault(username: string, rememberMe: boolean): void {
  if (typeof window === "undefined") return;
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem("authUsername", username.trim());
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

    const markerOn = window.localStorage.getItem(AUTH_TOKEN_PERSIST_MARKER_KEY) === "1";
    const localAccess = window.localStorage.getItem(this.accessTokenKey)?.trim() ?? "";
    const sessionAccess = window.sessionStorage.getItem(this.accessTokenKey)?.trim() ?? "";

    // Access-token reads for Authorization header should not depend on refresh token presence.
    if (markerOn && localAccess) return localAccess;
    if (sessionAccess) return sessionAccess;
    if (localAccess) return localAccess;
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
      persistTokensToVault(normalized, true, this.accessTokenKey, this.refreshTokenKey);
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
    const vault = resolveTokenVault(this.accessTokenKey, this.refreshTokenKey);
    const storage =
      vault === "session"
        ? window.sessionStorage
        : vault === "local"
          ? window.localStorage
          : window.localStorage;
    storage.setItem(this.accessTokenKey, trimmed);
  }

  setRefreshMode(mode: RefreshMode): void {
    if (typeof window === "undefined") return;
    const vault = resolveTokenVault(this.accessTokenKey, this.refreshTokenKey);
    if (vault === "session") {
      window.sessionStorage.setItem(AUTH_REFRESH_MODE_KEY, mode);
      return;
    }
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
