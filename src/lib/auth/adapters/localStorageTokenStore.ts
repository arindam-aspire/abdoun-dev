import type { AuthTokens, TokenStore } from "@/lib/auth/ports";

type LocalStorageTokenStoreOptions = {
  accessTokenKey?: string;
  refreshTokenKey?: string;
};

export class LocalStorageTokenStore implements TokenStore {
  private readonly accessTokenKey: string;
  private readonly refreshTokenKey: string;
  private readonly refreshModeKey = "authRefreshMode";

  constructor(options: LocalStorageTokenStoreOptions = {}) {
    this.accessTokenKey = options.accessTokenKey ?? "accessToken";
    this.refreshTokenKey = options.refreshTokenKey ?? "refreshToken";
  }

  getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    const accessToken = window.localStorage.getItem(this.accessTokenKey);
    const trimmed = typeof accessToken === "string" ? accessToken.trim() : "";
    return trimmed || null;
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    const refreshToken = window.localStorage.getItem(this.refreshTokenKey);
    const trimmed = typeof refreshToken === "string" ? refreshToken.trim() : "";
    return trimmed || null;
  }

  getRefreshMode(): "token" | "cookie" | null {
    if (typeof window === "undefined") return null;
    const mode = window.localStorage.getItem(this.refreshModeKey);
    return mode === "token" || mode === "cookie" ? mode : null;
  }

  getTokens(): AuthTokens | null {
    if (typeof window === "undefined") {
      return null;
    }

    const accessToken = window.localStorage.getItem(this.accessTokenKey);
    const refreshToken = window.localStorage.getItem(this.refreshTokenKey);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  setTokens(tokens: AuthTokens): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(this.accessTokenKey, tokens.accessToken);
    window.localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    window.localStorage.setItem(this.refreshModeKey, "token");
  }

  setAccessToken(accessToken: string): void {
    if (typeof window === "undefined") return;
    const trimmed = accessToken.trim();
    if (!trimmed) return;
    window.localStorage.setItem(this.accessTokenKey, trimmed);
  }

  setRefreshMode(mode: "token" | "cookie"): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.refreshModeKey, mode);
  }

  clearTokens(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(this.accessTokenKey);
    window.localStorage.removeItem(this.refreshTokenKey);
    window.localStorage.removeItem(this.refreshModeKey);
  }
}
