"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { AdminPropertyDetailsMain } from "@/components/admin/properties/property-details/AdminPropertyDetailsMain";
import type { AppLocale } from "@/i18n/routing";

export default function AdminPropertyDetailsPage() {
  const language = useLocale() as AppLocale;
  const params = useParams();
  const id = params?.id != null ? String(params.id) : "1";

  return <AdminPropertyDetailsMain language={language} propertyId={id} />;
}
