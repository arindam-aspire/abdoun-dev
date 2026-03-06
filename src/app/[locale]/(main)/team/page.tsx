"use client";

import { useLocale } from "next-intl";
import { TeamMain } from "@/components/team/TeamMain";
import type { AppLocale } from "@/i18n/routing";

export default function TeamPage() {
  const language = useLocale() as AppLocale;

  return <TeamMain language={language} />;
}
