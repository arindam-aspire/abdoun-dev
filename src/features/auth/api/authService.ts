"use client";

import { enrichWithPhoneParts } from "@/lib/auth/enrichSessionUser";
import {
  setRefreshModeInActiveVault,
  persistAccessTokenToVault,
  persistTokensToVault,
  setAuthUsernameInActiveVault,
  setSubIdInActiveVault,
} from "@/lib/auth/adapters/vaultTokenStore";
import { authTokenWarn } from "@/lib/auth/authTokenLog";
import { normalizeAuthTokens } from "@/lib/auth/tokenValidation";
import { authApi, publicApi } from "@/lib/http/clients";

export type AuthTokens = {
  access_token: string;
  refresh_token?: string | null;
  id_token?: string | null;
  token_type: string;
  expires_in: number;
};

export type LoginWithPasswordApiData = AuthTokens & {
  requires_password_set?: boolean | null;
  remember_me_cookie?: boolean | null;
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  requires_password_set?: boolean | null;
  /** Presigned GET URL; short-lived — refresh via GET /auth/me. */
  profile_picture_url?: string | null;
  roles?: Array<{
    id?: string;
    name: string;
  }>;
};

export type SessionUserRole = "user" | "agent" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive?: boolean | null;
  isEmailVerified?: boolean | null;
  isPhoneVerified?: boolean | null;
  requiresPasswordSet?: boolean | null;
  role: SessionUserRole;
  /** Presigned GET from GET /auth/me — not persisted in cookies. */
  profilePictureUrl?: string | null;
};

export function toSessionUser(user: AuthUser): SessionUser {
  const roleNames = new Set(
    (user.roles ?? []).map((r) => r.name?.toLowerCase()).filter(Boolean),
  );

  const role: SessionUserRole = roleNames.has("admin")
    ? "admin"
    : roleNames.has("agent")
      ? "agent"
      : "user";
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    phone: user.phone_number || undefined,
    isActive: user.is_active,
    isEmailVerified: user.is_email_verified,
    isPhoneVerified: user.is_phone_verified,
    requiresPasswordSet: user.requires_password_set ?? null,
    role,
    profilePictureUrl: user.profile_picture_url ?? null,
  };
}

/** Re-export for callers that only need phone enrichment. */
export { enrichWithPhoneParts } from "@/lib/auth/enrichSessionUser";

/** Session user with countryDialCode and phoneNumber for profile store. Use when dispatching login after fetching current user. */
export function toSessionUserForProfile(user: AuthUser): SessionUser & { countryDialCode?: string; phoneNumber?: string } {
  return enrichWithPhoneParts(toSessionUser(user));
}

export type SignupPayload = {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
};

export type ConfirmSignupPayload = {
  email: string;
  code: string;
};

export type ResendConfirmationPayload = {
  email: string;
};

export type LoginWithPasswordPayload = {
  username: string;
  password: string;
  /** Sent to the API as `rememberMe` (boolean). */
  rememberMe?: boolean;
};

export type RefreshTokenPayload = {
  refresh_token?: string;
  username?: string;
};

export type ForgotPasswordRequestPayload = {
  email: string;
};

export type ForgotPasswordConfirmPayload = {
  email: string;
  code: string;
  new_password: string;
};

export type SetPasswordPayload = {
  password: string;
  previous_password?: string;
};

export type OtpRequestPayload = {
  username: string;
};

export type OtpVerifyPayload = {
  username: string;
  code: string;
  session: string;
};

export type PermissionsResponse = {
  permissions: string[];
};

type OtpRequestResponse = {
  session: string;
  otp?: string | null;
};

type OtpVerifyResponse = AuthTokens;

function decodeJwtSubject(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window !== "undefined"
        ? window.atob(base64)
        : Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(json) as { sub?: unknown };
    const sub = payload.sub;
    return typeof sub === "string" && sub.trim() ? sub.trim() : null;
  } catch {
    return null;
  }
}

export type PersistTokensOptions = {
  /**
   * When true, tokens and refresh metadata use localStorage and survive browser restart.
   * When false, sessionStorage is used (cleared when the browser session ends).
   * Defaults to false (matches typical “remember me” unchecked UX).
   */
  rememberMe?: boolean;
  cookieRefreshMode?: boolean;
};

/** Persist access/refresh tokens for the auth client (vault-aware). */
export function persistTokens(tokens: AuthTokens, options?: PersistTokensOptions): void {
  const accessToken = tokens.access_token;
  const refreshToken = tokens.refresh_token ?? null;
  if (!accessToken) {
    authTokenWarn("persistTokens:missing-wire-tokens", {
      hasAccess: !!accessToken,
      hasRefresh: !!refreshToken,
    });
    return;
  }
  const rememberMe = options?.rememberMe ?? false;
  const cookieRefreshMode = options?.cookieRefreshMode === true;
  if (!refreshToken) {
    // rememberMe=true may rely on backend refresh cookie and omit refresh_token.
    persistAccessTokenToVault(accessToken, rememberMe);
    setRefreshModeInActiveVault("cookie", rememberMe);
  } else {
    const pair = normalizeAuthTokens({ accessToken, refreshToken });
    if (!pair) {
      authTokenWarn("persistTokens:normalize-failed");
      return;
    }
    persistTokensToVault(pair, rememberMe);
    setRefreshModeInActiveVault(cookieRefreshMode ? "cookie" : "token", rememberMe);
  }

  const sub = decodeJwtSubject(accessToken);
  if (sub) {
    setSubIdInActiveVault(sub, rememberMe);
  }
}

/** Persist username for refresh-related API payloads (same vault as tokens). */
export function setAuthUsername(username: string, rememberMe?: boolean): void {
  if (typeof window === "undefined") return;
  const trimmed = username.trim();
  if (!trimmed) return;
  setAuthUsernameInActiveVault(trimmed, rememberMe ?? false);
}

export type LoginWithPasswordResult = {
  sessionUser: SessionUser;
  requiresPasswordSet: boolean;
};

/** Login with password, persist tokens and username, return session user + flags. */
export async function loginWithPasswordAndPersist(
  username: string,
  password: string,
  rememberMe = false,
): Promise<LoginWithPasswordResult> {
  const data = await loginWithPassword({
    username: username.trim(),
    password,
    rememberMe: rememberMe === true,
  });
  persistTokens(data, {
    rememberMe,
    cookieRefreshMode: data.remember_me_cookie === true && !data.refresh_token,
  });
  setAuthUsername(username.trim(), rememberMe);
  const me = await getCurrentUser();
  const sessionUser = toSessionUserForProfile(me);
  return {
    sessionUser,
    requiresPasswordSet: data.requires_password_set === true,
  };
}

// --- Public (no auth) endpoints ---

export async function signup(payload: SignupPayload): Promise<AuthUser> {
  const response = await publicApi.post<AuthUser>("/auth/signup", payload);
  return response.data;
}

export async function confirmSignup(
  payload: ConfirmSignupPayload,
): Promise<true> {
  const response = await publicApi.post<true>("/auth/confirm-signup", payload);
  return response.data;
}

export async function resendConfirmation(
  payload: ResendConfirmationPayload,
): Promise<true> {
  const response = await publicApi.post<true>(
    "/auth/resend-confirmation",
    payload,
  );
  return response.data;
}

export async function loginWithPassword(
  payload: LoginWithPasswordPayload,
): Promise<LoginWithPasswordApiData> {
  const response = await publicApi.post<LoginWithPasswordApiData>("/auth/login/password", {
    username: payload.username.trim(),
    password: payload.password,
    rememberMe: payload.rememberMe === true,
  });
  return response.data;
}

/** Exact `detail` from `POST /auth/login/password` when the account is not confirmed. */
export const PASSWORD_LOGIN_UNCONFIRMED_403_DETAIL =
  "User is not confirmed. Please verify your account using the confirmation code.";

function detailStringFromResponseData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail.trim();
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === "object" && "msg" in first) {
      const m = (first as { msg?: unknown }).msg;
      if (typeof m === "string") return m.trim();
    }
  }
  return null;
}

/** True when login failed with 403 because the user must confirm email (OTP flow). */
export function isPasswordLoginUnconfirmed403(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const response = (error as { response?: { status?: number; data?: unknown } }).response;
  if (!response || response.status !== 403) return false;
  const text = detailStringFromResponseData(response.data);
  if (!text) return false;
  return (
    text === PASSWORD_LOGIN_UNCONFIRMED_403_DETAIL ||
    (/not confirmed/i.test(text) &&
      /confirmation code|verify your account/i.test(text))
  );
}

export async function refreshToken(
  payload: RefreshTokenPayload,
): Promise<AuthTokens> {
  const response = await publicApi.post<AuthTokens>("/auth/refresh", payload);
  return response.data;
}

export async function requestForgotPassword(
  payload: ForgotPasswordRequestPayload,
): Promise<true> {
  const response = await publicApi.post<true>(
    "/auth/forgot-password/request",
    payload,
  );
  return response.data;
}

export async function confirmForgotPassword(
  payload: ForgotPasswordConfirmPayload,
): Promise<true> {
  const response = await publicApi.post<true>(
    "/auth/forgot-password/confirm",
    payload,
  );
  return response.data;
}

export async function setPasswordAfterLogin(
  payload: SetPasswordPayload,
): Promise<true> {
  const response = await authApi.post<true>("/auth/set-password", payload);
  return response.data;
}

export async function changePassword(
  payload: SetPasswordPayload,
): Promise<true> {
  const response = await authApi.post<true>("/auth/change-password", payload);
  return response.data;
}

export async function requestOtpLogin(
  payload: OtpRequestPayload,
): Promise<OtpRequestResponse> {
  const response = await publicApi.post<OtpRequestResponse>(
    "/auth/login/otp/request",
    payload,
  );
  return response.data;
}

export async function verifyOtpLogin(
  payload: OtpVerifyPayload,
): Promise<OtpVerifyResponse> {
  const response = await publicApi.post<OtpVerifyResponse>(
    "/auth/login/otp/verify",
    payload,
  );
  return response.data;
}

// --- Authenticated endpoints (require Bearer token) ---

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await authApi.get<AuthUser>("/auth/me");
  return response.data;
}

export async function getCurrentUserPermissions(): Promise<PermissionsResponse> {
  const response = await authApi.get<PermissionsResponse>("/auth/me/permissions");
  return response.data;
}

export async function logout(): Promise<true> {
  const response = await authApi.post<true>("/auth/logout");
  return response.data;
}

