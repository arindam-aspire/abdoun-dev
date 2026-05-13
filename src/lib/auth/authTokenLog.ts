import { isAuthTokenVerboseLoggingEnabled, isAuthTokenWarningEnabled } from "@/lib/auth/tokenValidation";

function tokenFingerprint(token: string): { length: number; tail: string } {
  const length = token.length;
  const tail = length <= 8 ? "(short)" : `…${token.slice(-6)}`;
  return { length, tail };
}

/**
 * Debug / audit trail for token lifecycle. Enable in production with
 * `NEXT_PUBLIC_AUTH_TOKEN_LOG=1`. In development, verbose logs are on by default.
 */
export function authTokenLog(
  event: string,
  data?: Record<string, unknown>,
): void {
  if (!isAuthTokenVerboseLoggingEnabled()) return;
  try {
    console.debug(`[abdoun:auth:tokens] ${event}`, {
      ...data,
      t: new Date().toISOString(),
    });
  } catch {
    /* ignore */
  }
}

/** Warnings for invalid storage, failed writes, or refresh failures. */
export function authTokenWarn(event: string, data?: Record<string, unknown>): void {
  if (!isAuthTokenWarningEnabled()) return;
  try {
    console.warn(`[abdoun:auth:tokens] ${event}`, {
      ...data,
      t: new Date().toISOString(),
    });
  } catch {
    /* ignore */
  }
}

export function logTokenPairMeta(
  prefix: string,
  tokens: { accessToken: string; refreshToken: string } | null,
): void {
  if (!tokens) {
    authTokenLog(`${prefix}:none`);
    return;
  }
  authTokenLog(prefix, {
    access: tokenFingerprint(tokens.accessToken),
    refresh: tokenFingerprint(tokens.refreshToken),
  });
}
