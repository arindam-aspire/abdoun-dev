"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { BrandLogo } from "@/components/layout/brand-logo";
import { LanguageSelect } from "@/components/ui/language-select";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { logout } from "@/features/auth/authSlice";
import { clearAuthSession } from "@/lib/auth/sessionCookies";
import { cn } from "@/lib/cn";

const SHRINK_SCROLL_Y = 36;
const EXPAND_SCROLL_Y = 12;
const MOBILE_BREAKPOINT = 768;

/** Format route segment as tab label (e.g. "agent-dashboard" → "Agent dashboard") */
function segmentToLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Only the parent folder under (agent): agent-dashboard, agent-properties */
const AGENT_NAV_SEGMENTS = [
  { segment: "agent-dashboard", path: "/agent-dashboard", label: "Dashboard" },
  { segment: "agent-properties", path: "/agent-properties", label: "Properties" },
] as const;

export function AgentHeader() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const mobileProfileRef = useRef<HTMLDivElement | null>(null);
  const isRTL = locale === "ar";

  const navTabs = AGENT_NAV_SEGMENTS.map(({ segment, path, label }) => ({
    href: `/${locale}${path}`,
    label: label ?? segmentToLabel(segment),
  }));
  const isTabActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const initials =
    (user?.name?.split(" ") ?? []).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";

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
      const target = event.target as Node;
      const insideDesktop = profileRef.current?.contains(target);
      const insideMobile = mobileProfileRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) setIsProfileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) setMobileMenuOpen(false);
      else setIsProfileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
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
        className={`container mx-auto flex items-center justify-between gap-4 px-4 transition-all duration-200 md:px-8 ${
          isScrolled ? "py-2" : "py-4"
        }`}
      >
        <div
          className={`flex items-center gap-2 shrink-0 min-w-0 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <BrandLogo
            locale={locale}
            priority
            imageClassName={isScrolled ? "h-7 md:h-9" : "h-8 md:h-10"}
          />
          <span className="hidden md:inline-flex flex-col items-center text-size-2xs fw-semibold uppercase tracking-[0.12em] text-accent md:px-2.5 md:text-size-11 leading-tight">
            <span>Since</span>
            <span>1988</span>
          </span>
        </div>

        <nav className={`hidden md:flex items-center justify-center gap-6 text-size-base fw-bold text-white/80 ${isRTL ? "flex-row-reverse" : ""}`}>
          {navTabs.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "border-b-2 border-transparent transition hover:border-accent hover:text-white",
                isTabActive(href)
                  ? "border-accent text-white"
                  : "",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3 md:justify-end">
          <div className="hidden md:block">
            <LanguageSelect value={locale} showFullLabels />
          </div>
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/20 text-size-xs fw-bold text-white hover:bg-white/30 cursor-pointer"
              aria-label="Profile menu"
              aria-expanded={isProfileOpen}
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
                  <p className="truncate text-size-sm fw-semibold">{user?.name ?? "User"}</p>
                  {user?.email ? (
                    <p className="mt-0.5 truncate text-size-xs text-zinc-500">{user.email}</p>
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
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-size-sm fw-semibold text-zinc-700 hover:bg-zinc-100 hover:underline cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed left-0 right-0 bottom-0 top-18 z-20 bg-primary md:hidden transition-opacity duration-200",
          mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className={cn(
            "flex h-[calc(100vh-3.5rem)] bg-primary flex-col overflow-y-auto overscroll-contain transition-opacity duration-200 pt-2",
            mobileMenuOpen ? "opacity-100" : "opacity-0",
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <nav className="flex flex-col gap-0.5 px-4 py-3">
            {navTabs.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMobileMenu}
                className={cn(
                  "rounded-lg px-4 py-3 text-size-sm fw-medium transition-colors",
                  isTabActive(href)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 border-t border-white/20 px-4 py-4 flex items-center justify-between gap-2">
            <span className="text-size-sm text-white/80">Language</span>
            <LanguageSelect value={locale} showFullLabels={false} />
          </div>
        </div>
      </div>
    </header>
  );
}
