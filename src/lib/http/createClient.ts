import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type RawAxiosRequestHeaders,
} from "axios";
import type { AuthTokens, AuthService, LogoutHandler, TokenStore } from "@/lib/auth/ports";
import { authTokenLog, authTokenWarn } from "@/lib/auth/authTokenLog";
import { normalizeAuthTokens, revalidateAuthTokens } from "@/lib/auth/tokenValidation";
import { isAuthHydrationComplete } from "@/lib/auth/authHydration";
import { resolveBearerAuthHeaders } from "@/lib/http/authHeader";
import { peelV1EnvelopeForAxios } from "@/lib/http/standardEnvelope";

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

const NOT_AUTHENTICATED_DETAIL = "Not authenticated";

/** 401, or 403 with the same auth semantics some backends use for stale/missing bearer tokens. */
function shouldAttemptTokenRefresh(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status === 401) return true;
  if (status === 403 && getResponseDetail(error) === NOT_AUTHENTICATED_DETAIL) return true;
  return false;
}

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

/** Network drop or server overload — one safe refresh retry is allowed. */
function isTransientRefreshFailure(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  const status = error.response.status;
  return status === 408 || status === 429 || status === 503 || status >= 500;
}

async function getValidatedTokensFromStore(tokenStore: TokenStore): Promise<AuthTokens | null> {
  const raw = await tokenStore.getTokens();
  const once = normalizeAuthTokens(raw);
  return revalidateAuthTokens(once);
}

async function getRefreshContext(tokenStore: TokenStore): Promise<{
  mode: "token" | "cookie";
  refreshToken: string | null;
}> {
  const refreshTokenRaw = await Promise.resolve(tokenStore.getRefreshToken());
  const refreshMode = await Promise.resolve(tokenStore.getRefreshMode());
  const refreshToken =
    typeof refreshTokenRaw === "string" && refreshTokenRaw.trim().length > 0
      ? refreshTokenRaw.trim()
      : null;
  if (refreshMode === "cookie") {
    return { mode: "cookie", refreshToken: null };
  }
  return { mode: refreshToken ? "token" : "cookie", refreshToken };
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
    withCredentials: true,
  });

  if (!options.withAuth) {
    client.interceptors.response.use((response) => {
      peelV1EnvelopeForAxios(response);
      return response;
    });
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
        const tokens = await getValidatedTokensFromStore(tokenStore);
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

    const bearer = await resolveBearerAuthHeaders(tokenStore);
    if ("Authorization" in bearer) {
      headers.set("Authorization", bearer.Authorization);
    } else if (typeof window !== "undefined" && isAuthHydrationComplete()) {
      const method = String(config.method ?? "get").toUpperCase();
      const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
      console.error("Access token missing before API request", { method, url });
    }

    config.headers = headers;
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      peelV1EnvelopeForAxios(response);
      return response;
    },
    async (error: AxiosError) => {
      if (!shouldAttemptTokenRefresh(error) || !error.config) {
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
              if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
              }
              originalRequest.headers = headers;
              resolve(client.request(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      let currentTokens: AuthTokens | null = null;
      try {
        currentTokens = await getValidatedTokensFromStore(tokenStore);
        const refreshCtx = await getRefreshContext(tokenStore);

        let nextTokens: AuthTokens;
        try {
          authTokenLog("http.refresh.attempt", { phase: "primary" });
          const first = await authService.refresh(refreshCtx.refreshToken);
          const accessToken = typeof first.accessToken === "string" ? first.accessToken.trim() : "";
          const refreshToken =
            typeof first.refreshToken === "string" ? first.refreshToken.trim() : "";
          if (!accessToken) {
            throw new Error("Refresh response missing valid tokens");
          }
          if (refreshToken) {
            nextTokens = { accessToken, refreshToken };
            await tokenStore.setTokens(nextTokens);
            await tokenStore.setRefreshMode("token");
          } else {
            await tokenStore.setAccessToken(accessToken);
            await tokenStore.setRefreshMode("cookie");
            nextTokens = {
              accessToken,
              refreshToken: refreshCtx.refreshToken ?? currentTokens?.refreshToken ?? "",
            };
          }
        } catch (firstErr) {
          if (isTransientRefreshFailure(firstErr)) {
            authTokenLog("http.refresh.attempt", { phase: "retry-transient" });
            const second = await authService.refresh(refreshCtx.refreshToken);
            const accessToken = typeof second.accessToken === "string" ? second.accessToken.trim() : "";
            const refreshToken =
              typeof second.refreshToken === "string" ? second.refreshToken.trim() : "";
            if (!accessToken) {
              throw new Error("Refresh retry returned invalid tokens");
            }
            if (refreshToken) {
              nextTokens = { accessToken, refreshToken };
              await tokenStore.setTokens(nextTokens);
              await tokenStore.setRefreshMode("token");
            } else {
              await tokenStore.setAccessToken(accessToken);
              await tokenStore.setRefreshMode("cookie");
              nextTokens = {
                accessToken,
                refreshToken: refreshCtx.refreshToken ?? currentTokens?.refreshToken ?? "",
              };
            }
          } else {
            throw firstErr;
          }
        }

        flushQueue(null, nextTokens.accessToken);

        const headers = AxiosHeaders.from(originalRequest.headers);
        const postRefresh = await resolveBearerAuthHeaders(tokenStore);
        if ("Authorization" in postRefresh) {
          headers.set("Authorization", postRefresh.Authorization);
        }
        originalRequest.headers = headers;

        return client.request(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);
        const message =
          getResponseDetail(refreshError) ??
          (refreshError instanceof Error ? refreshError.message : "Session expired");
        if (isInvalidOrExpiredToken(refreshError)) {
          const rechecked = await getValidatedTokensFromStore(tokenStore);
          const priorRefresh = currentTokens?.refreshToken ?? null;
          authTokenLog("http.refresh.recheck-storage", {
            changedRefresh:
              !!rechecked?.refreshToken && !!priorRefresh && rechecked.refreshToken !== priorRefresh,
          });
          if (rechecked?.refreshToken && priorRefresh && rechecked.refreshToken !== priorRefresh) {
            try {
              authTokenLog("http.refresh.attempt", { phase: "recheck-different-refresh" });
              const recovered = await authService.refresh(rechecked.refreshToken);
              const normRec = revalidateAuthTokens(normalizeAuthTokens(recovered));
              if (normRec) {
                await tokenStore.setTokens(normRec);
                flushQueue(null, normRec.accessToken);
                const headers = AxiosHeaders.from(originalRequest.headers);
                const postRecheck = await resolveBearerAuthHeaders(tokenStore);
                if ("Authorization" in postRecheck) {
                  headers.set("Authorization", postRecheck.Authorization);
                }
                originalRequest.headers = headers;
                return client.request(originalRequest);
              }
            } catch (recheckErr) {
              authTokenWarn("http.refresh.recheck-retry-failed", {
                detail: getResponseDetail(recheckErr),
              });
            }
          }
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
