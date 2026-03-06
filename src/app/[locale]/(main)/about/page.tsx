"use client";

import { useLocale } from "next-intl";
import { AboutMain } from "@/components/about/AboutMain";
import type { AppLocale } from "@/i18n/routing";

export default function AboutPage() {
  const language = useLocale() as AppLocale;

  return <AboutMain language={language} />;
}
