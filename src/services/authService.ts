"use client";

import { enrichWithPhoneParts } from "@/lib/auth/enrichSessionUser";
import { LocalStorageTokenStore } from "@/lib/auth/adapters/localStorageTokenStore";
import { createHttpClients } from "@/lib/http";

type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  error?: string | null;
};

export type AuthTokens = {
  access_token: string;
  refresh_token?: string | null;
  id_token?: string | null;
  token_type: string;
  expires_in: number;
};

export type LoginWithPasswordApiData = AuthTokens & {
  requires_password_set?: boolean | null;
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
};

export type RefreshTokenPayload = {
  refresh_token: string;
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
  previous_password: string;
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
};

type OtpVerifyResponse = AuthTokens;

const AUTH_USERNAME_STORAGE_KEY = "authUsername";
const tokenStore = new LocalStorageTokenStore();
const { publicApi, authApi } = createHttpClients();

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

/** Persist access/refresh tokens to localStorage (for refresh and auth API). */
export function persistTokens(tokens: AuthTokens): void {
  const accessToken = tokens.access_token;
  const refreshToken = tokens.refresh_token ?? null;
  if (!accessToken || !refreshToken) return;
  tokenStore.setTokens({ accessToken, refreshToken });

  // Additionally store subId derived from the access token without changing other keys.
  if (typeof window !== "undefined") {
    const sub = decodeJwtSubject(accessToken);
    if (sub) {
      window.localStorage.setItem("subId", sub);
    }
  }
}

/** Persist username for refresh token requests. */
export function setAuthUsername(username: string): void {
  if (typeof window === "undefined") return;
  const trimmed = username.trim();
  if (!trimmed) return;
  window.localStorage.setItem(AUTH_USERNAME_STORAGE_KEY, trimmed);
}

export type LoginWithPasswordResult = {
  sessionUser: SessionUser;
  requiresPasswordSet: boolean;
};

/** Login with password, persist tokens and username, return session user + flags. */
export async function loginWithPasswordAndPersist(
  username: string,
  password: string,
): Promise<LoginWithPasswordResult> {
  const data = await loginWithPassword({
    username: username.trim(),
    password,
  });
  persistTokens(data);
  setAuthUsername(username.trim());
  const me = await getCurrentUser();
  const sessionUser = toSessionUserForProfile(me);
  return {
    sessionUser,
    requiresPasswordSet: data.requires_password_set === true,
  };
}

const unwrap = <T,>(response: StandardApiResponse<T>): T => response.data;

// --- Public (no auth) endpoints ---

export async function signup(payload: SignupPayload): Promise<AuthUser> {
  const response = await publicApi.post<StandardApiResponse<AuthUser>>(
    "/auth/signup",
    payload,
  );
  return unwrap(response.data);
}

export async function confirmSignup(
  payload: ConfirmSignupPayload,
): Promise<true> {
  const response = await publicApi.post<StandardApiResponse<true>>(
    "/auth/confirm-signup",
    payload,
  );
  return unwrap(response.data);
}

export async function resendConfirmation(
  payload: ResendConfirmationPayload,
): Promise<true> {
  const response = await publicApi.post<StandardApiResponse<true>>(
    "/auth/resend-confirmation",
    payload,
  );
  return unwrap(response.data);
}

export async function loginWithPassword(
  payload: LoginWithPasswordPayload,
): Promise<LoginWithPasswordApiData> {
  const response = await publicApi.post<StandardApiResponse<LoginWithPasswordApiData>>(
    "/auth/login/password",
    payload,
  );
  return unwrap(response.data);
}

export async function refreshToken(
  payload: RefreshTokenPayload,
): Promise<AuthTokens> {
  const response = await publicApi.post<StandardApiResponse<AuthTokens>>(
    "/auth/refresh",
    payload,
  );
  return unwrap(response.data);
}

export async function requestForgotPassword(
  payload: ForgotPasswordRequestPayload,
): Promise<true> {
  const response = await publicApi.post<StandardApiResponse<true>>(
    "/auth/forgot-password/request",
    payload,
  );
  return unwrap(response.data);
}

export async function confirmForgotPassword(
  payload: ForgotPasswordConfirmPayload,
): Promise<true> {
  const response = await publicApi.post<StandardApiResponse<true>>(
    "/auth/forgot-password/confirm",
    payload,
  );
  return unwrap(response.data);
}

export async function setPasswordAfterLogin(
  payload: SetPasswordPayload,
): Promise<true> {
  const response = await authApi.post<StandardApiResponse<true>>(
    "/auth/set-password",
    payload,
  );
  return unwrap(response.data);
}

export async function requestOtpLogin(
  payload: OtpRequestPayload,
): Promise<OtpRequestResponse> {
  const response = await publicApi.post<
    StandardApiResponse<OtpRequestResponse>
  >("/auth/login/otp/request", payload);
  return unwrap(response.data);
}

export async function verifyOtpLogin(
  payload: OtpVerifyPayload,
): Promise<OtpVerifyResponse> {
  const response = await publicApi.post<StandardApiResponse<OtpVerifyResponse>>(
    "/auth/login/otp/verify",
    payload,
  );
  return unwrap(response.data);
}

// --- Authenticated endpoints (require Bearer token) ---

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await authApi.get<StandardApiResponse<AuthUser>>("/auth/me");
  return unwrap(response.data);
}

export async function getCurrentUserPermissions(): Promise<PermissionsResponse> {
  const response = await authApi.get<
    StandardApiResponse<PermissionsResponse>
  >("/auth/me/permissions");
  return unwrap(response.data);
}

export async function logout(): Promise<true> {
  const response = await authApi.post<StandardApiResponse<true>>("/auth/logout");
  return unwrap(response.data);
}

