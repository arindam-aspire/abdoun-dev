"use client";

import { useState } from "react";
import type { LanguageCode } from "@/lib/i18n";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeMain } from "@/components/home/home-main";

export default function Home() {
  const [language, setLanguage] = useState<LanguageCode>("en");

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      <HomeMain language={language} />
      <SiteFooter language={language} />
    </main>
  );
}
