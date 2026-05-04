"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { AgentSearch } from "./AgentSearch";
import { AgentSearchResults } from "./AgentSearchResults";

function getPageTitle(
  t: (key: string, values?: Record<string, string>) => string,
  searchParams: URLSearchParams,
): string {
  return t("properties");
}

export function AgentProperties() {
  const language = useLocale() as AppLocale;
  const searchParams = useSearchParams();
  const t = useTranslations("searchResult");
  const pageTitle = getPageTitle(t, searchParams);

  return (
    <section className="space-y-4">
      <AgentSearch language={language} />
      <AgentSearchResults language={language} resultsTitle={pageTitle} searchParams={searchParams} />
    </section>
  );
}

