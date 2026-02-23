"use client";

import { useLocale } from "next-intl";
import { SearchResultMain } from "@/components/search-result/SearchResultMain";
import type { AppLocale } from "@/i18n/routing";

export default function SearchResultPage() {
  const language = useLocale() as AppLocale;

  return <SearchResultMain language={language} />;
}
