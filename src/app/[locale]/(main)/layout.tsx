"use client";

import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale() as AppLocale;

  return (
    <main className="min-h-screen bg-white text-[var(--foreground)]">
      <SiteHeader language={locale} />
      <div className="pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
        <SiteFooter language={locale} />
      </div>
      <BottomNav />
    </main>
  );
}
