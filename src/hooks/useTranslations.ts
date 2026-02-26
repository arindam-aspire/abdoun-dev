"use client";

import { useTranslations as useIntlTranslations } from "next-intl";

type Namespace = "common" | "home" | "auth" | "dashboard" | "profile" | "searchResult" | "savedSearches" | "compare" | "favourites";

export function useTranslations(namespace: Namespace) {
  return useIntlTranslations(namespace);
}

