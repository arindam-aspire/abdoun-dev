import axios, { type AxiosInstance } from "axios";
import type { AuthService, AuthTokens } from "@/lib/auth/ports";
import { peelV1EnvelopePayload } from "@/lib/http/standardEnvelope";
import { isPersistentTokenVault } from "@/lib/auth/adapters/vaultTokenStore";
import { readAuthSessionFromBrowser } from "@/lib/auth/sessionCookies";

/**
 * Resolves the username for the `/auth/refresh` payload.
 *
 * Primary source: `localStorage["authUsername"]` (written by `setAuthUsername` at login).
 * Fallback: the email stored in the `abdoun_user` session cookie (written by
 * `persistAuthSession` at login). The fallback covers legacy sessions created before
 * `setAuthUsername` was wired into the login path, and any case where aux keys were
 * cleared independently of the tokens.
 */
function resolveRefreshUsername(): string {
  if (typeof window === "undefined") return "";

  const fromVault = (window.localStorage.getItem("authUsername") ?? "").trim();
  if (fromVault) return fromVault;

  const fromCookie = readAuthSessionFromBrowser()?.email?.trim();
  return fromCookie ?? "";
}

type RestAuthServiceOptions = {
  baseURL: string;
  refreshPath?: string;
  logoutPath?: string;
  client?: AxiosInstance;
};

type RefreshResponse = {
  access_token: string;
  refresh_token?: string | null;
  id_token?: string | null;
  token_type?: string;
  expires_in?: number;
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
        withCredentials: true,
      });
    this.refreshPath = options.refreshPath ?? "/auth/refresh";
    this.logoutPath = options.logoutPath ?? "/auth/logout";
  }

  async refresh(refreshToken?: string | null): Promise<AuthTokens> {
    const username = resolveRefreshUsername();
    const rememberMe = typeof window !== "undefined" ? isPersistentTokenVault() : false;
    const hasRefreshToken = Boolean(refreshToken && refreshToken.trim().length > 0);

    const payload = rememberMe
      ? {
          username,
        }
      : hasRefreshToken
        ? {
            refresh_token: refreshToken,
            username,
          }
        : {
            username,
          };
    const response = await this.client.post<unknown>(this.refreshPath, payload);

    const peeled = peelV1EnvelopePayload(response.data) as RefreshResponse;

    return {
      accessToken: peeled.access_token,
      refreshToken: peeled.refresh_token ?? refreshToken ?? "",
    };
  }

  async logout(refreshToken: string | null): Promise<void> {
    await this.client.post(this.logoutPath, { refreshToken });
  }
}
