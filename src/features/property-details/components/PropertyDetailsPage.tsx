"use client";

import type { AppLocale } from "@/i18n/routing";
import { PropertyDetailsMain } from "./PropertyDetailsMain";

export interface PropertyDetailsPageProps {
  language: AppLocale;
  propertyId: string;
}

export function PropertyDetailsPage({ language, propertyId }: PropertyDetailsPageProps) {
  return <PropertyDetailsMain language={language} propertyId={propertyId} />;
}

