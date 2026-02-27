import { parsePhoneNumberFromString, isValidPhoneNumber } from "libphonenumber-js";

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
 * Returns an error message if the phone number is invalid, otherwise undefined.
 * Use with form validation.
 *
 * @param value - Phone number string
 * @param required - If true, empty value is invalid
 * @returns Error message or undefined
 */
export function getPhoneValidationError(
  value: string | undefined,
  required = false,
): string | undefined {
  if (value == null || value.trim() === "") {
    return required ? "Phone number is required" : undefined;
  }
  if (!isValidPhoneNumber(value)) {
    return "Please enter a valid phone number";
  }
  return undefined;
}

/**
 * Parse a phone number string to get country and national number.
 * Useful for display or further validation.
 */
export function parsePhone(value: string | undefined) {
  if (value == null || value.trim() === "") return undefined;
  return parsePhoneNumberFromString(value) ?? undefined;
}
