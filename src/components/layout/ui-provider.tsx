"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/hooks/storeHooks";

export function UiProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state) => state.ui.theme);
  const language = useAppSelector((state) => state.ui.language);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("lang", language);
    root.dataset.theme = theme;
    root.dir = language === "ar" ? "rtl" : "ltr";
  }, [theme, language]);

  return <>{children}</>;
}

