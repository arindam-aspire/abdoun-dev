import type { AuthTokens, TokenStore } from "@/lib/auth/ports";

type LocalStorageTokenStoreOptions = {
  accessTokenKey?: string;
  refreshTokenKey?: string;
};

export class LocalStorageTokenStore implements TokenStore {
  private readonly accessTokenKey: string;
  private readonly refreshTokenKey: string;

  constructor(options: LocalStorageTokenStoreOptions = {}) {
    this.accessTokenKey = options.accessTokenKey ?? "accessToken";
    this.refreshTokenKey = options.refreshTokenKey ?? "refreshToken";
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
  }

  clearTokens(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(this.accessTokenKey);
    window.localStorage.removeItem(this.refreshTokenKey);
  }
}
