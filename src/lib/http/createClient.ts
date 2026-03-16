import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type RawAxiosRequestHeaders,
} from "axios";
import type { AuthService, LogoutHandler, TokenStore } from "@/lib/auth/ports";

type ResolveHeaders = (
  config: InternalAxiosRequestConfig,
) =>
  | RawAxiosRequestHeaders
  | undefined
  | Promise<RawAxiosRequestHeaders | undefined>;

type BaseCreateClientOptions = {
  baseURL: string;
  defaultHeaders?: RawAxiosRequestHeaders;
  resolveHeaders?: ResolveHeaders;
};

type AuthClientOptions = BaseCreateClientOptions & {
  withAuth: true;
  tokenStore: TokenStore;
  authService: AuthService;
  logoutHandler: LogoutHandler;
};

type PublicClientOptions = BaseCreateClientOptions & {
  withAuth?: false;
};

type CreateClientOptions = AuthClientOptions | PublicClientOptions;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueueItem = {
  resolve: (accessToken: string) => void;
  reject: (error: unknown) => void;
};

const appendHeaders = (
  target: AxiosHeaders,
  headers?: RawAxiosRequestHeaders,
): void => {
  if (!headers) {
    return;
  }

  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      target.set(key, value);
    }
  });
};

const isUnauthorized = (error: AxiosError): boolean =>
  error.response?.status === 401;

const SESSION_EXPIRED_MESSAGE = "Invalid or expired token";

function getResponseDetail(error: unknown): string | undefined {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return undefined;
}

function isInvalidOrExpiredToken(error: unknown): boolean {
  const detail = getResponseDetail(error);
  return detail === SESSION_EXPIRED_MESSAGE || detail?.includes(SESSION_EXPIRED_MESSAGE) === true;
}

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired" as const;

export type AuthSessionExpiredDetail = { message: string };

function runForceLocalLogout(tokenStore: TokenStore, message: string): void {
  if (typeof window === "undefined") return;
  void tokenStore.clearTokens();
  window.dispatchEvent(
    new CustomEvent<AuthSessionExpiredDetail>(AUTH_SESSION_EXPIRED_EVENT, {
      detail: { message },
    }),
  );
}

export const createClient = (options: CreateClientOptions): AxiosInstance => {
  const client = axios.create({
    baseURL: options.baseURL,
    headers: options.defaultHeaders,
  });

  if (!options.withAuth) {
    if (options.resolveHeaders) {
      client.interceptors.request.use(async (config) => {
        const headers = AxiosHeaders.from(config.headers);
        appendHeaders(headers, await options.resolveHeaders?.(config));
        config.headers = headers;
        return config;
      });
    }
    return client;
  }

  const { authService, logoutHandler, tokenStore } = options;
  let isRefreshing = false;
  let queue: QueueItem[] = [];
  let isHandlingLogout = false;

  const flushQueue = (error: unknown, accessToken?: string): void => {
    queue.forEach((item) => {
      if (error) {
        item.reject(error);
        return;
      }
      item.resolve(accessToken ?? "");
    });
    queue = [];
  };

  const runLogoutFlow = async (cause: unknown): Promise<never> => {
    if (!isHandlingLogout) {
      isHandlingLogout = true;
      try {
        const tokens = await tokenStore.getTokens();
        try {
          await authService.logout(tokens?.refreshToken ?? null);
        } catch {
          // Logout should not block local cleanup.
        }
        await tokenStore.clearTokens();
        await logoutHandler.handleLogout();
      } finally {
        isHandlingLogout = false;
      }
    }

    throw cause;
  };

  client.interceptors.request.use(async (config) => {
    const headers = AxiosHeaders.from(config.headers);

    appendHeaders(headers, await options.resolveHeaders?.(config));

    const tokens = await tokenStore.getTokens();
    if (tokens?.accessToken) {
      headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    }

    config.headers = headers;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (!isUnauthorized(error) || !error.config) {
        throw error;
      }

      const originalRequest = error.config as RetryableRequestConfig;
      if (originalRequest._retry) {
        return runLogoutFlow(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (accessToken) => {
              const headers = AxiosHeaders.from(originalRequest.headers);
              headers.set("Authorization", `Bearer ${accessToken}`);
              originalRequest.headers = headers;
              resolve(client.request(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentTokens = await tokenStore.getTokens();
        if (!currentTokens?.refreshToken) {
          throw error;
        }

        const nextTokens = await authService.refresh(currentTokens.refreshToken);
        await tokenStore.setTokens(nextTokens);
        flushQueue(null, nextTokens.accessToken);

        const headers = AxiosHeaders.from(originalRequest.headers);
        headers.set("Authorization", `Bearer ${nextTokens.accessToken}`);
        originalRequest.headers = headers;

        return client.request(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);
        const message =
          getResponseDetail(refreshError) ?? (refreshError instanceof Error ? refreshError.message : "Session expired");
        if (isInvalidOrExpiredToken(refreshError)) {
          runForceLocalLogout(tokenStore, message);
          throw refreshError;
        }
        return runLogoutFlow(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return client;
};
