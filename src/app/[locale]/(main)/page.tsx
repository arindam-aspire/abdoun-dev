"use client";

import { useLocale } from "next-intl";
import { HomeMain } from "@/components/home/home-main";
import type { AppLocale } from "@/i18n/routing";

export default function LocalizedHomePage() {
  const language = useLocale() as AppLocale;

  return <HomeMain language={language} />;
}

