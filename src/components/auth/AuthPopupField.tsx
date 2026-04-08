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
            placeholder={placeholder}
            error={error}
            showFlag={showFlag}
            showCountryCode={showCountryCode}
            showDialCode={showDialCode}
            rightAdornment={rightAdornment}
            className="[&>div:first-of-type]:h-12 [&>div:first-of-type]:rounded-[0.7rem] [&>div:first-of-type]:border [&>div:first-of-type]:border-[#b7c6ff] [&>div:first-of-type]:focus-within:border-[#6f8cff] [&>div:first-of-type]:focus-within:ring-2 [&>div:first-of-type]:focus-within:ring-[#6f8cff]/15 [&>div:first-of-type]:focus-within:ring-offset-0 [&>div:first-of-type]:shadow-none"
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


