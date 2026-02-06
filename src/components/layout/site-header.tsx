"use client";

import type { LanguageCode } from "@/lib/i18n";
import { LANGUAGES, homeTranslations } from "@/lib/i18n";
import { Building2 } from "lucide-react";

interface SiteHeaderProps {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

export function SiteHeader({ language, onLanguageChange }: SiteHeaderProps) {
  const t = homeTranslations[language];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div
        className={`mx-auto flex container items-center justify-between gap-4 px-4 py-4 md:px-8 ${
          language === "ar" ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            language === "ar" ? "flex-row-reverse text-right" : ""
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
              Abdoun Real Estate
            </p>
            {/* <p className="text-sm text-slate-500">
              {t.heroSubtitle}
            </p> */}
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <button className="text-slate-900">
            {t.heroTabs.buy}
          </button>
          <button className="hover:text-slate-900">{t.heroTabs.rent}</button>
          <button className="hover:text-slate-900">{t.heroTabs.sell}</button>
          <button className="hover:text-slate-900">
            {/* simple reuse of label */}
            {t.footerQuickLinks.agents}
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            aria-label="Select language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          <button className="hidden h-9 items-center rounded-full border border-slate-200 px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 md:inline-flex">
            Sign In
          </button>
          <button className="hidden h-9 items-center rounded-full bg-sky-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 md:inline-flex">
            Contact Us
          </button>
        </div>
      </div>
    </header>
  );
}

