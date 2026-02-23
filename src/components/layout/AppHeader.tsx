"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { LanguageSelect } from "@/components/ui/language-select";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AuthPopup } from "@/components/auth/AuthPopup";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { logout } from "@/features/auth/authSlice";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  APP_HEADER_CONFIG,
  resolvePublicLinksVisibility,
} from "@/components/layout/app-header.config";
import { cn } from "@/lib/cn";

const SHRINK_SCROLL_Y = 36;
const EXPAND_SCROLL_Y = 12;

interface AppHeaderProps {
  language?: AppLocale;
  showPublicLinks?: boolean;
}

export function AppHeader({ language, showPublicLinks }: AppHeaderProps = {}) {
  const currentLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const activeLanguage = language ?? currentLocale;
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const isRTL = activeLanguage === "ar";
  const shouldShowPublicLinks = resolvePublicLinksVisibility(
    pathname,
    showPublicLinks,
  );
  const navItems = APP_HEADER_CONFIG.navItems.filter(
    (item) =>
      item.id !== "listProperty" &&
      (!item.publicOnly || shouldShowPublicLinks),
  );

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

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

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/20 bg-[rgba(26,59,92,0.95)] text-white backdrop-blur relative"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={`container mx-auto flex items-center justify-between gap-2 px-4 transition-all duration-200 md:grid md:grid-cols-3 md:gap-4 ${
          isScrolled ? "py-2 md:px-8" : "py-4 md:px-8"
        }`}
      >
        <div className={`flex items-center gap-2 shrink-0 ${isRTL ? "md:justify-end" : "md:justify-start"} ${isRTL ? "flex-row-reverse" : ""}`}>
          <BrandLogo
            locale={activeLanguage}
            priority
            imageClassName={isScrolled ? "h-7 md:h-9" : "h-8 md:h-10"}
          />
          <span className="inline-flex flex-col items-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-accent)] md:px-2.5 md:text-[11px] leading-tight">
            <span>Since</span>
            <span>1988</span>
          </span>
        </div>

        <nav
          className={`hidden md:flex items-center justify-center gap-6 text-sm font-medium text-white/80 ${isRTL ? "flex-row-reverse" : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={`/${activeLanguage}${item.path}`}
              className="border-b-2 border-transparent transition hover:border-[var(--brand-accent)] hover:text-white"
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className={`flex items-center gap-2 md:gap-3 ${isRTL ? "md:justify-start" : "md:justify-end"}`}>
          <div className="hidden md:block">
            <LanguageSelect value={activeLanguage} showFullLabels />
          </div>
          <div className="md:hidden">
            <LanguageSelect value={activeLanguage} showFullLabels={false} />
          </div>
          <Link
            href={`/${activeLanguage}/list`}
            className="hidden md:inline-flex h-9 items-center rounded-full border border-[var(--brand-accent)] bg-[var(--brand-accent)] px-4 text-xs font-semibold text-[var(--brand-secondary)] transition hover:brightness-95"
          >
            {t("nav.listProperty")}
          </Link>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/20 text-xs font-bold text-white hover:bg-white/30 cursor-pointer"
                aria-label="Profile menu"
              >
                {initials}
              </button>
              {isProfileOpen ? (
                <div
                  className={cn(
                    "absolute top-11 z-30 min-w-[240px] rounded-xl border border-[var(--border-subtle)] bg-white py-2 text-[var(--color-charcoal)] shadow-xl",
                    isRTL ? "left-0" : "right-0",
                  )}
                >
                  <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {user.email}
                    </p>
                  </div>
                  <nav className="py-1 px-1" aria-label="Account menu">
                    <Link
                      href={`/${activeLanguage}/profile`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("myProfile")}
                    </Link>
                    <Link
                      href={`/${activeLanguage}/favourites`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("myFavourites")}
                    </Link>
                    <Link
                      href={`/${activeLanguage}/saved-searches`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("mySavedSearches")}
                    </Link>
                    <Link
                      href={`/${activeLanguage}/recently-viewed`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("myRecentlyViewed")}
                    </Link>
                    <Link
                      href={`/${activeLanguage}/account-settings`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("myAccountSettings")}
                    </Link>
                  </nav>
                  <div className="mt-1 border-t border-[var(--border-subtle)] px-3 pt-2 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(logout());
                        setIsProfileOpen(false);
                      }}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("signOut")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex h-8 items-center rounded-full border border-[var(--brand-accent)] bg-[var(--brand-accent)] px-3 text-[11px] font-semibold text-[var(--brand-secondary)] hover:brightness-95 md:h-9 md:px-4 md:text-xs cursor-pointer"
            >
              {tCommon("signUpSignIn")}
            </button>
          )}
        </div>
      </div>

      <AuthPopup
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        locale={activeLanguage}
      />
    </header>
  );
}
