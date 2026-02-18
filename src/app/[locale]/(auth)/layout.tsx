"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { LanguageSelect } from "@/components/ui/language-select";

interface AuthCardLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthCardLayoutProps) {
  const language = useLocale() as AppLocale;
  const t = useTranslations("auth");
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col">
      {/* Top-right language selector - same as home page */}
      <div
        className={`absolute top-0 p-4 md:p-6 ${
          isRtl ? "left-0 right-auto" : "right-0"
        }`}
      >
        <LanguageSelect
          id="auth-language"
          value={language}
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
