"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { AgentPropertyDetails } from "@/components/agent/properties/AgentPropertyDetails";

export default function AgentPropertyDetailsPage() {
  const language = useLocale() as AppLocale;
  const params = useParams();
  const id = params?.id != null ? String(params.id) : "1";

  return <AgentPropertyDetails language={language} propertyId={id} />;
}

