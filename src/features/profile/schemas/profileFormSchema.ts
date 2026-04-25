/**
 * Profile form validation and types. Centralized for personal info and sign-in/security.
 * Same rules as previous inline validation; no backend contract change.
 */

import { splitPhoneNumber } from "@/lib/phone";
import {
  getPhoneValidationIssueCodeForSelectedCountry,
  type PhoneValidationIssueCode,
} from "@/lib/phoneValidation";

export type ProfileRole = "user" | "agent" | "admin";

export interface PersonalInformationFormValues {
  fullName: string;
  role: ProfileRole;
  displayName?: string;
}

export interface SignInSecurityPhoneValues {
  phone: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PhoneValidationResult {
  valid: boolean;
  /** When `valid` is false, use with `phoneInput` translations via `formatPhoneValidationIssue`. */
  code?: PhoneValidationIssueCode;
}

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate phone for profile/security tab: required and libphonenumber-valid for the parsed territory.
 */
export function validatePhone(phone: string | undefined): PhoneValidationResult {
  const trimmed = phone?.trim() ?? "";
  if (!trimmed) {
    return { valid: false, code: "required" };
  }
  const { iso2 } = splitPhoneNumber(trimmed);
  const code = getPhoneValidationIssueCodeForSelectedCountry(trimmed, iso2, false);
  if (code) {
    return { valid: false, code };
  }
  return { valid: true };
}

/**
 * Validate change-password form. Same rules: min 8 chars, new and confirm must match.
 */
export function validateChangePassword(values: ChangePasswordFormValues): PasswordValidationResult {
  if (!values.newPassword || values.newPassword.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: "Password must be at least 8 characters." };
  }
  if (values.newPassword !== values.confirmPassword) {
    return { valid: false, error: "New password and confirmation do not match." };
  }
  return { valid: true };
}

/**
 * Role options for personal info tab (value + label key).
 */
export const PROFILE_ROLE_OPTIONS = [
  { value: "user" as const, labelKey: "common:user" },
  { value: "agent" as const, labelKey: "common:agent" },
  { value: "admin" as const, labelKey: "common:admin" },
] as const;
