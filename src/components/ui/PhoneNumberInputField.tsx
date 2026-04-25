"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import {
  compositeInputInnerClassName,
  compositeInputShellClassName,
} from "@/components/ui/input-classes";
import { PhoneCountryCodeSelect } from "@/components/ui/phone-country-code-select";
import { cn } from "@/lib/cn";
import {
  DEFAULT_COUNTRY_ISO2,
  formatLocalPhoneDigitsForDisplay,
  normalizePhoneNumber,
  splitPhoneNumber,
} from "@/lib/phone";
import { formatPhoneValidationIssue } from "@/lib/formatPhoneValidationIssue";
import { getPhoneValidationIssueCodeForSelectedCountry } from "@/lib/phoneValidation";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * Country code + local digits (no `react-phone-number-input`).
 * `value` / `onChange` are **E.164** only; UI never fights between `+…` and trunk `0` because
 * the dial code lives in the selector and the text field is **national digits only** (no `+962`).
 */

function trimValue(raw: string | undefined): string | undefined {
  const t = raw?.trim();
  return t && t.length > 0 ? t : undefined;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export interface PhoneNumberInputFieldProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onFocus?: () => void;
  /** Fired after the national digits field blurs (e.g. for react-hook-form `field.onBlur`). */
  onBlur?: () => void;
  error?: string;
  className?: string;
  fieldClassName?: string;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  rightAdornment?: ReactNode;
}

export function PhoneNumberInputField({
  value,
  onChange,
  onFocus,
  onBlur: onBlurProp,
  error,
  className,
  fieldClassName,
  inputClassName,
  placeholder,
  disabled = false,
  rightAdornment,
}: PhoneNumberInputFieldProps) {
  const tPhone = useTranslations("phoneInput");
  const defaultPlaceholder = tPhone("placeholder");
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder;
  const locale = useLocale();
  const isRtl = locale === "ar";
  const baseId = useId();
  const [shouldValidate, setShouldValidate] = useState(false);
  /** When E.164 is empty, keep the last territory (picker) instead of snapping to Jordan. */
  const [preferredIso2, setPreferredIso2] = useState(DEFAULT_COUNTRY_ISO2);

  useEffect(() => {
    const v = trimValue(value);
    if (!v) return;
    setPreferredIso2((prev) => splitPhoneNumber(v, prev).iso2);
  }, [value]);

  const { iso2, localNumber } = useMemo(() => {
    const v = trimValue(value);
    if (!v) {
      return { iso2: preferredIso2, localNumber: "" };
    }
    const split = splitPhoneNumber(v, preferredIso2);
    return {
      iso2: split.iso2,
      localNumber: formatLocalPhoneDigitsForDisplay(split.iso2, split.localNumber),
    };
  }, [value, preferredIso2]);

  const setE164 = (nextIso2: string, local: string) => {
    const d = digitsOnly(local);
    if (!d) {
      // Use "" so parents that coerce with `v ?? ""` still get a cleared value; `undefined` is easy to ignore.
      onChange?.("");
      return;
    }
    onChange?.(normalizePhoneNumber(nextIso2, d));
  };

  /** If national digits are empty / only zeros, E.164 is not meaningful — sync parent (covers JO display hiding `0`). */
  const clearIfNoNationalDigits = (rawLocal: string) => {
    const d = digitsOnly(rawLocal);
    if (!d || /^0+$/.test(d)) {
      onChange?.("");
    }
  };

  const internalError = useMemo(() => {
    if (!shouldValidate) return undefined;
    const code = getPhoneValidationIssueCodeForSelectedCountry(value, iso2, false);
    return code ? formatPhoneValidationIssue(tPhone, code) : undefined;
  }, [shouldValidate, value, iso2, tPhone]);

  const mergedError = error || internalError;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className={cn("w-full", className)}>
      <div
        className={cn(
          // Do not use overflow-hidden: it clips the country picker panel.
          compositeInputShellClassName({
            error: !!mergedError,
            disabled,
          }),
          "relative",
          fieldClassName,
        )}
      >
        <div className="flex h-full min-h-0 w-full min-w-0 items-center gap-2">
          <PhoneCountryCodeSelect
            id={`${baseId}-country`}
            value={iso2}
            onChange={(next) => {
              setShouldValidate(true);
              const nextIso = next || DEFAULT_COUNTRY_ISO2;
              setPreferredIso2(nextIso);
              setE164(nextIso, localNumber);
            }}
            onFocus={onFocus}
            disabled={disabled}
            buttonLabel="flag-only"
            buttonClassName={cn(
              "h-auto min-h-0 w-auto shrink-0 rounded-sm border-0 bg-transparent px-0 py-0 text-zinc-900 shadow-none",
              "focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            align={isRtl ? "right" : "left"}
          />
          <div className="relative min-h-0 min-w-0 flex-1 self-stretch">
            <input
              id={`${baseId}-local`}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={localNumber}
              onChange={(e) => {
                const next = e.target.value.replace(/[^\d\s()-]/g, "");
                setE164(iso2, next);
              }}
              onBlur={(e) => {
                setShouldValidate(true);
                clearIfNoNationalDigits(e.target.value);
                onBlurProp?.();
              }}
              onFocus={onFocus}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              className={cn(
                compositeInputInnerClassName,
                "h-full min-h-0 w-full py-2",
                rightAdornment && "pe-10",
                inputClassName,
              )}
              aria-invalid={!!mergedError}
              aria-describedby={mergedError ? `${baseId}-phone-error` : undefined}
            />
            {rightAdornment ? (
              <div className="pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-end">
                {rightAdornment}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {mergedError && (
        <p
          id={`${baseId}-phone-error`}
          className="mt-1.5 text-size-sm text-red-600"
          role="alert"
        >
          {mergedError}
        </p>
      )}
    </div>
  );
}
