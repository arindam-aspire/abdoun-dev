"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { PropertyDetailsPage } from "@/features/property-details/components/PropertyDetailsPage";
import type { AppLocale } from "@/i18n/routing";

export default function LocalizedPropertyDetailsPage() {
  const language = useLocale() as AppLocale;
  const params = useParams();
  const id = params?.id != null ? String(params.id) : "1";
  return <PropertyDetailsPage language={language} propertyId={id} />;
}

