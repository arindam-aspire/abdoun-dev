"use client";

import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { setLanguage } from "@/features/ui/uiSlice";
import type { LanguageCode } from "@/lib/i18n";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageSelect } from "@/components/ui/language-select";

interface AuthCardLayoutProps {
  children: ReactNode;
}

export function AuthCardLayout({ children }: AuthCardLayoutProps) {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);
  const t = useTranslations("auth");

  const handleLanguageChange = (lang: LanguageCode) => {
    dispatch(setLanguage(lang));
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      {/* Top-right language selector - same as home page */}
      <div className="absolute top-0 right-0 p-4 md:p-6">
        <LanguageSelect
          id="auth-language"
          value={language as LanguageCode}
          onChange={handleLanguageChange}
          showFullLabels
        />
      </div>

      {/* Centered card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>

      {/* Footer copyright */}
      <footer className="py-6 text-center">
        <p className="text-xs text-zinc-500">{t("copyright")}</p>
      </footer>
    </div>
  );
}
