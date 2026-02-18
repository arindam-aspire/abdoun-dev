"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Home, List, MapPin, Users, User } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { useAppSelector } from "@/hooks/storeHooks";

const NAV_HEIGHT = 64;
const SAFE_AREA = "env(safe-area-inset-bottom, 0px)";

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("home");
  const auth = useAppSelector((state) => state.auth);
  const isRtl = locale === "ar";

  const basePath = `/${locale}`;

  const items = [
    { href: basePath, label: t("bottomNav.home"), icon: Home, match: () => pathname === basePath || pathname === `${basePath}/` },
    { href: `${basePath}/list`, label: t("bottomNav.list"), icon: List, match: () => pathname.startsWith(`${basePath}/list`) },
    { href: `${basePath}/lands`, label: t("bottomNav.lands"), icon: MapPin, match: () => pathname.startsWith(`${basePath}/lands`) },
    { href: `${basePath}/team`, label: t("bottomNav.team"), icon: Users, match: () => pathname.startsWith(`${basePath}/team`) },
    {
      href: auth.user ? `${basePath}/dashboard` : `${basePath}/login`,
      label: t("bottomNav.account"),
      icon: User,
      match: () => pathname.startsWith(`${basePath}/dashboard`) || pathname.startsWith(`${basePath}/login`),
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--border-subtle)] bg-white/95 shadow-[0_-4px_20px_rgba(26,59,92,0.08)] backdrop-blur-md md:hidden"
      style={{
        paddingBottom: SAFE_AREA,
        minHeight: NAV_HEIGHT,
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match();
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 px-1 transition-colors ${
              active
                ? "text-[var(--brand-secondary)]"
                : "text-[var(--color-charcoal)]/60 hover:text-[var(--brand-secondary)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className="h-6 w-6 shrink-0"
              strokeWidth={active ? 2.25 : 2}
              aria-hidden
            />
            <span className="truncate text-[10px] font-medium max-w-full">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export const BOTTOM_NAV_HEIGHT = NAV_HEIGHT;
