"use client";

import { useAppSelector } from "@/hooks/storeHooks";
import { t } from "@/lib/translations";

export function useTranslations(namespace: Parameters<typeof t>[1]) {
  const lang = useAppSelector((state) => state.ui.language);
  return (key: string) => t(lang, namespace, key);
}

