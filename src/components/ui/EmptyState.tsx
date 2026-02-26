"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref: string;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
  className,
  dir,
}: EmptyStateProps) {
  const locale = useLocale() as AppLocale;
  const href = actionHref.startsWith("/") ? `/${locale}${actionHref}` : `/${locale}/${actionHref}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface)]/40 px-6 py-14 text-center",
        className,
      )}
      dir={dir}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--color-charcoal)]/50">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold text-[var(--color-charcoal)]">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-charcoal)]/75">
        {subtitle}
      </p>
      <Link
        href={href}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
