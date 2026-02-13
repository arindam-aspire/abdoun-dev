"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { Building2 } from "lucide-react";
import { LanguageSelect } from "@/components/ui/language-select";

interface SiteHeaderProps {
  language: AppLocale;
}

type MegaMenuKey = "buy" | "rent" | "sell" | "agents" | null;
const SHRINK_SCROLL_Y = 36;
const EXPAND_SCROLL_Y = 12;

export function SiteHeader({ language }: SiteHeaderProps) {
  const t = useTranslations("home");
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
      description: string;
      columns: { heading: string; items: { label: string; href: string }[] }[];
    }
  > = {
    buy: {
      title: t("heroTabs.buy"),
      description:
        "Find your next home to purchase with advanced filters and real‑time insights.",
      columns: [
        {
          heading: "Search homes",
          items: [
            { label: "Homes for sale", href: `/${language}/buy` },
            { label: "New construction", href: `/${language}/buy/new` },
            { label: "Luxury properties", href: `/${language}/buy/luxury` },
            { label: "Off‑plan projects", href: `/${language}/buy/off-plan` },
          ],
        },
        {
          heading: "Tools",
          items: [
            { label: "Mortgage calculator", href: `/${language}/tools/mortgage` },
            { label: "Affordability", href: `/${language}/tools/affordability` },
            { label: "Neighborhood insights", href: `/${language}/neighborhoods` },
          ],
        },
        {
          heading: "Guides",
          items: [
            { label: "Buying in Abdoun", href: `/${language}/guides/buying` },
            { label: "Closing process", href: `/${language}/guides/closing` },
            { label: "Investment tips", href: `/${language}/guides/investing` },
          ],
        },
      ],
    },
    rent: {
      title: t("heroTabs.rent"),
      description:
        "Explore premium rentals, furnished options, and long‑term stays.",
      columns: [
        {
          heading: "Browse rentals",
          items: [
            { label: "Apartments for rent", href: `/${language}/rent` },
            { label: "Furnished rentals", href: `/${language}/rent/furnished` },
            { label: "Short‑term stays", href: `/${language}/rent/short-term` },
          ],
        },
        {
          heading: "By lifestyle",
          items: [
            { label: "Family‑friendly", href: `/${language}/rent/family` },
            { label: "Pet‑friendly", href: `/${language}/rent/pet-friendly` },
            { label: "Near schools", href: `/${language}/rent/schools` },
          ],
        },
        {
          heading: "Resources",
          items: [
            { label: "Tenant guide", href: `/${language}/guides/renting` },
            { label: "Rental checklist", href: `/${language}/guides/checklist` },
          ],
        },
      ],
    },
    sell: {
      title: t("heroTabs.sell"),
      description:
        "Get accurate pricing, expert guidance, and maximum visibility for your property.",
      columns: [
        {
          heading: "Start selling",
          items: [
            { label: "Request a valuation", href: `/${language}/sell/valuation` },
            { label: "List your property", href: `/${language}/sell` },
            { label: "Developer services", href: `/${language}/sell/developers` },
          ],
        },
        {
          heading: "Pricing tools",
          items: [
            { label: "Market reports", href: `/${language}/market-reports` },
            { label: "Recent sales", href: `/${language}/recent-sales` },
          ],
        },
        {
          heading: "Seller guides",
          items: [
            { label: "Preparing to sell", href: `/${language}/guides/selling` },
            { label: "Marketing strategy", href: `/${language}/guides/marketing` },
          ],
        },
      ],
    },
    agents: {
      title: t("footerQuickLinks.agents"),
      description:
        "Connect with top local agents who specialize in Abdoun and surrounding areas.",
      columns: [
        {
          heading: "Find an agent",
          items: [
            { label: "Browse agents", href: `/${language}/agents` },
            { label: "Top‑rated agents", href: `/${language}/agents/top-rated` },
            { label: "By neighborhood", href: `/${language}/agents/neighborhoods` },
          ],
        },
        {
          heading: "For agents",
          items: [
            { label: "Join Abdoun Real Estate", href: `/${language}/agents/join` },
            { label: "Marketing toolkit", href: `/${language}/agents/marketing` },
          ],
        },
        {
          heading: "Resources",
          items: [
            { label: "Partner program", href: `/${language}/agents/partners` },
            { label: "Training & events", href: `/${language}/agents/events` },
          ],
        },
      ],
    },
  };

  const currentMenu = activeMenu ? menuConfig[activeMenu] : null;

  return (
    <header
      className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur relative"
      dir={isRTL ? "rtl" : "ltr"}
      onMouseLeave={handleClose}
    >
      <div
        className={`container mx-auto flex items-center justify-between gap-4 px-4 transition-all duration-200 ${
          isScrolled ? "py-2 md:px-8" : "py-4 md:px-8"
        }`}
      >
        <Link
          href={`/${language}`}
          className={`flex items-center gap-3 transition hover:opacity-90`}
          aria-label="Go to home page"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
              Abdoun Real Estate
            </p>
            {/* <p className="text-sm text-slate-500">
              {t.heroSubtitle}
            </p> */}
          </div>
        </Link>

        {/* Desktop navigation */}
        <div
          className={`relative hidden md:block ${isRTL ? "text-right" : ""}`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <nav
            className={`flex items-center gap-6 text-sm font-medium text-slate-600`}
          >
            <button
              className={`cursor-pointer border-b-2 transition ${
                activeMenu === "buy"
                  ? "border-sky-600 text-slate-900"
                  : "border-transparent hover:border-slate-200 hover:text-slate-900"
              }`}
              onMouseEnter={() => handleOpen("buy")}
              onFocus={() => handleOpen("buy")}
              type="button"
            >
              {t("heroTabs.buy")}
            </button>
            <button
              className={`cursor-pointer border-b-2 transition ${
                activeMenu === "rent"
                  ? "border-sky-600 text-slate-900"
                  : "border-transparent hover:border-slate-200 hover:text-slate-900"
              }`}
              onMouseEnter={() => handleOpen("rent")}
              onFocus={() => handleOpen("rent")}
              type="button"
            >
              {t("heroTabs.rent")}
            </button>
            <button
              className={`cursor-pointer border-b-2 transition ${
                activeMenu === "sell"
                  ? "border-sky-600 text-slate-900"
                  : "border-transparent hover:border-slate-200 hover:text-slate-900"
              }`}
              onMouseEnter={() => handleOpen("sell")}
              onFocus={() => handleOpen("sell")}
              type="button"
            >
              {t("heroTabs.sell")}
            </button>
            <button
              className={`cursor-pointer border-b-2 transition ${
                activeMenu === "agents"
                  ? "border-sky-600 text-slate-900"
                  : "border-transparent hover:border-slate-200 hover:text-slate-900"
              }`}
              onMouseEnter={() => handleOpen("agents")}
              onFocus={() => handleOpen("agents")}
              type="button"
            >
              {/* simple reuse of label */}
              {t("footerQuickLinks.agents")}
            </button>
          </nav>
        </div>

        <div
          className={`flex items-center gap-3`}
        >
          <LanguageSelect value={language} showFullLabels />

          <Link
            href={`/${language}/login`}
            className="hidden h-9 items-center rounded-full border border-slate-200 px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 md:inline-flex"
          >
            Sign In
          </Link>
        </div>
      </div>

      {currentMenu && (
        <div
          className="absolute inset-x-0 top-full z-20 border-b border-slate-100 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.12)]"
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
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
                {currentMenu.title}
              </p>
              <p className="hidden max-w-xl text-xs text-slate-500 md:block">
                {currentMenu.description}
              </p>
            </div>

            <div
              className={`grid gap-6 md:grid-cols-3 ${
                isRTL ? "md:text-right" : ""
              }`}
            >
              {currentMenu.columns.map((column) => (
                <div key={column.heading} className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {column.heading}
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {column.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1 text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
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

