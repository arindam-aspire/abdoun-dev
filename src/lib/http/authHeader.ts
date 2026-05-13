import { getVaultPlacementDiagnostics } from "@/lib/auth/adapters/vaultTokenStore";
import { authTokenWarn } from "@/lib/auth/authTokenLog";
import type { TokenStore } from "@/lib/auth/ports";
import { isAuthTokenWarningEnabled } from "@/lib/auth/tokenValidation";

/**
 * Bearer header object for authenticated requests. Empty when no access token.
 * Always use the shared `TokenStore` (vault) — not legacy storage or Redux.
 */
export async function resolveBearerAuthHeaders(
  tokenStore: TokenStore,
): Promise<{ Authorization: string } | Record<string, never>> {
  const token = await Promise.resolve(tokenStore.getAccessToken());
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  if (typeof window !== "undefined" && isAuthTokenWarningEnabled()) {
    const d = getVaultPlacementDiagnostics();
    if (d.hasLocalPair === true || d.hasSessionPair === true) {
      authTokenWarn("bearer.missing-despite-storage-pair", d);
    }
  }
  return {};
}