import { AppLocale } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

export default function AppFooter(): React.JSX.Element {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("home");
  const isArabic = locale === "ar";
  return (
    <footer
      className={`overflow-x-clip border-t border-secondary bg-secondary text-white py-6 ${
        locale === "ar" ? "text-right" : "text-left"
      }`}
    >
      <div className="container mx-auto flex flex-col gap-5 py-4 px-4 md:px-8">
        <div
          className={`flex w-full flex-wrap items-center gap-6 ${
            isArabic ? "justify-end flex-row-reverse" : "justify-start"
          }`}
        >
          <Link
            href={`/${locale}/about`}
            className="text-white/70 hover:text-white"
          >
            {t("nav.aboutUs")}
          </Link>
          <Link
            href={`/${locale}/ourservices`}
            className="text-white/70 hover:text-white"
          >
            {t("servicesTitle")}
          </Link>
        </div>
        <span
          className={`flex w-full flex-col items-center gap-3 sm:w-auto md:flex-row md:items-center ${
            isArabic ? "sm:items-start md:flex-row-reverse" : "sm:items-end md:self-end"
          }`}
        >
          <span className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)] text-white hover:opacity-90 transition-opacity"
              aria-label="Instagram"
              title="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12.04 2C6.56 2 2.11 6.42 2.11 11.87c0 1.74.46 3.44 1.33 4.93L2 22l5.36-1.4a10 10 0 0 0 4.68 1.18h.01c5.48 0 9.93-4.42 9.93-9.87S17.53 2 12.04 2zm5.8 13.97c-.24.66-1.4 1.25-1.94 1.33-.5.08-1.13.12-1.82-.1-.42-.13-.96-.31-1.65-.6-2.9-1.24-4.8-4.12-4.95-4.32-.15-.2-1.18-1.56-1.18-2.97 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.49.24.58.81 2 .88 2.15.07.15.11.33.02.53-.09.2-.13.33-.26.5-.13.17-.28.38-.4.51-.13.14-.26.29-.11.57.15.28.67 1.1 1.44 1.79.99.88 1.83 1.15 2.09 1.28.26.13.41.11.56-.07.15-.18.66-.77.84-1.04.18-.26.35-.22.59-.13.24.09 1.53.72 1.79.85.26.13.44.2.5.31.06.11.06.66-.18 1.32z" />
              </svg>
            </a>
          </span>
          <span className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 flex-shrink-0 rounded-lg bg-[#000] px-2 py-1.5 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              aria-label="Get it on Google Play"
              title="Get it on Google Play"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 flex-shrink-0"
                aria-hidden
              >
                <path
                  fill="#00C853"
                  d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L12.001 12l5.697-3.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.636z"
                />
              </svg>
              <span className="text-size-2xs fw-medium text-white leading-tight">
                <span className="block">Get it on</span>
                <span className="block fw-semibold">Google Play</span>
              </span>
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 flex-shrink-0 rounded-lg bg-[#000] px-2 py-1.5 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              aria-label="Available on the App Store"
              title="Available on the App Store"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 flex-shrink-0 text-white"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
              <span className="text-size-2xs fw-medium text-white leading-tight">
                <span className="block">Available on the</span>
                <span className="block fw-semibold">App Store</span>
              </span>
            </a>
          </span>
        </span>
      </div>
      {/* Terms, Privacy Policy and Copyright on the same line */}
      <div className="border-t border-white/15 bg-secondary">
        <div
          className={`mx-auto flex container flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 text-[11px] text-white/70 md:px-8`}
        >
          <span className="flex items-center gap-x-4 gap-y-2 flex-wrap">
            <Link
              href={`/${locale}/terms-and-conditions`}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t("footerTerms")}
            </Link>
            <span className="text-white/50" aria-hidden>|</span>
            <Link
              href={`/${locale}/privacy-policy`}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t("footerPrivacy")}
            </Link>
          </span>
          <span className="text-size-11 text-white/70 shrink-0">
            {t("footerCopyright", { year: new Date().getFullYear() })}
          </span>
        </div>
      </div>
    </footer>
  );
}


