export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export interface TokenStore {
  getTokens(): AuthTokens | null | Promise<AuthTokens | null>;
  /** Access token for `Authorization: Bearer …` — must match `getTokens()` source of truth. */
  getAccessToken(): string | null | Promise<string | null>;
  getRefreshToken(): string | null | Promise<string | null>;
  getRefreshMode(): "token" | "cookie" | null | Promise<"token" | "cookie" | null>;
  setAccessToken(accessToken: string): void | Promise<void>;
  setRefreshMode(mode: "token" | "cookie"): void | Promise<void>;
  setTokens(tokens: AuthTokens): void | Promise<void>;
  clearTokens(): void | Promise<void>;
}

export interface AuthService {
  refresh(refreshToken?: string | null): Promise<AuthTokens>;
  logout(refreshToken: string | null): Promise<void>;
}

export interface LogoutHandler {
  handleLogout(): void | Promise<void>;
}
