import type { ReactNode } from "react";
import { Input, PhoneNumberInputField } from "@/components/ui";
import { Label } from "@/components/ui/label";

const authFieldInputClass =
  "h-12 rounded-[0.7rem] border border-[#b7c6ff] bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6f8cff] focus:ring-2 focus:ring-[#6f8cff]/15 focus:ring-offset-0";

interface AuthPopupFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "phone";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  rightAdornment?: ReactNode;
  error?: string;
  /** Merged with error description id on the native input (text / email / password only). */
  ariaDescribedBy?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function AuthPopupField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  rightAdornment,
  error,
  ariaDescribedBy,
  maxLength,
  disabled,
}: AuthPopupFieldProps) {
  const isPhone = type === "phone";

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </Label>
      <div className="relative">
        {isPhone ? (
          <PhoneNumberInputField
            value={value || undefined}
            onChange={(v) => onChange(v ?? "")}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            error={error}
            rightAdornment={rightAdornment}
            disabled={disabled}
            className="[&>div:first-of-type]:h-12 [&>div:first-of-type]:rounded-[0.7rem] [&>div:first-of-type]:border [&>div:first-of-type]:border-[#b7c6ff] [&>div:first-of-type]:focus-within:border-[#6f8cff] [&>div:first-of-type]:focus-within:ring-0 [&>div:first-of-type]:shadow-none"
          />
        ) : (
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            error={error}
            className={authFieldInputClass}
            rightAdornment={rightAdornment}
            aria-describedby={ariaDescribedBy}
            maxLength={maxLength}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}


