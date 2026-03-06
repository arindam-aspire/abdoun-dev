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
import { clearProfileForUser } from "@/features/profile/profileSlice";
import { clearAuthSession } from "@/lib/auth/sessionCookies";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  APP_HEADER_CONFIG,
  resolvePublicLinksVisibility,
} from "@/components/layout/app-header.config";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { cn } from "@/lib/cn";
import {
  DialogDescription,
  DialogFooter,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Menu, X } from "lucide-react";

const SHRINK_SCROLL_Y = 36;
const MOBILE_BREAKPOINT = 768;
const EXPAND_SCROLL_Y = 12;

interface AppHeaderProps {
  language?: AppLocale;
  showPublicLinks?: boolean;
}

export function AppHeader({ language, showPublicLinks }: AppHeaderProps = {}) {
  const currentLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeLanguage = language ?? currentLocale;
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<"email" | undefined>(undefined);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isListPropertyModalOpen, setIsListPropertyModalOpen] = useState(false);
  const [isAccountSettingsHover, setIsAccountSettingsHover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const mobileProfileRef = useRef<HTMLDivElement | null>(null);
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

  // Open auth popup for "Agent login" when URL has openAuth=agent (e.g. from agent-invite)
  useEffect(() => {
    if (searchParams.get("openAuth") === "agent") {
      setAuthInitialView("email");
      setIsAuthOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("openAuth");
      const q = params.toString();
      router.replace(pathname + (q ? `?${q}` : ""));
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = profileRef.current?.contains(target);
      const insideMobile = mobileProfileRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) setIsProfileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  // Close mobile menu when viewport becomes desktop; close profile dropdown when switching to mobile
  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= MOBILE_BREAKPOINT) setMobileMenuOpen(false);
      else setIsProfileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/20 bg-[rgba(26,59,92,0.95)] text-white backdrop-blur relative overflow-x-clip"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={`container mx-auto flex items-center justify-between gap-2 px-4 transition-all duration-200 md:grid md:grid-cols-3 md:gap-4 ${
          isScrolled ? "py-2 md:px-8" : "py-4 md:px-8"
        }`}
      >
        <div className={`flex items-center gap-2 shrink-0 min-w-0 ${isRTL ? "md:justify-end" : "md:justify-start"} ${isRTL ? "flex-row-reverse" : ""}`}>
          <BrandLogo
            locale={activeLanguage}
            priority
            imageClassName={isScrolled ? "h-7 md:h-9" : "h-8 md:h-10"}
          />
          <span className="hidden md:inline-flex flex-col items-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-accent)] md:px-2.5 md:text-[11px] leading-tight">
            <span>Since</span>
            <span>1988</span>
          </span>
        </div>

        <nav
          className={`hidden md:flex items-center justify-center gap-6 text-size-base fw-bold text-white/80 ${isRTL ? "flex-row-reverse" : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === `/${activeLanguage}${item.path}` || pathname.startsWith(`/${activeLanguage}${item.path}/`);
            return (
              <Link
                key={item.id}
                href={`/${activeLanguage}${item.path}`}
                className={cn(
                  "border-b-2 transition hover:border-accent hover:text-white",
                  isActive ? "border-accent text-white" : "border-transparent text-white/80",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Desktop: actions in header */}
        <div className={`hidden md:flex items-center gap-2 md:gap-3 md:justify-end`}>
          <div className="hidden md:block">
            <LanguageSelect value={activeLanguage} showFullLabels />
          </div>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                setIsAuthOpen(true);
                return;
              }
              setIsListPropertyModalOpen(true);
            }}
            className="inline-flex h-8 items-center rounded-full border border-[var(--brand-accent)] bg-[var(--brand-accent)] px-3 text-[11px] font-semibold text-[var(--brand-secondary)] transition hover:brightness-95 md:h-9 md:px-4 md:text-xs"
          >
            {t("nav.listProperty")}
          </button>
          {user ? (
            <>
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
                  className={cn(
                    "absolute top-11 z-30 min-w-[240px] rounded-xl border border-subtle bg-white py-2 text-charcoal shadow-xl",
                    isRTL ? "left-0" : "right-0",
                  )}
                >
                  <div className="border-b border-subtle px-4 py-3">
                    <p className="truncate text-size-sm fw-semibold">{user.name}</p>
                    <p className="mt-0.5 truncate text-size-xs text-zinc-500">
                      {user.email}
                    </p>
                  </div>
                  <nav className="py-1 px-1" aria-label="Account menu">
                    <Link
                      href={`/${activeLanguage}/favourites`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-size-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("myFavourites")}
                    </Link>
                    <Link
                      href={`/${activeLanguage}/saved-searches`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-size-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                    >
                      {tCommon("mySavedSearches")}
                    </Link>
                    <Link
                      href={`/${activeLanguage}/recently-viewed`}
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
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline",
                          // isRTL ? "flex-row-reverse" : "",
                        )}
                      >
                        {tCommon("myAccountSettings")}
                        <span className={cn("text-zinc-400", isRTL ? "" : "")} aria-hidden>›</span>
                      </button>
                      {isAccountSettingsHover ? (
                        <div
                          className={cn(
                            "absolute top-0 z-40 min-w-[200px] max-w-[calc(100vw-2rem)] rounded-lg border border-[var(--border-subtle)] bg-white py-1.5 px-1.5 shadow-lg",
                            isRTL ? "left-full ml-1" : "right-full",
                          )}
                          role="menu"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsAccountSettingsHover(false);
                              setIsProfileModalOpen(true);
                            }}
                            className={cn(
                              "block w-full rounded-md px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer",
                              isRTL ? "text-right" : "text-left",
                            )}
                            role="menuitem"
                          >
                            {tCommon("myProfile")}
                          </button>
                          <Link
                            href={`/${activeLanguage}/notifications`}
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsAccountSettingsHover(false);
                            }}
                            className={cn(
                              "block rounded-md px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer",
                              isRTL ? "text-right" : "text-left",
                            )}
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
              className="inline-flex h-8 items-center rounded-full text-accent border border-accent bg-transparent px-3 text-size-11 fw-semibold transition-all duration-200 hover:bg-accent/15 hover:border-yellow-300 md:h-9 md:px-4 md:text-size-xs cursor-pointer"
            >
              {tCommon("signUpSignIn")}
            </button>
          )}
        </div>

        {/* Mobile: header actions */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          {!user ? (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex h-9 items-center rounded-full border border-[var(--brand-accent)] px-3 text-xs font-semibold text-[var(--brand-accent)] transition hover:bg-[var(--brand-accent)]/15"
            >
              {tCommon("signUpSignIn")}
            </button>
          ) : (
            <div className="relative" ref={mobileProfileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/20 text-xs font-bold text-white hover:bg-white/30"
                aria-label="Account menu"
                aria-expanded={isProfileOpen}
              >
                {initials}
              </button>
              {/* Mobile profile dropdown — same content as desktop */}
              {isProfileOpen ? (
                <div
                  className={cn(
                    "absolute top-full mt-2 z-50 min-w-[240px] max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border-subtle)] bg-white py-2 text-[var(--color-charcoal)] shadow-xl",
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
                      href={`/${activeLanguage}/favourites`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline"
                    >
                      {tCommon("myFavourites")}
                    </Link>
                    <Link
                      href={`/${activeLanguage}/saved-searches`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline"
                    >
                      {tCommon("mySavedSearches")}
                    </Link>
                    <Link
                      href={`/${activeLanguage}/recently-viewed`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline"
                    >
                      {tCommon("myRecentlyViewed")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 hover:underline"
                    >
                      {tCommon("myProfile")}
                    </button>
                    <Link
                      href={`/${activeLanguage}/notifications`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline"
                    >
                      {tCommon("notifications")}
                    </Link>
                  </nav>
                  <div className="mt-1 border-t border-[var(--border-subtle)] px-3 pt-2 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(clearProfileForUser(user.id));
                        dispatch(logout());
                        setIsProfileOpen(false);
                      }}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:underline"
                    >
                      {tCommon("signOut")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

{/* Mobile menu overlay — starts below header (3.5rem) */}
      <div
        className={cn(
          "fixed left-0 right-0 bottom-0 top-18 z-20 bg-[var(--brand-primary)] md:hidden transition-opacity duration-200",
          mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className={cn(
            "flex h-[calc(100vh-3.5rem)] bg-[var(--brand-primary)] flex-col overflow-y-auto overscroll-contain transition-opacity duration-200 pt-2",
            mobileMenuOpen ? "opacity-100" : "opacity-0",
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <nav className="flex flex-col gap-1 px-4 py-4 text-white" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const isActive = pathname === `/${activeLanguage}${item.path}` || pathname.startsWith(`/${activeLanguage}${item.path}/`);
              return (
                <Link
                  key={item.id}
                  href={`/${activeLanguage}${item.path}`}
                  onClick={closeMobileMenu}
                  className={cn(
                    "rounded-xl px-4 py-3.5 text-base font-medium transition hover:bg-white/10 hover:text-white",
                    isActive ? "bg-white/10 text-white" : "text-white/90",
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 border-t border-white/20 px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-white/80">Language</span>
              <LanguageSelect value={activeLanguage} showFullLabels={false} />
            </div>
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                if (!user) {
                  setIsAuthOpen(true);
                  return;
                }
                setIsListPropertyModalOpen(true);
              }}
              className="w-full inline-flex h-12 items-center justify-center rounded-xl border-2 border-[var(--brand-accent)] bg-[var(--brand-accent)] text-sm font-semibold text-[var(--brand-secondary)] transition hover:brightness-95"
            >
              {t("nav.listProperty")}
            </button>
          </div>
        </div>
      </div>

      <AuthPopup
        open={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthInitialView(undefined);
        }}
        locale={activeLanguage}
        initialView={authInitialView}
      />
      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isRtl={isRTL}
      />
      <DialogRoot
        open={isListPropertyModalOpen}
        onClose={() => setIsListPropertyModalOpen(false)}
      >
        <DialogTitle>{t("nav.listProperty")}</DialogTitle>
        <DialogDescription>
          Listing flow will open here as a modal. No page navigation is used.
        </DialogDescription>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setIsListPropertyModalOpen(false)}
            className="inline-flex h-9 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Close
          </button>
        </DialogFooter>
      </DialogRoot>
    </header>
  );
}


