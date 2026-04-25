"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneCountryCodeSelect } from "@/components/ui/phone-country-code-select";
import { cn } from "@/lib/cn";

interface PhoneNumberInputProps {
  idPrefix: string;
  label: string;
  /** ISO 3166-1 alpha-2 territory (e.g. `JO`). */
  countryIso2: string;
  onCountryIso2Change: (iso2: string) => void;
  localNumber: string;
  onLocalNumberChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  isRtl?: boolean;
  onFocus?: () => void;
  className?: string;
  labelClassName?: string;
  rowClassName?: string;
  selectClassName?: string;
  inputClassName?: string;
}

export function PhoneNumberInput({
  idPrefix,
  label,
  countryIso2,
  onCountryIso2Change,
  localNumber,
  onLocalNumberChange,
  placeholder,
  error,
  required = false,
  isRtl = false,
  onFocus,
  className,
  labelClassName,
  rowClassName,
  selectClassName,
  inputClassName,
}: PhoneNumberInputProps) {
  return (
    <div className={cn("space-y-2", className)} dir={isRtl ? "rtl" : "ltr"}>
      <Label htmlFor={`${idPrefix}-phone`} required={required} className={labelClassName}>
        {label}
      </Label>
      <div className={cn("grid grid-cols-[9.5rem_1fr] gap-2", rowClassName)}>
        <PhoneCountryCodeSelect
          id={`${idPrefix}-country-code`}
          value={countryIso2}
          onChange={onCountryIso2Change}
          onFocus={onFocus}
          buttonClassName={cn(
            "h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-colors",
            "focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-zinc-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selectClassName,
          )}
          align={isRtl ? "right" : "left"}
        />
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={localNumber}
          onChange={(event) =>
            onLocalNumberChange(event.target.value.replace(/[^\d\s()-]/g, ""))
          }
          onFocus={onFocus}
          placeholder={placeholder}
          error={error}
          className={cn("h-10", inputClassName)}
        />
      </div>
    </div>
  );
}
