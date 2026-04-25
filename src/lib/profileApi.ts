/**
 * Profile identity helpers: self-service PATCH / verify via auth profile endpoints.
 * Resend OTP = same PATCH again with the same pending email or phone_number (optional full_name).
 */

import { parsePhoneNumberFromString } from "libphonenumber-js";
import { isAxiosError } from "axios";
import { getApiErrorMessage } from "@/lib/http";
import {
  requestProfileUpdate,
  verifyProfileUpdate,
} from "@/features/profile/api/profile.api";

/** Optional fields to repeat on resend so the server keeps the same pending change shape. */
export type ProfileRequestExtras = {
  full_name?: string;
};

function buildRequestPayload(
  base: { email?: string; phone_number?: string },
  extras?: ProfileRequestExtras,
): { email?: string; phone_number?: string; full_name?: string } {
  const full_name = extras?.full_name?.trim();
  return {
    ...base,
    ...(full_name ? { full_name } : {}),
  };
}

export type ProfileChallengeRequestResult = {
  success: true;
  message: string;
  dev_phone_otp?: string | null;
  requires_verification: boolean;
  verification_fields: string[];
};

export async function requestEmailChange(
  email: string,
  extras?: ProfileRequestExtras,
): Promise<ProfileChallengeRequestResult> {
  const data = await requestProfileUpdate(buildRequestPayload({ email }, extras));
  return {
    success: true,
    message: data.message,
    dev_phone_otp: data.dev_phone_otp,
    requires_verification: data.requires_verification,
    verification_fields: data.verification_fields ?? [],
  };
}

export async function verifyEmail(params: {
  email: string;
  emailOtp: string;
}): Promise<{ success: true }> {
  await verifyProfileUpdate({
    email: params.email,
    email_otp: params.emailOtp,
  });
  return { success: true };
}

export async function requestPhoneOtp(
  phone: string,
  extras?: ProfileRequestExtras,
): Promise<ProfileChallengeRequestResult> {
  const data = await requestProfileUpdate(buildRequestPayload({ phone_number: phone }, extras));
  return {
    success: true,
    message: data.message,
    dev_phone_otp: data.dev_phone_otp,
    requires_verification: data.requires_verification,
    verification_fields: data.verification_fields ?? [],
  };
}

export async function verifyPhoneOtp(params: {
  phone_number: string;
  phone_otp: string;
}): Promise<{ success: true }> {
  await verifyProfileUpdate({
    phone_number: params.phone_number,
    phone_otp: params.phone_otp,
  });
  return { success: true };
}

/** True when PATCH /auth/me/profile/request returned HTTP 429 (e.g. 10/min). */
export function isProfileRequestRateLimited(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 429;
}

/** `Retry-After` header in seconds, when present. */
export function getProfileRequestRetryAfterSeconds(error: unknown): number | null {
  if (!isAxiosError(error) || error.response?.status !== 429) return null;
  const raw = error.response.headers?.["retry-after"];
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function getIdentityErrorMessage(err: unknown, fallback: string): string {
  const apiMsg = getApiErrorMessage(err);
  if (apiMsg && apiMsg !== "Something went wrong.") return apiMsg;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** Read-only display: e.g. `+91 98765 43210` from E.164. */
export function formatPhoneInternational(phone: string | undefined | null): string {
  const trimmed = phone?.trim();
  if (!trimmed) return "";
  try {
    const parsed = parsePhoneNumberFromString(trimmed);
    return parsed?.formatInternational() ?? trimmed;
  } catch {
    return trimmed;
  }
}
