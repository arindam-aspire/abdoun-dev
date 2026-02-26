export const DEFAULT_COUNTRY_CODE = "+962";

const COUNTRY_CODES = [
  { country: "Jordan", iso2: "JO", value: "+962" },
  { country: "United States", iso2: "US", value: "+1" },
  { country: "UAE", iso2: "AE", value: "+971" },
  { country: "Saudi Arabia", iso2: "SA", value: "+966" },
  { country: "United Kingdom", iso2: "GB", value: "+44" },
  { country: "France", iso2: "FR", value: "+33" },
  { country: "Spain", iso2: "ES", value: "+34" },
  { country: "Egypt", iso2: "EG", value: "+20" },
  { country: "Kuwait", iso2: "KW", value: "+965" },
  { country: "Bahrain", iso2: "BH", value: "+973" },
  { country: "Oman", iso2: "OM", value: "+968" },
  { country: "Qatar", iso2: "QA", value: "+974" },
];

function countryFlagFromIso2(iso2: string): string {
  return iso2
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export interface CountryCodeOption {
  value: string;
  country: string;
  iso2: string;
  flag: string;
  selectedLabel: string;
  dropdownLabel: string;
}

export const COUNTRY_CODE_OPTIONS = COUNTRY_CODES
  .slice()
  .sort((a, b) => a.country.localeCompare(b.country))
  .map((option) => ({
    country: option.country,
    iso2: option.iso2,
    flag: countryFlagFromIso2(option.iso2),
    value: option.value,
    selectedLabel: `${countryFlagFromIso2(option.iso2)} ${option.value}`,
    dropdownLabel: `${countryFlagFromIso2(option.iso2)} ${option.country} (${option.value})`,
  })) satisfies CountryCodeOption[];

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeCountryCode(code: string): string {
  const onlyDigits = digitsOnly(code);
  return onlyDigits ? `+${onlyDigits}` : DEFAULT_COUNTRY_CODE;
}

export function normalizePhoneNumber(countryCode: string, localNumber: string): string {
  const normalizedCode = normalizeCountryCode(countryCode);
  const localDigits = digitsOnly(localNumber);
  return `${normalizedCode}${localDigits}`;
}

export function splitPhoneNumber(
  fullPhone: string,
  fallbackCountryCode = DEFAULT_COUNTRY_CODE,
): { countryCode: string; localNumber: string } {
  const trimmed = fullPhone.trim();
  if (!trimmed) {
    return { countryCode: fallbackCountryCode, localNumber: "" };
  }

  const cleaned = trimmed.replace(/[^\d+]/g, "");
  const sortedCodes = [...COUNTRY_CODE_OPTIONS]
    .map((option) => option.value)
    .sort((a, b) => b.length - a.length);

  for (const code of sortedCodes) {
    if (cleaned.startsWith(code)) {
      return {
        countryCode: code,
        localNumber: digitsOnly(cleaned.slice(code.length)),
      };
    }
  }

  if (cleaned.startsWith("+")) {
    const fallbackCode = normalizeCountryCode(fallbackCountryCode);
    const fallbackDigits = digitsOnly(fallbackCode);
    const allDigits = digitsOnly(cleaned);
    if (allDigits.startsWith(fallbackDigits)) {
      return {
        countryCode: fallbackCode,
        localNumber: allDigits.slice(fallbackDigits.length),
      };
    }
    return {
      countryCode: fallbackCode,
      localNumber: allDigits,
    };
  }

  return {
    countryCode: normalizeCountryCode(fallbackCountryCode),
    localNumber: digitsOnly(cleaned),
  };
}

export function isValidInternationalPhone(phone: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(phone);
}
