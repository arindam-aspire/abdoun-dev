import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { formatPhoneDisplay } from "@/lib/phoneDisplay";

export const DEFAULT_COUNTRY_ISO2 = "JO";

/** Default territory dial prefix (Jordan). Prefer `DEFAULT_COUNTRY_ISO2` in new code. */
export const DEFAULT_COUNTRY_CODE = "+962";

/** ISO 3166-1 alpha-2 → regional-indicator flag pair (U+1F1E6…). */
export function countryFlagFromIso2(iso2: string): string {
  const upper = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    base + (upper.charCodeAt(0) - 65),
    base + (upper.charCodeAt(1) - 65),
  );
}

export interface CountryCodeOption {
  iso2: string;
  /** Localized label for the current UI locale */
  country: string;
  /** English region name — always search Latin queries (e.g. "Jordan" while UI shows Arabic). */
  countryEn: string;
  dial: string;
  flag: string;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * National digits for UI: digits only, with leading national trunk `0` removed (e.g. India
 * `06294…` → `6294…`). Matches `PhoneNumberInputField` / NSN display elsewhere.
 */
export function formatLocalPhoneDigitsForDisplay(
  _iso2: string,
  nationalDigits: string,
): string {
  return digitsOnly(nationalDigits).replace(/^0+/, "");
}

function isSupportedCountry(iso2: string): iso2 is CountryCode {
  return /^[A-Z]{2}$/i.test(iso2) && getCountries().includes(iso2.toUpperCase() as CountryCode);
}

/**
 * All supported territories with localized names (no network).
 * Cached per locale string.
 */
const optionsByLocale = new Map<string, CountryCodeOption[]>();

export function getCountryCodeOptions(locale = "en"): CountryCodeOption[] {
  const key = locale || "en";
  const hit = optionsByLocale.get(key);
  if (hit) return hit;

  let regionNames: Intl.DisplayNames;
  try {
    regionNames = new Intl.DisplayNames([key], { type: "region" });
  } catch {
    regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  }

  const namesEn = new Intl.DisplayNames(["en"], { type: "region" });

  const list: CountryCodeOption[] = [];
  for (const iso2 of getCountries()) {
    try {
      const cc = getCountryCallingCode(iso2);
      const upper = iso2.toUpperCase();
      let country: string;
      try {
        country = regionNames.of(upper) ?? upper;
      } catch {
        country = upper;
      }
      let countryEn: string;
      try {
        countryEn = namesEn.of(upper) ?? upper;
      } catch {
        countryEn = upper;
      }
      list.push({
        iso2: upper,
        country,
        countryEn,
        dial: `+${cc}`,
        flag: countryFlagFromIso2(upper),
      });
    } catch {
      // skip unsupported metadata edge cases
    }
  }

  list.sort((a, b) => a.country.localeCompare(b.country, key, { sensitivity: "base" }));
  optionsByLocale.set(key, list);
  return list;
}

/** @deprecated Use `getCountryCodeOptions` — kept for any external imports of the old name */
export const COUNTRY_CODE_OPTIONS = getCountryCodeOptions("en");

export function normalizePhoneNumber(iso2: string, localNumber: string): string {
  const territory: CountryCode = isSupportedCountry(iso2)
    ? (iso2.toUpperCase() as CountryCode)
    : (DEFAULT_COUNTRY_ISO2 as CountryCode);
  const dial = getCountryCallingCode(territory);
  return `+${dial}${digitsOnly(localNumber)}`;
}

/**
 * Read-only profile line: territory flag key + national-style digits (no leading `+` calling code).
 */
export function getProfilePhoneReadonlyDisplay(phone: string | undefined | null): {
  iso2: string;
  nationalLine: string;
} | null {
  const trimmed = phone?.trim();
  if (!trimmed) return null;
  const parsed =
    parsePhoneNumberFromString(trimmed) ??
    parsePhoneNumberFromString(trimmed, DEFAULT_COUNTRY_ISO2 as CountryCode);
  if (parsed?.country) {
    /** NSN digits + spacing — avoids `formatNational()` trunk `0` (e.g. India `06294…` for `+91…`). */
    const displayParts = formatPhoneDisplay(trimmed);
    if (displayParts) {
      return {
        iso2: parsed.country,
        nationalLine: displayParts.nationalNumberDisplay,
      };
    }
    return {
      iso2: parsed.country,
      nationalLine: formatLocalPhoneDigitsForDisplay(
        parsed.country,
        parsed.nationalNumber ?? "",
      ),
    };
  }
  const { iso2, localNumber } = splitPhoneNumber(trimmed);
  return {
    iso2,
    nationalLine:
      formatLocalPhoneDigitsForDisplay(iso2, localNumber) || trimmed,
  };
}

export function splitPhoneNumber(
  fullPhone: string,
  fallbackIso2: string = DEFAULT_COUNTRY_ISO2,
): { iso2: string; localNumber: string } {
  const trimmed = fullPhone.trim();
  if (!trimmed) {
    return { iso2: fallbackIso2.toUpperCase(), localNumber: "" };
  }

  const fallback = (isSupportedCountry(fallbackIso2)
    ? fallbackIso2.toUpperCase()
    : DEFAULT_COUNTRY_ISO2) as CountryCode;

  const parsed =
    parsePhoneNumberFromString(trimmed, fallback) ?? parsePhoneNumberFromString(trimmed);

  if (parsed?.country) {
    return {
      iso2: parsed.country,
      localNumber: digitsOnly(parsed.nationalNumber ?? ""),
    };
  }

  // Do not dump everything after "+" into the national field — that repeats the calling code
  // (e.g. "+962" → "962" in the local input) when parse fails during backspace/delete.
  const allDigits = digitsOnly(trimmed.replace(/^\+/, ""));
  const dialDigits = digitsOnly(getCountryCallingCode(fallback));
  if (dialDigits && allDigits.startsWith(dialDigits)) {
    return {
      iso2: fallback,
      localNumber: allDigits.slice(dialDigits.length),
    };
  }

  return {
    iso2: fallback,
    localNumber: allDigits,
  };
}

export function isValidInternationalPhone(phone: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(phone);
}
