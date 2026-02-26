"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneCountryCodeSelect } from "@/components/ui/phone-country-code-select";
import { cn } from "@/lib/cn";

interface PhoneNumberInputProps {
  idPrefix: string;
  label: string;
  countryCode: string;
  localNumber: string;
  onCountryCodeChange: (value: string) => void;
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
  countryCode,
  localNumber,
  onCountryCodeChange,
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
          value={countryCode}
          onChange={onCountryCodeChange}
          onFocus={onFocus}
          buttonClassName={cn(
            "h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selectClassName,
          )}
          menuClassName="w-[18rem]"
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
