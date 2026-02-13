"use client";

import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale() as AppLocale;

  return (
    <main className="min-h-screen bg-linear-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <SiteHeader language={locale} />
      {children}
      <SiteFooter language={locale} />
    </main>
  );
}
