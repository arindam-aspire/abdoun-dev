"use client";

import type { LanguageCode } from "@/lib/i18n";
import { useAppSelector } from "@/hooks/storeHooks";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PropertyDetailsMain } from "@/components/property/PropertyDetailsMain";
import { useParams } from "next/navigation";

export default function LocalizedPropertyDetailsPage() {
  const language = useAppSelector((state) => state.ui.language) as LanguageCode;
  const params = useParams<{ id: string; lang: string }>();

  const id = params?.id;
  void id;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <SiteHeader language={language} />
      <PropertyDetailsMain language={language} />
      <SiteFooter language={language} />
    </main>
  );
}

