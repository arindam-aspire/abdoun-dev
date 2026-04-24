"use client";

import { useSession } from "@/features/auth/hooks/useSession";
import { cn } from "@/lib/cn";
import { Construction } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { AppLocale } from "@/i18n/routing";

export default function UnderDevelopmentPage() {
  const t = useTranslations("underDevelopment");
  const locale = useLocale() as AppLocale;
  const { role } = useSession();
  const dashboardHref =
    role === "agent"
      ? `/${locale}/agent-dashboard`
      : role === "admin"
      ? `/${locale}/admin-dashboard`
      : null;

  return (
    <main className="min-h-[calc(100vh-12rem)] px-4 py-8 md:px-6 md:py-12">
      <section className="mx-auto max-w-3xl">
        <article className="relative overflow-hidden rounded-2xl border border-subtle bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[var(--brand-accent)]/10 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--brand-secondary)]/25 bg-[var(--brand-secondary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--brand-secondary)]">
              {t("badge")}
            </span>

            <h1 className="mt-4 text-2xl font-semibold text-[var(--color-charcoal)] md:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 md:text-base">
              {t("subtitle")}
            </p>

            <div className="mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-primary)]/20 via-[var(--brand-secondary)]/15 to-transparent">
              <Construction className="h-10 w-10 animate-pulse text-[var(--brand-secondary)]" />
            </div>

            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand-secondary)] px-6 text-sm font-semibold text-white transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]/40"
              >
                {t("backHome")}
              </Link>

              {dashboardHref ? (
                <Link
                  href={dashboardHref}
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-xl border border-[var(--brand-secondary)]/30 bg-white px-6 text-sm font-semibold text-[var(--brand-secondary)] transition hover:bg-[var(--brand-secondary)]/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]/40",
                  )}
                >
                  {t("goDashboard")}
                </Link>
              ) : null}
            </div>

            <p className="mt-6 text-xs text-zinc-500 md:text-sm">{t("support")}</p>
            <p className="mt-1 text-xs text-zinc-400">{t("expected")}</p>
          </div>
        </article>
      </section>
    </main>
  );
}
