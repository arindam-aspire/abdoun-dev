"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { LanguageSelect } from "@/components/ui/language-select";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AuthPopup } from "@/components/auth/AuthPopup";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { logout } from "@/features/auth/authSlice";
import { clearProfileForUser } from "@/features/profile/profileSlice";
import { clearAuthSession } from "@/lib/auth/sessionCookies";

interface SiteHeaderProps {
  language: AppLocale;
}

const SHRINK_SCROLL_Y = 36;
const EXPAND_SCROLL_Y = 12;

export function SiteHeader({ language }: SiteHeaderProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountSettingsHover, setIsAccountSettingsHover] = useState(false);
  const rafRef = useRef<number | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const isRTL = language === "ar";

  const initials = user?.name
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
        className={`container mx-auto flex items-center justify-between gap-2 px-4 transition-all duration-200 md:gap-4 ${
          isScrolled ? "py-2 md:px-8" : "py-4 md:px-8"
        }`}
      >
        <div className="flex items-center gap-2">
          <BrandLogo
            locale={language}
            priority
            imageClassName={isScrolled ? "h-7 md:h-9" : "h-8 md:h-10"}
          />
          <span className="inline-flex flex-col items-center rounded-full border border-[rgba(253,185,19,0.55)] bg-[rgba(253,185,19,0.12)] px-2 py-1 text-size-2xs fw-semibold uppercase tracking-[0.12em] text-accent md:px-2.5 md:text-size-11 leading-tight">
            <span>Since</span>
            <span>1988</span>
          </span>
        </div>

        {/* Desktop navigation */}
        <nav
          className={`relative hidden md:flex items-center gap-6 text-size-sm fw-medium text-white/80 ${isRTL ? "text-right" : ""}`}
        >
          <Link
            href={`/${language}/list`}
            className="border-b-2 border-transparent transition hover:border-accent hover:text-white"
          >
            {t("nav.listProperty")}
          </Link>
          <Link
            href={`/${language}/team`}
            className="border-b-2 border-transparent transition hover:border-accent hover:text-white"
          >
            {t("nav.ourTeam")}
          </Link>
          <Link
            href={`/${language}/about`}
            className="border-b-2 border-transparent transition hover:border-accent hover:text-white"
          >
            {t("nav.aboutUs")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <LanguageSelect value={language} showFullLabels />
          </div>
          <div className="md:hidden">
            <LanguageSelect value={language} showFullLabels={false} />
          </div>

          {user ? (
            <>
              <Link
                href={`/${language}/list`}
                className="hidden md:inline-flex h-9 items-center rounded-full border border-[var(--brand-accent)] bg-[var(--brand-accent)] px-4 text-xs font-semibold text-[var(--brand-secondary)] transition hover:brightness-95"
              >
                {t("nav.listProperty")}
              </Link>
              <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/20 text-size-xs fw-bold text-white hover:bg-white/30 cursor-pointer"
                aria-label="Profile menu"
              >
                {initials}
              </button>
              {isProfileOpen ? (
                <div
                  className={`absolute top-11 z-30 min-w-[240px] rounded-xl border border-subtle bg-white py-2 text-charcoal shadow-xl ${isRTL ? "left-0" : "right-0"}`}
                >
                  <div className="border-b border-subtle px-4 py-3">
                    <p className="truncate text-size-sm fw-semibold">{user.name}</p>
                    <p className="mt-0.5 truncate text-size-xs text-zinc-500">{user.email}</p>
                  </div>
                  <nav className="py-1 px-2" aria-label="Account menu">
                    <Link
                      href={`/${language}/favourites`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-size-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("myFavourites")}
                    </Link>
                    <Link
                      href={`/${language}/saved-searches`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-size-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("mySavedSearches")}
                    </Link>
                    <Link
                      href={`/${language}/recently-viewed`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-size-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("myRecentlyViewed")}
                    </Link>
                    <div
                      className="relative"
                      onMouseEnter={() => setIsAccountSettingsHover(true)}
                      onMouseLeave={() => setIsAccountSettingsHover(false)}
                    >
                      <Link
                        href={`/${language}/account-settings`}
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        {tCommon("myAccountSettings")}
                        <span className={isRTL ? "rotate-180" : ""} aria-hidden>›</span>
                      </Link>
                      {isAccountSettingsHover ? (
                        <div
                          className="absolute top-0 right-full z-40 mr-1 min-w-[200px] rounded-lg border border-[var(--border-subtle)] bg-white py-1.5 shadow-lg"
                          role="menu"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsAccountSettingsHover(false);
                              setIsProfileModalOpen(true);
                            }}
                            className={`block w-full rounded-md px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 cursor-pointer ${isRTL ? "text-right" : "text-left"}`}
                            role="menuitem"
                          >
                            {tCommon("myProfile")}
                          </button>
                          <Link
                            href={`/${language}/notifications`}
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsAccountSettingsHover(false);
                            }}
                            className={`block rounded-md px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 cursor-pointer ${isRTL ? "text-right" : "text-left"}`}
                            role="menuitem"
                          >
                            {tCommon("notifications")}
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </nav>
                  <div className="mt-1 border-t border-subtle px-3 pt-2 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(clearProfileForUser(user.id));
                        clearAuthSession();
                        dispatch(logout());
                        setIsProfileOpen(false);
                      }}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-size-sm fw-semibold text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("signOut")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            </>
          ) : (
            <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            suppressHydrationWarning
            className="inline-flex h-8 items-center rounded-full border border-accent bg-accent px-3 text-size-11 fw-semibold text-secondary hover:brightness-95 md:h-9 md:px-4 md:text-size-xs cursor-pointer"
          >
              {tCommon("signUpSignIn")}
            </button>
          )}
        </div>
      </div>

      <AuthPopup
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        locale={language}
      />
      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isRtl={isRTL}
      />
    </header>
  );
}



