"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import PhoneInput from "react-phone-number-input";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountrySelectProps } from "react-phone-number-input";
import { CountrySelectWithSearch } from "@/components/ui/CountrySelectWithSearch";
import "react-phone-number-input/style.css";

/** Safely convert any phone string to E.164 when possible.
 * Uses JO as default country so national numbers like "079..." can be parsed.
 * If parsing fails, return undefined so the underlying input starts empty.
 */
function normalizeToE164(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const parsed = parsePhoneNumberFromString(raw, "JO");
    return parsed?.number || undefined;
  } catch {
    return undefined;
  }
}

function buildCountryLabels(): Partial<Record<string, string>> {
  try {
    const countries = getCountries();
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return Object.fromEntries(
      countries.map((country) => [
        country,
        `(+${getCountryCallingCode(country)}) ${displayNames.of(country)}`,
      ]),
    );
  } catch {
    return {};
  }
}

export interface PhoneNumberInputFieldProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onFocus?: () => void;
  error?: string;
  className?: string;
  /** Extra classes for the bordered field wrapper (controls height, radius, border, etc.). */
  fieldClassName?: string;
  /** Extra classes for the underlying phone input (padding, font size, etc.). */
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Show country flag icon (default: true) */
  showFlag?: boolean;
  /** Show country code / dropdown arrow in selector (default: false for flag-only UI) */
  showCountryCode?: boolean;
  /** Show dial code in the number input, e.g. "+962" (default: true). When false, uses national format. */
  showDialCode?: boolean;
  /** Right adornment (e.g. icon) rendered inside the field; controlled by parent. */
  rightAdornment?: ReactNode;
}

export function PhoneNumberInputField({
  value,
  onChange,
  onFocus,
  error,
  className,
  fieldClassName,
  inputClassName,
  placeholder = "Enter phone number",
  disabled = false,
  showFlag = true,
  showCountryCode = false,
  showDialCode = false,
  rightAdornment,
}: PhoneNumberInputFieldProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const labels = useMemo(buildCountryLabels, []);
  const normalizedValue = normalizeToE164(value);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "w-full",
        !showFlag && "[&_.PhoneInputCountryIcon]:hidden",
        !showCountryCode &&
          "[&_.PhoneInputCountrySelectArrow]:hidden [&_.PhoneInputCountrySelect]:pointer-events-none [&_.PhoneInputCountrySelect]:w-0 [&_.PhoneInputCountrySelect]:overflow-hidden",
        showCountryCode &&
          "[&_.PhoneInputCountrySelectArrow]:transition-transform [&_.PhoneInputCountrySelectArrow]:rotate-0 [&_.PhoneInputCountrySelectArrow[data-open]]:rotate-180",
        isRtl && showCountryCode && "[&_.PhoneInputCountryIcon]:me-2",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex h-10 w-full overflow-hidden rounded-md border bg-white shadow-sm transition-colors [&_.PhoneInput]:h-full [&_.PhoneInput]:border-0 [&_.PhoneInput]:focus-within:ring-0",
          "[&_.PhoneInputInput]:focus:outline-none [&_.PhoneInputInput]:focus:ring-0 [&_.PhoneInputInput]:focus:border-0 [&_.PhoneInputInput]:focus:shadow-none",
          rightAdornment && "[&_.PhoneInputInput]:[padding-inline-end:2.5rem]",
          isRtl && "[&_.PhoneInputInput]:[padding-inline-start:4px]",
          "border-zinc-300",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 ring-2 ring-red-500/20",
          fieldClassName,
        )}
      >
        <PhoneInput
          international={showDialCode}
          defaultCountry="JO"
          countryCallingCodeEditable={false}
          addInternationalOption={false}
          countrySelectComponent={CountrySelectWithSearch as React.ComponentType<CountrySelectProps>}
          {...(labels && { labels: labels as Partial<Record<import("libphonenumber-js").CountryCode, string>> })}
          value={normalizedValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(
            "flex h-full flex-1 min-w-0 border-0 bg-transparent px-3 py-2 text-size-sm text-zinc-900 shadow-none placeholder:text-zinc-400 focus:outline-none focus:ring-0 disabled:bg-transparent text-start",
            inputClassName,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? "phone-input-error" : undefined}
          onFocus={onFocus}
        />
        {rightAdornment ? (
          <div className="pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-end">
            {rightAdornment}
          </div>
        ) : null}
      </div>
      {error && (
        <p
          id="phone-input-error"
          className="mt-1.5 text-size-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
