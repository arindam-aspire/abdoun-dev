"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PropertyFormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

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
      <label htmlFor={htmlFor} className="block text-size-sm fw-medium text-charcoal">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-size-xs text-charcoal/55">{hint}</p>}
      {children}
      {error && (
        <p className="text-size-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

