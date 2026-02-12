"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import type { LanguageCode } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { setLanguage } from "@/features/ui/uiSlice";

const VALID_LANGUAGE_CODES: LanguageCode[] = LANGUAGES.map(
  (lang) => lang.code,
) as LanguageCode[];

export function LanguageRouteSync() {
  const params = useParams<{ lang?: string }>();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.ui.language);
  const rawLang = params?.lang;

  useEffect(() => {
    const fallback: LanguageCode = "en";
    const nextLang =
      rawLang && VALID_LANGUAGE_CODES.includes(rawLang as LanguageCode)
        ? (rawLang as LanguageCode)
        : fallback;

    if (nextLang === currentLanguage) {
      return;
    }

    dispatch(setLanguage(nextLang));
  }, [rawLang, currentLanguage, dispatch]);

  return null;
}

