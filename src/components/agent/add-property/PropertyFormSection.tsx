"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PropertyFormSectionProps {
  /** Section icon rendered in the header */
  icon: ReactNode;
  /** Section title */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Whether the section starts expanded (default true) */
  defaultOpen?: boolean;
  /** Section content (form fields) */
  children: ReactNode;
  /** Extra className for the outer wrapper */
  className?: string;
}

/**
 * Collapsible card section used to group related form fields.
 * Designed to be self-contained so it works both inside a full page and inside a modal.
 */
export function PropertyFormSection({
  icon,
  title,
  subtitle,
  defaultOpen = true,
  children,
  className,
}: PropertyFormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md",
        className,
      )}
    >
      {/* Header – always visible */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface/40"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-size-sm fw-semibold text-charcoal">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-size-xs text-charcoal/65 truncate">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-charcoal/50 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Body – collapsible */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-subtle px-5 py-5 space-y-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
