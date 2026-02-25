"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { BrandLogo } from "@/components/layout/brand-logo";
import { LanguageSelect } from "@/components/ui/language-select";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { logout } from "@/features/auth/authSlice";
import { clearAuthSession } from "@/lib/auth/sessionCookies";
import { cn } from "@/lib/cn";

const SHRINK_SCROLL_Y = 36;
const EXPAND_SCROLL_Y = 12;

export function AdminHeader() {
  const locale = useLocale() as AppLocale;
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const isRTL = locale === "ar";

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
        className={`container mx-auto flex items-center justify-between gap-2 px-4 transition-all duration-200 md:gap-4 ${
          isScrolled ? "py-2 md:px-8" : "py-4 md:px-8"
        }`}
      >
        <div className="flex items-center gap-2">
          <BrandLogo
            locale={locale}
            priority
            imageClassName={isScrolled ? "h-7 md:h-9" : "h-8 md:h-10"}
          />
          <span className="inline-flex flex-col items-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-accent)] md:px-2.5 md:text-[11px] leading-tight">
            <span>Since</span>
            <span>1988</span>
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <LanguageSelect value={locale} showFullLabels />
          </div>
          <div className="md:hidden">
            <LanguageSelect value={locale} showFullLabels={false} />
          </div>
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
                  <p className="truncate text-sm font-semibold">
                    {user?.name ?? "User"}
                  </p>
                  {user?.email ? (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {user.email}
                    </p>
                  ) : null}
                </div>
                <div className="mt-1 px-3 pt-1 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthSession();
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
        </div>
      </div>
    </header>
  );
}
