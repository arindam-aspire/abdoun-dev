import type { AuthTokens } from "@/lib/auth/ports";

/** Verbose token lifecycle logs (reads/writes/refresh). Enable with `NEXT_PUBLIC_AUTH_TOKEN_LOG=1`. */
export function isAuthTokenVerboseLoggingEnabled(): boolean {
  return typeof process !== "undefined" && process.env.NEXT_PUBLIC_AUTH_TOKEN_LOG === "1";
}

/** Warnings (corrupt storage, failed writes) — on in development or when verbose flag is set. */
export function isAuthTokenWarningEnabled(): boolean {
  return (
    isAuthTokenVerboseLoggingEnabled() ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "development")
  );
}

/** Non-empty trimmed access + refresh pair, or null if unusable. */
export function normalizeAuthTokens(tokens: AuthTokens | null): AuthTokens | null {
  if (!tokens || typeof tokens !== "object") return null;
  const accessToken =
    typeof tokens.accessToken === "string" ? tokens.accessToken.trim() : "";
  const refreshToken =
    typeof tokens.refreshToken === "string" ? tokens.refreshToken.trim() : "";
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

/** Typical JWT shape (three base64url segments); opaque tokens may fail this and are still valid. */
export function looksLikeJwt(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function decodeBase64UrlPayloadSegment(segment: string): string | null {
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    if (typeof window !== "undefined") {
      return window.atob(padded);
    }
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Returns JWT `exp` (seconds since epoch) when payload is readable; otherwise null.
 * Does not verify signature — only structure for client-side expiry hints.
 */
export function readJwtExpSeconds(token: string): number | null {
  if (!looksLikeJwt(token)) return null;
  try {
    const payloadPart = token.split(".")[1];
    const json = decodeBase64UrlPayloadSegment(payloadPart);
    if (json == null) return null;
    const payload = JSON.parse(json) as { exp?: unknown };
    const exp = payload.exp;
    return typeof exp === "number" && Number.isFinite(exp) ? exp : null;
  } catch {
    return null;
  }
}

/**
 * When the access token is a JWT with `exp`, returns true if expired (with skew).
 * Opaque tokens or JWTs without `exp` return false (caller relies on 401 + refresh).
 */
export function isJwtAccessTokenLikelyExpired(
  accessToken: string,
  clockSkewSeconds = 60,
): boolean {
  const exp = readJwtExpSeconds(accessToken);
  if (exp == null) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + clockSkewSeconds;
}

/** Re-validate an already-normalized pair (second layer). */
export function revalidateAuthTokens(tokens: AuthTokens | null): AuthTokens | null {
  return normalizeAuthTokens(normalizeAuthTokens(tokens));
}
