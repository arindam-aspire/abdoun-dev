import axios, { type AxiosInstance } from "axios";
import type { AuthService, AuthTokens } from "@/lib/auth/ports";

type RestAuthServiceOptions = {
  baseURL: string;
  refreshPath?: string;
  logoutPath?: string;
  client?: AxiosInstance;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

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
    const response = await this.client.post<RefreshResponse>(this.refreshPath, {
      refreshToken,
    });

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  }

  async logout(refreshToken: string | null): Promise<void> {
    await this.client.post(this.logoutPath, { refreshToken });
  }
}
