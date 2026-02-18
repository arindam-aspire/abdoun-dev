"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { LanguageSelect } from "@/components/ui/language-select";
import { BrandLogo } from "@/components/layout/brand-logo";

interface SiteHeaderProps {
  language: AppLocale;
}

type MegaMenuKey = "commercial" | "residential" | null;
const SHRINK_SCROLL_Y = 36;
const EXPAND_SCROLL_Y = 12;

export function SiteHeader({ language }: SiteHeaderProps) {
  const t = useTranslations("home");
  const tAuth = useTranslations("auth");
  const [activeMenu, setActiveMenu] = useState<MegaMenuKey>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const isRTL = language === "ar";

  useEffect(() => {
    const syncScrollState = () => {
      const y = window.scrollY;

      setIsScrolled((prev) => {
        if (!prev && y >= SHRINK_SCROLL_Y) return true;
        if (prev && y <= EXPAND_SCROLL_Y) return false;
        return prev;
      });
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        syncScrollState();
        rafRef.current = null;
      });
    };

    syncScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const cancelClose = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveMenu(null);
      closeTimeoutRef.current = null;
    }, 120);
  };

  const handleOpen = (key: MegaMenuKey) => {
    cancelClose();
    setActiveMenu(key);
  };

  const handleClose = () => {
    cancelClose();
    setActiveMenu(null);
  };

  const menuConfig: Record<
    Exclude<MegaMenuKey, null>,
    {
      title: string;
      columns: { heading: string; items: { label: string; href: string }[] }[];
    }
  > = {
    commercial: {
      title: t("nav.commercial"),
      columns: [
        {
          heading: t("nav.commercial"),
          items: [
            { label: t("nav.commercialVillas"), href: `/${language}/commercial/villas` },
            { label: t("nav.commercialOffices"), href: `/${language}/commercial/offices` },
            { label: t("nav.commercialBuildings"), href: `/${language}/commercial/buildings` },
            { label: t("nav.commercialInvestment"), href: `/${language}/commercial/investment` },
          ],
        },
      ],
    },
    residential: {
      title: t("nav.residential"),
      columns: [
        {
          heading: t("nav.residential"),
          items: [
            { label: t("nav.residentialVillas"), href: `/${language}/residential/villas` },
            { label: t("nav.residentialApartments"), href: `/${language}/residential/apartments` },
            { label: t("nav.residentialLuxurious"), href: `/${language}/residential/luxurious` },
            { label: t("nav.residentialFarms"), href: `/${language}/residential/farms` },
          ],
        },
      ],
    },
  };

  const currentMenu = activeMenu ? menuConfig[activeMenu] : null;

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/20 bg-[rgba(26,59,92,0.95)] text-white backdrop-blur relative"
      dir={isRTL ? "rtl" : "ltr"}
      onMouseLeave={handleClose}
    >
      <div
        className={`container mx-auto flex items-center justify-between gap-2 px-4 transition-all duration-200 md:gap-4 ${
          isScrolled ? "py-2 md:px-8" : "py-4 md:px-8"
        }`}
      >
        <BrandLogo
          locale={language}
          priority
          imageClassName={isScrolled ? "h-7 md:h-9" : "h-8 md:h-10"}
        />

        {/* Desktop navigation */}
        <div
          className={`relative hidden md:block ${isRTL ? "text-right" : ""}`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <nav
            className={`flex items-center gap-6 text-sm font-medium text-white/80`}
          >
            <Link
              href={`/${language}/list`}
              className="border-b-2 border-transparent transition hover:border-[var(--brand-accent)] hover:text-white"
              onMouseEnter={handleClose}
              onFocus={handleClose}
            >
              {t("nav.listProperty")}
            </Link>
            <Link
              href={`/${language}/team`}
              className="border-b-2 border-transparent transition hover:border-[var(--brand-accent)] hover:text-white"
              onMouseEnter={handleClose}
              onFocus={handleClose}
            >
              {t("nav.ourTeam")}
            </Link>
            <Link
              href={`/${language}/lands`}
              className="border-b-2 border-transparent transition hover:border-[var(--brand-accent)] hover:text-white"
              onMouseEnter={handleClose}
              onFocus={handleClose}
            >
              {t("nav.lands")}
            </Link>
            <button
              className={`cursor-pointer border-b-2 transition ${
                activeMenu === "commercial"
                  ? "border-[var(--brand-accent)] text-white"
                  : "border-transparent hover:border-white/50 hover:text-white"
              }`}
              onMouseEnter={() => handleOpen("commercial")}
              onFocus={() => handleOpen("commercial")}
              type="button"
            >
              {t("nav.commercial")}
            </button>
            <button
              className={`cursor-pointer border-b-2 transition ${
                activeMenu === "residential"
                  ? "border-[var(--brand-accent)] text-white"
                  : "border-transparent hover:border-white/50 hover:text-white"
              }`}
              onMouseEnter={() => handleOpen("residential")}
              onFocus={() => handleOpen("residential")}
              type="button"
            >
              {t("nav.residential")}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <LanguageSelect value={language} showFullLabels />
          </div>
          <div className="md:hidden">
            <LanguageSelect value={language} showFullLabels={false} />
          </div>

          <Link
            href={`/${language}/login`}
            className="inline-flex h-8 items-center rounded-full border border-[var(--brand-accent)] bg-[var(--brand-accent)] px-3 text-[11px] font-semibold text-[var(--brand-secondary)] hover:brightness-95 md:h-9 md:px-4 md:text-xs"
          >
            {tAuth("signInLink")}
          </Link>
        </div>
      </div>

      {currentMenu && (
        <div
          className="absolute inset-x-0 top-full z-20 border-b border-[var(--border-subtle)] bg-white shadow-[0_16px_30px_rgba(26,59,92,0.2)]"
          onMouseEnter={() => {
            cancelClose();
          }}
          onMouseLeave={scheduleClose}
        >
          <div
            className={`container mx-auto px-4 py-5 md:px-8 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
                {currentMenu.title}
              </p>
            </div>

            <div
              className={`grid gap-6 md:grid-cols-3 ${
                isRTL ? "md:text-right" : ""
              }`}
            >
              {currentMenu.columns.map((column) => (
                <div key={column.heading} className="space-y-3">
                  {/* <p className="text-sm font-semibold text-[var(--brand-secondary)]">
                    {column.heading}
                  </p> */}
                  <ul className="space-y-1.5 text-sm">
                    {column.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1 text-[var(--color-charcoal)] transition hover:bg-[var(--surface)] hover:text-[var(--brand-secondary)]"
                        >
                          <span>{item.label}</span>
                          <span className="text-xs text-slate-400 rtl-flip-x">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

