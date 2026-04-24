import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar", "es", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
  localeCookie: false,
});

export type AppLocale = (typeof routing.locales)[number];

const RTL_LOCALES: ReadonlySet<AppLocale> = new Set(["ar"]);

/** Locales that use right-to-left layout; keep in sync with <html dir> in app/layout and UiProvider. */
export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale as AppLocale);
}
