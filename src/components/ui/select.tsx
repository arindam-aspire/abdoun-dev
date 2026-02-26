"use client";

import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, ...rest }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-size-sm text-zinc-900 shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50",
            "aria-invalid:border-red-500",
            error && "border-red-500 ring-2 ring-red-500/20",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? "select-error" : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id="select-error" className="mt-1.5 text-size-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };

