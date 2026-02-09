"use client";

import type { LanguageCode } from "@/lib/i18n";
import { useAppSelector } from "@/hooks/storeHooks";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeMain } from "@/components/home/home-main";
import { useParams } from "next/navigation";

export default function LocalizedHomePage() {
  const params = useParams<{ lang?: string }>();
  const storeLanguage = useAppSelector(
    (state) => state.ui.language,
  ) as LanguageCode;

  const urlLanguage = (params?.lang as LanguageCode) || "en";
  const language = (storeLanguage || urlLanguage) as LanguageCode;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <SiteHeader language={language} />
      <HomeMain language={language} />
      <SiteFooter language={language} />
    </main>
  );
}

