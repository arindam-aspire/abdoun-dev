"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 rounded border-zinc-300 text-zinc-900 shadow-sm",
            "focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-red-500",
            error && "border-red-500",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? "checkbox-error" : undefined}
          {...rest}
        />
        {error && (
          <p id="checkbox-error" className="text-size-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

