import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export function Label({
  className,
  children,
  required,
  ...rest
}: LabelProps) {
  return (
    <label
      className={cn(
        "text-size-sm fw-medium text-zinc-700 leading-none peer-disabled:opacity-70 peer-disabled:cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      {children}
      {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
    </label>
  );
}

