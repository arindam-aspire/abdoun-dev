"use client";

import { useLocale } from "next-intl";
import { PropertyDetailsMain } from "@/components/property/PropertyDetailsMain";
import type { AppLocale } from "@/i18n/routing";

export default function LocalizedPropertyDetailsPage() {
  const language = useLocale() as AppLocale;
  return <PropertyDetailsMain language={language} />;
}

