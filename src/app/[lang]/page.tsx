"use client";

import type { LanguageCode } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeMain } from "@/components/home/home-main";
import { useParams } from "next/navigation";

const VALID_LANGUAGE_CODES: LanguageCode[] = LANGUAGES.map(
  (lang) => lang.code,
) as LanguageCode[];

export default function LocalizedHomePage() {
  const params = useParams<{ lang?: string }>();

  const urlLanguage = params?.lang as LanguageCode | undefined;
  const language =
    urlLanguage && VALID_LANGUAGE_CODES.includes(urlLanguage)
      ? urlLanguage
      : "en";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <SiteHeader language={language} />
      <HomeMain language={language} />
      <SiteFooter language={language} />
    </main>
  );
}

