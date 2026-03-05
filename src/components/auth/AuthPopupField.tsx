import type { ReactNode } from "react";
import { Input, PhoneNumberInputField } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

const authFieldInputClass =
  "h-14 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-5 text-size-base text-zinc-900 placeholder:text-zinc-500 focus:border-primary focus:ring-2 focus:ring-[rgba(26,59,92,0.2)] focus:ring-offset-0";

interface AuthPopupFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "phone";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  rightAdornment?: ReactNode;
  error?: string;
  /** When type="phone": show country flag (default: true) */
  showFlag?: boolean;
  /** When type="phone": show country code / dropdown arrow (default: false) */
  showCountryCode?: boolean;
  /** When type="phone": show dial code in input e.g. "+962" (default: true) */
  showDialCode?: boolean;
}

export function AuthPopupField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  rightAdornment,
  error,
  showFlag = true,
  showCountryCode = false,
  showDialCode = true,
}: AuthPopupFieldProps) {
  const isPhone = type === "phone";

  return (
    <div className="flex flex-col">
      <Label htmlFor={id} className="mb-2 text-size-base fw-semibold text-zinc-800">
        {label}
      </Label>
      <div className="relative">
        {isPhone ? (
          <PhoneNumberInputField
            value={value || undefined}
            onChange={(v) => onChange(v ?? "")}
            onFocus={onFocus}
            placeholder={placeholder}
            error={error}
            showFlag={showFlag}
            showCountryCode={showCountryCode}
            showDialCode={showDialCode}
            rightAdornment={rightAdornment}
            className="[&>div:first-of-type]:h-14 [&>div:first-of-type]:rounded-full [&>div:first-of-type]:border-2 [&>div:first-of-type]:border-[rgba(43,91,166,0.35)] [&>div:first-of-type]:focus-within:border-primary [&>div:first-of-type]:focus-within:ring-2 [&>div:first-of-type]:focus-within:ring-[rgba(26,59,92,0.2)] [&>div:first-of-type]:focus-within:ring-offset-0 [&>div:first-of-type]:shadow-none"
          />
        ) : (
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
            error={error}
            className={authFieldInputClass}
            rightAdornment={rightAdornment}
          />
        )}
      </div>
    </div>
  );
}


