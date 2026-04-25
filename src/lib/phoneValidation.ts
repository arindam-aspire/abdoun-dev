import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

function isKnownCountry(iso: string): iso is CountryCode {
  return /^[A-Z]{2}$/i.test(iso) && getCountries().includes(iso.toUpperCase() as CountryCode);
}

export type PhoneValidationIssueCode =
  | "required"
  | "invalid"
  | "invalidForCountry"
  | "mismatchCountry";

const ISSUE_MESSAGES_EN: Record<PhoneValidationIssueCode, string> = {
  required: "Phone number is required",
  invalid: "Please enter a valid phone number",
  invalidForCountry: "Enter a valid number for the selected country",
  mismatchCountry: "Number does not match the selected country",
};

/**
 * Validates a phone number string (E.164 or national format).
 * Uses libphonenumber-js for proper international validation.
 *
 * @param value - Phone number (e.g. "+962791234567" or undefined/empty)
 * @returns true if valid or empty, false otherwise
 */
export function isValidPhone(value: string | undefined): boolean {
  if (value == null || value.trim() === "") return true;
  return isValidPhoneNumber(value);
}

/**
 * Returns a machine-readable issue code if invalid, otherwise undefined.
 */
export function getPhoneValidationIssueCode(
  value: string | undefined,
  required = false,
): PhoneValidationIssueCode | undefined {
  if (value == null || value.trim() === "") {
    return required ? "required" : undefined;
  }
  if (!isValidPhoneNumber(value)) {
    return "invalid";
  }
  return undefined;
}

/**
 * Returns an error message if the phone number is invalid, otherwise undefined.
 * Use with form validation when translations are not available (English fallback).
 */
export function getPhoneValidationError(
  value: string | undefined,
  required = false,
): string | undefined {
  const code = getPhoneValidationIssueCode(value, required);
  return code ? ISSUE_MESSAGES_EN[code] : undefined;
}

/**
 * Parse a phone number string to get country and national number.
 * Useful for display or further validation.
 */
export function parsePhone(value: string | undefined) {
  if (value == null || value.trim() === "") return undefined;
  return parsePhoneNumberFromString(value) ?? undefined;
}

/**
 * Validates E.164 (or parseable international) against the **selected** territory.
 * Uses `libphonenumber-js` `isValid()` after parsing with the selector country as default.
 * NANP (+1): allows any +1 territory when calling codes match.
 */
export function getPhoneValidationIssueCodeForSelectedCountry(
  value: string | undefined | null,
  selectedIso2: string,
  required = false,
): PhoneValidationIssueCode | undefined {
  if (value == null || value.trim() === "") {
    return required ? "required" : undefined;
  }
  const trimmed = value.trim();
  const upper = selectedIso2.toUpperCase();
  if (!isKnownCountry(upper)) {
    return "invalid";
  }
  const territory = upper as CountryCode;
  const parsed =
    parsePhoneNumberFromString(trimmed, territory) ?? parsePhoneNumberFromString(trimmed);
  if (!parsed) {
    return "invalid";
  }
  if (!parsed.isValid()) {
    return "invalidForCountry";
  }
  if (parsed.country && parsed.country !== territory) {
    const dialParsed = getCountryCallingCode(parsed.country);
    const dialSelected = getCountryCallingCode(territory);
    if (dialParsed !== dialSelected) {
      return "mismatchCountry";
    }
  }
  return undefined;
}

/**
 * Returns an English error message (for non-UI callers or logging).
 */
export function getPhoneValidationErrorForSelectedCountry(
  value: string | undefined | null,
  selectedIso2: string,
  required = false,
): string | undefined {
  const code = getPhoneValidationIssueCodeForSelectedCountry(value, selectedIso2, required);
  return code ? ISSUE_MESSAGES_EN[code] : undefined;
}
