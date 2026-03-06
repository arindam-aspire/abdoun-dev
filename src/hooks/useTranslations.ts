"use client";

import { useTranslations as useIntlTranslations } from "next-intl";

type Namespace = "common" | "home" | "auth" | "agentAuth" | "agentDashboard" | "dashboard" | "profile" | "searchResult" | "savedSearches" | "compare" | "favourites" | "aboutUsPage" | "ourTeamPage";

export function useTranslations(namespace: Namespace) {
  return useIntlTranslations(namespace);
}

