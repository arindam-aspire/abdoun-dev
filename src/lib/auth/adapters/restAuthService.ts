import axios, { type AxiosInstance } from "axios";
import type { AuthService, AuthTokens } from "@/lib/auth/ports";

type RestAuthServiceOptions = {
  baseURL: string;
  refreshPath?: string;
  logoutPath?: string;
  client?: AxiosInstance;
};

type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  error?: string | null;
};

type RefreshResponse = {
  access_token: string;
  refresh_token?: string | null;
  id_token?: string | null;
  token_type?: string;
  expires_in?: number;
};

const AUTH_USERNAME_STORAGE_KEY = "authUsername";
const AUTH_SUBID_STORAGE_KEY = "subId";

export class RestAuthService implements AuthService {
  private readonly client: AxiosInstance;
  private readonly refreshPath: string;
  private readonly logoutPath: string;

  constructor(options: RestAuthServiceOptions) {
    this.client =
      options.client ??
      axios.create({
        baseURL: options.baseURL,
      });
    this.refreshPath = options.refreshPath ?? "/auth/refresh";
    this.logoutPath = options.logoutPath ?? "/auth/logout";
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const subId =
      typeof window !== "undefined"
        ? window.localStorage.getItem(AUTH_SUBID_STORAGE_KEY)
        : null;

    const response = await this.client.post<StandardApiResponse<RefreshResponse>>(
      this.refreshPath,
      {
        refresh_token: refreshToken,
        username: subId || undefined,
      },
    );

    return {
      accessToken: response.data.data.access_token,
      refreshToken: response.data.data.refresh_token ?? refreshToken,
    };
  }

  async logout(refreshToken: string | null): Promise<void> {
    await this.client.post(this.logoutPath, { refreshToken });
  }
}
