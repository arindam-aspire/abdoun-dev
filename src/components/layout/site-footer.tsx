import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { Building2 } from "lucide-react";

interface SiteFooterProps {
  language: AppLocale;
}

export function SiteFooter({ language }: SiteFooterProps) {
  const t = useTranslations("home");

  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-900 text-slate-200">
      {/* Top multi-column area */}
      <div
        className={`mx-auto container ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        <div className="px-4 py-12 md:px-8 grid gap-10 md:gap-14 text-sm text-slate-300 md:grid-cols-4">
          {/* Brand / description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">
              Abdoun Real Estate
            </p>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {t("footerDescription")}
            </p>
          </div>

          {/* Properties / links column */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-100">
              {t("footerQuickLinks.buy")} / {t("footerQuickLinks.rent")}
            </p>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Properties in Amman
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                Abdoun | Dabouq | Dair Ghbar | Khalda | Abdali | Umm Uthaina
              </p>
            </div>
            <div className="space-y-1 pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                New Projects
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                Luxury villas | Branded residences | Serviced apartments
              </p>
            </div>
          </div>

          {/* Company / network */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-100">
              {t("footerCompany.about")}
            </p>
            <p className="text-xs leading-relaxed text-slate-400">
              Abdoun Real Estate connects buyers, sellers, and investors with
              curated properties across West Amman and beyond.
            </p>
            <div className="space-y-1 pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                More from our network
              </p>
              <p className="text-xs text-slate-400">
                Market Insights | Neighborhood Guides
              </p>
            </div>
          </div>

          {/* Apps / newsletter */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("footerStayUpdatedTitle")}
            </p>
            <p>{t("footerStayUpdatedCopy")}</p>
            <div
              className={`mt-1 flex flex-col gap-2 sm:flex-row ${
                language === "ar" ? "sm:flex-row-reverse" : ""
              }`}
            >
              <input
                type="email"
                placeholder={t("footerEmailPlaceholder")}
                className="h-9 flex-1 rounded-full border border-slate-700 bg-slate-900/60 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-900"
              />
              <button className="h-9 rounded-full bg-sky-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-sky-500">
                {t("footerSubscribe")}
              </button>
            </div>
            </div>
        </div>
      </div>

        {/* Get the app + social — one line, centered */}
        <div className="border-t border-slate-800 px-4 py-4 md:px-8">
          <div
            className={`mx-auto container flex flex-nowrap items-center justify-center gap-3 overflow-x-auto container ${
              language === "ar" ? "flex-row-reverse" : ""
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">
              Get the app
            </p>
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 flex-shrink-0 rounded-lg bg-[#000] px-2 py-1.5 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              aria-label="Get it on Google Play"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 flex-shrink-0" aria-hidden>
                <path
                  fill="#00C853"
                  d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L12.001 12l5.697-3.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.636z"
                />
              </svg>
              <span className="text-[10px] font-medium text-white leading-tight">
                <span className="block">Get it on</span>
                <span className="block font-semibold">Google Play</span>
              </span>
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 flex-shrink-0 rounded-lg bg-[#000] px-2 py-1.5 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              aria-label="Available on the App Store"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-white" aria-hidden>
                <path
                  fill="currentColor"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
              <span className="text-[10px] font-medium text-white leading-tight">
                <span className="block">Available on the</span>
                <span className="block font-semibold">App Store</span>
              </span>
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0A66C2] text-white hover:opacity-90 transition-opacity"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FF0000] text-white hover:opacity-90 transition-opacity"
              aria-label="YouTube"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)] text-white hover:opacity-90 transition-opacity"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black text-white hover:opacity-90 transition-opacity"
              aria-label="X (Twitter)"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
        {/* Middle link bar */}
        <div className="border-t border-slate-800 bg-slate-900">
          <div
            className={`mx-auto flex container flex-wrap items-center gap-4 px-4 py-3 text-[11px] text-slate-400 md:px-8 ${
              language === "ar" ? "justify-end" : ""
            }`}
          >
            <button className="hover:text-slate-200">{t("footerTerms")}</button>
            <button className="hover:text-slate-200">{t("footerPrivacy")}</button>
            <button className="hover:text-slate-200">Blog</button>
            <button className="hover:text-slate-200">Help Center</button>
            <button className="hover:text-slate-200">Sell with us</button>
          </div>
        </div>

        {/* Disclaimer strip */}
        <div className="border-t border-slate-800 bg-slate-900">
          <div
            className={`mx-auto container px-4 py-4 md:px-8 text-[10px] leading-relaxed text-slate-500 ${
              language === "ar" ? "text-right" : "text-left"
            }`}
          >
            <p>
              Abdoun Real Estate acts only as an intermediary platform to
              connect property buyers, sellers and renters. We do not own,
              operate, or control any of the properties listed on the platform
              and are not responsible for the completeness, accuracy or
              legality of any listings. Users are advised to conduct their own
              due diligence and seek professional advice before entering into
              any transaction.
            </p>
          </div>
        </div>

        {/* Bottom dark bar */}
        <div className="bg-slate-950">
          <div
            className={`mx-auto flex container flex-col gap-2 px-4 py-3 text-[11px] text-slate-300 md:flex-row md:items-center md:justify-between md:px-8 ${
              language === "ar" ? "text-right" : "text-left"
            }`}
          >
            <p>
              © {new Date().getFullYear()} Abdoun Real Estate.{" "}
              {language === "ar"
                ? "عبدون العقارية، جميع الحقوق محفوظة."
                : "All rights reserved."}
            </p>
            <p className="text-[10px] text-slate-400">
              All trademarks and logos belong to their respective owners.
            </p>
          </div>
      </div>
    </footer>
  );
}

