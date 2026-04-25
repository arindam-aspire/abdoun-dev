import { parsePhoneNumberFromString } from "libphonenumber-js";
import { getNationalSignificantNumberDigits } from "@/lib/phoneDisplay";

/**
 * Adds countryDialCode (+prefix) and phoneNumber (NSN digits, no trunk 0)
 * from user.phone. Use when syncing session/user to profile store.
 */
export function enrichWithPhoneParts<
  T extends { phone?: string | null },
>(user: T): T & { countryDialCode?: string; phoneNumber?: string } {
  if (!user.phone?.trim())
    return user as T & { countryDialCode?: string; phoneNumber?: string };
  try {
    const parsed = parsePhoneNumberFromString(user.phone.trim());
    if (!parsed)
      return user as T & { countryDialCode?: string; phoneNumber?: string };
    const phoneNumber = getNationalSignificantNumberDigits(parsed);
    return {
      ...user,
      countryDialCode: `+${parsed.countryCallingCode}`,
      phoneNumber,
    };
  } catch {
    return user as T & { countryDialCode?: string; phoneNumber?: string };
  }
}
