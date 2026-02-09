"use client";

import type { LanguageCode } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { setLanguage } from "@/features/ui/uiSlice";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PropertyDetailsMain } from "@/components/property/PropertyDetailsMain";

export default function PropertyDetailsPage() {
  const language = useAppSelector((state) => state.ui.language) as LanguageCode;
  const dispatch = useAppDispatch();

  const handleLanguageChange = (lang: LanguageCode) => {
    dispatch(setLanguage(lang));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <SiteHeader language={language} onLanguageChange={handleLanguageChange} />
      <PropertyDetailsMain language={language} />
      <SiteFooter language={language} />
    </main>
  );
}

