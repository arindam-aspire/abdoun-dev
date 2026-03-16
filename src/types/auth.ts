import { parsePhoneNumberFromString } from "libphonenumber-js";

const DEFAULT_LOCATION = "Dubai, UAE";

/** Resolve location (country name) from phone number country code. */
function getLocationFromPhone(phone: string | undefined): string {
  if (!phone || !phone.trim()) return DEFAULT_LOCATION;
  try {
    const parsed = parsePhoneNumberFromString(phone.trim());
    if (!parsed?.country) return DEFAULT_LOCATION;
    if (typeof Intl !== "undefined" && Intl.DisplayNames) {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(
        parsed.country,
      ) as string;
    }
    return parsed.country;
  } catch {
    return DEFAULT_LOCATION;
  }
}

/** Social login provider identifier */
export type SocialProvider = "google" | "apple" | "facebook";

/** UI shape for signup form */
export interface SignupPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

/** Result of manual signup: either OTP step or redirect to login */
export type ManualSignupResult =
  | {
      nextStep: "otp";
      challengeId: string;
      expiresInSeconds: number;
      debugOtp?: string;
    }
  | {
      nextStep: "login";
      message: string;
    };

/** Profile role for display */
export type ProfileRole = "user" | "agent" | "admin";

/** Profile data (auth-derived + extra from profile slice) */
export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  role: ProfileRole;
  displayName?: string;
  countryDialCode?: string;
  phoneNumber?: string;
}

/** Maps auth session user to profile shape (used with profile slice for full data). */
export function getProfileFromAuth(authUser: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: ProfileRole;
  countryDialCode?: string;
  phoneNumber?: string;
}): Omit<ProfileData, "displayName" | "avatarUrl"> & {
  displayName?: string;
  avatarUrl?: string;
} {
  return {
    fullName: authUser.name,
    email: authUser.email,
    phone: authUser.phone ?? "+1 (555) 000-0000",
    location: getLocationFromPhone(authUser.phone),
    role: authUser.role,
    countryDialCode: authUser.countryDialCode,
    phoneNumber: authUser.phoneNumber,
  };
}

/** Demo credentials for agent login (popup tries agent before admin before user). */
export const MOCK_AGENT_CREDENTIALS = {
  email: "agent@abdoun.com",
  password: "Agent@123",
  name: "Ahmad Khaled Al-Hassan",
};

/** Demo credentials for admin login. */
export const MOCK_ADMIN_CREDENTIALS = {
  email: "admin@abdoun.com",
  password: "Admin@123",
  name: "Admin User",
};
