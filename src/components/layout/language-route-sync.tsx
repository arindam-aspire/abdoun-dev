"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import type { LanguageCode } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import { useAppDispatch } from "@/hooks/storeHooks";
import { setLanguage } from "@/features/ui/uiSlice";

const VALID_LANGUAGE_CODES: LanguageCode[] = LANGUAGES.map(
  (lang) => lang.code,
) as LanguageCode[];

export function LanguageRouteSync() {
  const params = useParams<{ lang?: string }>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const rawLang = params?.lang;
    const fallback: LanguageCode = "en";

    if (!rawLang) {
      dispatch(setLanguage(fallback));
      return;
    }

    const nextLang = VALID_LANGUAGE_CODES.includes(rawLang as LanguageCode)
      ? (rawLang as LanguageCode)
      : fallback;

    dispatch(setLanguage(nextLang));
  }, [params, dispatch]);

  return null;
}

