"use client";

import { useLocale } from "next-intl";
import { AdminSearchResultMain } from "@/features/admin-agents/admin-dashboard/components/admin-properties/AdminSearchResultMain";
import type { AppLocale } from "@/i18n/routing";

export default function AdminPropertiesPage() {
  const language = useLocale() as AppLocale;

  return <AdminSearchResultMain language={language} />;
}
