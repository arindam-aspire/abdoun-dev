"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PropertyFormFieldProps {
  /** Field label text */
  label: string;
  /** Unique id for the input (also used for htmlFor) */
  htmlFor?: string;
  /** Optional hint text below the label */
  hint?: string;
  /** Validation error message */
  error?: string;
  /** Whether the field is required (shows a red asterisk) */
  required?: boolean;
  /** The form control(s) – Input, Select, Textarea, Checkbox etc. */
  children: ReactNode;
  /** Extra className for the outer wrapper */
  className?: string;
}

/**
 * Consistent label + input wrapper with error/hint support.
 * Works with any child control via the children slot.
 */
export function PropertyFormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: PropertyFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-size-sm fw-medium text-charcoal"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && (
        <p className="text-size-xs text-charcoal/55">{hint}</p>
      )}
      {children}
      {error && (
        <p className="text-size-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
