"use client";

import { useTranslations as useIntlTranslations } from "next-intl";

type Namespace = "common" | "home" | "auth" | "agentAuth" | "agentDashboard" | "leadInquiries" | "dashboard" | "profile" | "phoneInput" | "settings" | "searchResult" | "savedSearches" | "compare" | "favourites" | "recentlyViewed" | "aboutUsPage" | "ourTeamPage" | "OurServices" |
                  "whyChooseUs" | (string & {});

export function useTranslations(namespace: Namespace) {
  return useIntlTranslations(namespace);
}

