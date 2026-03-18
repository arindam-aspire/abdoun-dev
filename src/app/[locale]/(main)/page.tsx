"use client";

import { useLocale } from "next-intl";
import { HomePage } from "@/features/public-home/components/HomePage";
import type { AppLocale } from "@/i18n/routing";

export default function LocalizedHomePage() {
  const language = useLocale() as AppLocale;

  return <HomePage language={language} />;
}

