"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { PropertyDetailsMain } from "@/components/property/property-details/PropertyDetailsMain";
import type { AppLocale } from "@/i18n/routing";

export default function LocalizedPropertyDetailsPage() {
  const language = useLocale() as AppLocale;
  const params = useParams();
  const id = params?.id != null ? String(params.id) : "1";
  return <PropertyDetailsMain language={language} propertyId={id} />;
}

