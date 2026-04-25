import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

const REGIONAL_INDICATOR_A = 0x1f1e6;

/** ISO 3166-1 alpha-2 → regional-indicator pair (flag emoji). Empty if invalid. */
function regionalIndicatorFlag(iso2: string): string {
  const upper = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  const a = REGIONAL_INDICATOR_A + (upper.charCodeAt(0) - 0x41);
  const b = REGIONAL_INDICATOR_A + (upper.charCodeAt(1) - 0x41);
  return String.fromCodePoint(a, b);
}

/** NSN digits: `nationalNumber` with leading national trunk `0` removed (display only). */
export function getNationalSignificantNumberDigits(parsed: {
  nationalNumber: string;
}): string {
  let nsn = parsed.nationalNumber;
  if (nsn.startsWith("0")) nsn = nsn.slice(1);
  return nsn;
}

function spaceNsnForDisplay(digits: string, country: CountryCode | undefined): string {
  if (!digits) return "";
  if (country === "JO" && digits.length === 9) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export type PhoneDisplayParts = {
  /** Flag emoji (regional indicators only — never ISO letters like "jo"). */
  flag: string;
  /** Spaced NSN without country calling code and without trunk 0. */
  nationalNumberDisplay: string;
};

/**
 * Single source for profile phone read-only UI. Parses E.164 only; no string concat of ISO codes.
 */
export function formatPhoneDisplay(
  phone: string | undefined | null,
): PhoneDisplayParts | null {
  const trimmed = phone?.trim();
  if (!trimmed) return null;
  try {
    const parsed = parsePhoneNumberFromString(trimmed);
    if (!parsed?.country) return null;
    const flag = regionalIndicatorFlag(parsed.country);
    const nsn = getNationalSignificantNumberDigits(parsed);
    const nationalNumberDisplay = spaceNsnForDisplay(nsn, parsed.country);
    return { flag, nationalNumberDisplay };
  } catch {
    return null;
  }
}

/** One string for simple `{children}` rendering (flag + spaced NSN). */
export function formatProfilePhoneDisplay(phone: string | undefined | null): string {
  const parts = formatPhoneDisplay(phone);
  if (!parts) return phone?.trim() ?? "";
  const { flag, nationalNumberDisplay } = parts;
  if (!flag) return nationalNumberDisplay;
  return `${flag}\u2009${nationalNumberDisplay}`;
}

/**
 * Read-only: **`🇯🇴 791234567`** from **`+962791234567`** — flag + national digits only
 * (no `+962`, no trunk `0`, no extra spacing). Empty if unparseable.
 */
export function formatPhoneFlagAndNsnPlain(phone: string | undefined | null): string {
  const trimmed = phone?.trim();
  if (!trimmed) return "";
  try {
    const parsed = parsePhoneNumberFromString(trimmed);
    if (!parsed?.country) return trimmed;
    const flag = regionalIndicatorFlag(parsed.country);
    const nsn = getNationalSignificantNumberDigits(parsed);
    if (!flag) return nsn;
    return `${flag} ${nsn}`;
  } catch {
    return trimmed;
  }
}

/**
 * E.164 for short copy (e.g. OTP modal): **`+962-791234567`** — plus, country calling code, hyphen,
 * national significant digits (trunk `0` stripped). Falls back to trimmed input if parsing fails.
 */
export function formatPhoneDialHyphenNational(phone: string | undefined | null): string {
  const trimmed = phone?.trim();
  if (!trimmed) return "";
  try {
    const parsed = parsePhoneNumberFromString(trimmed);
    if (!parsed) return trimmed;
    const cc = parsed.countryCallingCode;
    const nsn = getNationalSignificantNumberDigits(parsed);
    return `+${cc}-${nsn}`;
  } catch {
    return trimmed;
  }
}
