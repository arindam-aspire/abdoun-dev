"use client";

import type { AxiosInstance, RawAxiosRequestHeaders } from "axios";

export { getApiErrorMessage } from "./apiError";
import { BrowserLogoutHandler } from "@/lib/auth/adapters/browserLogoutHandler";
import { LocalStorageTokenStore } from "@/lib/auth/adapters/localStorageTokenStore";
import { RestAuthService } from "@/lib/auth/adapters/restAuthService";
import { createClient } from "@/lib/http/createClient";

type CreateHttpClientsOptions = {
  baseURL?: string;
  defaultHeaders?: RawAxiosRequestHeaders;
  loginPath?: string;
  accessTokenKey?: string;
  refreshTokenKey?: string;
  refreshPath?: string;
  logoutPath?: string;
};

export type HttpClients = {
  publicApi: AxiosInstance;
  authApi: AxiosInstance;
};

export const createHttpClients = (
  options: CreateHttpClientsOptions = {},
): HttpClients => {
  const baseURL = options.baseURL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const tokenStore = new LocalStorageTokenStore({
    accessTokenKey: options.accessTokenKey,
    refreshTokenKey: options.refreshTokenKey,
  });

  const authService = new RestAuthService({
    baseURL,
    refreshPath: options.refreshPath,
    logoutPath: options.logoutPath,
  });

  const logoutHandler = new BrowserLogoutHandler({
    loginPath: options.loginPath ?? "",
  });

  const publicApi = createClient({
    baseURL,
    withAuth: false,
    defaultHeaders: options.defaultHeaders,
  });

  const authApi = createClient({
    baseURL,
    withAuth: true,
    tokenStore,
    authService,
    logoutHandler,
    defaultHeaders: options.defaultHeaders,
  });

  return { publicApi, authApi };
};
