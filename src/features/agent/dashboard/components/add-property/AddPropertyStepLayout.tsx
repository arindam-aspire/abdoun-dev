"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const wizardFieldClassName =
  "h-11 rounded-xl border-[#b8c8ea] bg-white px-4 text-sm text-slate-700 shadow-sm transition-colors hover:border-[#8fa6d8] focus:border-primary focus:ring-2 focus:ring-[rgba(26,59,92,0.12)] placeholder:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400";

export const wizardTextareaClassName =
  "rounded-xl border-[#b8c8ea] bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition-colors hover:border-[#8fa6d8] focus:border-primary focus:ring-2 focus:ring-[rgba(26,59,92,0.12)] placeholder:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400";

export function FieldLabel({
  htmlFor,
  label,
  required = false,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-size-xs fw-semibold uppercase tracking-[0.08em] text-[#334e68]"
    >
      {label}
      {required ? <span className="ml-1 text-[#d64545]">*</span> : null}
    </label>
  );
}

export function FormField({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("space-y-0", className)}>{children}</div>;
}

export function CardSection({
  title,
  description,
  required,
  readOnlyForm,
  children,
}: {
  title: string;
  description: string;
  required?: boolean;
  /** When true, form controls are disabled (e.g. submitted / approved / rejected). */
  readOnlyForm?: boolean;
  children: ReactNode;
}) {
  const body =
    readOnlyForm === true ? (
      <fieldset disabled className="min-w-0 border-0 p-0 m-0">
        {children}
      </fieldset>
    ) : (
      children
    );
  return (
    <section className="rounded-[28px] border border-[#edf2f7] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-size-2xl fw-semibold text-[#24415c]">{title}</h2>
          <p className="mt-2 text-size-sm leading-6 text-[#6b7c93]">{description}</p>
        </div>
        {required ? (
          <span className="inline-flex items-center rounded-full bg-[#ffe24a] px-4 py-1.5 text-size-xs fw-semibold text-[#24415c]">
            Required
          </span>
        ) : null}
      </div>
      {body}
    </section>
  );
}
