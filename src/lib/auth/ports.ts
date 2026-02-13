export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export interface TokenStore {
  getTokens(): AuthTokens | null | Promise<AuthTokens | null>;
  setTokens(tokens: AuthTokens): void | Promise<void>;
  clearTokens(): void | Promise<void>;
}

export interface AuthService {
  refresh(refreshToken: string): Promise<AuthTokens>;
  logout(refreshToken: string | null): Promise<void>;
}

export interface LogoutHandler {
  handleLogout(): void | Promise<void>;
}
