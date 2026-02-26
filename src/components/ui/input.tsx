"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...rest }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-size-sm text-zinc-900 shadow-sm transition-colors",
            "placeholder:text-zinc-400",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50",
            "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
            error && "border-red-500 ring-2 ring-red-500/20",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? "input-error" : undefined}
          {...rest}
        />
        {error && (
          <p id="input-error" className="mt-1.5 text-size-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };


