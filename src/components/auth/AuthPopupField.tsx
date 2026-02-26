import type { ReactNode } from "react";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui/label";

interface AuthPopupFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  rightAdornment?: ReactNode;
  error?: string;
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
}: AuthPopupFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-size-base fw-semibold text-zinc-800">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          error={error}
          className="h-14 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-5 text-size-base text-zinc-900 placeholder:text-zinc-500 focus:border-primary focus:ring-2 focus:ring-[rgba(26,59,92,0.2)] focus:ring-offset-0"
        />
        {rightAdornment ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAdornment}
          </div>
        ) : null}
      </div>
    </div>
  );
}


