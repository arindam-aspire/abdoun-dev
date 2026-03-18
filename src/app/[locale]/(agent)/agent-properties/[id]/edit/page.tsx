"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { AgentPropertyEdit } from "@/features/admin-agents/agent-dashboard/components/agent-properties/AgentPropertyEdit";

export default function AgentPropertyEditPage() {
  const language = useLocale() as AppLocale;
  const params = useParams();
  const id = params?.id != null ? String(params.id) : "1";

  return <AgentPropertyEdit language={language} propertyId={id} />;
}

