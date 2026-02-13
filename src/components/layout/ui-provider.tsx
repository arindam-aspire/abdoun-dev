"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/hooks/storeHooks";

export function UiProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state) => state.ui.theme);
  const locale = useLocale();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("lang", locale);
    root.dataset.theme = theme;
    root.dir = locale === "ar" ? "rtl" : "ltr";
  }, [theme, locale]);

  return <>{children}</>;
}

