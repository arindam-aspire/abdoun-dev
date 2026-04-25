import type { PhoneValidationIssueCode } from "@/lib/phoneValidation";

/** Map validation issue codes to `phoneInput` message keys. */
export function formatPhoneValidationIssue(
  t: (key: string) => string,
  code: PhoneValidationIssueCode,
): string {
  switch (code) {
    case "required":
      return t("errors.required");
    case "invalid":
      return t("errors.invalid");
    case "invalidForCountry":
      return t("errors.invalidForCountry");
    case "mismatchCountry":
      return t("errors.mismatchCountry");
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}
