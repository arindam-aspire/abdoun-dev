import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Adds countryDialCode (+prefix) and phoneNumber (national format, no leading 0)
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
    const national = parsed.formatNational();
    const raw = national.startsWith("0") ? national.slice(1) : national;
    const phoneNumber = raw.replace(/\s/g, "");
    return {
      ...user,
      countryDialCode: `+${parsed.countryCallingCode}`,
      phoneNumber,
    };
  } catch {
    return user as T & { countryDialCode?: string; phoneNumber?: string };
  }
}
