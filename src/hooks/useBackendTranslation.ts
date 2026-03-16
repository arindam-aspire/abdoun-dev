"use client";

import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";

type BackendLocalizedField =
  | string
  | Record<string, string | null | undefined>
  | null
  | undefined;

const normalizeLocaleKey = (locale: string): string => {
  const base = locale.toLowerCase().split("-")[0];
  if (base === "es") return "esp";
  return base;
};

export const useBackendTranslation = () => {
  const locale = useLocale() as AppLocale;

  const tBackend = (field: BackendLocalizedField, fallback = "en"): string => {
    if (!field) return "";
    if (typeof field === "string") return field;

    const localeKey = normalizeLocaleKey(locale);
    const fallbackKey = normalizeLocaleKey(fallback);

    return (
      field[localeKey] ||
      field[fallbackKey] ||
      Object.values(field).find((value): value is string => Boolean(value)) ||
      ""
    );
  };

  return { tBackend };
};

