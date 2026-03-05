import type { InputHTMLAttributes } from "react";
import { Input, Label } from "@/components/ui";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
}

export function AuthField({ id, label, error, helperText, ...rest }: AuthFieldProps) {
  return (
    <div className="flex flex-col">
      <Label htmlFor={id} className="mb-2" required>
        {label}
      </Label>
      <Input id={id} error={error} {...rest} />
      {!error && helperText ? <p className="mt-1.5 text-size-xs text-zinc-500">{helperText}</p> : null}
    </div>
  );
}

