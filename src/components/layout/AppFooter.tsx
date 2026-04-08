import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/cn";
import { AppLocale } from "@/i18n/routing";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

const overviewLinks = (locale: AppLocale, t: ReturnType<typeof useTranslations>) => [
  { href: `/${locale}/search-result`, label: "Properties" },
  { href: `/${locale}#services`, label: t("servicesTitle") },
  { href: `/${locale}/about`, label: t("nav.aboutUs") },
  { href: `/${locale}/team`, label: t("nav.ourTeam") },
];

const socialLinks = [
  {
    href: "https://www.facebook.com/AbdounRealEstate",
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: "https://www.instagram.com/",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://wa.me/",
    label: "WhatsApp",
    icon: MessageCircle,
  },
];

export default function AppFooter(): React.JSX.Element {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("home");
  const isArabic = locale === "ar";

  return (
    <footer
      className={cn(
        "overflow-x-clip bg-[#355777] pt-10 pb-6 text-white",
        isArabic ? "text-right" : "text-left",
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div
          className={cn(
            "grid gap-7 pb-7 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_1fr_1.3fr]",
            isArabic && "xl:[&>*]:text-right",
          )}
        >
          <div className="max-w-sm space-y-4">
            <BrandLogo
              locale={locale}
              variant="white"
              imageClassName="h-14 w-auto"
            />
            <p className="max-w-xs text-sm leading-6 text-white/75 md:text-[15px]">
              Jordan&apos;s premier real estate agency, serving clients with
              excellence.
            </p>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg font-semibold tracking-tight text-white">
              Overview
            </h3>
            <nav className="flex flex-col gap-3" aria-label="Footer overview">
              {overviewLinks(locale, t).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base text-white/75 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg font-semibold tracking-tight text-white">
              Contact
            </h3>
            <div className="space-y-4 text-base text-white/75">
              <a
                href="tel:+96260000000"
                className={cn(
                  "flex items-center gap-3 transition hover:text-white",
                  isArabic && "flex-row-reverse justify-end",
                )}
              >
                <Phone className="h-6 w-6 shrink-0 text-white/85" />
                <span>+962-6-0000000</span>
              </a>
              <a
                href="mailto:daboug2025@gmail.com"
                className={cn(
                  "flex items-center gap-3 transition hover:text-white",
                  isArabic && "flex-row-reverse justify-end",
                )}
              >
                <Mail className="h-6 w-6 shrink-0 text-white/85" />
                <span className="break-all">daboug2025@gmail.com</span>
              </a>
              <div
                className={cn(
                  "flex items-center gap-3",
                  isArabic && "flex-row-reverse justify-end",
                )}
              >
                <MapPin className="h-6 w-6 shrink-0 text-white/85" />
                <span>Abdoun, Amman, Jordan</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-5">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Follow Us
              </h3>
              <div
                className={cn(
                  "flex flex-wrap gap-3",
                  isArabic && "xl:justify-end",
                )}
              >
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12 text-white/90 transition hover:bg-white/18 hover:text-white"
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium tracking-tight text-white/90">
                Download our app
              </h3>
              <div
                className={cn(
                  "flex flex-wrap gap-3 xl:flex-nowrap",
                  isArabic && "xl:justify-end",
                )}
              >
                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 min-w-[188px] items-center gap-2.5 rounded-lg border border-white/20 bg-black px-3.5 text-white shadow-sm transition hover:opacity-90"
                  aria-label="Available on the App Store"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 shrink-0"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                    />
                  </svg>
                  <span className="leading-tight">
                    <span className="block text-[10px] uppercase tracking-[0.12em] text-white/70">
                      Download on the
                    </span>
                    <span className="block text-base font-semibold">
                      App Store
                    </span>
                  </span>
                </a>
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 min-w-[198px] items-center gap-2.5 rounded-lg border border-white/20 bg-black px-3.5 text-white shadow-sm transition hover:opacity-90"
                  aria-label="Get it on Google Play"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 shrink-0"
                    aria-hidden
                  >
                    <path
                      fill="#00C853"
                      d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L12.001 12l5.697-3.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.636z"
                    />
                  </svg>
                  <span className="leading-tight">
                    <span className="block text-[10px] uppercase tracking-[0.12em] text-white/70">
                      Get it on
                    </span>
                    <span className="block text-base font-semibold">
                      Google Play
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-3 border-t border-white/15 pt-4 text-sm text-white/75 md:flex-row md:items-center md:justify-between",
            isArabic && "md:flex-row-reverse",
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/terms-and-conditions`}
              className="transition hover:text-white"
            >
              {t("footerTerms")}
            </Link>
            <span className="text-white/45" aria-hidden>
              |
            </span>
            <Link
              href={`/${locale}/privacy-policy`}
              className="transition hover:text-white"
            >
              {t("footerPrivacy")}
            </Link>
          </div>

          <p className="text-sm text-white/75">
            {t("footerCopyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
