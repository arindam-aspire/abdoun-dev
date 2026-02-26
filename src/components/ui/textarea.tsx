"use client";

import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...rest }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-size-sm text-zinc-900 shadow-sm transition-colors",
            "placeholder:text-zinc-400",
            "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50",
            "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
            "resize-y",
            error && "border-red-500 ring-2 ring-red-500/20",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? "textarea-error" : undefined}
          {...rest}
        />
        {error && (
          <p
            id="textarea-error"
            className="mt-1.5 text-size-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };

